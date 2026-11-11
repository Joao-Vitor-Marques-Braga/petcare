import { useState } from 'react';
import { useAppointments } from './features/appointments/hooks/useAppointments';
import { useCustomers } from './features/customers/hooks/useCustomers';
import { useServices } from './features/services/hooks/useServices';
import { MetricsCards } from './features/appointments/components/MetricsCards';
import { QuickFilters } from './features/appointments/components/QuickFilters';
import { AppointmentTable } from './features/appointments/components/AppointmentTable';
import { DashboardView } from './features/appointments/components/DashboardView';
import { CustomersView } from './features/customers/components/CustomersView';
import { ServicesView } from './features/services/components/ServicesView';
import { CompaniesView } from './features/companies/components/CompaniesView';
import { LoginView } from './features/auth/components/LoginView';
import { CreateAppointmentModal } from './features/appointments/components/CreateAppointmentModal';
import { BatchTriggerModal } from './features/appointments/components/BatchTriggerModal';
import { WebhookSimulatorModal } from './features/appointments/components/WebhookSimulatorModal';
import { CreateCustomerModal } from './features/customers/components/CreateCustomerModal';
import { WhatsAppSettingsModal } from './features/settings/components/WhatsAppSettingsModal';
import { api } from './services/api';
import { AuthUser } from './types';
import { useToast } from './components/ui/Toast';
import {
  CalendarPlus,
  Send,
  RefreshCw,
  Bot,
  ShieldCheck,
  Sparkles,
  Settings,
  Calendar,
  BarChart3,
  Users,
  UserPlus,
  Scissors,
  Building2,
  LogOut,
} from 'lucide-react';

type ActiveTab = 'agenda' | 'dashboard' | 'customers' | 'services' | 'companies';

