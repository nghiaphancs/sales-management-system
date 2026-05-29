import { prisma } from '../prisma';

export class PaymentService {
  static async createPayment(data: {
    agencyId: string;
    orderId?: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // Lock the agency row
      const agencies = await tx.$queryRaw<any[]>`
        SELECT id, "currentDebt" FROM "Agency" WHERE id = ${data.agencyId} FOR UPDATE
      `;
      if (!agencies || agencies.length === 0) throw new Error('Agency not found');

      const agency = agencies[0];
      const currentDebt = Number(agency.currentDebt);
      if (data.amount > currentDebt) {
        throw new Error(`Payment amount (${data.amount}) exceeds current debt (${currentDebt})`);
      }

      const code = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const payment = await tx.payment.create({
        data: {
          code,
          agencyId: data.agencyId,
          orderId: data.orderId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
        },
      });

      const newDebt = currentDebt - data.amount;
      await tx.$queryRaw`
        UPDATE "Agency" SET "currentDebt" = ${newDebt}, "updatedAt" = NOW() WHERE id = ${data.agencyId}
      `;

      return { payment, newDebt };
    });
  }

  static async listByAgency(agencyId: string) {
    return prisma.payment.findMany({
      where: { agencyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
