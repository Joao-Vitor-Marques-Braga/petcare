import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed do Banco de Dados Pet Shop Anti-Furo...');

  // Limpeza prévia
  await prisma.notificationLog.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.customer.deleteMany();

  // 1. Criando Tutores
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Mariana Duarte',
      phone: '5511998765432',
      email: 'mariana.duarte@email.com',
      pets: {
        create: [
          {
            name: 'Thor',
            breed: 'Golden Retriever',
            size: 'GRANDE',
          },
          {
            name: 'Luna',
            breed: 'Spitz Alemão',
            size: 'PEQUENO',
          },
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
          {
            name: 'Bob',
            breed: 'Buldogue Francês',
            size: 'MEDIO',
          },
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
          {
            name: 'Mel',
            breed: 'Shih Tzu',
            size: 'PEQUENO',
          },
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
          {
            name: 'Max',
            breed: 'Pastor Alemão',
            size: 'GRANDE',
          },
        ],
      },
    },
    include: { pets: true },
  });

  console.log('✅ Tutores e Pets criados com sucesso!');

  // Datas de referência: Hoje e Amanhã
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

  const tomorrow15h = new Date(tomorrow);
  tomorrow15h.setHours(15, 0, 0, 0);

  // 2. Criando Agendamentos para Hoje
  await prisma.appointment.create({
    data: {
      scheduledAt: today9am,
      service: 'BANHO_E_TOSA',
      status: 'CONFIRMADO',
      notes: 'Tosa padrão da raça, cuidado com orelha direita sensível',
      customerId: customer1.id,
      petId: customer1.pets[0].id, // Thor
    },
  });

  await prisma.appointment.create({
    data: {
      scheduledAt: today10h30,
      service: 'BANHO',
      status: 'MENSAGEM_ENVIADA',
      lastReminderSent: new Date(Date.now() - 3600000 * 2), // 2 horas atrás
      notes: 'Xampu hipoalergênico',
      customerId: customer2.id,
      petId: customer2.pets[0].id, // Bob
    },
  });

  await prisma.appointment.create({
    data: {
      scheduledAt: today14h,
      service: 'TOSA_HIGIENICA',
      status: 'PENDENTE',
      notes: 'Primeira vez no pet shop',
      customerId: customer3.id,
      petId: customer3.pets[0].id, // Mel
    },
  });

  await prisma.appointment.create({
    data: {
      scheduledAt: today16h,
      service: 'TOSA_COMPLETA',
      status: 'CANCELADO_REAGENDAR',
      notes: 'Cliente solicitou reagendamento devido a imprevisto',
      customerId: customer1.id,
      petId: customer1.pets[1].id, // Luna
    },
  });

  // 3. Criando Agendamentos para Amanhã (alvos principais da rotina diária anti-furo)
  await prisma.appointment.create({
    data: {
      scheduledAt: tomorrow9h,
      service: 'BANHO_E_TOSA',
      status: 'PENDENTE',
      notes: 'Tosa verão',
      customerId: customer4.id,
      petId: customer4.pets[0].id, // Max
    },
  });

  await prisma.appointment.create({
    data: {
      scheduledAt: tomorrow11h,
      service: 'BANHO',
      status: 'PENDENTE',
      customerId: customer3.id,
      petId: customer3.pets[0].id, // Mel
    },
  });

  await prisma.appointment.create({
    data: {
      scheduledAt: tomorrow15h,
      service: 'TOSA_HIGIENICA',
      status: 'MENSAGEM_ENVIADA',
      lastReminderSent: new Date(),
      customerId: customer2.id,
      petId: customer2.pets[0].id, // Bob
    },
  });

  console.log('✅ Agendamentos de Hoje e Amanhã criados com sucesso!');
  console.log('🎉 Seed finalizado com êxito!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
