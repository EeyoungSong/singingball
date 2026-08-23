export const assetVersion = "20260820-react-refactor";

const assetUrls = import.meta.glob(
  [
    "../assets/backgrounds/*",
    "../assets/bowls/*",
    "../assets/cat-hit/*",
    "../assets/cat-walk/stand.png",
    "../assets/cat-walk/walk-a.png",
    "../assets/cat-walk/walk-b.png",
    "../assets/props/clocks/*",
    "../assets/props/floor-rug-02.png",
    "../assets/props/floor-rug-03.png",
    "../assets/props/floor-rug-04.png",
    "../assets/props/floor-rug-05.png",
    "../assets/props/floor-rug-06.png",
    "../assets/props/floor-rug-08.png",
    "../assets/props/radios/placed/*",
    "../assets/props/wall-clock.png",
    "../assets/sounds/*",
    "../assets/ui/*",
  ],
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

export const backgroundIds = ["lake", "mountain", "city-view", "sea", "forest"];

export const backgrounds = [
  { id: "lake", name: "호수", previewClass: "lake-preview" },
  { id: "mountain", name: "산", previewClass: "mountain-preview" },
  { id: "city-view", name: "시티뷰", previewClass: "city-view-preview" },
  { id: "sea", name: "바다", previewClass: "sea-preview" },
  { id: "forest", name: "숲", previewClass: "forest-preview" },
];

export const backgroundSounds = {
  lake: { name: "호수", sound: "assets/sounds/ambience-lake.mp3" },
  mountain: { name: "산", sound: "assets/sounds/ambience-forest.mp3" },
  "city-view": { name: "시티뷰", sound: "assets/sounds/ambience-city.mp3" },
  sea: { name: "바다", sound: "assets/sounds/ambience-sea.mp3" },
  forest: { name: "숲", sound: "assets/sounds/ambience-forest.mp3" },
};

export const rugs = {
  "floor-rug-02": { name: "러그 2", image: "assets/props/floor-rug-02.png" },
  "floor-rug-03": { name: "러그 3", image: "assets/props/floor-rug-03.png" },
  "floor-rug-04": { name: "러그 4", image: "assets/props/floor-rug-04.png" },
  "floor-rug-05": { name: "러그 5", image: "assets/props/floor-rug-05.png" },
  "floor-rug-06": { name: "러그 6", image: "assets/props/floor-rug-06.png" },
  "floor-rug-08": { name: "러그 8", image: "assets/props/floor-rug-08.png" },
};

export const clocks = {
  "wall-clock": { name: "시계 1", image: "assets/props/wall-clock.png" },
  "clock-01": { name: "시계 2", image: "assets/props/clocks/clock_01.png" },
  "clock-02": { name: "시계 3", image: "assets/props/clocks/clock_02.png" },
  "clock-03": { name: "시계 4", image: "assets/props/clocks/clock_03.png" },
  "clock-04": { name: "시계 5", image: "assets/props/clocks/clock_04.png" },
  "clock-05": { name: "시계 6", image: "assets/props/clocks/clock_05.png" },
  "clock-06": { name: "시계 7", image: "assets/props/clocks/clock_06.png" },
};

export const radios = {
  "radio-01": { name: "라디오 1", image: "assets/props/radios/placed/radio_02.png" },
  "radio-02": { name: "라디오 2", image: "assets/props/radios/placed/radio_01.png" },
  "radio-03": { name: "라디오 3", image: "assets/props/radios/placed/radio_03.png" },
  "radio-04": { name: "라디오 4", image: "assets/props/radios/placed/radio_04.png" },
  "radio-05": { name: "라디오 5", image: "assets/props/radios/placed/radio_05.png" },
  "radio-06": { name: "라디오 6", image: "assets/props/radios/placed/radio_06.png" },
  "radio-07": { name: "라디오 7", image: "assets/props/radios/placed/radio_07.png" },
  "radio-08": { name: "라디오 8", image: "assets/props/radios/placed/radio_08.png" },
  "radio-09": { name: "라디오 9", image: "assets/props/radios/placed/radio_09.png" },
  "radio-10": { name: "라디오 10", image: "assets/props/radios/placed/radio_10.png" },
};

export const bowls = {
  "hand-hammered": {
    name: "티베탄 싱잉볼",
    image: "assets/bowls/hand-hammered-tibetan.png",
    sound: "assets/sounds/bowl-hand-hammered.mp3",
    description: "맑고 긴 울림",
    unlocked: true,
  },
  "polished-brass": {
    name: "브라스 싱잉볼",
    image: "assets/bowls/polished-brass.png",
    sound: "assets/sounds/bowl-polished-brass.mp3",
    description: "부드럽고 따뜻한 울림",
    unlocked: true,
  },
  "etched-tibetan": {
    name: "에칭 싱잉볼",
    image: "assets/bowls/etched-tibetan.png",
    sound: "assets/sounds/bowl-etched-tibetan.mp3",
    description: "깊고 안정적인 울림",
    unlocked: true,
  },
  "crystal-quartz": {
    name: "크리스탈 싱잉볼",
    image: "assets/bowls/crystal-quartz.png",
    sound: "assets/sounds/bowl-crystal-quartz.mp3",
    description: "맑고 투명한 울림",
    unlocked: true,
  },
  "full-moon": {
    name: "풀문 싱잉볼",
    image: "assets/bowls/full-moon.png",
    sound: "assets/sounds/bowl-full-moon.mp3",
    description: "넓고 부드러운 울림",
    unlocked: true,
  },
  "antique-jambati": {
    name: "앤틱 잠바티",
    image: "assets/bowls/antique-jambati.png",
    sound: "assets/sounds/bowl-antique-jambati.mp3",
    description: "묵직하고 깊은 울림",
    unlocked: true,
  },
};

export const decorTabs = [
  { id: "rugs", label: "러그" },
  { id: "clock", label: "시계" },
  { id: "radios", label: "라디오" },
  { id: "backgrounds", label: "배경" },
];

export const hitFrames = Array.from({ length: 9 }, (_, index) => {
  const frame = String(index + 1).padStart(2, "0");
  return `assets/cat-hit/hit_${frame}.png`;
});

export const standFrame = "assets/cat-walk/stand.png";
export const walkFrames = ["assets/cat-walk/walk-a.png", "assets/cat-walk/walk-b.png"];

export function versioned(path) {
  return assetUrls[`../${path}`] || `${path}?v=${assetVersion}`;
}
