'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { KeyboardEvent } from 'react';
import { GlassDialog } from './components/glass-dialog';
import { PortfolioBrowser } from './components/portfolio-browser';
import { categoryImageCount, portfolio, portfolioImageCount, portfolioProjectCount } from './data/portfolio';
import { categoryCopy } from './data/portfolio-copy';

const COMPANY = '上海风语筑文化科技股份有限公司';
const EMAIL = 'hello@lindesign.work';
const sections = [{ id: 'top', label: '首页' }, { id: 'work', label: '作品' }, { id: 'about', label: '关于' }, { id: 'contact', label: '联系' }];
const categories = ['全部作品', '界面', '游戏UI', '公司活动'] as const;
type Category = typeof categories[number];
const abilities = [
  { label: '信息组织', title: '让专业内容，更容易被理解。', text: '面对企业、产业与文化主题，我先梳理内容关系，再通过层级、布局与导航线索建立清楚的阅读路径。', tags: ['内容梳理', '信息层级', '阅读路径'] },
  { label: '主题表达', title: '让视觉气质，回应内容本身。', text: '从科技场景到传统文化，依据项目主题选择图像、色彩与文字节奏，让界面既有辨识度，也能承载内容。', tags: ['主题视觉', '色彩语言', '文字编排'] },
  { label: '交互状态', title: '让参与有引导，让操作有反馈。', text: '在互动游戏与展项界面中，关注待机、教学、操作和结果等不同状态，让提示与反馈融入整体体验。', tags: ['操作引导', '状态反馈', '体验连贯性'] },
  { label: '活动视觉', title: '让主题在不同画幅里保持连贯。', text: '在 UI 设计之外，也为公司活动制作海报与邀请函；根据横竖版和不同载体重新组织信息，延续统一的主题表达。', tags: ['活动海报', '邀请函', '视觉延展'] },
];
type Panel = { type: 'portfolio'; categoryId?: string } | { type: 'about' } | { type: 'contact' } | null;

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function FrostedScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let visible = false;
    const update = () => {
      x += (targetX - x) * .24;
      y += (targetY - y) * .24;
      scene.style.setProperty('--pointer-x', `${x}px`);
      scene.style.setProperty('--pointer-y', `${y}px`);
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > .2 ? requestAnimationFrame(update) : 0;
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) { x = targetX; y = targetY; }
      visible = true;
      scene.dataset.reveal = 'true';
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        x = targetX; y = targetY;
      }
      if (!frame) frame = requestAnimationFrame(update);
    };
    const leave = () => { visible = false; scene.dataset.reveal = 'false'; };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
    };
  }, []);
  return <div ref={sceneRef} className="ambient-scene" aria-hidden="true">
    <div className="ambient-image ambient-image-blurred" />
    <div className="clarity-window"><div className="ambient-image" /></div>
  </div>;
}

function ParticleField({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let frame = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let lastTime = 0;
    let pointer: { x: number; y: number } | null = null;
    const particles: { x: number; y: number; vx: number; vy: number; life: number; hue: number; size: number }[] = [];
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    if (!active) { ctx.clearRect(0, 0, width, height); return; }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const next = { x: event.clientX, y: event.clientY };
      const last = pointer || next;
      const distance = Math.hypot(next.x - last.x, next.y - last.y);
      const count = Math.min(16, Math.max(2, Math.ceil(distance / 7)));
      for (let i = 0; i < count; i++) {
        const t = (i + 1) / count;
        particles.push({ x: last.x + (next.x - last.x) * t, y: last.y + (next.y - last.y) * t, vx: (Math.random() - .5) * .55, vy: (Math.random() - .5) * .55, life: 1, hue: 185 + Math.random() * 90, size: 1 + Math.random() * 2.4 });
      }
      if (particles.length > 180) particles.splice(0, particles.length - 180);
      pointer = next;
    };
    const leave = () => { pointer = null; };
    const draw = (time: number) => {
      const delta = Math.min((time - (lastTime || time)) / 16.67, 2.5);
      lastTime = time;
      ctx.clearRect(0, 0, width, height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= .018 * delta;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        p.x += p.vx * delta; p.y += p.vy * delta;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.shadowBlur = 10 * p.life; ctx.shadowColor = `hsla(${p.hue},90%,65%,.6)`;
        ctx.fillStyle = `hsla(${p.hue},65%,52%,${p.life * .75})`; ctx.fill();
      }
      ctx.shadowBlur = 0;
      frame = window.requestAnimationFrame(draw);
    };
    const visibility = () => {
      window.cancelAnimationFrame(frame);
      lastTime = 0;
      if (!document.hidden) frame = window.requestAnimationFrame(draw);
    };
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', visibility);
    frame = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [active]);
  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}

