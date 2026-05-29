import { prisma } from '../prisma';
import { OrderService } from '../services/order.service';

describe('OrderService - Concurrency & Financial Consistency', () => {
  let agencyId: string;
  let salesId: string;
  let productId: string;

  beforeAll(async () => {
    // 1. Dọn dẹp dữ liệu cũ (Xóa Order trước vì dính khoá ngoại)
    await prisma.auditLog.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.agency.deleteMany();
    await prisma.user.deleteMany();
    await prisma.product.deleteMany();

    // 2. Setup dữ liệu test
    const user = await prisma.user.create({
      data: {
        email: `sales_${Date.now()}@test.com`,
        password: 'hash',
        name: 'Test Sales',
        role: 'SALES',
        phone: `090${Date.now()}`
      },
    });
    salesId = user.id;

    const agency = await prisma.agency.create({
      data: {
        code: `AG-${Date.now()}`,
        name: 'Agency Test Concurrency',
        address: '123 Test St',
        phone: `091${Date.now()}`,
        creditLimit: 100, // Hạn mức 100$
        currentDebt: 0,
        salesId: salesId,
      },
    });
    agencyId = agency.id;

    const product = await prisma.product.create({
      data: {
        sku: `PRD-${Date.now()}`,
        name: 'Test Product',
        price: 30, // Mỗi sản phẩm 30$
      },
    });
    productId = product.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should handle concurrent orders correctly and enforce credit limit strictly', async () => {
    // Kịch bản: Bắn ĐỒNG THỜI 5 request tạo đơn hàng, mỗi đơn trị giá 30$.
    // Tổng 5 đơn = 150$. Nhưng Credit Limit chỉ là 100$.
    // Yêu cầu: Chính xác 3 đơn thành công (3x30 = 90$), 2 đơn thất bại (vì 90+30 = 120 > 100$).
    
    const orderRequests = Array(5).fill(null).map(() => 
      OrderService.createOrder(agencyId, salesId, [
        { productId, quantity: 1 } // 1 x 30$ = 30$
      ])
    );

    // Chạy Promise.allSettled để bắt cả thành công lẫn thất bại
    const results = await Promise.allSettled(orderRequests);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Kiểm tra tính toàn vẹn: Chính xác 3 thành công, 2 thất bại
    expect(fulfilled.length).toBe(3);
    expect(rejected.length).toBe(2);

    // Kiểm tra số dư nợ hiện tại trong DB
    const finalAgency = await prisma.agency.findUnique({
      where: { id: agencyId }
    });

    // 3 đơn thành công x 30$ = 90$
    expect(Number(finalAgency?.currentDebt)).toBe(90);

    // Kiểm tra Audit Log
    const logs = await prisma.auditLog.findMany({
      where: { entityId: agencyId, action: 'CREATE_ORDER' }
    });
    expect(logs.length).toBe(3);
  });
});
