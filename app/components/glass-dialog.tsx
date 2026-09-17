'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

interface GlassDialogProps {
  title: string;
  breadcrumb: ReactNode;
  close: () => void;
  children: ReactNode;
  wide?: boolean;
  viewKey?: string;
  back?: () => void;
  onEscape?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDialogElement>) => void;
}

export function GlassDialog({ title, breadcrumb, close, children, wide = false, viewKey = title, back, onEscape, onKeyDown }: GlassDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const scrollPositions = useRef(new Map<string, number>());
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  useLayoutEffect(() => {
    const dialog = ref.current;
    // Preserve each level's reading position when returning from an image/project.
    if (dialog) dialog.scrollTop = scrollPositions.current.get(viewKey) ?? 0;
    titleRef.current?.focus({ preventScroll: true });
  }, [viewKey]);

  return <dialog ref={ref} className={`detail-dialog glass${wide ? ' portfolio-dialog' : ''}`} aria-labelledby="dialog-title"
    onScroll={(event) => scrollPositions.current.set(viewKey, event.currentTarget.scrollTop)}
    onKeyDown={onKeyDown}
    onCancel={(event) => { event.preventDefault(); (onEscape ?? close)(); }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
    }}>
    <div className="dialog-top">
      <div className="dialog-breadcrumb">{breadcrumb}</div>
      <div className="dialog-actions">{back && <button type="button" className="small-button" onClick={back}>返回上一级</button>}<button type="button" className="small-button" onClick={close} autoFocus aria-label="关闭详情界面">关闭</button></div>
    </div>
    <div className="dialog-body"><h2 id="dialog-title" ref={titleRef} tabIndex={-1}>{title}</h2>{children}</div>
  </dialog>;
}