export function App() {
  const initialSession = api.getStoredSession();
  const [authUser, setAuthUser] = useState<AuthUser | null>(initialSession.user);
  const [activeCompanyId, setActiveCompanyId] = useState<string>(
    initialSession.activeCompanyId
  );
  const [activeCompanyName, setActiveCompanyName] = useState<string>(
    initialSession.activeCompanyName
  );

  const {
    appointments,
    metrics,
    loading,
    metricsLoading,
    preset,
    setPreset,
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    reload,
    sendWhatsApp,
    updateStatus,
    deleteAppointment,
    triggerBatch,
    simulateWebhook,
  } = useAppointments();

  const {
    customers,
    loading: customersLoading,
    reload: reloadCustomers,
    createCustomer,
    createPet,
    deleteCustomer,
  } = useCustomers();

  const {
    services,
    loading: servicesLoading,
    reload: reloadServices,
    createService,
    updateService,
    deleteService,
  } = useServices();

  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('agenda');
  const [isCreateApptOpen, setIsCreateApptOpen] = useState(false);
  const [preselectedCustomerId, setPreselectedCustomerId] = useState<
    string | undefined
  >(undefined);
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [returnToApptModal, setReturnToApptModal] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const reloadAllTenantData = () => {
    reload();
    reloadCustomers();
    reloadServices();
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setActiveCompanyId(user.companyId);
    setActiveCompanyName(user.companyName);
    setActiveTab('agenda');
    setTimeout(() => {
      reloadAllTenantData();
    }, 50);
  };

  const handleLogout = () => {
    api.logout();
    setAuthUser(null);
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  const handleSelectCompany = (companyId: string, companyName: string) => {
    api.setActiveCompanyContext(companyId, companyName);
    setActiveCompanyId(companyId);
    setActiveCompanyName(companyName);
    setActiveTab('agenda');
    showToast(`Alternado para o painel de: ${companyName}`, 'info');
    setTimeout(() => {
      reloadAllTenantData();
    }, 50);
  };

  const handleCreateAppointment = async (data: any) => {
    await api.createAppointment(data);
    showToast('Agendamento criado com sucesso!', 'success');
    reload();
  };

  if (!authUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 pt-3.5">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <span className="text-xl">🐾</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    {activeCompanyName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-3 h-3" />{' '}
                    {authUser.role === 'SUPER_ADMIN'
                      ? 'Super Admin SaaS'
                      : 'Pet Shop Ativo'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Logado como <strong>{authUser.email}</strong> • PetCare Anti-Furo
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Botão Configurar WhatsApp */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all shadow-sm"
                title="Configurar número remetente e QR Code do WhatsApp desta empresa"
              >
                <Settings className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp / QR Code</span>
              </button>

              {/* Botão Simulador de Webhook */}
              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all shadow-sm"
                title="Testar resposta rápida (Sim ou Não)"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                <span>Testar Resposta</span>
              </button>

              {/* Botão Disparo em Lote */}
              <button
                onClick={() => setIsBatchOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all shadow-sm"
                title="Disparar mensagem de confirmação para os agendamentos"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>Disparo em Lote</span>
              </button>

              {/* Atualizar Dados */}
              <button
                onClick={reloadAllTenantData}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 transition-all shadow-sm"
                title="Recarregar dados"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loading || customersLoading || servicesLoading ? 'animate-spin' : ''
                  }`}
                />
              </button>

              {/* Novo Cliente */}
              <button
                onClick={() => {
                  setReturnToApptModal(false);
                  setIsCreateCustomerOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Novo Cliente</span>
              </button>

              {/* Novo Agendamento */}
              <button
                onClick={() => {
                  setPreselectedCustomerId(undefined);
                  setIsCreateApptOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Novo Agendamento</span>
              </button>

              {/* Botão Sair */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
                title="Sair da conta / Trocar usuário"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>

          {/* Barra de Navegação de Abas */}
          <nav className="flex items-center gap-1 sm:gap-2 pt-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'agenda'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Agenda de Atendimentos
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
                {appointments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard de Atendimentos
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'customers'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
              }`}
            >
              <Users className="w-4 h-4" />
              Clientes & Pets
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                {customers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'services'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
              }`}
            >
              <Scissors className="w-4 h-4" />
              Serviços & Preços
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-100 text-teal-800">
                {services.length}
              </span>
            </button>

            {authUser.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => setActiveTab('companies')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'companies'
                    ? 'border-slate-900 text-slate-900 bg-slate-100 rounded-t-xl'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-t-xl'
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                Empresas / Pet Shops (SaaS)
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {activeTab === 'agenda' && (
          <>
            {/* Banner Informativo Anti-Furo com Resposta Direta */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-base font-bold tracking-tight">
                    Confirmação Automática no WhatsApp ({activeCompanyName})
                  </h2>
                </div>
                <p className="text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
                  A mensagem sai personalizada com o nome <strong>{activeCompanyName}</strong> e pergunta diretamente se o cliente confirma o horário. Basta o cliente responder <strong>SIM</strong> ou <strong>NÃO</strong> na conversa do WhatsApp e o status atualiza sozinho!
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="text-xs bg-emerald-800/80 px-3 py-1.5 rounded-xl border border-emerald-700/60 font-medium">
                  ✅ Respondeu &ldquo;SIM&rdquo; → Confirmado
                </span>
                <span className="text-xs bg-emerald-800/80 px-3 py-1.5 rounded-xl border border-emerald-700/60 font-medium">
                  ❌ Respondeu &ldquo;NÃO&rdquo; → Reagendar
                </span>
              </div>
            </div>

            {/* Métricas do Período */}
            <section>
              <MetricsCards metrics={metrics} loading={metricsLoading} />
            </section>

            {/* Filtros Rápidos */}
            <section>
              <QuickFilters
                preset={preset}
                onPresetChange={setPreset}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
            </section>

            {/* Tabela de Agendamentos */}
            <section>
              <AppointmentTable
                appointments={appointments}
                loading={loading}
                onSendWhatsApp={sendWhatsApp}
                onUpdateStatus={updateStatus}
                onDelete={deleteAppointment}
              />
            </section>
          </>
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            appointments={appointments}
            customers={customers}
            onNavigateToAgenda={() => setActiveTab('agenda')}
            onSendWhatsApp={sendWhatsApp}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersView
            customers={customers}
            appointments={appointments}
            loading={customersLoading}
            onOpenCreateCustomer={() => {
              setReturnToApptModal(false);
              setIsCreateCustomerOpen(true);
            }}
            onAddPet={createPet}
            onDeleteCustomer={deleteCustomer}
            onScheduleForCustomer={(customerId) => {
              setPreselectedCustomerId(customerId);
              setIsCreateApptOpen(true);
            }}
          />
        )}

        {activeTab === 'services' && (
          <ServicesView
            services={services}
            appointments={appointments}
            loading={servicesLoading}
            onCreateService={createService}
            onUpdateService={updateService}
            onDeleteService={deleteService}
          />
        )}

        {activeTab === 'companies' && authUser.role === 'SUPER_ADMIN' && (
          <CompaniesView
            activeCompanyId={activeCompanyId}
            onSelectCompany={handleSelectCompany}
          />
        )}
      </main>

      {/* Modais */}
      <CreateAppointmentModal
        isOpen={isCreateApptOpen}
        onClose={() => setIsCreateApptOpen(false)}
        customers={customers}
        services={services}
        initialCustomerId={preselectedCustomerId}
        onOpenCreateCustomer={() => {
          setIsCreateApptOpen(false);
          setReturnToApptModal(true);
          setIsCreateCustomerOpen(true);
        }}
        onOpenServicesTab={() => {
          setIsCreateApptOpen(false);
          setActiveTab('services');
        }}
        onSubmit={handleCreateAppointment}
      />

      <CreateCustomerModal
        isOpen={isCreateCustomerOpen}
        onClose={() => setIsCreateCustomerOpen(false)}
        onSubmit={async (data) => {
          const created = await createCustomer(data);
          setIsCreateCustomerOpen(false);
          if (returnToApptModal) {
            setPreselectedCustomerId(created.id);
            setIsCreateApptOpen(true);
          }
        }}
      />

      <BatchTriggerModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        onExecuteBatch={triggerBatch}
      />

      <WebhookSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        customers={customers}
        onSimulate={simulateWebhook}
      />

      <WhatsAppSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
