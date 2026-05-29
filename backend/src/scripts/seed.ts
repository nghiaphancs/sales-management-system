import { config } from 'dotenv';
config();

import { prisma } from '../prisma';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.kpiTarget.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.region.deleteMany();

  // Create regions
  const regionHCM = await prisma.region.create({ data: { name: 'Hồ Chí Minh' } });
  const regionHN = await prisma.region.create({ data: { name: 'Hà Nội' } });

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@aurasales.vn',
      password: await bcrypt.hash('admin123', 10),
      name: 'Nguyễn Văn Admin',
      role: 'ADMIN',
      phone: '0900000001',
    },
  });

  // Create Leaders
  const leader1 = await prisma.user.create({
    data: {
      email: 'leader1@aurasales.vn',
      password: await bcrypt.hash('leader123', 10),
      name: 'Trần Thị Leader',
      role: 'LEADER',
      phone: '0900000002',
      regionId: regionHCM.id,
    },
  });

  const leader2 = await prisma.user.create({
    data: {
      email: 'leader2@aurasales.vn',
      password: await bcrypt.hash('leader123', 10),
      name: 'Phạm Văn Leader HN',
      role: 'LEADER',
      phone: '0900000003',
      regionId: regionHN.id,
    },
  });

  // Create Sales under leader1
  const salesNames = [
    { name: 'Lê Văn Sales A', email: 'sales.a@aurasales.vn', phone: '0911000001' },
    { name: 'Hoàng Thị Sales B', email: 'sales.b@aurasales.vn', phone: '0911000002' },
    { name: 'Đỗ Văn Sales C', email: 'sales.c@aurasales.vn', phone: '0911000003' },
  ];

  const salesUsers = [];
  for (const s of salesNames) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        password: await bcrypt.hash('sales123', 10),
        name: s.name,
        role: 'SALES',
        phone: s.phone,
        leaderId: leader1.id,
        regionId: regionHCM.id,
      },
    });
    salesUsers.push(user);
  }

  // Create Products
  const products = await Promise.all([
    prisma.product.create({ data: { sku: 'PRD-001', name: 'Nước giặt OMO 3.6kg', price: 125000 } }),
    prisma.product.create({ data: { sku: 'PRD-002', name: 'Dầu ăn Tường An 2L', price: 78000 } }),
    prisma.product.create({ data: { sku: 'PRD-003', name: 'Sữa Vinamilk thùng 48 hộp', price: 340000 } }),
    prisma.product.create({ data: { sku: 'PRD-004', name: 'Mì Hảo Hảo thùng 30 gói', price: 110000 } }),
    prisma.product.create({ data: { sku: 'PRD-005', name: 'Bia Tiger lon 330ml (thùng 24)', price: 380000 } }),
  ]);

  // Create Agencies
  const agencyData = [
    { code: 'DL-001', name: 'Tạp hóa Chị Lan', phone: '0922000001', address: '123 Nguyễn Trãi, Q.5, TP.HCM', creditLimit: 5000000, salesId: salesUsers[0].id },
    { code: 'DL-002', name: 'Đại lý Phát Tài', phone: '0922000002', address: '456 Lê Lợi, Q.1, TP.HCM', creditLimit: 10000000, salesId: salesUsers[0].id },
    { code: 'DL-003', name: 'Siêu thị Mini Hòa Phát', phone: '0922000003', address: '789 Hai Bà Trưng, Q.3, TP.HCM', creditLimit: 15000000, salesId: salesUsers[1].id },
    { code: 'DL-004', name: 'Tạp hóa Anh Tú', phone: '0922000004', address: '321 Trần Hưng Đạo, Q.5, TP.HCM', creditLimit: 3000000, salesId: salesUsers[1].id },
    { code: 'DL-005', name: 'Đại lý Minh Phong', phone: '0922000005', address: '654 Cách Mạng Tháng 8, Q.10, TP.HCM', creditLimit: 8000000, salesId: salesUsers[2].id },
  ];

  const agencies = [];
  for (const a of agencyData) {
    const agency = await prisma.agency.create({
      data: { ...a, regionId: regionHCM.id },
    });
    agencies.push(agency);
  }

  // Create some Orders
  for (let i = 0; i < 3; i++) {
    const agency = agencies[i];
    const sales = await prisma.user.findUnique({ where: { id: agency.salesId } });
    const selectedProducts = products.slice(0, 3);
    let total = 0;
    const items = selectedProducts.map((p, idx) => {
      const qty = (idx + 1) * 2;
      const sub = Number(p.price) * qty;
      total += sub;
      return { productId: p.id, quantity: qty, unitPrice: Number(p.price), subTotal: sub };
    });

    const order = await prisma.order.create({
      data: {
        code: `ORD-SEED-${i + 1}`,
        agencyId: agency.id,
        salesId: agency.salesId,
        totalAmount: total,
        status: i === 0 ? 'DELIVERED' : 'PENDING',
        items: { create: items },
      },
    });

    // Update agency debt
    await prisma.agency.update({
      where: { id: agency.id },
      data: { currentDebt: { increment: total } },
    });

    console.log(`  ✅ Order ${order.code} created (${total.toLocaleString()}đ)`);
  }

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📋 Test accounts:');
  console.log('   Admin:  admin@aurasales.vn / admin123');
  console.log('   Leader: leader1@aurasales.vn / leader123');
  console.log('   Sales:  sales.a@aurasales.vn / sales123');

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
