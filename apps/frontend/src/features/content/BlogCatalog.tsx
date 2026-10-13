import type { Metadata } from 'next';
import Link from 'next/link';
import type { PublishedContent } from './content';

export const blogMetadata: Metadata = {
  title: 'Статьи о продаже криптовалюты и RUB-балансе',
  description: 'Инструкции OnlyP2P: доплата +7%, пополнение USDT TRC20, сравнение условий продажи криптовалюты и переводы рублей между пользователями.',
  alternates: { canonical: '/blog' },
  openGraph: { type: 'website', title: 'Статьи о продаже криптовалюты и RUB-балансе | OnlyP2P', description: 'Инструкции OnlyP2P: доплата +7%, пополнение USDT TRC20, сравнение условий продажи криптовалюты и переводы рублей между пользователями.', url: '/blog', siteName: 'OnlyP2P', locale: 'ru_RU', images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'OnlyP2P' }] },
  twitter: { card: 'summary_large_image', title: 'Статьи о продаже криптовалюты и RUB-балансе | OnlyP2P', description: 'Инструкции OnlyP2P: доплата +7%, пополнение USDT TRC20, сравнение условий продажи криптовалюты и переводы рублей между пользователями.', images: ['/og-image.jpg'] },
};

export function BlogCatalog({ pages }: { pages: PublishedContent[] }) {
  return <main className="content-page blog-catalog"><nav className="breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link><span aria-hidden="true">/</span><span aria-current="page">Блог</span></nav><header className="content-hero blog-hero"><p className="content-eyebrow">База знаний OnlyP2P</p><h1>Статьи и инструкции OnlyP2P</h1><p className="content-summary">Разбираем продажу криптовалюты, пополнение рублёвого баланса и работу с переводами. Выберите материал по своему действию.</p><nav className="blog-intro-links" aria-label="Полезные разделы"><Link href="/how-it-works">Общий порядок работы</Link><span aria-hidden="true">·</span><Link href="/faq">Вопросы о балансе и операциях</Link></nav></header>{pages.length ? <section className="blog-catalog-section" aria-label="Опубликованные статьи"><h2 className="blog-section-title">Статьи и инструкции</h2><ul className="article-list">{pages.map((page) => <li key={page.id}><article><p className="article-card-label">Материал OnlyP2P</p><h2><Link href={`/blog/${page.slug}`}>{page.h1}</Link></h2><p>{page.summary}</p>{page.publishedAt ? <time dateTime={page.publishedAt}>{new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(page.publishedAt))}</time> : null}<Link className="article-card-link" href={`/blog/${page.slug}`} aria-label={`Читать: ${page.h1}`}>Читать материал <span aria-hidden="true">→</span></Link></article></li>)}</ul></section> : <section className="blog-empty" aria-label="Публикации"><h2>Пока нет опубликованных статей</h2><p>Новые материалы появятся здесь после редакторской проверки.</p></section>}</main>;
}
