import { PrismaClient, Prisma } from '@prisma/client';
import {
  Appointment,
  AppointmentService,
  AppointmentStatus,
} from '../../domain/entities/Appointment.js';
import { Customer } from '../../../customers/domain/entities/Customer.js';
import { Pet } from '../../../customers/domain/entities/Pet.js';
import {
  AppointmentFilter,
  AppointmentMetrics,
  IAppointmentRepository,
} from '../../domain/repositories/IAppointmentRepository.js';
import { getCurrentCompanyId } from '../../../../shared/context/TenantContext.js';

export class PrismaAppointmentRepository implements IAppointmentRepository {
  constructor(private prisma: PrismaClient) {}

  private toDomain(raw: {
    id: string;
    scheduledAt: Date;
    service: string;
    serviceName?: string | null;
    servicePrice?: number | null;
    status: string;
    notes: string | null;
    customerId: string;
    petId: string;
    lastReminderSent: Date | null;
    createdAt: Date;
    updatedAt: Date;
    customer?: {
      id: string;
      name: string;
      phone: string;
      email: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    pet?: {
      id: string;
      name: string;
      breed: string;
      size: 'PEQUENO' | 'MEDIO' | 'GRANDE';
      customerId: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }): Appointment {
    const customer = raw.customer
      ? new Customer({
          id: raw.customer.id,
          name: raw.customer.name,
          phone: raw.customer.phone,
          email: raw.customer.email,
          createdAt: raw.customer.createdAt,
          updatedAt: raw.customer.updatedAt,
        })
      : undefined;

    const pet = raw.pet
      ? new Pet({
          id: raw.pet.id,
          name: raw.pet.name,
          breed: raw.pet.breed,
          size: raw.pet.size,
          customerId: raw.pet.customerId,
          createdAt: raw.pet.createdAt,
          updatedAt: raw.pet.updatedAt,
        })
      : undefined;

    return new Appointment({
      id: raw.id,
      scheduledAt: raw.scheduledAt,
      service: raw.service as AppointmentService,
      serviceName: raw.serviceName ?? null,
      servicePrice: raw.servicePrice ?? null,
      status: raw.status as AppointmentStatus,
      notes: raw.notes,
      customerId: raw.customerId,
      petId: raw.petId,
      customer,
      pet,
      lastReminderSent: raw.lastReminderSent,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findById(id: string): Promise<Appointment | null> {
    const record = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        pet: true,
      },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findByFilters(filters: AppointmentFilter): Promise<Appointment[]> {
    const companyId = getCurrentCompanyId();
    const where: Prisma.AppointmentWhereInput = { companyId };

    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);

      where.scheduledAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (filters.startDate || filters.endDate) {
      where.scheduledAt = {};
      if (filters.startDate) {
        where.scheduledAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.scheduledAt.lte = filters.endDate;
      }
    }

    if (filters.status) {
      where.status = filters.status as any;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    const records = await this.prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        pet: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return records.map((r) => this.toDomain(r));
  }

  async findPendingRemindersForDate(date: Date): Promise<Appointment[]> {
    const companyId = getCurrentCompanyId();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await this.prisma.appointment.findMany({
      where: {
        companyId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['PENDENTE', 'MENSAGEM_ENVIADA'],
        },
      },
      include: {
        customer: true,
        pet: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return records.map((r) => this.toDomain(r));
  }

  async findLatestAwaitingByCustomerPhone(phone: string): Promise<Appointment | null> {
    const cleaned = phone.replace(/\D/g, '');
    const without55 = cleaned.startsWith('55') ? cleaned.slice(2) : cleaned;
    const with55 = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
    const last8 = cleaned.length >= 8 ? cleaned.slice(-8) : cleaned;

    const phoneFilters: Prisma.CustomerWhereInput[] = [
      { phone: with55 },
      { phone: without55 },
      { phone: cleaned },
    ];
    if (last8.length === 8) {
      phoneFilters.push({ phone: { endsWith: last8 } });
    }

    // 1. Prioridade máxima: agendamento deste cliente que já recebeu mensagem (MENSAGEM_ENVIADA),
    // pegando o disparo mais recente (lastReminderSent desc)
    const awaitingForCustomer = await this.prisma.appointment.findFirst({
      where: {
        customer: {
          OR: phoneFilters,
        },
        status: 'MENSAGEM_ENVIADA',
      },
      include: {
        customer: true,
        pet: true,
      },
      orderBy: [{ lastReminderSent: 'desc' }, { updatedAt: 'desc' }],
    });

    if (awaitingForCustomer) {
      return this.toDomain(awaitingForCustomer);
    }

    // 2. Segunda prioridade: agendamento PENDENTE deste cliente
    const pendingForCustomer = await this.prisma.appointment.findFirst({
      where: {
        customer: {
          OR: phoneFilters,
        },
        status: 'PENDENTE',
      },
      include: {
        customer: true,
        pet: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });

    if (pendingForCustomer) {
      return this.toDomain(pendingForCustomer);
    }

    // 3. Se o WhatsApp enviou um JID @lid sem telefone explícito,
    // busca o agendamento mais recente que está aguardando resposta (MENSAGEM_ENVIADA)
    const latestAwaiting = await this.prisma.appointment.findFirst({
      where: {
        status: 'MENSAGEM_ENVIADA',
      },
      include: {
        customer: true,
        pet: true,
      },
      orderBy: [{ lastReminderSent: 'desc' }, { updatedAt: 'desc' }],
    });

    if (latestAwaiting) {
      return this.toDomain(latestAwaiting);
    }

    // 4. Fallback: mais recente geral deste tutor pelos últimos 8 dígitos
    const anyRecord = await this.prisma.appointment.findFirst({
      where: {
        customer: {
          OR: phoneFilters,
        },
      },
      include: {
        customer: true,
        pet: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!anyRecord) return null;
    return this.toDomain(anyRecord);
  }

  async findAll(): Promise<Appointment[]> {
    const companyId = getCurrentCompanyId();
    const records = await this.prisma.appointment.findMany({
      where: { companyId },
      include: {
        customer: true,
        pet: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return records.map((r) => this.toDomain(r));
  }

  async create(appointment: Appointment): Promise<Appointment> {
    const companyId = getCurrentCompanyId();
    const created = await this.prisma.appointment.create({
      data: {
        id: appointment.id,
        companyId,
        scheduledAt: appointment.scheduledAt,
        service: appointment.service as any,
        serviceName: appointment.serviceName ?? null,
        servicePrice: appointment.servicePrice ?? null,
        status: appointment.status as any,
        notes: appointment.notes,
        customerId: appointment.customerId,
        petId: appointment.petId,
        lastReminderSent: appointment.lastReminderSent,
      },
      include: {
        customer: true,
        pet: true,
      },
    });

    return this.toDomain(created);
  }

  async update(appointment: Appointment): Promise<Appointment> {
    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        scheduledAt: appointment.scheduledAt,
        service: appointment.service as any,
        serviceName: appointment.serviceName ?? undefined,
        servicePrice: appointment.servicePrice ?? undefined,
        status: appointment.status as any,
        notes: appointment.notes,
        lastReminderSent: appointment.lastReminderSent,
      },
      include: {
        customer: true,
        pet: true,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.appointment.delete({
      where: { id },
    });
  }

  async getMetrics(date?: Date): Promise<AppointmentMetrics> {
    const companyId = getCurrentCompanyId();
    const where: Prisma.AppointmentWhereInput = { companyId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.scheduledAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const [total, pending, sent, confirmed, cancelled] = await Promise.all([
      this.prisma.appointment.count({ where }),
      this.prisma.appointment.count({ where: { ...where, status: 'PENDENTE' } }),
      this.prisma.appointment.count({ where: { ...where, status: 'MENSAGEM_ENVIADA' } }),
      this.prisma.appointment.count({ where: { ...where, status: 'CONFIRMADO' } }),
      this.prisma.appointment.count({ where: { ...where, status: 'CANCELADO_REAGENDAR' } }),
    ]);

    return {
      total,
      pending,
      sent,
      confirmed,
      cancelled,
    };
  }
}
