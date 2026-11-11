import React, { useState, useMemo } from 'react';
import { Customer, Appointment, PetSize } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Mail,
  Plus,
  CalendarPlus,
  Trash2,
  PawPrint,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface Props {
  customers: Customer[];
  appointments: Appointment[];
  loading: boolean;
  onOpenCreateCustomer: () => void;
  onAddPet: (data: {
    name: string;
    breed: string;
    size: PetSize;
    customerId: string;
  }) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
  onScheduleForCustomer: (customerId: string) => void;
}

export const CustomersView: React.FC<Props> = ({
  customers,
  appointments,
  loading,
  onOpenCreateCustomer,
  onAddPet,
  onDeleteCustomer,
  onScheduleForCustomer,
}) => {
  const [search, setSearch] = useState('');
  const [addingPetFor, setAddingPetFor] = useState<Customer | null>(null);
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petSize, setPetSize] = useState<PetSize>('PEQUENO');
  const [savingPet, setSavingPet] = useState(false);

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone.toLowerCase().includes(q);
      const matchEmail = (c.email || '').toLowerCase().includes(q);
      const matchPets = (c.pets || []).some(
        (p) =>
          p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q)
      );
      return matchName || matchPhone || matchEmail || matchPets;
    });
  }, [customers, search]);

  const totalPets = useMemo(
    () => customers.reduce((acc, c) => acc + (c.pets?.length || 0), 0),
    [customers]
  );

  const handleAddPetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingPetFor || !petName.trim() || !petBreed.trim()) return;
    try {
      setSavingPet(true);
      await onAddPet({
        customerId: addingPetFor.id,
        name: petName.trim(),
        breed: petBreed.trim(),
        size: petSize,
      });
      setAddingPetFor(null);
      setPetName('');
      setPetBreed('');
      setPetSize('PEQUENO');
    } finally {
      setSavingPet(false);
    }
  };

  const formatPhone = (raw: string) => {
    const d = raw.replace(/\D/g, '');
    if (d.length === 13 && d.startsWith('55')) {
      return `+55 (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
    }
    if (d.length === 12 && d.startsWith('55')) {
      return `+55 (${d.slice(2, 4)}) ${d.slice(4, 8)}-${d.slice(8)}`;
    }
    if (d.length === 11) {
      return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    }
    return raw;
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo de Clientes & Pets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total de Clientes
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {customers.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tutores cadastrados na base
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pets Cadastrados
            </p>
            <p className="text-2xl font-extrabold text-teal-700 mt-1">
              {totalPets}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Média de{' '}
              {customers.length > 0
                ? (totalPets / customers.length).toFixed(1)
                : '0'}{' '}
              pet por tutor
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <PawPrint className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
              Cadastro Rápido
            </p>
            <p className="text-sm font-bold mt-1">
              Adicione novos clientes e seus pets
            </p>
            <button
              onClick={onOpenCreateCustomer}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 text-xs font-bold shadow-sm hover:bg-emerald-50 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              + Cadastrar Cliente
            </button>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-white">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Busca e Ações */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente por nome, WhatsApp, e-mail, nome do pet ou raça..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <button
          onClick={onOpenCreateCustomer}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Cadastrar Novo Cliente
        </button>
      </div>

      {/* Lista de Clientes */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-xs">Carregando clientes...</span>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Nenhum cliente encontrado
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {search
                ? 'Tente buscar com outro termo ou limpe o filtro.'
                : 'Comece cadastrando o primeiro cliente e pet do seu Pet Shop.'}
            </p>
          </div>
          <button
            onClick={onOpenCreateCustomer}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Cadastrar Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCustomers.map((customer) => {
            const customerAppts = appointments.filter(
              (a) => a.customerId === customer.id
            );
            const confirmedCount = customerAppts.filter(
              (a) => a.status === 'CONFIRMADO'
            ).length;

            return (
              <div
                key={customer.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:border-emerald-300/80 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Cabeçalho do Cliente */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center shrink-0">
                        {customer.name
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {customer.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {formatPhone(customer.phone)}
                          </span>
                          {customer.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {customer.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Abrir conversa no WhatsApp"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Deseja realmente remover o cliente ${customer.name}?`
                            )
                          ) {
                            onDeleteCustomer(customer.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Excluir cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lista de Pets do Cliente */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <PawPrint className="w-3 h-3 text-teal-600" /> Pets do
                        Cliente ({customer.pets?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => setAddingPetFor(customer)}
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> Adicionar Pet
                      </button>
                    </div>

                    {!customer.pets || customer.pets.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        Nenhum pet cadastrado ainda.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {customer.pets.map((pet) => (
                          <div
                            key={pet.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                          >
                            <span className="font-bold text-slate-800">
                              🐾 {pet.name}
                            </span>
                            <span className="text-slate-500">{pet.breed}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold text-[10px]">
                              {pet.size === 'PEQUENO'
                                ? 'Pequeno'
                                : pet.size === 'MEDIO'
                                ? 'Médio'
                                : 'Grande'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Rodapé do Card */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {customerAppts.length}
                    </span>{' '}
                    atendimento(s) •{' '}
                    <span className="text-emerald-600 font-semibold">
                      {confirmedCount} confirmado(s)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onScheduleForCustomer(customer.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-emerald-600" />
                    Agendar Atendimento
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Adicionar Novo Pet a um Cliente Existente */}
      <Modal
        isOpen={!!addingPetFor}
        onClose={() => setAddingPetFor(null)}
        title={`🐾 Novo Pet para ${addingPetFor?.name || ''}`}
      >
        <form onSubmit={handleAddPetSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome do Pet
            </label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Ex: Luna, Rex..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Raça
            </label>
            <input
              type="text"
              value={petBreed}
              onChange={(e) => setPetBreed(e.target.value)}
              placeholder="Ex: Poodle, SRD, Golden..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Porte do Pet
            </label>
            <div className="flex gap-4">
              {(['PEQUENO', 'MEDIO', 'GRANDE'] as PetSize[]).map((size) => (
                <label
                  key={size}
                  className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700"
                >
                  <input
                    type="radio"
                    name="addPetSize"
                    value={size}
                    checked={petSize === size}
                    onChange={() => setPetSize(size)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    {size === 'PEQUENO'
                      ? 'Pequeno'
                      : size === 'MEDIO'
                      ? 'Médio'
                      : 'Grande'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddingPetFor(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingPet}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5"
            >
              {savingPet && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Salvar Pet
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
