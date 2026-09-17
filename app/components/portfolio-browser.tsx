'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { GlassDialog } from './glass-dialog';
import { categoryImageCount, portfolio, portfolioImageCount, portfolioProjectCount, projectCover, projectImages } from '../data/portfolio';
import type { PortfolioImage } from '../data/portfolio';

function Artwork({ image, alt, detail = false }: { image: PortfolioImage; alt: string; detail?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <>
    <Image key={image.id} src={detail ? image.src : image.thumb} alt={alt} width={image.width} height={image.height}
      // Both sizes are pre-generated WebP assets; don't recompress the designer's artwork at runtime.
      unoptimized loading={detail ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />
    {failed && <span className="artwork-error" role="status">图片暂未加载，请重新打开或刷新页面。</span>}
  </>;
}

export function PortfolioBrowser({ initialCategoryId, close }: { initialCategoryId?: string; close: () => void }) {
  const [categoryId, setCategoryId] = useState(initialCategoryId ?? '');
  const [projectId, setProjectId] = useState('');
  const [groups, setGroups] = useState<Record<string, string>>({});
  const [imageId, setImageId] = useState('');
  const [zoomed, setZoomed] = useState(false);
  const imageStage = useRef<HTMLDivElement>(null);
  const category = portfolio.find((item) => item.id === categoryId);
  const project = category?.projects.find((item) => item.id === projectId);
  const groupId = project ? groups[project.id] ?? 'all' : 'all';
  const images = project ? groupId === 'all' ? projectImages(project) : project.groups.find((group) => group.id === groupId)?.images ?? [] : [];
  const imageIndex = images.findIndex((image) => image.id === imageId);
  const image = images[imageIndex];
  const viewKey = image ? `image-${projectId}` : project ? `project-${projectId}-${groupId}` : category ? `category-${category.id}` : 'categories';
  const chooseCategory = (id: string) => { setCategoryId(id); setProjectId(''); setImageId(''); };
  const chooseProject = (id: string) => { setProjectId(id); setImageId(''); };
  const showImage = (id: string) => { setImageId(id); setZoomed(false); imageStage.current?.scrollTo(0, 0); };
  const back = () => {
    if (image) { setImageId(''); setZoomed(false); }
    else if (project) setProjectId('');
    else chooseCategory('');
  };
  const stepImage = (step: number) => { const next = images[imageIndex + step]; if (next) showImage(next.id); };
  const title = image ? image.filename : project?.name ?? (category ? `${category.name} · 项目选择` : '从感兴趣的方向开始。');

  return <GlassDialog wide={Boolean(category)} title={title} close={close} back={category ? back : undefined} viewKey={viewKey} onEscape={image ? back : close}
    onKeyDown={(event) => {
      if (!image || zoomed || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); stepImage(event.key === 'ArrowLeft' ? -1 : 1); }
    }}
    breadcrumb={<nav aria-label="作品浏览路径"><button type="button" onClick={() => chooseCategory('')} aria-current={!category ? 'page' : undefined}>作品分类</button>{category && <><span aria-hidden="true">/</span><button type="button" onClick={() => chooseProject('')} aria-current={!project ? 'page' : undefined}>{category.name}</button></>}{project && <><span aria-hidden="true">/</span><button type="button" onClick={() => { setImageId(''); setZoomed(false); }} aria-current={!image ? 'page' : undefined}>{project.name}</button></>}{image && <><span aria-hidden="true">/</span><span aria-current="page">效果图</span></>}</nav>}>
    {!category && <>
      <p className="dialog-intro">三个设计方向，{portfolioProjectCount} 个项目，{portfolioImageCount} 张效果图。选择一个方向，继续探索。</p>
      <div className="choice-list">{portfolio.map((item, index) => <button type="button" key={item.id} onClick={() => chooseCategory(item.id)}>
        <span className="choice-number">0{index + 1}</span><span><strong>{item.name}</strong><small>{item.description}</small></span><span className="choice-count">{item.projects.length} 个项目</span>
      </button>)}</div>
    </>}
    {category && !project && <>
      <div className="collection-intro"><p>{category.description}</p><span>{category.projects.length} 个项目 <i>/</i> {categoryImageCount(category)} 张效果图</span></div>
      <div className="collection-grid">{category.projects.map((item, index) => <button type="button" className="collection-card" key={item.id} onClick={() => chooseProject(item.id)} aria-label={`查看 ${item.name}，${projectImages(item).length} 张效果图`}>
        <span className="collection-cover"><Artwork image={projectCover(item)} alt={`${item.name} · ${projectCover(item).name}`} /><span className="collection-number">{String(index + 1).padStart(2, '0')}</span></span>
        <span className="collection-card-info"><strong>{item.name}</strong><span>{projectImages(item).length} 张效果图{item.groups.length > 1 ? ` · ${item.groups.length} 个分组` : ''}</span><span className="collection-enter">查看项目 <span aria-hidden="true">↗</span></span></span>
      </button>)}</div>
    </>}
    {category && project && !image && <>
      <div className="collection-intro"><p>{category.english}</p><span>{projectImages(project).length} 张效果图 <i>/</i> 点击图片放大</span></div>
      {project.groups.length > 1 && <div className="gallery-filters" role="group" aria-label="效果图分组">{[{ id: 'all', name: '全部效果图', images: projectImages(project) }, ...project.groups].map((group) => <button type="button" key={group.id} className="small-button" aria-pressed={groupId === group.id} onClick={() => setGroups((current) => ({ ...current, [project.id]: group.id }))}>{group.name}<span>{group.images.length}</span></button>)}</div>}
      <div className="artwork-grid" aria-label={`${project.name}效果图`}>{images.map((item, index) => <button type="button" className={`artwork-card${item.height > item.width ? ' artwork-portrait' : ''}`} key={item.id} onClick={() => showImage(item.id)} aria-label={`放大 ${item.filename}`}>
        <span className="artwork-preview"><Artwork image={item} alt={`${project.name} · ${item.filename}`} /></span>
        <span className="artwork-caption"><span>{item.filename}</span><span>{String(index + 1).padStart(2, '0')} <span aria-hidden="true">↗</span></span></span>
      </button>)}</div>
      <div className="dialog-bottom collection-bottom"><span className="content-note">保留原有画面比例，横屏、竖屏均可放大查看。</span><button type="button" className="text-button" onClick={back}>返回项目选择</button></div>
    </>}
    {image && project && <>
      <div className="viewer-toolbar"><span aria-live="polite">{project.name} <i>/</i> {imageIndex + 1} / {images.length}</span><div><button type="button" className="small-button" aria-pressed={zoomed} onClick={() => { setZoomed(!zoomed); imageStage.current?.scrollTo(0, 0); }}>{zoomed ? '适应窗口' : '放大细看'}</button><a className="small-button" href={image.src} target="_blank" rel="noreferrer" aria-label="在新标签页打开高清预览图">打开高清图 <span aria-hidden="true">↗</span></a></div></div>
      <div ref={imageStage} className={`image-stage${zoomed ? ' is-zoomed' : ''}`} tabIndex={0} role="region" aria-label={zoomed ? '放大图片，可滚动查看细节' : '完整效果图预览'}><Artwork key={image.id} image={image} alt={`${project.name} · ${image.filename}`} detail /></div>
      <div className="viewer-navigation"><button type="button" className="small-button" onClick={() => stepImage(-1)} disabled={imageIndex === 0}>← 上一张</button><span className="content-note">{zoomed ? '滚动查看细节 · Esc 返回图集' : '← → 切换 · Esc 返回图集'}</span><button type="button" className="small-button" onClick={() => stepImage(1)} disabled={imageIndex === images.length - 1}>下一张 →</button></div>
    </>}
  </GlassDialog>;
}
