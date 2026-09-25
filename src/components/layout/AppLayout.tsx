import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { auth, db } from '../../database/firebase';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { UserProfile } from '../../types';
import { LoadingState } from '../ui/LoadingState';
import { initButtonColor, applyButtonColor } from '../../utils/theme';

export const AppLayout: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initButtonColor();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const storedCustom = localStorage.getItem('ride_custom_session');
        if (storedCustom) {
          try {
            const parsed = JSON.parse(storedCustom);
            if (parsed && parsed.uid) {
              const activeUserObj: any = {
                uid: parsed.uid,
                email: parsed.email || 'usuario@ride.ia',
                displayName: parsed.name || 'Agência Digital',
              };
              const activeProfileObj: UserProfile = {
                uid: parsed.uid,
                name: parsed.name || 'Agência Digital',
                email: parsed.email || 'usuario@ride.ia',
                agencyName: parsed.name || 'Agência Digital',
                role: 'user',
                createdAt: parsed.createdAt || new Date().toISOString(),
              };

              setCurrentUser(activeUserObj);
              setProfile(activeProfileObj);

              const notifRef = collection(db, 'users', parsed.uid, 'notifications');
              const q = query(notifRef, where('read', '==', false));
              const unsubNotif = onSnapshot(q, (snapshot) => {
                setUnreadNotifications(snapshot.size);
              }, () => {});

              setLoading(false);
              return () => unsubNotif();
            }
          } catch (e) {
            // ignore
          }
        }

        setCurrentUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      try {
        const userRef = doc(db, 'users', user.uid, 'profile', 'data');
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const pData = docSnap.data() as UserProfile;
          setProfile(pData);
          if (pData.buttonColor) {
            applyButtonColor(pData.buttonColor);
          }
        } else {
          const newProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName || user.email?.split('@')[0] || (user.isAnonymous ? 'Convidado RIDE.IA' : 'Usuário RIDE.IA'),
            email: user.email || (user.isAnonymous ? 'convidado@ride.ia' : 'usuario@ride.ia'),
            agencyName: user.displayName || 'Agência Digital',
            role: 'user',
            createdAt: new Date().toISOString(),
          };
          await setDoc(userRef, newProfile).catch(() => {});
          setProfile(newProfile);
        }

        const notifRef = collection(db, 'users', user.uid, 'notifications');
        const q = query(notifRef, where('read', '==', false));
        const unsubNotif = onSnapshot(q, (snapshot) => {
          setUnreadNotifications(snapshot.size);
        }, () => {});

        setLoading(false);
        return () => unsubNotif();
      } catch (err) {
        console.warn('Erro ao carregar dados do usuário:', err);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
        <LoadingState text="Carregando seus dados privados RIDE.IA..." size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/entrar" replace />;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <Sidebar role={profile?.role || 'user'} className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <Topbar
          userName={profile?.agencyName || profile?.name || currentUser.displayName || 'Usuário RIDE.IA'}
          userEmail={currentUser.email || 'Sessão Privada'}
          unreadNotificationsCount={unreadNotifications}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ currentUser, profile }} />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />
    </div>
  );
};

