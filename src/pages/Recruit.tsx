import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import logo3 from '@/assets/logo3.png';

const HERO_WIDTH = 100;
const CONTENT_WIDTH = 70; // PC 기준 70%
const INSTANT_SCROLL = 'instant' as ScrollBehavior;
const HERO_KEYFRAMES = `
@keyframes floatY {
  0%, 100% { transform: translateY(0) }
  50% { transform: translateY(-10px) }
}
@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(16px) }
  100% { opacity: 1; transform: translateY(0) }
}
`;

const Recruit = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: INSTANT_SCROLL });
  }, []);

  const [showInitial, setShowInitial] = useState(false);
  const [showPost, setShowPost] = useState(false);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setShowInitial(true), 50);
    const postTimer = window.setTimeout(() => setShowPost(true), 3000);
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(postTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation variant="default" forceLightTheme={true} autoHideOnMount />

      <main>
        {/* Fullscreen Hero */}
        <section className="relative min-h-screen overflow-hidden bg-white">
          <style>{HERO_KEYFRAMES}</style>
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-white" />
            <div className="absolute -left-12 sm:-left-24 -top-12 sm:-top-24 w-[300px] sm:w-[520px] h-[300px] sm:h-[520px] rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -right-12 sm:-right-24 -bottom-12 sm:-bottom-24 w-[300px] sm:w-[520px] h-[300px] sm:h-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
          </div>

          <div style={{ width: `${HERO_WIDTH}%`, margin: '0 auto' }} className="px-4 sm:px-6 lg:px-8">
            <div className="w-full h-[100svh] relative">
              <div
                className="absolute inset-0 flex flex-col items-center justify-center space-y-4 sm:space-y-6 text-center px-4"
                style={{
                  opacity: showPost ? 0 : showInitial ? 1 : 0,
                  transition: 'opacity 1.2s ease'
                }}
              >
                <div className="flex justify-center">
                  <img
                    src={logo3}
                    alt="회사 로고"
                    className="w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 h-auto"
                    style={{ animation: 'floatY 6s ease-in-out infinite' }}
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.onerror = null;
                      img.style.display = 'none';
                    }}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-[#2C3E5E] text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-korean tracking-wide" style={{ wordBreak: 'keep-all' }}>
                    대한민국상이군경회시설사업소
                  </p>
                  <h1 className="leading-tight font-semibold font-korean text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-tight text-[#0D2A4A]" style={{ wordBreak: 'keep-all' }}>
                    2026 안전진단팀 신입/경력 모집
                  </h1>
                </div>
              </div>

              {showPost && (
                <>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 animate-fade-in px-4">
                    <div
                      className="flex flex-col items-center leading-none gap-3 sm:gap-5 md:gap-7"
                      style={{ marginTop: '-2vh', animation: 'floatY 6s ease-in-out 0.6s infinite' }}
                    >
                      <div className="font-extrabold text-foreground text-[50px] sm:text-[90px] md:text-[150px] lg:text-[220px] xl:text-[280px]">
                        We are
                      </div>
                      <div className="font-extrabold text-[50px] sm:text-[90px] md:text-[150px] lg:text-[220px] xl:text-[280px]">
                        <span className="text-[#1D66B3]">Hi</span>
                        <span className="text-foreground">ring!</span>
                      </div>
                      <div className="mt-6 sm:mt-8 md:mt-10 flex flex-wrap items-center gap-2 sm:gap-3 md:gap-10 justify-center w-full sm:w-[90%] md:w-[70%]">
                        <div className="px-4 sm:px-6 md:px-7 py-2 sm:py-3 md:py-3.5 rounded-full bg-[#1D66B3] text-white font-semibold text-sm sm:text-lg md:text-xl lg:text-2xl shadow text-center">
                          안전진단 부문 기술자 신입/경력 모집
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Values banner */}
        <section className="relative py-12 sm:py-16 md:py-20 bg-[#1A1F24] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-12 sm:-top-20 -right-12 sm:-right-24 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500/10 blur-3xl rounded-full" />
            <div className="absolute top-20 sm:top-40 -left-12 sm:-left-24 w-40 sm:w-64 h-40 sm:h-64 bg-emerald-400/10 blur-3xl rounded-full" />
          </div>
          <div className="w-full sm:w-[85%] md:w-[80%] lg:w-[${CONTENT_WIDTH}%] mx-auto relative px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white">
              <div className="flex flex-col items-center">
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-[52px] font-extrabold tracking-[0.2em] font-english">TRUST</p>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/70 font-korean mt-1">신뢰</p>
              </div>
              <div className="mt-8 sm:mt-10 flex flex-col items-center">
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-[52px] font-extrabold tracking-[0.2em] font-english">FLEXIBILITY</p>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/70 font-korean mt-1">유연함</p>
              </div>
              <div className="mt-8 sm:mt-10 flex flex-col items-center">
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-[52px] font-extrabold tracking-[0.2em] font-english">PASSION</p>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/70 font-korean mt-1">열정</p>
              </div>
              <p className="mt-8 sm:mt-10 text-white/80 text-sm sm:text-base md:text-lg font-korean">
                함께 성장하는 기업, 대한민국상이군경회시설사업소
              </p>
            </div>

            <div className="mt-10 sm:mt-12 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 text-left text-white font-korean">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 md:p-6 flex flex-col">
                <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-white/60 font-medium">채용분야</p>
                <p className="mt-2 sm:mt-3 text-lg sm:text-xl md:text-2xl font-semibold text-white">안전진단 기술자</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 md:p-6 flex flex-col">
                <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-white/60 font-medium">서류접수</p>
                <p className="mt-2 sm:mt-3 text-lg sm:text-xl md:text-2xl font-semibold text-white">2026.02.01 ~ 2026.03.31</p>
                <p className="mt-2 text-xs sm:text-sm text-white/70">온라인 접수 · 이메일 제출 (kdvosisul@daum.net)</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 md:p-6 flex flex-col">
                <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-white/60 font-medium">채용형태</p>
                <p className="mt-2 sm:mt-3 text-lg sm:text-xl md:text-2xl font-semibold text-white">정규직 · 신입/경력</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 md:p-6 flex flex-col">
                <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-white/60 font-medium">전형절차</p>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-white/80 leading-6">서류접수 → 면접 → 최종합격</p>
                <p className="mt-2 text-xs sm:text-sm text-white/70">제출서류: 1. 이력서 2. 자기소개서</p>
              </div>
            </div>

            <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 text-left text-white font-korean">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 md:p-6">
                <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-white/60 font-medium">주요업무</p>
                <ul className="mt-2 sm:mt-3 space-y-2 text-xs sm:text-sm text-white/80">
                  <li>- 토목/건축 시설물 안전진단</li>
                  <li>- 안전관리 프로세스 개선</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 md:p-6">
                <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-white/60 font-medium">필수요건</p>
                <ul className="mt-2 sm:mt-3 space-y-2 text-xs sm:text-sm text-white/80">
                  <li>- 관련학과 졸업자(졸업예정자 포함)</li>
                  <li>- 협업 및 커뮤니케이션 능력</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 md:p-6">
                <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-white/60 font-medium">우대사항</p>
                <ul className="mt-2 sm:mt-3 space-y-2 text-xs sm:text-sm text-white/80">
                  <li>1. OA프로그램(한글, EXCEL, PPT) 활용 능력 우수자</li>
                  <li>2. 관련학과 자격증 소지자</li>
                  <li>3. CAD 활용 능력 우수자</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="bg-[#1A1F24]">
        <Footer />
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Recruit;
