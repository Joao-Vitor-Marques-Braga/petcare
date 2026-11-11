import { useState, useEffect, useCallback } from 'react';
import { Customer, PetSize } from '../../../types';
import { api } from '../../../services/api';
import { useToast } from '../../../components/ui/Toast';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Falha ao listar tutores.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const createCustomer = async (data: {
    name: string;
    phone: string;
    email?: string | null;
    pets?: Array<{ name: string; breed: string; size: PetSize }>;
  }) => {
    const newCustomer = await api.createCustomer(data);
    showToast(`Tutor ${newCustomer.name} cadastrado com sucesso!`, 'success');
    await loadCustomers();
    return newCustomer;
  };

  const createPet = async (data: {
    name: string;
    breed: string;
    size: PetSize;
    customerId: string;
  }) => {
    await api.createPet(data);
    showToast(`Pet ${data.name} adicionado com sucesso!`, 'success');
    await loadCustomers();
  };

  const deleteCustomer = async (id: string) => {
    await api.deleteCustomer(id);
    showToast('Cliente removido com sucesso!', 'info');
    await loadCustomers();
  };

  return {
    customers,
    loading,
    reload: loadCustomers,
    createCustomer,
    createPet,
    deleteCustomer,
  };
}
