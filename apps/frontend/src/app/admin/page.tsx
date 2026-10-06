'use client';

import { useEffect, useRef, useState } from 'react';

type ContentType = 'ARTICLE' | 'FAQ' | 'HOW_IT_WORKS' | 'METHODS' | 'SECURITY' | 'ABOUT';
type PageType = Exclude<ContentType, 'ARTICLE'>;
type Content = {
  id: string; type: ContentType; slug: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  title: string; h1: string; description: string; summary: string; body: string; author: string;
  authorType: 'Person' | 'Organization'; checkedAt: string | null; sources: string[];
  relatedSlugs: string[]; cta: 'register' | 'telegram' | 'none' | null;
  revisions: Array<{ version: number; createdAt: string }>;
};
type FormContent = Omit<Content, 'id' | 'status' | 'revisions' | 'checkedAt'> & { checkedAt: string };
type FaqItem = { question: string; answer: string };
type Notice = { message: string; kind: 'success' | 'error' };

const empty: FormContent = {
  type: 'ARTICLE', slug: '', title: '', h1: '', description: '', summary: '', body: '',
  author: '', authorType: 'Organization', checkedAt: '', sources: [], relatedSlugs: [], cta: 'none',
};
const typeNames: Record<ContentType, string> = {
  ARTICLE: 'Статья', FAQ: 'Расширенная справка', HOW_IT_WORKS: 'Как это работает',
  METHODS: 'Методы', SECURITY: 'Безопасность', ABOUT: 'О сервисе',
};
const fixedSlugs: Record<PageType, string> = {
  FAQ: 'faq', HOW_IT_WORKS: 'how-it-works', METHODS: 'methods', SECURITY: 'security', ABOUT: 'about',
};

function parseFaqBody(body: string) {
  const intro: string[] = [];
  const items: FaqItem[] = [];
  let current: FaqItem | null = null;
  for (const line of body.replace(/\r/g, '').split('\n')) {
    const heading = /^##(?:\s+(.*))?$/.exec(line.trim());
    if (heading) { current = { question: heading[1] ?? '', answer: '' }; items.push(current); }
    else if (current) current.answer += `${current.answer ? '\n' : ''}${line}`;
    else intro.push(line);
  }
  return { intro: intro.join('\n').trim(), items };
}

function serializeFaqBody(intro: string, items: FaqItem[]) {
  return [intro.trim(), ...items.map(({ question, answer }) => `## ${question.trim()}\n\n${answer.trim()}`)].filter(Boolean).join('\n\n');
}

function faqHasCompleteItems(body: string) {
  const { items } = parseFaqBody(body);
  return items.length > 0 && items.every((item) => item.question.trim() && item.answer.trim());
}

