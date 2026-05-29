import { prisma } from '../prisma';

export class ProductService {
  static async create(data: { sku: string; name: string; price: number }) {
    return prisma.product.create({ data });
  }

  static async list() {
    return prisma.product.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  static async findById(id: string) {
    return prisma.product.findFirst({ where: { id, deletedAt: null } });
  }

  static async update(id: string, data: Partial<{ name: string; price: number; isActive: boolean }>) {
    return prisma.product.update({ where: { id }, data });
  }
}
