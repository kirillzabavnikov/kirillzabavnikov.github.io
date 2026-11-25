'use client';
import {useEffect, useRef} from 'react';

export function CoverVideo({src, poster}: {src: string; poster: string}) {
  const video=useRef<HTMLVideoElement>(null);
  useEffect(()=>{
    const element=video.current;
    if (!element) return;
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible=false;
    const sync=()=>{
      if (preference.matches || !visible || document.hidden) element.pause();
      else element.play().catch(()=>{});
    };
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0});
    observer.observe(element);
    sync();
    preference.addEventListener('change',sync);
    document.addEventListener('visibilitychange',sync);
    return ()=>{observer.disconnect();preference.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);};
  },[]);
  return <div className="cover-video-screen" aria-hidden="true">
    <video ref={video} src={src} poster={poster} muted loop playsInline preload="metadata" />
    <span className="cover-video-island" />
  </div>;
}
