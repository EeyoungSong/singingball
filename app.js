const assetVersion = "20260820-clock-3col-no-check";

const backgroundIds = [
  "room-custom-01",
  "room-custom-02",
  "room-custom-03",
  "sea",
  "forest",
];

const rugs = {
  "floor-rug-02": {
    name: "러그 2",
    image: "assets/props/floor-rug-02.png",
  },
  "floor-rug-03": {
    name: "러그 3",
    image: "assets/props/floor-rug-03.png",
  },
  "floor-rug-04": {
    name: "러그 4",
    image: "assets/props/floor-rug-04.png",
  },
  "floor-rug-05": {
    name: "러그 5",
    image: "assets/props/floor-rug-05.png",
  },
  "floor-rug-06": {
    name: "러그 6",
    image: "assets/props/floor-rug-06.png",
  },
  "floor-rug-08": {
    name: "러그 8",
    image: "assets/props/floor-rug-08.png",
  },
};

const clocks = {
  "wall-clock": { name: "시계 1", image: "assets/props/wall-clock.png" },
  "clock-01": { name: "시계 2", image: "assets/props/clocks/clock_01.png" },
  "clock-02": { name: "시계 3", image: "assets/props/clocks/clock_02.png" },
  "clock-03": { name: "시계 4", image: "assets/props/clocks/clock_03.png" },
  "clock-04": { name: "시계 5", image: "assets/props/clocks/clock_04.png" },
  "clock-05": { name: "시계 6", image: "assets/props/clocks/clock_05.png" },
  "clock-06": { name: "시계 7", image: "assets/props/clocks/clock_06.png" },
};

const radios = {
  "radio-01": { name: "라디오 1", image: "assets/props/radios/radio_01.png", placedImage: "assets/props/radios/placed/radio_02.png" },
  "radio-02": { name: "라디오 2", image: "assets/props/radios/radio_02.png", placedImage: "assets/props/radios/placed/radio_01.png" },
  "radio-03": { name: "라디오 3", image: "assets/props/radios/radio_03.png", placedImage: "assets/props/radios/placed/radio_03.png" },
  "radio-04": { name: "라디오 4", image: "assets/props/radios/radio_04.png", placedImage: "assets/props/radios/placed/radio_04.png" },
  "radio-05": { name: "라디오 5", image: "assets/props/radios/radio_05.png", placedImage: "assets/props/radios/placed/radio_05.png" },
  "radio-06": { name: "라디오 6", image: "assets/props/radios/radio_06.png", placedImage: "assets/props/radios/placed/radio_06.png" },
  "radio-07": { name: "라디오 7", image: "assets/props/radios/radio_07.png", placedImage: "assets/props/radios/placed/radio_07.png" },
  "radio-08": { name: "라디오 8", image: "assets/props/radios/radio_08.png", placedImage: "assets/props/radios/placed/radio_08.png" },
  "radio-09": { name: "라디오 9", image: "assets/props/radios/radio_09.png", placedImage: "assets/props/radios/placed/radio_09.png" },
  "radio-10": { name: "라디오 10", image: "assets/props/radios/radio_10.png", placedImage: "assets/props/radios/placed/radio_10.png" },
};

const bowls = {
  "hand-hammered": {
    name: "티베탄 싱잉볼",
    image: "assets/bowls/hand-hammered-tibetan.png",
    sound: "assets/sounds/bowl-hand-hammered.mp3",
    unlocked: true,
  },
  "polished-brass": {
    name: "브라스 싱잉볼",
    image: "assets/bowls/polished-brass.png",
    sound: "assets/sounds/bowl-polished-brass.mp3",
    unlocked: true,
  },
  "etched-tibetan": {
    name: "에칭 싱잉볼",
    image: "assets/bowls/etched-tibetan.png",
    sound: "assets/sounds/bowl-etched-tibetan.mp3",
    unlocked: true,
  },
  "crystal-quartz": {
    name: "크리스탈 싱잉볼",
    image: "assets/bowls/crystal-quartz.png",
    sound: "assets/sounds/bowl-crystal-quartz.mp3",
    unlocked: true,
  },
  "full-moon": {
    name: "풀문 싱잉볼",
    image: "assets/bowls/full-moon.png",
    sound: "assets/sounds/bowl-full-moon.mp3",
    unlocked: true,
  },
  "antique-jambati": {
    name: "앤틱 잠바티",
    image: "assets/bowls/antique-jambati.png",
    sound: "assets/sounds/bowl-antique-jambati.mp3",
    unlocked: true,
  },
};

