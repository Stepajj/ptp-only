import Link from 'next/link';

import AddRequisiteForm from './ui/AddRequisiteForm';

export default function NewRequisitePage() {
  return (
    <main>
      <Link href="/requisites">
        <span>←</span>
        <span>К реквизитам</span>
      </Link>

      <AddRequisiteForm />
    </main>
  );
}