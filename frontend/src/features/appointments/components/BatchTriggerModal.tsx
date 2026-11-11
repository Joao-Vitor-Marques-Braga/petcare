import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { BatchReminderResult } from '../../../types';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExecuteBatch: (preset: 'tomorrow' | 'today') => Promise<BatchReminderResult>;
}

export const BatchTriggerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onExecuteBatch,
}) => {
  const [preset, setPreset] = useState<'tomorrow' | 'today'>('tomorrow');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BatchReminderResult | null>(null);
  const [error, setError] = useState('');

  const handleRun = async () => {
    try {
      setLoading(true);
      setError('');
      setResult(null);
      const res = await onExecuteBatch(preset);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao executar rotina em lote.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Disparo em Lote (Rotina Anti-Furo)">
      <div className="space-y-4">
        {!result ? (
          <>
            <p className="text-sm text-slate-600 leading-relaxed">
              Esta ação dispara mensagens de confirmação pelo WhatsApp para todos os agendamentos que ainda estejam com status{' '}
              <strong className="text-amber-600">Pendente</strong> ou{' '}
              <strong className="text-sky-600">Mensagem Enviada</strong> na data selecionada.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Público-Alvo da Rotina:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="radio"
                    name="batchPreset"
                    value="tomorrow"
                    checked={preset === 'tomorrow'}
                    onChange={() => setPreset('tomorrow')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Agendamentos de <strong>Amanhã</strong> (Padrão D-1)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="radio"
                    name="batchPreset"
                    value="today"
                    checked={preset === 'today'}
                    onChange={() => setPreset('today')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Agendamentos de <strong>Hoje</strong></span>
                </label>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleRun}
                disabled={loading}
                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Disparando mensagens...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Iniciar Disparo em Lote</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Rotina Concluída com Sucesso!
              </div>
              <div className="mt-2 text-xs text-emerald-700 grid grid-cols-3 gap-2">
                <div>
                  Total Alvo: <strong>{result.totalFound}</strong>
                </div>
                <div>
                  Enviados com Sucesso: <strong>{result.sentSuccess}</strong>
                </div>
                <div>
                  Falhas: <strong>{result.sentFailed}</strong>
                </div>
              </div>
            </div>

            {result.details.length > 0 && (
              <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl divide-y text-xs">
                {result.details.map((d, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">{d.customerName}</span>
                      <span className="text-slate-400 ml-2">({d.phone})</span>
                    </div>
                    <span
                      className={`font-semibold ${
                        d.status === 'SUCCESS' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {d.status === 'SUCCESS' ? 'Enviado' : 'Falha'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleClose}
                className="px-5 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
