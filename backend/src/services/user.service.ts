import { prisma } from '../prisma';

export class UserService {
  static async list(filters: { role?: string; leaderId?: string }) {
    const where: any = { deletedAt: null };
    if (filters.role) where.role = filters.role;
    if (filters.leaderId) where.leaderId = filters.leaderId;

    return prisma.user.findMany({
      where,
      select: {
        id: true, email: true, name: true, role: true, phone: true,
        leaderId: true, isActive: true, createdAt: true,
        leader: { select: { id: true, name: true } },
        _count: { select: { agencies: true, orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true, email: true, name: true, role: true, phone: true,
        leaderId: true, isActive: true, createdAt: true,
        leader: { select: { id: true, name: true } },
        _count: { select: { agencies: true, orders: true } },
      },
    });
  }

  static async getSalesIdsUnderLeader(leaderId: string): Promise<string[]> {
    const salesUsers = await prisma.user.findMany({
      where: { leaderId, role: 'SALES', deletedAt: null },
      select: { id: true },
    });
    return salesUsers.map(u => u.id);
  }

  static async update(id: string, data: Partial<{
    name: string; phone: string; leaderId: string; isActive: boolean;
  }>) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, phone: true },
    });
  }
}
