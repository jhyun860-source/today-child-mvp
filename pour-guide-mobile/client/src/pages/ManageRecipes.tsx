/**
 * Pour Guide management: a practical edit desk for updating live bar recipes, steps and reference photos.
 */
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Archive, ArrowLeft, Check, ChevronRight, ImagePlus, Loader2, Minus, Plus, Save, Settings2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type DraftIngredient = { amount: number; unit: string; item: string; note: string };
type DraftStep = { title: string; detail: string; timerSeconds: number | null };
type RecipeDraft = {
  id?: number;
  name: string;
  koreanName: string;
  category: string;
  base: string;
  tasteTags: string[];
  method: string;
  serviceTimeSeconds: number;
  description: string;
  glass: string;
  garnish: string;
  imageUrl: string | null;
  garnishImageUrl: string | null;
  ingredients: DraftIngredient[];
  steps: DraftStep[];
};

type ManagedRecipe = {
  id: number;
  name: string;
  koreanName: string | null;
  category: string;
  base: string;
  tasteTags: string[];
  method: string;
  serviceTimeSeconds: number;
  description: string | null;
  glass: string;
  garnish: string;
  imageUrl: string | null;
  garnishImageUrl: string | null;
  status: "active" | "archived";
  ingredients: Array<{ amount: number; unit: string; item: string; note: string | null }>;
  steps: Array<{ title: string; detail: string; timerSeconds: number | null }>;
};

const blankDraft = (): RecipeDraft => ({
  name: "",
  koreanName: "",
  category: "Classics",
  base: "",
  tasteTags: [],
  method: "Build",
  serviceTimeSeconds: 120,
  description: "",
  glass: "",
  garnish: "",
  imageUrl: null,
  garnishImageUrl: null,
  ingredients: [{ amount: 30, unit: "ml", item: "", note: "" }],
  steps: [{ title: "", detail: "", timerSeconds: null }],
});

