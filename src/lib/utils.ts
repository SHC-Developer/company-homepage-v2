import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function withBaseUrl(path: string) {
  const baseUrl = import.meta.env.BASE_URL ?? '/';
  const normalized = path.replace(/^\/+/, '');
  return `${baseUrl}${normalized}`;
}

/** 히어로 영상 poster: 네트워크 없이 메인 히어로 배경색(#1e3f64)과 동일한 단색(파란 빈 화면) */
export const HERO_VIDEO_POSTER_DATA_URL =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9" viewBox="0 0 16 9"><rect width="16" height="9" fill="#1e3f64"/></svg>'
  );

let _webpSupported: boolean | null = null;
export function supportsWebP(): boolean {
  if (_webpSupported !== null) return _webpSupported;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    _webpSupported = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    _webpSupported = false;
  }
  return _webpSupported;
}

export function portfolioImage(name: string): string {
  const ext = supportsWebP() ? 'webp' : 'jpg';
  return withBaseUrl(`portfolio/${name}.${ext}`);
}

export function setupLoopingVideo(
  video: HTMLVideoElement,
  handlers: {
    onEndedPlayError?: (error: unknown) => void;
    onLoadError?: () => void;
    onAutoplayError?: (error: unknown) => void;
  } = {}
) {
  const handleEnded = () => {
    video.currentTime = 0;
    video.play().catch((e) => handlers.onEndedPlayError?.(e));
  };

  const handleError = () => {
    handlers.onLoadError?.();
  };

  video.addEventListener('ended', handleEnded);
  video.addEventListener('error', handleError);

  // 자동 재생 시도 (브라우저 정책으로 실패할 수 있음)
  video.play().catch((e) => handlers.onAutoplayError?.(e));

  return () => {
    video.removeEventListener('ended', handleEnded);
    video.removeEventListener('error', handleError);
  };
}
