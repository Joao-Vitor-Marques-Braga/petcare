import { z } from 'zod';

export const createAppointmentSchema = z.object({
  scheduledAt: z.string().datetime({ message: 'Data e hora devem estar no formato ISO válido' }),
  service: z.string().min(1, 'Serviço é obrigatório'),
  serviceName: z.string().optional().nullable(),
  servicePrice: z.number().optional().nullable(),
  status: z
    .enum(['PENDENTE', 'MENSAGEM_ENVIADA', 'CONFIRMADO', 'CANCELADO_REAGENDAR'])
    .optional()
    .default('PENDENTE'),
  notes: z.string().optional().nullable(),
  customerId: z.string().uuid('ID de tutor inválido'),
  petId: z.string().uuid('ID de pet inválido'),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['PENDENTE', 'MENSAGEM_ENVIADA', 'CONFIRMADO', 'CANCELADO_REAGENDAR'], {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
});

export const listAppointmentsQuerySchema = z.object({
  preset: z.enum(['today', 'tomorrow', 'all']).optional(),
  date: z.string().optional(),
  status: z.string().optional(),
  customerId: z.string().optional(),
});
