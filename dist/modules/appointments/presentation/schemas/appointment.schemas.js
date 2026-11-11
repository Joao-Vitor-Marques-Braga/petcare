"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAppointmentsQuerySchema = exports.updateAppointmentStatusSchema = exports.createAppointmentSchema = void 0;
const zod_1 = require("zod");
exports.createAppointmentSchema = zod_1.z.object({
    scheduledAt: zod_1.z.string().datetime({ message: 'Data e hora devem estar no formato ISO válido' }),
    service: zod_1.z.string().min(1, 'Serviço é obrigatório'),
    serviceName: zod_1.z.string().optional().nullable(),
    servicePrice: zod_1.z.number().optional().nullable(),
    status: zod_1.z
        .enum(['PENDENTE', 'MENSAGEM_ENVIADA', 'CONFIRMADO', 'CANCELADO_REAGENDAR'])
        .optional()
        .default('PENDENTE'),
    notes: zod_1.z.string().optional().nullable(),
    customerId: zod_1.z.string().uuid('ID de tutor inválido'),
    petId: zod_1.z.string().uuid('ID de pet inválido'),
});
exports.updateAppointmentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDENTE', 'MENSAGEM_ENVIADA', 'CONFIRMADO', 'CANCELADO_REAGENDAR'], {
        errorMap: () => ({ message: 'Status inválido' }),
    }),
});
exports.listAppointmentsQuerySchema = zod_1.z.object({
    preset: zod_1.z.enum(['today', 'tomorrow', 'all']).optional(),
    date: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    customerId: zod_1.z.string().optional(),
});
