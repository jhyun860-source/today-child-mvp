import type { RecipeWritePayload } from "./db";

export const defaultBarRecipes: RecipeWritePayload[] = [
  {
    name: "Negroni", koreanName: "네그로니", category: "Classics", base: "Gin", tasteTags: ["Bitter", "Orange", "Spirit-forward"], method: "Build", serviceTimeSeconds: 120,
    description: "진, 비터, 베르무트를 같은 비율로 빌드합니다.", glass: "Rocks glass", garnish: "Orange peel",
    ingredients: [{ amount: 30, unit: "ml", item: "Gin" }, { amount: 30, unit: "ml", item: "Campari" }, { amount: 30, unit: "ml", item: "Sweet vermouth" }],
    steps: [{ title: "재료 계량", detail: "차가운 락 글라스에 모든 재료를 계량합니다." }, { title: "스티어", detail: "큰 얼음과 함께 충분히 차갑게 스티어합니다.", timerSeconds: 20 }, { title: "가니시", detail: "오렌지 필의 향을 내고 잔 위에 올립니다." }],
  },
  {
    name: "Gimlet", koreanName: "김렛", category: "Classics", base: "Gin", tasteTags: ["Citrus", "Tart", "Crisp"], method: "Shake", serviceTimeSeconds: 180,
    description: "진과 라임의 균형을 차갑고 선명하게 만듭니다.", glass: "Small coupe", garnish: "Lime wheel",
    ingredients: [{ amount: 60, unit: "ml", item: "Gin" }, { amount: 25, unit: "ml", item: "Fresh lime juice" }, { amount: 20, unit: "ml", item: "Simple syrup" }],
    steps: [{ title: "재료 계량", detail: "셰이커에 진, 라임 주스, 시럽을 계량합니다." }, { title: "셰이크", detail: "얼음을 채워 강하게 셰이크합니다.", timerSeconds: 12 }, { title: "더블 스트레인", detail: "차가운 쿠페 글라스에 이중 스트레인합니다." }, { title: "가니시", detail: "라임 휠을 잔 가장자리에 올립니다." }],
  },
  {
    name: "Old Fashioned", koreanName: "올드 패션드", category: "Classics", base: "Whisky", tasteTags: ["Rich", "Bitter", "Spirit-forward"], method: "Build", serviceTimeSeconds: 180,
    description: "위스키의 질감을 살린 클래식 빌드 칵테일입니다.", glass: "Rocks glass", garnish: "Orange peel",
    ingredients: [{ amount: 60, unit: "ml", item: "Bourbon" }, { amount: 7.5, unit: "ml", item: "Demerara syrup" }, { amount: 2, unit: "dash", item: "Aromatic bitters" }],
    steps: [{ title: "재료 계량", detail: "믹싱 글라스에 모든 재료를 계량합니다." }, { title: "스티어", detail: "큰 얼음과 함께 희석될 때까지 스티어합니다.", timerSeconds: 25 }, { title: "서빙", detail: "큰 얼음이 담긴 락 글라스에 스트레인합니다." }, { title: "가니시", detail: "오렌지 필의 오일을 뿌려 마무리합니다." }],
  },
  {
    name: "Vermouth Tonic", koreanName: "베르무트 토닉", category: "No/Low", base: "Vermouth", tasteTags: ["Herbal", "Light", "Bubbly"], method: "Build", serviceTimeSeconds: 120,
    description: "가볍고 허브 향이 선명한 저도수 하이볼입니다.", glass: "Highball glass", garnish: "Lemon peel",
    ingredients: [{ amount: 75, unit: "ml", item: "Dry vermouth" }, { amount: 120, unit: "ml", item: "Tonic water" }],
    steps: [{ title: "얼음 채우기", detail: "차가운 하이볼 글라스에 얼음을 가득 채웁니다." }, { title: "빌드", detail: "드라이 베르무트를 먼저 붓고 토닉으로 채웁니다." }, { title: "가니시", detail: "레몬 필을 비틀어 향을 내고 올립니다." }],
  },
];
