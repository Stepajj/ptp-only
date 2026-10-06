import Image from 'next/image';
import type { ReactNode } from 'react';

function inline(text: string): ReactNode[] {
  const expression = /(\[[^\]]+\]\([^\s)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(expression);
  return parts.map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
    if (link) {
      let safe = link[2].startsWith('/') && !link[2].startsWith('//') && !link[2].includes('\\');
      try { safe ||= new URL(link[2]).protocol === 'https:'; } catch { /* Relative links are handled above. */ }
      return safe ? <a href={link[2]} key={index}>{link[1]}</a> : link[1];
    }
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
    return part;
  });
}

type BodyVariant = 'default' | 'faq' | 'how-it-works' | 'methods' | 'security' | 'about';

function splitSections(lines: string[]) {
  const intro: string[] = [];
  const sections: Array<{ title: string; body: string[] }> = [];
  let current: { title: string; body: string[] } | null = null;
  for (const line of lines) {
    const heading = line.trim().match(/^##\s+(.+)$/);
    if (heading) {
      current = { title: heading[1], body: [] };
      sections.push(current);
    } else if (current) current.body.push(line);
    else intro.push(line);
  }
  return { intro, sections };
}

export function ContentBody({ markdown, preview = false, variant = 'default' }: { markdown: string; preview?: boolean; variant?: BodyVariant }) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  if (variant === 'faq') {
    const { intro, sections } = splitSections(lines);
    return <div className="content-body content-body--faq">
      {intro.join('\n').trim() ? <div className="faq-intro"><ContentBody markdown={intro.join('\n')} preview={preview} /></div> : null}
      {sections.map((entry, index) => <details className="faq-entry" key={`${entry.title}-${index}`}>
        <summary className="faq-question">{entry.title}<span className="faq-toggle" aria-hidden="true">+</span></summary>
        <div className="faq-answer"><ContentBody markdown={entry.body.join('\n')} preview={preview} /></div>
      </details>)}
    </div>;
  }
  if (variant === 'methods' || variant === 'security' || variant === 'about' || variant === 'how-it-works') {
    const { intro, sections } = splitSections(lines);
    if (sections.length) {
      const sectionClass = variant === 'methods' ? 'method-card' : variant === 'security' ? 'security-principle' : variant === 'about' ? 'about-story-section' : 'guide-chapter';
      return <div className={`content-body content-body--${variant}`}>
        {intro.join('\n').trim() ? <div className={`${variant}-lead`}><ContentBody markdown={intro.join('\n')} preview={preview} /></div> : null}
        <div className={`${variant}-sections`}>
          {sections.map((section, index) => <section className={sectionClass} key={`${section.title}-${index}`}>
            {variant === 'security' && <span className="security-principle-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>}
            {variant === 'how-it-works' && <span className="guide-chapter-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>}
            <div className={`${variant}-section-content`}><h2>{section.title}</h2><ContentBody markdown={section.body.join('\n')} preview={preview} /></div>
          </section>)}
        </div>
      </div>;
    }
  }
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let ordered = false;
  const flushParagraph = () => { if (paragraph.length) { blocks.push(<p key={`p-${blocks.length}`}>{inline(paragraph.join(' '))}</p>); paragraph = []; } };
  const flushList = () => { if (list.length) { const Tag = ordered ? 'ol' : 'ul'; blocks.push(<Tag key={`l-${blocks.length}`}>{list.map((item, i) => <li key={i}>{inline(item)}</li>)}</Tag>); list = []; } };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex] ?? '';
    const trimmed = line.trim();
    if (!trimmed) { flushParagraph(); flushList(); continue; }
    const nextLine = lines[lineIndex + 1]?.trim() || '';
    if (trimmed.includes('|') && nextLine.includes('|')) {
      const headers = trimmed.replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
      const separators = nextLine.replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
      if (headers.length && headers.length === separators.length && separators.every((cell) => /^:?-{3,}:?$/.test(cell))) {
        flushParagraph(); flushList();
        const rows: string[][] = [];
        lineIndex += 2;
        while (lineIndex < lines.length && (lines[lineIndex] ?? '').trim().includes('|')) {
          rows.push((lines[lineIndex] ?? '').trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim()));
          lineIndex += 1;
        }
        lineIndex -= 1;
        blocks.push(<div className="content-table-scroll" role="region" aria-label="Таблица" tabIndex={0} key={`t-${blocks.length}`}><table><thead><tr>{headers.map((cell, index) => <th key={index} scope="col">{inline(cell)}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{headers.map((_, cellIndex) => <td key={cellIndex}>{inline(row[cellIndex] || '')}</td>)}</tr>)}</tbody></table></div>);
        continue;
      }
    }
    const heading = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (heading) { flushParagraph(); flushList(); const Tag = heading[1].length === 2 ? 'h2' : 'h3'; blocks.push(<Tag key={`h-${blocks.length}`}>{inline(heading[2])}</Tag>); continue; }
    const image = trimmed.match(/^!\[([^\]]+)\]\((\/content-media\/[a-f0-9]{36}\.(?:png|jpg))\)$/);
    if (image) { flushParagraph(); flushList(); blocks.push(<figure key={`i-${blocks.length}`}><Image src={image[2]} alt={image[1]} width={1200} height={800} unoptimized={preview} sizes="(max-width: 760px) 100vw, 760px" /><figcaption>{image[1]}</figcaption></figure>); continue; }
    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    const number = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || number) { flushParagraph(); const nextOrdered = Boolean(number); if (list.length && ordered !== nextOrdered) flushList(); ordered = nextOrdered; list.push((bullet || number)![1]); continue; }
    flushList(); paragraph.push(trimmed);
  }
  flushParagraph(); flushList();
  return <div className={`content-body${variant === 'default' ? '' : ` content-body--${variant}`}`}>{blocks}</div>;
}
