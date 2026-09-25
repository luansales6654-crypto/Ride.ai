import React, { useState } from 'react';
import { Modal } from './Modal';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../database/firebase';
import { useToast } from './Toast';
import { SaleSource, SaleStatus } from '../../types';
import { DollarSign } from 'lucide-react';

interface RegisterSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialData?: {
    leadId?: string;
    proposalId?: string;
    websiteId?: string;
    customerName?: string;
    description?: string;
    amount?: number;
    source?: SaleSource;
  };
}

export const RegisterSaleModal: React.FC<RegisterSaleModalProps> = ({
  isOpen,
  onClose,
  userId,
  initialData,
}) => {
  const [source, setSource] = useState<SaleSource>(initialData?.source || 'site');
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [amountStr, setAmountStr] = useState(initialData?.amount ? initialData.amount.toString() : '');
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Cartão' | 'Boleto' | 'Dinheiro' | 'Outro'>('Pix');
  const [status, setStatus] = useState<SaleStatus>('confirmada');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr.replace(',', '.'));

    if (!customerName.trim()) {
      showToast({ type: 'error', title: 'Preencha o nome do cliente' });
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      showToast({ type: 'error', title: 'Informe um valor válido maior que zero' });
      return;
    }

    setLoading(true);

    try {
      const nowStr = new Date().toISOString();
      
      const newSale = {
        source,
        customerName: customerName.trim(),
        description: description.trim() || `Venda realizada - ${source}`,
        amount,
        currency: 'BRL' as const,
        status,
        paymentMethod,
        leadId: initialData?.leadId || null,
        proposalId: initialData?.proposalId || null,
        websiteId: initialData?.websiteId || null,
        paidAt: nowStr,
        createdAt: nowStr,
      };

      // Record in sales collection
      await addDoc(collection(db, 'users', userId, 'sales'), newSale);

      // Create notification
      await addDoc(collection(db, 'users', userId, 'notifications'), {
        type: 'nova_venda',
        title: 'Nova venda registrada!',
        message: `${customerName} - R$ ${amount.toFixed(2)} (${paymentMethod})`,
        read: false,
        link: '/app/vendas',
        createdAt: nowStr,
      });

      // If linked to a lead, log interaction and mark lead as cliente
      if (initialData?.leadId) {
        await addDoc(collection(db, 'users', userId, 'leadInteractions'), {
          leadId: initialData.leadId,
          type: 'proposal_accepted',
          text: `Venda registrada no valor de R$ ${amount.toFixed(2)} via ${paymentMethod}`,
          createdAt: nowStr,
        });

        // Update lead status to 'cliente'
        const leadRef = doc(db, 'users', userId, 'leads', initialData.leadId);
        await updateDoc(leadRef, {
          status: 'cliente',
          updatedAt: nowStr,
        });
      }

      showToast({
        type: 'success',
        title: 'Venda registrada com sucesso!',
        message: `R$ ${amount.toFixed(2)} gravados. O gráfico do dashboard foi atualizado.`,
      });

      onClose();
    } catch (error: any) {
      console.error('Erro ao registrar venda:', error);
      showToast({
        type: 'error',
        title: 'Erro ao salvar venda',
        message: error.message || 'Tente novamente em instantes.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nova Venda"
      description="Grave a venda na coleção única de faturamento. O gráfico do dashboard atualizará na hora."
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block text-[#C9C9CF] font-medium mb-1">Origem da Venda</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as any)}
            className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
          >
            <option value="site">Site / Serviço contratado</option>
            <option value="ecommerce">E-commerce / Produto</option>
            <option value="manual">Outro / Venda manual</option>
          </select>
        </div>

        <div>
          <label className="block text-[#C9C9CF] font-medium mb-1">Cliente / Empresa *</label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nome do cliente ou empresa"
            className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
          />
        </div>

        <div>
          <label className="block text-[#C9C9CF] font-medium mb-1">Descrição</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Criação de site institucional + hospedagem"
            className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[#C9C9CF] font-medium mb-1">Valor do Faturamento (R$) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B95]">R$</span>
              <input
                type="text"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="1500.00"
                className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 pl-9 outline-none focus:border-[#3D8BFF] font-sora font-bold text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#C9C9CF] font-medium mb-1">Forma de Pagamento</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
            >
              <option value="Pix">Pix</option>
              <option value="Cartão">Cartão de Crédito</option>
              <option value="Boleto">Boleto Bancário</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[#C9C9CF] font-medium mb-1">Status da Venda</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStatus('confirmada')}
              className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                status === 'confirmada'
                  ? 'bg-[#2FBF71]/15 border-[#2FBF71] text-[#2FBF71]'
                  : 'bg-[#18181B] border-[#26262B] text-[#8B8B95]'
              }`}
            >
              Confirmada (Sobe no gráfico)
            </button>
            <button
              type="button"
              onClick={() => setStatus('pendente')}
              className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                status === 'pendente'
                  ? 'bg-[#F5A524]/15 border-[#F5A524] text-[#F5A524]'
                  : 'bg-[#18181B] border-[#26262B] text-[#8B8B95]'
              }`}
            >
              Pendente
            </button>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-[#26262B]">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            <DollarSign className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Confirmar e Gravar Venda'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
