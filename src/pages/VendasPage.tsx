import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../database/firebase';
import { Sale } from '../types';
import { RegisterSaleModal } from '../components/ui/RegisterSaleModal';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { formatBRL, formatDateTimeBR } from '../utils/formatters';
import { DollarSign, Download, Plus, Filter, Trash2, CheckCircle2, Clock, XCircle } from 'lucide-react';

export const VendasPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const salesRef = collection(db, 'users', user.uid, 'sales');
    const q = query(salesRef, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const docs: Sale[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as Sale);
      });
      setSales(docs);
    });

    return () => unsub();
  }, []);

  const handleCancelSale = async (saleId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    if (!window.confirm('Tem certeza que deseja cancelar esta venda? O valor será removido do gráfico do dashboard.')) {
      return;
    }

    try {
      const saleRef = doc(db, 'users', user.uid, 'sales', saleId);
      await updateDoc(saleRef, {
        status: 'cancelada',
      });
      showToast({ type: 'success', title: 'Venda cancelada com sucesso' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao cancelar venda', message: err.message });
    }
  };

  const handleExportCsv = () => {
    if (sales.length === 0) return;

    const headers = ['ID', 'Origem', 'Cliente', 'Descrição', 'Valor (R$)', 'Forma Pagamento', 'Status', 'Data Pagamento'];
    const rows = sales.map((s) => [
      s.id,
      s.source,
      `"${s.customerName}"`,
      `"${s.description}"`,
      s.amount.toFixed(2),
      s.paymentMethod,
      s.status,
      s.paidAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vendas-rideia-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({ type: 'success', title: 'Relatório de vendas exportado em CSV!' });
  };

  const filteredSales = sales.filter((s) => {
    if (filterSource !== 'all' && s.source !== filterSource) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const totalFilteredAmount = filteredSales
    .filter((s) => s.status === 'confirmada')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#3D8BFF]" /> Gestão de Vendas (Fonte do Faturamento)
          </h2>
          <p className="text-xs text-[#8B8B95] mt-1">
            Registro unificado de faturamento de sites, e-commerce e vendas manuais
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleExportCsv} className="btn-secondary text-xs">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
          <button onClick={() => setRegisterModalOpen(true)} className="btn-primary text-xs font-bold">
            <Plus className="w-4 h-4" /> Registrar Venda
          </button>
        </div>
      </div>

      {/* Filter and summary bar */}
      <div className="card-surface p-4 rounded-2xl border border-[#26262B] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-[#18181B] border border-[#26262B] text-white text-xs rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
          >
            <option value="all">Todas as Origens</option>
            <option value="site">Site / Serviço</option>
            <option value="ecommerce">E-commerce</option>
            <option value="manual">Manual / Outro</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#18181B] border border-[#26262B] text-white text-xs rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
          >
            <option value="all">Todos os Status</option>
            <option value="confirmada">Confirmadas</option>
            <option value="pendente">Pendentes</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#8B8B95] uppercase font-bold block">Total Confirmado do Filtro</span>
          <span className="font-sora text-xl font-extrabold text-[#2FBF71]">
            {formatBRL(totalFilteredAmount)}
          </span>
        </div>
      </div>

      {/* Sales List Table */}
      {filteredSales.length > 0 ? (
        <div className="card-surface rounded-2xl border border-[#26262B] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#C9C9CF]">
              <thead className="bg-[#18181B] text-[#8B8B95] uppercase font-sora text-[10px] tracking-wider border-b border-[#26262B]">
                <tr>
                  <th className="p-4">Cliente / Descrição</th>
                  <th className="p-4">Origem</th>
                  <th className="p-4">Forma Pagto</th>
                  <th className="p-4">Data Pagamento</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Valor (R$)</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262B]">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[#18181B]/50 transition-colors">
                    <td className="p-4">
                      <p className="font-sora font-bold text-white">{sale.customerName}</p>
                      <p className="text-[11px] text-[#8B8B95]">{sale.description}</p>
                    </td>
                    <td className="p-4 capitalize">
                      <span className="px-2 py-0.5 rounded bg-[#18181B] border border-[#26262B] text-[10px]">
                        {sale.source}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">{sale.paymentMethod}</td>
                    <td className="p-4">{formatDateTimeBR(sale.paidAt)}</td>
                    <td className="p-4">
                      {sale.status === 'confirmada' && (
                        <span className="inline-flex items-center gap-1 text-[#2FBF71] font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmada
                        </span>
                      )}
                      {sale.status === 'pendente' && (
                        <span className="inline-flex items-center gap-1 text-[#F5A524] font-semibold text-[11px]">
                          <Clock className="w-3.5 h-3.5" /> Pendente
                        </span>
                      )}
                      {sale.status === 'cancelada' && (
                        <span className="inline-flex items-center gap-1 text-[#FF6B57] font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Cancelada
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right font-sora font-extrabold text-white text-sm">
                      {formatBRL(sale.amount)}
                    </td>
                    <td className="p-4 text-right">
                      {sale.status !== 'cancelada' && (
                        <button
                          onClick={() => handleCancelSale(sale.id)}
                          className="p-1.5 text-[#FF6B57] hover:bg-[#FF6B57]/10 rounded-lg transition-colors"
                          title="Cancelar Venda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={DollarSign}
          title="Nenhuma venda registrada neste período"
          description="Clique em 'Registrar Venda' acima para adicionar uma venda de site ou produto. O gráfico do dashboard subirá automaticamente."
          actionText="Registrar Venda"
          onAction={() => setRegisterModalOpen(true)}
        />
      )}

      {/* Register sale modal */}
      <RegisterSaleModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        userId={auth.currentUser?.uid || ''}
      />
    </div>
  );
};
