import {
  Appointment,
  AppointmentMetrics,
  AppointmentStatus,
  AuthUser,
  BatchReminderResult,
  CompanyItem,
  Customer,
  ServiceItem,
  WhatsAppConfig,
  WhatsAppConnectionStatus,
  WhatsAppQrCodeResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

// ==========================================
// Mock Store Resiliente para Demonstração Local Instantânea
// ==========================================
const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 's1',
    code: 'BANHO',
    name: 'Banho Tradicional',
    description: 'Banho com shampoo hipoalergênico, secagem, limpeza de ouvidos e corte de unhas.',
    price: 55.0,
    durationMinutes: 45,
    category: 'Banho',
    active: true,
  },
  {
    id: 's2',
    code: 'BANHO_E_TOSA',
    name: 'Banho & Tosa Completa',
    description: 'Pacote completo de banho + tosa na máquina ou tesoura, hidratação leve e acabamento.',
    price: 95.0,
    durationMinutes: 90,
    category: 'Combo',
    active: true,
  },
  {
    id: 's3',
    code: 'TOSA_HIGIENICA',
    name: 'Tosa Higiênica',
    description: 'Aparação dos pelos da barriga, patinhas, região íntima e olhos para higiene diária.',
    price: 45.0,
    durationMinutes: 30,
    category: 'Tosa',
    active: true,
  },
  {
    id: 's4',
    code: 'TOSA_COMPLETA',
    name: 'Tosa Completa na Tesoura',
    description: 'Tosa estilizada padrão da raça com acabamento artesanal na tesoura.',
    price: 75.0,
    durationMinutes: 60,
    category: 'Tosa',
    active: true,
  },
  {
    id: 's5',
    code: 'HIDRATACAO_OZONIO',
    name: 'Hidratação + Banho de Ozônio',
    description: 'Tratamento terapêutico para pele sensível e reconstrução profunda da pelagem.',
    price: 80.0,
    durationMinutes: 60,
    category: 'Estética & Spa',
    active: true,
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Mariana Duarte',
    phone: '5511998765432',
    email: 'mariana.duarte@email.com',
    pets: [
      { id: 'p1', name: 'Thor', breed: 'Golden Retriever', size: 'GRANDE', customerId: 'c1' },
      { id: 'p2', name: 'Luna', breed: 'Spitz Alemão', size: 'PEQUENO', customerId: 'c1' },
    ],
  },
  {
    id: 'c2',
    name: 'Carlos Alberto Ferreira',
    phone: '5511987654321',
    email: 'carlos.ferreira@email.com',
    pets: [
      { id: 'p3', name: 'Bob', breed: 'Buldogue Francês', size: 'MEDIO', customerId: 'c2' },
    ],
  },
  {
    id: 'c3',
    name: 'Beatriz Vasconcelos',
    phone: '5511976543210',
    email: 'bia.vasconcelos@email.com',
    pets: [
      { id: 'p4', name: 'Mel', breed: 'Shih Tzu', size: 'PEQUENO', customerId: 'c3' },
    ],
  },
  {
    id: 'c4',
    name: 'Lucas Mendes',
    phone: '5511965432109',
    email: 'lucas.mendes@email.com',
    pets: [
      { id: 'p5', name: 'Max', breed: 'Pastor Alemão', size: 'GRANDE', customerId: 'c4' },
    ],
  },
];