const frames = Array.from({ length: 9 }, (_, index) => {
  const frame = String(index + 1).padStart(2, "0");
  return `assets/cat-hit/hit_${frame}.png?v=${assetVersion}`;
});

const standFrame = `assets/cat-walk/stand.png?v=${assetVersion}`;
const walkFrames = [
  `assets/cat-walk/walk-a.png?v=${assetVersion}`,
  `assets/cat-walk/walk-b.png?v=${assetVersion}`,
];
const state = {
  selectedBowl: localStorage.getItem("selectedBowl") || "hand-hammered",
  selectedBackground: localStorage.getItem("selectedBackground") || "room-custom-01",
  selectedRug: localStorage.getItem("selectedRug") ?? "floor-rug-02",
  selectedRadio: localStorage.getItem("selectedRadio") ?? "radio-01",
  selectedClock: localStorage.getItem("selectedClock") ?? "wall-clock",
  selectedDecorTab: localStorage.getItem("selectedDecorTab") || "rugs",
  showClock: localStorage.getItem("showClock") ?? localStorage.getItem("showRoomProps") ?? "true",
  showRug: localStorage.getItem("showRug") ?? localStorage.getItem("showRoomProps") ?? "true",
  showRadio: localStorage.getItem("showRadio") ?? "true",
  records: JSON.parse(localStorage.getItem("ringRecords") || "[]"),
  animating: false,
  walking: false,
  catOffsetX: 0,
  catOffsetY: 0,
  draggingCat: false,
  catDragStartX: 0,
  catDragStartY: 0,
  catDragStartOffsetX: 0,
  catDragStartOffsetY: 0,
  catDragged: false,
  suppressNextHit: false,
};

if (!bowls[state.selectedBowl]?.unlocked) {
  state.selectedBowl = "hand-hammered";
  localStorage.setItem("selectedBowl", state.selectedBowl);
}

if (state.selectedRug && !rugs[state.selectedRug]) {
  state.selectedRug = "floor-rug-02";
  localStorage.setItem("selectedRug", state.selectedRug);
}

if (state.selectedRadio && !radios[state.selectedRadio]) {
  state.selectedRadio = "radio-01";
  localStorage.setItem("selectedRadio", state.selectedRadio);
}

if (state.selectedClock && !clocks[state.selectedClock]) {
  state.selectedClock = "wall-clock";
  localStorage.setItem("selectedClock", state.selectedClock);
}

if (state.selectedBackground === "room-window" || !backgroundIds.includes(state.selectedBackground)) {
  state.selectedBackground = "room-custom-01";
  localStorage.setItem("selectedBackground", state.selectedBackground);
}

if (!["rugs", "clock", "radios", "backgrounds"].includes(state.selectedDecorTab)) {
  state.selectedDecorTab = "rugs";
  localStorage.setItem("selectedDecorTab", state.selectedDecorTab);
}

const screens = document.querySelectorAll(".screen");
const catFrame = document.querySelector("#catFrame");
const ringButton = document.querySelector("#ringButton");
const catStage = document.querySelector(".cat-stage");
const homeScene = document.querySelector("#homeScene");
const recordToday = document.querySelector("#recordToday");
const recordTotal = document.querySelector("#recordTotal");
const streakCount = document.querySelector("#streakCount");
const recordList = document.querySelector("#recordList");
const weekChart = document.querySelector("#weekChart");
const clockProp = document.querySelector("#clockProp");
const floorRug = document.querySelector("#floorRug");
const radioProp = document.querySelector("#radioProp");
const selectedBowlOverlay = document.querySelector("#selectedBowlOverlay");
const decorTabs = document.querySelectorAll("[data-decor-tab]");
const decorSections = document.querySelectorAll("[data-decor-section]");
const bowlAudio = new Audio(`${bowls[state.selectedBowl].sound}?v=${assetVersion}`);
bowlAudio.preload = "auto";
const walkTimers = [];
const hitTestCanvas = document.createElement("canvas");
const hitTestContext = hitTestCanvas.getContext("2d", { willReadFrequently: true });

frames.forEach((src) => {
  const image = new Image();
  image.src = src;
});

[standFrame, ...walkFrames].forEach((src) => {
  const image = new Image();
  image.src = src;
});

Object.values(clocks).forEach((clock) => {
  const image = new Image();
  image.src = `${clock.image}?v=${assetVersion}`;
});

