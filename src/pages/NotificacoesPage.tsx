import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../database/firebase';
import { AppNotification } from '../types';
import { Bell, CheckCircle2 } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDateTimeBR } from '../utils/formatters';

export const NotificacoesPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs: AppNotification[] = [];
      snapshot.forEach((d) => docs.push({ id: d.id, ...d.data() } as AppNotification));
      setNotifications(docs);
    });

    return () => unsub();
  }, []);

  const handleMarkAllRead = async () => {
    const user = auth.currentUser;
    if (!user) return;

    notifications.forEach(async (n) => {
      if (!n.read) {
        await updateDoc(doc(db, 'users', user.uid, 'notifications', n.id), { read: true });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#3D8BFF]" /> Central de Notificações
          </h2>
          <p className="text-xs text-[#8B8B95] mt-1">Alertas em tempo real sobre vendas, propostas e integrações</p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-xs">
            <CheckCircle2 className="w-4 h-4" /> Marcar todas como lidas
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all text-xs ${
                n.read ? 'bg-[#0A0A0B] border-[#26262B] text-[#8B8B95]' : 'bg-[#18181B] border-[#3D8BFF]/40 text-white font-semibold'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-sora font-bold text-sm">{n.title}</h4>
                <span className="text-[10px] text-[#5E5E68]">{formatDateTimeBR(n.createdAt)}</span>
              </div>
              <p className="text-[#C9C9CF] mt-1">{n.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="Nenhuma notificação."
          description="Alertas de novas vendas, propostas visualizadas e avisos de integrações serão mostrados aqui."
        />
      )}
    </div>
  );
};
