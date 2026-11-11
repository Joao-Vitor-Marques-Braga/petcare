"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureRoutes = configureRoutes;
const express_1 = require("express");
const prisma_js_1 = require("../shared/database/prisma.js");
// Repositories
const PrismaCustomerRepository_js_1 = require("../modules/customers/infrastructure/repositories/PrismaCustomerRepository.js");
const PrismaPetRepository_js_1 = require("../modules/customers/infrastructure/repositories/PrismaPetRepository.js");
const PrismaAppointmentRepository_js_1 = require("../modules/appointments/infrastructure/repositories/PrismaAppointmentRepository.js");
// Gateways
const DynamicWhatsAppGateway_js_1 = require("../modules/notifications/infrastructure/gateways/DynamicWhatsAppGateway.js");
// Customer Use Cases & Controller
const CreateCustomerUseCase_js_1 = require("../modules/customers/application/use-cases/CreateCustomerUseCase.js");
const ListCustomersUseCase_js_1 = require("../modules/customers/application/use-cases/ListCustomersUseCase.js");
const CreatePetUseCase_js_1 = require("../modules/customers/application/use-cases/CreatePetUseCase.js");
const CustomerController_js_1 = require("../modules/customers/presentation/controllers/CustomerController.js");
// Appointment Use Cases & Controller
const CreateAppointmentUseCase_js_1 = require("../modules/appointments/application/use-cases/CreateAppointmentUseCase.js");
const ListAppointmentsUseCase_js_1 = require("../modules/appointments/application/use-cases/ListAppointmentsUseCase.js");
const UpdateAppointmentStatusUseCase_js_1 = require("../modules/appointments/application/use-cases/UpdateAppointmentStatusUseCase.js");
const GetAppointmentMetricsUseCase_js_1 = require("../modules/appointments/application/use-cases/GetAppointmentMetricsUseCase.js");
const DeleteAppointmentUseCase_js_1 = require("../modules/appointments/application/use-cases/DeleteAppointmentUseCase.js");
const AppointmentController_js_1 = require("../modules/appointments/presentation/controllers/AppointmentController.js");
const ServiceCatalogController_js_1 = require("../modules/appointments/presentation/controllers/ServiceCatalogController.js");
// Notification Use Cases & Controller
const TriggerWhatsAppReminderUseCase_js_1 = require("../modules/notifications/application/use-cases/TriggerWhatsAppReminderUseCase.js");
const TriggerBatchRemindersUseCase_js_1 = require("../modules/notifications/application/use-cases/TriggerBatchRemindersUseCase.js");
const NotificationController_js_1 = require("../modules/notifications/presentation/controllers/NotificationController.js");
// Settings Use Cases & Controller
const GetWhatsAppConfigUseCase_js_1 = require("../modules/notifications/application/use-cases/GetWhatsAppConfigUseCase.js");
const UpdateWhatsAppConfigUseCase_js_1 = require("../modules/notifications/application/use-cases/UpdateWhatsAppConfigUseCase.js");
const CheckWhatsAppStatusUseCase_js_1 = require("../modules/notifications/application/use-cases/CheckWhatsAppStatusUseCase.js");
const SendTestWhatsAppMessageUseCase_js_1 = require("../modules/notifications/application/use-cases/SendTestWhatsAppMessageUseCase.js");
const SettingsController_js_1 = require("../modules/notifications/presentation/controllers/SettingsController.js");
// Webhook Use Cases & Controller
const ProcessWebhookReplyUseCase_js_1 = require("../modules/webhooks/application/use-cases/ProcessWebhookReplyUseCase.js");
const WebhookController_js_1 = require("../modules/webhooks/presentation/controllers/WebhookController.js");
// Auth & Multi-Tenant Companies Controller
const AuthAndCompaniesController_js_1 = require("../modules/auth/presentation/controllers/AuthAndCompaniesController.js");
function configureRoutes() {
    const router = (0, express_1.Router)();
    // Dependências
    const customerRepo = new PrismaCustomerRepository_js_1.PrismaCustomerRepository(prisma_js_1.prisma);
    const petRepo = new PrismaPetRepository_js_1.PrismaPetRepository(prisma_js_1.prisma);
    const appointmentRepo = new PrismaAppointmentRepository_js_1.PrismaAppointmentRepository(prisma_js_1.prisma);
    const whatsAppGateway = new DynamicWhatsAppGateway_js_1.DynamicWhatsAppGateway(prisma_js_1.prisma);
    // Auth & Companies Module
    const authAndCompaniesController = new AuthAndCompaniesController_js_1.AuthAndCompaniesController(prisma_js_1.prisma);
    // Customer Module
    const createCustomerUseCase = new CreateCustomerUseCase_js_1.CreateCustomerUseCase(customerRepo, petRepo);
    const listCustomersUseCase = new ListCustomersUseCase_js_1.ListCustomersUseCase(customerRepo);
    const createPetUseCase = new CreatePetUseCase_js_1.CreatePetUseCase(petRepo, customerRepo);
    const customerController = new CustomerController_js_1.CustomerController(createCustomerUseCase, listCustomersUseCase, createPetUseCase, customerRepo);
    // Webhook Module
    const processWebhookReplyUseCase = new ProcessWebhookReplyUseCase_js_1.ProcessWebhookReplyUseCase(appointmentRepo, prisma_js_1.prisma);
    const webhookController = new WebhookController_js_1.WebhookController(processWebhookReplyUseCase);
    // Appointment & Service Catalog Module
    const createAppointmentUseCase = new CreateAppointmentUseCase_js_1.CreateAppointmentUseCase(appointmentRepo, customerRepo, petRepo, prisma_js_1.prisma);
    const listAppointmentsUseCase = new ListAppointmentsUseCase_js_1.ListAppointmentsUseCase(appointmentRepo, prisma_js_1.prisma, processWebhookReplyUseCase);
    const updateAppointmentStatusUseCase = new UpdateAppointmentStatusUseCase_js_1.UpdateAppointmentStatusUseCase(appointmentRepo);
    const getAppointmentMetricsUseCase = new GetAppointmentMetricsUseCase_js_1.GetAppointmentMetricsUseCase(appointmentRepo);
    const deleteAppointmentUseCase = new DeleteAppointmentUseCase_js_1.DeleteAppointmentUseCase(appointmentRepo);
    const appointmentController = new AppointmentController_js_1.AppointmentController(createAppointmentUseCase, listAppointmentsUseCase, updateAppointmentStatusUseCase, getAppointmentMetricsUseCase, deleteAppointmentUseCase);
    const serviceCatalogController = new ServiceCatalogController_js_1.ServiceCatalogController(prisma_js_1.prisma);
    // Notification Module
    const triggerSingleReminderUseCase = new TriggerWhatsAppReminderUseCase_js_1.TriggerWhatsAppReminderUseCase(appointmentRepo, whatsAppGateway, prisma_js_1.prisma);
    const triggerBatchRemindersUseCase = new TriggerBatchRemindersUseCase_js_1.TriggerBatchRemindersUseCase(appointmentRepo, whatsAppGateway, prisma_js_1.prisma);
    const notificationController = new NotificationController_js_1.NotificationController(triggerSingleReminderUseCase, triggerBatchRemindersUseCase);
    // Settings Module
    const getConfigUseCase = new GetWhatsAppConfigUseCase_js_1.GetWhatsAppConfigUseCase(prisma_js_1.prisma);
    const updateConfigUseCase = new UpdateWhatsAppConfigUseCase_js_1.UpdateWhatsAppConfigUseCase(prisma_js_1.prisma);
    const checkStatusUseCase = new CheckWhatsAppStatusUseCase_js_1.CheckWhatsAppStatusUseCase(prisma_js_1.prisma);
    const sendTestMessageUseCase = new SendTestWhatsAppMessageUseCase_js_1.SendTestWhatsAppMessageUseCase(prisma_js_1.prisma);
    const settingsController = new SettingsController_js_1.SettingsController(getConfigUseCase, updateConfigUseCase, checkStatusUseCase, sendTestMessageUseCase, prisma_js_1.prisma);
    // Health check
    router.get('/health', (_req, res) => {
        res.json({
            status: 'ok',
            service: 'PetShop Anti-Furo API (Multi-Tenant SaaS)',
            timestamp: new Date().toISOString(),
        });
    });
    // Rotas de Autenticação & Multi-Empresas (Pet Shops)
    router.post('/auth/login', authAndCompaniesController.login);
    router.get('/auth/me', authAndCompaniesController.me);
    router.get('/companies', authAndCompaniesController.listCompanies);
    router.post('/companies', authAndCompaniesController.createCompany);
    router.patch('/companies/:id', authAndCompaniesController.updateCompany);
    router.delete('/companies/:id', authAndCompaniesController.deleteCompany);
    // Rotas de Clientes / Tutores & Pets
    router.post('/customers', customerController.createCustomer);
    router.get('/customers', customerController.listCustomers);
    router.delete('/customers/:id', customerController.deleteCustomer);
    router.post('/pets', customerController.createPet);
    // Rotas de Catálogo de Serviços & Preços
    router.get('/services', serviceCatalogController.listServices);
    router.post('/services', serviceCatalogController.createService);
    router.put('/services/:id', serviceCatalogController.updateService);
    router.delete('/services/:id', serviceCatalogController.deleteService);
    // Rotas de Agendamentos
    router.get('/appointments/metrics', appointmentController.getMetrics);
    router.get('/appointments', appointmentController.listAppointments);
    router.post('/appointments', appointmentController.createAppointment);
    router.patch('/appointments/:id/status', appointmentController.updateStatus);
    router.delete('/appointments/:id', appointmentController.deleteAppointment);
    // Rotas de Notificações / WhatsApp
    router.post('/notifications/send-single/:id', notificationController.sendSingleReminder);
    router.post('/notifications/send-batch', notificationController.sendBatchReminders);
    // Rotas de Configurações de WhatsApp / Evolution API
    router.get('/settings/whatsapp', settingsController.getConfig);
    router.post('/settings/whatsapp', settingsController.updateConfig);
    router.get('/settings/whatsapp/status', settingsController.getStatus);
    router.get('/settings/whatsapp/qrcode', settingsController.getQrCode);
    router.post('/settings/whatsapp/test-send', settingsController.sendTest);
    // Rota de Webhook para Evolution API / n8n (suporta rota direta e sub-rotas por evento)
    router.post('/webhooks/whatsapp', webhookController.handleIncomingWebhook);
    router.post('/webhooks/whatsapp/:event', webhookController.handleIncomingWebhook);
    return router;
}
