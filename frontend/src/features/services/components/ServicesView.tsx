import React, { useState, useMemo } from 'react';
import { ServiceItem, Appointment } from '../../../types';
import {
  Scissors,
  Plus,
  Edit3,
  Trash2,
  Clock,
  DollarSign,
  Tag,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  Loader2,
  Save,
  X,
} from 'lucide-react';

interface Props {
  services: ServiceItem[];
  appointments: Appointment[];
  loading: boolean;
  onCreateService: (data: {
    name: string;
    description?: string | null;
    price: number;
    durationMinutes?: number;
    category?: string;
    active?: boolean;
  }) => Promise<ServiceItem>;
  onUpdateService: (
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      price: number;
      durationMinutes: number;
      category: string;
      active: boolean;
    }>
  ) => Promise<ServiceItem>;
  onDeleteService: (id: string) => Promise<void>;
}

const CATEGORIES = ['Banho', 'Tosa', 'Combo', 'Estética & Spa', 'Veterinário', 'Outros'];

export const ServicesView: React.FC<Props> = ({
  services,
  appointments,
  loading,
  onCreateService,
  onUpdateService,
  onDeleteService,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Form de novo serviço ou edição
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [name, setName] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [category, setCategory] = useState('Banho');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const openCreateForm = () => {
    setEditingService(null);
    setName('');
    setPriceStr('');
    setDurationMinutes('60');
    setCategory('Banho');
    setDescription('');
    setActive(true);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = (srv: ServiceItem) => {
    setEditingService(srv);
    setName(srv.name);
    setPriceStr(srv.price.toFixed(2).replace('.', ','));
    setDurationMinutes(String(srv.durationMinutes || 60));
    setCategory(srv.category || 'Banho');
    setDescription(srv.description || '');
    setActive(srv.active);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setFormError('Informe o nome do serviço.');
      return;
    }

    const parsedPrice = parseFloat(priceStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError('Informe um valor válido em reais (ex: 65,00).');
      return;
    }

    const parsedDuration = parseInt(durationMinutes, 10) || 60;

    try {
      setSubmitting(true);
      setFormError('');

      if (editingService) {
        await onUpdateService(editingService.id, {
          name: cleanName,
          price: parsedPrice,
          durationMinutes: parsedDuration,
          category,
          description: description.trim() || null,
          active,
        });
      } else {
        await onCreateService({
          name: cleanName,
          price: parsedPrice,
          durationMinutes: parsedDuration,
          category,
          description: description.trim() || null,
          active,
        });
      }

      setIsFormOpen(false);
      setEditingService(null);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar serviço.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [services, search, selectedCategory]);

  const summary = useMemo(() => {
    const activeCount = services.filter((s) => s.active).length;
    const avgPrice =
      services.length > 0
        ? services.reduce((acc, s) => acc + s.price, 0) / services.length
        : 0;

    // Receita estimada nos agendamentos confirmados ou totais
    const estimatedRevenue = appointments.reduce((acc, appt) => {
      if (appt.status === 'CANCELADO_REAGENDAR') return acc;
      if (typeof appt.servicePrice === 'number' && appt.servicePrice > 0) {
        return acc + appt.servicePrice;
      }
      const matched = services.find(
        (s) => s.code === appt.service || s.name === appt.serviceLabel
      );
      return acc + (matched?.price || 0);
    }, 0);

    return {
      total: services.length,
      activeCount,
      avgPrice,
      estimatedRevenue,
    };
  }, [services, appointments]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getAppointmentCountForService = (srv: ServiceItem) => {
    return appointments.filter(
      (a) => a.service === srv.code || a.serviceLabel === srv.name
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* KPIs do Catálogo de Serviços */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Serviços Ativos no Catálogo
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {summary.activeCount}
              </span>
              <span className="text-xs text-slate-500">
                de {summary.total} cadastrados
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Scissors className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ticket Médio por Serviço
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-teal-600">
                {formatCurrency(summary.avgPrice)}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Faturamento Previsto na Agenda
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700">
                {formatCurrency(summary.estimatedRevenue)}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Busca, Filtro de Categorias e Botão Novo Serviço */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar serviço por nome, descrição ou categoria..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Serviço</span>
        </button>
      </div>

      {/* Formulário Inline / Card de Criação ou Edição de Serviço */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500/40 shadow-md p-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Scissors className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingService
                    ? `Editar Serviço: ${editingService.name}`
                    : 'Cadastrar Novo Serviço no Pet Shop'}
                </h3>
                <p className="text-xs text-slate-500">
                  Defina o nome, valor em R$, tempo médio e detalhes que aparecerão na agenda e no WhatsApp
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Nome do Serviço */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Banho & Tosa Higiênica, Hidratação de Pelos..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              {/* Valor (R$) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    R$
                  </span>
                  <input
                    type="text"
                    value={priceStr}
                    onChange={(e) => setPriceStr(e.target.value)}
                    placeholder="65,00"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Duração em minutos */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duração Estimada (min)
                </label>
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Categoria */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição / O que está incluso (opcional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Inclui corte de unhas, limpeza de ouvido e laço/gravatinha"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  Serviço ativo disponível para novos agendamentos
                </span>
              </label>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {editingService ? 'Salvar Alterações' : 'Adicionar Serviço'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Serviços em Cards */}
      {loading && services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">
            Carregando catálogo de serviços...
          </p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <Scissors className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-slate-800">
            Nenhum serviço encontrado
          </h4>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Clique em &ldquo;Cadastrar Novo Serviço&rdquo; para adicionar opções personalizadas e definir seus preços.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((srv) => {
            const usageCount = getAppointmentCountForService(srv);
            return (
              <div
                key={srv.id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-sm hover:shadow-md ${
                  srv.active
                    ? 'border-slate-200/80'
                    : 'border-slate-200/50 bg-slate-50/60 opacity-75'
                }`}
              >
                <div className="space-y-3">
                  {/* Topo: Categoria & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <Tag className="w-3 h-3" />
                      {srv.category || 'Estética'}
                    </span>

                    <button
                      onClick={() =>
                        onUpdateService(srv.id, { active: !srv.active })
                      }
                      title="Clique para ativar ou desativar este serviço"
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                        srv.active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {srv.active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Inativo
                        </>
                      )}
                    </button>
                  </div>

                  {/* Nome e Preço em destaque */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {srv.name}
                    </h4>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80">
                        {formatCurrency(srv.price)}
                      </span>
                    </div>
                  </div>

                  {/* Descrição */}
                  <p className="text-xs text-slate-500 leading-relaxed min-h-[32px]">
                    {srv.description || 'Sem descrição detalhada cadastrada.'}
                  </p>
                </div>

                {/* Rodapé do Card: Duração, Contagem de Uso e Botões Editar / Excluir */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {srv.durationMinutes} min
                    </span>
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                      {usageCount} agend.
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditForm(srv)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Deseja realmente excluir o serviço "${srv.name}"?`
                          )
                        ) {
                          onDeleteService(srv.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Excluir serviço"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
