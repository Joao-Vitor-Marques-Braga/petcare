export type PetSize = 'PEQUENO' | 'MEDIO' | 'GRANDE';

export type AppointmentService =
  | 'BANHO'
  | 'TOSA_HIGIENICA'
  | 'TOSA_COMPLETA'
  | 'BANHO_E_TOSA'
  | string;

export type AppointmentStatus =
  | 'PENDENTE'
  | 'MENSAGEM_ENVIADA'
  | 'CONFIRMADO'
  | 'CANCELADO_REAGENDAR';

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  category: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
  size: PetSize;
  customerId: string;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  pets?: Pet[];
  createdAt?: string;
}

export interface Appointment {
  id: string;
  scheduledAt: string;
  service: AppointmentService;
  serviceLabel: string;
  serviceName?: string | null;
  servicePrice?: number | null;
  status: AppointmentStatus;
  notes?: string | null;
  customerId: string;
  petId: string;
  customer?: Customer;
  pet?: Pet;
  lastReminderSent?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentMetrics {
  total: number;
  pending: number;
  sent: number;
  confirmed: number;
  cancelled: number;
}

export interface BatchReminderResult {
  targetDate: string;
  totalFound: number;
  sentSuccess: number;
  sentFailed: number;
  details: Array<{
    appointmentId: string;
    customerName: string;
    phone: string;
    status: 'SUCCESS' | 'FAILED';
    error?: string;
  }>;
}

export interface WhatsAppConfig {
  id: string;
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  senderPhone: string | null;
  isMockMode: boolean;
  updatedAt?: string;
}

export interface WhatsAppConnectionStatus {
  connected: boolean;
  state: string;
  mode: 'MOCK' | 'EVOLUTION_API';
  senderPhone?: string;
  instanceName?: string;
  apiUrl?: string;
  message?: string;
}

export interface WhatsAppQrCodeResponse {
  connected: boolean;
  state?: string;
  instanceName?: string;
  base64?: string | null;
  pairingCode?: string | null;
  message?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'PETSHOP_ADMIN';
  companyId: string;
  companyName: string;
  plan?: string;
}

export interface CompanyItem {
  id: string;
  name: string;
  slug: string;
  phone?: string | null;
  plan: string;
  active: boolean;
  createdAt?: string;
  users?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
  }>;
  stats?: {
    customers: number;
    appointments: number;
    services: number;
    whatsappInstance: string;
    whatsappMockMode: boolean;
  };
}

