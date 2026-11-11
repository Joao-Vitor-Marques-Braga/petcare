"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthAndCompaniesController = void 0;
const zod_1 = require("zod");
const TenantContext_js_1 = require("../../../../shared/context/TenantContext.js");
const AppError_js_1 = require("../../../../shared/errors/AppError.js");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('E-mail inválido'),
    password: zod_1.z.string().min(1, 'Senha é obrigatória'),
});
const createCompanySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome do Pet Shop deve ter pelo menos 2 caracteres'),
    phone: zod_1.z.string().optional().nullable(),
    plan: zod_1.z.string().optional().default('PRO'),
    adminName: zod_1.z.string().min(2, 'Nome do responsável é obrigatório'),
    adminEmail: zod_1.z.string().email('E-mail de login inválido'),
    adminPassword: zod_1.z.string().min(4, 'A senha deve ter pelo menos 4 caracteres'),
});
const updateCompanySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    phone: zod_1.z.string().optional().nullable(),
    plan: zod_1.z.string().optional(),
    active: zod_1.z.boolean().optional(),
    adminEmail: zod_1.z.string().email().optional(),
    adminPassword: zod_1.z.string().min(4).optional(),
});
function slugify(text) {
    return (text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || `petshop_${Date.now()}`);
}
const DEFAULT_INITIAL_SERVICES = [
    {
        code: 'BANHO',
        name: 'Banho Tradicional',
        description: 'Banho com shampoo hipoalergênico, secagem, limpeza de ouvidos e corte de unhas.',
        price: 55.0,
        durationMinutes: 45,
        category: 'Banho',
        active: true,
    },
    {
        code: 'BANHO_E_TOSA',
        name: 'Banho & Tosa Completa',
        description: 'Pacote completo de banho + tosa na máquina ou tesoura, hidratação leve e acabamento.',
        price: 95.0,
        durationMinutes: 90,
        category: 'Combo',
        active: true,
    },
    {
        code: 'TOSA_HIGIENICA',
        name: 'Tosa Higiênica',
        description: 'Aparação dos pelos da barriga, patinhas, região íntima e olhos para higiene diária.',
        price: 45.0,
        durationMinutes: 30,
        category: 'Tosa',
        active: true,
    },
    {
        code: 'TOSA_COMPLETA',
        name: 'Tosa Completa na Tesoura',
        description: 'Tosa estilizada padrão da raça com acabamento artesanal na tesoura.',
        price: 75.0,
        durationMinutes: 60,
        category: 'Tosa',
        active: true,
    },
    {
        code: 'HIDRATACAO_OZONIO',
        name: 'Hidratação + Banho de Ozônio',
        description: 'Tratamento terapêutico para pele sensível e reconstrução profunda da pelagem.',
        price: 80.0,
        durationMinutes: 60,
        category: 'Estética & Spa',
        active: true,
    },
];
class AuthAndCompaniesController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    login = async (req, res, next) => {
        try {
            const parsed = loginSchema.safeParse(req.body);
            if (!parsed.success) {
                const errors = parsed.error.errors.map((e) => e.message);
                throw new AppError_js_1.ValidationError('Dados de login inválidos', errors);
            }
            const email = parsed.data.email.trim().toLowerCase();
            const user = await this.prisma.user.findUnique({
                where: { email },
                include: { company: true },
            });
            if (!user || !(0, TenantContext_js_1.verifyPassword)(parsed.data.password, user.passwordHash)) {
                throw new AppError_js_1.AppError('E-mail ou senha incorretos.', 401, 'INVALID_CREDENTIALS');
            }
            if (!user.active) {
                throw new AppError_js_1.AppError('Este usuário está desativado.', 403, 'USER_DISABLED');
            }
            if (!user.company.active && user.role !== 'SUPER_ADMIN') {
                throw new AppError_js_1.AppError('O acesso desta empresa está temporariamente suspenso. Entre em contato com o administrador.', 403, 'COMPANY_SUSPENDED');
            }
            const token = (0, TenantContext_js_1.signAuthToken)({
                userId: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
                companyName: user.company.name,
            });
            res.status(200).json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    companyId: user.companyId,
                    companyName: user.company.name,
                    companySlug: user.company.slug,
                },
            });
        }
        catch (error) {
            next(error);
        }
    };
    me = async (_req, res, next) => {
        try {
            const store = (0, TenantContext_js_1.getTenantStore)();
            if (!store.userId) {
                throw new AppError_js_1.AppError('Não autenticado.', 401, 'UNAUTHORIZED');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: store.userId },
                include: { company: true },
            });
            if (!user) {
                throw new AppError_js_1.AppError('Sessão inválida.', 401, 'UNAUTHORIZED');
            }
            res.status(200).json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    companyId: user.companyId,
                    companyName: user.company.name,
                    companySlug: user.company.slug,
                },
            });
        }
        catch (error) {
            next(error);
        }
    };
    listCompanies = async (_req, res, next) => {
        try {
            const companies = await this.prisma.company.findMany({
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            active: true,
                        },
                    },
                },
                orderBy: { createdAt: 'asc' },
            });
            const enriched = await Promise.all(companies.map(async (comp) => {
                const [customersCount, appointmentsCount, servicesCount, whatsappConfig] = await Promise.all([
                    this.prisma.customer.count({ where: { companyId: comp.id } }),
                    this.prisma.appointment.count({ where: { companyId: comp.id } }),
                    this.prisma.serviceCatalog.count({ where: { companyId: comp.id } }),
                    this.prisma.whatsAppConfig.findUnique({ where: { id: comp.id } }),
                ]);
                return {
                    id: comp.id,
                    name: comp.name,
                    slug: comp.slug,
                    phone: comp.phone,
                    plan: comp.plan,
                    active: comp.active,
                    createdAt: comp.createdAt,
                    users: comp.users,
                    stats: {
                        customers: customersCount,
                        appointments: appointmentsCount,
                        services: servicesCount,
                    },
                    whatsapp: {
                        instanceName: whatsappConfig?.instanceName || comp.slug,
                        senderPhone: whatsappConfig?.senderPhone || comp.phone || null,
                        isMockMode: whatsappConfig ? whatsappConfig.isMockMode : true,
                    },
                };
            }));
            res.status(200).json(enriched);
        }
        catch (error) {
            next(error);
        }
    };
    createCompany = async (req, res, next) => {
        try {
            const parsed = createCompanySchema.safeParse(req.body);
            if (!parsed.success) {
                const errors = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
                throw new AppError_js_1.ValidationError('Dados inválidos para cadastro de Pet Shop', errors);
            }
            const data = parsed.data;
            const cleanEmail = data.adminEmail.trim().toLowerCase();
            const existingUser = await this.prisma.user.findUnique({
                where: { email: cleanEmail },
            });
            if (existingUser) {
                throw new AppError_js_1.BusinessRuleError(`Já existe um usuário cadastrado com o e-mail ${cleanEmail}.`);
            }
            let slug = slugify(data.name);
            const existingSlug = await this.prisma.company.findUnique({ where: { slug } });
            if (existingSlug) {
                slug = `${slug}_${Math.floor(100 + Math.random() * 900)}`;
            }
            const company = await this.prisma.company.create({
                data: {
                    name: data.name.trim(),
                    slug,
                    phone: data.phone?.replace(/\D/g, '') || null,
                    plan: data.plan || 'PRO',
                    active: true,
                    users: {
                        create: {
                            name: data.adminName.trim(),
                            email: cleanEmail,
                            passwordHash: (0, TenantContext_js_1.hashPassword)(data.adminPassword),
                            role: 'PETSHOP_ADMIN',
                            active: true,
                        },
                    },
                },
                include: {
                    users: {
                        select: { id: true, name: true, email: true, role: true, active: true },
                    },
                },
            });
            // Popula o catálogo inicial de serviços para a nova empresa
            await this.prisma.serviceCatalog.createMany({
                data: DEFAULT_INITIAL_SERVICES.map((srv) => ({
                    ...srv,
                    companyId: company.id,
                })),
            });
            // Cria a configuração de WhatsApp isolada para a nova empresa
            const defaultEvolutionKey = process.env.EVOLUTION_GLOBAL_KEY ||
                process.env.EVOLUTION_API_KEY ||
                '429644463e69881710e69a3ac169490340';
            await this.prisma.whatsAppConfig.upsert({
                where: { id: company.id },
                create: {
                    id: company.id,
                    apiUrl: process.env.EVOLUTION_API_URL || 'http://evolution-api:8080',
                    apiKey: defaultEvolutionKey,
                    instanceName: slug,
                    senderPhone: data.phone?.replace(/\D/g, '') || null,
                    isMockMode: false,
                },
                update: {},
            });
            res.status(201).json(company);
        }
        catch (error) {
            next(error);
        }
    };
    updateCompany = async (req, res, next) => {
        try {
            const id = String(req.params.id);
            const parsed = updateCompanySchema.safeParse(req.body);
            if (!parsed.success) {
                const errors = parsed.error.errors.map((e) => e.message);
                throw new AppError_js_1.ValidationError('Dados inválidos', errors);
            }
            const existing = await this.prisma.company.findUnique({
                where: { id },
                include: { users: true },
            });
            if (!existing) {
                throw new AppError_js_1.NotFoundError('Empresa', id);
            }
            const data = parsed.data;
            const updated = await this.prisma.company.update({
                where: { id },
                data: {
                    name: data.name !== undefined ? data.name.trim() : undefined,
                    phone: data.phone !== undefined ? data.phone?.replace(/\D/g, '') || null : undefined,
                    plan: data.plan,
                    active: data.active,
                },
                include: {
                    users: {
                        select: { id: true, name: true, email: true, role: true, active: true },
                    },
                },
            });
            if ((data.adminEmail || data.adminPassword) && existing.users.length > 0) {
                const targetUser = existing.users.find((u) => u.role === 'PETSHOP_ADMIN') || existing.users[0];
                await this.prisma.user.update({
                    where: { id: targetUser.id },
                    data: {
                        email: data.adminEmail ? data.adminEmail.trim().toLowerCase() : undefined,
                        passwordHash: data.adminPassword ? (0, TenantContext_js_1.hashPassword)(data.adminPassword) : undefined,
                    },
                });
            }
            res.status(200).json(updated);
        }
        catch (error) {
            next(error);
        }
    };
    deleteCompany = async (req, res, next) => {
        try {
            const id = String(req.params.id);
            if (id === 'default') {
                throw new AppError_js_1.BusinessRuleError('A empresa matriz principal não pode ser removida.');
            }
            await this.prisma.appointment.deleteMany({ where: { companyId: id } });
            await this.prisma.customer.deleteMany({ where: { companyId: id } });
            await this.prisma.serviceCatalog.deleteMany({ where: { companyId: id } });
            await this.prisma.whatsAppConfig.deleteMany({ where: { id } });
            await this.prisma.company.delete({ where: { id } });
            res.status(200).json({ success: true });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthAndCompaniesController = AuthAndCompaniesController;
