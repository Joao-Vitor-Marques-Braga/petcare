import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Customer } from '../../../types';
import { Bot, CheckCircle2, XCircle, Send, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onSimulate: (phone: string, reply: string) => Promise<any>;
}

export const WebhookSimulatorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  customers,
  onSimulate,
}) => {
  const [selectedPhone, setSelectedPhone] = useState('');
  const [replyText, setReplyText] = useState('1');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);

  const handleSimulate = async (customOption?: string) => {
    const textToSend = customOption || replyText;
    if (!selectedPhone) return;

    try {
      setLoading(true);
      setFeedback(null);
      const res = await onSimulate(selectedPhone, textToSend);
      setFeedback(res);
    } catch (err: unknown) {
      setFeedback({
        error: err instanceof Error ? err.message : 'Erro ao disparar webhook simulado',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧪 Simulador de Webhook WhatsApp (n8n / Evolution)">
      <div className="space-y-4">
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-950 mb-1">
            <Bot className="w-4 h-4 text-indigo-600" /> Como funciona este simulador?
          </div>
          Ele envia um payload de mensagem recebida exatamente no padrão da <strong>Evolution API / n8n</strong> para o endpoint <code>/api/webhooks/whatsapp</code>, testando o fluxo Anti-Furo em tempo real.
        </div>

        {/* Selecionar Tutor / Número */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Selecione o Cliente / Tutor que está respondendo:
          </label>
          <select
            value={selectedPhone}
            onChange={(e) => setSelectedPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="">Selecione o cliente...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.phone}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </div>

        {/* Atalhos Rápidos de Enquete (Sim e Não) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Simular Clique do Cliente na Enquete do WhatsApp:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!selectedPhone || loading}
              onClick={() => handleSimulate('✅ Sim, confirmo presença')}
              className="p-3 border-2 border-emerald-500/30 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                [x] Sim, confirmo
              </div>
              <div className="text-[11px] text-emerald-700 mt-1">
                Marca presença automaticamente
              </div>
            </button>

            <button
              type="button"
              disabled={!selectedPhone || loading}
              onClick={() => handleSimulate('❌ Não, preciso reagendar')}
              className="p-3 border-2 border-rose-500/30 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50 rounded-xl text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                <XCircle className="w-4 h-4 text-rose-600" />
                [x] Não, reagendar
              </div>
              <div className="text-[11px] text-rose-700 mt-1">
                Libera o horário para reagendamento
              </div>
            </button>
          </div>
        </div>

        {/* Resposta personalizada */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Ou digite outro texto livre (ex: "sim", "confirmo", "cancelar"):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Digite o texto da mensagem..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
            />
            <button
              type="button"
              disabled={!selectedPhone || !replyText.trim() || loading}
              onClick={() => handleSimulate()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="p-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            Processando webhook no backend...
          </div>
        )}

        {/* Retorno do Webhook */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs border ${
              feedback.error || feedback.processed === false
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {feedback.error ? (
              <div>❌ {feedback.error}</div>
            ) : feedback.processed ? (
              <div>
                <p className="font-semibold mb-1">✅ Webhook processado com sucesso!</p>
                <p>
                  Tutor: <strong>{feedback.customerName}</strong> (Pet: <strong>{feedback.petName}</strong>)
                </p>
                <p>
                  Status Atualizado:{' '}
                  <span className="font-bold underline">{feedback.currentStatus}</span> (Intenção: {feedback.intent})
                </p>
              </div>
            ) : (
              <div>
                ⚠️ {feedback.reason || 'Webhook recebido, mas nenhum agendamento foi afetado.'}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
