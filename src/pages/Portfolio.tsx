import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { withBaseUrl, portfolioImage } from '@/lib/utils';
import { Search } from 'lucide-react';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface PortfolioData {
  year: number;
  '정밀안전진단': number;
  '정밀안전검검': number;
  '설계': number;
  '감리': number;
  '기타': number;
  '합계': number;
}

interface PerformanceRecord {
  year: string;
  contractName: string;
  client: string;
}

const useInViewOnce = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  

  useEffect(() => {
    const el = ref.current;
    if (!el || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isInView]);

  return { ref, isInView };
};

const Reveal = ({
  children,
  className = '',
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) => {
  const { ref, isInView } = useInViewOnce();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={
        'motion-reduce:opacity-100 motion-reduce:translate-y-0 ' +
        'transition-all duration-700 ease-out will-change-transform ' +
        (isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5') +
        (className ? ` ${className}` : '')
      }
    >
      {children}
    </div>
  );
};

const portfolioData: PortfolioData[] = [
  { year: 2003, '정밀안전진단': 4, '정밀안전검검': 0, '설계': 0, '감리': 0, '기타': 0, '합계': 4 },
  { year: 2004, '정밀안전진단': 6, '정밀안전검검': 3, '설계': 2, '감리': 0, '기타': 1, '합계': 12 },
  { year: 2005, '정밀안전진단': 5, '정밀안전검검': 6, '설계': 3, '감리': 0, '기타': 2, '합계': 16 },
  { year: 2006, '정밀안전진단': 8, '정밀안전검검': 7, '설계': 0, '감리': 5, '기타': 1, '합계': 21 },
  { year: 2007, '정밀안전진단': 10, '정밀안전검검': 11, '설계': 2, '감리': 0, '기타': 2, '합계': 25 },
  { year: 2008, '정밀안전진단': 17, '정밀안전검검': 11, '설계': 3, '감리': 0, '기타': 2, '합계': 33 },
  { year: 2009, '정밀안전진단': 9, '정밀안전검검': 19, '설계': 3, '감리': 0, '기타': 1, '합계': 32 },
  { year: 2010, '정밀안전진단': 6, '정밀안전검검': 21, '설계': 5, '감리': 10, '기타': 0, '합계': 42 },
  
  { year: 2011, '정밀안전진단': 11, '정밀안전검검': 14, '설계': 6, '감리': 21, '기타': 0, '합계': 52 },
  { year: 2012, '정밀안전진단': 7, '정밀안전검검': 21, '설계': 10, '감리': 23, '기타': 0, '합계': 61 },
  { year: 2013, '정밀안전진단': 12, '정밀안전검검': 16, '설계': 8, '감리': 13, '기타': 0, '합계': 49 },
  { year: 2014, '정밀안전진단': 4, '정밀안전검검': 20, '설계': 3, '감리': 5, '기타': 0, '합계': 32 },
  { year: 2015, '정밀안전진단': 2, '정밀안전검검': 14, '설계': 1, '감리': 19, '기타': 2, '합계': 38 },
  { year: 2016, '정밀안전진단': 7, '정밀안전검검': 18, '설계': 4, '감리': 11, '기타': 1, '합계': 41 },
  { year: 2017, '정밀안전진단': 7, '정밀안전검검': 15, '설계': 8, '감리': 11, '기타': 3, '합계': 44 },
  { year: 2018, '정밀안전진단': 4, '정밀안전검검': 22, '설계': 4, '감리': 17, '기타': 2, '합계': 49 },
  { year: 2019, '정밀안전진단': 8, '정밀안전검검': 17, '설계': 7, '감리': 11, '기타': 0, '합계': 43 },
  { year: 2020, '정밀안전진단': 9, '정밀안전검검': 21, '설계': 8, '감리': 13, '기타': 0, '합계': 51 },
  { year: 2021, '정밀안전진단': 4, '정밀안전검검': 15, '설계': 4, '감리': 2, '기타': 3, '합계': 28 },
  { year: 2022, '정밀안전진단': 6, '정밀안전검검': 13, '설계': 4, '감리': 0, '기타': 0, '합계': 23 },
  { year: 2023, '정밀안전진단': 3, '정밀안전검검': 27, '설계': 6, '감리': 2, '기타': 2, '합계': 40 },
  { year: 2024, '정밀안전진단': 2, '정밀안전검검': 23, '설계': 6, '감리': 4, '기타': 3, '합계': 38 },
  { year: 2025, '정밀안전진단': 5, '정밀안전검검': 25, '설계': 3, '감리': 0, '기타': 0, '합계': 33 },
];

const PerformanceTableSection = ({
  id,
  title,
  records,
  description,
}: {
  id: string;
  title: string;
  records: PerformanceRecord[];
  description: string;
}) => {
  if (records.length === 0) return null;

  return (
    <section id={id} className="mt-12 sm:mt-14 md:mt-16 scroll-mt-32">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-0 mb-3">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1.5 rounded-full bg-gradient-to-b from-[#0C2B4B] to-[#1E6FD9]" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold font-korean tracking-tight text-slate-900">
              {title}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-korean">
            <span className="font-semibold tabular-nums text-slate-700">{records.length.toLocaleString()}</span>
            {description}
          </p>
        </div>
      </Reveal>

      <Reveal delayMs={80}>
        <Card className="border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-white/70 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          <CardContent className="pt-3 sm:pt-4 pb-3 sm:pb-4 px-2 sm:px-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-xs sm:text-sm md:text-base min-w-[726px] sm:min-w-[876px] lg:min-w-[1016px]">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th
                        className="w-[86px] sm:w-[96px] px-2 sm:px-3 py-2 sm:py-3 text-center text-white font-korean font-semibold border-r border-slate-200 whitespace-nowrap"
                        style={{ backgroundColor: '#0C2B4B' }}
                      >
                        년도
                      </th>
                      <th
                        className="w-[320px] sm:w-[420px] lg:w-[540px] px-2 sm:px-3 py-2 sm:py-3 text-center text-white font-korean font-semibold border-r border-slate-200 whitespace-nowrap"
                        style={{ backgroundColor: '#0C2B4B' }}
                      >
                        계약명
                      </th>
                      <th
                        className="w-[320px] sm:w-[360px] lg:w-[380px] px-2 sm:px-3 py-2 sm:py-3 text-center text-white font-korean font-semibold whitespace-nowrap"
                        style={{ backgroundColor: '#0C2B4B' }}
                      >
                        발주처
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((row, index) => (
                      <tr
                        key={`${row.year}-${index}`}
                        className={
                          'border-b border-slate-100 last:border-b-0 transition-colors duration-200 ' +
                          (index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60') +
                          ' hover:bg-blue-50/60'
                        }
                      >
                        <td className="px-2 sm:px-3 py-2 text-center font-korean text-slate-900 border-r border-slate-200 whitespace-nowrap tabular-nums">
                          {row.year}
                        </td>
                        <td
                          className="px-2 sm:px-3 py-2 text-left font-korean text-slate-900 border-r border-slate-200 break-keep whitespace-normal md:whitespace-nowrap md:truncate"
                          title={row.contractName}
                        >
                          {row.contractName}
                        </td>
                        <td
                          className="px-2 sm:px-3 py-2 text-left font-korean text-slate-900 break-keep whitespace-normal md:whitespace-nowrap md:truncate"
                          title={row.client}
                        >
                          {row.client}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </section>
  );
};

const Portfolio = () => {
  const [tunnelRecords, setTunnelRecords] = useState<PerformanceRecord[]>([]);
  const [suriRecords, setSuriRecords] = useState<PerformanceRecord[]>([]);
  const [designRecords, setDesignRecords] = useState<PerformanceRecord[]>([]);
  const [gamRiRecords, setGamRiRecords] = useState<PerformanceRecord[]>([]);
  const [heroImageError, setHeroImageError] = useState(false);
  const [heroImageAttempt, setHeroImageAttempt] = useState(0);

  // 검색 관련 state
  const [searchQuery, setSearchQuery] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const searchContentRef = useRef<HTMLDivElement>(null);
  const matchesRef = useRef<HTMLElement[]>([]);
  const isComposingRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 검색 함수들
  const clearHighlights = useCallback(() => {
    if (!searchContentRef.current) return;

    const highlights = searchContentRef.current.querySelectorAll('mark[data-search-highlight="true"]');
    highlights.forEach((highlight) => {
      const text = document.createTextNode(highlight.textContent ?? '');
      highlight.replaceWith(text);
    });

    searchContentRef.current.normalize();
    matchesRef.current = [];
    setMatchCount(0);
    setCurrentMatchIndex(0);
  }, []);

  const updateActiveHighlight = useCallback((index: number) => {
    matchesRef.current.forEach((highlight, highlightIndex) => {
      highlight.style.backgroundColor = highlightIndex === index ? '#FFEB3B' : '#FFF59D';
    });
  }, []);

  const scrollToHighlight = useCallback((index: number) => {
    const target = matchesRef.current[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      updateActiveHighlight(index);
    }
  }, [updateActiveHighlight]);

  const handleSearch = useCallback(() => {
    if (!searchContentRef.current) return;

    const query = searchQuery.trim();
    clearHighlights();

    if (!query) return;

    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(searchContentRef.current, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest('mark[data-search-highlight="true"]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let currentNode = walker.nextNode();
    while (currentNode) {
      textNodes.push(currentNode as Text);
      currentNode = walker.nextNode();
    }

    const regex = new RegExp(escapeRegExp(query), 'gi');
    textNodes.forEach((node) => {
      const text = node.nodeValue ?? '';
      let match: RegExpExecArray | null;
      let lastIndex = 0;
      const fragment = document.createDocumentFragment();

      regex.lastIndex = 0;
      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }

        const mark = document.createElement('mark');
        mark.setAttribute('data-search-highlight', 'true');
        mark.style.backgroundColor = '#FFF59D';
        mark.style.padding = '0 2px';
        mark.textContent = match[0];
        fragment.appendChild(mark);
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      if (fragment.childNodes.length > 0) {
        node.parentNode?.replaceChild(fragment, node);
      }
    });

    matchesRef.current = Array.from(
      searchContentRef.current.querySelectorAll<HTMLElement>('mark[data-search-highlight="true"]')
    );
    setMatchCount(matchesRef.current.length);

    if (matchesRef.current.length > 0) {
      setCurrentMatchIndex(0);
      scrollToHighlight(0);
    }

    searchInputRef.current?.focus();
  }, [clearHighlights, searchQuery, scrollToHighlight]);

  const handleMoveMatch = useCallback((direction: 'prev' | 'next') => {
    if (!matchesRef.current.length) return;

    const nextIndex = direction === 'next'
      ? (currentMatchIndex + 1) % matchesRef.current.length
      : (currentMatchIndex - 1 + matchesRef.current.length) % matchesRef.current.length;

    setCurrentMatchIndex(nextIndex);
    scrollToHighlight(nextIndex);
  }, [currentMatchIndex, scrollToHighlight]);

  // 검색어가 없으면 자동으로 강조 해제 & 검색어 입력 시 자동 검색 (debounce)
  useEffect(() => {
    const query = searchQuery.trim();
    
    if (!query) {
      clearHighlights();
      return;
    }

    if (isComposingRef.current) return;

    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, clearHighlights, handleSearch]);

  const totals = useMemo(() => {
    const totalProjects = portfolioData.reduce((sum, d) => sum + d['합계'], 0);
    const diagnosis = portfolioData.reduce((sum, d) => sum + d['정밀안전진단'], 0);
    const inspection = portfolioData.reduce((sum, d) => sum + d['정밀안전검검'], 0);
    const design = portfolioData.reduce((sum, d) => sum + d['설계'], 0);
    const supervision = portfolioData.reduce((sum, d) => sum + d['감리'], 0);
    const years = portfolioData.length;
    const avgPerYear = Math.round(totalProjects / (years || 1));

    const lastYear = Math.max(...portfolioData.map((d) => d.year));
    const prevYear = lastYear - 1;
    const lastTotal = portfolioData.find((d) => d.year === lastYear)?.['합계'] ?? 0;
    const prevTotal = portfolioData.find((d) => d.year === prevYear)?.['합계'] ?? 0;
    const yoy = prevTotal ? ((lastTotal - prevTotal) / prevTotal) * 100 : 0;

    return { totalProjects, diagnosis, inspection, design, supervision, years, avgPerYear, lastYear, yoy };
  }, []);

  // 이미지 경로 헬퍼 함수 (certification과 동일한 패턴)
  const getImagePath = (filename: string) => {
    return withBaseUrl(`portfolio/${filename}`);
  };

  // 텍스트 기반 수행실적 데이터 로드 (교량/터널, 수리, 설계, 감리)
  useEffect(() => {
    const loadRecords = async (filename: string): Promise<PerformanceRecord[]> => {
      try {
        const baseUrl = import.meta.env.BASE_URL;
        const response = await fetch(`${baseUrl}portfolio/${filename}`);
        if (!response.ok) {
          return [];
        }
        const text = await response.text();
        const lines = text.split(/\r?\n/);

        const records: PerformanceRecord[] = lines
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .map((line) => {
            const parts = line.split('/');
            const year = (parts[0] ?? '').trim();
            const contractName = (parts[1] ?? '').trim();
            const client = (parts[2] ?? '').trim();

            return {
              year,
              contractName,
              client,
            };
          });

        return records;
      } catch (error) {
        console.error('Failed to load performance data:', error);
        return [];
      }
    };

    const loadAll = async () => {
      const [tunnel, suri, design, gamri] = await Promise.all([
        loadRecords('tunnel.txt'),
        loadRecords('Suri.txt'),
        loadRecords('Construction.txt'),
        loadRecords('GamRi.txt'),
      ]);

      setTunnelRecords(tunnel);
      setSuriRecords(suri);
      setDesignRecords(design);
      setGamRiRecords(gamri);
    };

    loadAll();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation variant="default" forceLightTheme={true} />

      <div className="relative pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20">
        {/* Subtle background accent (non-intrusive, keeps layout intact) */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white via-slate-50/60 to-white" />

        {/* 풀폭 헤더 배너 (배경 이미지 + 중앙 정렬 텍스트) */}
        <section className="relative isolate overflow-hidden text-white mb-20 sm:mb-28 md:mb-40">
          <div className="absolute inset-0">
            {!heroImageError && (
              <img
                src={
                  heroImageAttempt === 0 ? portfolioImage('performance4') :
                  heroImageAttempt === 1 ? portfolioImage('performance1') :
                  portfolioImage('performance5')
                }
                alt="Portfolio hero background"
                className="h-full w-full object-cover scale-[1.03] motion-safe:transition-transform motion-safe:duration-[2500ms] motion-safe:ease-out"
                onError={() => {
                  if (heroImageAttempt < 2) {
                    setHeroImageAttempt(prev => prev + 1);
                  } else {
                    // 모든 시도 실패 시 이미지 숨김
                    setHeroImageError(true);
                  }
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-900/55 to-slate-950/70" />
            <div className="absolute inset-0 opacity-60 bg-[radial-gradient(900px_500px_at_50%_15%,rgba(30,111,217,0.35),transparent_60%)]" />
          </div>
          <div className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28 lg:py-32">
            <div className="w-full sm:w-[85%] md:w-[80%] lg:w-[75%] mx-auto text-center">
              <Reveal>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight font-korean drop-shadow-[0_14px_28px_rgba(0,0,0,0.45)]">
                  분야별 수행실적
                </h1>
              </Reveal>
              <Reveal delayMs={120}>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-white/85 font-korean">
                  정밀안전진단•정밀안전점검•엔지니어링 설계•건설사업관리
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 네비게이션 너비에 맞춘 가로줄 */}
        <div className="w-[95%] sm:w-[90%] md:w-[85%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="border-t border-slate-300"></div>
        </div>
        <div className="w-full sm:w-[90%] md:w-[85%] lg:w-[75%] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 md:pt-12">
          {/* KPI 카드 */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8 sm:mb-10">
            <Reveal delayMs={0}>
              <Card
                className="relative overflow-hidden border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-white/70 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-[#0C2B4B] before:via-[#1E6FD9] before:to-[#0C2B4B]"
              >
                <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 font-korean">총 수행건수</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3 sm:pb-4 px-3 sm:px-4">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums flex items-baseline gap-1 sm:gap-2">
                    {totals.totalProjects.toLocaleString()}
                    <span className="text-xs sm:text-sm font-medium text-slate-600 font-korean">건</span>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delayMs={60}>
              <Card
                className="relative overflow-hidden border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-white/70 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-blue-700 before:via-sky-500 before:to-blue-700"
              >
                <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 font-korean">정밀안전진단</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3 sm:pb-4 px-3 sm:px-4">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 tabular-nums flex items-baseline gap-1 sm:gap-2">
                    {totals.diagnosis.toLocaleString()}
                    <span className="text-xs sm:text-sm font-medium text-slate-600 font-korean">건</span>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delayMs={120}>
              <Card
                className="relative overflow-hidden border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-white/70 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-orange-700 before:via-amber-500 before:to-orange-700"
              >
                <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 font-korean">정밀안전점검</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3 sm:pb-4 px-3 sm:px-4">
                  <div className="text-2xl sm:text-3xl font-bold tabular-nums flex items-baseline gap-1 sm:gap-2 text-orange-600">
                    {totals.inspection.toLocaleString()}
                    <span className="text-xs sm:text-sm font-medium text-slate-600 font-korean">건</span>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delayMs={180}>
              <Card
                className="relative overflow-hidden border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-white/70 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-emerald-700 before:via-green-500 before:to-emerald-700"
              >
                <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 font-korean">엔지니어링 설계</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3 sm:pb-4 px-3 sm:px-4">
                  <div className="text-2xl sm:text-3xl font-bold tabular-nums flex items-baseline gap-1 sm:gap-2" style={{ color: '#0EB500' }}>
                    {totals.design.toLocaleString()}
                    <span className="text-xs sm:text-sm font-medium text-slate-600 font-korean">건</span>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delayMs={240} className="col-span-2 lg:col-span-1">
              <Card
                className="relative overflow-hidden border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-white/70 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-purple-700 before:via-fuchsia-500 before:to-purple-700"
              >
                <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 font-korean">건설사업관리</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3 sm:pb-4 px-3 sm:px-4">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 tabular-nums flex items-baseline gap-1 sm:gap-2">
                    {totals.supervision.toLocaleString()}
                    <span className="text-xs sm:text-sm font-medium text-slate-600 font-korean">건</span>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>

          {/* 세부 표 */}
          <Reveal>
            <Card className="border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-white/70 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="pb-2 pt-4 sm:pt-5 px-4 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1.5 rounded-full bg-gradient-to-b from-[#0C2B4B] to-[#1E6FD9]" />
                  <CardTitle className="text-sm sm:text-base font-korean">연도별 상세 내역</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4 sm:pb-5 px-2 sm:px-4 md:px-5">
                <div className="overflow-hidden rounded-2xl border border-slate-200/80">
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed text-xs sm:text-sm md:text-base min-w-[806px] sm:min-w-[916px] lg:min-w-[1016px]">
                      <thead className="sticky top-0 z-10">
                      <tr>
                        <th className="w-[86px] sm:w-[96px] px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center text-white font-korean font-semibold border-r border-slate-200 whitespace-nowrap" style={{ backgroundColor: '#0C2B4B' }}>구분</th>
                        <th className="w-[140px] sm:w-[160px] lg:w-[180px] px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center text-white font-korean font-semibold border-r border-slate-200 whitespace-nowrap break-keep" style={{ backgroundColor: '#0C2B4B' }}>정밀안전진단</th>
                        <th className="w-[140px] sm:w-[160px] lg:w-[180px] px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center text-white font-korean font-semibold border-r border-slate-200 whitespace-nowrap break-keep" style={{ backgroundColor: '#0C2B4B' }}>정밀안전점검</th>
                        <th className="w-[140px] sm:w-[160px] lg:w-[180px] px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center text-white font-korean font-semibold border-r border-slate-200 whitespace-nowrap break-keep" style={{ backgroundColor: '#0C2B4B' }}>엔지니어링 설계</th>
                        <th className="w-[140px] sm:w-[160px] lg:w-[180px] px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center text-white font-korean font-semibold border-r border-slate-200 whitespace-nowrap break-keep" style={{ backgroundColor: '#0C2B4B' }}>건설사업관리</th>
                        <th className="w-[80px] sm:w-[90px] lg:w-[100px] px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center text-white font-korean font-semibold border-r border-slate-200 whitespace-nowrap" style={{ backgroundColor: '#0C2B4B' }}>기타</th>
                        <th className="w-[80px] sm:w-[90px] lg:w-[100px] px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center text-white font-korean font-semibold whitespace-nowrap" style={{ backgroundColor: '#0C2B4B' }}>합계</th>
                      </tr>
                      </thead>
                      <tbody>
                        {portfolioData.map((row, idx) => (
                          <tr
                            key={row.year}
                            className={
                              'border-b border-slate-100 last:border-b-0 transition-colors duration-200 ' +
                              (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60') +
                              ' hover:bg-blue-50/50'
                            }
                          >
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center font-semibold text-slate-900 font-korean border-r border-slate-200 tabular-nums">{row.year}</td>
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center text-blue-700 font-medium border-r border-slate-200 tabular-nums">{row['정밀안전진단']}</td>
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center font-medium border-r border-slate-200 text-orange-600 tabular-nums">{row['정밀안전검검']}</td>
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center font-medium border-r border-slate-200 tabular-nums" style={{ color: '#0EB500' }}>{row['설계']}</td>
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center text-purple-700 font-medium border-r border-slate-200 tabular-nums">{row['감리']}</td>
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center text-slate-700 border-r border-slate-200 tabular-nums">{row['기타']}</td>
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-center font-bold tabular-nums" style={{ color: '#D10000' }}>{row['합계']}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="px-1 sm:px-2 pt-2 sm:pt-3">
                  <p className="text-xs text-slate-500 font-korean text-right">
                    <span className="font-semibold">※ 기타</span> : 성능평가용역, 연구용역 등
                  </p>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          {/* 실적 검색창 (모든 버전 상단 고정) */}
          <div className="sticky top-16 sm:top-20 md:top-24 lg:top-28 z-20 mt-12 sm:mt-14 md:mt-16">
            <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
              <label className="block text-xs font-semibold text-slate-700 font-korean" htmlFor="portfolio-search">
                실적 검색
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  id="portfolio-search"
                  type="text"
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onCompositionStart={() => { isComposingRef.current = true; }}
                  onCompositionEnd={() => { isComposingRef.current = false; }}
                  onKeyDown={(e) => {
                    const nativeEvent = e.nativeEvent as KeyboardEvent;
                    const isIme = nativeEvent.isComposing || nativeEvent.keyCode === 229;
                    if (e.key === 'Enter' && !isComposingRef.current && !isIme) {
                      handleSearch();
                    }
                  }}
                  placeholder="검색어 입력"
                  className="w-full sm:flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm font-korean focus:border-[#0B1C2B] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  aria-label="검색"
                  className="inline-flex items-center justify-center rounded-md bg-[#0B1C2B] px-3 py-2 text-white hover:bg-[#081420] transition-colors sm:w-auto"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-korean">
                <span>{matchCount > 0 ? `${currentMatchIndex + 1}/${matchCount}` : '결과 없음'}</span>
                <button
                  type="button"
                  onClick={() => handleMoveMatch('prev')}
                  className="rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-100 disabled:opacity-50"
                  disabled={matchCount === 0}
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveMatch('next')}
                  className="rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-100 disabled:opacity-50"
                  disabled={matchCount === 0}
                >
                  다음
                </button>
              </div>
            </div>
          </div>

          {/* 검색 대상 콘텐츠 영역 - 기존 레이아웃 유지 */}
          <div ref={searchContentRef}>
            <PerformanceTableSection
              id="portfolio-safety-bridge-tunnel"
              title="안전진단 수행실적 - 교량및터널"
              records={tunnelRecords}
              description="건의 교량 및 터널 관련 수행실적"
            />

            <PerformanceTableSection
              id="portfolio-safety-suri"
              title="안전진단 수행실적 - 수리"
              records={suriRecords}
              description="건의 수리 관련 수행실적"
            />

            <PerformanceTableSection
              id="portfolio-design"
              title="설계 수행실적"
              records={designRecords}
              description="건의 설계 관련 수행실적"
            />

            <PerformanceTableSection
              id="portfolio-supervision"
              title="건설사업관리 실적"
              records={gamRiRecords}
              description="건의 건설사업관리 관련 수행실적"
            />
          </div>
        </div>
      </div>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Portfolio;