const now = new Date();
const todayDate = now.toISOString().split('T')[0];
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowDate = tomorrow.toISOString().split('T')[0];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    scheduledAt: `${todayDate}T09:00:00`,
    service: 'BANHO_E_TOSA',
    serviceLabel: 'Banho e Tosa Completa',
    servicePrice: 95.0,
    status: 'CONFIRMADO',
    notes: 'Tosa padrão da raça, cuidado com orelha direita sensível',
    customerId: 'c1',
    petId: 'p1',
    customer: INITIAL_CUSTOMERS[0],
    pet: INITIAL_CUSTOMERS[0].pets![0],
  },
  {
    id: 'a2',
    scheduledAt: `${todayDate}T10:30:00`,
    service: 'BANHO',
    serviceLabel: 'Banho',
    servicePrice: 55.0,
    status: 'MENSAGEM_ENVIADA',
    notes: 'Xampu hipoalergênico',
    lastReminderSent: new Date(Date.now() - 3600000 * 2).toISOString(),
    customerId: 'c2',
    petId: 'p3',
    customer: INITIAL_CUSTOMERS[1],
    pet: INITIAL_CUSTOMERS[1].pets![0],
  },
  {
    id: 'a3',
    scheduledAt: `${todayDate}T14:00:00`,
    service: 'TOSA_HIGIENICA',
    serviceLabel: 'Tosa Higiênica',
    servicePrice: 45.0,
    status: 'PENDENTE',
    notes: 'Primeira vez no pet shop',
    customerId: 'c3',
    petId: 'p4',
    customer: INITIAL_CUSTOMERS[2],
    pet: INITIAL_CUSTOMERS[2].pets![0],
  },
  {
    id: 'a4',
    scheduledAt: `${todayDate}T16:00:00`,
    service: 'TOSA_COMPLETA',
    serviceLabel: 'Tosa Completa',
    servicePrice: 75.0,
    status: 'CANCELADO_REAGENDAR',
    notes: 'Cliente solicitou reagendamento devido a imprevisto',
    customerId: 'c1',
    petId: 'p2',
    customer: INITIAL_CUSTOMERS[0],
    pet: INITIAL_CUSTOMERS[0].pets![1],
  },
  {
    id: 'a5',
    scheduledAt: `${tomorrowDate}T09:00:00`,
    service: 'BANHO_E_TOSA',
    serviceLabel: 'Banho e Tosa Completa',
    servicePrice: 95.0,
    status: 'PENDENTE',
    notes: 'Tosa verão',
    customerId: 'c4',
    petId: 'p5',
    customer: INITIAL_CUSTOMERS[3],
    pet: INITIAL_CUSTOMERS[3].pets![0],
  },
  {
    id: 'a6',
    scheduledAt: `${tomorrowDate}T11:00:00`,
    service: 'BANHO',
    serviceLabel: 'Banho',
    servicePrice: 55.0,
    status: 'PENDENTE',
    customerId: 'c3',
    petId: 'p4',
    customer: INITIAL_CUSTOMERS[2],
    pet: INITIAL_CUSTOMERS[2].pets![0],
  },
  {
    id: 'a7',
    scheduledAt: `${tomorrowDate}T15:00:00`,
    service: 'TOSA_HIGIENICA',
    serviceLabel: 'Tosa Higiênica',
    servicePrice: 45.0,
    status: 'MENSAGEM_ENVIADA',
    lastReminderSent: new Date().toISOString(),
    customerId: 'c2',
    petId: 'p3',
    customer: INITIAL_CUSTOMERS[1],
    pet: INITIAL_CUSTOMERS[1].pets![0],
  },
];

const DEFAULT_CONFIG: WhatsAppConfig = {
  id: 'default',
  apiUrl: 'http://localhost:8080',
  apiKey: '',
  instanceName: 'petshop_bot',
  senderPhone: '5511999998888',
  isMockMode: true,
};

function getStoredServices(): ServiceItem[] {
  const raw = localStorage.getItem('petshop_services');
  if (!raw) {
    localStorage.setItem('petshop_services', JSON.stringify(INITIAL_SERVICES));
    return INITIAL_SERVICES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_SERVICES;
  }
}

function setStoredServices(items: ServiceItem[]) {
  localStorage.setItem('petshop_services', JSON.stringify(items));
}

