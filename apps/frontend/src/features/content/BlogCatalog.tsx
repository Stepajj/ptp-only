import type { Metadata } from 'next';
import Link from 'next/link';
import type { PublishedContent } from './content';

export const blogMetadata: Metadata = {
  title: 'Блог OnlyP2P — инструкции и ответы',
  description: 'Практические статьи и инструкции по работе с OnlyP2P.',
  alternates: { canonical: '/blog' },
  openGraph: { type: 'website', title: 'Блог OnlyP2P', description: 'Практические статьи и инструкции по работе с OnlyP2P.', url: '/blog', siteName: 'OnlyP2P', locale: 'ru_RU', images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'OnlyP2P' }] },
  twitter: { card: 'summary_large_image', title: 'Блог OnlyP2P', description: 'Практические статьи и инструкции по работе с OnlyP2P.', images: ['/og-image.jpg'] },
};

export function BlogCatalog({ pages }: { pages: PublishedContent[] }) {
  return <main className="content-page blog-catalog"><nav className="breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link><span aria-hidden="true">/</span><span aria-current="page">Блог</span></nav><header className="content-hero blog-hero"><p className="content-eyebrow">База знаний OnlyP2P</p><h1>Блог OnlyP2P</h1><p className="content-summary">Инструкции и ответы о работе сервиса — понятным языком и с опорой на актуальные условия.</p></header>{pages.length ? <section className="blog-catalog-section" aria-label="Опубликованные статьи"><h2 className="blog-section-title">Статьи и инструкции</h2><ul className="article-list">{pages.map((page) => <li key={page.id}><article><p className="article-card-label">Материал OnlyP2P</p><h2><Link href={`/blog/${page.slug}`}>{page.h1}</Link></h2><p>{page.summary}</p>{page.publishedAt ? <time dateTime={page.publishedAt}>{new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(page.publishedAt))}</time> : null}<Link className="article-card-link" href={`/blog/${page.slug}`} aria-label={`Читать: ${page.h1}`}>Читать материал <span aria-hidden="true">→</span></Link></article></li>)}</ul></section> : <section className="blog-empty" aria-label="Публикации"><h2>Пока нет опубликованных статей</h2><p>Новые материалы появятся здесь после редакторской проверки.</p></section>}</main>;
}
