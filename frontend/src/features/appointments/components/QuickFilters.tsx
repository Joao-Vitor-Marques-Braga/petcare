import React from 'react';
import { Calendar, Filter } from 'lucide-react';

interface Props {
  preset: 'today' | 'tomorrow' | 'all';
  onPresetChange: (preset: 'today' | 'tomorrow' | 'all') => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export const QuickFilters: React.FC<Props> = ({
  preset,
  onPresetChange,
  selectedDate,
  onDateChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
      {/* Botões de atalho rápido */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
        <button
          onClick={() => onPresetChange('today')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            preset === 'today'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          Hoje
        </button>
        <button
          onClick={() => onPresetChange('tomorrow')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            preset === 'tomorrow'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          Amanhã
        </button>
        <button
          onClick={() => onPresetChange('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            preset === 'all'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          Todos
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Seletor de Data customizada */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent border-none text-slate-700 focus:outline-none font-medium cursor-pointer"
          />
        </div>

        {/* Filtro por Status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-transparent border-none text-slate-700 focus:outline-none font-medium cursor-pointer pr-1"
          >
            <option value="ALL">Todos os status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="MENSAGEM_ENVIADA">Mensagem Enviada</option>
            <option value="CONFIRMADO">Confirmados</option>
            <option value="CANCELADO_REAGENDAR">Cancelar/Reagendar</option>
          </select>
        </div>
      </div>
    </div>
  );
};
