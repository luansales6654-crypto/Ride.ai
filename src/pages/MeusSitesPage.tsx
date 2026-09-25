import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../database/firebase';
import { Globe, Wand2 } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';

export const MeusSitesPage: React.FC = () => {
  const [websites, setWebsites] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'websites'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs: any[] = [];
      snapshot.forEach((d) => docs.push({ id: d.id, ...d.data() }));
      setWebsites(docs);
    });

    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#3D8BFF]" /> Meus Sites Gerados ({websites.length})
          </h2>
          <p className="text-xs text-[#8B8B95] mt-1">Lista de sites criados com o Prompt Mestre RIDE.IA</p>
        </div>

        <button onClick={() => navigate('/app/criador-de-sites')} className="btn-primary text-xs">
          <Wand2 className="w-4 h-4" /> Criar Novo Site
        </button>
      </div>

      {websites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {websites.map((site) => (
            <div key={site.id} className="card-surface p-5 rounded-2xl border border-[#26262B] space-y-2 text-xs">
              <h3 className="font-sora font-bold text-white text-base">{site.companyName}</h3>
              <p className="text-[#3D8BFF] font-semibold">{site.segment}</p>
              <p className="text-[#8B8B95]">Objetivo: {site.goal}</p>
              <p className="text-[#5E5E68] text-[10px]">Criado em: {new Date(site.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Globe}
          title="Você ainda não criou nenhum site."
          description="Acesse o Criador de Sites para gerar seu primeiro Prompt Mestre e estrutura técnica em segundos."
          actionText="Criar meu primeiro site"
          onAction={() => navigate('/app/criador-de-sites')}
        />
      )}
    </div>
  );
};
