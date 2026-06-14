import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPortfolioData } from '@/lib/dataManager';
import { verifyToken } from '@/lib/adminAuth';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!verifyToken(token)) {
    redirect('/admin/login');
  }

  const initialData = await getPortfolioData();

  return <AdminDashboardClient initialData={initialData} />;
}
