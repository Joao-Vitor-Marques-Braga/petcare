import React, { useState, useEffect } from 'react';
import { CompanyItem } from '../../../types';
import { api } from '../../../services/api';
import { useToast } from '../../../components/ui/Toast';
import { Modal } from '../../../components/ui/Modal';
import {
  Building2,
  Plus,
  CheckCircle2,
  Ban,
  KeyRound,
  Users,
  Calendar,
  Scissors,
  Smartphone,
  ExternalLink,
  Trash2,
  Edit3,
  Loader2,
  ShieldCheck,
  Lock,
  Mail,
} from 'lucide-react';

interface Props {
  activeCompanyId: string;
  onSelectCompany: (companyId: string, companyName: string) => void;
}

export const CompaniesView: React.FC<Props> = ({
  activeCompanyId,
  onSelectCompany,
}) => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Valor padrão do Plano Único (salvo para manter 1 plano único)
  const [defaultPlanPrice, setDefaultPlanPrice] = useState<string>(() => {
    return localStorage.getItem('petshop_single_plan_price') || 'R$ 97,00/mês';
  });

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState(defaultPlanPrice);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const { showToast } = useToast();

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const list = await api.getCompanies();
      setCompanies(list);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao carregar empresas.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const openCreateModal = () => {
    setEditingCompany(null);
    setName('');
    setPhone('');
    setPlan(defaultPlanPrice);
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
    setIsModalOpen(true);
  };

  const openEditModal = (company: CompanyItem) => {
    setEditingCompany(company);
    setName(company.name);
    setPhone(company.phone || '');
    setPlan(
      company.plan === 'PRO' || company.plan === 'STARTER' || company.plan === 'ENTERPRISE'
        ? defaultPlanPrice
        : company.plan || defaultPlanPrice
    );
    const primaryUser = company.users?.[0];
    setAdminName(primaryUser?.name || '');
    setAdminEmail(primaryUser?.email || '');
    setAdminPassword('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Informe o nome do Pet Shop.', 'error');
      return;
    }

    const finalPlan = plan.trim() || defaultPlanPrice;
    localStorage.setItem('petshop_single_plan_price', finalPlan);
    setDefaultPlanPrice(finalPlan);

    try {
      setSaving(true);
      if (editingCompany) {
        await api.updateCompany(editingCompany.id, {
          name: name.trim(),
          phone: phone.trim(),
          plan: finalPlan,
          adminEmail: adminEmail.trim() || undefined,
          adminPassword: adminPassword.trim() || undefined,
        });
        showToast(`Pet Shop "${name}" atualizado com sucesso!`, 'success');
      } else {
        if (!adminEmail.trim() || !adminPassword.trim()) {
          showToast('Defina o e-mail e a senha de acesso para o dono do Pet Shop.', 'error');
          setSaving(false);
          return;
        }
        await api.createCompany({
          name: name.trim(),
          phone: phone.trim(),
          plan: finalPlan,
          adminName: adminName.trim() || `Admin ${name.trim()}`,
          adminEmail: adminEmail.trim(),
          adminPassword: adminPassword.trim(),
        });
        showToast(
          `Pet Shop "${name}" cadastrado com login e catálogo criados!`,
          'success'
        );
      }
      setIsModalOpen(false);
      await loadCompanies();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao salvar Pet Shop.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (company: CompanyItem) => {
    if (company.id === 'default') {
      showToast('A empresa Matriz principal não pode ser suspensa.', 'error');
      return;
    }
    try {
      const nextState = !company.active;
      await api.updateCompany(company.id, { active: nextState });
      showToast(
        nextState
          ? `Acesso do Pet Shop "${company.name}" reativado!`
          : `Acesso do Pet Shop "${company.name}" suspenso!`,
        nextState ? 'success' : 'info'
      );
      await loadCompanies();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao alterar status da empresa.',
        'error'
      );
    }
  };

  const handleDelete = async (company: CompanyItem) => {
    if (company.id === 'default') {
      showToast('A empresa Matriz não pode ser excluída.', 'error');
      return;
    }
    if (
      !window.confirm(
        `Tem certeza que deseja excluir o Pet Shop "${company.name}" e todos os seus dados?`
      )
    ) {
      return;
    }
    try {
      await api.deleteCompany(company.id);
      showToast(`Pet Shop "${company.name}" removido com sucesso.`, 'info');
      if (activeCompanyId === company.id) {
        onSelectCompany('default', 'PetCare Matriz');
      }
      await loadCompanies();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao excluir empresa.',
        'error'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner SaaS Multi-Empresa */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Painel Super Admin (Dono do SaaS)
          </div>
          <h2 className="text-lg font-extrabold tracking-tight">
            Gestão de Empresas Assinantes (Multi-PetShop)
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Cadastre novos Pet Shops clientes, crie o login exclusivo de cada um, bloqueie inadimplentes com 1 clique ou alterne para visualizar e configurar o painel de qualquer empresa.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Pet Shop
        </button>
      </div>

      {/* Lista de Empresas */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          Carregando empresas cadastradas...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((company) => {
            const isCurrent = activeCompanyId === company.id;
            const primaryUser = company.users?.[0];

            return (
              <div
                key={company.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between gap-4 ${
                  isCurrent
                    ? 'border-emerald-500 ring-2 ring-emerald-500/15 shadow-md'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  {/* Topo do Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          company.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            {company.name}
                          </h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                              Visualizando Agora
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                            Plano Único •{' '}
                            {company.plan === 'PRO' ||
                            company.plan === 'STARTER' ||
                            company.plan === 'ENTERPRISE'
                              ? defaultPlanPrice
                              : company.plan}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          WhatsApp Comercial: {company.phone || 'Não informado'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        company.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {company.active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                        </>
                      ) : (
                        <>
                          <Ban className="w-3 h-3" /> Suspenso
                        </>
                      )}
                    </span>
                  </div>

                  {/* Credenciais de Login da Empresa */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          E-mail de Login do Cliente:
                        </span>
                        <strong className="text-slate-800 font-semibold">
                          {primaryUser?.email || 'Sem usuário'}
                        </strong>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold">
                      {primaryUser?.role === 'SUPER_ADMIN'
                        ? 'Super Admin'
                        : 'Admin Pet Shop'}
                    </span>
                  </div>

                  {/* Métricas Rápidas da Empresa */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                      <Users className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" />
                      <span className="text-xs font-extrabold text-slate-800 block">
                        {company.stats?.customers ?? 0}
                      </span>
                      <span className="text-[10px] text-slate-400">Clientes</span>
                    </div>
                    <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" />
                      <span className="text-xs font-extrabold text-slate-800 block">
                        {company.stats?.appointments ?? 0}
                      </span>
                      <span className="text-[10px] text-slate-400">Agenda</span>
                    </div>
                    <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                      <Scissors className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" />
                      <span className="text-xs font-extrabold text-slate-800 block">
                        {company.stats?.services ?? 0}
                      </span>
                      <span className="text-[10px] text-slate-400">Serviços</span>
                    </div>
                    <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
                      <span
                        className="text-[10px] font-bold text-slate-700 block truncate"
                        title={company.stats?.whatsappInstance}
                      >
                        {company.stats?.whatsappInstance || '-'}
                      </span>
                      <span className="text-[9px] text-slate-400">Instância</span>
                    </div>
                  </div>
                </div>

                {/* Ações do Card */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectCompany(company.id, company.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {isCurrent
                      ? 'Painel Ativo no Momento'
                      : 'Acessar Painel deste Pet Shop'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(company)}
                      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all"
                      title="Editar dados / Redefinir senha"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {company.id !== 'default' && (
                      <>
                        <button
                          onClick={() => handleToggleActive(company)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                            company.active
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                          title={
                            company.active
                              ? 'Bloquear acesso por inadimplência'
                              : 'Reativar acesso'
                          }
                        >
                          {company.active ? 'Suspender' : 'Reativar'}
                        </button>

                        <button
                          onClick={() => handleDelete(company)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-all"
                          title="Excluir empresa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar / Editar Pet Shop */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingCompany
            ? `✏️ Editar Pet Shop: ${editingCompany.name}`
            : '🏢 Cadastrar Novo Pet Shop Assinante'
        }
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nome do Pet Shop *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pet Shop Amigo Fiel"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Este nome sairá automaticamente no cabeçalho das mensagens de WhatsApp enviadas aos clientes deste Pet Shop.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                WhatsApp do Pet Shop (Com DDD)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 5511999998888"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Plano Único (Valor Mensal)
              </label>
              <input
                type="text"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="Ex: R$ 97,00/mês"
                className="w-full px-3.5 py-2 bg-emerald-50/60 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-900"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> Credenciais de Acesso do Cliente
            </h4>

            {!editingCompany && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome do Responsável / Dono
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Ex: Dr. Marcos Silva"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                E-mail de Login *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="contato@amigofielpet.com.br"
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required={!editingCompany}
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {editingCompany
                  ? 'Nova Senha (deixe em branco para manter a atual)'
                  : 'Senha de Acesso *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder={
                    editingCompany ? 'Digite apenas se quiser trocar a senha' : 'Ex: pet123456'
                  }
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  required={!editingCompany}
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingCompany ? 'Salvar Alterações' : 'Criar Pet Shop & Login'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
