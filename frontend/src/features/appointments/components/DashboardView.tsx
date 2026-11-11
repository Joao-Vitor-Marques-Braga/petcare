import React, { useMemo } from 'react';
import { Appointment, Customer } from '../../../types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  TrendingUp,
  Scissors,
  Users,
  CalendarCheck,
  PhoneCall,
} from 'lucide-react';

interface Props {
  appointments: Appointment[];
  customers: Customer[];
  onNavigateToAgenda: () => void;
  onSendWhatsApp: (id: string) => Promise<void>;
}

export const DashboardView: React.FC<Props> = ({
  appointments,
  customers,
  onNavigateToAgenda,
  onSendWhatsApp,
}) => {
  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === 'CONFIRMADO').length;
    const sent = appointments.filter((a) => a.status === 'MENSAGEM_ENVIADA').length;
    const pending = appointments.filter((a) => a.status === 'PENDENTE').length;
    const cancelled = appointments.filter(
      (a) => a.status === 'CANCELADO_REAGENDAR'
    ).length;

    const confirmationRate =
      total > 0 ? Math.round((confirmed / total) * 100) : 0;
    const responseRate =
      confirmed + cancelled + sent > 0
        ? Math.round(((confirmed + cancelled) / (confirmed + cancelled + sent)) * 100)
        : 0;

    // Contagem por tipo de serviço
    const byService = {
      BANHO: appointments.filter((a) => a.service === 'BANHO').length,
      BANHO_E_TOSA: appointments.filter((a) => a.service === 'BANHO_E_TOSA')
        .length,
      TOSA_HIGIENICA: appointments.filter((a) => a.service === 'TOSA_HIGIENICA')
        .length,
      TOSA_COMPLETA: appointments.filter((a) => a.service === 'TOSA_COMPLETA')
        .length,
    };

    // Contagem por porte do pet
    const bySize = {
      PEQUENO: appointments.filter((a) => a.pet?.size === 'PEQUENO').length,
      MEDIO: appointments.filter((a) => a.pet?.size === 'MEDIO').length,
      GRANDE: appointments.filter((a) => a.pet?.size === 'GRANDE').length,
    };

    const needsReschedule = appointments.filter(
      (a) => a.status === 'CANCELADO_REAGENDAR'
    );
    const upcomingConfirmed = appointments
      .filter((a) => a.status === 'CONFIRMADO')
      .slice(0, 5);

    return {
      total,
      confirmed,
      sent,
      pending,
      cancelled,
      confirmationRate,
      responseRate,
      byService,
      bySize,
      needsReschedule,
      upcomingConfirmed,
    };
  }, [appointments]);

  const pct = (val: number) =>
    stats.total > 0 ? Math.round((val / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* KPIs de Performance Anti-Furo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Taxa de Confirmação
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {stats.confirmationRate}%
            </span>
            <span className="text-xs text-slate-500">
              ({stats.confirmed} de {stats.total})
            </span>
          </div>
          <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${stats.confirmationRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Taxa de Resposta WhatsApp
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-600">
              {stats.responseRate}%
            </span>
            <span className="text-xs text-slate-500">
              interagiram na enquete
            </span>
          </div>
          <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all"
              style={{ width: `${stats.responseRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Furos Evitados (Reagendar)
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600">
              {stats.cancelled}
            </span>
            <span className="text-xs text-slate-500">
              horários liberados a tempo
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Clientes que avisaram que não podiam ir na enquete
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Base Ativa
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {customers.length}
            </span>
            <span className="text-xs text-slate-500">clientes cadastrados</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {stats.pending} atendimento(s) aguardando disparo
          </p>
        </div>
      </div>

      {/* Gráficos de Distribuição por Status e Serviços */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funil de Status dos Atendimentos */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                Distribuição dos Atendimentos por Status
              </h3>
              <p className="text-xs text-slate-500">
                Acompanhamento em tempo real das confirmações
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              Total: {stats.total}
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {[
              {
                label: 'Confirmados (Marcaram "Sim")',
                count: stats.confirmed,
                color: 'bg-emerald-500',
                textColor: 'text-emerald-700',
              },
              {
                label: 'Aguardando Resposta (Enquete Enviada)',
                count: stats.sent,
                color: 'bg-sky-500',
                textColor: 'text-sky-700',
              },
              {
                label: 'Pendentes de Disparo',
                count: stats.pending,
                color: 'bg-amber-500',
                textColor: 'text-amber-700',
              },
              {
                label: 'Cancelados / Pediram Reagendamento ("Não")',
                count: stats.cancelled,
                color: 'bg-rose-500',
                textColor: 'text-rose-700',
              },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    {item.label}
                  </span>
                  <span className={`font-bold ${item.textColor}`}>
                    {item.count} ({pct(item.count)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${pct(item.count)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demanda por Serviço e Porte */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-teal-600" />
              Atendimentos por Tipo de Serviço
            </h3>
            <p className="text-xs text-slate-500">
              Serviços mais procurados no Pet Shop
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                label: 'Banho & Tosa Completa',
                count: stats.byService.BANHO_E_TOSA,
                bar: 'bg-teal-600',
              },
              {
                label: 'Banho Simples',
                count: stats.byService.BANHO,
                bar: 'bg-emerald-500',
              },
              {
                label: 'Tosa Higiênica',
                count: stats.byService.TOSA_HIGIENICA,
                bar: 'bg-cyan-500',
              },
              {
                label: 'Tosa Completa',
                count: stats.byService.TOSA_COMPLETA,
                bar: 'bg-indigo-500',
              },
            ].map((srv) => (
              <div key={srv.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{srv.label}</span>
                  <span className="font-bold text-slate-900">
                    {srv.count} atendimentos ({pct(srv.count)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${srv.bar} rounded-full`}
                    style={{ width: `${pct(srv.count)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Divisão por Porte */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
              Perfil por Porte do Pet
            </span>
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs text-slate-500 block">Pequeno</span>
                <span className="text-base font-extrabold text-slate-800">
                  {stats.bySize.PEQUENO}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs text-slate-500 block">Médio</span>
                <span className="text-base font-extrabold text-slate-800">
                  {stats.bySize.MEDIO}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs text-slate-500 block">Grande</span>
                <span className="text-base font-extrabold text-slate-800">
                  {stats.bySize.GRANDE}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listas Operacionais Rápidas: Pedidos de Reagendamento e Próximos Confirmados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clientes que marcaram "Não / Reagendar" */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Solicitações de Reagendamento ({stats.needsReschedule.length})
            </h3>
            <button
              onClick={onNavigateToAgenda}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              Ver agenda completa →
            </button>
          </div>

          {stats.needsReschedule.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
              🎉 Nenhum cliente pendente de reagendamento no momento!
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.needsReschedule.map((appt) => (
                <div
                  key={appt.id}
                  className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      🐾 {appt.pet?.name || 'Pet'} — {appt.customer?.name}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {appt.serviceLabel} •{' '}
                      {new Date(appt.scheduledAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {appt.customer?.phone && (
                      <a
                        href={`https://wa.me/${appt.customer.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 font-semibold hover:bg-rose-100 transition-colors"
                      >
                        <PhoneCall className="w-3 h-3" /> Combinar Novo Horário
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximos Atendimentos Confirmados */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Atendimentos Confirmados ({stats.confirmed})
            </h3>
            <button
              onClick={() => onNavigateToAgenda()}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              Gerenciar horários →
            </button>
          </div>

          {stats.upcomingConfirmed.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
              Nenhum atendimento confirmado ainda para o filtro selecionado.
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.upcomingConfirmed.map((appt) => (
                <div
                  key={appt.id}
                  className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      🐾 {appt.pet?.name || 'Pet'} ({appt.pet?.breed}) —{' '}
                      {appt.customer?.name}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {appt.serviceLabel} •{' '}
                      {new Date(appt.scheduledAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Confirmado ✅
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
