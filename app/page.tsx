'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

const COMPANY = '上海风语筑文化科技股份有限公司';
const EMAIL = 'hello@lindesign.work';
const sections = [{ id: 'top', label: '首页' }, { id: 'work', label: '作品' }, { id: 'about', label: '关于' }, { id: 'contact', label: '联系' }];
const categories = ['全部作品', 'UI 界面', '活动视觉', '组件规范'] as const;
type Category = typeof categories[number];
const projects = [
  { id: '01', title: 'YOUNG SU', subtitle: '产品界面与交互体验', category: 'UI 界面', year: '2026', focus: '让信息有层次，让操作有回应。', description: '从界面结构、视觉层级到操作反馈，关注每一步体验的清晰与连贯。', tags: ['界面设计', '信息层级', '交互反馈'], content: ['界面结构与页面关系', '关键操作与状态反馈', '视觉语言与细节表达'] },
  { id: '02', title: 'MOTION / 08', subtitle: '活动海报与视觉延展', category: '活动视觉', year: '2026', focus: '让活动主题，拥有鲜明的表达。', description: '围绕公司活动的传播需求，关注主题表达、文字编排和视觉节奏，将设计能力延展到活动海报中。', tags: ['活动海报', '视觉编排', '主题表达'], content: ['活动主题与核心信息', '海报版式与视觉重心', '不同使用场景的视觉延展'] },
  { id: '03', title: 'NORTH LAB', subtitle: 'UI 组件与设计规范', category: '组件规范', year: '2025', focus: '用一致的细节，连接完整的体验。', description: '关注界面中可复用的元素，以统一的字号、间距和组件状态，让设计表达更加有序。', tags: ['UI 组件', '视觉规范', '状态设计'], content: ['字体、色彩与间距', '基础组件与交互状态', '页面中的一致性应用'] },
] as const;
const abilities = [
  { label: 'UI 界面', title: '让复杂的信息，变得清晰。', text: '围绕用户需求与业务目标，梳理信息层级和页面关系，通过视觉秩序帮助用户理解内容、完成操作。', tags: ['信息层级', '界面布局', '视觉语言'] },
  { label: '交互体验', title: '让每一次操作，都有自然的回应。', text: '关注操作路径、状态变化和反馈，让页面之间的衔接清晰，让界面细节服务于完整的使用体验。', tags: ['操作路径', '状态反馈', '体验连贯性'] },
  { label: '组件规范', title: '将细节沉淀为一致的设计语言。', text: '从字体、色彩和间距到基础组件，关注设计规则在不同页面中的一致应用，也为后续协作保留清晰依据。', tags: ['组件复用', '视觉一致性', '设计交付'] },
  { label: '活动视觉', title: '将界面之外的想法，也表达出来。', text: '在 UI 设计工作之外，为公司活动制作海报，关注主题、文字与图形的组织，让传播信息明确而有辨识度。', tags: ['活动海报', '信息编排', '视觉延展'] },
];
type Panel = { type: 'explore' } | { type: 'project'; index: number } | { type: 'about' } | { type: 'contact' } | null;

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

function GlassDialog({ title, breadcrumb, close, children }: { title: string; breadcrumb: string; close: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal(); document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} className="detail-dialog glass" aria-labelledby="dialog-title" onCancel={close} onClick={(e) => { if (e.target === e.currentTarget) { const rect = e.currentTarget.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) close(); } }}>
    <div className="dialog-top"><span>{breadcrumb}</span><button type="button" className="small-button" onClick={close} autoFocus aria-label="关闭二级界面">返回</button></div>
    <div className="dialog-body"><h2 id="dialog-title">{title}</h2>{children}</div>
  </dialog>;
}

