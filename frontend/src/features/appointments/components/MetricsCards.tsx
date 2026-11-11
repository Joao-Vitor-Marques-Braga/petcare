import React from 'react';
import { AppointmentMetrics } from '../../../types';
import { Calendar, CheckCircle2, Clock, Send, AlertTriangle } from 'lucide-react';

interface Props {
  metrics: AppointmentMetrics | null;
  loading: boolean;
}

export const MetricsCards: React.FC<Props> = ({ metrics, loading }) => {
  const cards = [
    {
      label: 'Total Agendamentos',
      value: metrics?.total ?? 0,
      icon: Calendar,
      color: 'text-slate-700',
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-slate-100 text-slate-700',
    },
    {
      label: 'Confirmados (Anti-Furo)',
      value: metrics?.confirmed ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-500 text-white',
    },
    {
      label: 'Aguardando Resposta',
      value: metrics?.sent ?? 0,
      icon: Send,
      color: 'text-sky-700',
      bg: 'bg-sky-50/50',
      border: 'border-sky-200',
      iconBg: 'bg-sky-500 text-white',
    },
    {
      label: 'Pendentes de Disparo',
      value: metrics?.pending ?? 0,
      icon: Clock,
      color: 'text-amber-700',
      bg: 'bg-amber-50/50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-500 text-white',
    },
    {
      label: 'Reagendamentos / Cancel.',
      value: metrics?.cancelled ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-700',
      bg: 'bg-rose-50/50',
      border: 'border-rose-200',
      iconBg: 'bg-rose-500 text-white',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border shadow-sm ${card.bg} ${card.border} transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? (
                <div className="h-8 w-14 bg-slate-200/60 rounded animate-pulse" />
              ) : (
                <span className={`text-2xl font-bold tracking-tight ${card.color}`}>
                  {card.value}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
