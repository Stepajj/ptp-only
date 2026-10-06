import Image from 'next/image';
import Link from 'next/link';
import { LAYOUT } from '@/constants/layout';
import logo from '@/assets/images/logo.svg';
import { getPublishedContent } from '@/features/content/content';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { HeaderActions } from './HeaderActions';
import styles from './Header.module.css';

const menuLabels: Record<string, string> = { 'how-it-works': 'Как это работает', faq: 'Справка', methods: 'Методы', security: 'Безопасность', about: 'О сервисе' };

export async function Header() {
  const published = await getPublishedContent() || [];
  const sectionLinks = ['how-it-works', 'faq', 'methods', 'security', 'about']
    .flatMap((slug) => {
      const page = published.find((entry) => entry.slug === slug && entry.type !== 'ARTICLE');
      return page ? [{ href: `/${page.slug}`, label: menuLabels[page.slug] || page.h1 }] : [];
    });
  if (published.some((page) => page.type === 'ARTICLE')) sectionLinks.push({ href: '/blog', label: 'Блог' });
  return <header className={styles.header}><AnimatedSection as="div" className={styles.inner} style={{ maxWidth: LAYOUT.CONTAINER_MAX_WIDTH }}>
    <Link href="/" className={styles.logo} aria-label="OnlyP2P — главная"><Image src={logo} alt="OnlyP2P" width={109} height={29} /></Link>
    <nav className={styles.nav} aria-label="Основное меню"><ul className={styles.menu}>
      {sectionLinks.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}
    </ul></nav>
    <details className={styles.mobileMenu}><summary aria-label="Открыть меню" className={styles.mobileMenuButton}><span /><span /><span /></summary><nav className={styles.mobileNav} aria-label="Мобильное меню">
      {sectionLinks.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}<HeaderActions compact />
    </nav></details>
    <HeaderActions />
  </AnimatedSection></header>;
}