async function api(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(`/api/cms/${path}`, {
    method,
    credentials: 'same-origin',
    headers: body instanceof FormData ? undefined : body ? { 'content-type': 'application/json' } : undefined,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || result.error || `HTTP ${response.status}`);
  return result;
}

function values(page: Content): FormContent {
  return { ...page, checkedAt: page.checkedAt ? new Date(page.checkedAt).toISOString().slice(0, 10) : '' };
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pages, setPages] = useState<Content[]>([]);
  const [form, setForm] = useState<FormContent>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pageTypeToCreate, setPageTypeToCreate] = useState<PageType | ''>('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const editorRef = useRef<HTMLElement>(null);

  async function load() {
    const result = await api('admin/content') as Content[];
    setPages(result);
  }

  useEffect(() => {
    void api('session').then(() => { setAuthenticated(true); return load(); }).catch(() => setAuthenticated(false));
  }, []);

  const update = <K extends keyof FormContent>(key: K, value: FormContent[K]) => setForm((current) => ({ ...current, [key]: value }));
  const announce = (message: string, kind: Notice['kind'] = 'success') => setNotice({ message, kind });
  const scrollToEditor = () => requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));

  function startPage() {
    if (!pageTypeToCreate) return;
    const slug = fixedSlugs[pageTypeToCreate];
    if (pages.some((page) => page.slug === slug)) {
      announce(`Страница «${typeNames[pageTypeToCreate]}» уже существует. Откройте её в списке страниц или восстановите из архива.`, 'error');
      return;
    }
    setEditingId(null);
    setForm({ ...empty, type: pageTypeToCreate, slug });
    announce(`Заполните поля страницы «${typeNames[pageTypeToCreate]}». Сначала она сохранится как черновик.`);
    scrollToEditor();
  }

  function startArticle() {
    setEditingId(null);
    setForm(empty);
    announce('Создайте статью: укажите латинский slug и заполните содержание.');
    scrollToEditor();
  }

  function editContent(page: Content) {
    setEditingId(page.id);
    setForm(values(page));
    announce(page.type === 'FAQ' && !faqHasCompleteItems(page.body)
      ? 'Добавьте хотя бы один полный вопрос и ответ, чтобы опубликовать справку.'
      : 'Редактируйте поля и сохраните изменения как черновик.');
    scrollToEditor();
  }

  function updateFaq(change: (draft: { intro: string; items: FaqItem[] }) => { intro: string; items: FaqItem[] }) {
    const next = change(parseFaqBody(form.body));
    update('body', serializeFaqBody(next.intro, next.items));
  }

  async function login(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setNotice(null);
    try { await api('login', 'POST', { username, password }); setAuthenticated(true); setPassword(''); await load(); }
    catch (error) { announce(error instanceof Error ? error.message : 'Не удалось войти', 'error'); }
    finally { setBusy(false); }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setNotice(null);
    const payload = {
      ...form,
      checkedAt: form.checkedAt ? new Date(`${form.checkedAt}T00:00:00.000Z`).toISOString() : null,
      sources: form.sources.map((item) => item.trim()).filter(Boolean),
      relatedSlugs: form.relatedSlugs.map((item) => item.trim()).filter(Boolean),
    };
    try {
      const saved = await api(editingId ? `admin/content/${editingId}` : 'admin/content', editingId ? 'PUT' : 'POST', payload) as Content;
      setEditingId(saved.id); setForm(values(saved));
      announce('Черновик сохранён. Он не виден посетителям; опубликуйте его после редакторской проверки.');
      await load();
    } catch (error) { announce(error instanceof Error ? error.message : 'Не удалось сохранить', 'error'); }
    finally { setBusy(false); }
  }

  async function action(path: string, method = 'POST') {
    setBusy(true); setNotice(null);
    try { await api(path, method); await load(); announce('Действие выполнено.'); }
    catch (error) { announce(error instanceof Error ? error.message : 'Не удалось выполнить действие', 'error'); }
    finally { setBusy(false); }
  }

  async function logout() {
    setBusy(true); setNotice(null);
    try {
      await api('logout', 'POST');
      setAuthenticated(false);
      setPages([]);
      setForm(empty);
      setEditingId(null);
      announce('Вы вышли из редактора.');
    } catch (error) { announce(error instanceof Error ? error.message : 'Не удалось завершить сессию', 'error'); }
    finally { setBusy(false); }
  }

  function toast() {
    if (!notice) return null;
    return <div className={`cms-toast cms-toast--${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'} aria-live={notice.kind === 'error' ? 'assertive' : 'polite'}>
      <span>{notice.message}</span>
      <button type="button" className="cms-toast-close" aria-label="Закрыть уведомление" onClick={() => setNotice(null)}>×</button>
    </div>;
  }

  if (!authenticated) return <>
    {toast()}
    <main className="cms-admin"><h1>Редактор материалов</h1><form onSubmit={login}>
      <label>Логин<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
      <label>Пароль<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      <button disabled={busy}>Войти</button>
    </form></main>
  </>;

  const active = pages.filter((page) => page.status !== 'ARCHIVED');
  const sitePages = active.filter((page) => page.type !== 'ARTICLE');
  const articles = active.filter((page) => page.type === 'ARTICLE');
  const archivedPages = pages.filter((page) => page.status === 'ARCHIVED' && page.type !== 'ARTICLE');
  const archivedArticles = pages.filter((page) => page.status === 'ARCHIVED' && page.type === 'ARTICLE');

  function renderItem(page: Content, archived = false) {
    const incompleteFaq = page.type === 'FAQ' && page.status === 'PUBLISHED' && !faqHasCompleteItems(page.body);
    return <li className="cms-content-item" key={page.id}>
      <div><strong>{page.h1 || page.slug}</strong><p>{typeNames[page.type]} · {page.status}{incompleteFaq ? ' · скрыта до заполнения вопросов и ответов' : ''}{page.type === 'ARTICLE' ? ` · /blog/${page.slug}` : ` · /${page.slug}`}</p></div>
      <div className="admin-actions">
        <button type="button" disabled={busy} onClick={() => editContent(page)}>Редактировать</button>
        <a href={`/preview/${encodeURIComponent(page.slug)}`} target="_blank" rel="noreferrer">Закрытый preview</a>
        {archived ? <>
          <button type="button" disabled={busy} onClick={() => void action(`admin/content/${page.id}/restore`)}>Восстановить как черновик</button>
          <button type="button" className="cms-danger-button" disabled={busy} onClick={() => {
            if (window.confirm(`Удалить «${page.h1 || page.slug}» навсегда вместе с историей версий? Это действие нельзя отменить.`)) void action(`admin/content/${page.id}`, 'DELETE');
          }}>Удалить навсегда</button>
        </> : <>
          {page.status === 'PUBLISHED'
            ? <button type="button" disabled={busy} onClick={() => void action(`admin/content/${page.id}/unpublish`)}>Снять с публикации</button>
            : <button type="button" disabled={busy} onClick={() => void action(`admin/content/${page.id}/publish`)}>Опубликовать</button>}
          <button type="button" disabled={busy} onClick={() => {
            const question = page.type === 'ARTICLE' ? 'Снять статью с сайта и переместить в архив? Её можно восстановить.' : 'Переместить страницу в архив? Её можно восстановить.';
            if (window.confirm(question)) void action(`admin/content/${page.id}/archive`);
          }}>В архив</button>
        </>}
        {page.revisions.length > 0 && <details className="cms-revisions"><summary>История версий ({page.revisions.length})</summary>{page.revisions.map((revision) => <button type="button" disabled={busy} key={revision.version} onClick={() => void action(`admin/content/${page.id}/revisions/${revision.version}/restore`)}>Восстановить v{revision.version}</button>)}</details>}
      </div>
    </li>;
  }

  return <>
    {toast()}
    <main className="cms-admin">
      <h1>Материалы сайта</h1>
      <p>Страницы и статьи публикуются отдельно. Черновики и preview доступны только после входа.</p>
      <div className="admin-actions cms-create-actions">
        <label>Тип страницы<select value={pageTypeToCreate} onChange={(event) => setPageTypeToCreate(event.target.value as PageType | '')}><option value="">Выберите тип страницы</option>{(Object.keys(fixedSlugs) as PageType[]).map((type) => <option value={type} key={type} disabled={pages.some((page) => page.slug === fixedSlugs[type])}>{typeNames[type]}{pages.some((page) => page.slug === fixedSlugs[type]) ? ' — уже создана' : ''}</option>)}</select></label>
        <button type="button" disabled={!pageTypeToCreate} onClick={startPage}>Новая страница</button>
        <button type="button" onClick={startArticle}>Новая статья</button>
        <button type="button" disabled={busy} onClick={() => void logout()}>Выйти</button>
      </div>

      <section className="cms-content-section" aria-labelledby="cms-pages-heading">
        <h2 id="cms-pages-heading">Страницы сайта</h2>
        {sitePages.length ? <ul className="admin-list">{sitePages.map((page) => renderItem(page))}</ul> : <p>Страниц пока нет.</p>}
      </section>
      <section className="cms-content-section" aria-labelledby="cms-articles-heading">
        <h2 id="cms-articles-heading">Статьи блога</h2>
        {articles.length ? <ul className="admin-list">{articles.map((page) => renderItem(page))}</ul> : <p>Статей пока нет.</p>}
      </section>
      <details className="cms-archive">
        <summary>Архив ({archivedPages.length + archivedArticles.length})</summary>
        <section className="cms-content-section" aria-labelledby="cms-archived-pages-heading">
          <h3 id="cms-archived-pages-heading">Архив страниц</h3>
          {archivedPages.length ? <ul className="admin-list">{archivedPages.map((page) => renderItem(page, true))}</ul> : <p>Архивных страниц нет.</p>}
        </section>
        <section className="cms-content-section" aria-labelledby="cms-archived-articles-heading">
          <h3 id="cms-archived-articles-heading">Архив статей</h3>
          {archivedArticles.length ? <ul className="admin-list">{archivedArticles.map((page) => renderItem(page, true))}</ul> : <p>Архивных статей нет.</p>}
        </section>
      </details>

      <section className="cms-editor" ref={editorRef}>
        <h2>{editingId ? `Редактирование: ${typeNames[form.type]}` : form.type === 'ARTICLE' ? 'Новая статья' : `Новая страница: ${typeNames[form.type]}`}</h2>
        <form onSubmit={save}>
          <div className="editor-grid">
            <label>Тип материала<select value={form.type} disabled={Boolean(editingId)} onChange={(event) => { const type = event.target.value as ContentType; setForm((current) => ({ ...current, type, slug: type === 'ARTICLE' ? (current.type === 'ARTICLE' ? current.slug : '') : fixedSlugs[type] })); }}>
              {Object.entries(typeNames).map(([key, name]) => <option value={key} key={key} disabled={key !== 'ARTICLE' && pages.some((page) => page.slug === fixedSlugs[key as PageType] && page.id !== editingId)}>{name}</option>)}
            </select></label>
            <label>Slug<input value={form.slug} onChange={(event) => update('slug', event.target.value)} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" readOnly={form.type !== 'ARTICLE'} required /><small>{form.type === 'ARTICLE' ? 'Латиница, строчные буквы и дефисы; адрес будет /blog/slug.' : `Фиксированный адрес страницы: /${form.slug}`}</small></label>
          </div>
          <div className="editor-grid"><label>Title<input maxLength={80} value={form.title} onChange={(event) => update('title', event.target.value)} /></label><label>H1<input maxLength={120} value={form.h1} onChange={(event) => update('h1', event.target.value)} /></label></div>
          <label>Description<input maxLength={180} value={form.description} onChange={(event) => update('description', event.target.value)} /></label>
          <label>Аннотация<textarea maxLength={300} value={form.summary} onChange={(event) => update('summary', event.target.value)} /></label>
          {form.type === 'FAQ' ? <fieldset className="faq-editor"><legend>Вопросы и ответы</legend><p>Добавляйте каждый вопрос отдельным раскрываемым элементом. Ответы присутствуют в HTML до раскрытия.</p>
            <label>Вступление (необязательно)<textarea value={parseFaqBody(form.body).intro} onChange={(event) => updateFaq((draft) => ({ ...draft, intro: event.target.value }))} /></label>
            {parseFaqBody(form.body).items.map((item, index) => <section className="faq-editor-item" key={index}><h3>Вопрос {index + 1}</h3><label>Вопрос<input value={item.question} onChange={(event) => updateFaq((draft) => ({ ...draft, items: draft.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, question: event.target.value } : entry) }))} /></label><label>Ответ<textarea value={item.answer} onChange={(event) => updateFaq((draft) => ({ ...draft, items: draft.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, answer: event.target.value } : entry) }))} /></label><button type="button" onClick={() => updateFaq((draft) => ({ ...draft, items: draft.items.filter((_, itemIndex) => itemIndex !== index) }))}>Убрать этот вопрос</button></section>)}
            <button type="button" onClick={() => updateFaq((draft) => ({ ...draft, items: [...draft.items, { question: '', answer: '' }] }))}>Добавить вопрос–ответ</button>
          </fieldset> : <label>Текст в Markdown<textarea value={form.body} onChange={(event) => update('body', event.target.value)} /><small>Допустимы заголовки ## / ###, списки, ссылки и изображения. HTML и JavaScript не исполняются.</small></label>}
          <label>Загрузить изображение (PNG/JPEG, до 5 МБ)<input type="file" accept="image/png,image/jpeg" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const data = new FormData(); data.set('image', file); try { const image = await api('admin/media', 'POST', data) as { url: string }; update('body', `${form.body}\n\n![Описание изображения](${image.url})`); announce('Изображение загружено. Замените alt-текст на точное описание.'); } catch (error) { announce(error instanceof Error ? error.message : 'Не удалось загрузить изображение', 'error'); } }} /></label>
          <div className="editor-grid"><label>Автор / редакция<input value={form.author} onChange={(event) => update('author', event.target.value)} /></label><label>Тип автора<select value={form.authorType} onChange={(event) => update('authorType', event.target.value as FormContent['authorType'])}><option value="Organization">Редакция или организация</option><option value="Person">Реальный человек</option></select></label><label>Дата проверки фактов<input type="date" value={form.checkedAt} onChange={(event) => update('checkedAt', event.target.value)} /></label></div>
          <label>Публичные первичные источники (необязательно) — по одному URL на строку<textarea value={form.sources.join('\n')} onChange={(event) => update('sources', event.target.value.split('\n'))} /></label>
          <label>Связанные опубликованные slug — по одному на строку<textarea value={form.relatedSlugs.join('\n')} onChange={(event) => update('relatedSlugs', event.target.value.split('\n'))} /></label>
          <label>CTA<select value={form.cta || 'none'} onChange={(event) => update('cta', event.target.value as FormContent['cta'])}><option value="none">Без CTA</option><option value="register">Регистрация</option><option value="telegram">Telegram-бот</option></select></label>
          <div className="admin-actions"><button disabled={busy}>Сохранить как черновик</button>{editingId && <a href={`/preview/${encodeURIComponent(form.slug)}`} target="_blank" rel="noreferrer">Открыть preview</a>}</div>
        </form>
      </section>
    </main>
  </>;
}
