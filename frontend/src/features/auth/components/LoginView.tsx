import React, { useState } from 'react';
import { AuthUser } from '../../../types';
import { api } from '../../../services/api';
import { useToast } from '../../../components/ui/Toast';
import {
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  KeyRound,
} from 'lucide-react';

interface Props {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<Props> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@petcare.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Preencha seu e-mail e senha para entrar.', 'error');
      return;
    }

    try {
      setLoading(true);
      const { user } = await api.login(email.trim(), password);
      showToast(`Bem-vindo(a), ${user.name}! (${user.companyName})`, 'success');
      onLoginSuccess(user);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'E-mail ou senha inválidos.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        {/* Lado Esquerdo - Apresentação SaaS Multi-Empresa */}
        <div className="md:col-span-6 bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
              <span className="text-lg">🐾</span>
              <span className="text-xs font-bold tracking-wide uppercase text-emerald-100">
                Plataforma SaaS Multi-PetShop
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                PetCare <span className="text-emerald-300">Anti-Furo</span>
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Sistema inteligente de agendamento, gestão de clientes, tabela de preços e confirmação automática via WhatsApp para múltiplos Pet Shops.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 bg-black/15 p-3.5 rounded-2xl border border-white/10">
                <Building2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Isolamento Total por Empresa (Multi-Tenant)
                  </h3>
                  <p className="text-[11px] text-emerald-100/80 mt-0.5">
                    Cada Pet Shop possui seu próprio login, clientes, agenda, serviços e conexão exclusiva de WhatsApp.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-black/15 p-3.5 rounded-2xl border border-white/10">
                <Sparkles className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Confirmação Direta com &ldquo;SIM&rdquo; ou &ldquo;NÃO&rdquo;
                  </h3>
                  <p className="text-[11px] text-emerald-100/80 mt-0.5">
                    O cliente responde na conversa do WhatsApp e o status do agendamento atualiza sozinho na tela.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/15 mt-6 flex items-center justify-between text-[11px] text-emerald-200/80 relative z-10">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-300" /> Ambiente Seguro & Isolado
            </span>
            <span>v2.0 SaaS Edition</span>
          </div>
        </div>

        {/* Lado Direito - Formulário de Login */}
        <div className="md:col-span-6 p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Acesso ao Painel
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                Entre na sua conta
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Acesse como Super Admin (dono do SaaS) ou com o login de um Pet Shop cadastrado.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  E-mail de Acesso
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@petshop.com.br"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    Entrar no Sistema
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Atalho rápido de credenciais Master */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> Acesso Master (Dono do Sistema):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@petcare.com');
                    setPassword('admin123');
                  }}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                >
                  Preencher automático
                </button>
              </div>
              <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-slate-400 block text-[10px]">Login Master:</span>
                  <code className="font-bold text-slate-800">admin@petcare.com</code>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Senha:</span>
                  <code className="font-bold text-slate-800">admin123</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
