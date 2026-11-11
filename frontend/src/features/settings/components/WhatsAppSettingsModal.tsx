import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import {
  WhatsAppConfig,
  WhatsAppConnectionStatus,
  WhatsAppQrCodeResponse,
} from '../../../types';
import { api } from '../../../services/api';
import { useToast } from '../../../components/ui/Toast';
import {
  Smartphone,
  Radio,
  Send,
  Loader2,
  RefreshCw,
  Sliders,
  QrCode,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const WhatsAppSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<WhatsAppConfig>({
    id: 'default',
    apiUrl: 'http://localhost:8080',
    apiKey: '',
    instanceName: 'petshop_bot',
    senderPhone: '5511999998888',
    isMockMode: true,
  });

  const [status, setStatus] = useState<WhatsAppConnectionStatus | null>(null);
  const [qrData, setQrData] = useState<WhatsAppQrCodeResponse | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Teste de Disparo
  const [testPhone, setTestPhone] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setQrData(null);
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [cfg, st] = await Promise.all([
        api.getWhatsAppConfig(),
        api.getWhatsAppStatus(),
      ]);
      setConfig(cfg);
      setStatus(st);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao carregar configurações.',
        'error'
      );
    }
  };

  const handleRefreshStatus = async () => {
    try {
      setCheckingStatus(true);
      const st = await api.getWhatsAppStatus();
      setStatus(st);
      if (st.connected) {
        setQrData(null);
      }
      showToast('Status da conexão atualizado com sucesso!', 'info');
    } catch {
      showToast('Erro ao consultar status da conexão.', 'error');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleGenerateQrCode = async () => {
    try {
      setLoadingQr(true);
      // Garante que o modo Real está salvo antes de gerar QR Code
      if (config.isMockMode) {
        const updated = await api.updateWhatsAppConfig({
          ...config,
          isMockMode: false,
        });
        setConfig(updated);
      }
      const res = await api.getWhatsAppQrCode();
      setQrData(res);
      if (res.connected) {
        showToast('Este WhatsApp já está conectado e pronto para uso!', 'success');
        await handleRefreshStatus();
      } else if (res.base64) {
        showToast('QR Code gerado! Escaneie com o WhatsApp do Pet Shop.', 'info');
      } else {
        showToast(res.message || 'Aguarde alguns segundos e tente novamente.', 'info');
      }
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao gerar QR Code.',
        'error'
      );
    } finally {
      setLoadingQr(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.updateWhatsAppConfig(config);
      setConfig(updated);
      showToast('Configurações do WhatsApp salvas com sucesso!', 'success');
      await handleRefreshStatus();
      if (onConfigSaved) onConfigSaved();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Falha ao salvar configurações.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone.trim()) {
      showToast('Informe o número de WhatsApp para teste com DDD.', 'error');
      return;
    }
    try {
      setSendingTest(true);
      const res = await api.sendTestMessage({ phone: testPhone });
      if (res.success) {
        showToast(
          res.mode === 'MOCK'
            ? 'Mensagem de teste simulada com sucesso no console!'
            : 'Mensagem de teste enviada com sucesso para o WhatsApp!',
          'success'
        );
      } else {
        showToast(`Falha no envio: ${res.error || 'Erro desconhecido'}`, 'error');
      }
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao enviar mensagem de teste.',
        'error'
      );
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚙️ Conexão de WhatsApp deste Pet Shop"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5 text-xs">
        {/* Status Card */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            config.isMockMode
              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
              : status?.connected
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm ${
                  config.isMockMode
                    ? 'bg-amber-500'
                    : status?.connected
                    ? 'bg-emerald-600'
                    : 'bg-rose-500'
                }`}
              >
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm block">
                  {config.isMockMode
                    ? 'Modo Simulação Ativo (Mock Seguro)'
                    : status?.connected
                    ? 'WhatsApp Conectado (Evolution API)'
                    : 'WhatsApp Desconectado'}
                </span>
                <span className="text-[11px] opacity-80">
                  {config.isMockMode
                    ? 'Simula disparos sem gastar mensagens reais'
                    : status?.message || 'Clique em Conectar via QR Code abaixo'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleGenerateQrCode}
                disabled={loadingQr}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all disabled:opacity-50"
              >
                {loadingQr ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <QrCode className="w-3.5 h-3.5" />
                )}
                Conectar QR Code
              </button>

              <button
                type="button"
                onClick={handleRefreshStatus}
                disabled={checkingStatus}
                className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 shadow-sm transition-all"
                title="Recarregar status"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`}
                />
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-black/5 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="opacity-70">Número Remetente:</span>{' '}
              <strong>{config.senderPhone || 'Não configurado'}</strong>
            </div>
            <div>
              <span className="opacity-70">Instância Exclusiva:</span>{' '}
              <strong>{config.instanceName}</strong>
            </div>
          </div>
        </div>

        {/* Exibição do QR Code direto na tela */}
        {qrData && !qrData.connected && qrData.base64 && (
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col items-center text-center space-y-3 border border-slate-800">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Conexão Instantânea
              </span>
              <h4 className="text-sm font-bold">
                Escaneie o QR Code com o WhatsApp do Pet Shop
              </h4>
              <p className="text-[11px] text-slate-300">
                Abra o WhatsApp no celular &rarr; Aparelhos Conectados &rarr; Conectar Aparelho
              </p>
            </div>

            <div className="bg-white p-3 rounded-2xl shadow-lg">
              <img
                src={qrData.base64}
                alt="QR Code WhatsApp"
                className="w-48 h-48 object-contain"
              />
            </div>

            <button
              type="button"
              onClick={handleRefreshStatus}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Já escaneei! Verificar Conexão
            </button>
          </div>
        )}

        {/* Formulário Principal */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Seletor de Modo */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-500" /> Modo de Operação desta Empresa:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfig({ ...config, isMockMode: true })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  config.isMockMode
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Simulação / Testes
                </div>
                <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                  Gera logs no console sem conectar chip
                </p>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, isMockMode: false })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  !config.isMockMode
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Disparo Real (Evolution API)
                </div>
                <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                  Envia mensagens reais via WhatsApp
                </p>
              </button>
            </div>
          </div>

          {/* Dados do Remetente */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Dados de Conexão do Bot
            </h4>

            {/* Número Remetente */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Número do WhatsApp Remetente (Número do Pet Shop)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={config.senderPhone || ''}
                  onChange={(e) =>
                    setConfig({ ...config, senderPhone: e.target.value })
                  }
                  placeholder="Ex: 5511999998888 (DDI + DDD + Número)"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Nome da Instância */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome da Instância (Evolution API)
                </label>
                <input
                  type="text"
                  value={config.instanceName}
                  onChange={(e) =>
                    setConfig({ ...config, instanceName: e.target.value })
                  }
                  placeholder="petshop_bot"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  API Key da Evolution API
                </label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) =>
                    setConfig({ ...config, apiKey: e.target.value })
                  }
                  placeholder="Chave secreta de autenticação"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* URL da API */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                URL da Evolution API
              </label>
              <input
                type="url"
                value={config.apiUrl}
                onChange={(e) =>
                  setConfig({ ...config, apiUrl: e.target.value })
                }
                placeholder="http://evolution:8080"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Salvar Configurações
            </button>
          </div>
        </form>

        {/* Seção de Teste de Disparo Imediato */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-emerald-600" /> Testar Disparo no Celular Agora
          </h4>
          <p className="text-[11px] text-slate-500">
            Digite um número de WhatsApp com DDD para testar o envio a partir desta empresa:
          </p>

          <div className="flex gap-2">
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="Ex: 5511999998888"
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleSendTest}
              disabled={sendingTest || !testPhone.trim()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-all"
            >
              {sendingTest ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Disparar Teste
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
