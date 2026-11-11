import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { PetSize } from '../../../types';
import { Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    phone: string;
    email?: string | null;
    pets?: Array<{ name: string; breed: string; size: PetSize }>;
  }) => Promise<void>;
}

export const CreateCustomerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Pet inicial
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petSize, setPetSize] = useState<PetSize>('PEQUENO');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Nome e telefone com DDD são obrigatórios.');
      return;
    }
    if (!petName.trim() || !petBreed.trim()) {
      setError('Cadastre ao menos o primeiro pet do tutor.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        pets: [
          {
            name: petName.trim(),
            breed: petBreed.trim(),
            size: petSize,
          },
        ],
      });

      onClose();
      // Reset
      setName('');
      setPhone('');
      setEmail('');
      setPetName('');
      setPetBreed('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao cadastrar tutor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Novo Tutor & Pet">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Dados do Tutor / Cliente
          </h4>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ana Clara Santos"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp com DDD
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="11999998888"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail (opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ana@email.com"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pet Inicial
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Pet</label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Ex: Thor"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Raça</label>
              <input
                type="text"
                value={petBreed}
                onChange={(e) => setPetBreed(e.target.value)}
                placeholder="Ex: Shih Tzu, Golden..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Porte do Pet</label>
            <div className="flex gap-4">
              {(['PEQUENO', 'MEDIO', 'GRANDE'] as PetSize[]).map((size) => (
                <label key={size} className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="radio"
                    name="petSize"
                    value={size}
                    checked={petSize === size}
                    onChange={() => setPetSize(size)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{size === 'PEQUENO' ? 'Pequeno' : size === 'MEDIO' ? 'Médio' : 'Grande'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Cadastrar Tutor & Pet
          </button>
        </div>
      </form>
    </Modal>
  );
};
