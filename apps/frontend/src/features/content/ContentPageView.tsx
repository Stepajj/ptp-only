import Link from 'next/link';
import type { PublishedContent } from './content';
import { ContentBody } from './ContentBody';
import { getPublishedPage } from './content';
import { fallbackReferralUrl } from './referrals';


export async function ContentPageView({ page, article = false, preview = false }: { page: PublishedContent; article?: boolean; preview?: boolean }) {
  const reviewed = page.checkedAt ? new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(page.checkedAt)) : null;
  const sectionLabels: Record<PublishedContent['type'], string> = { ARTICLE: 'Блог OnlyP2P', FAQ: 'Справочный центр', HOW_IT_WORKS: 'Инструкция', METHODS: 'Способы работы', SECURITY: 'Безопасность', ABOUT: 'О сервисе' };
  const ctaPlacement = article ? 'article' : page.type === 'FAQ' ? 'faq' : page.type === 'METHODS' ? 'methods' : 'article';
  const related = await Promise.all(page.relatedSlugs.map((slug) => getPublishedPage(slug, true)));
  const breadcrumbItems = article
    ? [{ name: 'Главная', item: 'https://p2pru.com/' }, { name: 'Блог', item: 'https://p2pru.com/blog' }, { name: page.h1, item: `https://p2pru.com/blog/${page.slug}` }]
    : [{ name: 'Главная', item: 'https://p2pru.com/' }, { name: page.h1, item: `https://p2pru.com/${page.slug}` }];
  const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbItems.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: item.item })) };
  const pageJsonLd = <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }} />;
  const sources = page.sources.length > 0 && <aside className="content-sources"><h2>Источники</h2><ul>{page.sources.map((source) => { let host = source; try { host = new URL(source).hostname; } catch { /* Ignore invalid legacy records. */ } return <li key={source}><a href={source} rel="noopener noreferrer">{host}</a></li>; })}</ul></aside>;
  const relatedLinks = related.some(Boolean) && <nav className="related-content" aria-label="Связанные материалы"><h2>Связанные материалы</h2><ul>{related.filter((item): item is PublishedContent => Boolean(item)).map((item) => <li key={item.slug}><Link href={item.type === 'ARTICLE' ? `/blog/${item.slug}` : `/${item.slug}`}>{item.h1}</Link></li>)}</ul></nav>;
  const cta = page.cta === 'register' ? <p><a className="content-cta" data-cta-destination="web" data-cta-placement={ctaPlacement} href="/register">Создать аккаунт</a></p> : page.cta === 'telegram' ? <p><a className="content-cta" data-cta-destination="bot" data-cta-placement={ctaPlacement} href={fallbackReferralUrl}>Открыть Telegram-бот</a></p> : null;

  // Keep the established article presentation independent from the marketing page templates.
  if (article) return <>{pageJsonLd}<main className="content-page content-page--article"><nav className="breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link><span aria-hidden="true">/</span><Link href="/blog">Блог</Link><span aria-hidden="true">/</span><span aria-current="page">{page.h1}</span></nav><article><header className="content-hero"><p className="content-eyebrow">{sectionLabels[page.type]}</p><h1>{page.h1}</h1>{page.summary ? <p className="content-summary">{page.summary}</p> : null}<p className="content-byline">{page.author}{reviewed ? ` · Проверено ${reviewed}` : ''}</p></header><ContentBody markdown={page.body} preview={preview} />{sources}{relatedLinks}{cta}</article></main></>;

  const heroCopy = <><p className="content-eyebrow">{sectionLabels[page.type]}</p><h1>{page.h1}</h1>{page.summary ? <p className="content-summary">{page.summary}</p> : null}{reviewed ? <p className="content-byline">Проверено {reviewed}</p> : null}</>;
  const variant: Record<Exclude<PublishedContent['type'], 'ARTICLE'>, 'faq' | 'how-it-works' | 'methods' | 'security' | 'about'> = { FAQ: 'faq', HOW_IT_WORKS: 'how-it-works', METHODS: 'methods', SECURITY: 'security', ABOUT: 'about' };
  const body = <ContentBody markdown={page.body} preview={preview} variant={variant[page.type as Exclude<PublishedContent['type'], 'ARTICLE'>]} />;

  return <>{pageJsonLd}<main className={`content-page marketing-page marketing-page--${page.slug}`}>
    <nav className="breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link><span aria-hidden="true">/</span><span aria-current="page">{page.h1}</span></nav>
    {page.type === 'FAQ' && <article className="faq-marketing-layout"><header className="faq-marketing-hero"><div>{heroCopy}</div><span className="faq-marketing-mark" aria-hidden="true">FAQ</span></header><section className="faq-marketing-answers" aria-label="Вопросы и ответы">{body}</section>{relatedLinks}{sources}{cta}</article>}
    {page.type === 'HOW_IT_WORKS' && <article className="guide-marketing-layout"><header className="guide-marketing-hero"><div>{heroCopy}</div><span className="guide-marketing-mark" aria-hidden="true">01</span></header><section className="guide-marketing-content"><div className="guide-section-heading"><span>Инструкция</span><h2>Порядок действий</h2></div>{body}</section>{relatedLinks}{sources}{cta}</article>}
    {page.type === 'METHODS' && <article className="methods-marketing-layout"><header className="methods-marketing-hero"><div>{heroCopy}</div><span className="methods-marketing-orbit" aria-hidden="true"><i /><i /><i /></span></header><section className="methods-marketing-content"><div className="methods-section-heading"><span>Обзор</span><h2>Доступные способы</h2></div>{body}</section>{relatedLinks}{sources}{cta}</article>}
    {page.type === 'SECURITY' && <article className="security-marketing-layout"><header className="security-marketing-hero"><span className="security-marketing-kicker">ПАМЯТКА ПОЛЬЗОВАТЕЛЮ</span><h1>{page.h1}</h1>{page.summary ? <p className="content-summary">{page.summary}</p> : null}{reviewed ? <p className="content-byline">Проверено {reviewed}</p> : null}</header><section className="security-marketing-content"><div className="security-section-heading"><span>Перед действием</span><h2>Рекомендации</h2></div>{body}</section>{relatedLinks}{sources}{cta}</article>}
    {page.type === 'ABOUT' && <article className="about-marketing-layout"><header className="about-marketing-hero"><div className="about-marketing-overline">ONLYP2P <span>·</span> О СЕРВИСЕ</div><h1>{page.h1}</h1>{page.summary ? <p className="content-summary">{page.summary}</p> : null}</header><div className="about-marketing-body"><aside className="about-marketing-aside" aria-label="Навигация по разделам"><span>О сервисе</span><span>OnlyP2P</span></aside><section className="about-marketing-story">{body}{reviewed ? <p className="content-byline">Проверено {reviewed}</p> : null}</section></div>{relatedLinks}{sources}{cta}</article>}
  </main></>;
}
