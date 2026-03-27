import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop = ({ hidden = false }: { hidden?: boolean }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className="hidden md:block fixed bottom-8 right-8 bg-white/90 hover:bg-white text-[hsl(210,73%,17%)] p-2.5 rounded-full shadow-md border border-gray-200 hover:shadow-lg z-40 transition-all duration-300"
      aria-label="페이지 상단으로 이동"
      style={{
        opacity: isVisible && !hidden ? 1 : 0,
        pointerEvents: isVisible && !hidden ? 'auto' : 'none',
      }}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
