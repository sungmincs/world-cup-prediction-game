export const KOREA_ROUNDS = [
  "조별탈락",
  "32강",
  "16강",
  "8강",
  "4강",
  "결승",
  "우승",
] as const;

export type KoreaRound = (typeof KOREA_ROUNDS)[number];

export interface KoreaMatch {
  id: string;
  label: string;
  stage: "group" | "knockout";
  date: string;
  opponent: string;
}

export const KOREA_MATCHES: KoreaMatch[] = [
  {
    id: "kor_czr",
    label: "[조별] 대한민국 vs 체코",
    stage: "group",
    date: "2026-06-11",
    opponent: "체코",
  },
  {
    id: "kor_mex",
    label: "[조별] 대한민국 vs 멕시코",
    stage: "group",
    date: "2026-06-18",
    opponent: "멕시코",
  },
  {
    id: "kor_rsa",
    label: "[조별] 대한민국 vs 남아프리카",
    stage: "group",
    date: "2026-06-24",
    opponent: "남아프리카",
  },
  {
    id: "kor_r32",
    label: "[32강] 대한민국 (32강)",
    stage: "knockout",
    date: "2026-06-28",
    opponent: "TBD",
  },
  {
    id: "kor_r16",
    label: "[16강] 대한민국 (16강)",
    stage: "knockout",
    date: "2026-07-04",
    opponent: "TBD",
  },
  {
    id: "kor_qf",
    label: "[8강] 대한민국 (8강)",
    stage: "knockout",
    date: "2026-07-09",
    opponent: "TBD",
  },
  {
    id: "kor_sf",
    label: "[4강] 대한민국 (4강)",
    stage: "knockout",
    date: "2026-07-14",
    opponent: "TBD",
  },
  {
    id: "kor_final",
    label: "[결승/3위] 대한민국 (결승)",
    stage: "knockout",
    date: "2026-07-19",
    opponent: "TBD",
  },
];

export const WC2026_TEAMS = [
  // AFC
  "대한민국",
  "일본",
  "호주",
  "이란",
  "사우디아라비아",
  "카타르",
  "요르단",
  "우즈베키스탄",
  "이라크",
  // UEFA
  "프랑스",
  "스페인",
  "독일",
  "잉글랜드",
  "포르투갈",
  "네덜란드",
  "벨기에",
  "크로아티아",
  "오스트리아",
  "스위스",
  "터키",
  "노르웨이",
  "스코틀랜드",
  "스웨덴",
  "보스니아헤르체고비나",
  "체코",
  // CONMEBOL
  "아르헨티나",
  "브라질",
  "콜롬비아",
  "우루과이",
  "에콰도르",
  "파라과이",
  // CONCACAF
  "미국",
  "캐나다",
  "멕시코",
  "파나마",
  "아이티",
  "퀴라소",
  // CAF
  "모로코",
  "알제리",
  "이집트",
  "세네갈",
  "코트디부아르",
  "남아프리카",
  "튀니지",
  "카보베르데",
  "DR콩고",
  "카메룬",
  // OFC
  "뉴질랜드",
];
