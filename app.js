const assetVersion = "20260812-fixed-bowl-position-9";

const rugs = {
  "floor-rug": {
    name: "러그 1",
    image: "assets/props/floor-rug.png",
  },
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
  "floor-rug-07": {
    name: "러그 7",
    image: "assets/props/floor-rug-07.png",
  },
  "floor-rug-08": {
    name: "러그 8",
    image: "assets/props/floor-rug-08.png",
  },
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
    unlocked: false,
  },
  "full-moon": {
    name: "풀문 싱잉볼",
    image: "assets/bowls/full-moon.png",
    unlocked: false,
  },
  "antique-jambati": {
    name: "앤틱 잠바티",
    image: "assets/bowls/antique-jambati.png",
    unlocked: false,
  },
};

const frames = Array.from({ length: 9 }, (_, index) => {
  const frame = String(index + 1).padStart(2, "0");
  return `assets/cat-hit/hit_${frame}.png?v=${assetVersion}`;
});

const state = {
  selectedBowl: localStorage.getItem("selectedBowl") || "hand-hammered",
  selectedBackground: localStorage.getItem("selectedBackground") || "day",
  selectedRug: localStorage.getItem("selectedRug") || "floor-rug",
  showClock: localStorage.getItem("showClock") ?? localStorage.getItem("showRoomProps") ?? "true",
  showRug: localStorage.getItem("showRug") ?? localStorage.getItem("showRoomProps") ?? "true",
  records: JSON.parse(localStorage.getItem("ringRecords") || "[]"),
  animating: false,
};

if (!bowls[state.selectedBowl]?.unlocked) {
  state.selectedBowl = "hand-hammered";
  localStorage.setItem("selectedBowl", state.selectedBowl);
}

if (!rugs[state.selectedRug]) {
  state.selectedRug = "floor-rug";
  localStorage.setItem("selectedRug", state.selectedRug);
}

if (state.selectedBackground === "room-window") {
  state.selectedBackground = "day";
  localStorage.setItem("selectedBackground", state.selectedBackground);
}

const screens = document.querySelectorAll(".screen");
const catFrame = document.querySelector("#catFrame");
const ringButton = document.querySelector("#ringButton");
const homeScene = document.querySelector("#homeScene");
const todayCount = document.querySelector("#todayCount");
const recordToday = document.querySelector("#recordToday");
const recordTotal = document.querySelector("#recordTotal");
const streakCount = document.querySelector("#streakCount");
const recordList = document.querySelector("#recordList");
const weekChart = document.querySelector("#weekChart");
const clockToggle = document.querySelector("#clockToggle");
const rugToggle = document.querySelector("#rugToggle");
const floorRug = document.querySelector("#floorRug");
const selectedBowlOverlay = document.querySelector("#selectedBowlOverlay");
const bowlAudio = new Audio(`${bowls[state.selectedBowl].sound}?v=${assetVersion}`);
bowlAudio.preload = "auto";

frames.forEach((src) => {
  const image = new Image();
  image.src = src;
});

Object.values(rugs).forEach((rug) => {
  const image = new Image();
  image.src = `${rug.image}?v=${assetVersion}`;
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

function renderRecords() {
  const today = recordsForDate(todayKey()).length;
  todayCount.textContent = today;
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
  homeScene.classList.toggle("scene-day", state.selectedBackground === "day");
  homeScene.classList.toggle("scene-night", state.selectedBackground === "night");
  homeScene.classList.toggle("scene-sea", state.selectedBackground === "sea");
  homeScene.classList.toggle("scene-forest", state.selectedBackground === "forest");

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
    selectedBowlOverlay.src = `${bowls[state.selectedBowl].image}?v=${assetVersion}`;
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
  if (floorRug) {
    floorRug.src = `${rugs[state.selectedRug].image}?v=${assetVersion}`;
  }

  document.querySelectorAll(".clock-prop").forEach((prop) => {
    prop.classList.toggle("hidden", state.showClock !== "true");
  });

  document.querySelectorAll(".rug-prop").forEach((prop) => {
    prop.classList.toggle("hidden", state.showRug !== "true");
  });

  if (clockToggle) {
    clockToggle.checked = state.showClock === "true";
  }

  if (rugToggle) {
    rugToggle.checked = state.showRug === "true";
  }

  document.querySelectorAll(".rug-card").forEach((card) => {
    const selected = card.dataset.rug === state.selectedRug;
    card.classList.toggle("selected", selected);
    card.setAttribute("aria-pressed", String(selected));
  });
}

function render() {
  renderRecords();
  renderBackground();
  renderBowlSelection();
  renderRoomProps();
}

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.view));
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
    state.selectedRug = button.dataset.rug;
    state.showRug = "true";
    localStorage.setItem("selectedRug", state.selectedRug);
    localStorage.setItem("showRug", state.showRug);
    render();
  });
});

clockToggle?.addEventListener("change", () => {
  state.showClock = String(clockToggle.checked);
  localStorage.setItem("showClock", state.showClock);
  render();
});

rugToggle?.addEventListener("change", () => {
  state.showRug = String(rugToggle.checked);
  localStorage.setItem("showRug", state.showRug);
  render();
});

ringButton.addEventListener("click", playHitAnimation);

render();