function toDraft(recipe: ManagedRecipe): RecipeDraft {
  return {
    id: recipe.id,
    name: recipe.name,
    koreanName: recipe.koreanName || "",
    category: recipe.category,
    base: recipe.base,
    tasteTags: recipe.tasteTags,
    method: recipe.method,
    serviceTimeSeconds: recipe.serviceTimeSeconds,
    description: recipe.description || "",
    glass: recipe.glass,
    garnish: recipe.garnish,
    imageUrl: recipe.imageUrl,
    garnishImageUrl: recipe.garnishImageUrl,
    ingredients: recipe.ingredients.map(item => ({ amount: item.amount, unit: item.unit, item: item.item, note: item.note || "" })),
    steps: recipe.steps.map(step => ({ title: step.title, detail: step.detail, timerSeconds: step.timerSeconds })),
  };
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("사진 파일을 읽지 못했습니다."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export default function ManageRecipes() {
  return <DashboardLayout><ManageRecipesContent /></DashboardLayout>;
}

function ManageRecipesContent() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const recipesQuery = trpc.recipes.list.useQuery();
  const [selectedId, setSelectedId] = useState<number | "new">("new");
  const [draft, setDraft] = useState<RecipeDraft>(blankDraft);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingGarnishPhoto, setPendingGarnishPhoto] = useState<File | null>(null);
  const [garnishPreviewUrl, setGarnishPreviewUrl] = useState<string | null>(null);
  const selectedRecipe = useMemo(() => recipesQuery.data?.find(recipe => recipe.id === selectedId), [recipesQuery.data, selectedId]);

  useEffect(() => {
    if (selectedId === "new") {
      setDraft(blankDraft());
      setPendingPhoto(null);
      setPreviewUrl(null);
      setPendingGarnishPhoto(null);
      setGarnishPreviewUrl(null);
      return;
    }
    if (selectedRecipe) {
      setDraft(toDraft(selectedRecipe));
      setPendingPhoto(null);
      setPreviewUrl(null);
      setPendingGarnishPhoto(null);
      setGarnishPreviewUrl(null);
    }
  }, [selectedId, selectedRecipe]);

  const saveMutation = trpc.recipes.save.useMutation();
  const uploadMutation = trpc.recipes.uploadImage.useMutation();
  const archiveMutation = trpc.recipes.archive.useMutation();
  const isSaving = saveMutation.isPending || uploadMutation.isPending;

  const updateDraft = <K extends keyof RecipeDraft>(key: K, value: RecipeDraft[K]) => setDraft(current => ({ ...current, [key]: value }));
  const updateIngredient = (index: number, key: keyof DraftIngredient, value: string | number) => setDraft(current => ({ ...current, ingredients: current.ingredients.map((ingredient, ingredientIndex) => ingredientIndex === index ? { ...ingredient, [key]: value } : ingredient) }));
  const updateStep = (index: number, key: keyof DraftStep, value: string | number | null) => setDraft(current => ({ ...current, steps: current.steps.map((step, stepIndex) => stepIndex === index ? { ...step, [key]: value } : step) }));

  const handlePhoto = async (role: "completion" | "garnish", file: File | undefined) => {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) { toast.error("JPG, PNG, WEBP 사진만 사용할 수 있습니다."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("사진은 5MB 이하로 올려 주세요."); return; }
    if (role === "completion") {
      setPendingPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPendingGarnishPhoto(file);
      setGarnishPreviewUrl(URL.createObjectURL(file));
    }
  };

  const saveRecipe = async () => {
    if (!draft.name.trim() || !draft.base.trim() || !draft.glass.trim() || !draft.garnish.trim()) { toast.error("메뉴명, 베이스, 잔, 가니시를 입력해 주세요."); return; }
    if (draft.ingredients.some(item => !item.item.trim()) || draft.steps.some(step => !step.title.trim() || !step.detail.trim())) { toast.error("모든 재료와 제조 단계를 입력해 주세요."); return; }
    try {
      const saved = await saveMutation.mutateAsync({
        id: draft.id,
        name: draft.name.trim(), koreanName: draft.koreanName.trim() || null, category: draft.category,
        base: draft.base.trim(), tasteTags: draft.tasteTags, method: draft.method,
        serviceTimeSeconds: Math.max(1, draft.serviceTimeSeconds), description: draft.description.trim() || null,
        glass: draft.glass.trim(), garnish: draft.garnish.trim(),
        ingredients: draft.ingredients.map(item => ({ amount: Number(item.amount), unit: item.unit.trim(), item: item.item.trim(), note: item.note.trim() || null })),
        steps: draft.steps.map(step => ({ title: step.title.trim(), detail: step.detail.trim(), timerSeconds: step.timerSeconds || null })),
      });
      let finalRecipe = saved;
      if (pendingPhoto) {
        const base64 = await fileToBase64(pendingPhoto);
        finalRecipe = await uploadMutation.mutateAsync({ recipeId: saved.id, role: "completion", fileName: pendingPhoto.name, mimeType: pendingPhoto.type as "image/jpeg" | "image/png" | "image/webp", base64 });
      }
      if (pendingGarnishPhoto) {
        const base64 = await fileToBase64(pendingGarnishPhoto);
        finalRecipe = await uploadMutation.mutateAsync({ recipeId: saved.id, role: "garnish", fileName: pendingGarnishPhoto.name, mimeType: pendingGarnishPhoto.type as "image/jpeg" | "image/png" | "image/webp", base64 });
      }
      await utils.recipes.list.invalidate();
      setSelectedId(finalRecipe.id);
      setDraft(toDraft(finalRecipe));
      setPendingPhoto(null);
      setPreviewUrl(null);
      setPendingGarnishPhoto(null);
      setGarnishPreviewUrl(null);
      toast.success("레시피를 저장했습니다.", { description: "바텐더용 레시피 화면에 즉시 반영됩니다." });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장 중 문제가 발생했습니다.");
    }
  };

  const archiveCurrent = async () => {
    if (!draft.id || !confirm(`“${draft.name}” 메뉴를 판매 중단 처리할까요?`)) return;
    await archiveMutation.mutateAsync({ id: draft.id });
    await utils.recipes.list.invalidate();
    setSelectedId("new");
    toast.success("메뉴를 판매 중단 처리했습니다.");
  };

  if (user && user.role !== "admin") return <section className="mx-auto max-w-xl py-16 text-center"><Settings2 className="mx-auto text-[#bf3f32]" /><h1 className="mt-4 font-serif text-3xl">관리 권한이 필요합니다.</h1><p className="mt-3 text-sm text-[#706b61]">매니저 계정으로 로그인한 뒤 레시피를 편집할 수 있습니다.</p></section>;

  return <div className="mx-auto max-w-6xl pb-12"><header className="flex flex-wrap items-end justify-between gap-4 border-b border-black/15 pb-5"><div><p className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#bf3f32]">MANAGEMENT / RECIPES</p><h1 className="mt-2 font-serif text-4xl tracking-[-0.04em]">메뉴와 레시피 관리</h1><p className="mt-2 text-sm text-[#706b61]">수정한 레시피는 바텐더 화면에 바로 반영됩니다.</p></div><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm font-bold text-[#5d584f]"><ArrowLeft size={16} /> 바텐더 화면</button></header>
    <div className="mt-7 grid gap-7 lg:grid-cols-[285px_minmax(0,1fr)]"><aside className="border border-black/15 bg-[#f3eee5]"><div className="flex items-center justify-between border-b border-black/15 p-4"><span className="font-mono text-[10px] font-bold tracking-[0.14em]">RECIPE LIST</span><button onClick={() => setSelectedId("new")} className="grid h-8 w-8 place-items-center rounded-full bg-[#bf3f32] text-white" aria-label="새 메뉴 추가"><Plus size={16} /></button></div><div className="max-h-[60dvh] overflow-y-auto p-2">{recipesQuery.isLoading ? <div className="p-5 text-sm text-[#777268]"><Loader2 className="inline animate-spin" size={15} /> 불러오는 중</div> : <><button onClick={() => setSelectedId("new")} className={`w-full border-l-2 px-3 py-3 text-left text-sm font-bold ${selectedId === "new" ? "border-[#bf3f32] bg-white" : "border-transparent"}`}>+ 새 메뉴 만들기</button>{recipesQuery.data?.map(recipe => <button key={recipe.id} onClick={() => setSelectedId(recipe.id)} className={`w-full border-t border-black/10 px-3 py-3 text-left ${selectedId === recipe.id ? "bg-white" : "hover:bg-white/60"}`}><span className="block font-serif text-lg">{recipe.name}</span><span className="mt-1 block text-[11px] text-[#777268]">{recipe.koreanName || recipe.base} · {recipe.status === "active" ? "판매 중" : "중단"}</span></button>)}</>}</div></aside>
      <section className="min-w-0 border border-black/15 bg-white"><div className="flex items-center justify-between border-b border-black/15 px-5 py-4"><div><p className="font-mono text-[10px] font-bold tracking-[0.14em] text-[#8b867c]">{draft.id ? `EDIT / #${draft.id}` : "NEW MENU"}</p><h2 className="mt-1 font-serif text-2xl">{draft.id ? draft.name || "메뉴 수정" : "새 메뉴"}</h2></div>{draft.id && <button onClick={archiveCurrent} className="flex items-center gap-1 text-xs font-bold text-[#a83930]"><Archive size={15} /> 판매 중단</button>}</div>
        <div className="space-y-8 p-5 sm:p-7"><div className="grid gap-4 sm:grid-cols-2"><Field label="메뉴명"><input value={draft.name} onChange={event => updateDraft("name", event.target.value)} placeholder="예: Negroni" /></Field><Field label="한글 메뉴명"><input value={draft.koreanName} onChange={event => updateDraft("koreanName", event.target.value)} placeholder="예: 네그로니" /></Field><Field label="카테고리"><select value={draft.category} onChange={event => updateDraft("category", event.target.value)}><option value="Classics">클래식</option><option value="Signatures">시그니처</option><option value="No/Low">논/로우</option></select></Field><Field label="베이스"><input value={draft.base} onChange={event => updateDraft("base", event.target.value)} placeholder="예: Gin" /></Field><Field label="제조 방식"><select value={draft.method} onChange={event => updateDraft("method", event.target.value)}><option value="Build">Build</option><option value="Shake">Shake</option><option value="Stir">Stir</option><option value="Blend">Blend</option></select></Field><Field label="예상 제조 시간 (초)"><input type="number" min="1" value={draft.serviceTimeSeconds} onChange={event => updateDraft("serviceTimeSeconds", Number(event.target.value))} /></Field><Field label="잔"><input value={draft.glass} onChange={event => updateDraft("glass", event.target.value)} placeholder="예: Rocks glass" /></Field><Field label="가니시"><input value={draft.garnish} onChange={event => updateDraft("garnish", event.target.value)} placeholder="예: Orange peel" /></Field></div><Field label="맛 태그 (쉼표로 구분)"><input value={draft.tasteTags.join(", ")} onChange={event => updateDraft("tasteTags", event.target.value.split(",").map(tag => tag.trim()).filter(Boolean))} placeholder="예: Bitter, Spirit-forward" /></Field><Field label="바텐더 메모"><textarea rows={3} value={draft.description} onChange={event => updateDraft("description", event.target.value)} placeholder="제조할 때 참고할 핵심 설명" /></Field>
          <section className="border-t border-black/15 pt-6"><p className="font-mono text-[10px] font-bold tracking-[0.14em] text-[#bf3f32]">REFERENCE PHOTOS</p><p className="mt-2 text-sm leading-6 text-[#706b61]">완성 형태와 가니시 디테일을 분리해 올리면 제조 화면에서 용도에 맞게 보여 줍니다. JPG, PNG, WEBP · 각 5MB 이하.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><PhotoEditor title="완성 사진" description="잔, 얼음, 전체 서빙 형태" imageUrl={previewUrl || draft.imageUrl} pendingFile={pendingPhoto} onChange={file => handlePhoto("completion", file)} /><PhotoEditor title="가니시 사진" description="가니시 방향, 위치, 크기 참고" imageUrl={garnishPreviewUrl || draft.garnishImageUrl} pendingFile={pendingGarnishPhoto} onChange={file => handlePhoto("garnish", file)} /></div></section>
          <EditorList title="재료와 계량" addLabel="재료 추가" onAdd={() => updateDraft("ingredients", [...draft.ingredients, { amount: 30, unit: "ml", item: "", note: "" }])}>{draft.ingredients.map((ingredient, index) => <div key={index} className="grid grid-cols-[72px_72px_minmax(0,1fr)_32px] gap-2"><input type="number" min="0.01" value={ingredient.amount} onChange={event => updateIngredient(index, "amount", Number(event.target.value))} /><input value={ingredient.unit} onChange={event => updateIngredient(index, "unit", event.target.value)} placeholder="ml" /><input value={ingredient.item} onChange={event => updateIngredient(index, "item", event.target.value)} placeholder="재료명" /><button onClick={() => updateDraft("ingredients", draft.ingredients.filter((_, itemIndex) => itemIndex !== index))} className="grid place-items-center text-[#a83930]" aria-label="재료 삭제"><Minus size={16} /></button><input className="col-span-3" value={ingredient.note} onChange={event => updateIngredient(index, "note", event.target.value)} placeholder="메모 (선택)" /></div>)}</EditorList>
          <EditorList title="제조 순서" addLabel="단계 추가" onAdd={() => updateDraft("steps", [...draft.steps, { title: "", detail: "", timerSeconds: null }])}>{draft.steps.map((step, index) => <div key={index} className="grid grid-cols-[32px_minmax(0,1fr)_32px] gap-2 border-t border-black/10 pt-3"><span className="pt-2 font-mono text-xs font-bold text-[#bf3f32]">{String(index + 1).padStart(2, "0")}</span><div className="space-y-2"><input value={step.title} onChange={event => updateStep(index, "title", event.target.value)} placeholder="단계 제목" /><textarea rows={2} value={step.detail} onChange={event => updateStep(index, "detail", event.target.value)} placeholder="제조 설명" /><input type="number" min="1" value={step.timerSeconds ?? ""} onChange={event => updateStep(index, "timerSeconds", event.target.value ? Number(event.target.value) : null)} placeholder="타이머 초 (선택)" /></div><button onClick={() => updateDraft("steps", draft.steps.filter((_, stepIndex) => stepIndex !== index))} className="grid h-9 place-items-center text-[#a83930]" aria-label="단계 삭제"><Minus size={16} /></button></div>)}</EditorList>
          <div className="flex flex-col-reverse gap-3 border-t border-black/15 pt-5 sm:flex-row sm:justify-end"><button onClick={() => setSelectedId("new")} className="px-4 py-3 text-sm font-bold text-[#5d584f]">새 메뉴로 초기화</button><button onClick={saveRecipe} disabled={isSaving} className="flex items-center justify-center gap-2 rounded-sm bg-[#bf3f32] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><Save size={16} />{isSaving ? "저장 중..." : "레시피 저장"}</button></div>
        </div></section></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#5d584f]">{label}</span><div className="[&_input]:h-10 [&_input]:w-full [&_input]:border [&_input]:border-black/15 [&_input]:bg-[#fdfcf9] [&_input]:px-3 [&_select]:h-10 [&_select]:w-full [&_select]:border [&_select]:border-black/15 [&_select]:bg-[#fdfcf9] [&_select]:px-3 [&_textarea]:w-full [&_textarea]:border [&_textarea]:border-black/15 [&_textarea]:bg-[#fdfcf9] [&_textarea]:p-3">{children}</div></label>; }
function PhotoEditor({ title, description, imageUrl, pendingFile, onChange }: { title: string; description: string; imageUrl: string | null; pendingFile: File | null; onChange: (file: File | undefined) => void }) { return <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 border border-black/15 bg-[#f5f1e9] p-3"><div className="aspect-[4/5] overflow-hidden bg-[#e6ded1]">{imageUrl ? <img src={imageUrl} alt={`${title} 미리보기`} className="h-full w-full object-contain" /> : <div className="grid h-full place-items-center text-center text-[10px] text-[#817b71]"><ImagePlus size={17} /><span className="mt-1">사진 없음</span></div>}</div><div className="flex min-w-0 flex-col justify-center"><p className="font-serif text-lg">{title}</p><p className="mt-1 text-xs leading-5 text-[#706b61]">{description}</p><label className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-sm bg-[#171714] px-3 py-2 text-xs font-bold text-white"><Upload size={14} /> 사진 선택<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event => onChange(event.target.files?.[0])} /></label>{pendingFile && <p className="mt-2 truncate text-[11px] font-bold text-[#bf3f32]">선택됨: {pendingFile.name}</p>}</div></div>; }
function EditorList({ title, addLabel, onAdd, children }: { title: string; addLabel: string; onAdd: () => void; children: React.ReactNode }) { return <section className="border-t border-black/15 pt-6"><div className="flex items-center justify-between"><h3 className="font-serif text-2xl">{title}</h3><button onClick={onAdd} className="flex items-center gap-1 text-xs font-bold text-[#bf3f32]"><Plus size={15} /> {addLabel}</button></div><div className="mt-4 space-y-3">{children}</div></section>; }
