import Link from 'next/link';
import RequisiteSettings from './ui/RequisiteSettings';

export default function RequisiteSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <RequisiteSettingsRoute params={params} />;
}

async function RequisiteSettingsRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main>
      <Link
        style={{ margin: '25px 0px 0px 30px', display: 'flex', gap: '10px' }}
        href="/requisites"
      >
        <span style={{ opacity: '30%' }}>←</span>
        <span style={{ opacity: '60%' }}>К реквизитам</span>
      </Link>

      <RequisiteSettings requisiteId={id} />
    </main>
  );
}
