"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCustomerRepository = void 0;
const Customer_js_1 = require("../../domain/entities/Customer.js");
const Pet_js_1 = require("../../domain/entities/Pet.js");
const TenantContext_js_1 = require("../../../../shared/context/TenantContext.js");
class PrismaCustomerRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    toDomain(raw) {
        const pets = raw.pets?.map((p) => new Pet_js_1.Pet({
            id: p.id,
            name: p.name,
            breed: p.breed,
            size: p.size,
            customerId: p.customerId,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        }));
        return new Customer_js_1.Customer({
            id: raw.id,
            name: raw.name,
            phone: raw.phone,
            email: raw.email,
            pets,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
    async findById(id) {
        const record = await this.prisma.customer.findUnique({
            where: { id },
            include: { pets: true },
        });
        if (!record)
            return null;
        return this.toDomain(record);
    }
    async findByPhone(phone) {
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
        const cleaned = phone.replace(/\D/g, '');
        const without55 = cleaned.startsWith('55') ? cleaned.slice(2) : cleaned;
        const with55 = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
        const record = await this.prisma.customer.findFirst({
            where: {
                companyId,
                OR: [{ phone: with55 }, { phone: without55 }, { phone: cleaned }],
            },
            include: { pets: true },
        });
        if (!record)
            return null;
        return this.toDomain(record);
    }
    async findAll() {
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
        const records = await this.prisma.customer.findMany({
            where: { companyId },
            include: { pets: true },
            orderBy: { name: 'asc' },
        });
        return records.map((r) => this.toDomain(r));
    }
    async create(customer) {
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
        const created = await this.prisma.customer.create({
            data: {
                id: customer.id,
                companyId,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
            },
            include: { pets: true },
        });
        return this.toDomain(created);
    }
    async update(customer) {
        const updated = await this.prisma.customer.update({
            where: { id: customer.id },
            data: {
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
            },
            include: { pets: true },
        });
        return this.toDomain(updated);
    }
    async delete(id) {
        await this.prisma.customer.delete({
            where: { id },
        });
    }
}
exports.PrismaCustomerRepository = PrismaCustomerRepository;
