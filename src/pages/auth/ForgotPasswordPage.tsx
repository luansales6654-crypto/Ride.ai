import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../database/firebase';
import { Logo } from '../../components/ui/Logo';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err);
      setErrorMsg('Não foi possível enviar o e-mail. Verifique o endereço digitado.');
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
          <h2 className="font-sora text-xl font-bold text-white">Recuperação de Senha</h2>
          <p className="text-xs text-[#8B8B95] mt-1">Enviaremos um link de redefinição para seu e-mail</p>
        </div>

        <div className="card-surface p-6 sm:p-8 rounded-2xl border border-[#26262B] bg-[#0A0A0B]">
          {success ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle className="w-12 h-12 text-[#2FBF71] mx-auto" />
              <h3 className="font-sora text-base font-bold text-white">E-mail enviado!</h3>
              <p className="text-xs text-[#C9C9CF]">
                Verifique a caixa de entrada de <strong>{email}</strong> com as instruções para redefinir sua senha.
              </p>
              <NavLink to="/entrar" className="btn-primary w-full text-xs font-semibold mt-4 inline-flex">
                Voltar para o Login
              </NavLink>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-[#FF6B57]/10 border border-[#FF6B57]/30 text-[#FF6B57] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[#C9C9CF] font-medium mb-1">E-mail cadastrado</label>
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

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? 'Enviando...' : 'Enviar E-mail de Recuperação'}
              </button>

              <div className="pt-4 text-center border-t border-[#26262B]">
                <NavLink to="/entrar" className="text-xs text-[#8B8B95] hover:text-white inline-flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar para login
                </NavLink>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
