import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/Container/Container';
import { StaggerContainer, StaggerGroup, StaggerItem } from '@/components/motion/StaggerContainer';
import logo from '@/assets/images/footerLogo.svg';
import { getPublishedContent } from '@/features/content/content';
import { fallbackReferralUrl } from '@/features/content/referrals';
import styles from './Footer.module.css';

const labels: Record<string, string> = { 'how-it-works': 'Как это работает', faq: 'Справка', methods: 'Методы', security: 'Безопасность', about: 'О сервисе' };

export async function Footer() {
  const pages = await getPublishedContent() || [];
  const contentLinks = pages.filter((page) => page.type !== 'ARTICLE').map((page) => ({ label: labels[page.slug] || page.h1, href: `/${page.slug}` }));
  contentLinks.push({ label: 'Блог', href: '/blog' });
  const columns = [
    { title: 'Сервис', links: [...contentLinks, { label: 'Вопросы на главной', href: '/#faq' }] },
    { title: 'Контакты', links: [{ label: 'Telegram-бот', href: fallbackReferralUrl, bot: true }, { label: 'Партнёрство', href: 'https://t.me/O_onlypays' }, { label: 'OnlyP2P', href: 'https://onlypays.net' }] },
    { title: 'Документы', links: [{ label: 'Условия использования', href: '/terms' }, { label: 'Политика конфиденциальности', href: '/privacy' }] },
  ];
  return <Container><StaggerContainer as="footer" className={styles.footer} variant="section"><StaggerGroup className={styles.content}>
    <StaggerItem className={styles.brand}><Link href="/" aria-label="OnlyP2P — главная"><Image src={logo} alt="OnlyP2P" width={100} /></Link><p className={styles.description}>Сервис по продаже криптовалюты<br />через инфраструктуру OnlyP2P.</p></StaggerItem>
    {columns.map((column) => <StaggerItem key={column.title}><nav className={styles.column}><h2 className={styles.title}>{column.title}</h2><ul className={styles.list}>{column.links.map((link) => <li key={link.label}>{link.href.startsWith('http') ? <a href={link.href} className={styles.link} target="_blank" rel="noreferrer" data-cta-destination={'bot' in link && link.bot ? 'bot' : undefined} data-cta-placement="footer">{link.label}</a> : <Link href={link.href} className={styles.link}>{link.label}</Link>}</li>)}</ul></nav></StaggerItem>)}
  </StaggerGroup></StaggerContainer></Container>;
}
