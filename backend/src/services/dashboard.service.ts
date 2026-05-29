import { prisma } from '../prisma';

export class DashboardService {
  static async getAdminDashboard() {
    const [totalSales, totalAgencies, totalOrders, totalRevenue, recentOrders] = await Promise.all([
      prisma.user.count({ where: { role: 'SALES', deletedAt: null } }),
      prisma.agency.count({ where: { deletedAt: null } }),
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED', deletedAt: null }, _sum: { totalAmount: true } }),
      prisma.order.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          agency: { select: { name: true } },
          sales: { select: { name: true } },
        },
      }),
    ]);

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyOrders = await prisma.order.findMany({
      where: { status: 'DELIVERED', deletedAt: null, createdAt: { gte: sixMonthsAgo } },
      select: { totalAmount: true, createdAt: true },
    });

    const monthlyRevenue: Record<string, number> = {};
    monthlyOrders.forEach(order => {
      const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + Number(order.totalAmount);
    });

    // Top sales
    const topSales = await prisma.order.groupBy({
      by: ['salesId'],
      where: { status: 'DELIVERED', deletedAt: null },
      _sum: { totalAmount: true },
      _count: true,
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 5,
    });

    const topSalesWithNames = await Promise.all(
      topSales.map(async (s) => {
        const user = await prisma.user.findUnique({ where: { id: s.salesId }, select: { name: true } });
        return { salesId: s.salesId, name: user?.name, revenue: s._sum.totalAmount, orderCount: s._count };
      })
    );

    return {
      stats: {
        totalSales,
        totalAgencies,
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      },
      monthlyRevenue,
      topSales: topSalesWithNames,
      recentOrders,
    };
  }

  static async getLeaderDashboard(leaderId: string) {
    const salesIds = await prisma.user.findMany({
      where: { leaderId, role: 'SALES', deletedAt: null },
      select: { id: true },
    }).then(users => users.map(u => u.id));

    const [teamSize, teamAgencies, teamOrders, teamRevenue] = await Promise.all([
      salesIds.length,
      prisma.agency.count({ where: { salesId: { in: salesIds }, deletedAt: null } }),
      prisma.order.count({ where: { salesId: { in: salesIds }, deletedAt: null } }),
      prisma.order.aggregate({
        where: { salesId: { in: salesIds }, status: 'DELIVERED', deletedAt: null },
        _sum: { totalAmount: true },
      }),
    ]);

    const teamMembers = await prisma.user.findMany({
      where: { leaderId, role: 'SALES', deletedAt: null },
      select: {
        id: true, name: true, email: true,
        _count: { select: { orders: true, agencies: true } },
      },
    });

    return {
      stats: { teamSize, teamAgencies, teamOrders, teamRevenue: Number(teamRevenue._sum.totalAmount || 0) },
      teamMembers,
    };
  }

  static async getSalesDashboard(salesId: string) {
    const [myAgencies, myOrders, myRevenue, myVisits] = await Promise.all([
      prisma.agency.count({ where: { salesId, deletedAt: null } }),
      prisma.order.count({ where: { salesId, deletedAt: null } }),
      prisma.order.aggregate({
        where: { salesId, status: 'DELIVERED', deletedAt: null },
        _sum: { totalAmount: true },
      }),
      prisma.visit.count({ where: { salesId } }),
    ]);

    const recentOrders = await prisma.order.findMany({
      where: { salesId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { agency: { select: { name: true } } },
    });

    return {
      stats: {
        myAgencies,
        myOrders,
        myRevenue: Number(myRevenue._sum.totalAmount || 0),
        myVisits,
      },
      recentOrders,
    };
  }
}
