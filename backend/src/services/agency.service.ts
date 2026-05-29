import { prisma } from '../prisma';

export class AgencyService {
  static async create(data: {
    code: string;
    name: string;
    phone: string;
    address: string;
    creditLimit?: number;
    salesId: string;
    regionId?: string;
    lat?: number;
    lng?: number;
  }) {
    return prisma.agency.create({
      data: {
        code: data.code,
        name: data.name,
        phone: data.phone,
        address: data.address,
        creditLimit: data.creditLimit || 0,
        salesId: data.salesId,
        regionId: data.regionId,
        lat: data.lat,
        lng: data.lng,
      },
    });
  }

  static async findById(id: string) {
    return prisma.agency.findFirst({
      where: { id, deletedAt: null },
      include: { sales: { select: { id: true, name: true, email: true } } },
    });
  }

  static async list(filters: { salesId?: string; salesIds?: string[] }) {
    const where: any = { deletedAt: null };
    if (filters.salesId) where.salesId = filters.salesId;
    if (filters.salesIds) where.salesId = { in: filters.salesIds };

    return prisma.agency.findMany({
      where,
      include: { sales: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async update(id: string, data: Partial<{
    name: string;
    phone: string;
    address: string;
    creditLimit: number;
    salesId: string;
    lat: number;
    lng: number;
  }>) {
    return prisma.agency.update({ where: { id }, data });
  }

  static async softDelete(id: string) {
    return prisma.agency.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
