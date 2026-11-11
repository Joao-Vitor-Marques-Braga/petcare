import React from 'react';
import { AppointmentStatus } from '../../../types';
import { CheckCircle2, Clock, Send, XCircle } from 'lucide-react';

interface Props {
  status: AppointmentStatus;
}

export const AppointmentStatusBadge: React.FC<Props> = ({ status }) => {
  switch (status) {
    case 'PENDENTE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          Pendente
        </span>
      );

    case 'MENSAGEM_ENVIADA':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
          <Send className="w-3.5 h-3.5 text-sky-500" />
          Mensagem Enviada
        </span>
      );

    case 'CONFIRMADO':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Confirmado
        </span>
      );

    case 'CANCELADO_REAGENDAR':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          Cancelar / Reagendar
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
};