Object.values(rugs).forEach((rug) => {
  const image = new Image();
  image.src = `${rug.image}?v=${assetVersion}`;
});

Object.values(radios).forEach((radio) => {
  const image = new Image();
  image.src = `${radio.image}?v=${assetVersion}`;

  if (radio.placedImage) {
    const placedImage = new Image();
    placedImage.src = `${radio.placedImage}?v=${assetVersion}`;
  }
});

Object.values(bowls).forEach((bowl) => {
  if (!bowl.image) return;
  const image = new Image();
  image.src = `${bowl.image}?v=${assetVersion}`;
});

function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("hidden", screen.dataset.screen !== name);
  });
  render();
}

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function recordsForDate(key) {
  return state.records.filter((record) => todayKey(new Date(record.createdAt)) === key);
}

function getWeekCounts() {
  const result = [];
  const now = new Date();

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - index);
    result.push(recordsForDate(todayKey(date)).length);
  }

  return result;
}

function saveRecords() {
  localStorage.setItem("ringRecords", JSON.stringify(state.records));
}

function addRecord() {
  const id = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  state.records.unshift({
    id,
    createdAt: new Date().toISOString(),
    bowlId: state.selectedBowl,
    backgroundId: state.selectedBackground,
    animationType: "hit",
  });

  saveRecords();
}

function playBowlSound() {
  bowlAudio.pause();
  bowlAudio.src = `${bowls[state.selectedBowl].sound}?v=${assetVersion}`;
  bowlAudio.currentTime = 0;
  bowlAudio.play().catch(() => {
    // Browsers can reject playback until the first trusted tap; the tap handler retries naturally.
  });
}

function playHitAnimation() {
  if (state.animating) {
    return;
  }

  state.animating = true;
  state.walking = false;
  clearWalkTimers();
  ringButton.classList.remove("walking");
  ringButton.classList.remove("ringing");
  void ringButton.offsetWidth;
  ringButton.classList.add("ringing");
  playBowlSound();
  addRecord();
  render();

  frames.forEach((src, index) => {
    window.setTimeout(() => {
      catFrame.src = src;
    }, index * 50);
  });

  window.setTimeout(() => {
    catFrame.src = frames[0];
    ringButton.classList.remove("ringing");
    state.animating = false;
  }, frames.length * 50 + 180);
}

function playWalkAnimation() {
  if (state.animating || !state.walking) {
    return;
  }

  catFrame.src = standFrame;

  const startTimer = window.setTimeout(() => {
    let frameIndex = 0;
    catFrame.src = walkFrames[frameIndex];

    const loopTimer = window.setInterval(() => {
      if (!state.walking || state.animating) {
        window.clearInterval(loopTimer);
        return;
      }

      frameIndex = (frameIndex + 1) % walkFrames.length;
      catFrame.src = walkFrames[frameIndex];
    }, 120);

    walkTimers.push(loopTimer);
  }, 70);

  walkTimers.push(startTimer);
}

