/**
 * Pour Guide style: Service Bar Ledger — editorial mobile utility with oat-paper surfaces,
 * ink-black type, and Aperitif Red reserved for active production decisions.
 */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  Flame,
  GlassWater,
  Heart,
  Home as HomeIcon,
  Menu,
  Minus,
  Plus,
  Search,
  Settings2,
  Shuffle,
  Sparkles,
  TimerReset,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Recipe = {
  id: string;
  name: string;
  koreanName: string;
  category: "Classics" | "Signatures" | "No/Low";
  base: string;
  taste: string[];
  time: string;
  method: string;
  image: string;
  color: string;
  description: string;
  glass: string;
  garnish: string;
  ingredients: { amount: number; unit: string; item: string; note?: string }[];
  steps: { title: string; detail: string; timer?: number }[];
};

const recipes: Recipe[] = [
  {
    id: "negroni",
    name: "Negroni",
    koreanName: "네그로니",
    category: "Classics",
    base: "Gin",
    taste: ["Bitter", "Spirit-forward"],
    time: "2 min",
    method: "Build",
    image: "/assets/negroni-editorial.jpg",
    color: "#BF3F32",
    description: "정확히 같은 비율로, 천천히 차갑게. 오렌지 오일의 향을 마지막에 올립니다.",
    glass: "Rocks glass",
    garnish: "Orange peel",
    ingredients: [
      { amount: 30, unit: "ml", item: "London dry gin" },
      { amount: 30, unit: "ml", item: "Campari" },
      { amount: 30, unit: "ml", item: "Sweet vermouth" },
      { amount: 1, unit: "pc", item: "Orange peel", note: "expressed" },
    ],
    steps: [
      { title: "잔을 차갑게 준비", detail: "깨끗한 록스 글라스에 큰 얼음 1개를 넣어 잔을 먼저 식힙니다." },
      { title: "재료를 정확히 계량", detail: "진, 캄파리, 스위트 베르무트를 각각 30ml씩 잔에 붓습니다." },
      { title: "차갑고 부드럽게 스터", detail: "바 스푼으로 20초간 천천히 저어 희석과 온도를 맞춥니다.", timer: 20 },
      { title: "오렌지 오일로 마무리", detail: "오렌지 필을 잔 위에서 비틀어 오일을 내고 림을 문지른 후 넣습니다." },
    ],
  },
  {
    id: "gimlet",
    name: "Gimlet",
    koreanName: "김렛",
    category: "Classics",
    base: "Gin",
    taste: ["Citrus", "Crisp"],
    time: "3 min",
    method: "Shake",
    image: "/assets/gimlet-editorial.jpg",
    color: "#7F8B52",
    description: "차갑게 셰이크한 진과 라임의 균형. 과한 단맛 없이 날카롭게 끝냅니다.",
    glass: "Small coupe",
    garnish: "Lime wheel",
    ingredients: [
      { amount: 60, unit: "ml", item: "London dry gin" },
      { amount: 22.5, unit: "ml", item: "Fresh lime juice" },
      { amount: 15, unit: "ml", item: "Simple syrup" },
      { amount: 1, unit: "pc", item: "Lime wheel" },
    ],
    steps: [
      { title: "쿠페를 칠링", detail: "차가운 쿠페 글라스를 준비합니다. 잔 벽에 물기가 없도록 비웁니다." },
      { title: "셰이커에 계량", detail: "진, 라임 주스, 심플 시럽을 셰이커에 정확히 계량합니다." },
      { title: "짧고 강하게 셰이크", detail: "신선한 얼음을 채우고 12초간 강하게 셰이크합니다.", timer: 12 },
      { title: "더블 스트레인", detail: "미세한 얼음 조각 없이 차가운 쿠페로 더블 스트레인합니다. 라임 휠을 올립니다." },
    ],
  },
  {
    id: "old-fashioned",
    name: "Old Fashioned",
    koreanName: "올드 패션드",
    category: "Classics",
    base: "Whisky",
    taste: ["Rich", "Spirit-forward"],
    time: "3 min",
    method: "Build",
    image: "/assets/old-fashioned-editorial.jpg",
    color: "#A86B30",
    description: "위스키의 결을 해치지 않도록, 단맛과 비터는 조용히 받쳐 줍니다.",
    glass: "Rocks glass",
    garnish: "Orange coin",
    ingredients: [
      { amount: 60, unit: "ml", item: "Bourbon whiskey" },
      { amount: 7.5, unit: "ml", item: "Demerara syrup" },
      { amount: 2, unit: "dash", item: "Angostura bitters" },
      { amount: 1, unit: "pc", item: "Orange coin" },
    ],
    steps: [
      { title: "잔과 큰 얼음 준비", detail: "차가운 록스 글라스 중앙에 투명한 큰 얼음 1개를 놓습니다." },
      { title: "재료를 빌드", detail: "버번, 데메라라 시럽, 앙고스투라 비터를 순서대로 넣습니다." },
      { title: "희석을 맞추며 스터", detail: "얼음 표면을 따라 25초간 부드럽게 저어 차갑게 만듭니다.", timer: 25 },
      { title: "오렌지 코인 마무리", detail: "오렌지 코인을 얼음 옆에 세워 향과 실루엣을 마무리합니다." },
    ],
  },
  {
    id: "vermouth-tonic",
    name: "Vermouth Tonic",
    koreanName: "베르무트 토닉",
    category: "No/Low",
    base: "Vermouth",
    taste: ["Light", "Herbal"],
    time: "2 min",
    method: "Build",
    image: "/assets/citrus-service-still-life.jpg",
    color: "#C79738",
    description: "가볍고 허브 향이 선명한 식전 한 잔. 바쁜 오프닝 서비스에 적합합니다.",
    glass: "Highball glass",
    garnish: "Lemon twist",
    ingredients: [
      { amount: 60, unit: "ml", item: "Dry vermouth" },
      { amount: 90, unit: "ml", item: "Tonic water" },
      { amount: 1, unit: "pc", item: "Lemon twist" },
    ],
    steps: [
      { title: "하이볼 잔에 얼음", detail: "잔을 얼음으로 가득 채워 가장자리까지 차갑게 만듭니다." },
      { title: "베르무트와 토닉", detail: "드라이 베르무트를 넣고 차가운 토닉 워터를 조심스럽게 더합니다." },
      { title: "한 번만 리프트", detail: "바 스푼으로 아래에서 위로 한 번만 들어 올려 기포를 지킵니다." },
      { title: "레몬 트위스트", detail: "레몬 오일을 잔 위에 표현하고 가볍게 올립니다." },
    ],
  },
];

