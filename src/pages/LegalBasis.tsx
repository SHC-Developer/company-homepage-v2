import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Search } from 'lucide-react';

// 섹션 화면 비율 설정 (% 단위로 입력)
const HERO_WIDTH = 100; // Hero 섹션 너비
const CONTENT_WIDTH = 65; // 컨텐츠 섹션 너비 (PC)
const TOC_LINK_COLOR = '#0C2B4B';
const TOC_LINK_HOVER_COLOR = '#0B1C2B';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const tocItems = [
  { type: 'link', targetId: 'laws-list', label: '수의계약 체결 가능한 법률조항' },
  { type: 'link', targetId: 'qa', label: '질의회신자료' },
  { type: 'label', label: '관련 법령' },
  { type: 'link', targetId: 'act-veterans', label: '- 국가유공자단체법', indent: true },
  { type: 'link', targetId: 'basiclaw-veterans', label: '- 국가보훈 기본법', indent: true },
  { type: 'link', targetId: 'decree-national', label: '- 국가계약법 시행령', indent: true },
  { type: 'link', targetId: 'decree-local', label: '- 지방계약법 시행령', indent: true },
];

const LegalBasis = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const matchesRef = useRef<HTMLElement[]>([]);
  const isComposingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearHighlights = useCallback(() => {
    if (!contentRef.current) {
      return;
    }

    const highlights = contentRef.current.querySelectorAll('mark[data-search-highlight="true"]');
    highlights.forEach((highlight) => {
      const text = document.createTextNode(highlight.textContent ?? '');
      highlight.replaceWith(text);
    });

    contentRef.current.normalize();
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
    if (!contentRef.current) {
      return;
    }

    const query = searchQuery.trim();
    clearHighlights();

    if (!query) {
      return;
    }

    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(contentRef.current, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!node.nodeValue || !node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        if (node.parentElement?.closest('mark[data-search-highlight="true"]')) {
          return NodeFilter.FILTER_REJECT;
        }

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
      contentRef.current.querySelectorAll<HTMLElement>('mark[data-search-highlight="true"]')
    );
    setMatchCount(matchesRef.current.length);

    if (matchesRef.current.length > 0) {
      setCurrentMatchIndex(0);
      scrollToHighlight(0);
    }

    inputRef.current?.focus();
  }, [clearHighlights, searchQuery]);

  const handleMoveMatch = useCallback((direction: 'prev' | 'next') => {
    if (!matchesRef.current.length) {
      return;
    }

    const nextIndex = direction === 'next'
      ? (currentMatchIndex + 1) % matchesRef.current.length
      : (currentMatchIndex - 1 + matchesRef.current.length) % matchesRef.current.length;

    setCurrentMatchIndex(nextIndex);
    scrollToHighlight(nextIndex);
  }, [currentMatchIndex, scrollToHighlight]);

  // 검색어가 없으면 자동으로 강조 해제 & 검색어 입력 시 자동 검색 (debounce)
  useEffect(() => {
    const query = searchQuery.trim();
    
    // 검색어가 없으면 즉시 강조 해제
    if (!query) {
      clearHighlights();
      return;
    }

    // IME 조합 중이면 검색하지 않음
    if (isComposingRef.current) {
      return;
    }

    // debounce: 300ms 후 자동 검색
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, clearHighlights, handleSearch]);

  const TocNav = () => (
    <nav aria-label="Table of contents" className="text-sm font-korean">
      <ul className="space-y-2">
        {tocItems.map((item) => {
          if (item.type === 'label') {
            return (
              <li key={item.label} className="space-y-2" style={{ color: '#0B1C2B' }}>
                {item.label}
              </li>
            );
          }

          return (
            <li key={item.targetId} className={item.indent ? 'ml-3' : undefined}>
              <TocLink targetId={item.targetId}>{item.label}</TocLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const setTocLinkColor = (e: React.MouseEvent<HTMLAnchorElement>, color: string) => {
    e.currentTarget.style.color = color;
  };

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top + window.pageYOffset;
      const elementHeight = elementRect.height;
      const elementCenter = elementTop + (elementHeight / 2);
      const viewportHeight = window.innerHeight;
      const scrollPosition = elementCenter - (viewportHeight / 2);
      
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const TocLink = ({ targetId, children }: { targetId: string; children: React.ReactNode }) => (
    <a
      href={`#${targetId}`}
      onClick={(e) => handleScrollToSection(e, targetId)}
      style={{ color: TOC_LINK_COLOR }}
      className="hover:underline transition-colors cursor-pointer"
      onMouseEnter={(e) => setTocLinkColor(e, TOC_LINK_HOVER_COLOR)}
      onMouseLeave={(e) => setTocLinkColor(e, TOC_LINK_COLOR)}
    >
      {children}
    </a>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation variant="default" forceLightTheme={true} />
      
      <main className="pt-20">
        {/* Document Header */}
        <section className="relative text-white" style={{ backgroundColor: '#0b1c2b' }}>
          <div className="w-[95%] sm:w-[90%] md:w-[85%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-10 sm:py-12 md:py-14">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight font-korean">수의계약 근거 법률조항</h1>
              <p className="mt-1 text-xs sm:text-sm text-white/70 font-korean">법률·시행령 각 조문에 근거한 수의계약 체결 요건 정리</p>
            </div>
            <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs text-white/70 font-korean">
              <div className="rounded-md bg-white/5 ring-1 ring-white/10 px-3 py-2">문서유형: 법률근거 안내</div>
              <div className="rounded-md bg-white/5 ring-1 ring-white/10 px-3 py-2">최종개정: 2025-10-01</div>
            </div>
          </div>
        </section>

        {/* Legal Content Section */}
        <section className="py-8 sm:py-10 md:py-14 bg-background">
          <div className="w-[95%] sm:w-[90%] md:w-[85%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
            {/* Mobile Search (sticky) - 1024px 이하에서만 표시 */}
            <div className="lg:hidden sticky top-12 sm:top-16 md:top-20 z-20 mb-6">
              <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
                <label className="block text-xs font-semibold text-slate-700 font-korean" htmlFor="legal-search-mobile">
                  본문 검색
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    id="legal-search-mobile"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onCompositionStart={() => {
                      isComposingRef.current = true;
                    }}
                    onCompositionEnd={() => {
                      isComposingRef.current = false;
                    }}
                    onKeyDown={(e) => {
                      const nativeEvent = e.nativeEvent as KeyboardEvent;
                      const isIme = nativeEvent.isComposing || nativeEvent.keyCode === 229;
                      if (e.key === 'Enter' && !isComposingRef.current && !isIme) {
                        handleSearch();
                      }
                    }}
                    placeholder="검색어 입력"
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-korean focus:border-[#0B1C2B] focus:outline-none"
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

            {/* Desktop: Flex layout for sticky sidebar */}
            <div className="flex flex-col lg:flex-row lg:gap-8">
              {/* TOC + Search (desktop) - 1024px 이상에서만 표시, 함께 sticky */}
              <aside className="hidden lg:block lg:w-[280px] lg:flex-shrink-0">
                <div className="sticky top-28 space-y-4">
                  {/* 목차 박스 */}
                  <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
                    <div className="mb-3">
                      <p className="text-sm font-semibold tracking-wide font-korean">목차</p>
                    </div>
                    <TocNav />
                  </div>
                  {/* 본문 검색 박스 */}
                  <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
                    <label className="block text-xs font-semibold text-slate-700 font-korean" htmlFor="legal-search-desktop">
                      본문 검색
                    </label>
                    <div className="mt-2 flex flex-col gap-2">
                      <input
                        id="legal-search-desktop"
                        type="text"
                        ref={inputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onCompositionStart={() => {
                          isComposingRef.current = true;
                        }}
                        onCompositionEnd={() => {
                          isComposingRef.current = false;
                        }}
                        onKeyDown={(e) => {
                          const nativeEvent = e.nativeEvent as KeyboardEvent;
                          const isIme = nativeEvent.isComposing || nativeEvent.keyCode === 229;
                          if (e.key === 'Enter' && !isComposingRef.current && !isIme) {
                            handleSearch();
                          }
                        }}
                        placeholder="검색어 입력"
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-korean focus:border-[#0B1C2B] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSearch}
                        aria-label="검색"
                        className="inline-flex items-center justify-center rounded-md bg-[#0B1C2B] px-3 py-2 text-white hover:bg-[#081420] transition-colors"
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
              </aside>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-xl shadow-sm border border-border">
                  <div
                    ref={contentRef}
                    className="p-4 sm:p-6 md:p-7 lg:p-8 text-sm sm:text-base leading-7 sm:leading-8 font-korean text-foreground space-y-8 sm:space-y-10"
                    style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
                  >
                    {/* Summary Callout */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 sm:p-5">
                      <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">핵심 요약</p>
                      <p className="text-sm sm:text-base text-blue-900/90">상이군경 등으로 구성된 단체가 직접 수행하는 용역·물품에 대하여, 국가·지자체 및 공공기관은 관련 법률 및 시행령에 근거하여 수의계약 체결이 가능함.</p>
                    </div>

                    {/* List of laws */}
                    <section id="laws-list">
                      <h2 className="text-lg sm:text-xl font-bold mb-3 tracking-tight">■ 수의계약 체결 가능한 법률조항</h2>
                      <div className="ml-3 sm:ml-4 space-y-2">
                        <div className="flex items-start sm:items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2 sm:mt-0" />
                          <p className="text-sm sm:text-base">국가유공자등단체설립에 관한 법률 제17조</p>
                        </div>
                        <div className="flex items-start sm:items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2 sm:mt-0" />
                          <p className="text-sm sm:text-base">국가를 당사자로 하는 계약에 관한 법률 시행령 제26조 1항 4호 나목</p>
                        </div>
                        <div className="flex items-start sm:items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2 sm:mt-0" />
                          <p className="text-sm sm:text-base">지방자치단체를 당사자로 하는 계약에 관한 법률 시행령 제25조 1항 7의2호 가목</p>
                        </div>
                        <div className="flex items-start sm:items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2 sm:mt-0" />
                          <p className="text-sm sm:text-base">공기업·준정부기관 계약사무규칙</p>
                        </div>
                      </div>
                    </section>

                    {/* Q&A references */}
                    <section id="qa">
                      <h2 className="text-lg sm:text-xl font-bold mb-3 tracking-tight">■ 수의계약관련 법률근거에 의한 질의회신자료</h2>
                      <div className="rounded-md border border-slate-200 p-4 sm:p-5 space-y-3">
                        <div className="space-y-3">
                          <div className="border-b border-slate-100 pb-3 last:border-b-0">
                            <p className="text-xs sm:text-sm font-semibold text-foreground mb-1">► 서울특별시장(재무과-56218, 2013.12.21)</p>
                            <p className="text-xs sm:text-sm text-foreground/70 ml-3 sm:ml-4">→ 금액제한없고/1인견적수의가능/적극지원</p>
                          </div>
                          <div className="border-b border-slate-100 pb-3 last:border-b-0">
                            <p className="text-xs sm:text-sm font-semibold text-foreground mb-1">► 경기도(회계과-31213, 2017.9.5)</p>
                            <p className="text-xs sm:text-sm text-foreground/70 ml-3 sm:ml-4">→ 1인수의가능(설계,감리,진단) 적의처리하달</p>
                          </div>
                          <div className="border-b border-slate-100 pb-3 last:border-b-0">
                            <p className="text-xs sm:text-sm font-semibold text-foreground mb-1">► 인천광역시(회계계약심사과-22540, 2009.12.7)</p>
                            <p className="text-xs sm:text-sm text-foreground/70 ml-3 sm:ml-4">→ 수의계약 가능 및 물품 제조/구매가능</p>
                          </div>
                          <div className="border-b border-slate-100 pb-3 last:border-b-0">
                            <p className="text-xs sm:text-sm font-semibold text-foreground mb-1">► 국방부(재정회계담당관-920, 2008.5.2)</p>
                            <p className="text-xs sm:text-sm text-foreground/70 ml-3 sm:ml-4">→ 수의계약 가능 및 예하부대 하달공문</p>
                          </div>
                          <div className="border-b border-slate-100 pb-3 last:border-b-0">
                            <p className="text-xs sm:text-sm font-semibold text-foreground mb-1">► 재정경제부(회계제도과-340, 2005.2.18)</p>
                            <p className="text-xs sm:text-sm text-foreground/70 ml-3 sm:ml-4">→ 수의계약가능 및 금액제한 없음</p>
                          </div>
                          <div className="border-b border-slate-100 pb-3 last:border-b-0">
                            <p className="text-xs sm:text-sm font-semibold text-foreground mb-1">► 기획재정부(회계제도과-112, 2010.1.18)</p>
                            <p className="text-xs sm:text-sm text-foreground/70 ml-3 sm:ml-4">→ 수의계약시 적격심사 적용 제외</p>
                          </div>
                          <div className="border-b border-slate-100 pb-3 last:border-b-0">
                            <p className="text-xs sm:text-sm font-semibold text-foreground mb-1">► 국토해양부(건설경제과-1074, 2011.3.15)</p>
                            <p className="text-xs sm:text-sm text-foreground/70 ml-3 sm:ml-4">→ 수의계약가능 확인</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Related Laws Section Title */}
                    <section className="pt-2 border-t border-gray-200">
                      <h2 className="text-lg sm:text-xl font-bold mb-3 tracking-tight">■ 관련 법령</h2>
                    </section>

                    {/* Law sections */}
                    <section id="act-veterans" className="pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          <h3 className="font-bold text-base sm:text-lg"><span style={{ textDecoration: 'underline' }}>국가유공자단체법</span></h3>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 self-start sm:self-auto">시행 2023.6.5<span className="text-slate-400">/</span> 법률 제19228호</span>
                      </div>
                      <div className="rounded-md border border-slate-200 p-4 sm:p-5 bg-slate-50/50">
                        <p className="text-primary font-bold mb-2 text-sm sm:text-base">제17조(국가유공자등단체의 수익사업)</p>
                        <div className="ml-3 sm:ml-4 space-y-2 text-sm sm:text-base [&>p]:[word-break:break-word] sm:[&>p]:[word-break:keep-all]">
                          <p style={{ textAlign: 'justify' }}>① 이 법에 따라 설립된 국가유공자등단체는 <span style={{ color: '#0024FF', textDecoration: 'underline' }}>제1조</span>에 따른 설립목적을 달성하기 위하여 필요한 범위에서 <span style={{ color: '#0024FF', textDecoration: 'underline' }}>직접 수익사업을 할 수 있다.</span><br /><span style={{ textDecoration: 'underline', whiteSpace: 'nowrap' }}>&lt;개정 2021.6.8.&gt;</span></p>
                          <p style={{ textAlign: 'justify' }}>② 국가, 지방자치단체 및 그 밖의 공공단체는 제1항에 따라 수익사업을 운영하는 국가유공자등단체 중 상이를 입은 사람을 회원으로 하는 국가유공자등단체가 직접 생산하는 물품을 구매하거나 해당 국가유공자등단체에 직접 물건을 매각 또는 임대하거나 해당 국가유공자등단체와 용역계약을 체결하는 경우에는 <span style={{ color: '#0024FF', textDecoration: 'underline' }}>수의계약으로 할 수 있다.</span><br /><span style={{ textDecoration: 'underline', whiteSpace: 'nowrap' }}>&lt;개정 2021.6.8.&gt;</span></p>
                        </div>
                      </div>
                    </section>

                    <section id="basiclaw-veterans" className="pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          <h3 className="font-bold text-base sm:text-lg"><span style={{ textDecoration: 'underline' }}>국가보훈 기본법</span></h3>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 self-start sm:self-auto">시행 2024.2.13<span className="text-slate-400">/</span> 법률 제20278호</span>
                      </div>
                      <div className="rounded-md border border-slate-200 p-4 sm:p-5">
                        <p className="text-primary font-bold mb-2 text-sm sm:text-base">제5조(국가와 지방자치단체의 책무)</p>
                        <div className="ml-3 sm:ml-4 space-y-2 text-sm sm:text-base [&>p]:[word-break:break-word] sm:[&>p]:[word-break:keep-all]">
                          <p style={{ color: '#0024FF', textAlign: 'justify' }}>① 국가와 지방자치단체는 희생·공헌자의 공훈과 나라사랑정신을 선양하고, 국가보훈대상자를 예우하는 기반을 조성하기 위하여 노력하여야 한다.</p>
                          <p style={{ color: '#0024FF', textAlign: 'justify' }}>② 국가와 지방자치단체는 제2조에 따른 기본이념을 구현하기 위하여 필요한 시책을 수립·시행하여야 한다.</p>
                          <p style={{ color: '#0024FF', textAlign: 'justify' }}>③ 국가와 지방자치단체는 국민 또는 주민의 복지와 관련된 정책을 수립·시행하거나 법령 등을 제정 또는 개정할 때에는 국가보훈대상자를 우선하여 배려하는 등 적극적 조치를 하여야 한다.</p>
                          <p style={{ color: '#ED1C24', fontWeight: 'bold', textAlign: 'justify' }}>④ 국가와 지방자치단체는 국가보훈사업에 필요한 재원(財源) 조성에 노력하여야 한다.</p>
                        </div>
                      </div>
                    </section>

                    <section id="decree-national" className="pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          <h3 className="font-bold text-base sm:text-lg"><span style={{ textDecoration: 'underline' }}>국가계약법 시행령</span></h3>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 self-start sm:self-auto">시행 2026.1.2<span className="text-slate-400">/</span> 대통령령 제35947호</span>
                      </div>
                      <div className="rounded-md border border-slate-200 p-4 sm:p-5 bg-slate-50/50">
                        <p className="text-primary font-bold mb-2 text-sm sm:text-base">제26조(수의계약에 의할 수 있는 경우)</p>
                        <div className="ml-3 sm:ml-4 space-y-2 text-sm sm:text-base [&_p]:[word-break:break-word] sm:[&_p]:[word-break:keep-all]">
                          <p style={{ color: '#0024FF', textAlign: 'justify' }}>① 법 제7조제1항 단서에 따라 수의계약을 할 수 있는 경우는 다음 각 호와 같다.</p>
                          <div className="ml-3 sm:ml-4">
                            <p style={{ textAlign: 'justify' }}>1. 경쟁에 부칠 여유가 없거나 경쟁에 부쳐서는 계약의 목적을 달성하기 곤란하다고 판단되는 경우로서 다음 각 목의 경우(가~라 : 4개 목)</p>
                            <p style={{ color: '#0024FF', textAlign: 'justify' }}>4. 국가유공자 또는 장애인 등에게 일자리나 보훈ㆍ복지서비스 등을 제공하기 위한 목적으로 설립된 다음 각 목의 어느 하나에 해당하는 단체 등과 물품의 제조ㆍ구매 또는 용역 계약(해당 단체가 직접 생산하는 물품 및 직접 수행하는 용역에 한정한다)을 체결하거나, 그 단체 등에 직접 물건을 매각ㆍ임대하는 경우</p>
                            <div className="ml-3 sm:ml-4 space-y-1">
                              <p style={{ color: '#0024FF', textAlign: 'justify' }}>가. 국가보훈부장관이 지정하는 국가유공자 자활집단촌의 복지공장</p>
                              <p style={{ color: '#ED1C24', fontWeight: 'bold', textAlign: 'justify' }}>나. <span style={{ textDecoration: 'underline' }}>「국가유공자 등 단체설립에 관한 법률」</span>에 따라 설립된 단체 중 상이를 입은 자들로 구성된 단체</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section id="decree-local" className="pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          <h3 className="font-bold text-base sm:text-lg"><span style={{ textDecoration: 'underline' }}>지방계약법 시행령</span></h3>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 self-start sm:self-auto">시행 2026.1.2<span className="text-slate-400">/</span> 대통령령 제35947호</span>
                      </div>
                      <div className="rounded-md border border-slate-200 p-4 sm:p-5">
                        <p className="text-primary font-bold mb-2 text-sm sm:text-base">제25조(수의계약에 의할 수 있는 경우)</p>
                        <div className="ml-3 sm:ml-4 space-y-2 text-sm sm:text-base [&_p]:[word-break:break-word] sm:[&_p]:[word-break:keep-all]">
                          <p style={{ textAlign: 'justify' }}>① 지방자치단체의 장 또는 계약담당자는 다음 각 호의 어느 하나에 해당하는 경우에는 법 제9조제1항 단서에 따라 수의계약을 할 수 있다.</p>
                          <div className="ml-3 sm:ml-4">
                            <p style={{ fontWeight: 'bold', textAlign: 'justify' }}>7의2. 국가유공자 또는 장애인 등에게 일자리나 보훈ㆍ복지서비스 등을 제공하기 위한 경우로서 다음 각 목의 경우</p>
                            <div className="ml-3 sm:ml-4">
                              <p style={{ color: '#ED1C24', fontWeight: 'bold', textAlign: 'justify' }}>가. 「국가유공자 등 단체 설립에 관한 법률」 제1조에 따라 설립된 단체 중 상이(傷痍)를 입은 사람들로 구성된 단체가 직접 생산하는 물품의 제조ㆍ구매 또는 직접 수행하는 용역계약을 하거나 이들에게 직접 물품을 매각 또는 임대하는 경우</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Footer note */}
                    <div className="pt-4 text-xs sm:text-sm text-foreground/60">
                      <p>본 안내는 관련 법령의 이해를 돕기 위한 자료이며, 구체적인 계약 체결에 앞서 해당 기관의 계약 지침을 확인하시기 바랍니다.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default LegalBasis;
