'use client';
import {useEffect, useRef, useState} from 'react';

export function CoverVideo({src, poster}: {src: string; poster: string}) {
  const video=useRef<HTMLVideoElement>(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const element=video.current;
    if (!element) return;
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible=false;
    let imageReady=false;
    let disposed=false;
    let frame: number | undefined;
    const image=element.closest('.project-composition-canvas')?.querySelector('img');
    // Keep the complete static cover visible until its image and a video frame
    // are decoded. In particular, never reveal a detached poster or phone island.
    const reveal=()=>{
      if (!imageReady || disposed || preference.matches) return;
      if (element.requestVideoFrameCallback) {
        if (frame!==undefined) element.cancelVideoFrameCallback(frame);
        frame=element.requestVideoFrameCallback(()=>{if (!disposed) setReady(true);});
      } else if (element.readyState>=2) setReady(true);
    };
    const sync=()=>{
      if (!imageReady || preference.matches || !visible || document.hidden) element.pause();
      else element.play().catch(()=>{});
    };
    image?.decode().then(()=>{if (!disposed) {imageReady=true;sync();}}).catch(()=>{});
    element.addEventListener('playing',reveal);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0});
    observer.observe(element);
    sync();
    preference.addEventListener('change',sync);
    document.addEventListener('visibilitychange',sync);
    return ()=>{disposed=true;if (frame!==undefined) element.cancelVideoFrameCallback(frame);element.removeEventListener('playing',reveal);observer.disconnect();preference.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);};
  },[]);
  return <div className="cover-video-screen" data-ready={ready} aria-hidden="true">
    <video ref={video} src={src} poster={poster} muted loop playsInline preload="metadata" />
    <span className="cover-video-island" />
  </div>;
}
