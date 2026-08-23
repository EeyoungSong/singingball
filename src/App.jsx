import { useEffect, useMemo, useRef, useState } from "react";
import {
  backgroundIds,
  backgrounds,
  backgroundSounds,
  bowls,
  clocks,
  decorTabs,
  hitFrames,
  radios,
  rugs,
  standFrame,
  versioned,
  walkFrames,
} from "./data.js";

const persistedKeys = new Set([
  "selectedBowl",
  "selectedBackground",
  "selectedRug",
  "selectedClock",
  "selectedRadio",
  "selectedDecorTab",
  "showClock",
  "showRug",
  "showRadio",
  "ambienceEnabled",
  "ambienceVolume",
  "bowlVolume",
]);

function readStored(key, fallback) {
  return localStorage.getItem(key) ?? fallback;
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeVolume(value, fallback) {
  const volume = Number(value);
  return String(Number.isFinite(volume) ? clamp(volume, 0, 1) : fallback);
}

function getRecordId() {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeBackgroundId(value) {
  const aliases = {
    "room-custom-01": "lake",
    "room-custom-02": "mountain",
    "room-custom-03": "city-view",
  };

  const backgroundId = aliases[value] || value;
  return backgroundIds.includes(backgroundId) ? backgroundId : "lake";
}

function getInitialState() {
  const selectedBowl = bowls[readStored("selectedBowl", "hand-hammered")]?.unlocked
    ? readStored("selectedBowl", "hand-hammered")
    : "hand-hammered";
  const selectedBackground = normalizeBackgroundId(readStored("selectedBackground", "lake"));
  const selectedRug = readStored("selectedRug", "floor-rug-02");
  const selectedClock = readStored("selectedClock", "wall-clock");
  const selectedRadio = readStored("selectedRadio", "radio-01");
  const selectedDecorTab = ["rugs", "clock", "radios", "backgrounds"].includes(readStored("selectedDecorTab", "rugs"))
    ? readStored("selectedDecorTab", "rugs")
    : "rugs";

  return {
    selectedBowl,
    selectedBackground,
    selectedRug: selectedRug && rugs[selectedRug] ? selectedRug : "floor-rug-02",
    selectedClock: selectedClock && clocks[selectedClock] ? selectedClock : "wall-clock",
    selectedRadio: selectedRadio && radios[selectedRadio] ? selectedRadio : "radio-01",
    selectedDecorTab,
    showClock: readStored("showClock", localStorage.getItem("showRoomProps") ?? "true"),
    showRug: readStored("showRug", localStorage.getItem("showRoomProps") ?? "true"),
    showRadio: readStored("showRadio", "true"),
    ambienceEnabled: readStored("ambienceEnabled", "false"),
    ambienceVolume: normalizeVolume(readStored("ambienceVolume", "0.42"), 0.42),
    bowlVolume: normalizeVolume(readStored("bowlVolume", "1"), 1),
    records: JSON.parse(localStorage.getItem("ringRecords") || "[]"),
  };
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [state, setState] = useState(getInitialState);
  const [catFrame, setCatFrame] = useState(versioned(hitFrames[0]));
  const [catOffset, setCatOffset] = useState({ x: 0, y: 0 });
  const [catDirection, setCatDirection] = useState(1);
  const [walkDuration, setWalkDuration] = useState(900);
  const [animating, setAnimating] = useState(false);
  const [walking, setWalking] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [draggingCat, setDraggingCat] = useState(false);
  const [catDragged, setCatDragged] = useState(false);
  const [suppressNextHit, setSuppressNextHit] = useState(false);

  const audioRef = useRef(null);
  const ambienceAudioRef = useRef(null);
  const catImageRef = useRef(null);
  const bowlImageRef = useRef(null);
  const catStageRef = useRef(null);
  const ringButtonRef = useRef(null);
  const homeSceneRef = useRef(null);
  const hitTestCanvasRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const timersRef = useRef([]);
  const latestRef = useRef({ state, catOffset, animating, walking, suppressNextHit });

  const selectedBowl = bowls[state.selectedBowl] || bowls["hand-hammered"];
  const selectedClock = clocks[state.selectedClock];
  const selectedRug = rugs[state.selectedRug];
  const selectedRadio = radios[state.selectedRadio];
  const selectedAmbience = backgroundSounds[state.selectedBackground];

  useEffect(() => {
    latestRef.current = { state, catOffset, animating, walking, suppressNextHit };
  }, [state, catOffset, animating, walking, suppressNextHit]);

  useEffect(() => {
    audioRef.current = new Audio(versioned(selectedBowl.sound));
    audioRef.current.volume = Number(state.bowlVolume);
    audioRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Number(state.bowlVolume);
    }
  }, [state.bowlVolume]);

  useEffect(() => {
    if (!ambienceAudioRef.current) {
      ambienceAudioRef.current = new Audio();
      ambienceAudioRef.current.loop = true;
      ambienceAudioRef.current.preload = "auto";
    }

    const audio = ambienceAudioRef.current;
    audio.volume = Number(state.ambienceVolume);

    if (state.ambienceEnabled !== "true" || !selectedAmbience) {
      audio.pause();
      return;
    }

    const soundUrl = versioned(selectedAmbience.sound);
    if (audio.dataset.soundUrl !== soundUrl) {
      audio.pause();
      audio.src = soundUrl;
      audio.dataset.soundUrl = soundUrl;
      audio.currentTime = 0;
    }

    audio.play().catch(() => {});
  }, [state.ambienceEnabled, state.selectedBackground, state.ambienceVolume, selectedAmbience]);

  useEffect(
    () => () => {
      ambienceAudioRef.current?.pause();
    },
    [],
  );

  useEffect(() => {
    [standFrame, ...walkFrames, ...hitFrames].forEach((path) => {
      const image = new Image();
      image.src = versioned(path);
    });

    [...Object.values(clocks), ...Object.values(rugs), ...Object.values(radios), ...Object.values(bowls)].forEach((item) => {
      if (item.image) {
        const image = new Image();
        image.src = versioned(item.image);
      }

      if (item.placedImage) {
        const image = new Image();
        image.src = versioned(item.placedImage);
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("ringRecords", JSON.stringify(state.records));
  }, [state.records]);

  useEffect(() => () => clearTimers(), []);

  const recordsForDate = (key) => state.records.filter((record) => todayKey(new Date(record.createdAt)) === key);

  const weekCounts = useMemo(() => {
    const result = [];
    const now = new Date();

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - index);
      result.push(recordsForDate(todayKey(date)).length);
    }

    return result;
  }, [state.records]);

  const clearTimers = () => {
    while (timersRef.current.length > 0) {
      window.clearTimeout(timersRef.current.pop());
    }
  };

  const updateState = (patch) => {
    setState((current) => ({ ...current, ...patch }));

    Object.entries(patch).forEach(([key, value]) => {
      if (persistedKeys.has(key)) {
        localStorage.setItem(key, value);
      }
    });
  };

  const addRecord = () => {
    setState((current) => ({
      ...current,
      records: [
        {
          id: getRecordId(),
          createdAt: new Date().toISOString(),
          bowlId: current.selectedBowl,
          backgroundId: current.selectedBackground,
          animationType: "hit",
        },
        ...current.records,
      ],
    }));
  };

  const playBowlSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.src = versioned(selectedBowl.sound);
    audio.volume = Number(state.bowlVolume);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const playHitAnimation = () => {
    if (latestRef.current.animating) return;

    setAnimating(true);
    setWalking(false);
    clearTimers();
    setRinging(false);

    window.requestAnimationFrame(() => {
      setRinging(true);
      playBowlSound();
      addRecord();
    });

    hitFrames.forEach((path, index) => {
      const timer = window.setTimeout(() => setCatFrame(versioned(path)), index * 50);
      timersRef.current.push(timer);
    });

    const endTimer = window.setTimeout(() => {
      setCatFrame(versioned(hitFrames[0]));
      setRinging(false);
      setAnimating(false);
    }, hitFrames.length * 50 + 180);
    timersRef.current.push(endTimer);
  };

  const getHitTestContext = () => {
    if (!hitTestCanvasRef.current) {
      hitTestCanvasRef.current = document.createElement("canvas");
    }

    return hitTestCanvasRef.current.getContext("2d", { willReadFrequently: true });
  };

  const imageHasOpaquePixelAt = (image, event) => {
    const canvas = hitTestCanvasRef.current || document.createElement("canvas");
    hitTestCanvasRef.current = canvas;
    const context = getHitTestContext();

    if (!image || !context || !image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
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

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    return context.getImageData(pixelX, pixelY, 1, 1).data[3] > 24;
  };

  const isCatBodyHit = (event) =>
    imageHasOpaquePixelAt(catImageRef.current, event) || imageHasOpaquePixelAt(bowlImageRef.current, event);

  const getCatOffsetLimits = () => {
    const sceneRect = homeSceneRef.current.getBoundingClientRect();
    const stageRect = catStageRef.current.getBoundingClientRect();
    const catWidth = ringButtonRef.current.offsetWidth || 248;
    const catHeight = ringButtonRef.current.offsetHeight || 248;
    const currentCenterY = stageRect.top - sceneRect.top + stageRect.height / 2;
    const defaultCenterY = currentCenterY - latestRef.current.catOffset.y;
    const minCenterY = 150;
    const maxCenterY = sceneRect.height - 154;

    return {
      maxX: Math.max(0, (sceneRect.width - catWidth * 0.65) / 2),
      minY: minCenterY - defaultCenterY,
      maxY: maxCenterY - defaultCenterY - catHeight * 0.12,
    };
  };

  const getCatOffsetForEvent = (event) => {
    const sceneRect = homeSceneRef.current.getBoundingClientRect();
    const limits = getCatOffsetLimits();
    const clickX = event.clientX - sceneRect.left;
    const clickY = event.clientY - sceneRect.top;
    const stageRect = catStageRef.current.getBoundingClientRect();
    const currentCenterY = stageRect.top - sceneRect.top + stageRect.height / 2;
    const defaultCenterY = currentCenterY - latestRef.current.catOffset.y;

    return {
      x: clamp(clickX - sceneRect.width / 2, -limits.maxX, limits.maxX),
      y: clamp(clickY - defaultCenterY, limits.minY, limits.maxY),
    };
  };

  const getCatDragOffset = (event) => {
    const limits = getCatOffsetLimits();
    const dragStart = dragStartRef.current;
    const nextOffsetX = dragStart.offsetX + event.clientX - dragStart.x;
    const nextOffsetY = dragStart.offsetY + event.clientY - dragStart.y;

    return {
      x: clamp(nextOffsetX, -limits.maxX, limits.maxX),
      y: clamp(nextOffsetY, limits.minY, limits.maxY),
    };
  };

  const playWalkAnimation = () => {
    if (latestRef.current.animating) return;

    setCatFrame(versioned(standFrame));

    const startTimer = window.setTimeout(() => {
      let frameIndex = 0;
      setCatFrame(versioned(walkFrames[frameIndex]));

      const loopTimer = window.setInterval(() => {
        if (!latestRef.current.walking || latestRef.current.animating) {
          window.clearInterval(loopTimer);
          return;
        }

        frameIndex = (frameIndex + 1) % walkFrames.length;
        setCatFrame(versioned(walkFrames[frameIndex]));
      }, 120);

      timersRef.current.push(loopTimer);
    }, 70);

    timersRef.current.push(startTimer);
  };

  const walkCatTo = (event, options = {}) => {
    if (
      latestRef.current.animating ||
      latestRef.current.walking ||
      latestRef.current.suppressNextHit ||
      !homeSceneRef.current ||
      !catStageRef.current
    ) {
      return;
    }

    if (!options.allowControlTarget && event.target.closest("button, input, label, nav")) {
      return;
    }

    const targetOffset = getCatOffsetForEvent(event);
    const distanceX = targetOffset.x - latestRef.current.catOffset.x;
    const distanceY = targetOffset.y - latestRef.current.catOffset.y;
    const distance = Math.hypot(distanceX, distanceY);

    if (distance < 8) return;

    clearTimers();
    setWalking(true);
    setCatDirection(distanceX > 0 ? -1 : 1);

    const duration = clamp(distance * 8, 480, 1600);
    setWalkDuration(duration);
    setCatOffset(targetOffset);
    playWalkAnimation();

    const finishTimer = window.setTimeout(() => {
      if (!latestRef.current.animating) {
        setCatFrame(versioned(standFrame));
      }

      const sitTimer = window.setTimeout(() => {
        if (!latestRef.current.animating) {
          setCatFrame(versioned(hitFrames[0]));
        }
        clearTimers();
      }, 70);

      timersRef.current.push(sitTimer);
      setWalking(false);
    }, duration + 120);
    timersRef.current.push(finishTimer);
  };

  const startCatDrag = (event) => {
    if (latestRef.current.animating || !catStageRef.current || !homeSceneRef.current) return;
    if (!isCatBodyHit(event)) return;

    setDraggingCat(true);
    setCatDragged(false);
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: latestRef.current.catOffset.x,
      offsetY: latestRef.current.catOffset.y,
    };
    clearTimers();
    setWalking(false);
    setCatFrame(versioned(hitFrames[0]));
    setWalkDuration(0);
    ringButtonRef.current?.setPointerCapture?.(event.pointerId);
  };

  const dragCat = (event) => {
    if (!draggingCat || latestRef.current.animating || !catStageRef.current) return;

    const nextOffset = getCatDragOffset(event);
    const dragStart = dragStartRef.current;
    const moved = Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y);

    if (moved > 6) {
      setCatDragged(true);
      setSuppressNextHit(true);
    }

    if (moved > 6 || catDragged) {
      setCatOffset(nextOffset);
    }
  };

  const finishCatDrag = (event) => {
    if (!draggingCat) return;

    setDraggingCat(false);
    ringButtonRef.current?.releasePointerCapture?.(event.pointerId);

    if (!catDragged) return;

    window.setTimeout(() => setSuppressNextHit(false), 0);
  };

  const handleCatClick = (event) => {
    if (suppressNextHit) {
      event.preventDefault();
      setSuppressNextHit(false);
      return;
    }

    if (!isCatBodyHit(event)) {
      walkCatTo(event, { allowControlTarget: true });
      return;
    }

    event.stopPropagation();
    playHitAnimation();
  };

  const selectBowl = (bowlId) => {
    if (!bowls[bowlId]?.unlocked) return;
    updateState({ selectedBowl: bowlId });
  };

  const selectRug = (rugId) => {
    const selected = state.showRug === "true" && state.selectedRug === rugId;
    updateState({
      selectedRug: selected ? "" : rugId,
      showRug: selected ? "false" : "true",
    });
  };

  const selectClock = (clockId) => {
    const selected = state.showClock === "true" && state.selectedClock === clockId;
    updateState({
      selectedClock: selected ? "" : clockId,
      showClock: selected ? "false" : "true",
    });
  };

  const selectRadio = (radioId) => {
    const selected = state.showRadio === "true" && state.selectedRadio === radioId;
    updateState({
      selectedRadio: selected ? "" : radioId,
      showRadio: selected ? "false" : "true",
    });
  };

  const toggleAmbience = (event) => {
    event.stopPropagation();
    updateState({ ambienceEnabled: state.ambienceEnabled === "true" ? "false" : "true" });
  };

  const todayCount = recordsForDate(todayKey()).length;
  const weekCountsMax = Math.max(...weekCounts, 1);
  const visibleRecords = state.records.slice(0, 5);
  const sceneClass = `scene scene-${state.selectedBackground}`;

  return (
    <main className="app-shell" aria-label="Singing Bowl Cat prototype">
      <section className="phone">
        <div className={`screen ${screen !== "home" && screen !== "settings" ? "hidden" : ""}`} data-screen="home">
          <div className={sceneClass} id="homeScene" ref={homeSceneRef} onClick={walkCatTo}>
            <button
              className={`icon-button ambience-button ${state.ambienceEnabled === "true" ? "active" : ""}`}
              type="button"
              onClick={toggleAmbience}
              aria-label={`${selectedAmbience?.name || "배경"} 소리 ${state.ambienceEnabled === "true" ? "끄기" : "켜기"}`}
              title={`${selectedAmbience?.name || "배경"} 소리`}
            >
              {state.ambienceEnabled === "true" ? "♪" : "♩"}
            </button>
            <button className="icon-button settings-button" type="button" onClick={() => setScreen("settings")} aria-label="설정">
              ⚙
            </button>
            {state.showClock === "true" && selectedClock && (
              <img className="room-prop clock-prop wall-clock" id="clockProp" src={versioned(selectedClock.image)} alt="" aria-hidden="true" />
            )}
            {state.showRadio === "true" && selectedRadio && (
              <img
                className="room-prop radio-prop floor-radio"
                id="radioProp"
                src={versioned(selectedRadio.placedImage || selectedRadio.image)}
                alt=""
                aria-hidden="true"
              />
            )}
            {state.showRug === "true" && selectedRug && (
              <img className="room-prop rug-prop floor-rug" id="floorRug" src={versioned(selectedRug.image)} alt="" aria-hidden="true" />
            )}
            <div
              className="cat-stage"
              ref={catStageRef}
              style={{
                "--cat-offset-x": `${catOffset.x}px`,
                "--cat-offset-y": `${catOffset.y}px`,
                "--cat-walk-duration": `${walkDuration}ms`,
              }}
            >
              <button
                className={`cat-button ${walking ? "walking" : ""} ${ringing ? "ringing" : ""}`}
                id="ringButton"
                ref={ringButtonRef}
                type="button"
                aria-label="싱잉볼 울리기"
                style={{ "--cat-direction": catDirection }}
                onPointerDown={startCatDrag}
                onPointerMove={dragCat}
                onPointerUp={finishCatDrag}
                onPointerCancel={finishCatDrag}
                onClick={handleCatClick}
              >
                <img id="catFrame" ref={catImageRef} src={catFrame} alt="고양이가 싱잉볼을 치는 모습" />
                <img
                  id="selectedBowlOverlay"
                  ref={bowlImageRef}
                  className="selected-bowl-overlay"
                  src={versioned(selectedBowl.image)}
                  alt=""
                  aria-hidden="true"
                />
                <span className="ripple-layer" aria-hidden="true"></span>
                <span className="spark-layer" aria-hidden="true"></span>
              </button>
            </div>
            <QuickPanel setScreen={setScreen} />
          </div>
        </div>

        <DecorScreen
          screen={screen}
          setScreen={setScreen}
          state={state}
          updateState={updateState}
          selectRug={selectRug}
          selectClock={selectClock}
          selectRadio={selectRadio}
        />
        <BowlsScreen screen={screen} setScreen={setScreen} selectedBowlId={state.selectedBowl} selectBowl={selectBowl} />
        <RecordsScreen
          screen={screen}
          setScreen={setScreen}
          todayCount={todayCount}
          totalCount={state.records.length}
          weekCounts={weekCounts}
          weekCountsMax={weekCountsMax}
          records={visibleRecords}
        />
        <SettingsScreen screen={screen} setScreen={setScreen} state={state} updateState={updateState} />
      </section>
    </main>
  );
}

function QuickPanel({ setScreen }) {
  return (
    <nav className="quick-panel" aria-label="빠른 메뉴">
      <button className="quick-card" type="button" onClick={() => setScreen("bowls")}>
        <img className="quick-icon quick-icon-image quick-icon-bowl" src={versioned("assets/ui/gnb-singing-bowl.png")} alt="" aria-hidden="true" />
        <span>싱잉볼</span>
      </button>
      <button className="quick-card" type="button" onClick={() => setScreen("cats")}>
        <img className="quick-icon quick-icon-image quick-icon-shop" src={versioned("assets/ui/gnb-shop.png")} alt="" aria-hidden="true" />
        <span>꾸미기</span>
      </button>
      <button className="quick-card" type="button" onClick={() => setScreen("records")}>
        <span className="quick-icon">⌗</span>
        <span>기록</span>
      </button>
    </nav>
  );
}

function DecorScreen({ screen, setScreen, state, updateState, selectRug, selectClock, selectRadio }) {
  return (
    <div className={`screen ${screen !== "cats" ? "hidden" : ""}`} data-screen="cats">
      <header className="top-bar">
        <button className="back-button" type="button" onClick={() => setScreen("home")} aria-label="뒤로">
          ‹
        </button>
        <h1>꾸미기</h1>
        <button className="done-button" type="button" onClick={() => setScreen("home")}>
          완료
        </button>
      </header>
      <div className="content decor-content">
        <nav className="decor-tabs" aria-label="꾸미기 카테고리">
          {decorTabs.map((tab) => (
            <button
              key={tab.id}
              className={`decor-tab ${state.selectedDecorTab === tab.id ? "active" : ""}`}
              type="button"
              aria-selected={state.selectedDecorTab === tab.id}
              onClick={() => updateState({ selectedDecorTab: tab.id })}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <ClockGrid active={state.selectedDecorTab === "clock"} selectedClock={state.selectedClock} showClock={state.showClock} selectClock={selectClock} />
        <RadioGrid active={state.selectedDecorTab === "radios"} selectedRadio={state.selectedRadio} showRadio={state.showRadio} selectRadio={selectRadio} />
        <RugGrid active={state.selectedDecorTab === "rugs"} selectedRug={state.selectedRug} showRug={state.showRug} selectRug={selectRug} />
        <BackgroundGrid active={state.selectedDecorTab === "backgrounds"} selectedBackground={state.selectedBackground} updateState={updateState} />
      </div>
    </div>
  );
}

function ClockGrid({ active, selectedClock, showClock, selectClock }) {
  return (
    <div className={`single-shop-grid clock-grid ${!active ? "hidden" : ""}`} data-decor-section="clock" aria-label="시계 선택">
      {Object.entries(clocks).map(([clockId, clock]) => {
        const selected = showClock === "true" && selectedClock === clockId;
        return (
          <button
            key={clockId}
            className={`decor-item clock-card ${selected ? "selected" : ""}`}
            type="button"
            aria-label={clock.name}
            aria-pressed={selected}
            onClick={() => selectClock(clockId)}
          >
            <img src={versioned(clock.image)} alt="" />
          </button>
        );
      })}
    </div>
  );
}

function RadioGrid({ active, selectedRadio, showRadio, selectRadio }) {
  return (
    <div className={`radio-grid ${!active ? "hidden" : ""}`} data-decor-section="radios" aria-label="라디오 선택">
      {Object.entries(radios).map(([radioId, radio]) => {
        const selected = showRadio === "true" && selectedRadio === radioId;
        return (
          <button
            key={radioId}
            className={`radio-card ${selected ? "selected" : ""}`}
            type="button"
            aria-label={radio.name}
            aria-pressed={selected}
            onClick={() => selectRadio(radioId)}
          >
            <img src={versioned(radio.placedImage || radio.image)} alt="" />
          </button>
        );
      })}
    </div>
  );
}

function RugGrid({ active, selectedRug, showRug, selectRug }) {
  return (
    <div className={`rug-grid ${!active ? "hidden" : ""}`} data-decor-section="rugs" aria-label="러그 선택">
      {Object.entries(rugs).map(([rugId, rug]) => {
        const selected = showRug === "true" && selectedRug === rugId;
        return (
          <button
            key={rugId}
            className={`rug-card ${selected ? "selected" : ""}`}
            type="button"
            aria-label={rug.name}
            aria-pressed={selected}
            onClick={() => selectRug(rugId)}
          >
            <img src={versioned(rug.image)} alt="" />
          </button>
        );
      })}
    </div>
  );
}

function BackgroundGrid({ active, selectedBackground, updateState }) {
  return (
    <div className={`background-grid ${!active ? "hidden" : ""}`} data-decor-section="backgrounds" aria-label="창문 배경 선택">
      {backgrounds.map((background) => {
        const selected = selectedBackground === background.id;
        return (
          <button
            key={background.id}
            className={`background-card ${selected ? "selected" : ""}`}
            type="button"
            aria-label={background.name}
            onClick={() => updateState({ selectedBackground: background.id })}
          >
            <span className={`background-preview ${background.previewClass}`}></span>
            {selected && <b>✓</b>}
          </button>
        );
      })}
    </div>
  );
}

function BowlsScreen({ screen, setScreen, selectedBowlId, selectBowl }) {
  const unlockedCount = Object.values(bowls).filter((bowl) => bowl.unlocked).length;

  return (
    <div className={`screen ${screen !== "bowls" ? "hidden" : ""}`} data-screen="bowls">
      <header className="top-bar">
        <button className="back-button" type="button" onClick={() => setScreen("home")} aria-label="뒤로">
          ‹
        </button>
        <h1>싱잉볼 선택</h1>
      </header>
      <div className="content bowl-list">
        {Object.entries(bowls).map(([bowlId, bowl]) => {
          const selected = selectedBowlId === bowlId;
          return (
            <button
              key={bowlId}
              className={`bowl-row ${selected ? "selected" : ""} ${!bowl.unlocked ? "locked" : ""}`}
              type="button"
              data-bowl={bowlId}
              onClick={() => selectBowl(bowlId)}
            >
              <img className="bowl-thumb" src={versioned(bowl.image)} alt="" />
              <span>
                <strong>{bowl.name}</strong>
                {selected && bowl.unlocked && <em>사용 중</em>}
                <small>{bowl.description}</small>
              </span>
              <b>{selected && bowl.unlocked ? "✓" : ""}</b>
            </button>
          );
        })}
        <aside className="progress-card">
          <div>
            <strong>싱잉볼 컬렉션</strong>
            <span>
              {unlockedCount} / {Object.keys(bowls).length}
            </span>
          </div>
          <progress value={unlockedCount} max={Object.keys(bowls).length}></progress>
        </aside>
      </div>
    </div>
  );
}

function RecordsScreen({ screen, setScreen, todayCount, totalCount, records, weekCounts, weekCountsMax }) {
  return (
    <div className={`screen ${screen !== "records" ? "hidden" : ""}`} data-screen="records">
      <header className="top-bar">
        <button className="back-button" type="button" onClick={() => setScreen("home")} aria-label="뒤로">
          ‹
        </button>
        <h1>기록</h1>
      </header>
      <div className="content records-view">
        <div className="stat-grid">
          <article>
            <span>오늘</span>
            <strong id="recordToday">{todayCount}</strong>
            <small>회</small>
          </article>
          <article>
            <span>전체 누적</span>
            <strong id="recordTotal">{totalCount}</strong>
            <small>회</small>
          </article>
          <article>
            <span>연속 기록</span>
            <strong id="streakCount">{totalCount > 0 ? "1" : "0"}</strong>
            <small>일</small>
          </article>
        </div>
        <h2>최근 기록</h2>
        <ul className="record-list" id="recordList">
          {records.length === 0 ? (
            <li>
              <b></b>
              <span>
                <strong>아직 기록이 없어요</strong>
                <small>싱잉볼을 한 번 울려보세요.</small>
              </span>
              <small>-</small>
            </li>
          ) : (
            records.map((record) => (
              <li key={record.id}>
                <b></b>
                <span>
                  <strong>{bowls[record.bowlId]?.name || "싱잉볼"}</strong>
                  <small>{record.animationType === "hit" ? "따뜻한 울림" : "부드러운 울림"}</small>
                </span>
                <small>{formatTime(record.createdAt)}</small>
              </li>
            ))
          )}
        </ul>
        <h2>주간 기록</h2>
        <div className="week-chart" id="weekChart" aria-label="주간 기록 그래프">
          {weekCounts.map((count, index) => (
            <span key={`${index}-${count}`} title={`${count}회`} style={{ height: `${Math.max(10, (count / weekCountsMax) * 120)}px` }}></span>
          ))}
        </div>
      </div>
      <nav className="tab-bar" aria-label="하단 탭">
        <button type="button" onClick={() => setScreen("home")}>
          ⌂<span>홈</span>
        </button>
        <button type="button" onClick={() => setScreen("bowls")}>
          <img className="tab-icon-image tab-icon-bowl" src={versioned("assets/ui/gnb-singing-bowl.png")} alt="" aria-hidden="true" />
          <span>싱잉볼</span>
        </button>
        <button type="button" onClick={() => setScreen("cats")}>
          <img className="tab-icon-image tab-icon-shop" src={versioned("assets/ui/gnb-shop.png")} alt="" aria-hidden="true" />
          <span>꾸미기</span>
        </button>
        <button className="active" type="button">
          ⌗<span>기록</span>
        </button>
      </nav>
    </div>
  );
}

function SettingsScreen({ screen, setScreen, state, updateState }) {
  const ambiencePercent = Math.round(Number(state.ambienceVolume) * 100);
  const bowlPercent = Math.round(Number(state.bowlVolume) * 100);

  return (
    <div
      className={`settings-modal ${screen !== "settings" ? "hidden" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settingsTitle"
      onClick={() => setScreen("home")}
    >
      <div className="settings-dialog" onClick={(event) => event.stopPropagation()}>
        <header className="settings-header">
          <h1 id="settingsTitle">설정</h1>
          <button className="done-button" type="button" onClick={() => setScreen("home")}>
            완료
          </button>
        </header>
        <section className="settings-panel" aria-label="소리 설정">
          <VolumeControl
            label="배경 소리"
            value={state.ambienceVolume}
            percent={ambiencePercent}
            onChange={(value) => updateState({ ambienceVolume: value })}
          />
          <VolumeControl
            label="싱잉볼 소리"
            value={state.bowlVolume}
            percent={bowlPercent}
            onChange={(value) => updateState({ bowlVolume: value })}
          />
        </section>
      </div>
    </div>
  );
}

function VolumeControl({ label, value, percent, onChange }) {
  return (
    <label className="volume-control">
      <span>
        <strong>{label}</strong>
        <em>{percent}%</em>
      </span>
      <input type="range" min="0" max="1" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
