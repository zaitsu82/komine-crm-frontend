'use client';

import { useRouter } from 'next/navigation';
import ProfilePage from '@/components/profile-page';

export default function ProfileRoute() {
  const router = useRouter();

  return (
    <ProfilePage onBack={() => router.push('/plots')} />
  );
}
