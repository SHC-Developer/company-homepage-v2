import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Lightbulb,
  CheckSquare2,
  Shield,
  Users,
  Search,
  ChevronDown,
  Phone,
  MapPin,
  Zap
} from 'lucide-react';
import { NAV_CONTENT_INSET_CLASS } from '@/lib/navContentInset';
import { withBaseUrl, setupLoopingVideo, portfolioImage, HERO_VIDEO_POSTER_DATA_URL } from '@/lib/utils';
import logo2 from '@/assets/logo2.png';

interface CategoryItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface SlideItem {
  id: string;
  text: string;
  imageSrc: string;
  highlightWords: string[];
}

const HIGHLIGHT_WORDS: Record<number, string[]> = {
  0: ['오늘'],
  1: ['안전', '쾌적'],
  2: ['나라건설'],
  3: ['사람', '사랑'],
  4: ['성장', '시설사업소'],
};

export const LandingSections = ({ onActiveIndexChange }: { onActiveIndexChange?: (index: number) => void }) => {
  const navigate = useNavigate();
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sitemapRef = useRef<HTMLDivElement>(null);
  const companyNameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0); // 0 is Hero, 1-5 are Slides, 6 is Sitemap
  const activeIndexRef = useRef(0);
  const viewportHeightRef = useRef<number>(window.visualViewport?.height ?? window.innerHeight);
  const [sitemapVisible, setSitemapVisible] = useState(false);
  const isScrollingRef = useRef(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  /** 슬라이드 등에서 히어로로 다시 올라올 때 hero-text-slide-down 애니메이션 재생 */
  const [heroTextAnimKey, setHeroTextAnimKey] = useState(0);
  const prevActiveIndexForHeroRef = useRef<number | null>(null);
  const touchStartYRef = useRef(0);
  const touchCurrentYRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const touchActiveRef = useRef(false);
  const touchMovedRef = useRef(false);
  const gestureStartIndexRef = useRef(0);

  // 모바일 감지 및 viewport 높이 동적 계산
  useEffect(() => {
    const checkMobile = () => {
      const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(touchCapable || window.innerWidth <= 768);
    };

    const getViewportHeight = () => Math.round(window.visualViewport?.height ?? window.innerHeight);

    const setVH = () => {
      const height = getViewportHeight();
      viewportHeightRef.current = height;
      const vh = height * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);

      // viewport 높이 변화(주소창 등)로 어긋나면 "현재 scrollY 기준"으로 가장 가까운 섹션 top에 재정렬
      // (뒤로가기 POP 복원과도 잘 맞도록 activeIndex가 아닌 scrollY 기반으로 계산)
      if (!touchActiveRef.current && !isScrollingRef.current) {
        const currentY = window.scrollY;
        const idx = Math.round(currentY / height);
        if (idx >= 0 && idx < totalSections) {
          const targetTop = idx * height;
          if (Math.abs(currentY - targetTop) > 1) {
            requestAnimationFrame(() => {
              window.scrollTo({ top: targetTop, behavior: 'auto' });
            });
          }
        }
      }
    };

    const handleResize = () => {
      checkMobile();
      setVH();
    };

    checkMobile();
    setVH();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', setVH);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', handleResize);
    vv?.addEventListener('scroll', setVH);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', setVH);
      vv?.removeEventListener('resize', handleResize);
      vv?.removeEventListener('scroll', setVH);
    };
  }, []);

  // 이미지 경로 헬퍼 함수
  const slides: SlideItem[] = useMemo(
    () => [
      {
        id: 'slide-1',
        text: '당신의 오늘은 안전하셨습니까?',
        imageSrc: portfolioImage('performance1'),
        highlightWords: HIGHLIGHT_WORDS[0],
      },
      {
        id: 'slide-2',
        text: '국민들의 안전하고 쾌적한',
        imageSrc: portfolioImage('performance3'),
        highlightWords: HIGHLIGHT_WORDS[1],
      },
      {
        id: 'slide-3',
        text: '아름다운 생활을 영위하는 나라건설',
        imageSrc: portfolioImage('performance5'),
        highlightWords: HIGHLIGHT_WORDS[2],
      },
      {
        id: 'slide-4',
        text: '사람과 사랑으로 융합된',
        imageSrc: portfolioImage('performance8'),
        highlightWords: HIGHLIGHT_WORDS[3],
      },
      {
        id: 'slide-5',
        text: '성장의 발자국을 남기는 시설사업소가 되겠습니다.',
        imageSrc: portfolioImage('performance12'),
        highlightWords: HIGHLIGHT_WORDS[4],
      },
    ],
    []
  );

  // 각 슬라이드(Hero 포함)의 애니메이션 완료 상태 추적
  // 0: Hero (항상 true 또는 즉시 true), 1-5: Slides, 6: Sitemap
  const totalSections = slides.length + 2; // Hero + Slides + Sitemap
  const animationCompletedRef = useRef<boolean[]>(new Array(totalSections).fill(false));
  
  // Hero는 항상 완료된 것으로 간주
  useEffect(() => {
    animationCompletedRef.current[0] = true;
    animationCompletedRef.current[totalSections - 1] = true;
  }, [totalSections]);

  // 다음 슬라이드 이미지 preload
  useEffect(() => {
    const nextSlideIdx = activeIndex; // activeIndex=0(Hero)→slides[0], activeIndex=1→slides[1], ...
    if (nextSlideIdx < slides.length) {
      const img = new Image();
      img.src = slides[nextSlideIdx].imageSrc;
    }
  }, [activeIndex, slides]);

  const handleAnimationComplete = useCallback((index: number) => {
    animationCompletedRef.current[index] = true;
  }, []);

  const handleAnimationReset = useCallback((index: number) => {
    animationCompletedRef.current[index] = false;
  }, []);

  const performScroll = useCallback((targetIndex: number) => {
    const height = viewportHeightRef.current;
    isScrollingRef.current = true;
    window.scrollTo({
      top: targetIndex * height,
      behavior: isMobile ? 'auto' : 'smooth',
    });
    setTimeout(() => {
      isScrollingRef.current = false;
    }, isMobile ? 200 : 800);
  }, [isMobile]);

  // 비디오 설정 (Hero Section용)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    return setupLoopingVideo(video, {
      onEndedPlayError: (e) => {
        console.error('비디오 재생 실패:', e);
        setVideoError(true);
      },
      onLoadError: () => {
        console.error('비디오 로드 실패');
        setVideoError(true);
      },
      onAutoplayError: (e) => {
        console.error('비디오 자동 재생 실패:', e);
      },
    });
  }, []);

  // 스크롤 기반 activeIndex 업데이트
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = viewportHeightRef.current;
      const index = Math.round(scrollY / height);
      
      if (index !== activeIndex && index >= 0 && index < totalSections) {
        setActiveIndex(index);
        onActiveIndexChange?.(index);
      }
      
      // 인디케이터 표시 여부 (데스크톱에서만, Hero 이후부터 표시)
      // 모든 버전에서 표시 (Hero 이후부터 표시)
      setShowIndicator(index > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeIndex, totalSections, isMobile]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const prev = prevActiveIndexForHeroRef.current;
    if (prev !== null && prev > 0 && activeIndex === 0) {
      setHeroTextAnimKey((k) => k + 1);
    }
    prevActiveIndexForHeroRef.current = activeIndex;
  }, [activeIndex]);

  // 스크롤 스냅을 위한 wheel 이벤트 처리 (데스크톱만)
  useEffect(() => {
    // 모바일에서는 스크롤 스냅 비활성화
    if (isMobile) return;

    const handleWheel = (e: WheelEvent) => {
      const scrollY = window.scrollY;
      const height = viewportHeightRef.current;
      const deltaY = e.deltaY;
      const currentIndex = Math.round(scrollY / height);

      // 마지막 페이지에서 아래로 스크롤할 때는 차단하지 않음
      if (currentIndex === totalSections - 1 && deltaY > 0) {
        return;
      }

      // 섹션 범위 내에 있으면 기본 스크롤 차단
      if (scrollY <= (totalSections - 1) * height + 50) {
        e.preventDefault();
      }

      if (isScrollingRef.current) return;

      // 애니메이션 완료 체크 (Slides 1-5인 경우)
      if (currentIndex >= 1 && currentIndex <= slides.length) {
        if (!animationCompletedRef.current[currentIndex]) {
          return;
        }
      }

      if (deltaY > 0 && currentIndex < totalSections - 1) {
        // 아래로 이동
        performScroll(currentIndex + 1);
      } else if (deltaY < 0 && currentIndex > 0) {
        // 위로 이동
        performScroll(currentIndex - 1);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isMobile, slides.length, totalSections, performScroll]);

  // 터치(모바일) 스크롤 스냅 처리
  useEffect(() => {
    if (!isMobile) return;

    const target = containerRef.current;
    if (!target) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      if (isScrollingRef.current) return;
      touchActiveRef.current = true;
      touchMovedRef.current = false;
      touchStartYRef.current = e.touches[0].clientY;
      touchCurrentYRef.current = e.touches[0].clientY;
      touchStartTimeRef.current = Date.now();
      gestureStartIndexRef.current = activeIndexRef.current;
    };
 
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchActiveRef.current) return;
      if (isScrollingRef.current) {
        e.preventDefault();
        return;
      }
      touchCurrentYRef.current = e.touches[0].clientY;
      const diffY = touchStartYRef.current - touchCurrentYRef.current;
      const startIndex = gestureStartIndexRef.current;

      if (Math.abs(diffY) > 2) {
        touchMovedRef.current = true;
        e.preventDefault(); // 브라우저 기본 스크롤/관성 차단
      }
    };

    const handleTouchEnd = () => {
      if (!touchActiveRef.current) return;

      const diffY = touchStartYRef.current - touchCurrentYRef.current;
      touchActiveRef.current = false;

      const currentIndex = activeIndexRef.current;

      const distanceThreshold = 30; // 30px만 움직여도 다음 페이지로

      const canMoveNext = currentIndex < totalSections - 1;
      const canMovePrev = currentIndex > 0;

      if (currentIndex >= 1 && currentIndex <= slides.length) {
        if (!animationCompletedRef.current[currentIndex]) {
          return;
        }
      }

      if (isScrollingRef.current) return;

      if (touchMovedRef.current && diffY > distanceThreshold && canMoveNext) {
        performScroll(currentIndex + 1);
      } else if (touchMovedRef.current && diffY < -distanceThreshold && canMovePrev) {
        performScroll(currentIndex - 1);
      } else {
        // 임계값 미만이면 현재 섹션에 고정(스냅)
        performScroll(currentIndex);
      }
    };

    const handleTouchCancel = () => {
      touchActiveRef.current = false;
      touchMovedRef.current = false;
    };

    target.addEventListener('touchstart', handleTouchStart, { passive: false });
    target.addEventListener('touchmove', handleTouchMove, { passive: false });
    target.addEventListener('touchend', handleTouchEnd, { passive: false });
    target.addEventListener('touchcancel', handleTouchCancel, { passive: false });

    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('touchend', handleTouchEnd);
      target.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [isMobile, slides.length, totalSections, performScroll]);

  const scrollToSection = (index: number) => {
    window.scrollTo({
      top: index * viewportHeightRef.current,
      behavior: isMobile ? 'auto' : 'smooth',
    });
  };

  // 사이트맵 섹션 visibility 관리
  useEffect(() => {
    // 터치/PC 모두: 마지막 섹션에서만 표시 (스냅 UX에 맞춤)
    setSitemapVisible(activeIndex === totalSections - 1);
  }, [activeIndex, totalSections]);

  const handleCategoryClick = (path: string, hash?: string) => {
    if (hash) {
      navigate(path);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      navigate(path);
    }
  };

  const renderHighlightedText = (text: string, highlightWords: string[], index: number, visible: boolean = true) => {
    if (highlightWords.length === 0) {
      return <>{text}</>;
    }

    let result: (string | JSX.Element)[] = [];
    let remainingText = text;

    highlightWords.forEach((word, wordIndex) => {
      const parts = remainingText.split(word);
      if (parts.length > 1) {
        if (parts[0]) {
          result.push(parts[0]);
        }
        result.push(
          <span
            key={`${index}-${wordIndex}`}
            style={{
              fontSize: 'clamp(1.5rem, 3vw + 0.75rem, 60pt)',
              color: '#ffffff',
              fontWeight: 800,
              textShadow: '0 0 20px rgba(0,0,0,0.5)',
              display: 'inline-block',
              opacity: visible ? 1 : 0,
              transform: visible ? 'scale(1)' : 'scale(0.85)',
              transition: 'opacity 0.4s ease 0.28s, transform 0.4s ease 0.48s',
            }}
          >
            {word}
          </span>
        );
        remainingText = parts.slice(1).join(word);
      }
    });
    
    if (remainingText) {
      result.push(remainingText);
    }

    if (index === 4) {
      const finalResult: (string | JSX.Element)[] = [];
      result.forEach((item, i) => {
        if (typeof item === 'string' && item.includes('을 남기는')) {
          const parts = item.split('을 남기는');
          if (parts[0]) finalResult.push(parts[0]);
          finalResult.push('을 남기는');
          finalResult.push(<br key={`br-${i}`} />);
          if (parts[1]) finalResult.push(parts[1]);
        } else {
          finalResult.push(item);
        }
      });
      return <>{finalResult}</>;
    }

    return <>{result}</>;
  };

  const categories: CategoryItem[] = [
    { id: 'ceo', label: '인사말', icon: <Building2 className="w-8 h-8" />, onClick: () => handleCategoryClick('/greeting', 'management-philosophy') },
    { id: 'vision', label: '비전 및 경영이념', icon: <Lightbulb className="w-8 h-8" />, onClick: () => handleCategoryClick('/greeting', 'management-philosophy') },
    { id: 'history', label: '회사연혁', icon: <CheckSquare2 className="w-8 h-8" />, onClick: () => handleCategoryClick('/greeting', 'company-history') },
    { id: 'license', label: '보유 면허 및 자격증', icon: <Shield className="w-8 h-8" />, onClick: () => handleCategoryClick('/greeting', 'license') },
    { id: 'organization', label: '조직도', icon: <Users className="w-8 h-8" />, onClick: () => handleCategoryClick('/greeting', 'organization-chart') },
    { id: 'portfolio', label: '수행 실적', icon: <Search className="w-8 h-8" />, onClick: () => handleCategoryClick('/portfolio') },
  ];

  const SLIDE_LAYOUTS = [
    { justify: 'justify-center',             align: 'items-start',  textAlign: 'text-left',   bgPos: 'right top',    mobileBgPos: '30% top',      panFrom: 'scale(1.0) translate(2%, 1%)',   panTo: 'scale(1.08) translate(-2%, -1%)', hiddenTransform: 'translate(-24px, -12px)' },
    { justify: 'justify-center',             align: 'items-center', textAlign: 'text-center', bgPos: 'center',       mobileBgPos: 'center',       panFrom: 'scale(1.0) translate(0, 2%)',    panTo: 'scale(1.08) translate(0, -2%)',   hiddenTransform: 'translate(0, -24px)'    },
    { justify: 'justify-center',             align: 'items-end',    textAlign: 'text-right',  bgPos: 'left center',  mobileBgPos: 'left center',  panFrom: 'scale(1.0) translate(-2%, 1%)',  panTo: 'scale(1.08) translate(2%, -1%)', hiddenTransform: 'translate(24px, -12px)'  },
    { justify: 'justify-end pb-32 sm:pb-40', align: 'items-start',  textAlign: 'text-left',   bgPos: 'right center', mobileBgPos: 'right center', panFrom: 'scale(1.0) translate(-1%, -2%)', panTo: 'scale(1.08) translate(1%, 2%)',  hiddenTransform: 'translate(24px, 12px)'  },
    { justify: 'justify-end pb-32 sm:pb-40', align: 'items-center', textAlign: 'text-center', bgPos: 'center',       mobileBgPos: 'center',       panFrom: 'scale(1.0) translate(2%, -1%)',  panTo: 'scale(1.08) translate(-2%, 1%)', hiddenTransform: 'translate(-24px, 12px)' },
  ];

  const SlideComponent: React.FC<{
    slide: SlideItem;
    index: number;
    isActive: boolean;
    onAnimationComplete: () => void;
    onAnimationReset: () => void;
    isMobile: boolean;
  }> = ({ slide, index, isActive, onAnimationComplete, onAnimationReset, isMobile }) => {
    const [visible, setVisible] = useState(false);
    const [fadeOverlay, setFadeOverlay] = useState(true);
    const [bgZoomed, setBgZoomed] = useState(false);
    const layout = SLIDE_LAYOUTS[index % SLIDE_LAYOUTS.length];
    const effectiveBgPos = isMobile ? layout.mobileBgPos : layout.bgPos;

    useEffect(() => {
      if (isActive) {
        // 페이드인: 검은 오버레이를 먼저 띄우고 바로 fade-out
        setFadeOverlay(true);
        setBgZoomed(false); // scale 리셋 (1.0 상태 확보)
        const fadeTimer = setTimeout(() => setFadeOverlay(false), 30);
        setVisible(true);
        // 두 프레임 후 scale 증가 → transition 발동
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setBgZoomed(true));
        });
        const animTimer = setTimeout(() => {
          onAnimationComplete();
        }, 1000);
        return () => { clearTimeout(fadeTimer); clearTimeout(animTimer); };
      } else {
        setVisible(false);
        setFadeOverlay(true);
        setBgZoomed(false);
        onAnimationReset();
      }
    }, [isActive, onAnimationComplete, onAnimationReset]);

    return (
      <div className="relative w-full overflow-hidden bg-black" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
        {/* 동적 배경 애니메이션 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${slide.imageSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: effectiveBgPos,
            transform: bgZoomed ? layout.panTo : layout.panFrom,
            transition: isMobile
              ? 'transform 3.5s cubic-bezier(0.2, 0.6, 0.2, 1)'
              : 'transform 3.5s cubic-bezier(0.2, 0.6, 0.2, 1), filter 1.2s ease-out',
            filter: isMobile ? 'none' : (bgZoomed ? 'blur(0px)' : 'blur(4px)'),
          }}
        />
        {/* 텍스트 출현과 동기된 추가 오버레이 애니메이션 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isActive && visible ? 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.1) 100%)' : 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 100%)',
            transition: 'background 1.2s ease-out',
            zIndex: 5,
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        {/* 하단 그라디언트 — 인디케이터 가독성 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)' }}
        />
        {/* 페이드 전환 오버레이 */}
        <div
          className="absolute inset-0 bg-black pointer-events-none z-20"
          style={{
            opacity: fadeOverlay ? 1 : 0,
            transition: fadeOverlay ? 'none' : 'opacity 0.5s ease',
          }}
        />
        <div className={`relative z-10 h-full flex flex-col text-white ${layout.justify}`}>
          <div className={`w-[95%] sm:w-[90%] md:w-[85%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col ${layout.align}`}>
            <div
              className={`transition-all duration-1000 ${layout.textAlign}`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translate(0, 0)' : layout.hiddenTransform,
              }}
            >
              <h2 className="font-korean font-thin leading-relaxed mb-6 drop-shadow-2xl" style={{ color: '#ffffff', fontSize: 'clamp(1.25rem, 2.5vw + 0.5rem, 45pt)' }}>
                {renderHighlightedText(slide.text, slide.highlightWords, index, visible)}
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        // PC 이하(터치 디바이스)에서는 자유 스크롤 제거: 항상 스냅만 동작
        touchAction: isMobile ? 'none' : 'auto',
        overscrollBehavior: isMobile ? 'none' : 'auto',
      }}
    >
      {/* Side Indicator */}
      {showIndicator && activeIndex < totalSections - 1 && (
        <nav
          className="fixed bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-50 flex flex-row gap-3 sm:gap-4 pb-[env(safe-area-inset-bottom)]"
          style={{ touchAction: 'manipulation' }}
          aria-label="페이지 이동"
        >
          {Array.from({ length: totalSections }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToSection(i)}
              className="group relative flex items-center justify-center p-1.5"
              aria-label={`${i + 1}번째 섹션으로 이동`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === activeIndex
                    ? 'w-5 bg-white'
                    : 'w-2 bg-white/40'
                }`}
              />
            </button>
          ))}
        </nav>
      )}

      {/* 1. Hero Section (Index 0) */}
      <section id="hero-section" className="relative w-full overflow-hidden" style={{ backgroundColor: '#1e3f64', height: 'calc(var(--vh, 1vh) * 100)' }}>
        <div className="absolute inset-0 z-0">
          {!videoError ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                className="absolute top-1/2 left-1/2 w-[177.77vh] h-[56.25vw] min-h-full min-w-full transform -translate-x-1/2 -translate-y-1/2 object-cover"
                src={`${import.meta.env.BASE_URL}video/Main1.mp4`}
                poster={HERO_VIDEO_POSTER_DATA_URL}
                autoPlay
                muted
                playsInline
                loop={false}
                preload={isMobile ? 'none' : 'auto'}
                style={{ pointerEvents: 'none' }}
              />
              <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.05) 100%)' }}></div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary-hover" style={{ backgroundImage: `linear-gradient(135deg, rgba(13, 42, 74, 0.8), rgba(30, 111, 217, 0.8))` }} />
          )}
        </div>
        {/* Hero Text Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-start pt-[32vh] text-white">
          <div className="w-[95%] sm:w-[90%] md:w-[85%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div key={heroTextAnimKey} className="max-w-lg">
            <p className="hero-text-slide-down text-[10px] max-sm:leading-snug sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] italic max-sm:text-white/75 sm:text-white/60 mb-3 whitespace-nowrap">
              Engineering Safety. Inspiring Innovation.
            </p>
            <h1
              className="hero-text-slide-down font-korean font-light drop-shadow-lg mb-3 pb-2 border-b border-white/40 inline-block"
              style={{ fontSize: 'clamp(1.2rem, 2vw + 0.5rem, 2.2rem)' }}
            >
              안전한 대한민국을 만듭니다
            </h1>
            <p className="hero-text-slide-down text-xs sm:text-sm text-white/75 font-korean mb-6 leading-relaxed">
              20년의 기술력으로<br />국가 시설물의 안전을 책임집니다
            </p>
            <div
              className="hero-text-slide-down flex gap-4"
              style={{ animationDelay: '1.4s' }}
            >
              <button
                onClick={() => navigate('/portfolio')}
                className="hero-link text-xs sm:text-sm text-white/75 font-korean hover:text-white transition-colors duration-200"
              >
                수행실적 보기 →
              </button>
              <button
                onClick={() => navigate('/greeting')}
                className="hero-link text-xs sm:text-sm text-white/75 font-korean hover:text-white transition-colors duration-200"
              >
                회사 소개 →
              </button>
            </div>
          </div>
          </div>
        </div>
        {/* Scroll Down Indicator — 전폭 기준 flex 중앙(변환 누적·스크롤바 영향 완화) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4 sm:bottom-6 md:bottom-8 pb-[max(0rem,env(safe-area-inset-bottom,0px))]">
          <div className="flex flex-col items-center gap-1 animate-bounce">
            <span className="text-[7pt] text-white/40 tracking-[0.2em] uppercase">Scroll</span>
            <ChevronDown className="h-4 w-4 text-white/40" />
          </div>
        </div>
        {/* 우측 세로: © 회사명 + 올림픽대교 캡션 나란히(세로쓰기) */}
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-row items-center gap-2.5 sm:gap-3">
          <p
            className="text-xs sm:text-sm text-white/65 font-korean tracking-[0.12em] shrink-0"
            style={{ writingMode: 'vertical-rl' }}
          >
            25.10.25 올림픽대교 전경
          </p>
        </div>
      </section>

      {/* 2. Slides (Index 1-5) and Sitemap Footer (Index 6) */}
      <div id="sitemap-section" className="flex flex-col">
        {slides.map((slide, index) => (
          <SlideComponent
            key={slide.id}
            slide={slide}
            index={index}
            isActive={activeIndex === index + 1}
            onAnimationComplete={() => handleAnimationComplete(index + 1)}
            onAnimationReset={() => handleAnimationReset(index + 1)}
            isMobile={isMobile}
          />
        ))}

        {/* 3. Sitemap Footer Section (Index 6) */}
        <div
          ref={sitemapRef}
          className="relative box-border flex w-full flex-col overflow-hidden pb-[max(0.35rem,env(safe-area-inset-bottom,0px))]"
          style={{
            background: 'radial-gradient(ellipse at 50% 45%, #122438 0%, #0B1C2B 55%, #060f18 100%)',
            height: 'calc(var(--vh, 1vh) * 100)',
          }}
        >
          {/* 중앙 콘텐츠 래퍼 — min-h-0으로 자식이 축소 가능(모바일 한 화면) */}
          <div
            className={`relative z-10 flex min-h-0 flex-1 flex-col justify-center ${NAV_CONTENT_INSET_CLASS}`}
          >

          {/* 상단 타이틀 영역 — 태블릿/모바일 세로 여백 축소 */}
          <div className="flex w-full min-h-0 flex-col items-stretch pt-7 pb-2 sm:pt-12 sm:pb-3 md:pt-16 md:pb-4 lg:pt-24 lg:pb-5 xl:pt-28 xl:pb-6">
            <div className="w-full">
              {/* 사업분야 — 모바일: 카드행과 동일 너비(w-full) · sm+: 가로 0.8배 */}
              <div className="mx-auto w-full max-w-full sm:w-[80%]">
                {/* 모바일 2×2 / sm+ 4열 한 줄; 모바일은 간격·pill 축소 */}
                <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4 lg:gap-5">
                  {['안전진단전문기관', '엔지니어링사업', '건설엔지니어링업', '초경량비행장치사용사업'].map((area, i) => (
                    <span
                      key={area}
                      className="box-border flex min-h-[2.4rem] min-w-0 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/5 px-1.5 py-1.5 font-korean font-light text-white/90 max-sm:min-h-[2.35rem] sm:min-h-[2.75rem] sm:rounded-full sm:px-2 sm:py-2 md:px-2.5"
                      style={{
                        opacity: sitemapVisible ? 1 : 0,
                        transform: sitemapVisible ? 'translateY(0)' : 'translateY(8px)',
                        transition: `opacity 0.6s ease ${0.08 + i * 0.12}s, transform 0.6s ease ${0.08 + i * 0.12}s`,
                      }}
                    >
                      <span
                        className="block min-w-0 max-w-full whitespace-nowrap text-center text-[clamp(0.5rem,2.4vw+0.26rem,0.74rem)] leading-tight tracking-tight sm:text-[clamp(0.48rem,0.65vw+0.28rem,0.82rem)] md:text-[clamp(0.52rem,0.55vw+0.32rem,0.88rem)] lg:text-[clamp(0.56rem,0.48vw+0.36rem,0.94rem)]"
                      >
                        {area}
                      </span>
                    </span>
                  ))}
                </div>
                {/* 하단 구분선 — 주요사업 블록 너비에 맞춤 */}
                <div
                  className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent sm:mt-5 md:mt-8"
                  style={{ maxWidth: '100%', width: sitemapVisible ? '100%' : '0%', transition: 'width 0.9s ease 0.55s' }}
                />
              </div>
            </div>
          </div>

          {/* 두 카드 영역 — 모바일만 카드 세로 2배, sm 이상은 기존 단계 */}
          <div
            className="flex w-full shrink-0 items-stretch gap-2 pb-0 sm:gap-3 md:gap-4 lg:gap-5 h-[clamp(14.5rem,44dvh,25rem)] sm:h-[clamp(8rem,26dvh,17rem)] md:h-[clamp(9.5rem,32dvh,22rem)] lg:h-[clamp(11rem,42dvh,28rem)] xl:h-[clamp(12.5rem,50vh,36.25rem)]"
          >
            {/* 카드 1 — 보유면허 및 기술 */}
            <button
              onClick={() => handleCategoryClick('/greeting', 'license')}
              className="group relative flex-1 overflow-hidden rounded-xl sm:rounded-2xl text-left focus:outline-none"
              style={{
                opacity: sitemapVisible ? 1 : 0,
                transform: sitemapVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.65s ease 0.2s, transform 0.65s ease 0.2s',
              }}
            >
              {/* 배경: performance4 현장 사진 */}
              <div
                className="absolute inset-0 bg-center bg-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                style={{ backgroundImage: `url('${portfolioImage('performance4')}')` }}
              />
              {/* 다크 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C2B]/88 via-[#0B1C2B]/25 to-[#0B1C2B]/5 group-hover:via-[#0B1C2B]/35 transition-all duration-500" />
              {/* 상단 블러 오버레이 */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-[2px]" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }} />
              {/* 상단 배지 */}
              <div className="absolute top-4 sm:top-5 left-4 sm:left-6">
                <span className="inline-block px-2.5 py-1 rounded-full border border-white/30 bg-white/10 text-white/85 text-xs font-korean tracking-wide backdrop-blur-sm">
                  자격 &amp; 인증
                </span>
              </div>
              {/* 하단 텍스트 - 짙은 배경 추가 */}
              <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4 sm:pb-6 flex items-end justify-between bg-gradient-to-t from-[#0B1C2B]/95 via-[#0B1C2B]/60 to-transparent pt-10">
                <div>
                  <h3 className="font-korean font-semibold text-white text-sm sm:text-xl lg:text-2xl leading-tight whitespace-nowrap">
                    보유면허 및 기술
                  </h3>
                  <p className="mt-1 text-white/70 text-xs sm:text-sm font-korean">회사소개 바로가기</p>
                </div>
                <div className="ml-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/25 flex items-center justify-center bg-white/8 group-hover:bg-white group-hover:border-white transition-all duration-300 shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:text-[#0B1C2B] transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* 카드 2 — 지명원 다운로드 */}
            <a
              href={withBaseUrl(
                '%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD%EC%83%81%EC%9D%B4%EA%B5%B0%EA%B2%BD%ED%9A%8C%EC%8B%9C%EC%84%A4%EC%82%AC%EC%97%85%EC%86%8C%20%EC%A7%80%EB%AA%85%EC%9B%90.pdf'
              )}
              download="대한민국상이군경회시설사업소 지명원.pdf"
              className="group relative flex-1 overflow-hidden rounded-xl sm:rounded-2xl text-left focus:outline-none"
              style={{
                opacity: sitemapVisible ? 1 : 0,
                transform: sitemapVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.65s ease 0.35s, transform 0.65s ease 0.35s',
                textDecoration: 'none',
              }}
            >
              {/* 배경: performance11 현장 사진 */}
              <div
                className="absolute inset-0 bg-center bg-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                style={{ backgroundImage: `url('${portfolioImage('performance11')}')` }}
              />
              {/* 다크 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#122A4A]/88 via-[#122A4A]/25 to-[#122A4A]/5 group-hover:via-[#122A4A]/35 transition-all duration-500" />
              {/* 상단 블러 오버레이 */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-[2px]" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }} />
              {/* 상단 배지 */}
              <div className="absolute top-4 sm:top-5 left-4 sm:left-6">
                <span className="inline-block px-2.5 py-1 rounded-full border border-white/30 bg-white/10 text-white/85 text-xs font-korean tracking-wide backdrop-blur-sm">
                  PDF 다운로드
                </span>
              </div>
              {/* 하단 텍스트 - 짙은 배경 추가 */}
              <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4 sm:pb-6 flex items-end justify-between bg-gradient-to-t from-[#122A4A]/95 via-[#122A4A]/60 to-transparent pt-10">
                <div>
                  <h3 className="font-korean font-semibold text-white text-sm sm:text-xl lg:text-2xl leading-tight whitespace-nowrap">
                    지명원 다운로드
                  </h3>
                  <p className="mt-1 text-white/70 text-xs sm:text-sm font-korean">회사 소개 자료</p>
                </div>
                <div className="ml-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/25 flex items-center justify-center bg-white/8 group-hover:bg-[#1D66B3] group-hover:border-[#1D66B3] transition-all duration-300 shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          </div>{/* /중앙 콘텐츠 래퍼 */}

          {/* Footer 스트립: 전폭 구분선 + 본문은 네비와 동일 너비 + 브라우저/제스처 바 안전 여백 */}
          <div className="relative z-10 mt-1 w-full shrink-0 border-t border-white/10 md:mt-2">
            <div
              className={`${NAV_CONTENT_INSET_CLASS} py-2.5 sm:py-3 md:py-4 lg:py-5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]`}
            >
            {/* 데스크톱·태블릿 — 그리드로 주소 열을 남은 폭 전체 사용 + 우측 정렬·반응형 글자 */}
            <div className="hidden sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start sm:gap-x-3 md:gap-x-5 text-white">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 md:gap-x-5">
                <div className="flex items-center gap-2 whitespace-nowrap text-[clamp(0.6875rem,0.45vw+0.48rem,0.9375rem)]">
                  <Phone className="w-4 h-4 text-white flex-shrink-0" strokeWidth={1.75} />
                  <span className="font-korean font-medium">TEL</span>
                  <span className="font-english font-medium">02)572-6218</span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap text-[clamp(0.6875rem,0.45vw+0.48rem,0.9375rem)]">
                  <Phone className="w-4 h-4 text-white flex-shrink-0" strokeWidth={1.75} />
                  <span className="font-korean font-medium">FAX</span>
                  <span className="font-english font-medium">050-5115-9274</span>
                </div>
              </div>
              <div className="flex min-w-0 justify-end text-right">
                <div className="flex max-w-full items-start justify-end gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" strokeWidth={1.75} />
                  <span className="min-w-0 max-w-full font-korean font-medium leading-snug text-[clamp(0.58rem,0.5vw+0.36rem,0.875rem)] md:text-[clamp(0.625rem,0.42vw+0.4rem,0.9rem)] lg:text-[clamp(0.6875rem,0.35vw+0.45rem,0.9375rem)] lg:whitespace-nowrap">
                    경기도 성남시 분당구 판교역로 230, 907호 (삼환하이펙스B동, 삼평동)
                  </span>
                </div>
              </div>
            </div>
            {/* 모바일: 1행 TEL·FAX 나란히 → 2행 주소 전체 폭 */}
            <div className="sm:hidden flex flex-col gap-2.5 text-white text-xs leading-snug">
              <div className="flex flex-row flex-wrap items-center gap-x-5 gap-y-1">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Phone className="w-3.5 h-3.5 text-white flex-shrink-0" strokeWidth={2} />
                  <span className="font-korean font-medium">TEL</span>
                  <span className="font-english font-medium">02)572-6218</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Phone className="w-3.5 h-3.5 text-white flex-shrink-0" strokeWidth={2} />
                  <span className="font-korean font-medium">FAX</span>
                  <span className="font-english font-medium">050-5115-9274</span>
                </div>
              </div>
              <div className="flex w-full items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-white flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="min-w-0 flex-1 font-korean font-medium text-[11px] leading-snug whitespace-normal break-words">
                  경기도 성남시 분당구 판교역로 230, 907호 (삼환하이펙스B동, 삼평동)
                </span>
              </div>
            </div>
            </div>
          </div>

          {/* 비네팅 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(4, 10, 17, 0.55) 100%)' }}
          />
        </div>
      </div>
    </div>
  );
};

