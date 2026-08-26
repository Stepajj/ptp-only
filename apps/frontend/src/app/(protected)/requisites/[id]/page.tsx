import Link from 'next/link';
import RequisiteSettings from './ui/RequisiteSettings';
import styles from './ui/RequisiteSettings.module.css';

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
    <main className={styles.page}>
      <Link
        className={styles.back}
        href="/requisites"
      >
        <span style={{ opacity: '30%' }}>←</span>
        <span style={{ opacity: '60%' }}>К реквизитам</span>
      </Link>

      <RequisiteSettings requisiteId={id} />
    </main>
  );
}
