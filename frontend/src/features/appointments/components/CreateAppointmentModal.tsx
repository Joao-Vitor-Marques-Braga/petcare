import React, { useState, useEffect } from 'react';
import { Customer, Pet, AppointmentService, ServiceItem } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { PlusCircle, Loader2, Scissors } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  services: ServiceItem[];
  initialCustomerId?: string;
  onOpenCreateCustomer: () => void;
  onOpenServicesTab?: () => void;
  onSubmit: (data: {
    scheduledAt: string;
    service: AppointmentService;
    serviceName?: string;
    servicePrice?: number;
    customerId: string;
    petId: string;
    notes?: string;
  }) => Promise<void>;
}

export const CreateAppointmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  customers,
  services,
  initialCustomerId,
  onOpenCreateCustomer,
  onOpenServicesTab,
  onSubmit,
}) => {
  const activeServices = services.filter((s) => s.active);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [service, setService] = useState<AppointmentService>('BANHO');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Define data padrão de hoje e cliente pré-selecionado
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setError('');
      if (activeServices.length > 0 && !activeServices.some((s) => s.code === service)) {
        setService(activeServices[0].code);
      }
      if (initialCustomerId) {
        setSelectedCustomerId(initialCustomerId);
        const cust = customers.find((c) => c.id === initialCustomerId);
        if (cust?.pets && cust.pets.length > 0) {
          setSelectedPetId(cust.pets[0].id);
        }
      }
    }
  }, [isOpen, initialCustomerId, customers]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const availablePets: Pet[] = selectedCustomer?.pets || [];
  const selectedServiceItem = activeServices.find((s) => s.code === service);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Por favor, selecione um tutor.');
      return;
    }
    if (!selectedPetId) {
      setError('Por favor, selecione um pet.');
      return;
    }
    if (!date || !time) {
      setError('Por favor, informe a data e horário.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const combinedDateTime = new Date(`${date}T${time}:00`);

      await onSubmit({
        scheduledAt: combinedDateTime.toISOString(),
        service,
        serviceName: selectedServiceItem?.name,
        servicePrice: selectedServiceItem?.price,
        customerId: selectedCustomerId,
        petId: selectedPetId,
        notes: notes.trim() || undefined,
      });

      onClose();
      // Reset
      setSelectedCustomerId('');
      setSelectedPetId('');
      setNotes('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar agendamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Agendamento Pet Shop">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Tutor Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Tutor / Cliente</label>
            <button
              type="button"
              onClick={onOpenCreateCustomer}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> + Novo Tutor
            </button>
          </div>
          <select
            value={selectedCustomerId}
            onChange={(e) => {
              setSelectedCustomerId(e.target.value);
              setSelectedPetId('');
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            required
          >
            <option value="">Selecione o tutor...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </div>

        {/* Pet Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pet</label>
          <select
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            disabled={!selectedCustomerId || availablePets.length === 0}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
            required
          >
            <option value="">
              {!selectedCustomerId
                ? 'Primeiro selecione o tutor acima'
                : availablePets.length === 0
                ? 'Nenhum pet cadastrado para este tutor'
                : 'Selecione o pet...'}
            </option>
            {availablePets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.breed} - Porte: {p.size})
              </option>
            ))}
          </select>
        </div>

        {/* Serviço */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Serviço & Valor</label>
            {onOpenServicesTab && (
              <button
                type="button"
                onClick={onOpenServicesTab}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
              >
                <Scissors className="w-3.5 h-3.5" /> Gerenciar Serviços/Preços
              </button>
            )}
          </div>
          <select
            value={service}
            onChange={(e) => setService(e.target.value as AppointmentService)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          >
            {activeServices.length > 0 ? (
              activeServices.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.name} — R$ {s.price.toFixed(2).replace('.', ',')} ({s.durationMinutes} min)
                </option>
              ))
            ) : (
              <>
                <option value="BANHO">Banho — R$ 55,00</option>
                <option value="TOSA_HIGIENICA">Tosa Higiênica — R$ 45,00</option>
                <option value="TOSA_COMPLETA">Tosa Completa — R$ 75,00</option>
                <option value="BANHO_E_TOSA">Banho e Tosa Completa — R$ 95,00</option>
              </>
            )}
          </select>
        </div>

        {/* Data e Horário */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Horário</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              required
            />
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Observações / Cuidados Especiais (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Ex: Alérgico a perfume, tosa na tesoura..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirmar Agendamento
          </button>
        </div>
      </form>
    </Modal>
  );
};
