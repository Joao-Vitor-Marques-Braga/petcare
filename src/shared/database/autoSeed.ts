import { prisma } from './prisma.js';
import { hashPassword } from '../context/TenantContext.js';

export async function autoSeed() {
  try {
    // 1. Garante que a empresa principal ("default") e o login Super Admin existam
    await prisma.company.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        name: 'PetCare Matriz',
        slug: 'petcare_matriz',
        phone: '556493073750',
        plan: 'ENTERPRISE',
        active: true,
      },
      update: {},
    });

    const adminEmail = 'admin@petcare.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      console.log('🔐 Criando usuário Super Admin inicial (admin@petcare.com / admin123)...');
      await prisma.user.create({
        data: {
          name: 'Administrador Geral (SaaS)',
          email: adminEmail,
          passwordHash: hashPassword('admin123'),
          role: 'SUPER_ADMIN',
          companyId: 'default',
          active: true,
        },
      });
    }

    const servicesCount = await prisma.serviceCatalog
      .count({ where: { companyId: 'default' } })
      .catch(() => -1);
    if (servicesCount === 0) {
      console.log('✂️ Populando catálogo inicial de serviços e preços...');
      await prisma.serviceCatalog.createMany({
        data: [
          {
            companyId: 'default',
            code: 'BANHO',
            name: 'Banho Tradicional',
            description: 'Banho com shampoo hipoalergênico, secagem, limpeza de ouvidos e corte de unhas.',
            price: 55.0,
            durationMinutes: 45,
            category: 'Banho',
            active: true,
          },
          {
            companyId: 'default',
            code: 'BANHO_E_TOSA',
            name: 'Banho & Tosa Completa',
            description: 'Pacote completo de banho + tosa na máquina ou tesoura, hidratação leve e acabamento.',
            price: 95.0,
            durationMinutes: 90,
            category: 'Combo',
            active: true,
          },
          {
            companyId: 'default',
            code: 'TOSA_HIGIENICA',
            name: 'Tosa Higiênica',
            description: 'Aparação dos pelos da barriga, patinhas, região íntima e olhos para higiene diária.',
            price: 45.0,
            durationMinutes: 30,
            category: 'Tosa',
            active: true,
          },
          {
            companyId: 'default',
            code: 'TOSA_COMPLETA',
            name: 'Tosa Completa na Tesoura',
            description: 'Tosa estilizada padrão da raça com acabamento artesanal na tesoura.',
            price: 75.0,
            durationMinutes: 60,
            category: 'Tosa',
            active: true,
          },
          {
            companyId: 'default',
            code: 'HIDRATACAO_OZONIO',
            name: 'Hidratação + Banho de Ozônio',
            description: 'Tratamento terapêutico para pele sensível e reconstrução profunda da pelagem.',
            price: 80.0,
            durationMinutes: 60,
            category: 'Estética & Spa',
            active: true,
          },
        ],
      });
    }

    const count = await prisma.customer.count({ where: { companyId: 'default' } });
    if (count > 0) {
      return; // Já possui clientes cadastrados
    }

    console.log('🌱 Banco vazio detectado. Criando dados demonstrativos iniciais...');

    const customer1 = await prisma.customer.create({
      data: {
        name: 'Mariana Duarte',
        phone: '5511998765432',
        email: 'mariana.duarte@email.com',
        pets: {
          create: [
            { name: 'Thor', breed: 'Golden Retriever', size: 'GRANDE' as any },
            { name: 'Luna', breed: 'Spitz Alemão', size: 'PEQUENO' as any },
          ],
        },
      },
      include: { pets: true },
    });

    const customer2 = await prisma.customer.create({
      data: {
        name: 'Carlos Alberto Ferreira',
        phone: '5511987654321',
        email: 'carlos.ferreira@email.com',
        pets: {
          create: [
            { name: 'Bob', breed: 'Buldogue Francês', size: 'MEDIO' as any },
          ],
        },
      },
      include: { pets: true },
    });

    const customer3 = await prisma.customer.create({
      data: {
        name: 'Beatriz Vasconcelos',
        phone: '5511976543210',
        email: 'bia.vasconcelos@email.com',
        pets: {
          create: [
            { name: 'Mel', breed: 'Shih Tzu', size: 'PEQUENO' as any },
          ],
        },
      },
      include: { pets: true },
    });

    const customer4 = await prisma.customer.create({
      data: {
        name: 'Lucas Mendes',
        phone: '5511965432109',
        email: 'lucas.mendes@email.com',
        pets: {
          create: [
            { name: 'Max', breed: 'Pastor Alemão', size: 'GRANDE' as any },
          ],
        },
      },
      include: { pets: true },
    });

    const now = new Date();
    const today9am = new Date(now);
    today9am.setHours(9, 0, 0, 0);

    const today10h30 = new Date(now);
    today10h30.setHours(10, 30, 0, 0);

    const today14h = new Date(now);
    today14h.setHours(14, 0, 0, 0);

    const today16h = new Date(now);
    today16h.setHours(16, 0, 0, 0);

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrow9h = new Date(tomorrow);
    tomorrow9h.setHours(9, 0, 0, 0);

    const tomorrow11h = new Date(tomorrow);
    tomorrow11h.setHours(11, 0, 0, 0);

    await prisma.appointment.create({
      data: {
        scheduledAt: today9am,
        service: 'BANHO_E_TOSA' as any,
        status: 'CONFIRMADO' as any,
        notes: 'Tosa padrão da raça, cuidado com orelha sensível',
        customerId: customer1.id,
        petId: customer1.pets[0].id,
      },
    });

    await prisma.appointment.create({
      data: {
        scheduledAt: today10h30,
        service: 'BANHO' as any,
        status: 'MENSAGEM_ENVIADA' as any,
        lastReminderSent: new Date(Date.now() - 3600000 * 2),
        customerId: customer2.id,
        petId: customer2.pets[0].id,
      },
    });

    await prisma.appointment.create({
      data: {
        scheduledAt: today14h,
        service: 'TOSA_HIGIENICA' as any,
        status: 'PENDENTE' as any,
        customerId: customer3.id,
        petId: customer3.pets[0].id,
      },
    });

    await prisma.appointment.create({
      data: {
        scheduledAt: today16h,
        service: 'TOSA_COMPLETA' as any,
        status: 'CANCELADO_REAGENDAR' as any,
        customerId: customer1.id,
        petId: customer1.pets[1].id,
      },
    });

    await prisma.appointment.create({
      data: {
        scheduledAt: tomorrow9h,
        service: 'BANHO_E_TOSA' as any,
        status: 'PENDENTE' as any,
        customerId: customer4.id,
        petId: customer4.pets[0].id,
      },
    });

    await prisma.appointment.create({
      data: {
        scheduledAt: tomorrow11h,
        service: 'BANHO' as any,
        status: 'PENDENTE' as any,
        customerId: customer3.id,
        petId: customer3.pets[0].id,
      },
    });

    console.log('✅ Dados demonstrativos populados automaticamente com sucesso!');
  } catch (err) {
    console.warn('⚠️ Nota sobre seed automático:', err instanceof Error ? err.message : err);
  }
}
