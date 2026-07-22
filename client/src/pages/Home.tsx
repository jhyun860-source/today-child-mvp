/**
 * 오늘의아이 — 홈 (오늘의 카드 하나)
 * Design: Warm Morning Light — 크림 배경, 테라코타 포인트, Gowun Batang 세리프 헤드라인
 * 원칙: 30초 안에 읽고, 3분 안에 실행. 메뉴 최소화. Zero-Time UI.
 */
import { useEffect, useMemo, useState } from "react";
import { Check, Clock, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { getTodayMission, categoryColors, type Mission } from "@/lib/missions";

const LOGO = "/manus-storage/today-child-logo_74161b7e.png";
const HERO = "/manus-storage/today-child-hero_6f7ba1fc.png";
const COMPLETE_IMG = "/manus-storage/today-child-complete_b7cbcde5.png";

const AGE_OPTIONS = [
  { label: "0~3개월", value: 2 },
  { label: "4~6개월", value: 5 },
  { label: "7~12개월", value: 10 },
  { label: "13~18개월", value: 16 },
  { label: "19~24개월", value: 22 },
  { label: "25~36개월", value: 30 },
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function formatToday() {
  const d = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
}

function Stars({ n }: { n: number }) {
  return (
    <span className="tracking-tight text-[oklch(0.66_0.14_40)]">
      {"★".repeat(n)}
      <span className="text-[oklch(0.89_0.02_75)]">{"★".repeat(5 - n)}</span>
    </span>
  );
}

/* ---------- 온보딩 (개월수 선택) ---------- */
function Onboarding({ onSelect }: { onSelect: (m: number) => void }) {
  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-3 duration-500">
      <img src={HERO} alt="" className="w-52 h-64 object-cover rounded-3xl shadow-lg shadow-[oklch(0.66_0.14_40)]/10 mb-7" />
      <h1 className="font-serif-kr text-[26px] font-bold leading-snug text-center">
        오늘 우리 아이에게
        <br />
        <span className="text-primary">가장 필요한 한 가지</span>
      </h1>
      <p className="mt-3 text-[15px] text-muted-foreground text-center leading-relaxed">
        검색하지 마세요. 매일 딱 하나만 알려드려요.
        <br />
        회원가입도, 개인정보도 필요 없어요.
      </p>
      <p className="mt-8 mb-3 text-[13px] font-semibold text-muted-foreground tracking-wide">아이의 개월수를 골라주세요</p>
      <div className="grid grid-cols-2 gap-2.5 w-full">
        {AGE_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => onSelect(o.value)}
            className="h-14 rounded-2xl bg-card border border-border text-[16px] font-semibold shadow-sm transition-all duration-150 hover:border-primary hover:text-primary hover:shadow-md active:scale-[0.97]"
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-6 text-[12px] text-muted-foreground/70">개월수는 이 기기에만 저장됩니다</p>
    </div>
  );
}

/* ---------- 오늘의 카드 ---------- */
function TodayCard({
  mission,
  ageLabel,
  done,
  onDone,
  onChangeAge,
}: {
  mission: Mission;
  ageLabel: string;
  done: boolean;
  onDone: () => void;
  onChangeAge: () => void;
}) {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* 날짜 스탬프 */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-primary/40 px-4 py-1.5">
          <span className="text-[13px] font-bold text-primary tracking-wide">{formatToday()}</span>
        </div>
        <button
          onClick={onChangeAge}
          className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-primary transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {ageLabel}
        </button>
      </div>

      {/* 카드 본체 */}
      <div className="rounded-3xl bg-card border border-border shadow-xl shadow-[oklch(0.66_0.14_40)]/8 overflow-hidden">
        <div className="px-7 pt-7 pb-6">
          <span className={`inline-block rounded-full px-3 py-1 text-[12px] font-bold ${categoryColors[mission.category]}`}>
            오늘의 {mission.category}
          </span>
          <h2 className="font-serif-kr text-[30px] font-bold leading-tight mt-3.5">{mission.title}</h2>

          {/* 메타 정보 */}
          <div className="flex items-center gap-5 mt-4 text-[13.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {mission.time}
            </span>
            <span className="inline-flex items-center gap-1.5">
              준비물 <Stars n={mission.prepStars} />
              <span className="font-medium text-foreground/80">{mission.prep}</span>
            </span>
          </div>

          <hr className="my-5 border-border" />

          {/* 부모가 할 말 */}
          <div className="rounded-2xl bg-[oklch(0.96_0.025_60)] px-5 py-4">
            <p className="text-[12px] font-bold text-primary mb-1">이렇게 말해보세요</p>
            <p className="font-serif-kr text-[19px] font-bold leading-snug">{mission.say}</p>
          </div>

          {/* 실행 방법 */}
          <ol className="mt-5 space-y-2.5">
            {mission.how.map((step, i) => (
              <li key={i} className="flex gap-3 text-[15.5px] leading-relaxed">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-[13px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          {/* 안 하면 */}
          <div className="mt-5 rounded-2xl border border-dashed border-border px-5 py-3.5">
            <p className="text-[12px] font-bold text-muted-foreground mb-0.5">아이가 안 하면?</p>
            <p className="text-[14.5px] leading-relaxed text-foreground/85">{mission.ifNot}</p>
          </div>

          {/* 왜? + 출처 */}
          <div className="mt-5">
            <p className="text-[12px] font-bold text-[oklch(0.42_0.07_150)] mb-1 inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 왜 도움이 될까요?
            </p>
            <p className="text-[14.5px] leading-relaxed text-foreground/85">{mission.why}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11.5px] font-bold text-muted-foreground mr-0.5">근거</span>
              {mission.sources.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-md bg-[oklch(0.93_0.025_150)] px-2 py-1">
                  <ShieldCheck className="w-3 h-3 text-[oklch(0.42_0.07_150)]" />
                  <span className="text-[11.5px] font-bold text-[oklch(0.42_0.07_150)]">{s}</span>
                </span>
              ))}
            </div>
            <p className="mt-2.5 text-[11.5px] leading-relaxed text-muted-foreground/80">
              국내외 공공 보건기관의 개방 자료를 바탕으로, 바로 실천할 수 있게 재구성했습니다.
            </p>
          </div>
        </div>

        {/* 완료 버튼 */}
        <div className="px-7 pb-7">
          <button
            onClick={onDone}
            disabled={done}
            className={`w-full h-14 rounded-2xl text-[17px] font-bold transition-all duration-200 active:scale-[0.97] ${
              done
                ? "bg-[oklch(0.93_0.025_150)] text-[oklch(0.42_0.07_150)]"
                : "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-105"
            }`}
          >
            {done ? (
              <span className="inline-flex items-center gap-2">
                <Check className="w-5 h-5" /> 오늘 미션 완료!
              </span>
            ) : (
              "했어요!"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 완료 화면 ---------- */
function DoneView({ streak, onBack }: { streak: number; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-400">
      <img src={COMPLETE_IMG} alt="" className="w-44 h-44 object-cover rounded-full shadow-lg mb-6" />
      <h2 className="font-serif-kr text-[26px] font-bold">오늘도 해냈어요</h2>
      <p className="mt-2.5 text-[15px] text-muted-foreground leading-relaxed">
        아이에게 필요한 건 완벽한 부모가 아니라
        <br />
        오늘 함께한 3분이에요.
      </p>
      <div className="mt-6 rounded-2xl bg-card border border-border px-8 py-4 shadow-sm">
        <p className="text-[12px] font-bold text-muted-foreground">함께한 날</p>
        <p className="font-serif-kr text-[32px] font-bold text-primary">{streak}일</p>
      </div>
      <p className="mt-6 text-[14px] font-semibold text-primary">내일 또 만나요 🌅</p>
      <button onClick={onBack} className="mt-4 text-[13px] text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors">
        오늘의 카드 다시 보기
      </button>
    </div>
  );
}

/* ---------- 메인 ---------- */
export default function Home() {
  const [months, setMonths] = useState<number | null>(() => {
    const v = localStorage.getItem("todaychild_months");
    return v ? Number(v) : null;
  });
  const [doneToday, setDoneToday] = useState(() => localStorage.getItem("todaychild_done") === todayKey());
  const [showDone, setShowDone] = useState(false);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem("todaychild_streak") || 0));

  const mission = useMemo(() => (months !== null ? getTodayMission(months) : null), [months]);
  const ageLabel = AGE_OPTIONS.find((o) => o.value === months)?.label ?? "";

  useEffect(() => {
    if (months !== null) localStorage.setItem("todaychild_months", String(months));
  }, [months]);

  // 화면(온보딩→카드→완료) 전환 시 항상 최상단으로 스크롤해 전환을 명확히 인지시킴
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [months, showDone]);

  const handleSelectAge = (m: number) => {
    setMonths(m);
    setShowDone(false);
  };

  const handleDone = () => {
    if (doneToday) return;
    const next = streak + 1;
    setStreak(next);
    setDoneToday(true);
    setShowDone(true);
    localStorage.setItem("todaychild_done", todayKey());
    localStorage.setItem("todaychild_streak", String(next));
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 데스크톱 좌측 브랜드 존 */}
      <aside className="hidden lg:flex flex-col justify-between w-[42%] bg-[oklch(0.96_0.02_70)] p-12 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <img src={LOGO} alt="오늘의아이" className="w-11 h-11" />
          <span className="font-serif-kr text-[22px] font-bold">
            <span className="text-primary">오늘</span>의아이
          </span>
        </div>
        <div>
          <h2 className="font-serif-kr text-[38px] font-bold leading-snug">
            오늘은
            <br />
            검색하지 마세요.
          </h2>
          <p className="mt-5 text-[16px] text-muted-foreground leading-relaxed">
            정보는 이미 충분해요.
            <br />
            부족한 건 <b className="text-foreground">"그래서 오늘 뭘 하지?"</b>에 대한 답이에요.
            <br />
            오늘의아이가 매일 딱 하나만 정해드려요.
          </p>
          <div className="mt-8 flex flex-col gap-2 text-[13.5px] text-muted-foreground">
            <span>✓ 회원가입 없음 · 개인정보 수집 없음</span>
            <span>✓ 30초 안에 읽고, 3분 안에 실행</span>
            <span>✓ 질병관리청·CDC 등 공공기관 근거 · 출처 표기</span>
          </div>
          <div className="mt-6 rounded-2xl bg-[oklch(0.99_0.008_90)] border border-border px-5 py-4 max-w-[380px]">
            <p className="text-[12px] font-bold text-[oklch(0.42_0.07_150)] mb-1.5">신뢰할 수 있는 근거</p>
            <p className="text-[13px] leading-relaxed text-foreground/80">
              질병관리청·보건복지부·국가건강정보포털과 미국 CDC, 영국 NHS, WHO 등
              공공기관이 공개한 자료만 근거로 사용하고, 모든 카드에 출처를 표기합니다.
            </p>
          </div>
        </div>
        <p className="text-[12px] text-muted-foreground/60">MVP 목업 · 콘텐츠는 예시입니다</p>
      </aside>

      {/* 앱 영역 */}
      <main className="flex-1 flex flex-col items-center px-5 py-8 lg:justify-center">
        {/* 모바일 헤더 */}
        <header className="lg:hidden flex items-center gap-2.5 mb-7 self-start">
          <img src={LOGO} alt="오늘의아이" className="w-9 h-9" />
          <span className="font-serif-kr text-[19px] font-bold">
            <span className="text-primary">오늘</span>의아이
          </span>
        </header>

        <div className="w-full max-w-[420px]">
          {months === null ? (
            <Onboarding onSelect={handleSelectAge} />
          ) : showDone ? (
            <DoneView streak={streak} onBack={() => setShowDone(false)} />
          ) : (
            mission && (
              <TodayCard
                mission={mission}
                ageLabel={ageLabel}
                done={doneToday}
                onDone={handleDone}
                onChangeAge={() => setMonths(null)}
              />
            )
          )}
        </div>
      </main>
    </div>
  );
}