function clearWalkTimers() {
  while (walkTimers.length > 0) {
    window.clearTimeout(walkTimers.pop());
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function imageHasOpaquePixelAt(image, event) {
  if (!image || !hitTestContext || !image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
    return false;
  }

  const rect = image.getBoundingClientRect();
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const rectRatio = rect.width / rect.height;
  let contentWidth = rect.width;
  let contentHeight = rect.height;
  let contentLeft = rect.left;
  let contentTop = rect.top;

  if (rectRatio > imageRatio) {
    contentWidth = rect.height * imageRatio;
    contentLeft = rect.left + (rect.width - contentWidth) / 2;
  } else if (rectRatio < imageRatio) {
    contentHeight = rect.width / imageRatio;
    contentTop = rect.top + (rect.height - contentHeight) / 2;
  }

  const localX = event.clientX - contentLeft;
  const localY = event.clientY - contentTop;

  if (localX < 0 || localY < 0 || localX > contentWidth || localY > contentHeight) {
    return false;
  }

  const pixelX = Math.floor((localX / contentWidth) * image.naturalWidth);
  const pixelY = Math.floor((localY / contentHeight) * image.naturalHeight);

  hitTestCanvas.width = image.naturalWidth;
  hitTestCanvas.height = image.naturalHeight;
  hitTestContext.clearRect(0, 0, hitTestCanvas.width, hitTestCanvas.height);
  hitTestContext.drawImage(image, 0, 0);

  return hitTestContext.getImageData(pixelX, pixelY, 1, 1).data[3] > 24;
}

function isCatBodyHit(event) {
  return imageHasOpaquePixelAt(catFrame, event) || imageHasOpaquePixelAt(selectedBowlOverlay, event);
}

function getCatOffsetLimits() {
  const sceneRect = homeScene.getBoundingClientRect();
  const stageRect = catStage.getBoundingClientRect();
  const catWidth = ringButton.offsetWidth || 248;
  const catHeight = ringButton.offsetHeight || 248;
  const currentCenterY = stageRect.top - sceneRect.top + stageRect.height / 2;
  const defaultCenterY = currentCenterY - state.catOffsetY;
  const minCenterY = 150;
  const maxCenterY = sceneRect.height - 154;

  return {
    maxX: Math.max(0, (sceneRect.width - catWidth * 0.65) / 2),
    minY: minCenterY - defaultCenterY,
    maxY: maxCenterY - defaultCenterY - catHeight * 0.12,
  };
}

function getCatOffsetForEvent(event) {
  const sceneRect = homeScene.getBoundingClientRect();
  const limits = getCatOffsetLimits();
  const clickX = event.clientX - sceneRect.left;
  const clickY = event.clientY - sceneRect.top;
  const stageRect = catStage.getBoundingClientRect();
  const currentCenterY = stageRect.top - sceneRect.top + stageRect.height / 2;
  const defaultCenterY = currentCenterY - state.catOffsetY;

  return {
    x: clamp(clickX - sceneRect.width / 2, -limits.maxX, limits.maxX),
    y: clamp(clickY - defaultCenterY, limits.minY, limits.maxY),
  };
}

function getCatDragOffset(event) {
  const limits = getCatOffsetLimits();
  const nextOffsetX = state.catDragStartOffsetX + event.clientX - state.catDragStartX;
  const nextOffsetY = state.catDragStartOffsetY + event.clientY - state.catDragStartY;

  return {
    x: clamp(nextOffsetX, -limits.maxX, limits.maxX),
    y: clamp(nextOffsetY, limits.minY, limits.maxY),
  };
}

function walkCatTo(event, options = {}) {
  if (state.animating || state.walking || state.suppressNextHit || !homeScene || !catStage) {
    return;
  }

  if (!options.allowControlTarget && event.target.closest("button, input, label, nav")) {
    return;
  }

  const targetOffset = getCatOffsetForEvent(event);
  const distanceX = targetOffset.x - state.catOffsetX;
  const distanceY = targetOffset.y - state.catOffsetY;
  const distance = Math.hypot(distanceX, distanceY);

  if (distance < 8) {
    return;
  }

  clearWalkTimers();
  state.walking = true;
  ringButton.classList.add("walking");
  ringButton.style.setProperty("--cat-direction", distanceX > 0 ? "-1" : "1");

  const duration = clamp(distance * 8, 480, 1600);
  catStage.style.setProperty("--cat-walk-duration", `${duration}ms`);
  catStage.style.setProperty("--cat-offset-x", `${targetOffset.x}px`);
  catStage.style.setProperty("--cat-offset-y", `${targetOffset.y}px`);
  state.catOffsetX = targetOffset.x;
  state.catOffsetY = targetOffset.y;
  playWalkAnimation();

  const finishTimer = window.setTimeout(() => {
    if (!state.animating) {
      catFrame.src = standFrame;
    }
    const sitTimer = window.setTimeout(() => {
      if (!state.animating) {
        catFrame.src = frames[0];
      }
      clearWalkTimers();
    }, 70);
    walkTimers.push(sitTimer);
    ringButton.classList.remove("walking");
    state.walking = false;
  }, duration + 120);
  walkTimers.push(finishTimer);
}

function startCatDrag(event) {
  if (state.animating || !catStage || !homeScene) {
    return;
  }

  if (!isCatBodyHit(event)) {
    return;
  }

  state.draggingCat = true;
  state.catDragged = false;
  state.catDragStartX = event.clientX;
  state.catDragStartY = event.clientY;
  state.catDragStartOffsetX = state.catOffsetX;
  state.catDragStartOffsetY = state.catOffsetY;
  clearWalkTimers();
  state.walking = false;
  ringButton.classList.remove("walking");
  catFrame.src = frames[0];
  catStage.style.setProperty("--cat-walk-duration", "0ms");
  ringButton.setPointerCapture?.(event.pointerId);
}

function dragCat(event) {
  if (!state.draggingCat || state.animating || !catStage) {
    return;
  }

  const nextOffset = getCatDragOffset(event);
  const moved = Math.hypot(event.clientX - state.catDragStartX, event.clientY - state.catDragStartY);

  if (moved > 6) {
    state.catDragged = true;
    state.suppressNextHit = true;
  }

  if (state.catDragged) {
    state.catOffsetX = nextOffset.x;
    state.catOffsetY = nextOffset.y;
    catStage.style.setProperty("--cat-offset-x", `${nextOffset.x}px`);
    catStage.style.setProperty("--cat-offset-y", `${nextOffset.y}px`);
  }
}

function finishCatDrag(event) {
  if (!state.draggingCat) {
    return;
  }

  state.draggingCat = false;
  ringButton.releasePointerCapture?.(event.pointerId);

  if (!state.catDragged) {
    return;
  }

  window.setTimeout(() => {
    state.suppressNextHit = false;
  }, 0);
}

function renderRecords() {
  const today = recordsForDate(todayKey()).length;
  recordToday.textContent = today;
  recordTotal.textContent = state.records.length;
  streakCount.textContent = state.records.length > 0 ? "1" : "0";

  recordList.innerHTML = "";
  const recent = state.records.slice(0, 5);

  if (recent.length === 0) {
    const empty = document.createElement("li");
    empty.innerHTML = "<b></b><span><strong>아직 기록이 없어요</strong><small>싱잉볼을 한 번 울려보세요.</small></span><small>-</small>";
    recordList.append(empty);
  } else {
    recent.forEach((record) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <b></b>
        <span>
          <strong>${bowls[record.bowlId]?.name || "싱잉볼"}</strong>
          <small>${record.animationType === "hit" ? "따뜻한 울림" : "부드러운 울림"}</small>
        </span>
        <small>${formatTime(record.createdAt)}</small>
      `;
      recordList.append(item);
    });
  }

  const weekCounts = getWeekCounts();
  const max = Math.max(...weekCounts, 1);
  weekChart.innerHTML = "";
  weekCounts.forEach((count) => {
    const bar = document.createElement("span");
    bar.style.height = `${Math.max(10, (count / max) * 120)}px`;
    bar.title = `${count}회`;
    weekChart.append(bar);
  });
}

function renderBackground() {
  backgroundIds.forEach((backgroundId) => {
    homeScene.classList.toggle(`scene-${backgroundId}`, state.selectedBackground === backgroundId);
  });

  document.querySelectorAll(".background-card").forEach((card) => {
    const selected = card.dataset.background === state.selectedBackground;
    card.classList.toggle("selected", selected);
    const mark = card.querySelector("b");

    if (selected && !mark) {
      const check = document.createElement("b");
      check.textContent = "✓";
      card.append(check);
    }

    if (!selected && mark) {
      mark.remove();
    }
  });
}

function renderBowlSelection() {
  if (selectedBowlOverlay) {
    const selectedBowl = bowls[state.selectedBowl];
    selectedBowlOverlay.src = `${selectedBowl.image}?v=${assetVersion}`;
  }

  document.querySelectorAll(".bowl-row").forEach((row) => {
    const bowl = bowls[row.dataset.bowl];
    const selected = row.dataset.bowl === state.selectedBowl;
    row.classList.toggle("selected", selected);

    const badge = row.querySelector("em");
    if (selected && !badge && bowl?.unlocked) {
      const selectedBadge = document.createElement("em");
      selectedBadge.textContent = "사용 중";
      row.querySelector("span")?.insertBefore(selectedBadge, row.querySelector("small"));
    }

    if (!selected && badge) {
      badge.remove();
    }

    const mark = row.querySelector("b");
    if (mark && bowl?.unlocked) {
      mark.textContent = selected ? "✓" : "";
    }
  });
}

function renderRoomProps() {
  if (clockProp && clocks[state.selectedClock]) {
    clockProp.src = `${clocks[state.selectedClock].image}?v=${assetVersion}`;
  }

  if (floorRug && rugs[state.selectedRug]) {
    floorRug.src = `${rugs[state.selectedRug].image}?v=${assetVersion}`;
  }

  if (radioProp && radios[state.selectedRadio]) {
    const selectedRadio = radios[state.selectedRadio];
    radioProp.src = `${selectedRadio.placedImage || selectedRadio.image}?v=${assetVersion}`;
  }

  document.querySelectorAll(".clock-prop").forEach((prop) => {
    prop.classList.toggle("hidden", state.showClock !== "true" || !clocks[state.selectedClock]);
  });

  document.querySelectorAll(".rug-prop").forEach((prop) => {
    prop.classList.toggle("hidden", state.showRug !== "true" || !rugs[state.selectedRug]);
  });

  document.querySelectorAll(".radio-prop").forEach((prop) => {
    prop.classList.toggle("hidden", state.showRadio !== "true" || !radios[state.selectedRadio]);
  });

  document.querySelectorAll(".clock-card").forEach((card) => {
    const selected = state.showClock === "true" && card.dataset.clock === state.selectedClock;
    card.classList.toggle("selected", selected);
    card.setAttribute("aria-pressed", String(selected));

    const clock = clocks[card.dataset.clock];
    const image = card.querySelector("img");
    if (image && clock) {
      image.src = `${clock.image}?v=${assetVersion}`;
    }
  });

  document.querySelectorAll(".rug-card").forEach((card) => {
    const selected = state.showRug === "true" && card.dataset.rug === state.selectedRug;
    card.classList.toggle("selected", selected);
    card.setAttribute("aria-pressed", String(selected));
  });

  document.querySelectorAll(".radio-card").forEach((card) => {
    const radio = radios[card.dataset.radio];
    const selected = state.showRadio === "true" && card.dataset.radio === state.selectedRadio;
    card.classList.toggle("selected", selected);
    card.setAttribute("aria-pressed", String(selected));

    const image = card.querySelector("img");
    if (image && radio) {
      image.src = `${radio.placedImage || radio.image}?v=${assetVersion}`;
    }
  });
}

function renderDecorTabs() {
  decorTabs.forEach((tab) => {
    const selected = tab.dataset.decorTab === state.selectedDecorTab;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });

  decorSections.forEach((section) => {
    section.classList.toggle("hidden", section.dataset.decorSection !== state.selectedDecorTab);
  });
}

function render() {
  renderRecords();
  renderBackground();
  renderBowlSelection();
  renderRoomProps();
  renderDecorTabs();
}

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.view));
});

decorTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.selectedDecorTab = tab.dataset.decorTab;
    localStorage.setItem("selectedDecorTab", state.selectedDecorTab);
    renderDecorTabs();
  });
});

document.querySelectorAll("[data-background]").forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedBackground = button.dataset.background;
    localStorage.setItem("selectedBackground", state.selectedBackground);
    render();
  });
});

document.querySelectorAll("[data-bowl]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!bowls[button.dataset.bowl]?.unlocked) {
      return;
    }
    state.selectedBowl = button.dataset.bowl;
    localStorage.setItem("selectedBowl", state.selectedBowl);
    render();
  });
});

document.querySelectorAll("[data-rug]").forEach((button) => {
  button.addEventListener("click", () => {
    const selected = state.showRug === "true" && state.selectedRug === button.dataset.rug;
    state.selectedRug = selected ? "" : button.dataset.rug;
    state.showRug = selected ? "false" : "true";
    localStorage.setItem("selectedRug", state.selectedRug);
    localStorage.setItem("showRug", state.showRug);
    render();
  });
});

document.querySelectorAll("[data-clock]").forEach((button) => {
  button.addEventListener("click", () => {
    const selected = state.showClock === "true" && state.selectedClock === button.dataset.clock;
    state.selectedClock = selected ? "" : button.dataset.clock;
    state.showClock = selected ? "false" : "true";
    localStorage.setItem("selectedClock", state.selectedClock);
    localStorage.setItem("showClock", state.showClock);
    render();
  });
});

document.querySelectorAll("[data-radio]").forEach((button) => {
  button.addEventListener("click", () => {
    const selected = state.showRadio === "true" && state.selectedRadio === button.dataset.radio;
    state.selectedRadio = selected ? "" : button.dataset.radio;
    state.showRadio = selected ? "false" : "true";
    localStorage.setItem("selectedRadio", state.selectedRadio);
    localStorage.setItem("showRadio", state.showRadio);
    render();
  });
});

ringButton.addEventListener("pointerdown", startCatDrag);
ringButton.addEventListener("pointermove", dragCat);
ringButton.addEventListener("pointerup", finishCatDrag);
ringButton.addEventListener("pointercancel", finishCatDrag);

ringButton.addEventListener("click", (event) => {
  if (state.suppressNextHit) {
    event.preventDefault();
    state.suppressNextHit = false;
    return;
  }

  if (!isCatBodyHit(event)) {
    walkCatTo(event, { allowControlTarget: true });
    return;
  }

  event.stopPropagation();
  playHitAnimation();
});

homeScene.addEventListener("click", walkCatTo);

render();
