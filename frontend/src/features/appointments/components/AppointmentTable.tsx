import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '../../../types';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import {
  MessageCircle,
  Clock,
  Trash2,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown,
} from 'lucide-react';

interface Props {
  appointments: Appointment[];
  loading: boolean;
  onSendWhatsApp: (appointmentId: string) => Promise<void>;
  onUpdateStatus: (appointmentId: string, status: AppointmentStatus) => Promise<void>;
  onDelete: (appointmentId: string) => Promise<void>;
}

export const AppointmentTable: React.FC<Props> = ({
  appointments,
  loading,
  onSendWhatsApp,
  onUpdateStatus,
  onDelete,
}) => {
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleSend = async (id: string) => {
    try {
      setSendingId(id);
      await onSendWhatsApp(id);
    } finally {
      setSendingId(null);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getPetSizeBadge = (size?: string) => {
    switch (size) {
      case 'PEQUENO':
        return <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">Pequeno</span>;
      case 'MEDIO':
        return <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">Médio</span>;
      case 'GRANDE':
        return <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">Grande</span>;
      default:
        return null;
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm font-medium">Carregando agendamentos...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-800">Nenhum agendamento encontrado</h4>
        <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
          Não há agendamentos para o filtro selecionado. Cadastre um novo agendamento ou altere a data.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="px-5 py-3.5">Horário / Data</th>
              <th className="px-5 py-3.5">Pet</th>
              <th className="px-5 py-3.5">Tutor / Contato</th>
              <th className="px-5 py-3.5">Serviço</th>
              <th className="px-5 py-3.5">Status Anti-Furo</th>
              <th className="px-5 py-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map((appt) => {
              const isSending = sendingId === appt.id;
              const phoneOnlyDigits = appt.customer?.phone?.replace(/\D/g, '') || '';
              const whatsappUrl = phoneOnlyDigits ? `https://wa.me/${phoneOnlyDigits}` : '#';

              return (
                <tr
                  key={appt.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Horário */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 text-base">
                      {formatTime(appt.scheduledAt)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatDate(appt.scheduledAt)}
                    </div>
                  </td>

                  {/* Pet */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {appt.pet?.name || 'Pet'}
                      </span>
                      {getPetSizeBadge(appt.pet?.size)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {appt.pet?.breed || 'Sem raça'}
                    </div>
                  </td>

                  {/* Tutor */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-800">
                      {appt.customer?.name || 'Cliente'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span>{appt.customer?.phone}</span>
                      {phoneOnlyDigits && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Abrir no WhatsApp Web"
                          className="text-emerald-600 hover:text-emerald-700 inline-flex items-center"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Serviço */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                        {appt.serviceLabel || appt.service}
                      </span>
                      {typeof appt.servicePrice === 'number' && appt.servicePrice > 0 && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold">
                          R$ {appt.servicePrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                    {appt.notes && (
                      <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] truncate" title={appt.notes}>
                        Obs: {appt.notes}
                      </p>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <AppointmentStatusBadge status={appt.status} />
                    {appt.lastReminderSent && (
                      <div className="text-[10px] text-slate-400 mt-1">
                        Disparo: {new Date(appt.lastReminderSent).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Botão de Disparo WhatsApp */}
                      <button
                        onClick={() => handleSend(appt.id)}
                        disabled={isSending}
                        title="Disparar mensagem de confirmação com resposta rápida via WhatsApp"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 disabled:opacity-50"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </>
                        )}
                      </button>

                      {/* Dropdown de Status Manual */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === appt.id ? null : appt.id)
                          }
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          title="Alterar status manualmente"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {activeMenuId === appt.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 text-xs text-left animate-fadeIn">
                            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              Alterar Status
                            </div>
                            <button
                              onClick={() => {
                                onUpdateStatus(appt.id, 'CONFIRMADO');
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                            >
                              <Check className="w-3.5 h-3.5" /> Confirmado
                            </button>
                            <button
                              onClick={() => {
                                onUpdateStatus(appt.id, 'CANCELADO_REAGENDAR');
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                            >
                              <AlertCircle className="w-3.5 h-3.5" /> Reagendar / Canc.
                            </button>
                            <button
                              onClick={() => {
                                onUpdateStatus(appt.id, 'PENDENTE');
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                            >
                              <Clock className="w-3.5 h-3.5" /> Pendente
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              onClick={() => {
                                onDelete(appt.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
