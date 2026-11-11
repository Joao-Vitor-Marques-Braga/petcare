"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAppointmentRepository = void 0;
const Appointment_js_1 = require("../../domain/entities/Appointment.js");
const Customer_js_1 = require("../../../customers/domain/entities/Customer.js");
const Pet_js_1 = require("../../../customers/domain/entities/Pet.js");
const TenantContext_js_1 = require("../../../../shared/context/TenantContext.js");
class PrismaAppointmentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    toDomain(raw) {
        const customer = raw.customer
            ? new Customer_js_1.Customer({
                id: raw.customer.id,
                name: raw.customer.name,
                phone: raw.customer.phone,
                email: raw.customer.email,
                createdAt: raw.customer.createdAt,
                updatedAt: raw.customer.updatedAt,
            })
            : undefined;
        const pet = raw.pet
            ? new Pet_js_1.Pet({
                id: raw.pet.id,
                name: raw.pet.name,
                breed: raw.pet.breed,
                size: raw.pet.size,
                customerId: raw.pet.customerId,
                createdAt: raw.pet.createdAt,
                updatedAt: raw.pet.updatedAt,
            })
            : undefined;
        return new Appointment_js_1.Appointment({
            id: raw.id,
            scheduledAt: raw.scheduledAt,
            service: raw.service,
            serviceName: raw.serviceName ?? null,
            servicePrice: raw.servicePrice ?? null,
            status: raw.status,
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
    async findById(id) {
        const record = await this.prisma.appointment.findUnique({
            where: { id },
            include: {
                customer: true,
                pet: true,
            },
        });
        if (!record)
            return null;
        return this.toDomain(record);
    }
    async findByFilters(filters) {
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
        const where = { companyId };
        if (filters.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.date);
            endOfDay.setHours(23, 59, 59, 999);
            where.scheduledAt = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }
        else if (filters.startDate || filters.endDate) {
            where.scheduledAt = {};
            if (filters.startDate) {
                where.scheduledAt.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.scheduledAt.lte = filters.endDate;
            }
        }
        if (filters.status) {
            where.status = filters.status;
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
    async findPendingRemindersForDate(date) {
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
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
    async findLatestAwaitingByCustomerPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const without55 = cleaned.startsWith('55') ? cleaned.slice(2) : cleaned;
        const with55 = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
        const last8 = cleaned.length >= 8 ? cleaned.slice(-8) : cleaned;
        const phoneFilters = [
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
        if (!anyRecord)
            return null;
        return this.toDomain(anyRecord);
    }
    async findAll() {
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
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
    async create(appointment) {
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
        const created = await this.prisma.appointment.create({
            data: {
                id: appointment.id,
                companyId,
                scheduledAt: appointment.scheduledAt,
                service: appointment.service,
                serviceName: appointment.serviceName ?? null,
                servicePrice: appointment.servicePrice ?? null,
                status: appointment.status,
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
    async update(appointment) {
        const updated = await this.prisma.appointment.update({
            where: { id: appointment.id },
            data: {
                scheduledAt: appointment.scheduledAt,
                service: appointment.service,
                serviceName: appointment.serviceName ?? undefined,
                servicePrice: appointment.servicePrice ?? undefined,
                status: appointment.status,
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
    async delete(id) {
        await this.prisma.appointment.delete({
            where: { id },
        });
    }
    async getMetrics(date) {
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
        const where = { companyId };
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
exports.PrismaAppointmentRepository = PrismaAppointmentRepository;
