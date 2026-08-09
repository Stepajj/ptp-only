import RequisiteCard from './RequisiteCard';

import styles from './RequisitesList.module.css';

type RequisiteMock = {
  id: string;
  bankName: string;
  lastDigits: string;
  limitUsed: number;
  limitTotal: number;
  isActive: boolean;
};

const requisites: RequisiteMock[] = [
  {
    id: '1',
    bankName: 'Т-Банк',
    lastDigits: '4821',
    limitUsed: 34000,
    limitTotal: 100000,
    isActive: true,
  },
  {
    id: '2',
    bankName: 'Т-Банк',
    lastDigits: '4821',
    limitUsed: 34000,
    limitTotal: 100000,
    isActive: true,
  },
  {
    id: '3',
    bankName: 'Т-Банк',
    lastDigits: '4821',
    limitUsed: 34000,
    limitTotal: 100000,
    isActive: true,
  },
  {
    id: '4',
    bankName: 'Т-Банк',
    lastDigits: '4821',
    limitUsed: 34000,
    limitTotal: 100000,
    isActive: false,
  },
];

export default function RequisitesList() {
  return (
    <section className={styles.list}>
      {requisites.map((requisite) => (
        <RequisiteCard key={requisite.id} requisite={requisite} />
      ))}
    </section>
  );
}