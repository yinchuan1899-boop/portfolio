'use client';

import { useEffect, useRef, useState } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
};

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let frame = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles: Particle[] = [];
    let pointer = { x: width * 0.68, y: height * 0.42, active: false };
    let last = { x: pointer.x, y: pointer.y };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const addParticle = (x: number, y: number, speed = 1) => {
      const angle = Math.random() * Math.PI * 2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * Math.random() * speed,
        vy: Math.sin(angle) * Math.random() * speed,
        life: 0.55 + Math.random() * 0.45,
        size: 0.7 + Math.random() * 1.8,
      });
    };

    const handlePointer = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY, active: true };
      if (reducedMotion) return;
      const distance = Math.hypot(pointer.x - last.x, pointer.y - last.y);
      const amount = Math.min(6, Math.max(1, Math.floor(distance / 10)));
      for (let i = 0; i < amount; i += 1) {
        addParticle(pointer.x + (Math.random() - 0.5) * 16, pointer.y + (Math.random() - 0.5) * 16, 1.4);
      }
      last = { x: pointer.x, y: pointer.y };
    };

    const handleLeave = () => {
      pointer.active = false;
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 220);
      glow.addColorStop(0, pointer.active ? 'rgba(199, 255, 82, 0.09)' : 'rgba(199, 255, 82, 0.04)');
      glow.addColorStop(1, 'rgba(199, 255, 82, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      if (!reducedMotion && particles.length < 72 && Math.random() > 0.58) {
        addParticle(pointer.x + (Math.random() - 0.5) * 170, pointer.y + (Math.random() - 0.5) * 170, 0.35);
      }

      particles = particles.filter((particle) => particle.life > 0.02);
      particles.forEach((particle) => {
        if (pointer.active) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.max(Math.hypot(dx, dy), 30);
          if (distance < 210) {
            particle.vx += (dx / distance) * 0.018;
            particle.vy += (dy / distance) * 0.018;
          }
        }
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.985;
        particle.vy *= 0.985;
        particle.life *= 0.986;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(214, 255, 127, ${particle.life * 0.72})`;
        context.fill();
      });

      frame = window.requestAnimationFrame(draw);
    };

    resize();
    for (let i = 0; i < 34; i += 1) {
      addParticle(Math.random() * width, Math.random() * height, 0.18);
    }
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointer, { passive: true });
    document.addEventListener('pointerleave', handleLeave);
    frame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointer);
      document.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}

const projects = [
  { id: '01', title: 'YOUNG SU', type: '产品界面 · 交互体验', year: '2026', className: 'acid' },
  { id: '02', title: 'MOTION / 08', type: '活动海报 · 视觉延展', year: '2026', className: 'violet' },
  { id: '03', title: 'NORTH LAB', type: 'UI 组件 · 设计规范', year: '2025', className: 'silver' },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main>
      <ParticleField />
      <div className="noise" aria-hidden="true" />

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="回到首页">
          <span className="mark-dot" />
          LIN / DESIGN
        </a>
        <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="主导航">
          <a href="#work" onClick={() => setMenuOpen(false)}>项目</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>关于</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>联系</a>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="打开菜单">
          {menuOpen ? '关闭' : '菜单'}
        </button>
      </header>

      <section className="hero" id="top">
        <div className="hero-meta reveal">
          <span>UI 界面设计师</span>
          <span>中国 · 成都</span>
        </div>

        <h1 className="hero-title" aria-label="让界面，好用也好看。">
          <span className="title-line">让界面，</span>
          <span className="title-line offset"><span className="outline">好用</span>也好看。</span>
        </h1>

        <div className="hero-footer reveal">
          <p>专注 UI 界面与交互体验，<br />也为公司活动提供海报等视觉设计支持。</p>
          <a className="round-link" href="#work" aria-label="查看精选项目"><span>↓</span></a>
          <span className="availability"><i /> UI DESIGN · VISUAL SUPPORT</span>
        </div>
      </section>

      <section className="work-section" id="work">
        <div className="section-heading">
          <span>01 / 精选项目</span>
          <span>2025—2026</span>
        </div>

        <div className="project-list">
          {projects.map((project) => (
            <article className="project" key={project.id} tabIndex={0}>
              <div className={`project-visual ${project.className}`} aria-hidden="true">
                <span className="project-watermark">{project.id}</span>
                <div className="visual-orbit" />
                <span className="visual-label">SELECTED / {project.year}</span>
              </div>
              <div className="project-info">
                <span className="project-number">{project.id}</span>
                <h2>{project.title}</h2>
                <p>{project.type}</p>
                <span className="project-arrow">↗</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="section-heading">
          <span>02 / 关于</span>
          <span>方法与态度</span>
        </div>
        <div className="about-grid">
          <p className="about-lead">我相信好的 UI，<br />应该让体验<span>清晰自然。</span></p>
          <div className="about-copy">
            <p>我从用户需求与业务目标出发，梳理信息层级和操作路径，并通过一致的视觉语言，让界面兼顾易用性与品质感。工作期间，我也参与公司活动海报设计，将界面设计中的秩序与品牌表达延展到视觉传播中。</p>
            <div className="service-list">
              <span>01 UI 界面设计</span>
              <span>02 交互体验</span>
              <span>03 组件与规范</span>
              <span>04 活动视觉支持</span>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact">
        <span className="footer-kicker">有一个想法？</span>
        <a className="contact-link" href="mailto:hello@lindesign.work">一起聊聊<span>↗</span></a>
        <div className="footer-bottom">
          <span>© 2026 LIN DESIGN</span>
          <span>BEHANCE · INSTAGRAM</span>
          <span>LOCAL TIME / GMT+8</span>
        </div>
      </footer>
    </main>
  );
}
