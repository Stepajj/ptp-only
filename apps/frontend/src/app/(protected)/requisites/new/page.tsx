import Link from 'next/link';

import AddRequisiteForm from './ui/AddRequisiteForm';

export default function NewRequisitePage() {
  return (
    <main>
      <Link style={{ margin: '25px 0px 0px 30px' , display: 'flex', gap: '10px'}} href="/requisites">
        <span style={{opacity: '30%'}}>←</span>
        <span style={{opacity: '60%'}}>К реквизитам</span>
      </Link>

      <AddRequisiteForm />
    </main>
  );
}