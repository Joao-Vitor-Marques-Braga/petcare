import { useState, useEffect, useCallback } from 'react';
import { Appointment, AppointmentMetrics, AppointmentStatus } from '../../../types';
import { api } from '../../../services/api';
import { useToast } from '../../../components/ui/Toast';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [metrics, setMetrics] = useState<AppointmentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const [preset, setPreset] = useState<'today' | 'tomorrow' | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { showToast } = useToast();

  const loadData = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setMetricsLoading(true);
        }

        const params = selectedDate
          ? { date: selectedDate, status: statusFilter }
          : { preset, status: statusFilter };

        const [apptData, metricsData] = await Promise.all([
          api.getAppointments(params),
          api.getMetrics(selectedDate ? { date: selectedDate } : { preset }),
        ]);

        setAppointments(apptData);
        setMetrics(metricsData);
      } catch (err: unknown) {
        if (!silent) {
          showToast(
            err instanceof Error ? err.message : 'Falha ao carregar dados do servidor.',
            'error'
          );
        }
      } finally {
        if (!silent) {
          setLoading(false);
          setMetricsLoading(false);
        }
      }
    },
    [preset, selectedDate, statusFilter, showToast]
  );

  useEffect(() => {
    loadData(false);
    // Sincronização automática silenciosa a cada 3 segundos para refletir respostas do WhatsApp na hora
    const timer = setInterval(() => {
      loadData(true);
    }, 3000);
    return () => clearInterval(timer);
  }, [loadData]);

  // Disparo de WhatsApp individual com loading state e atualização otimista
  const sendWhatsApp = async (appointmentId: string) => {
    // Atualização otimista na UI
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId ? { ...a, status: 'MENSAGEM_ENVIADA' } : a
      )
    );

    try {
      await api.sendSingleReminder(appointmentId);
      showToast('Mensagem de confirmação enviada com sucesso!', 'success');
      // Recarrega métricas para manter sincronizado
      loadData();
    } catch (err: unknown) {
      // Reverte se falhar
      loadData();
      showToast(
        err instanceof Error ? err.message : 'Erro ao enviar mensagem WhatsApp.',
        'error'
      );
    }
  };

  const updateStatus = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      await api.updateAppointmentStatus(appointmentId, status);
      showToast(`Status atualizado para ${status}!`, 'success');
      loadData();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao atualizar status.',
        'error'
      );
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    if (!confirm('Deseja realmente excluir este agendamento?')) return;
    try {
      await api.deleteAppointment(appointmentId);
      showToast('Agendamento excluído com sucesso.', 'info');
      loadData();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao excluir agendamento.',
        'error'
      );
    }
  };

  const triggerBatch = async (batchPreset: 'tomorrow' | 'today') => {
    const result = await api.sendBatchReminders({ preset: batchPreset });
    showToast(
      `Disparo em lote finalizado: ${result.sentSuccess} enviados de ${result.totalFound}.`,
      'success'
    );
    loadData();
    return result;
  };

  const simulateWebhook = async (phone: string, reply: string) => {
    const result = await api.simulateWebhookReply({ phone, reply });
    if (result.processed) {
      showToast(
        `Webhook processado! Agendamento de ${result.customerName} atualizado para ${result.currentStatus}.`,
        'success'
      );
    } else {
      showToast(result.reason || 'Webhook processado sem alterações.', 'info');
    }
    loadData();
    return result;
  };

  return {
    appointments,
    metrics,
    loading,
    metricsLoading,
    preset,
    setPreset: (p: 'today' | 'tomorrow' | 'all') => {
      setSelectedDate('');
      setPreset(p);
    },
    selectedDate,
    setSelectedDate: (d: string) => {
      setSelectedDate(d);
    },
    statusFilter,
    setStatusFilter,
    reload: loadData,
    sendWhatsApp,
    updateStatus,
    deleteAppointment,
    triggerBatch,
    simulateWebhook,
  };
}