export default function Home() {
  const [activeSection, setActiveSection] = useState('top');
  const [category, setCategory] = useState<Category>('全部作品');
  const [ability, setAbility] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);
  const [detailTab, setDetailTab] = useState(0);
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

  const open = (next: NonNullable<Panel>) => { setDetailTab(0); setCopyState('复制邮箱'); setPanel(next); };
  const chooseCategory = (next: Category) => { setCategory(next); setPanel(null); window.requestAnimationFrame(() => document.getElementById('work')?.scrollIntoView({ behavior: motionActive ? 'smooth' : 'instant' })); };
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(EMAIL); setCopyState('邮箱已复制'); }
    catch { setCopyState('请长按或选中邮箱复制'); }
  };
  const currentProject = panel?.type === 'project' ? projects[panel.index] : null;

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
        <div className="eyebrow hero-eyebrow"><span>UI 界面设计师</span><span className="eyebrow-divider" />UI & VISUAL DESIGN</div>
        <h1 id="hero-title">让界面，<br />好用<span className="quiet-word">也</span>好看。</h1>
        <p className="hero-description">专注 UI 界面与交互体验，<br />也为公司活动提供视觉设计支持。</p>
        <button className="pill-button glass primary-action" onClick={() => open({ type: 'explore' })}>探索我的作品<span className="button-caption">EXPLORE</span></button>
      </div>
      <div className="hero-bottom">
        <div className="company-block"><span className="location">中国·上海</span><p>{COMPANY}</p></div>
        <div className="hero-note"><span>清晰的逻辑，自由的表达。</span><small>THOUGHTFUL BY DESIGN.</small></div>
      </div>
      <div className="hero-index" aria-hidden="true">01<span>/ 04</span></div>
    </section>

    <section className="work-section page-section" id="work" aria-labelledby="work-title">
      <div className="section-heading"><span className="eyebrow">01 / SELECTED WORK</span><span className="eyebrow">2025 — 2026</span></div>
      <div className="section-intro"><h2 id="work-title">设计，有迹可循。</h2><p>从界面到视觉，<br />让每一种表达，都回应真实需求。</p></div>
      <Tabs labels={categories} selected={categories.indexOf(category)} onChange={(index) => setCategory(categories[index])} id="work" />
      <div className="project-grid" role="tabpanel" id="work-panel" aria-labelledby={`work-tab-${categories.indexOf(category)}`}>
        {projects.map((project, index) => category === '全部作品' || project.category === category ? <button className={`project-card glass project-${index}`} key={project.id} onClick={() => open({ type: 'project', index })} aria-label={`查看 ${project.title} 项目详情`}>
          <div className="project-topline"><span>{project.category}</span><span>{project.year}</span></div>
          <div className="project-type"><span>{project.id}</span><h3>{project.title}</h3><p>{project.subtitle}</p></div>
          <div className="project-bottom"><span>{project.tags[0]} / {project.tags[1]}</span><span>查看项目</span></div>
        </button> : null)}
      </div>
      <div className="section-bottom"><p>UI 设计为主线，活动视觉为延展。</p><button className="text-button" onClick={() => open({ type: 'explore' })}>按设计方向浏览</button></div>
    </section>

    <section className="about-section page-section" id="about" aria-labelledby="about-title">
      <div className="section-heading"><span className="eyebrow">02 / ABOUT & APPROACH</span><span className="eyebrow">设计方法与态度</span></div>
      <div className="about-grid"><div className="about-intro"><h2 id="about-title">以清晰，<br />承载想象。</h2><p>我相信好的 UI，应该让体验清晰自然。<br />在逻辑与感受之间，寻找恰好的平衡。</p><div className="about-company"><span>UI 界面设计师 · 中国·上海</span><p>{COMPANY}</p></div><button className="pill-button glass" onClick={() => open({ type: 'about' })}>进一步了解我<span className="button-caption">ABOUT ME</span></button></div>
        <div className="ability-card glass"><Tabs id="ability" labels={abilities.map((item) => item.label)} selected={ability} onChange={setAbility} /><div id="ability-panel" role="tabpanel" aria-labelledby={`ability-tab-${ability}`} className="ability-content" key={ability}><span className="large-index">0{ability + 1}</span><h3>{abilities[ability].title}</h3><p>{abilities[ability].text}</p><div className="tags">{abilities[ability].tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></div>
      </div>
    </section>

    <section className="contact-section page-section" id="contact" aria-labelledby="contact-title">
      <div className="section-heading"><span className="eyebrow">03 / LET’S CONNECT</span><span className="eyebrow">保持交流</span></div>
      <div className="contact-content"><span className="eyebrow">从一个想法开始</span><h2 id="contact-title">好的设计，<br />始于一次交流。</h2><button className="pill-button glass primary-action" onClick={() => open({ type: 'contact' })}>一起聊聊<span className="button-caption">LET’S TALK</span></button><p>界面设计、活动视觉，或关于作品的想法。</p></div>
      <footer className="footer-bottom"><span>© 2026 LIN DESIGN</span><span>中国·上海</span><a href="#top">回到首页</a></footer>
    </section>

    <button className="motion-control glass" aria-pressed={motionPaused || reduceMotion} onClick={() => setMotionPaused(!motionPaused)} disabled={reduceMotion} aria-label={reduceMotion ? '已遵循系统减少动态效果设置' : motionPaused ? '开启背景呼吸与粒子拖尾' : '暂停背景呼吸与粒子拖尾'}><span className="motion-indicator" />{reduceMotion ? '静态模式' : motionPaused ? '动态已暂停' : '呼吸动态'}</button>

    {panel && <GlassDialog close={() => setPanel(null)} breadcrumb={`首页 / ${{ explore: '作品导航', project: '精选作品', about: '关于我', contact: '联系交流' }[panel.type]}`} title={panel.type === 'explore' ? '从感兴趣的方向开始。' : panel.type === 'about' ? '设计背后的思考。' : panel.type === 'contact' ? '想聊些什么？' : currentProject!.title}>
      {panel.type === 'explore' && <><p className="dialog-intro">选择一个方向，浏览对应作品。</p><div className="choice-list">{categories.slice(1).map((item, index) => <button key={item} onClick={() => chooseCategory(item)}><span className="choice-number">0{index + 1}</span><span><strong>{item}</strong><small>{projects[index].subtitle}</small></span><span className="choice-count">01 项目</span></button>)}</div><button className="text-button dialog-link" onClick={() => chooseCategory('全部作品')}>查看全部作品</button></>}
      {panel.type === 'project' && currentProject && <><div className="project-detail-meta"><span>{currentProject.subtitle}</span><span>{currentProject.year}</span></div><Tabs id="project-detail" labels={['项目概览', '设计关注', '内容目录']} selected={detailTab} onChange={setDetailTab} /><div id="project-detail-panel" role="tabpanel" aria-labelledby={`project-detail-tab-${detailTab}`} className="project-detail-content" key={`${currentProject.id}-${detailTab}`}>
        {detailTab === 0 ? <><span className="eyebrow">{currentProject.category}</span><h3>{currentProject.focus}</h3><p>{currentProject.description}</p><div className="tags">{currentProject.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></> : detailTab === 1 ? <><h3>关注体验，也关注表达。</h3><p>{currentProject.description}</p><ol className="detail-list">{currentProject.content.map((item) => <li key={item}>{item}</li>)}</ol></> : <><h3>项目内容索引</h3><ol className="detail-list">{currentProject.content.map((item) => <li key={item}>{item}</li>)}</ol><p className="content-note">当前展示项目文字概览，完整设计图待补充。</p></>}
      </div><div className="dialog-bottom"><button className="text-button" onClick={() => open({ type: 'explore' })}>返回作品分类</button><button className="small-button" onClick={() => open({ type: 'project', index: (panel.index + 1) % projects.length })}>下一个项目</button></div></>}
      {panel.type === 'about' && <><Tabs id="about-detail" labels={['工作定位', '设计方法', '视觉延展']} selected={aboutTab} onChange={setAboutTab} /><div id="about-detail-panel" role="tabpanel" aria-labelledby={`about-detail-tab-${aboutTab}`} className="project-detail-content" key={aboutTab}>
        {aboutTab === 0 ? <><span className="eyebrow">UI DESIGNER / SHANGHAI</span><h3>UI 界面设计师</h3><p>{COMPANY}</p><p>专注 UI 界面与交互体验，同时参与公司活动海报设计，将清晰的信息组织与视觉表达带入不同的设计场景。</p></> : aboutTab === 1 ? <><h3>从问题出发，让设计有依据。</h3><ol className="detail-list"><li>理解需求：明确用户任务与业务目标。</li><li>梳理结构：组织信息，理顺操作路径。</li><li>形成表达：统一视觉语言与组件状态。</li><li>关注细节：检查可用性与界面一致性。</li></ol></> : <><h3>界面之外，延续视觉思考。</h3><p>{abilities[3].text}</p><button className="pill-button glass" onClick={() => chooseCategory('活动视觉')}>浏览活动视觉作品</button></>}
      </div></>}
      {panel.type === 'contact' && <><p className="dialog-intro">选择交流主题，留下一点想法。</p><div className="topic-options" role="group" aria-label="交流主题">{topics.map((item, index) => <button className="small-button" key={item} aria-pressed={topic === index} onClick={() => setTopic(index)}>{item}</button>)}</div><label className="message-label" htmlFor="contact-message">想交流的内容<span>选填</span></label><textarea id="contact-message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="你好，我想了解……" maxLength={2000} /><div className="contact-actions"><a className="pill-button glass primary-action" href={`mailto:${EMAIL}?subject=${encodeURIComponent(topics[topic])}&body=${encodeURIComponent(message)}`}>打开邮件</a><button className="text-button" onClick={copyEmail}>{copyState}</button></div><p className="email-address">{EMAIL}</p><p className="content-note" aria-live="polite">{copyState === '复制邮箱' ? '将通过你的邮件应用继续编辑，由你确认发送。' : copyState}</p></>}
    </GlassDialog>}
  </main>;
}
