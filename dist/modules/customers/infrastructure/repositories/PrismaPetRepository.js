"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPetRepository = void 0;
const Pet_js_1 = require("../../domain/entities/Pet.js");
class PrismaPetRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    toDomain(raw) {
        return new Pet_js_1.Pet({
            id: raw.id,
            name: raw.name,
            breed: raw.breed,
            size: raw.size,
            customerId: raw.customerId,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
    async findById(id) {
        const record = await this.prisma.pet.findUnique({
            where: { id },
        });
        if (!record)
            return null;
        return this.toDomain(record);
    }
    async findByCustomerId(customerId) {
        const records = await this.prisma.pet.findMany({
            where: { customerId },
            orderBy: { name: 'asc' },
        });
        return records.map((r) => this.toDomain(r));
    }
    async findAll() {
        const records = await this.prisma.pet.findMany({
            orderBy: { name: 'asc' },
        });
        return records.map((r) => this.toDomain(r));
    }
    async create(pet) {
        const created = await this.prisma.pet.create({
            data: {
                id: pet.id,
                name: pet.name,
                breed: pet.breed,
                size: pet.size,
                customerId: pet.customerId,
            },
        });
        return this.toDomain(created);
    }
    async update(pet) {
        const updated = await this.prisma.pet.update({
            where: { id: pet.id },
            data: {
                name: pet.name,
                breed: pet.breed,
                size: pet.size,
            },
        });
        return this.toDomain(updated);
    }
    async delete(id) {
        await this.prisma.pet.delete({
            where: { id },
        });
    }
}
exports.PrismaPetRepository = PrismaPetRepository;