function getStoredAppointments(): Appointment[] {
  const raw = localStorage.getItem('petshop_appointments');
  if (!raw) {
    localStorage.setItem('petshop_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
    return INITIAL_APPOINTMENTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_APPOINTMENTS;
  }
}

function setStoredAppointments(items: Appointment[]) {
  localStorage.setItem('petshop_appointments', JSON.stringify(items));
}

function getStoredCustomers(): Customer[] {
  const raw = localStorage.getItem('petshop_customers');
  if (!raw) {
    localStorage.setItem('petshop_customers', JSON.stringify(INITIAL_CUSTOMERS));
    return INITIAL_CUSTOMERS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_CUSTOMERS;
  }
}

function setStoredCustomers(items: Customer[]) {
  localStorage.setItem('petshop_customers', JSON.stringify(items));
}

function getStoredConfig(): WhatsAppConfig {
  const raw = localStorage.getItem('petshop_whatsapp_config');
  if (!raw) {
    localStorage.setItem('petshop_whatsapp_config', JSON.stringify(DEFAULT_CONFIG));
    return DEFAULT_CONFIG;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CONFIG;
  }
}

function setStoredConfig(config: WhatsAppConfig) {
  localStorage.setItem('petshop_whatsapp_config', JSON.stringify(config));
}

function getAuthHeaders(includeJson = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('petshop_auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const activeCompanyId = localStorage.getItem('petshop_active_company_id');
  const activeCompanyName = localStorage.getItem('petshop_active_company_name');
  if (activeCompanyId) {
    headers['x-company-id'] = activeCompanyId;
  }
  if (activeCompanyName) {
    headers['x-company-name'] = encodeURIComponent(activeCompanyName);
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.message || `Erro na requisição: ${res.statusText}`;
    throw new Error(message);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const api = {
  // ==========================================
  // Auth & Multi-Company SaaS Management
  // ==========================================
  getStoredSession(): { token: string | null; user: AuthUser | null; activeCompanyId: string; activeCompanyName: string } {
    const token = localStorage.getItem('petshop_auth_token');
    const rawUser = localStorage.getItem('petshop_auth_user');
    let user: AuthUser | null = null;
    if (rawUser) {
      try {
        user = JSON.parse(rawUser);
      } catch {
        user = null;
      }
    }
    const activeCompanyId = localStorage.getItem('petshop_active_company_id') || user?.companyId || 'default';
    const activeCompanyName = localStorage.getItem('petshop_active_company_name') || user?.companyName || 'PetCare Matriz';
    return { token, user, activeCompanyId, activeCompanyName };
  },

  setActiveCompanyContext(companyId: string, companyName: string) {
    localStorage.setItem('petshop_active_company_id', companyId);
    localStorage.setItem('petshop_active_company_name', companyName);
  },

  logout() {
    localStorage.removeItem('petshop_auth_token');
    localStorage.removeItem('petshop_auth_user');
    localStorage.removeItem('petshop_active_company_id');
    localStorage.removeItem('petshop_active_company_name');
  },

  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse<{ success: boolean; token: string; user: AuthUser }>(res);
    localStorage.setItem('petshop_auth_token', data.token);
    localStorage.setItem('petshop_auth_user', JSON.stringify(data.user));
    localStorage.setItem('petshop_active_company_id', data.user.companyId);
    localStorage.setItem('petshop_active_company_name', data.user.companyName);
    return { token: data.token, user: data.user };
  },

  async getCompanies(): Promise<CompanyItem[]> {
    const res = await fetch(`${API_BASE_URL}/companies`, {
      headers: getAuthHeaders(),
    });
    const json = await handleResponse<{ success: boolean; data: CompanyItem[] }>(res);
    return json.data || [];
  },

  async createCompany(data: {
    name: string;
    phone?: string;
    plan?: string;
    adminName?: string;
    adminEmail: string;
    adminPassword: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  },

  async updateCompany(
    id: string,
    data: {
      name?: string;
      phone?: string;
      plan?: string;
      active?: boolean;
      adminEmail?: string;
      adminPassword?: string;
    }
  ): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  },

  async deleteCompany(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    await handleResponse(res);
  },

  // ==========================================
  // Appointments
  // ==========================================
  async getAppointments(params?: {
    preset?: 'today' | 'tomorrow' | 'all';
    date?: string;
    status?: string;
  }): Promise<Appointment[]> {
    try {
      const query = new URLSearchParams();
      if (params?.preset) query.append('preset', params.preset);
      if (params?.date) query.append('date', params.date);
      if (params?.status && params.status !== 'ALL') query.append('status', params.status);

      const res = await fetch(`${API_BASE_URL}/appointments?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse<Appointment[]>(res);
    } catch {
      let list = getStoredAppointments();

      if (params?.preset === 'today') {
        const today = new Date().toISOString().split('T')[0];
        list = list.filter((a) => a.scheduledAt.startsWith(today));
      } else if (params?.preset === 'tomorrow') {
        const tom = new Date();
        tom.setDate(tom.getDate() + 1);
        const tomStr = tom.toISOString().split('T')[0];
        list = list.filter((a) => a.scheduledAt.startsWith(tomStr));
      } else if (params?.date) {
        list = list.filter((a) => a.scheduledAt.startsWith(params.date!));
      }

      if (params?.status && params.status !== 'ALL') {
        list = list.filter((a) => a.status === params.status);
      }

      return list;
    }
  },

  async getMetrics(params?: {
    preset?: 'today' | 'tomorrow' | 'all';
    date?: string;
  }): Promise<AppointmentMetrics> {
    try {
      const query = new URLSearchParams();
      if (params?.preset) query.append('preset', params.preset);
      if (params?.date) query.append('date', params.date);

      const res = await fetch(`${API_BASE_URL}/appointments/metrics?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse<AppointmentMetrics>(res);
    } catch {
      const list = await this.getAppointments({ preset: params?.preset, date: params?.date });
      return {
        total: list.length,
        pending: list.filter((a) => a.status === 'PENDENTE').length,
        sent: list.filter((a) => a.status === 'MENSAGEM_ENVIADA').length,
        confirmed: list.filter((a) => a.status === 'CONFIRMADO').length,
        cancelled: list.filter((a) => a.status === 'CANCELADO_REAGENDAR').length,
      };
    }
  },

  async createAppointment(data: {
    scheduledAt: string;
    service: string;
    serviceName?: string;
    servicePrice?: number;
    customerId: string;
    petId: string;
    notes?: string;
  }): Promise<Appointment> {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(data),
      });
      return await handleResponse<Appointment>(res);
    } catch {
      const customers = getStoredCustomers();
      const customer = customers.find((c) => c.id === data.customerId);
      const pet = customer?.pets?.find((p) => p.id === data.petId);
      const services = getStoredServices();
      const catalogItem = services.find((s) => s.code === data.service || s.id === data.service);

      const label =
        data.serviceName ||
        catalogItem?.name ||
        (data.service === 'BANHO_E_TOSA'
          ? 'Banho e Tosa Completa'
          : data.service === 'BANHO'
          ? 'Banho'
          : data.service === 'TOSA_HIGIENICA'
          ? 'Tosa Higiênica'
          : data.service);

      const newAppt: Appointment = {
        id: `mock-appt-${Date.now()}`,
        scheduledAt: data.scheduledAt,
        service: data.service,
        serviceLabel: label,
        serviceName: label,
        servicePrice: data.servicePrice ?? catalogItem?.price ?? null,
        status: 'PENDENTE',
        notes: data.notes,
        customerId: data.customerId,
        petId: data.petId,
        customer,
        pet,
      };

      const all = getStoredAppointments();
      all.unshift(newAppt);
      setStoredAppointments(all);
      return newAppt;
    }
  },

  // Services Catalog
  async getServices(): Promise<ServiceItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/services`, {
        headers: getAuthHeaders(),
      });
      const json = await handleResponse<{ success: boolean; data: ServiceItem[] }>(res);
      const list = Array.isArray(json) ? json : json.data;
      if (Array.isArray(list) && list.length > 0) {
        setStoredServices(list);
      }
      return list;
    } catch {
      return getStoredServices();
    }
  },

  async createService(data: {
    name: string;
    description?: string | null;
    price: number;
    durationMinutes?: number;
    category?: string;
    active?: boolean;
  }): Promise<ServiceItem> {
    try {
      const res = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(data),
      });
      const json = await handleResponse<{ success: boolean; data: ServiceItem }>(res);
      return (json as any).data || (json as any);
    } catch {
      const services = getStoredServices();
      const code = data.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_');
      const created: ServiceItem = {
        id: `srv-${Date.now()}`,
        code: `${code}_${Math.floor(100 + Math.random() * 900)}`,
        name: data.name,
        description: data.description || null,
        price: data.price,
        durationMinutes: data.durationMinutes ?? 60,
        category: data.category || 'Estética',
        active: data.active ?? true,
      };
      services.push(created);
      setStoredServices(services);
      return created;
    }
  },

  async updateService(
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      price: number;
      durationMinutes: number;
      category: string;
      active: boolean;
    }>
  ): Promise<ServiceItem> {
    try {
      const res = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify(data),
      });
      const json = await handleResponse<{ success: boolean; data: ServiceItem }>(res);
      return (json as any).data || (json as any);
    } catch {
      const services = getStoredServices();
      const idx = services.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error('Serviço não encontrado');
      services[idx] = { ...services[idx], ...data };
      setStoredServices(services);
      return services[idx];
    }
  },

  async deleteService(id: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleResponse(res);
    } catch {
      const services = getStoredServices();
      setStoredServices(services.filter((s) => s.id !== id));
    }
  },

  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus
  ): Promise<Appointment> {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ status }),
      });
      return await handleResponse<Appointment>(res);
    } catch {
      const all = getStoredAppointments();
      const item = all.find((a) => a.id === id);
      if (item) {
        item.status = status;
        setStoredAppointments(all);
        return item;
      }
      throw new Error('Agendamento não encontrado.');
    }
  },

  async deleteAppointment(id: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleResponse<void>(res);
    } catch {
      const all = getStoredAppointments();
      setStoredAppointments(all.filter((a) => a.id !== id));
    }
  },

  // Notifications
  async sendSingleReminder(id: string): Promise<{
    success: boolean;
    appointmentId: string;
    status: AppointmentStatus;
    sentAt: string;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/send-single/${id}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      const all = getStoredAppointments();
      const item = all.find((a) => a.id === id);
      if (item) {
        item.status = 'MENSAGEM_ENVIADA';
        item.lastReminderSent = new Date().toISOString();
        setStoredAppointments(all);
        return {
          success: true,
          appointmentId: id,
          status: 'MENSAGEM_ENVIADA',
          sentAt: item.lastReminderSent,
        };
      }
      throw new Error('Agendamento não encontrado.');
    }
  },

  async sendBatchReminders(params: {
    preset?: 'today' | 'tomorrow';
    targetDate?: string;
  }): Promise<BatchReminderResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/send-batch`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(params),
      });
      return await handleResponse<BatchReminderResult>(res);
    } catch {
      const all = getStoredAppointments();
      let targetDateStr = new Date().toISOString().split('T')[0];
      if (params.preset === 'tomorrow') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        targetDateStr = d.toISOString().split('T')[0];
      }

      const targets = all.filter(
        (a) =>
          a.scheduledAt.startsWith(targetDateStr) &&
          (a.status === 'PENDENTE' || a.status === 'MENSAGEM_ENVIADA')
      );

      targets.forEach((t) => {
        t.status = 'MENSAGEM_ENVIADA';
        t.lastReminderSent = new Date().toISOString();
      });

      setStoredAppointments(all);

      return {
        targetDate: targetDateStr,
        totalFound: targets.length,
        sentSuccess: targets.length,
        sentFailed: 0,
        details: targets.map((t) => ({
          appointmentId: t.id,
          customerName: t.customer?.name || 'Cliente',
          phone: t.customer?.phone || '',
          status: 'SUCCESS',
        })),
      };
    }
  },

  // Customers & Pets
  async getCustomers(): Promise<Customer[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse<Customer[]>(res);
    } catch {
      return getStoredCustomers();
    }
  },

  async createCustomer(data: {
    name: string;
    phone: string;
    email?: string | null;
    pets?: Array<{ name: string; breed: string; size: string }>;
  }): Promise<Customer> {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(data),
      });
      return await handleResponse<Customer>(res);
    } catch {
      const customers = getStoredCustomers();
      const customerId = `mock-c-${Date.now()}`;
      const newCust: Customer = {
        id: customerId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        pets: data.pets?.map((p, idx) => ({
          id: `mock-p-${Date.now()}-${idx}`,
          name: p.name,
          breed: p.breed,
          size: p.size as any,
          customerId,
        })),
      };

      customers.unshift(newCust);
      setStoredCustomers(customers);
      return newCust;
    }
  },

  async createPet(data: {
    name: string;
    breed: string;
    size: 'PEQUENO' | 'MEDIO' | 'GRANDE';
    customerId: string;
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/pets`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch {
      const customers = getStoredCustomers();
      const cust = customers.find((c) => c.id === data.customerId);
      const newPet = {
        id: `mock-p-${Date.now()}`,
        name: data.name,
        breed: data.breed,
        size: data.size,
        customerId: data.customerId,
      };
      if (cust) {
        cust.pets = [...(cust.pets || []), newPet];
        setStoredCustomers(customers);
      }
      return newPet;
    }
  },

  async deleteCustomer(id: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleResponse<void>(res);
    } catch {
      const customers = getStoredCustomers();
      setStoredCustomers(customers.filter((c) => c.id !== id));
    }
  },

  // Webhook Simulator
  async simulateWebhookReply(data: {
    phone: string;
    reply: string;
  }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/webhooks/whatsapp`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch {
      const all = getStoredAppointments();
      const cleanPhone = data.phone.replace(/\D/g, '');

      const appt = all.find(
        (a) =>
          a.customer?.phone?.replace(/\D/g, '') === cleanPhone ||
          a.customer?.phone?.includes(cleanPhone)
      );

      if (!appt) {
        return {
          processed: false,
          reason: 'Nenhum agendamento pendente/aguardando localizado para este telefone.',
        };
      }

      let intent = 'UNKNOWN';
      const cleanReply = data.reply.trim().toLowerCase();

      if (cleanReply === '1' || cleanReply === 'sim' || cleanReply.includes('confirma')) {
        intent = 'CONFIRM';
        appt.status = 'CONFIRMADO';
      } else if (cleanReply === '2' || cleanReply === 'nao' || cleanReply === 'não' || cleanReply.includes('cancela') || cleanReply.includes('reagend')) {
        intent = 'CANCEL_OR_RESCHEDULE';
        appt.status = 'CANCELADO_REAGENDAR';
      }

      setStoredAppointments(all);

      return {
        processed: true,
        appointmentId: appt.id,
        customerName: appt.customer?.name,
        petName: appt.pet?.name,
        currentStatus: appt.status,
        intent,
      };
    }
  },

  // WhatsApp Settings & Connection
  async getWhatsAppConfig(): Promise<WhatsAppConfig> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/whatsapp`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse<WhatsAppConfig>(res);
    } catch {
      return getStoredConfig();
    }
  },

  async updateWhatsAppConfig(data: {
    apiUrl: string;
    apiKey: string;
    instanceName: string;
    senderPhone?: string | null;
    isMockMode: boolean;
  }): Promise<WhatsAppConfig> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/whatsapp`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(data),
      });
      return await handleResponse<WhatsAppConfig>(res);
    } catch {
      const updated: WhatsAppConfig = {
        id: 'default',
        apiUrl: data.apiUrl,
        apiKey: data.apiKey,
        instanceName: data.instanceName,
        senderPhone: data.senderPhone || null,
        isMockMode: data.isMockMode,
      };
      setStoredConfig(updated);
      return updated;
    }
  },

  async getWhatsAppStatus(): Promise<WhatsAppConnectionStatus> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/whatsapp/status`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse<WhatsAppConnectionStatus>(res);
    } catch {
      const cfg = getStoredConfig();
      return {
        connected: true,
        state: 'open',
        mode: cfg.isMockMode ? 'MOCK' : 'EVOLUTION_API',
        senderPhone: cfg.senderPhone || '5511999998888',
        instanceName: cfg.instanceName,
        apiUrl: cfg.apiUrl,
        message: cfg.isMockMode
          ? 'Modo Simulação Seguro Ativo (Mock Gateway)'
          : 'Status local simulado',
      };
    }
  },

  async getWhatsAppQrCode(): Promise<WhatsAppQrCodeResponse> {
    const res = await fetch(`${API_BASE_URL}/settings/whatsapp/qrcode`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse<WhatsAppQrCodeResponse>(res);
  },

  async sendTestMessage(data: {
    phone: string;
    message?: string;
  }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/whatsapp/test-send`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch {
      const cfg = getStoredConfig();
      return {
        success: true,
        mode: cfg.isMockMode ? 'MOCK' : 'EVOLUTION_API',
        phone: data.phone,
        instanceName: cfg.instanceName,
        simulated: true,
      };
    }
  },
};

