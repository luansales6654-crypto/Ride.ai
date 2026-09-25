import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { auth, db } from '../../database/firebase';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { UserProfile } from '../../types';
import { LoadingState } from '../ui/LoadingState';
import { initButtonColor, applyButtonColor } from '../../utils/theme';

const DEFAULT_DEMO_USER: any = {
  uid: 'ride-demo-user',
  email: 'agencia@ride.ia',
  displayName: 'Agência RIDE.IA',
  emailVerified: true,
};

const DEFAULT_DEMO_PROFILE: UserProfile = {
  uid: 'ride-demo-user',
  name: 'Agência RIDE.IA',
  email: 'agencia@ride.ia',
  agencyName: 'Agência RIDE.IA',
  whatsapp: '5511999999999',
  role: 'super_admin',
  createdAt: new Date().toISOString(),
};

export const AppLayout: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(DEFAULT_DEMO_USER);
  const [profile, setProfile] = useState<UserProfile | null>(DEFAULT_DEMO_PROFILE);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initButtonColor();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Bypass login: keep default active user
        setCurrentUser(DEFAULT_DEMO_USER as User);
        setProfile(DEFAULT_DEMO_PROFILE);
        setLoading(false);

        try {
          const notifRef = collection(db, 'users', DEFAULT_DEMO_USER.uid, 'notifications');
          const q = query(notifRef, where('read', '==', false));
          const unsubNotif = onSnapshot(q, (snapshot) => {
            setUnreadNotifications(snapshot.size);
          }, (err) => {
            // Silently swallow listener error for demo mode
          });
          return () => unsubNotif();
        } catch (e) {
          // ignore
        }
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
          const defaultProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'Agência RIDE.IA',
            email: user.email || 'agencia@ride.ia',
            agencyName: 'Agência RIDE.IA',
            role: 'super_admin',
            createdAt: new Date().toISOString(),
          };
          setProfile(defaultProfile);
        }

        const notifRef = collection(db, 'users', user.uid, 'notifications');
        const q = query(notifRef, where('read', '==', false));
        const unsubNotif = onSnapshot(q, (snapshot) => {
          setUnreadNotifications(snapshot.size);
        }, (err) => {
          console.warn('Erro ao escutar notificações:', err);
        });

        setLoading(false);
        return () => unsubNotif();
      } catch (err) {
        console.warn('Erro ao carregar dados do usuário:', err);
        setCurrentUser(DEFAULT_DEMO_USER as User);
        setProfile(DEFAULT_DEMO_PROFILE);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
        <LoadingState text="Iniciando plataforma RIDE.IA..." size="lg" />
      </div>
    );
  }

  const activeUser = currentUser || (DEFAULT_DEMO_USER as User);
  const activeProfile = profile || DEFAULT_DEMO_PROFILE;

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <Sidebar role={activeProfile?.role || 'super_admin'} className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <Topbar
          userName={activeProfile?.agencyName || activeProfile?.name || 'Agência RIDE.IA'}
          userEmail={activeUser?.email || 'agencia@ride.ia'}
          unreadNotificationsCount={unreadNotifications}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ currentUser: activeUser, profile: activeProfile }} />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />
    </div>
  );
};