function Tabs({ labels, selected, onChange, id }: { labels: readonly string[]; selected: number; onChange: (index: number) => void; id: string }) {
  const navigate = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % labels.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + labels.length) % labels.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = labels.length - 1;
    else return;
    event.preventDefault(); onChange(next); document.getElementById(`${id}-tab-${next}`)?.focus();
  };
  return <div className="segmented glass" role="tablist" aria-label={id === 'work' ? '作品分类' : '内容选择'}>{labels.map((label, i) => <button key={label} type="button" role="tab" id={`${id}-tab-${i}`} aria-controls={`${id}-panel`} aria-selected={selected === i} tabIndex={selected === i ? 0 : -1} onKeyDown={(e) => navigate(e, i)} onClick={() => onChange(i)}>{label}</button>)}</div>;
}

export default function Home() {
  const [activeSection, setActiveSection] = useState('top');
  const [category, setCategory] = useState<Category>('全部作品');
  const [ability, setAbility] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);
  const [aboutTab, setAboutTab] = useState(0);
  const [topic, setTopic] = useState(0);
  const [message, setMessage] = useState('');
  const [copyState, setCopyState] = useState('复制邮箱');
  const [motionPaused, setMotionPaused] = useState(false);
  const reduceMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, () => false);
  const motionActive = !motionPaused && !reduceMotion;
  const topics = ['UI 设计交流', '活动视觉交流', '作品与工作反馈'];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
    }, { rootMargin: '-30% 0px -45% 0px' });
    sections.forEach((section) => { const element = document.getElementById(section.id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);

  const open = (next: NonNullable<Panel>) => { setCopyState('复制邮箱'); setPanel(next); };
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(EMAIL); setCopyState('邮箱已复制'); }
    catch { setCopyState('请长按或选中邮箱复制'); }
  };

  return <main data-motion={motionActive ? 'on' : 'off'}>
    <a className="skip-link" href="#work">跳转到作品</a>
    <FrostedScene />
    <ParticleField active={motionActive} />

    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="LIN DESIGN 首页">LIN<span>/</span>DESIGN</a>
      <nav className="main-nav glass" aria-label="主导航">{sections.map((section) => <a key={section.id} href={`#${section.id}`} aria-current={activeSection === section.id ? 'location' : undefined}>{section.label}</a>)}</nav>
      <span className="header-edition">PORTFOLIO <span>2026</span></span>
    </header>

    <nav className="section-rail" aria-label="板块快捷导航">{sections.map((section, i) => <a key={section.id} href={`#${section.id}`} aria-label={section.label} aria-current={activeSection === section.id ? 'location' : undefined}>0{i + 1}</a>)}</nav>

    <section className="hero page-section" id="top" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="eyebrow hero-eyebrow"><span>殷川 · 2026 转正作品集</span><span className="eyebrow-divider" />UI & VISUAL DESIGN</div>
        <h1 id="hero-title">造境</h1>
        <p className="hero-title-en">DESIGNING EXPERIENCE BEYOND THE SCREEN</p>
        <p className="hero-description">从创意构想，到体验现场。<br />让内容被理解，让体验有回应。</p>
        <button className="pill-button glass primary-action" onClick={() => open({ type: 'portfolio' })}>探索我的作品<span className="button-caption">EXPLORE</span></button>
      </div>
      <div className="hero-bottom">
        <div className="company-block"><span className="location">中国·上海</span><p>{COMPANY}</p></div>
        <div className="hero-note"><span>以清晰组织信息，以视觉传递感受。</span><small>THOUGHTFUL BY DESIGN.</small></div>
      </div>
      <div className="hero-index" aria-hidden="true">01<span>/ 04</span></div>
    </section>

    <section className="work-section page-section" id="work" aria-labelledby="work-title">
      <div className="section-heading"><span className="eyebrow">01 / SELECTED WORK</span><span className="eyebrow">{portfolioProjectCount} 个项目 · {portfolioImageCount} 张效果图</span></div>
      <div className="section-intro"><h2 id="work-title">在不同场景里，<br />回应具体问题。</h2><p>从企业与产业展示，到文化互动与活动视觉，<br />围绕内容、场景和操作需求寻找合适的表达。</p></div>
      <Tabs labels={categories} selected={categories.indexOf(category)} onChange={(index) => setCategory(categories[index])} id="work" />
      <div className="project-grid" role="tabpanel" id="work-panel" aria-labelledby={`work-tab-${categories.indexOf(category)}`}>
        {portfolio.map((item, index) => category === '全部作品' || item.name === category ? <button className={`project-card glass project-${index}`} key={item.id} onClick={() => open({ type: 'portfolio', categoryId: item.id })} aria-label={`浏览${item.name}，${item.projects.length}个项目`}>
          <div className="project-topline"><span>{item.english}</span><span>{item.projects.length} 个项目</span></div>
          <div className="project-type"><span>0{index + 1}</span><h3>{item.name}</h3><p>{categoryCopy[item.id]?.headline ?? item.description}</p></div>
          <div className="project-bottom"><span>{categoryImageCount(item)} 张效果图</span><span>选择项目 ↗</span></div>
        </button> : null)}
      </div>
      <div className="section-bottom"><p>从设计方向进入项目，再细看每一张效果图。</p><button className="text-button" onClick={() => open({ type: 'portfolio' })}>按设计方向浏览</button></div>
    </section>

    <section className="about-section page-section" id="about" aria-labelledby="about-title">
      <div className="section-heading"><span className="eyebrow">02 / ABOUT & APPROACH</span><span className="eyebrow">设计方法与态度</span></div>
      <div className="about-grid"><div className="about-intro"><h2 id="about-title">以清晰，<br />承载想象。</h2><p>我是殷川，一名关注数字展陈与互动体验的 UI / 视觉设计师。<br />我关注内容如何被理解、操作如何被识别，以及不同页面如何形成一致的体验。</p><div className="about-company"><span>UI / 视觉设计师 · 中国·上海</span><p>{COMPANY}</p></div><button className="pill-button glass" onClick={() => open({ type: 'about' })}>进一步了解我<span className="button-caption">ABOUT ME</span></button></div>
        <div className="ability-card glass"><Tabs id="ability" labels={abilities.map((item) => item.label)} selected={ability} onChange={setAbility} /><div id="ability-panel" role="tabpanel" aria-labelledby={`ability-tab-${ability}`} className="ability-content" key={ability}><span className="large-index">0{ability + 1}</span><h3>{abilities[ability].title}</h3><p>{abilities[ability].text}</p><div className="tags">{abilities[ability].tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></div>
      </div>
    </section>

    <section className="contact-section page-section" id="contact" aria-labelledby="contact-title">
      <div className="section-heading"><span className="eyebrow">03 / LET’S CONNECT</span><span className="eyebrow">保持交流</span></div>
      <div className="contact-content"><span className="eyebrow">从一个具体问题开始</span><h2 id="contact-title">让我们，<br />继续交流。</h2><button className="pill-button glass primary-action" onClick={() => open({ type: 'contact' })}>一起聊聊<span className="button-caption">LET’S TALK</span></button><p>想了解某个项目，或交流界面与视觉设计？欢迎联系我。</p></div>
      <footer className="footer-bottom"><span>© 2026 LIN DESIGN</span><span>中国·上海</span><a href="#top">回到首页</a></footer>
    </section>

    <button className="motion-control glass" aria-pressed={motionPaused || reduceMotion} onClick={() => setMotionPaused(!motionPaused)} disabled={reduceMotion} aria-label={reduceMotion ? '已遵循系统减少动态效果设置' : motionPaused ? '开启背景呼吸与粒子拖尾' : '暂停背景呼吸与粒子拖尾'}><span className="motion-indicator" />{reduceMotion ? '静态模式' : motionPaused ? '动态已暂停' : '呼吸动态'}</button>

    {panel?.type === 'portfolio' && <PortfolioBrowser initialCategoryId={panel.categoryId} close={() => setPanel(null)} />}
    {panel && panel.type !== 'portfolio' && <GlassDialog close={() => setPanel(null)} breadcrumb={`首页 / ${panel.type === 'about' ? '关于我' : '联系交流'}`} title={panel.type === 'about' ? '设计背后的思考。' : '想聊些什么？'}>
      {panel.type === 'about' && <><Tabs id="about-detail" labels={['工作定位', '设计方法', '视觉延展']} selected={aboutTab} onChange={setAboutTab} /><div id="about-detail-panel" role="tabpanel" aria-labelledby={`about-detail-tab-${aboutTab}`} className="project-detail-content" key={aboutTab}>
        {aboutTab === 0 ? <><span className="eyebrow">UI & VISUAL DESIGNER / SHANGHAI</span><h3>从内容出发，设计可感知的体验。</h3><p>{COMPANY}</p><p>我的设计实践覆盖企业与产业展示、文化主题界面、互动游戏 UI 和活动视觉。我希望让信息更容易被理解，让操作更容易被识别。</p></> : aboutTab === 1 ? <><h3>从问题出发，让设计有依据。</h3><ol className="detail-list"><li>理解内容：明确主题、信息与使用场景。</li><li>梳理结构：组织阅读顺序和操作路径。</li><li>形成表达：选择符合主题的视觉语言。</li><li>完善状态：让引导、操作与反馈连贯。</li><li>检查延展：让不同页面与画幅保持一致。</li></ol></> : <><h3>让主题在不同载体上保持连贯。</h3><p>{abilities[3].text}</p><button className="pill-button glass" onClick={() => open({ type: 'portfolio', categoryId: 'events' })}>浏览活动视觉作品</button></>}
      </div></>}
      {panel.type === 'contact' && <><p className="dialog-intro">选择交流主题，也可以说说你对某个项目的想法。</p><div className="topic-options" role="group" aria-label="交流主题">{topics.map((item, index) => <button className="small-button" key={item} aria-pressed={topic === index} onClick={() => setTopic(index)}>{item}</button>)}</div><label className="message-label" htmlFor="contact-message">想交流的内容<span>选填</span></label><textarea id="contact-message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="你希望了解哪个项目，或讨论什么设计问题？" maxLength={2000} /><div className="contact-actions"><a className="pill-button glass primary-action" href={`mailto:${EMAIL}?subject=${encodeURIComponent(topics[topic])}&body=${encodeURIComponent(message)}`}>打开邮件</a><button className="text-button" onClick={copyEmail}>{copyState}</button></div><p className="email-address">{EMAIL}</p><p className="content-note" aria-live="polite">{copyState === '复制邮箱' ? '将通过你的邮件应用继续编辑，由你确认发送。' : copyState}</p></>}
    </GlassDialog>}
  </main>;
}
