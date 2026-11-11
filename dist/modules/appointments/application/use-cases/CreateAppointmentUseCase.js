"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAppointmentUseCase = void 0;
const Appointment_js_1 = require("../../domain/entities/Appointment.js");
const AppError_js_1 = require("../../../../shared/errors/AppError.js");
const TenantContext_js_1 = require("../../../../shared/context/TenantContext.js");
class CreateAppointmentUseCase {
    appointmentRepo;
    customerRepo;
    petRepo;
    prisma;
    constructor(appointmentRepo, customerRepo, petRepo, prisma) {
        this.appointmentRepo = appointmentRepo;
        this.customerRepo = customerRepo;
        this.petRepo = petRepo;
        this.prisma = prisma;
    }
    async execute(input) {
        const customer = await this.customerRepo.findById(input.customerId);
        if (!customer) {
            throw new AppError_js_1.NotFoundError('Tutor', input.customerId);
        }
        const pet = await this.petRepo.findById(input.petId);
        if (!pet) {
            throw new AppError_js_1.NotFoundError('Pet', input.petId);
        }
        if (pet.customerId !== input.customerId) {
            throw new AppError_js_1.BusinessRuleError('O pet informado não pertence ao tutor selecionado.');
        }
        const scheduledDate = new Date(input.scheduledAt);
        if (isNaN(scheduledDate.getTime())) {
            throw new AppError_js_1.BusinessRuleError('Data/hora de agendamento inválida.');
        }
        let resolvedName = input.serviceName ?? null;
        let resolvedPrice = input.servicePrice ?? null;
        if (this.prisma && (!resolvedName || resolvedPrice === null)) {
            const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
            const catalogItem = await this.prisma.serviceCatalog
                .findFirst({
                where: {
                    companyId,
                    OR: [{ code: input.service }, { id: input.service }],
                },
            })
                .catch(() => null);
            if (catalogItem) {
                if (!resolvedName)
                    resolvedName = catalogItem.name;
                if (resolvedPrice === null)
                    resolvedPrice = catalogItem.price;
            }
        }
        const appointment = new Appointment_js_1.Appointment({
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
        return (await this.appointmentRepo.findById(saved.id))?.toJSON();
    }
}
exports.CreateAppointmentUseCase = CreateAppointmentUseCase;
