import { Router } from 'express';
import { prisma } from '../shared/database/prisma.js';

// Repositories
import { PrismaCustomerRepository } from '../modules/customers/infrastructure/repositories/PrismaCustomerRepository.js';
import { PrismaPetRepository } from '../modules/customers/infrastructure/repositories/PrismaPetRepository.js';
import { PrismaAppointmentRepository } from '../modules/appointments/infrastructure/repositories/PrismaAppointmentRepository.js';

// Gateways
import { DynamicWhatsAppGateway } from '../modules/notifications/infrastructure/gateways/DynamicWhatsAppGateway.js';

// Customer Use Cases & Controller
import { CreateCustomerUseCase } from '../modules/customers/application/use-cases/CreateCustomerUseCase.js';
import { ListCustomersUseCase } from '../modules/customers/application/use-cases/ListCustomersUseCase.js';
import { CreatePetUseCase } from '../modules/customers/application/use-cases/CreatePetUseCase.js';
import { CustomerController } from '../modules/customers/presentation/controllers/CustomerController.js';

// Appointment Use Cases & Controller
import { CreateAppointmentUseCase } from '../modules/appointments/application/use-cases/CreateAppointmentUseCase.js';
import { ListAppointmentsUseCase } from '../modules/appointments/application/use-cases/ListAppointmentsUseCase.js';
import { UpdateAppointmentStatusUseCase } from '../modules/appointments/application/use-cases/UpdateAppointmentStatusUseCase.js';
import { GetAppointmentMetricsUseCase } from '../modules/appointments/application/use-cases/GetAppointmentMetricsUseCase.js';
import { DeleteAppointmentUseCase } from '../modules/appointments/application/use-cases/DeleteAppointmentUseCase.js';
import { AppointmentController } from '../modules/appointments/presentation/controllers/AppointmentController.js';
import { ServiceCatalogController } from '../modules/appointments/presentation/controllers/ServiceCatalogController.js';

// Notification Use Cases & Controller
import { TriggerWhatsAppReminderUseCase } from '../modules/notifications/application/use-cases/TriggerWhatsAppReminderUseCase.js';
import { TriggerBatchRemindersUseCase } from '../modules/notifications/application/use-cases/TriggerBatchRemindersUseCase.js';
import { NotificationController } from '../modules/notifications/presentation/controllers/NotificationController.js';

// Settings Use Cases & Controller
import { GetWhatsAppConfigUseCase } from '../modules/notifications/application/use-cases/GetWhatsAppConfigUseCase.js';
import { UpdateWhatsAppConfigUseCase } from '../modules/notifications/application/use-cases/UpdateWhatsAppConfigUseCase.js';
import { CheckWhatsAppStatusUseCase } from '../modules/notifications/application/use-cases/CheckWhatsAppStatusUseCase.js';
import { SendTestWhatsAppMessageUseCase } from '../modules/notifications/application/use-cases/SendTestWhatsAppMessageUseCase.js';
import { SettingsController } from '../modules/notifications/presentation/controllers/SettingsController.js';

// Webhook Use Cases & Controller
import { ProcessWebhookReplyUseCase } from '../modules/webhooks/application/use-cases/ProcessWebhookReplyUseCase.js';
import { WebhookController } from '../modules/webhooks/presentation/controllers/WebhookController.js';

// Auth & Multi-Tenant Companies Controller
import { AuthAndCompaniesController } from '../modules/auth/presentation/controllers/AuthAndCompaniesController.js';

export function configureRoutes(): Router {
  const router = Router();

  // Dependências
  const customerRepo = new PrismaCustomerRepository(prisma);
  const petRepo = new PrismaPetRepository(prisma);
  const appointmentRepo = new PrismaAppointmentRepository(prisma);
  const whatsAppGateway = new DynamicWhatsAppGateway(prisma);

  // Auth & Companies Module
  const authAndCompaniesController = new AuthAndCompaniesController(prisma);

  // Customer Module
  const createCustomerUseCase = new CreateCustomerUseCase(customerRepo, petRepo);
  const listCustomersUseCase = new ListCustomersUseCase(customerRepo);
  const createPetUseCase = new CreatePetUseCase(petRepo, customerRepo);
  const customerController = new CustomerController(
    createCustomerUseCase,
    listCustomersUseCase,
    createPetUseCase,
    customerRepo
  );

  // Webhook Module
  const processWebhookReplyUseCase = new ProcessWebhookReplyUseCase(appointmentRepo, prisma);
  const webhookController = new WebhookController(processWebhookReplyUseCase);

  // Appointment & Service Catalog Module
  const createAppointmentUseCase = new CreateAppointmentUseCase(
    appointmentRepo,
    customerRepo,
    petRepo,
    prisma
  );
  const listAppointmentsUseCase = new ListAppointmentsUseCase(
    appointmentRepo,
    prisma,
    processWebhookReplyUseCase
  );
  const updateAppointmentStatusUseCase = new UpdateAppointmentStatusUseCase(appointmentRepo);
  const getAppointmentMetricsUseCase = new GetAppointmentMetricsUseCase(appointmentRepo);
  const deleteAppointmentUseCase = new DeleteAppointmentUseCase(appointmentRepo);
  const appointmentController = new AppointmentController(
    createAppointmentUseCase,
    listAppointmentsUseCase,
    updateAppointmentStatusUseCase,
    getAppointmentMetricsUseCase,
    deleteAppointmentUseCase
  );
  const serviceCatalogController = new ServiceCatalogController(prisma);

  // Notification Module
  const triggerSingleReminderUseCase = new TriggerWhatsAppReminderUseCase(
    appointmentRepo,
    whatsAppGateway,
    prisma
  );
  const triggerBatchRemindersUseCase = new TriggerBatchRemindersUseCase(
    appointmentRepo,
    whatsAppGateway,
    prisma
  );
  const notificationController = new NotificationController(
    triggerSingleReminderUseCase,
    triggerBatchRemindersUseCase
  );

  // Settings Module
  const getConfigUseCase = new GetWhatsAppConfigUseCase(prisma);
  const updateConfigUseCase = new UpdateWhatsAppConfigUseCase(prisma);
  const checkStatusUseCase = new CheckWhatsAppStatusUseCase(prisma);
  const sendTestMessageUseCase = new SendTestWhatsAppMessageUseCase(prisma);
  const settingsController = new SettingsController(
    getConfigUseCase,
    updateConfigUseCase,
    checkStatusUseCase,
    sendTestMessageUseCase,
    prisma
  );

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
