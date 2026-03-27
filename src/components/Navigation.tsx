import React, { useState, useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NAV_CONTENT_INSET_CLASS } from '@/lib/navContentInset';
import logo2 from '@/assets/logo2.png';
import logo3 from '@/assets/logo3.png';

interface MenuStructure {
  [key: string]: string[];
}

const menuStructure = {
  '회사소개': ['인사말', '회사연혁', '보유면허 및 기술', '조직구성'],
  '관계법령': [],
  '분야별 수행실적': ['안전진단', '설계', '건설사업관리'],
  // 자료실: 서브메뉴에서 '채용공고' 제거 (데스크톱/모바일 동일 적용)
  '자료실': []
};

interface NavigationProps {
  variant?: 'default' | 'legal';
  forceLightTheme?: boolean;
  autoHideOnMount?: boolean;
}

export const Navigation = ({ variant = 'default', forceLightTheme = false, autoHideOnMount = false }: NavigationProps) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedMenus, setMobileExpandedMenus] = useState<string[]>([]);
  const [isOverLightBackground, setIsOverLightBackground] = useState(forceLightTheme);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/' || location.pathname === '/greeting';

  const navBackgroundClass = isOverLightBackground ? 'bg-white' : 'bg-transparent';
  const dropdownContainerClass = isOverLightBackground
    ? 'bg-white border border-gray-200'
    : 'bg-slate-800 border border-slate-700';
  const dropdownItemClass = isOverLightBackground
    ? 'text-gray-700 hover:text-black'
    : 'text-gray-300 hover:text-white';
  const brandTextClass = isOverLightBackground
    ? 'text-[#0B1C2B] hover:text-[#0B1C2B]/80'
    : 'text-white hover:text-white/80 drop-shadow-lg';
  const mobileMenuPanelClass = isOverLightBackground
    ? 'bg-white/95 border-gray-200'
    : 'bg-black/80 border-white';
  const mobileMenuButtonThemeClass = isOverLightBackground
    ? 'text-[#0B1C2B] hover:bg-gray-100 active:bg-gray-200'
    : 'text-white hover:bg-white/20 active:bg-white/30';

  const closeMenus = () => {
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
  };

  const scrollToElementById = (id: string, options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' }) => {
    const element = document.getElementById(id);
    if (!element) return false;
    element.scrollIntoView(options);
    return true;
  };

  const pushHash = (id: string) => {
    window.history.pushState(null, '', `#${id}`);
  };

  const navigateAndScrollToId = (pathWithHash: string, id: string, delayMs = 300) => {
    navigate(pathWithHash);
    window.setTimeout(() => {
      scrollToElementById(id, { behavior: 'smooth', block: 'start' });
    }, delayMs);
  };

  const handleSameOrNavigateToSection = (
    e: React.MouseEvent,
    target: { pagePath: string; id: string; delayMs?: number }
  ) => {
    e.preventDefault();

    if (location.pathname === target.pagePath) {
      const didScroll = scrollToElementById(target.id, { behavior: 'smooth', block: 'start' });
      if (didScroll) {
        pushHash(target.id);
      }
    } else {
      navigateAndScrollToId(`${target.pagePath}#${target.id}`, target.id, target.delayMs ?? 300);
    }

    closeMenus();
  };

  const handleMenuEnter = (menu: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(menu);
  };

  const handleMenuLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  const toggleMobileMenu = (menu: string) => {
    setMobileExpandedMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(m => m !== menu)
        : [...prev, menu]
    );
  };

  const handlePhilosophyClick = (e: React.MouseEvent) =>
    handleSameOrNavigateToSection(e, { pagePath: '/greeting', id: 'management-philosophy' });

  const handleHistoryClick = (e: React.MouseEvent) =>
    handleSameOrNavigateToSection(e, { pagePath: '/greeting', id: 'company-history' });

  const handleLicenseClick = (e: React.MouseEvent) =>
    handleSameOrNavigateToSection(e, { pagePath: '/greeting', id: 'license' });

  const handleOrganizationClick = (e: React.MouseEvent) =>
    handleSameOrNavigateToSection(e, { pagePath: '/greeting', id: 'organization-chart' });

  const handleCeoMessageClick = (e: React.MouseEvent) =>
    handleSameOrNavigateToSection(e, { pagePath: '/greeting', id: 'ceo-message' });

  const handleCompanyIntroClick = handlePhilosophyClick;

  const handlePortfolioClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    navigate('/portfolio');
    window.scrollTo(0, 0);
    closeMenus();
  };

  const handlePortfolioBridgeTunnelClick = (e: React.MouseEvent) =>
    handleSameOrNavigateToSection(e, { pagePath: '/portfolio', id: 'portfolio-safety-bridge-tunnel' });

  const handlePortfolioDesignClick = (e: React.MouseEvent) =>
    handleSameOrNavigateToSection(e, { pagePath: '/portfolio', id: 'portfolio-design' });

  const handlePortfolioSupervisionClick = (e: React.MouseEvent) =>
    handleSameOrNavigateToSection(e, { pagePath: '/portfolio', id: 'portfolio-supervision' });

  const handleRecruitClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    navigate('/recruit');
    window.scrollTo(0, 0);
    closeMenus();
  };

  const handleLegalBasisClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    navigate('/legal-basis');
    window.scrollTo(0, 0);
    closeMenus();
  };

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESC 키 감지
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMenu(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 언마운트 시 메뉴 닫힘 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 스크롤 감지로 배경 감지
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // forceLightTheme이 true면 항상 밝은 배경으로 설정
      if (forceLightTheme) {
        setIsOverLightBackground(true);
      } else {
        const heroSection = document.getElementById('hero-section');
        const sitemapSection = document.getElementById('sitemap-section');
        
        if (heroSection && sitemapSection) {
          const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
          const sitemapTop = sitemapSection.offsetTop;
          const sitemapBottom = sitemapSection.offsetTop + sitemapSection.offsetHeight;
          
          // HeroSection 하단 80% 이후부터 SitemapSection 끝까지는 어두운 배경 유지
          // 이렇게 하면 HeroSection에서 SitemapSection으로 전환되는 구간에서도 색상이 깜빡이지 않음
          if (currentScrollY >= heroBottom * 0.8 && currentScrollY < sitemapBottom) {
            setIsOverLightBackground(false);
            return;
          }
        } else if (sitemapSection) {
          // heroSection이 없는 경우 (비정상적이지만 안전장치)
          const sitemapTop = sitemapSection.offsetTop;
          const sitemapBottom = sitemapSection.offsetTop + sitemapSection.offsetHeight;
          if (currentScrollY >= sitemapTop && currentScrollY < sitemapBottom) {
            setIsOverLightBackground(false);
            return;
          }
        }
        
        // 그 외 영역은 히어로 섹션 하단 80% 이후부터 밝은 배경
        if (heroSection) {
          const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
          setIsOverLightBackground(currentScrollY > heroBottom * 0.8);
        } else {
          setIsOverLightBackground(currentScrollY > window.innerHeight * 0.8);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기 체크
    return () => window.removeEventListener('scroll', handleScroll);
  }, [forceLightTheme]);

  // forceLightTheme prop이 변경될 때 상태 업데이트
  useEffect(() => {
    if (forceLightTheme) {
      setIsOverLightBackground(true);
    }
  }, [forceLightTheme]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${navBackgroundClass}`}
      ref={menuRef}
    >
      {/* 
        반응형 가이드라인:
        1. 모바일 우선 접근법: 기본 스타일은 모바일용, 큰 화면용은 sm:, md:, lg: 등으로 확장
        2. Tailwind 브레이크포인트: sm(640px), md(768px), lg(1024px), xl(1280px)
        3. 모바일에서 네비게이션 바 높이 최소화: h-14 (56px)로 설정하여 한눈에 들어오도록
        4. 로고와 텍스트 크기 조정: 모바일에서 작게, 데스크톱에서 크게
        5. 가로 룰: src/lib/navContentInset.ts 의 NAV_CONTENT_INSET_CLASS와 동기화
      */}
      <div className={`${NAV_CONTENT_INSET_CLASS} pt-0`}>
        {/* 
          네비게이션 바 높이: 모바일·태블릿은 낮게, 넓은 데스크톱(2xl)에서만 여유 높이
          (1440px 미만은 햄버거 — 과도한 세로 공간 방지)
        */}
        <div className={`flex justify-between items-center h-14 sm:h-16 md:h-[4.25rem] lg:h-20 xl:h-[5.5rem] desktop:h-24 2xl:h-[7.5rem] ${variant === 'legal' ? 'nav-legal' : ''} ${
          isOverLightBackground ? 'nav-light-theme nav-gradient-line' : 'nav-bottom-line'
        }`}>
          {/* 로고와 회사명 */}
          {/* 
            모바일 최적화:
            - 컨테이너 높이를 네비게이션 바 높이와 동일하게 설정하여 텍스트 상자 크기 조절
            - 로고 크기: h-10 w-10 (40px) - 모바일에서 적절한 크기
            - 간격: gap-2 (8px) - 모바일에서 공간 절약
            - 회사명 텍스트: text-[10px] (10px) - 모바일에서 작게, 전체 회사명 표시
            - flex items-center로 로고와 텍스트를 컨테이너 내부에서 수직 중앙 정렬
            - 텍스트의 line-height를 1로 설정하여 정확한 중앙 정렬
            - 데스크톱에서는 기존 크기 유지
          */}
          <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 min-w-0 h-full">
            <img 
              src={
                isOverLightBackground
                  ? logo3
                  : (isLandingPage ? logo2 : logo3)
              } 
              alt="회사 로고" 
              className="h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-[3.75rem] xl:w-[3.75rem] desktop:h-16 desktop:w-16 2xl:h-20 2xl:w-20 flex-shrink-0 object-contain"
            />
            <Link 
              to="/" 
              onClick={() => window.scrollTo(0, 0)} 
              className={`h-full flex items-center text-base leading-none sm:text-sm md:text-sm lg:text-base xl:text-lg desktop:text-2xl 2xl:text-3xl font-semibold font-logo transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis ${
                brandTextClass
              }`}
            >
              {/* 모바일: 기존 text-base / sm~ 는 태블릿 네비 높이에 맞춘 단계 */}
              대한민국상이군경회시설사업소
            </Link>
          </div>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden desktop:flex items-center space-x-8">
            {Object.keys(menuStructure).map((menu) => (
              <div
                key={menu}
                className="relative"
                onMouseEnter={() => handleMenuEnter(menu)}
                onMouseLeave={handleMenuLeave}
              >
                <button
                  className={`px-4 py-2 text-xl font-normal rounded-lg transition-all duration-200 font-korean ${
                    isOverLightBackground
                      ? `drop-shadow-none ${activeMenu === menu 
                          ? 'bg-gray-200 text-[#0B1C2B]' 
                          : 'text-[#0B1C2B] hover:text-[#0B1C2B]/80 hover:bg-gray-100'
                        }`
                      : `drop-shadow-md ${activeMenu === menu 
                          ? 'bg-white/20 text-white' 
                          : 'text-white hover:text-white/80 hover:bg-white/10'
                        }`
                  }`}
                  onClick={
                    menu === '회사소개'
                      ? handleCompanyIntroClick
                      : menu === '분야별 수행실적'
                        ? handlePortfolioClick
                        : menu === '관계법령'
                          ? handleLegalBasisClick
                          : menu === '자료실'
                            ? handleRecruitClick
                          : undefined
                  }
                  aria-haspopup="true"
                  aria-expanded={activeMenu === menu}
                >
                  {menu}
                </button>

                {/* 드롭다운 메뉴 - 흰색 라인 아래로 위치 */}
                {activeMenu === menu && menuStructure[menu].length > 0 && (
                  <div className={`absolute top-full left-0 mt-12 w-48 rounded-lg shadow-lg nav-slide-down open ${dropdownContainerClass}`}>
                    {menuStructure[menu].map((subMenu) => (
                      subMenu === '수의계약근거' ? (
                        <Link
                          key={subMenu}
                          to="/legal-basis"
                          className={`block px-4 py-2 text-lg hover:underline transition-all duration-200 font-korean ${
                            dropdownItemClass
                          }`}
                        >
                          {subMenu}
                        </Link>
                      ) : subMenu === '인사말' ? (
                        <a
                          key={subMenu}
                          href="#ceo-message"
                          onClick={handleCeoMessageClick}
                          className={`block px-4 py-2 text-lg hover:underline transition-all duration-200 font-korean ${
                            dropdownItemClass
                          }`}
                        >
                          {subMenu}
                        </a>
                      ) : subMenu === '회사연혁' ? (
                        <a
                          key={subMenu}
                          href="#"
                          onClick={handleHistoryClick}
                          className={`block px-4 py-2 text-lg hover:underline transition-all duration-200 font-korean ${
                            dropdownItemClass
                          }`}
                        >
                          {subMenu}
                        </a>
                      ) : subMenu === '보유면허 및 기술' ? (
                        <a
                          key={subMenu}
                          href="#"
                          onClick={handleLicenseClick}
                          className={`block px-4 py-2 text-lg hover:underline transition-all duration-200 font-korean ${
                            dropdownItemClass
                          }`}
                        >
                          {subMenu}
                        </a>
                      ) : subMenu === '조직구성' ? (
                        <a
                          key={subMenu}
                          href="#"
                          onClick={handleOrganizationClick}
                          className={`block px-4 py-2 text-lg hover:underline transition-all duration-200 font-korean ${
                            dropdownItemClass
                          }`}
                        >
                          {subMenu}
                        </a>
                      ) : subMenu === '안전진단' ? (
                        <a
                          key={subMenu}
                          href="#"
                          onClick={handlePortfolioBridgeTunnelClick}
                          className={`block px-4 py-2 text-lg hover:underline transition-all duration-200 font-korean ${
                            dropdownItemClass
                          }`}
                        >
                          {subMenu}
                        </a>
                      ) : subMenu === '설계' ? (
                        <a
                          key={subMenu}
                          href="#"
                          onClick={handlePortfolioDesignClick}
                          className={`block px-4 py-2 text-lg hover:underline transition-all duration-200 font-korean ${
                            dropdownItemClass
                          }`}
                        >
                          {subMenu}
                        </a>
                      ) : subMenu === '건설사업관리' ? (
                        <a
                          key={subMenu}
                          href="#"
                          onClick={handlePortfolioSupervisionClick}
                          className={`block px-4 py-2 text-lg hover:underline transition-all duration-200 font-korean ${
                            dropdownItemClass
                          }`}
                        >
                          {subMenu}
                        </a>
                      ) : (
                        <Link
                          key={subMenu}
                          to="/portfolio"
                          className={`block px-4 py-2 text-lg hover:underline transition-all duration-200 font-korean ${
                            dropdownItemClass
                          }`}
                        >
                          {subMenu}
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 모바일 햄버거 버튼 */}
          {/* 
            모바일 버튼 최적화:
            - 컨테이너 높이를 네비게이션 바 높이와 동일하게 설정하여 버튼 상자 크기 조절
            - 터치 친화적 크기: 최소 44x44px (p-2.5로 약 40px, 충분함)
            - 아이콘 크기: 모바일에서 h-6 w-6 (24px) 유지
            - h-full flex items-center로 버튼 컨테이너를 네비게이션 바 높이에 맞추고 수직 중앙 정렬
            - 버튼 내부에서도 flex items-center justify-center로 SVG 아이콘을 수직 중앙 정렬
          */}
          <div className="desktop:hidden flex items-center h-full">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`h-full flex items-center justify-center px-2.5 transition-colors duration-300 rounded-lg hover:bg-opacity-10 hover:bg-current ${
                isOverLightBackground 
                  ? 'text-[#0B1C2B] hover:text-[#0B1C2B]/80' 
                  : 'text-white hover:text-white/80 drop-shadow-md'
              }`}
              aria-label="메뉴 열기"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {/* 
          모바일 메뉴 최적화:
          1. 최대 높이 설정: max-h-[calc(100vh-4rem)] - 화면 높이에서 네비게이션 바 높이를 뺀 값
          2. 스크롤 가능: overflow-y-auto로 내용이 많을 때 스크롤 가능
          3. 애니메이션: slide-down 효과로 부드러운 전환
          4. 패딩 조정: 모바일에서 px-3 py-3으로 공간 효율적
        */}
        {isMobileMenuOpen && (
          <div className={`desktop:hidden backdrop-blur-sm border-t overflow-y-auto max-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out ${
            mobileMenuPanelClass
          }`}>
            <div className="px-3 py-3 sm:px-4 sm:py-4 space-y-2">
              {Object.keys(menuStructure).map((menu) => (
                <div key={menu}>
                  {/* 
                    모바일 메뉴 버튼 최적화:
                    - 터치 친화적: py-3 (12px 상하 패딩)로 충분한 클릭 영역 확보
                    - 텍스트 크기: text-base (16px) - 모바일에서 읽기 좋은 크기
                    - 패딩: px-3 (12px 좌우) - 모바일에서 공간 효율적
                  */}
                  <button
                    onClick={() => {
                      if (menu === '관계법령') {
                        handleLegalBasisClick();
                      } else if (menu === '자료실') {
                        handleRecruitClick();
                      } else {
                        toggleMobileMenu(menu);
                      }
                    }}
                    className={`w-full text-left px-3 py-3 sm:px-4 sm:py-2 text-base sm:text-lg font-medium rounded-lg flex justify-between items-center font-korean transition-colors duration-200 active:scale-[0.98] ${
                      mobileMenuButtonThemeClass
                    }`}
                  >
                    <span className="flex-1">{menu}</span>
                    {menuStructure[menu].length > 0 && menu !== '관계법령' && (
                      <span className={`ml-2 text-sm transition-transform duration-200 flex-shrink-0 ${mobileExpandedMenus.includes(menu) ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    )}
                  </button>
                  
                  {/* 
                    서브메뉴 최적화:
                    - 들여쓰기: ml-3 (12px) - 모바일에서 적절한 계층 표현
                    - 간격: space-y-1 (4px) - 메뉴 항목 간 적절한 간격
                    - 패딩: px-3 py-2 - 터치 친화적 크기
                  */}
                  {mobileExpandedMenus.includes(menu) && (
                    <div className="ml-3 sm:ml-4 mt-1 space-y-1">
                      {/* 
                        서브메뉴 링크 최적화:
                        - 텍스트 크기: text-sm (14px) - 모바일에서 적절한 크기
                        - 패딩: px-3 py-2.5 - 터치 친화적 크기
                        - active 상태 추가: 터치 피드백 개선
                      */}
                      {menuStructure[menu].map((subMenu) => (
                        subMenu === '수의계약근거' ? (
                          <Link
                            key={subMenu}
                            to="/legal-basis"
                            className={`block px-3 py-2.5 sm:px-4 sm:py-2 text-sm sm:text-lg hover:underline active:bg-opacity-20 active:bg-current rounded transition-all duration-200 font-korean ${
                              dropdownItemClass
                            }`}
                          >
                            {subMenu}
                          </Link>
                        ) : subMenu === '인사말' ? (
                          <a
                            key={subMenu}
                            href="#ceo-message"
                            onClick={handleCeoMessageClick}
                            className={`block px-3 py-2.5 sm:px-4 sm:py-2 text-sm sm:text-lg hover:underline active:bg-opacity-20 active:bg-current rounded transition-all duration-200 font-korean ${
                              dropdownItemClass
                            }`}
                          >
                            {subMenu}
                          </a>
                        ) : subMenu === '회사연혁' ? (
                          <a
                            key={subMenu}
                            href="#"
                            onClick={handleHistoryClick}
                            className={`block px-3 py-2.5 sm:px-4 sm:py-2 text-sm sm:text-lg hover:underline active:bg-opacity-20 active:bg-current rounded transition-all duration-200 font-korean ${
                              dropdownItemClass
                            }`}
                          >
                            {subMenu}
                          </a>
                        ) : subMenu === '보유면허 및 기술' ? (
                          <a
                            key={subMenu}
                            href="#"
                            onClick={handleLicenseClick}
                            className={`block px-3 py-2.5 sm:px-4 sm:py-2 text-sm sm:text-lg hover:underline active:bg-opacity-20 active:bg-current rounded transition-all duration-200 font-korean ${
                              dropdownItemClass
                            }`}
                          >
                            {subMenu}
                          </a>
                        ) : subMenu === '조직구성' ? (
                          <a
                            key={subMenu}
                            href="#"
                            onClick={handleOrganizationClick}
                            className={`block px-3 py-2.5 sm:px-4 sm:py-2 text-sm sm:text-lg hover:underline active:bg-opacity-20 active:bg-current rounded transition-all duration-200 font-korean ${
                              dropdownItemClass
                            }`}
                          >
                            {subMenu}
                          </a>
                        ) : subMenu === '안전진단' ? (
                          <a
                            key={subMenu}
                            href="#"
                            onClick={handlePortfolioBridgeTunnelClick}
                            className={`block px-3 py-2.5 sm:px-4 sm:py-2 text-sm sm:text-lg hover:underline active:bg-opacity-20 active:bg-current rounded transition-all duration-200 font-korean ${
                              dropdownItemClass
                            }`}
                          >
                            {subMenu}
                          </a>
                        ) : subMenu === '설계' ? (
                          <a
                            key={subMenu}
                            href="#"
                            onClick={handlePortfolioDesignClick}
                            className={`block px-3 py-2.5 sm:px-4 sm:py-2 text-sm sm:text-lg hover:underline active:bg-opacity-20 active:bg-current rounded transition-all duration-200 font-korean ${
                              dropdownItemClass
                            }`}
                          >
                            {subMenu}
                          </a>
                        ) : subMenu === '건설사업관리' ? (
                          <a
                            key={subMenu}
                            href="#"
                            onClick={handlePortfolioSupervisionClick}
                            className={`block px-3 py-2.5 sm:px-4 sm:py-2 text-sm sm:text-lg hover:underline active:bg-opacity-20 active:bg-current rounded transition-all duration-200 font-korean ${
                              dropdownItemClass
                            }`}
                          >
                            {subMenu}
                          </a>
                        ) : (
                          <Link
                            key={subMenu}
                            to="/portfolio"
                            className={`block px-3 py-2.5 sm:px-4 sm:py-2 text-sm sm:text-lg hover:underline active:bg-opacity-20 active:bg-current rounded transition-all duration-200 font-korean ${
                              dropdownItemClass
                            }`}
                          >
                            {subMenu}
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};