const navItems = [
  { id: "home", label: "홈", icon: HomeIcon },
  { id: "search", label: "찾기", icon: Search },
  { id: "saved", label: "저장됨", icon: Heart },
  { id: "manage", label: "관리", icon: Settings2 },
] as const;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export default function Home() {
  const [selectedId, setSelectedId] = useState("negroni");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof navItems)[number]["id"]>("home");
  const [batch, setBatch] = useState(1);
  const [favorites, setFavorites] = useState<string[]>(["negroni", "gimlet"]);
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [filter, setFilter] = useState<"All" | Recipe["category"]>("All");

  const selectedRecipe = recipes.find((recipe) => recipe.id === selectedId) ?? recipes[0];
  const filteredRecipes = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const matchesQuery = [recipe.name, recipe.koreanName, recipe.base, recipe.method, ...recipe.taste]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
      return matchesQuery && (filter === "All" || recipe.category === filter);
    });
  }, [query, filter]);

  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) return;
    const interval = window.setInterval(() => {
      setTimerSeconds((value) => value - 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  useEffect(() => {
    if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      navigator.vibrate?.([120, 60, 120]);
      toast.success("타이머가 끝났습니다.", { description: "다음 제조 단계로 이동하세요." });
    }
  }, [timerSeconds, timerRunning]);

  const selectRecipe = (recipe: Recipe) => {
    setSelectedId(recipe.id);
    setBatch(1);
    setTimerSeconds(0);
    setTimerRunning(false);
    setIsRecipeOpen(true);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const isFavorite = current.includes(id);
      toast(isFavorite ? "즐겨찾기에서 제거했어요." : "즐겨찾기에 저장했어요.");
      return isFavorite ? current.filter((item) => item !== id) : [...current, id];
    });
  };

  const startTimer = (duration: number) => {
    setTimerSeconds(duration);
    setTimerRunning(true);
  };

  const handleNav = (id: (typeof navItems)[number]["id"]) => {
    setActiveTab(id);
    setIsRecipeOpen(false);
    if (id === "manage") toast("관리 화면은 다음 단계에서 연결됩니다.");
  };

  const visibleRecipes = activeTab === "saved" ? filteredRecipes.filter((recipe) => favorites.includes(recipe.id)) : filteredRecipes;

  return (
    <div className="min-h-dvh bg-[#f4f0e8] text-[#171714] selection:bg-[#bf3f32] selection:text-white">
      <div className="mx-auto min-h-dvh max-w-[1440px] bg-[#f8f5ef] lg:grid lg:grid-cols-[335px_minmax(0,1fr)]">
        <aside className="hidden border-r border-black/10 bg-[#efeae0] px-7 py-8 lg:flex lg:flex-col">
          <BrandMark />
          <nav className="mt-12 space-y-1" aria-label="주요 탐색">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`flex w-full items-center gap-3 rounded-sm px-3 py-3 text-left text-sm font-semibold transition-all duration-150 ${
                  activeTab === id ? "bg-[#171714] text-[#f8f5ef]" : "text-[#57544d] hover:bg-black/5 hover:text-[#171714]"
                }`}
              >
                <Icon size={18} strokeWidth={activeTab === id ? 2.5 : 2} />
                {label}
                {id === "saved" && favorites.length > 0 && <span className="ml-auto text-xs opacity-60">{favorites.length}</span>}
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-black/10 pt-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#bf3f32] font-serif text-sm text-white">JH</div>
              <div>
                <p className="text-sm font-bold">J. Hyun</p>
                <p className="mt-0.5 text-xs text-[#706c64]">Service Bar · 오늘</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="relative min-w-0 pb-24 lg:pb-0">
          <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-black/10 bg-[#f8f5ef]/95 px-5 backdrop-blur lg:px-10">
            <div className="flex items-center gap-3 lg:hidden"><BrandMark compact /></div>
            <div className="hidden lg:block">
              <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#8b867c]">SERVICE BAR / 12 AUG 2026</p>
              <h1 className="mt-0.5 font-serif text-xl leading-none">{activeTab === "saved" ? "저장한 레시피" : activeTab === "search" ? "레시피 찾기" : "오늘의 레시피"}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs font-medium text-[#6f6b64] sm:block">금요일 · PM 7:30</span>
              <button
                onClick={() => toast("메뉴 동기화는 연결 후 제공됩니다.")}
                className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white transition active:scale-95"
                aria-label="메뉴 동기화"
              >
                <Shuffle size={16} />
              </button>
            </div>
          </header>

          {isRecipeOpen ? (
            <RecipeMode
              recipe={selectedRecipe}
              batch={batch}
              setBatch={setBatch}
              timerSeconds={timerSeconds}
              timerRunning={timerRunning}
              setTimerRunning={setTimerRunning}
              startTimer={startTimer}
              onBack={() => setIsRecipeOpen(false)}
              isFavorite={favorites.includes(selectedRecipe.id)}
              onFavorite={() => toggleFavorite(selectedRecipe.id)}
            />
          ) : (
            <ExploreView
              activeTab={activeTab}
              query={query}
              setQuery={setQuery}
              filter={filter}
              setFilter={setFilter}
              recipes={visibleRecipes}
              onSelect={selectRecipe}
              favorites={favorites}
              onFavorite={toggleFavorite}
            />
          )}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[#f8f5ef]/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden" aria-label="모바일 탐색">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => handleNav(id)} className={`flex min-w-14 flex-col items-center gap-1 py-1 text-[10px] font-bold ${activeTab === id ? "text-[#bf3f32]" : "text-[#77736a]"}`}>
              <Icon size={20} strokeWidth={activeTab === id ? 2.7 : 2} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[#171714] shadow-[inset_0_0_0_1px_rgba(255,255,255,.15)]">
        <img src="/assets/pour-guide-mark.png" alt="Pour Guide 로고" className="h-8 w-8 object-contain brightness-0 invert" />
        <span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#bf3f32]" />
      </div>
      {!compact && <div><p className="font-serif text-xl leading-none tracking-tight">Pour Guide</p><p className="mt-1 font-mono text-[9px] font-bold tracking-[0.18em] text-[#847f75]">BAR SERVICE NOTES</p></div>}
    </div>
  );
}

function ExploreView({
  activeTab,
  query,
  setQuery,
  filter,
  setFilter,
  recipes: visibleRecipes,
  onSelect,
  favorites,
  onFavorite,
}: {
  activeTab: string;
  query: string;
  setQuery: (value: string) => void;
  filter: "All" | Recipe["category"];
  setFilter: (value: "All" | Recipe["category"]) => void;
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  favorites: string[];
  onFavorite: (id: string) => void;
}) {
  const recent = recipes.slice(0, 3);
  const title = activeTab === "saved" ? "저장한 한 잔" : activeTab === "search" ? "어떤 한 잔이 필요한가요?" : "지금 필요한 한 잔.";
  const subtitle = activeTab === "saved" ? "자주 쓰는 레시피를 한 곳에 모았습니다." : activeTab === "search" ? "이름, 베이스, 맛, 제조 방식으로 빠르게 찾으세요." : "서비스 중에는 핵심만. 계량부터 가니시까지 순서대로.";

  return (
    <section className="px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_276px] lg:gap-12">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#bf3f32]">{activeTab === "saved" ? "FAVOURITES / 02" : "SERVICE MODE / READY"}</p>
            <h2 className="mt-3 max-w-xl font-serif text-[36px] leading-[0.98] tracking-[-0.04em] sm:text-5xl">{title}</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#6e6960]">{subtitle}</p>

            <div className="relative mt-7">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#847f75]" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="예: 네그로니, 진, 상큼한, 셰이크"
                className="h-14 w-full rounded-sm border border-black/10 bg-white pl-11 pr-11 text-sm outline-none transition focus:border-[#bf3f32] focus:ring-4 focus:ring-[#bf3f32]/10"
                aria-label="레시피 검색"
              />
              {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full hover:bg-black/5" aria-label="검색어 지우기"><X size={16} /></button>}
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(["All", "Classics", "Signatures", "No/Low"] as const).map((item) => (
                <button key={item} onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold transition active:scale-95 ${filter === item ? "border-[#171714] bg-[#171714] text-white" : "border-black/10 bg-transparent text-[#615d55] hover:border-black/30"}`}>
                  {item === "All" ? "전체" : item === "Classics" ? "클래식" : item === "Signatures" ? "시그니처" : "논/로우"}
                </button>
              ))}
            </div>
          </div>

          <aside className="min-h-44 border-l-4 border-[#bf3f32] bg-[#171714] p-5 text-[#f8f5ef] shadow-[10px_12px_0_#ddd6c9]">
            <div className="flex h-full flex-col justify-between"><div className="flex items-center justify-between"><span className="font-mono text-[10px] font-bold tracking-[0.15em]">SERVICE STATUS</span><span className="h-2 w-2 rounded-full bg-[#bf3f32]" /></div><div className="mt-7 grid grid-cols-3 divide-x divide-white/15"><div><p className="font-mono text-2xl font-bold">04</p><p className="mt-1 text-[10px] tracking-wide text-white/55">READY</p></div><div className="pl-3"><p className="font-mono text-2xl font-bold">02</p><p className="mt-1 text-[10px] tracking-wide text-white/55">SAVED</p></div><div className="pl-3"><p className="font-mono text-2xl font-bold">30</p><p className="mt-1 text-[10px] tracking-wide text-white/55">MIN SHIFT</p></div></div><p className="mt-5 border-t border-white/15 pt-3 font-mono text-[10px] font-bold tracking-[0.1em] text-white/75">NEXT · NEGRONI / BUILD / 02 MIN</p></div>
          </aside>
        </div>

        <div className="mt-12 flex items-end justify-between border-b border-black/15 pb-3">
          <div><p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#8b867c]">{activeTab === "saved" ? "SAVED RECIPES" : "RECENTLY USED"}</p><h3 className="mt-1 font-serif text-2xl">{activeTab === "saved" ? "즐겨찾기" : "최근 본 레시피"}</h3></div>
          <span className="font-mono text-[10px] font-bold text-[#8b867c]">{visibleRecipes.length.toString().padStart(2, "0")} ITEMS</span>
        </div>

        {visibleRecipes.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleRecipes.map((recipe, index) => <RecipeCard key={recipe.id} recipe={recipe} index={index} onSelect={onSelect} isFavorite={favorites.includes(recipe.id)} onFavorite={onFavorite} />)}
          </div>
        ) : (
          <div className="mt-8 border border-dashed border-black/20 px-5 py-12 text-center"><Search className="mx-auto text-[#8b867c]" /><p className="mt-4 font-serif text-xl">찾는 레시피가 없어요.</p><p className="mt-2 text-sm text-[#77736a]">다른 베이스나 맛으로 다시 검색해 보세요.</p></div>
        )}

        {activeTab === "home" && (
          <section className="mt-12 border-t border-black/10 pt-7">
            <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#8b867c]">QUICK START</p><h3 className="mt-1 font-serif text-2xl">바로 제조하기</h3></div><button onClick={() => onSelect(recipes[0])} className="flex items-center gap-1 text-sm font-bold text-[#bf3f32]">네그로니 열기 <ChevronRight size={16} /></button></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <QuickAction icon={<Clock3 size={18} />} label="빠른 제조" detail="3분 이내 레시피" />
              <QuickAction icon={<GlassWater size={18} />} label="잔 기준 찾기" detail="쿠페 · 록스 · 하이볼" />
              <QuickAction icon={<Flame size={18} />} label="교육 모드" detail="사진과 주의사항 포함" />
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function RecipeCard({ recipe, index, onSelect, isFavorite, onFavorite }: { recipe: Recipe; index: number; onSelect: (recipe: Recipe) => void; isFavorite: boolean; onFavorite: (id: string) => void }) {
  return (
    <article className="group relative border-b border-black/15 bg-transparent transition duration-200 hover:bg-[#eee8dc]" style={{ animationDelay: `${index * 45}ms` }}>
      <button onClick={() => onSelect(recipe)} className="grid w-full grid-cols-[74px_minmax(0,1fr)_34px] items-stretch gap-0 py-3 text-left sm:grid-cols-[92px_minmax(0,1fr)_40px]">
        <div className="relative overflow-hidden bg-[#d6cec0]"><img src={recipe.image} alt={`${recipe.name} 칵테일`} className="h-full min-h-[84px] w-full object-cover grayscale-[20%] transition duration-500 group-hover:scale-105" /><span className="absolute bottom-0 left-0 h-1 w-full bg-[#bf3f32]" /></div>
        <div className="min-w-0 px-4 py-0.5"><div className="flex items-start justify-between gap-2"><div><p className="font-mono text-[9px] font-bold tracking-[0.15em] text-[#bf3f32]">{String(index + 1).padStart(2, "0")} / {recipe.method.toUpperCase()}</p><p className="mt-1 font-serif text-[21px] leading-none">{recipe.name}</p></div><span className="font-mono text-[10px] font-bold text-[#5f5a50]">{recipe.time.toUpperCase()}</span></div><p className="mt-2 text-xs text-[#6f6a60]">{recipe.koreanName} · {recipe.base} · {recipe.glass}</p><div className="mt-3 flex items-center gap-2"><span className="font-mono text-[9px] font-bold tracking-[0.12em] text-[#7d776d]">{recipe.ingredients.length} INGREDIENTS</span><span className="h-px flex-1 bg-black/10" /><span className="font-mono text-[9px] font-bold tracking-[0.12em] text-[#7d776d]">{recipe.steps.length} STEPS</span></div></div>
        <div className="flex items-center justify-center border-l border-black/10"><span className="ledger-barcode" aria-label={`레시피 식별자 ${recipe.id}`} /></div>
      </button>
      <button onClick={(event) => { event.stopPropagation(); onFavorite(recipe.id); }} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-[#f8f5ef] text-[#171714] transition active:scale-95" aria-label={`${recipe.name} 즐겨찾기`}><Heart size={14} fill={isFavorite ? "#bf3f32" : "none"} className={isFavorite ? "text-[#bf3f32]" : ""} /></button>
    </article>
  );
}

function QuickAction({ icon, label, detail }: { icon: React.ReactNode; label: string; detail: string }) {
  return <button onClick={() => toast(`${label} 기능은 다음 버전에서 연결됩니다.`)} className="flex items-center gap-3 border-b border-black/10 py-3 text-left transition hover:border-[#bf3f32]"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#ece6da] text-[#bf3f32]">{icon}</span><span><span className="block text-sm font-bold">{label}</span><span className="mt-0.5 block text-xs text-[#7d786f]">{detail}</span></span><ChevronRight size={15} className="ml-auto text-[#8c867a]" /></button>;
}

function RecipeMode({
  recipe,
  batch,
  setBatch,
  timerSeconds,
  timerRunning,
  setTimerRunning,
  startTimer,
  onBack,
  isFavorite,
  onFavorite,
}: {
  recipe: Recipe;
  batch: number;
  setBatch: (value: number) => void;
  timerSeconds: number;
  timerRunning: boolean;
  setTimerRunning: (value: boolean) => void;
  startTimer: (duration: number) => void;
  onBack: () => void;
  isFavorite: boolean;
  onFavorite: () => void;
}) {
  const [timerStepIndex, setTimerStepIndex] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const toggleStepComplete = (index: number) => {
    setCompletedSteps((current) => current.includes(index) ? current.filter((stepIndex) => stepIndex !== index) : [...current, index]);
  };
  const launchTimer = (duration: number, index: number) => {
    setTimerStepIndex(index);
    startTimer(duration);
  };
  return (
    <section className="px-5 py-5 sm:px-8 lg:px-10 lg:py-9">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#5c584f] transition hover:text-[#bf3f32]"><ArrowLeft size={17} /> 레시피로 돌아가기</button>
          <button onClick={onFavorite} className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white transition active:scale-95" aria-label="즐겨찾기"><Heart size={16} fill={isFavorite ? "#bf3f32" : "none"} className={isFavorite ? "text-[#bf3f32]" : ""} /></button>
        </div>

        <div className="mt-6 max-w-3xl">
          <div className="bg-[#171714] px-5 py-5 text-[#f8f5ef] shadow-[7px_8px_0_#d9d1c3] sm:px-7">
            <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] font-bold tracking-[0.16em] text-white/60">#{recipe.id.toUpperCase().slice(0, 6)} · {recipe.method.toUpperCase()} · {recipe.steps.length} STEPS</p><h2 className="mt-4 font-serif text-4xl tracking-[-0.04em] sm:text-5xl">{recipe.name}</h2><p className="mt-2 text-sm text-white/65">{recipe.koreanName} · {recipe.glass} · {recipe.garnish}</p></div><div className="shrink-0 text-right"><span className="rounded-full border border-white/25 px-2 py-1 font-mono text-[10px] font-bold text-white/80">{recipe.time}</span><span className="mt-4 ml-auto block ledger-barcode-light" aria-label="레시피 식별 바코드" /></div></div>
            <p className="mt-5 border-l-2 border-[#bf3f32] pl-3 text-sm leading-6 text-white/80">{recipe.description}</p>
          </div>

          <div className="mt-9"><IngredientBlock recipe={recipe} batch={batch} setBatch={setBatch} /></div>

          <div className="mt-9">
            <div className="flex items-end justify-between border-b border-black/15 pb-3"><div><p className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#8b867c]">MAKE / FULL VIEW</p><h3 className="mt-1 font-serif text-2xl">제조 순서 전체</h3></div><span className="font-mono text-[10px] font-bold text-[#777268]">{completedSteps.length} / {recipe.steps.length} CHECKED</span></div>
            <p className="mt-3 text-xs leading-5 text-[#777268]">다음 버튼 없이, 필요한 순서와 타이머를 한 화면에서 계속 확인하세요.</p>
            <div className="mt-4 border-t border-black/15">
              {recipe.steps.map((step, index) => {
                const isComplete = completedSteps.includes(index);
                const isTimerFocused = timerStepIndex === index;
                return <article key={step.title} className={`grid grid-cols-[42px_minmax(0,1fr)_36px] gap-3 border-b border-black/15 py-5 transition ${isComplete ? "opacity-55" : ""}`}>
                  <span className={`grid h-9 w-9 place-items-center rounded-full font-mono text-sm font-bold ${isComplete ? "bg-[#171714] text-white" : "bg-[#eee7db] text-[#bf3f32]"}`}>{isComplete ? <Check size={16} /> : String(index + 1).padStart(2, "0")}</span>
                  <div><h4 className="text-base font-bold leading-5">{step.title}</h4><p className="mt-1.5 text-sm leading-6 text-[#625e55]">{step.detail}</p>{step.timer && <div className="mt-3 flex flex-wrap items-center gap-2"><button onClick={() => isTimerFocused && timerSeconds ? setTimerRunning(!timerRunning) : launchTimer(step.timer!, index)} className="flex items-center gap-2 rounded-full border border-black/15 bg-white px-3 py-1.5 text-xs font-bold transition active:scale-95"><TimerReset size={14} className="text-[#bf3f32]" />{isTimerFocused && timerSeconds ? `${formatTime(timerSeconds)} · ${timerRunning ? "일시정지" : "계속"}` : `${step.timer}초 타이머 시작`}</button>{isTimerFocused && timerSeconds > 0 && <button onClick={() => { setTimerRunning(false); setTimerStepIndex(null); }} className="text-xs font-bold text-[#777268]">초기화</button>}</div>}</div>
                  <button onClick={() => toggleStepComplete(index)} className={`grid h-9 w-9 place-items-center rounded-full border transition active:scale-95 ${isComplete ? "border-[#bf3f32] bg-[#bf3f32] text-white" : "border-black/15 bg-white text-[#8a847a]"}`} aria-label={`${step.title} 완료 표시`}><Check size={16} /></button>
                </article>;
              })}
            </div>
            <button onClick={() => toast.success("제조 완료", { description: `${recipe.name}을(를) 서빙하세요.` })} className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-[#bf3f32] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#a93429] active:scale-[.98]"><Check size={16} /> 전체 제조 완료</button>
          </div>

          <div className="mt-8 border-l-2 border-black/15 pl-4"><div className="flex items-center gap-2 text-[#bf3f32]"><Droplets size={16} /><p className="font-mono text-[10px] font-bold tracking-[0.16em]">BAR NOTE</p></div><p className="mt-2 text-sm leading-6 text-[#625e55]">얼음은 맛의 절반입니다. 흐린 얼음은 쓰지 마세요.</p></div>
        </div>
      </div>
    </section>
  );
}

function IngredientBlock({ recipe, batch, setBatch }: { recipe: Recipe; batch: number; setBatch: (value: number) => void }) {
  return <section className="border-y border-black/15 py-5"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#8b867c]">BUILD / {batch} SERVE{batch > 1 ? "S" : ""}</p><h3 className="mt-1 font-serif text-2xl">재료와 계량</h3></div><div className="flex items-center rounded-sm border border-black/10 bg-white"><button onClick={() => setBatch(Math.max(1, batch - 1))} className="grid h-8 w-8 place-items-center transition hover:bg-[#eee9df]" aria-label="잔 수 줄이기"><Minus size={14} /></button><span className="w-8 text-center font-mono text-xs font-bold">{batch}x</span><button onClick={() => setBatch(Math.min(3, batch + 1))} className="grid h-8 w-8 place-items-center transition hover:bg-[#eee9df]" aria-label="잔 수 늘리기"><Plus size={14} /></button></div></div><div className="mt-5 divide-y divide-black/10">{recipe.ingredients.map((ingredient) => <div key={ingredient.item} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-bold text-[#22211d]">{ingredient.item}</p>{ingredient.note && <p className="mt-0.5 text-[11px] text-[#817b71]">{ingredient.note}</p>}</div><p className="shrink-0 font-mono text-lg font-bold tabular-nums">{Number.isInteger(ingredient.amount * batch) ? ingredient.amount * batch : (ingredient.amount * batch).toFixed(1)} <span className="text-[11px] text-[#79746a]">{ingredient.unit}</span></p></div>)}</div></section>;
}
