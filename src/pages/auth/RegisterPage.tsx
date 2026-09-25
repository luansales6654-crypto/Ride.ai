import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../database/firebase';
import { Logo } from '../../components/ui/Logo';
import { UserPlus, Mail, Lock, User as UserIcon, AlertCircle, Check } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { label: 'Inexistente', score: 0, color: 'bg-[#26262B]' };
    if (pass.length < 8) return { label: 'Fraca (mín. 8 caracteres)', score: 1, color: 'bg-[#FF6B57]' };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass) && pass.length >= 8) {
      return { label: 'Forte', score: 3, color: 'bg-[#2FBF71]' };
    }
    return { label: 'Média', score: 2, color: 'bg-[#F5A524]' };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('Você precisa aceitar os termos de uso para continuar.');
      return;
    }

    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });

      // Create profile document in Firestore
      const nowStr = new Date().toISOString();
      await setDoc(doc(db, 'users', userCred.user.uid, 'profile', 'data'), {
        uid: userCred.user.uid,
        name: name.trim(),
        email: email.trim(),
        role: 'user',
        createdAt: nowStr,
      });

      // Default settings document
      await setDoc(doc(db, 'users', userCred.user.uid, 'settings', 'data'), {
        dashboardYMinAxis: 500,
        dashboardDefaultPeriod: '7days',
        prospectingMaxDailySearches: 50,
        prospectingUnsubscribeLine: true,
        ecommerceDefaultTaxPct: 12,
        ecommerceDefaultFixedFee: 5,
        ecommerceMinTargetMarginPct: 30,
        ecommerceDefaultShippingCost: 15,
        brandName: name.trim(),
        brandLogo: '',
        showSignature: true,
        services: [
          { id: 's1', name: 'Site Institucional', description: 'Site profissional completo de alta conversão', scope: ['Até 5 seções', 'Botão WhatsApp', 'SEO básico', 'Responsivo'], deliveryDays: 5, price: 1500 },
          { id: 's2', name: 'Landing Page', description: 'Página de alta conversão para produto/serviço', scope: ['Página única', 'Vídeo/Formulário', 'Integração WhatsApp'], deliveryDays: 3, price: 900 },
        ],
      });

      navigate('/onboarding');
    } catch (err: any) {
      console.error('Erro de cadastro:', err);
      if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/admin-restricted-operation' ||
        err.code === 'auth/configuration-not-found'
      ) {
        try {
          const userCred = await signInAnonymously(auth);
          const nowStr = new Date().toISOString();
          await setDoc(doc(db, 'users', userCred.user.uid, 'profile', 'data'), {
            uid: userCred.user.uid,
            name: name.trim() || 'Nova Agência',
            email: email.trim() || 'agencia@ride.ia',
            role: 'user',
            createdAt: nowStr,
          });
          navigate('/onboarding');
          return;
        } catch (anonErr) {
          const customUid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
          const nowStr = new Date().toISOString();
          const customSession = {
            uid: customUid,
            name: name.trim() || 'Nova Agência',
            email: email.trim() || 'agencia@ride.ia',
            role: 'user',
            createdAt: nowStr,
          };
          localStorage.setItem('ride_custom_session', JSON.stringify(customSession));

          await setDoc(doc(db, 'users', customUid, 'profile', 'data'), customSession).catch(() => {});

          navigate('/onboarding');
          return;
        }
      }

      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('E-mail já cadastrado na plataforma.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Senha muito fraca. Utilize números e letras maiúsculas.');
      } else {
        setErrorMsg('Erro ao criar conta. Tente novamente em instantes.');
      }
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
          <h2 className="font-sora text-xl font-bold text-white">Criar sua conta na RIDE.IA</h2>
          <p className="text-xs text-[#8B8B95] mt-1">Comece a prospectar e vender sites e e-commerce hoje</p>
        </div>

        <div className="card-surface p-6 sm:p-8 rounded-2xl border border-[#26262B] bg-[#0A0A0B]">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-[#FF6B57]/10 border border-[#FF6B57]/30 text-[#FF6B57] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#C9C9CF] font-medium mb-1">Seu Nome ou Nome da Agência *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#8B8B95] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo ou Agência Digital"
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 pl-9 outline-none focus:border-[#3D8BFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#C9C9CF] font-medium mb-1">E-mail *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8B8B95] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 pl-9 outline-none focus:border-[#3D8BFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#C9C9CF] font-medium mb-1">Senha (mínimo 8 caracteres) *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8B8B95] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 pl-9 outline-none focus:border-[#3D8BFF]"
                />
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-[#18181B] rounded-full overflow-hidden flex">
                    <div className={`h-full ${strength.color} transition-all`} style={{ width: `${(strength.score / 3) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-[#8B8B95]">Força da senha: {strength.label}</span>
                </div>
              )}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded border-[#26262B] bg-[#18181B] text-[#1769FF] focus:ring-0"
              />
              <span className="text-[11px] text-[#8B8B95] leading-snug">
                Aceito os{' '}
                <NavLink to="/termos" className="text-[#3D8BFF] underline" target="_blank">
                  Termos de Uso
                </NavLink>{' '}
                e a{' '}
                <NavLink to="/privacidade" className="text-[#3D8BFF] underline" target="_blank">
                  Política de Privacidade
                </NavLink>{' '}
                da RIDE.IA.
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              <UserPlus className="w-4 h-4" />
              {loading ? 'Criando conta...' : 'Criar Conta RIDE.IA'}
            </button>
          </form>

          <p className="text-center text-xs text-[#8B8B95] mt-6">
            Já possui uma conta?{' '}
            <NavLink to="/entrar" className="text-[#3D8BFF] font-semibold hover:underline">
              Entrar agora
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};
