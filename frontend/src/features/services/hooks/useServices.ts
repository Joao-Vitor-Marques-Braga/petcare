import { useState, useEffect, useCallback } from 'react';
import { ServiceItem } from '../../../types';
import { api } from '../../../services/api';
import { useToast } from '../../../components/ui/Toast';

export function useServices() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getServices();
      setServices(data);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao carregar catálogo de serviços',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const createService = async (data: {
    name: string;
    description?: string | null;
    price: number;
    durationMinutes?: number;
    category?: string;
    active?: boolean;
  }) => {
    const created = await api.createService(data);
    showToast(`Serviço "${created.name}" cadastrado com sucesso!`, 'success');
    await loadServices();
    return created;
  };

  const updateService = async (
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      price: number;
      durationMinutes: number;
      category: string;
      active: boolean;
    }>
  ) => {
    const updated = await api.updateService(id, data);
    showToast(`Serviço "${updated.name}" atualizado!`, 'success');
    await loadServices();
    return updated;
  };

  const deleteService = async (id: string) => {
    await api.deleteService(id);
    showToast('Serviço removido do catálogo.', 'info');
    await loadServices();
  };

  return {
    services,
    loading,
    reload: loadServices,
    createService,
    updateService,
    deleteService,
  };
}
