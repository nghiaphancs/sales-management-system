import { prisma } from '../prisma';
import { addDebtWarningEmailJob } from '../queues/notification.queue';

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export class OrderService {
  /**
   * Tạo Đơn hàng mới và xử lý cộng dồn công nợ.
   * Sử dụng SELECT FOR UPDATE để tránh Race Condition khi 2 Sales cùng lên đơn cùng lúc.
   */
  static async createOrder(
    agencyId: string,
    salesId: string,
    items: OrderItemInput[]
  ) {
    if (!items || items.length === 0) throw new Error('Order must have items');

    // Mở một Transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Lấy thông tin Agency và Lock dòng này lại (Row-level locking)
      // Điều này ngăn chặn các transaction khác đọc/ghi đè currentDebt của Agency này cho đến khi tx này hoàn tất.
      const agencies = await tx.$queryRaw<any[]>`
        SELECT id, code, name, "creditLimit", "currentDebt"
        FROM "Agency"
        WHERE id = ${agencyId}
        FOR UPDATE
      `;

      if (!agencies || agencies.length === 0) {
        throw new Error('Agency not found');
      }

      const agency = agencies[0];
      const currentDebt = Number(agency.currentDebt);
      const creditLimit = Number(agency.creditLimit);

      // 2. Lấy giá sản phẩm và tính Total Amount
      let totalAmount = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        const price = Number(product.price);
        const subTotal = price * item.quantity;
        totalAmount += subTotal;

        orderItemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: price,
          subTotal: subTotal,
        });
      }

      // 3. Kiểm tra Hạn mức nợ (Credit Limit Check)
      const newDebt = currentDebt + totalAmount;
      if (newDebt > creditLimit) {
        throw new Error(`Credit Limit Exceeded. Max allowed: ${creditLimit}, Requested: ${newDebt}`);
      }

      // 4. Tạo Order
      const code = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const order = await tx.order.create({
        data: {
          code,
          agencyId,
          salesId,
          totalAmount,
          items: {
            create: orderItemsToCreate,
          },
        },
      });

      // 5. Cập nhật số dư nợ mới
      await tx.$queryRaw`
        UPDATE "Agency"
        SET "currentDebt" = ${newDebt}, "updatedAt" = NOW()
        WHERE id = ${agencyId}
      `;

      // 6. Ghi Audit Log (Audit Trail)
      await tx.auditLog.create({
        data: {
          userId: salesId,
          action: 'CREATE_ORDER',
          entity: 'Agency',
          entityId: agencyId,
          oldData: { currentDebt },
          newData: { currentDebt: newDebt, orderId: order.id },
        },
      });

      // 7. BullMQ: Gửi cảnh báo nếu dư nợ vượt 80% hạn mức
      if (newDebt > creditLimit * 0.8) {
        // Chúng ta push event vào queue, không cần await block luồng
        addDebtWarningEmailJob({
          agencyId: agency.id,
          agencyName: agency.name,
          currentDebt: newDebt,
          creditLimit: creditLimit,
          email: `${agency.code}@aurasales.vn`, // Mock email
        }).catch(err => console.error('Failed to enqueue debt warning job:', err));
      }

      return order;
    });
  }
}
