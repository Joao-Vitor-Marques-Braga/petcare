import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  phone: z.string().min(10, 'Telefone inválido. Inclua DDD e número'),
  email: z.string().email('E-mail inválido').optional().nullable(),
  pets: z
    .array(
      z.object({
        name: z.string().min(1, 'Nome do pet é obrigatório'),
        breed: z.string().min(1, 'Raça do pet é obrigatória'),
        size: z.enum(['PEQUENO', 'MEDIO', 'GRANDE'], {
          errorMap: () => ({ message: 'Porte deve ser PEQUENO, MEDIO ou GRANDE' }),
        }),
      })
    )
    .optional(),
});

export const createPetSchema = z.object({
  name: z.string().min(1, 'Nome do pet é obrigatório'),
  breed: z.string().min(1, 'Raça é obrigatória'),
  size: z.enum(['PEQUENO', 'MEDIO', 'GRANDE']),
  customerId: z.string().uuid('ID de tutor inválido'),
});
