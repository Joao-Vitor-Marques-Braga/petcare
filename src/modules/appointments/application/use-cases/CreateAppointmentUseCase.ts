import { PrismaClient } from '@prisma/client';
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository.js';
import { ICustomerRepository } from '../../../customers/domain/repositories/ICustomerRepository.js';
import { IPetRepository } from '../../../customers/domain/repositories/IPetRepository.js';
import {
  Appointment,
  AppointmentService,
  AppointmentStatus,
} from '../../domain/entities/Appointment.js';
import { NotFoundError, BusinessRuleError } from '../../../../shared/errors/AppError.js';
import { getCurrentCompanyId } from '../../../../shared/context/TenantContext.js';

export interface CreateAppointmentInput {
  scheduledAt: string | Date;
  service: AppointmentService;
  serviceName?: string | null;
  servicePrice?: number | null;
  status?: AppointmentStatus;
  notes?: string | null;
  customerId: string;
  petId: string;
}

export class CreateAppointmentUseCase {
  constructor(
    private appointmentRepo: IAppointmentRepository,
    private customerRepo: ICustomerRepository,
    private petRepo: IPetRepository,
    private prisma?: PrismaClient
  ) {}

  async execute(input: CreateAppointmentInput) {
    const customer = await this.customerRepo.findById(input.customerId);
    if (!customer) {
      throw new NotFoundError('Tutor', input.customerId);
    }

    const pet = await this.petRepo.findById(input.petId);
    if (!pet) {
      throw new NotFoundError('Pet', input.petId);
    }

    if (pet.customerId !== input.customerId) {
      throw new BusinessRuleError('O pet informado não pertence ao tutor selecionado.');
    }

    const scheduledDate = new Date(input.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new BusinessRuleError('Data/hora de agendamento inválida.');
    }

    let resolvedName = input.serviceName ?? null;
    let resolvedPrice = input.servicePrice ?? null;

    if (this.prisma && (!resolvedName || resolvedPrice === null)) {
      const companyId = getCurrentCompanyId();
      const catalogItem = await this.prisma.serviceCatalog
        .findFirst({
          where: {
            companyId,
            OR: [{ code: input.service }, { id: input.service }],
          },
        })
        .catch(() => null);

      if (catalogItem) {
        if (!resolvedName) resolvedName = catalogItem.name;
        if (resolvedPrice === null) resolvedPrice = catalogItem.price;
      }
    }

    const appointment = new Appointment({
      scheduledAt: scheduledDate,
      service: input.service,
      serviceName: resolvedName,
      servicePrice: resolvedPrice,
      status: input.status ?? 'PENDENTE',
      notes: input.notes,
      customerId: input.customerId,
      petId: input.petId,
    });

    const saved = await this.appointmentRepo.create(appointment);
    return (await this.appointmentRepo.findById(saved.id!))?.toJSON();
  }
}
