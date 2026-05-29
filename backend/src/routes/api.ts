import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AgencyService } from '../services/agency.service';
import { OrderService } from '../services/order.service';
import { ProductService } from '../services/product.service';
import { PaymentService } from '../services/payment.service';
import { UserService } from '../services/user.service';
import { DashboardService } from '../services/dashboard.service';
import { authenticate, requireRole, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// Helper to safely extract string param
const param = (val: string | string[] | undefined): string => {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
};
const qstr = (val: unknown): string => {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return '';
};

// ─── AUTH ───────────────────────────────────────────────
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const user = await AuthService.register(req.body);
    res.status(201).json(user);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const result = await AuthService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

router.get('/auth/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await AuthService.getProfile(req.user!.id);
    res.json(profile);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── USERS ──────────────────────────────────────────────
router.get('/users', authenticate, requireRole('ADMIN', 'LEADER'), async (req: AuthRequest, res: Response) => {
  try {
    const filters: any = {};
    if (req.query.role) filters.role = qstr(req.query.role);
    if (req.user!.role === 'LEADER') filters.leaderId = req.user!.id;
    const users = await UserService.list(filters);
    res.json(users);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/users/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserService.findById(param(req.params.id));
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── PRODUCTS ───────────────────────────────────────────
router.get('/products', authenticate, async (_req: Request, res: Response) => {
  try {
    const products = await ProductService.list();
    res.json(products);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/products', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const product = await ProductService.create(req.body);
    res.status(201).json(product);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ─── AGENCIES ───────────────────────────────────────────
router.get('/agencies', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const filters: any = {};
    if (req.user!.role === 'SALES') {
      filters.salesId = req.user!.id;
    } else if (req.user!.role === 'LEADER') {
      filters.salesIds = await UserService.getSalesIdsUnderLeader(req.user!.id);
    }
    const agencies = await AgencyService.list(filters);
    res.json(agencies);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/agencies/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const agency = await AgencyService.findById(param(req.params.id));
    if (!agency) { res.status(404).json({ error: 'Agency not found' }); return; }
    res.json(agency);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/agencies', authenticate, requireRole('ADMIN', 'LEADER'), async (req: Request, res: Response) => {
  try {
    const agency = await AgencyService.create(req.body);
    res.status(201).json(agency);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/agencies/:id', authenticate, requireRole('ADMIN', 'LEADER'), async (req: Request, res: Response) => {
  try {
    const agency = await AgencyService.update(param(req.params.id), req.body);
    res.json(agency);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/agencies/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    await AgencyService.softDelete(param(req.params.id));
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ─── ORDERS ─────────────────────────────────────────────
router.post('/orders', authenticate, requireRole('ADMIN', 'LEADER', 'SALES'), async (req: AuthRequest, res: Response) => {
  try {
    const { agencyId, items } = req.body;
    const order = await OrderService.createOrder(agencyId, req.user!.id, items);
    res.status(201).json(order);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/orders', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { prisma } = await import('../prisma');
    const where: any = { deletedAt: null };

    if (req.user!.role === 'SALES') {
      where.salesId = req.user!.id;
    } else if (req.user!.role === 'LEADER') {
      const salesIds = await UserService.getSalesIdsUnderLeader(req.user!.id);
      where.salesId = { in: salesIds };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        agency: { select: { id: true, name: true, code: true } },
        sales: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(orders);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/orders/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { prisma } = await import('../prisma');
    const order = await prisma.order.findFirst({
      where: { id: param(req.params.id), deletedAt: null },
      include: {
        agency: { select: { id: true, name: true, code: true } },
        sales: { select: { id: true, name: true } },
        items: { include: { product: { select: { name: true, sku: true } } } },
        payments: true,
      },
    });
    if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
    res.json(order);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── PAYMENTS ───────────────────────────────────────────
router.post('/payments', authenticate, requireRole('ADMIN', 'LEADER', 'SALES'), async (req: Request, res: Response) => {
  try {
    const result = await PaymentService.createPayment(req.body);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/payments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const agencyId = qstr(req.query.agencyId);
    if (!agencyId) { res.status(400).json({ error: 'agencyId required' }); return; }
    const payments = await PaymentService.listByAgency(agencyId);
    res.json(payments);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── DASHBOARD ──────────────────────────────────────────
router.get('/dashboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    let data;
    switch (req.user!.role) {
      case 'ADMIN':
        data = await DashboardService.getAdminDashboard();
        break;
      case 'LEADER':
        data = await DashboardService.getLeaderDashboard(req.user!.id);
        break;
      case 'SALES':
        data = await DashboardService.getSalesDashboard(req.user!.id);
        break;
    }
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
