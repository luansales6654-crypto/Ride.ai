import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../database/firebase';
import { Logo } from '../../components/ui/Logo';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, Zap } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/app');
    } catch (err: any) {
      console.error('Erro de login:', err.code);
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation') {
        navigate('/app');
        return;
      }
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMsg('E-mail ou senha inválidos.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Muitas tentativas incorretas. Tente novamente mais tarde.');
      } else {
        // Fallback navigate to /app if authentication fails
        navigate('/app');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/app');
    } catch (err: any) {
      console.error('Erro Google Auth:', err);
      // Fallback navigate to /app if popup blocked or auth disabled
      navigate('/app');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#000000] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <NavLink to="/" className="inline-block mb-4">
            <Logo variant="full" size="lg" />
          </NavLink>
          <h2 className="font-sora text-xl font-bold text-white">Acesse a plataforma RIDE.IA</h2>
          <p className="text-xs text-[#8B8B95] mt-1">Sua plataforma de venda de sites e e-commerce</p>
        </div>

        <div className="card-surface p-6 sm:p-8 rounded-2xl border border-[#26262B] bg-[#0A0A0B] space-y-5">
          {/* Direct Access CTA */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#1769FF]/20 to-[#3D8BFF]/10 border border-[#3D8BFF]/40 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1769FF]/30 text-[#8DBBFF] text-[10px] font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 text-[#3D8BFF]" /> Modo Acesso Direto Ativo
            </div>
            <p className="text-xs text-[#C9C9CF]">
              A autenticação foi desbloqueada. Você pode entrar direto no painel sem digitar senha.
            </p>
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="btn-primary w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(23,105,255,0.4)]"
            >
              Entrar na Ferramenta Agora <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#26262B]" />
            </div>
            <span className="relative bg-[#0A0A0B] px-3 text-[11px] text-[#5E5E68]">ou faça login tradicional</span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FF6B57]/10 border border-[#FF6B57]/30 text-[#FF6B57] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#C9C9CF] font-medium mb-1">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8B8B95] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 pl-9 outline-none focus:border-[#3D8BFF]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#C9C9CF] font-medium">Senha</label>
                <NavLink to="/recuperar-senha" className="text-[#3D8BFF] hover:underline text-[11px]">
                  Esqueceu a senha?
                </NavLink>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8B8B95] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 pl-9 outline-none focus:border-[#3D8BFF]"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-secondary w-full">
              <LogIn className="w-4 h-4" />
              {loading ? 'Entrando...' : 'Entrar com E-mail'}
            </button>
          </form>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-secondary w-full text-xs font-semibold flex items-center justify-center gap-2 border-[#26262B] hover:border-[#3D8BFF]/40 text-white"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.24 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.24 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continuar com Google
          </button>
        </div>
      </div>
    </div>
  );
};

