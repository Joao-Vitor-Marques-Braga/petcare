import { PrismaClient } from '@prisma/client';
import { Pet } from '../../domain/entities/Pet.js';
import { IPetRepository } from '../../domain/repositories/IPetRepository.js';

export class PrismaPetRepository implements IPetRepository {
  constructor(private prisma: PrismaClient) {}

  private toDomain(raw: {
    id: string;
    name: string;
    breed: string;
    size: 'PEQUENO' | 'MEDIO' | 'GRANDE';
    customerId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Pet {
    return new Pet({
      id: raw.id,
      name: raw.name,
      breed: raw.breed,
      size: raw.size,
      customerId: raw.customerId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findById(id: string): Promise<Pet | null> {
    const record = await this.prisma.pet.findUnique({
      where: { id },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByCustomerId(customerId: string): Promise<Pet[]> {
    const records = await this.prisma.pet.findMany({
      where: { customerId },
      orderBy: { name: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findAll(): Promise<Pet[]> {
    const records = await this.prisma.pet.findMany({
      orderBy: { name: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async create(pet: Pet): Promise<Pet> {
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

  async update(pet: Pet): Promise<Pet> {
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

  async delete(id: string): Promise<void> {
    await this.prisma.pet.delete({
      where: { id },
    });
  }
}
