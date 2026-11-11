import { PrismaClient } from '@prisma/client';
import { Customer } from '../../domain/entities/Customer.js';
import { Pet } from '../../domain/entities/Pet.js';
import { ICustomerRepository } from '../../domain/repositories/ICustomerRepository.js';
import { getCurrentCompanyId } from '../../../../shared/context/TenantContext.js';

export class PrismaCustomerRepository implements ICustomerRepository {
  constructor(private prisma: PrismaClient) {}

  private toDomain(raw: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
    pets?: Array<{
      id: string;
      name: string;
      breed: string;
      size: 'PEQUENO' | 'MEDIO' | 'GRANDE';
      customerId: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }): Customer {
    const pets = raw.pets?.map(
      (p) =>
        new Pet({
          id: p.id,
          name: p.name,
          breed: p.breed,
          size: p.size,
          customerId: p.customerId,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })
    );

    return new Customer({
      id: raw.id,
      name: raw.name,
      phone: raw.phone,
      email: raw.email,
      pets,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findById(id: string): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({
      where: { id },
      include: { pets: true },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    const companyId = getCurrentCompanyId();
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

    if (!record) return null;
    return this.toDomain(record);
  }

  async findAll(): Promise<Customer[]> {
    const companyId = getCurrentCompanyId();
    const records = await this.prisma.customer.findMany({
      where: { companyId },
      include: { pets: true },
      orderBy: { name: 'asc' },
    });

    return records.map((r) => this.toDomain(r));
  }

  async create(customer: Customer): Promise<Customer> {
    const companyId = getCurrentCompanyId();
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

  async update(customer: Customer): Promise<Customer> {
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

  async delete(id: string): Promise<void> {
    await this.prisma.customer.delete({
      where: { id },
    });
  }
}
