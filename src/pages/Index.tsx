import React, { useState, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { LandingSections } from '@/components/LandingSections';
import { ScrollToTop } from '@/components/ScrollToTop';

const TOTAL_SECTIONS = 7; // Hero(0) + Slides(1-5) + Sitemap(6)

const Index = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const handleActiveIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // 슬라이드 섹션(1~5)에서는 ScrollToTop 숨김
  const isOnSlides = activeIndex > 0 && activeIndex < TOTAL_SECTIONS - 1;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      <main className="overflow-x-hidden">
        <LandingSections onActiveIndexChange={handleActiveIndexChange} />
      </main>
<ScrollToTop hidden={isOnSlides} />
    </div>
  );
};

export default Index;
