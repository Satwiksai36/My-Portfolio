import HomeClient from '@/components/HomeClient';

// Force dynamic rendering so updates are fetched on every request
export const dynamic = 'force-dynamic';

export default function Home() {
  return <HomeClient />;
}
