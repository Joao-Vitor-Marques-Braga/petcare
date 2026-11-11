"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPetSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
    phone: zod_1.z.string().min(10, 'Telefone inválido. Inclua DDD e número'),
    email: zod_1.z.string().email('E-mail inválido').optional().nullable(),
    pets: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string().min(1, 'Nome do pet é obrigatório'),
        breed: zod_1.z.string().min(1, 'Raça do pet é obrigatória'),
        size: zod_1.z.enum(['PEQUENO', 'MEDIO', 'GRANDE'], {
            errorMap: () => ({ message: 'Porte deve ser PEQUENO, MEDIO ou GRANDE' }),
        }),
    }))
        .optional(),
});
exports.createPetSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome do pet é obrigatório'),
    breed: zod_1.z.string().min(1, 'Raça é obrigatória'),
    size: zod_1.z.enum(['PEQUENO', 'MEDIO', 'GRANDE']),
    customerId: zod_1.z.string().uuid('ID de tutor inválido'),
});
