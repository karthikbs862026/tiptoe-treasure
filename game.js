const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const promptEl = document.querySelector("#prompt");
const objectiveEl = document.querySelector("#objective");
const calmFill = document.querySelector("#calmFill");
const dialog = document.querySelector("#dialog");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogText = document.querySelector("#dialogText");
const dialogButton = document.querySelector("#dialogButton");
const lockPanel = document.querySelector("#lockPanel");
const lockClues = document.querySelector("#lockClues");
const lockCode = document.querySelector("#lockCode");
const lockChoices = document.querySelector("#lockChoices");
const levelPanel = document.querySelector("#levelPanel");
const levelChoices = document.querySelector("#levelChoices");
const stickerShelf = document.querySelector("#stickerShelf");
const actionBtn = document.querySelector("#actionBtn");
const distractBtn = document.querySelector("#distractBtn");
const soundBtn = document.querySelector("#soundBtn");
const shareBtn = document.querySelector("#shareBtn");

const TILE = 48;
const WORLD_W = 20;
const WORLD_H = 13;
const keys = new Set();
const pressedDirs = new Set();

const colors = {
  wall: "#5c476d",
  wallTop: "#806894",
  wallEdge: "#443452",
  floor: "#f7dfaa",
  floorAlt: "#f1d498",
  roomA: "#a8d8bd",
  roomB: "#a8c9e9",
  rug: "#ef8379",
  child: "#54bd95",
  childTrim: "#fff7e9",
  adult: "#77519b",
  adultDark: "#4d3767",
  alert: "#ef786d",
  shadow: "rgba(38, 29, 50, 0.24)",
  sight: "rgba(245, 189, 63, 0.3)",
  sightEdge: "rgba(230, 145, 76, 0.44)",
  hide: "#4f9edc",
  clue: "#f5bd3f",
  clueEdge: "#94632c",
  goal: "#d95f78",
  toy: "#f28aa8",
  music: "#65b7e8",
  piece: "#70c78f",
  puppy: "#c98955",
  puppyDark: "#7b4d32",
  poodleCream: "#fff0d6",
  poodleFluff: "#ffe9bf",
  rain: "rgba(151, 205, 230, 0.46)",
  burglar: "#2f4057",
  burglarStripe: "#f4e6c8",
};
const lockSymbols = ["star", "moon", "heart", "leaf", "sun", "gem"];
const symbolGlyphs = {
  star: "*",
  moon: "C",
  heart: "<3",
  leaf: "L",
  sun: "O",
  gem: "<>",
};
const saveKey = "tiptoeTreasureSave";
const levelNames = ["Treasure Hunt", "Puppy Play", "Snack Trail", "Rainy Day", "Poodle Patrol"];
const stickerCatalog = {
  quietShoes: { label: "Quiet Shoes", mark: "QS" },
  poodlePal: { label: "Poodle Pal", mark: "PP" },
  snackGenius: { label: "Snack Genius", mark: "SG" },
  thunderTimer: { label: "Thunder Timer", mark: "TT" },
  poodlePatrol: { label: "Poodle Patrol", mark: "PT" },
  masterTiptoer: { label: "Master Tiptoer", mark: "MT" },
  gameNight: { label: "Family Game Night", mark: "FG" },
};

const walls = new Set();
const furniture = [];
const searchSpots = [
  {
    id: "fridge",
    x: 2,
    y: 2,
    label: "Kitchen counter",
    place: "kitchen counter",
  },
  {
    id: "books",
    x: 16,
    y: 2,
    label: "Tall bookshelf",
    place: "tall bookshelf",
  },
  {
    id: "chair",
    x: 15.2,
    y: 9.4,
    label: "Green chair",
    place: "green chair",
  },
  {
    id: "bed",
    x: 6.2,
    y: 10.2,
    label: "Striped bed",
    place: "striped bed",
  },
  {
    id: "plant",
    x: 2.4,
    y: 6.1,
    label: "Window plant",
    place: "window plant",
  },
  {
    id: "table",
    x: 12.4,
    y: 6.7,
    label: "Table fort",
    place: "table fort",
  },
  {
    id: "laundry",
    x: 17,
    y: 10,
    label: "Laundry basket",
    place: "laundry basket",
  },
  {
    id: "hall",
    x: 7.2,
    y: 2.5,
    label: "Hallway nook",
    place: "hallway nook",
  },
  { id: "toyChest", x: 16.4, y: 6.2, label: "Toy chest", place: "toy chest" },
  { id: "blanketBox", x: 6.7, y: 6.8, label: "Blanket box", place: "blanket box" },
  { id: "puzzleDrawer", x: 2.2, y: 5.8, label: "Puzzle drawer", place: "puzzle drawer" },
  { id: "windowBench", x: 13.3, y: 5.4, label: "Window bench", place: "window bench" },
  { id: "secretShelf", x: 11.6, y: 2.6, label: "Low shelf", place: "low shelf" },
];
const hidingSpots = [
  { x: 6, y: 3, label: "curtains" },
  { x: 10, y: 6, label: "table fort" },
  { x: 17, y: 10, label: "laundry basket" },
];
const distractionItems = [
  { id: "bear", x: 4.8, y: 6.35, startX: 4.8, startY: 6.35, label: "plush bear", kind: "soft", strength: 1.05, pulses: 1, cooldown: 0 },
  { id: "ball", x: 13.7, y: 10.8, startX: 13.7, startY: 10.8, label: "paper ball", kind: "bounce", strength: 1.25, pulses: 2, cooldown: 0.8 },
  { id: "music", x: 15.9, y: 2.55, startX: 15.9, startY: 2.55, label: "music box", kind: "music", strength: 1.65, pulses: 4, cooldown: 0.65 },
];
let treasureSpot = searchSpots[0];
let pieceSpots = [];
let lockCodeSymbols = [];

const adults = [
  {
    name: "Watcher",
    role: "watcher",
    x: 8,
    y: 2,
    dir: { x: 1, y: 0 },
    alert: null,
    start: { x: 8, y: 2, dir: { x: 1, y: 0 } },
    speed: 0.95,
    investigateSpeed: 1.35,
    hearing: 0.85,
    sightRange: 4.8,
    sightDot: 0.57,
    color: "#77519b",
    path: [
      [8, 2],
      [12, 2],
      [12, 5],
      [8, 5],
    ],
    target: 1,
    pause: 0,
    scan: 0,
  },
  {
    name: "Listener",
    role: "listener",
    x: 12,
    y: 9,
    dir: { x: 0, y: -1 },
    alert: null,
    start: { x: 12, y: 9, dir: { x: 0, y: -1 } },
    speed: 1.18,
    investigateSpeed: 1.95,
    hearing: 1.35,
    sightRange: 3.65,
    sightDot: 0.68,
    color: "#4f78a8",
    path: [
      [12, 9],
      [16, 9],
      [16, 6],
      [12, 6],
    ],
    target: 1,
    pause: 0,
    scan: 0,
  },
];

const player = {
  x: 1.5,
  y: 10.5,
  speed: 3.15,
  radius: 0.28,
  hidden: false,
};

const puppy = {
  x: 2.35,
  y: 11.05,
  startX: 2.35,
  startY: 11.05,
  speed: 2.35,
  excitement: 0,
  barkCooldown: 0,
  napTimer: 0,
  napCooldown: 0,
  wag: 0,
  followDistance: 1.85,
};
const napZones = [
  { x: 11.8, y: 10.1, label: "soft rug" },
  { x: 6.1, y: 9.7, label: "blanket corner" },
  { x: 13.2, y: 2.6, label: "sunny window" },
];
const burglar = {
  x: 18.1,
  y: 1.6,
  startX: 18.1,
  startY: 1.6,
  speed: 1.18,
  target: 0,
  caught: false,
  scare: 0,
  path: [
    [17.2, 1.6],
    [15.5, 5.2],
    [12.4, 5.6],
    [6.4, 6.4],
    [6.4, 10.5],
  ],
};

const state = {
  playing: false,
  level: 1,
  won: false,
  calm: 100,
  searches: 0,
  searched: new Set(),
  pieces: new Set(),
  carriedItem: null,
  droppedDistractions: [],
  distractionsUsed: 0,
  spotted: 0,
  puppyBarks: 0,
  crumbs: [],
  crumbsLeft: 0,
  crumbsUsed: 0,
  puppyNaps: 0,
  thunderTimer: 0,
  thunderCooldown: 0,
  thunderCount: 0,
  thunderFlash: 0,
  burglarCaught: false,
  burglarCommands: 0,
  unlockedLevel: 1,
  stickers: new Set(),
  earnedStickers: [],
  wasSeen: false,
  lockInput: [],
  nearMiss: null,
  noises: [],
  messageTimer: 0,
  message: "",
  lastTime: 0,
  sound: false,
};

function setupMap() {
  for (let x = 0; x < WORLD_W; x += 1) {
    walls.add(`${x},0`);
    walls.add(`${x},${WORLD_H - 1}`);
  }
  for (let y = 0; y < WORLD_H; y += 1) {
    walls.add(`0,${y}`);
    walls.add(`${WORLD_W - 1},${y}`);
  }
  for (let x = 4; x < 16; x += 1) {
    if (![7, 13].includes(x)) walls.add(`${x},4`);
  }
  for (let x = 3; x < 18; x += 1) {
    if (![5, 11, 17].includes(x)) walls.add(`${x},8`);
  }
  for (let y = 1; y < 12; y += 1) {
    if (![3, 7, 10].includes(y)) walls.add(`9,${y}`);
  }
  [
    [3, 3, 2, 1, "counter"],
    [15, 3, 3, 1, "shelf"],
    [2, 9, 4, 2, "bed"],
    [13, 9, 2, 2, "chair"],
    [10, 5, 2, 2, "table"],
    [17, 5, 2, 2, "storage"],
  ].forEach(([x, y, w, h, type]) => furniture.push({ x, y, w, h, type }));
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function cellBlocked(x, y) {
  const gx = Math.floor(x);
  const gy = Math.floor(y);
  if (walls.has(`${gx},${gy}`)) return true;
  return furniture.some((item) => gx >= item.x && gx < item.x + item.w && gy >= item.y && gy < item.y + item.h);
}

function moveEntity(entity, dx, dy, dt) {
  const nextX = entity.x + dx * dt;
  if (!cellBlocked(nextX, entity.y)) entity.x = nextX;
  const nextY = entity.y + dy * dt;
  if (!cellBlocked(entity.x, nextY)) entity.y = nextY;
}

function updatePlayer(dt) {
  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a") || pressedDirs.has("left")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d") || pressedDirs.has("right")) dx += 1;
  if (keys.has("arrowup") || keys.has("w") || pressedDirs.has("up")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s") || pressedDirs.has("down")) dy += 1;
  const len = Math.hypot(dx, dy) || 1;
  moveEntity(player, (dx / len) * player.speed, (dy / len) * player.speed, dt);
  player.hidden = hidingSpots.some((spot) => distance(player, spot) < 0.7);
}

function updatePuppy(dt) {
  if (state.level < 2) return;
  puppy.wag += dt;
  puppy.barkCooldown = Math.max(0, puppy.barkCooldown - dt);
  puppy.napCooldown = Math.max(0, puppy.napCooldown - dt);
  if (puppy.napTimer > 0) {
    puppy.napTimer -= dt;
    puppy.excitement = Math.max(0, puppy.excitement - (state.thunderTimer > 0 ? 12 : 36) * dt);
    return;
  }

  const crumb = nearestCrumb();
  const target = puppyPatrolTarget() || crumb || player;
  const dx = target.x - puppy.x;
  const dy = target.y - puppy.y;
  const dist = Math.hypot(dx, dy) || 1;

  const patrolTarget = target === burglar;
  const stopDistance = patrolTarget ? 0.36 : crumb ? 0.42 : puppy.followDistance;
  if ((patrolTarget || crumb || dist < 5.8) && dist > stopDistance) {
    const speed = patrolTarget ? puppy.speed * 1.55 : crumb ? puppy.speed * 1.32 : puppy.excitement > 70 ? puppy.speed * 1.25 : puppy.speed;
    const beforeX = puppy.x;
    const beforeY = puppy.y;
    moveEntity(puppy, (dx / dist) * speed, (dy / dist) * speed, dt);
    if (Math.hypot(puppy.x - beforeX, puppy.y - beforeY) < 0.006 && dist > 1.1) {
      moveEntity(puppy, (-dy / dist) * speed * 0.65, (dx / dist) * speed * 0.65, dt);
    }
  }

  if (patrolTarget && distance(puppy, burglar) < 0.62) {
    catchBurglar();
    return;
  }

  if (crumb && !patrolTarget && distance(puppy, crumb) < 0.48) {
    state.crumbs = state.crumbs.filter((item) => item.id !== crumb.id);
    puppy.excitement = Math.max(0, puppy.excitement - 32);
    showMessage("The puppy munches a snack crumb and pads along quietly.", 1.8);
  }

  const playerDist = distance(player, puppy);
  if (state.level >= 4 && state.thunderTimer > 0) {
    puppy.excitement = Math.min(100, puppy.excitement + 16 * dt);
  }
  if (!crumb && !patrolTarget && playerDist < 1.08 && !player.hidden) {
    const awayX = puppy.x - player.x;
    const awayY = puppy.y - player.y;
    const awayLen = Math.hypot(awayX, awayY) || 1;
    moveEntity(puppy, (awayX / awayLen) * puppy.speed * 0.75, (awayY / awayLen) * puppy.speed * 0.75, dt);
  }
  if (playerDist < 1.55 && !player.hidden) {
    puppy.excitement = Math.min(100, puppy.excitement + 14 * dt);
  } else {
    puppy.excitement = Math.max(0, puppy.excitement - (crumb || player.hidden ? 26 : 10) * dt);
  }

  const napZone = napZones.find((zone) => distance(puppy, zone) < 0.78);
  if (state.level >= 3 && !patrolTarget && napZone && puppy.excitement < 58 && puppy.napCooldown <= 0) {
    puppy.napTimer = 5.5;
    puppy.napCooldown = 8.5;
    puppy.excitement = 0;
    state.puppyNaps += 1;
    showMessage(`The puppy curls up in the ${napZone.label}. Quiet window!`, 2.4);
  }

  if (puppy.excitement >= 100 && puppy.barkCooldown <= 0) {
    puppyBark();
  }
}

function puppyPatrolTarget() {
  if (state.level < 5 || state.burglarCaught || burglar.caught || puppy.napTimer > 0) return null;
  if (distance(puppy, burglar) < 6.2 || burglar.scare > 0) return burglar;
  return null;
}

function nearestCrumb() {
  if (state.level < 3 || state.crumbs.length === 0) return null;
  return state.crumbs.reduce((best, crumb) => {
    if (!best) return crumb;
    return distance(puppy, crumb) < distance(puppy, best) ? crumb : best;
  }, null);
}

function puppyBark() {
  puppy.barkCooldown = 3.6;
  puppy.excitement = 46;
  state.puppyBarks += 1;
  state.calm = Math.max(0, state.calm - 5);
  const heard = makeNoise(puppy, 1.55);
  showMessage("The puppy barks for playtime. Tap Toy nearby to calm it.", 2.6);
  if (!heard && state.level >= 4 && state.thunderTimer > 0) showMessage("Thunder covers the bark, but the puppy needs comfort.", 2.4);
  tone(360, 0.08);
}

function updateAdults(dt) {
  adults.forEach((adult) => {
    if (adult.alert) {
      updateAlertAdult(adult, dt);
      return;
    }
    if (adult.pause > 0) {
      adult.pause -= dt;
      if (adult.role === "listener") {
        adult.scan += dt;
        const angle = Math.atan2(adult.dir.y, adult.dir.x) + Math.sin(adult.scan * 4) * 0.035;
        adult.dir = { x: Math.cos(angle), y: Math.sin(angle) };
      }
      return;
    }
    const [tx, ty] = adult.path[adult.target];
    const cx = adult.x + 0.5;
    const cy = adult.y + 0.5;
    const vx = tx + 0.5 - cx;
    const vy = ty + 0.5 - cy;
    const len = Math.hypot(vx, vy);
    if (len < 0.05) {
      adult.target = (adult.target + 1) % adult.path.length;
      adult.pause = adult.role === "listener" ? 1.05 : 0.55;
      return;
    }
    adult.dir = { x: vx / len, y: vy / len };
    adult.x += adult.dir.x * adult.speed * dt;
    adult.y += adult.dir.y * adult.speed * dt;
  });
}

function updateAlertAdult(adult, dt) {
  adult.alert.timer -= dt;
  const ax = adult.x + 0.5;
  const ay = adult.y + 0.5;
  const vx = adult.alert.x - ax;
  const vy = adult.alert.y - ay;
  const len = Math.hypot(vx, vy) || 1;
  adult.dir = { x: vx / len, y: vy / len };

  if (adult.alert.timer < adult.alert.hold && len > 0.45) {
    moveEntity(adult, adult.dir.x * adult.investigateSpeed, adult.dir.y * adult.investigateSpeed, dt);
  }
  if (adult.alert.timer <= 0) {
    adult.alert = null;
    adult.pause = 0.45;
  }
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(saveKey) || "{}");
    state.unlockedLevel = Math.max(1, Math.min(5, saved.unlockedLevel || 1));
    state.stickers = new Set(Array.isArray(saved.stickers) ? saved.stickers : []);
  } catch {
    state.unlockedLevel = 1;
    state.stickers = new Set();
  }
}

function saveProgress() {
  try {
    localStorage.setItem(
      saveKey,
      JSON.stringify({
        unlockedLevel: state.unlockedLevel,
        stickers: [...state.stickers],
      }),
    );
  } catch {
    // Progress saving is optional; the game still works without storage.
  }
}

function unlockLevel(level) {
  if (level > state.unlockedLevel) {
    state.unlockedLevel = Math.min(5, level);
    saveProgress();
  }
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRun() {
  treasureSpot = searchSpots[randomInt(searchSpots.length)];
  pieceSpots = shuffle(searchSpots.filter((spot) => spot.id !== treasureSpot.id)).slice(0, 3);
  lockCodeSymbols = shuffle(lockSymbols).slice(0, 3);
  pieceSpots.forEach((spot, index) => {
    spot.pieceSymbol = lockCodeSymbols[index];
  });
  searchSpots
    .filter((spot) => !pieceSpots.includes(spot))
    .forEach((spot) => {
      delete spot.pieceSymbol;
    });
}

function searchHint(spot) {
  const d = distance(spot, treasureSpot);
  if (d < 2.2) return "Very warm. The board game must be close.";
  if (d < 4.3) return "Warm. This side of the house feels promising.";
  if (d < 6.3) return "Cool. Try another nearby room.";
  return "Cold. The hiding place is probably far from here.";
}

function makeNoise(source, strength = 1) {
  const masked = state.level >= 4 && state.thunderTimer > 0;
  state.noises.push({
    x: source.x,
    y: source.y,
    timer: 0.75,
    duration: 0.75,
    radius: 3.4 + strength * 1.6,
    masked,
  });
  if (masked) return 0;
  return alertAdults(source, strength);
}

function alertAdults(source, strength) {
  let heard = 0;
  adults.forEach((adult) => {
    const adultCenter = { x: adult.x + 0.5, y: adult.y + 0.5 };
    const hearingRange = 4.9 + strength * 1.6 * adult.hearing;
    if (distance(adultCenter, source) <= hearingRange) {
      adult.alert = {
        x: source.x,
        y: source.y,
        timer: adult.role === "listener" ? 3.1 : 2.15,
        hold: adult.role === "listener" ? 2.25 : 1.25,
      };
      adult.pause = 0;
      heard += 1;
    }
  });
  return heard;
}

function canSee(adult) {
  if (player.hidden) return false;
  const ax = adult.x + 0.5;
  const ay = adult.y + 0.5;
  const px = player.x;
  const py = player.y;
  const vx = px - ax;
  const vy = py - ay;
  const dist = Math.hypot(vx, vy);
  if (dist > adult.sightRange || dist < 0.1) return false;
  const dot = (vx / dist) * adult.dir.x + (vy / dist) * adult.dir.y;
  if (dot < adult.sightDot) return false;
  const steps = Math.ceil(dist * 8);
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    if (walls.has(`${Math.floor(ax + vx * t)},${Math.floor(ay + vy * t)}`)) return false;
  }
  return true;
}

function nearbyDistractionItem() {
  return distractionItems
    .filter((item) => !item.used && !item.carried && distance(player, item) < 1.25)
    .sort((a, b) => distance(player, a) - distance(player, b))[0];
}

function useDistraction() {
  if (!state.playing) return;
  if (state.carriedItem) {
    dropDistraction();
    return;
  }
  const item = nearbyDistractionItem();
  if (item) {
    item.carried = true;
    state.carriedItem = item;
    showMessage(`Picked up the ${item.label}. Drop it when you need a distraction.`, 2.4);
    updateObjective();
    return;
  }
  if (canCalmPuppy()) {
    calmPuppy();
    return;
  }
  if (canCommandPoodle()) {
    commandPoodle();
    return;
  }
  if (state.level >= 3 && state.crumbsLeft > 0) {
    placeCrumb();
    return;
  }
  showMessage("Move near a toy to pick it up, or near the puppy to pet it.", 2.2);
}

function placeCrumb() {
  if (state.crumbsLeft <= 0) {
    showMessage("No snack crumbs left. Use nap zones or pet the puppy now.", 2);
    return;
  }
  if (state.crumbs.some((crumb) => distance(player, crumb) < 0.8)) {
    showMessage("There is already a snack crumb here.", 1.6);
    return;
  }
  state.crumbs.push({
    id: `crumb-${state.crumbsUsed}`,
    x: player.x,
    y: player.y,
    timer: 14,
  });
  state.crumbsLeft -= 1;
  state.crumbsUsed += 1;
  puppy.excitement = Math.max(0, puppy.excitement - 8);
  showMessage("Placed a snack crumb. The puppy will follow the trail.", 2);
  updateObjective();
}

function canCalmPuppy() {
  return state.level >= 2 && !(state.level >= 5 && !state.burglarCaught) && distance(player, puppy) < 1.45 && puppy.excitement > 12;
}

function canCommandPoodle() {
  return state.level >= 5 && !state.burglarCaught && distance(player, puppy) < 1.75;
}

function commandPoodle() {
  burglar.scare = 4.8;
  puppy.napTimer = 0;
  puppy.excitement = Math.max(20, puppy.excitement - 18);
  state.burglarCommands += 1;
  showMessage("Fetch! The poodle dashes after the burglar.", 2.2);
  tone(760, 0.08);
  updateObjective();
}

function calmPuppy() {
  puppy.excitement = Math.max(0, puppy.excitement - 62);
  puppy.barkCooldown = Math.max(puppy.barkCooldown, 1.2);
  state.calm = Math.min(100, state.calm + 4);
  showMessage("You gently play with the puppy. It settles down, tail thumping softly.", 2.3);
  tone(720, 0.08);
  updateObjective();
}

function dropDistraction() {
  const item = state.carriedItem;
  if (!item) return;
  item.carried = false;
  item.used = true;
  item.x = player.x;
  item.y = player.y;
  state.carriedItem = null;
  const decoy = {
    x: player.x,
    y: player.y,
    label: item.label,
    kind: item.kind,
    strength: item.strength,
    pulses: item.pulses,
    cooldown: 0.05,
    timer: item.kind === "music" ? 5.2 : 2.6,
  };
  state.droppedDistractions.push(decoy);
  state.distractionsUsed += 1;
  showMessage(`Dropped the ${item.label}. Move while they check the sound.`, 2.4);
  updateObjective();
}

function pieceAtSpot(spot) {
  return pieceSpots.find((pieceSpot) => pieceSpot.id === spot.id);
}

function updateDistractions(dt) {
  state.droppedDistractions.forEach((item) => {
    item.timer -= dt;
    item.cooldown -= dt;
    if (item.pulses > 0 && item.cooldown <= 0) {
      makeNoise(item, item.strength);
      item.pulses -= 1;
      item.cooldown = item.kind === "music" ? 0.82 : 0.65;
    }
  });
  state.droppedDistractions = state.droppedDistractions.filter((item) => item.timer > 0);
}

function updateCrumbs(dt) {
  if (state.level < 3) return;
  state.crumbs = state.crumbs
    .map((crumb) => ({ ...crumb, timer: crumb.timer - dt }))
    .filter((crumb) => crumb.timer > 0);
}

function updateWeather(dt) {
  if (state.level < 4) return;
  state.thunderFlash = Math.max(0, state.thunderFlash - dt * 2.5);
  if (state.thunderTimer > 0) {
    state.thunderTimer -= dt;
    if (state.thunderTimer <= 0) {
      state.thunderCooldown = 5.5 + Math.random() * 4.5;
      showMessage("The thunder fades. Quiet steps again.", 1.8);
    }
    return;
  }
  state.thunderCooldown -= dt;
  if (state.thunderCooldown <= 0) {
    state.thunderTimer = 2.8;
    state.thunderCount += 1;
    state.thunderFlash = 1;
    showMessage("Thunder rumbles. Searches are masked, but the puppy is nervous.", 2.6);
    tone(130, 0.16);
  }
}

function updateBurglar(dt) {
  if (state.level < 5 || state.burglarCaught || burglar.caught) return;
  burglar.scare = Math.max(0, burglar.scare - dt);
  const chase = distance(puppy, burglar) < 4.2 || burglar.scare > 0;
  const target = chase ? { x: burglar.startX, y: burglar.startY } : { x: burglar.path[burglar.target][0], y: burglar.path[burglar.target][1] };
  const dx = target.x - burglar.x;
  const dy = target.y - burglar.y;
  const len = Math.hypot(dx, dy) || 1;
  if (len < 0.12) {
    if (!chase) burglar.target = (burglar.target + 1) % burglar.path.length;
    return;
  }
  const speed = chase ? burglar.speed * 1.42 : burglar.speed;
  moveEntity(burglar, (dx / len) * speed, (dy / len) * speed, dt);
  if (distance(puppy, burglar) < 0.62) catchBurglar();
}

function catchBurglar() {
  if (state.burglarCaught) return;
  state.burglarCaught = true;
  burglar.caught = true;
  puppy.excitement = Math.max(0, puppy.excitement - 45);
  makeNoise(burglar, 1.2);
  showMessage("The poodle catches the burglar by the sock. Poodle Patrol!", 3);
  tone(860, 0.12);
}

function interact() {
  if (!state.playing) return;
  const nearbySpot = searchSpots.find((spot) => distance(player, spot) < 1.05);
  if (nearbySpot) {
    if (state.won && nearbySpot.id === treasureSpot.id) {
      if (state.level >= 5 && !state.burglarCaught) {
        showMessage("Almost there. Send the poodle after the burglar before unlocking the chest.", 2.6);
        return;
      }
      showLockDialog();
      return;
    }
    if (state.searched.has(nearbySpot.id)) {
      showMessage(`You already checked the ${nearbySpot.place}.`, 1.8);
      return;
    }
    state.searches += 1;
    state.searched.add(nearbySpot.id);
    const foundPiece = pieceAtSpot(nearbySpot);
    if (foundPiece && !state.pieces.has(foundPiece.id)) {
      state.pieces.add(foundPiece.id);
      tone(660, 0.08);
    }
    const heard = makeNoise(nearbySpot, 1);
    if (nearbySpot.id === treasureSpot.id) {
      findChest();
      return;
    }
    state.nearMiss = nearbySpot.id;
    state.calm = Math.max(0, state.calm - (heard ? 8 : 5));
    const warning = heard ? " Someone heard that." : "";
    const pieceText = foundPiece ? ` Found a ${symbolGlyphs[foundPiece.pieceSymbol]} game piece.` : "";
    showMessage(`Not in the ${nearbySpot.place}.${pieceText} ${searchHint(nearbySpot)}${warning}`, heard ? 4.2 : 3.4);
    updateObjective();
    tone(440, 0.06);
    return;
  }
  const spot = hidingSpots.find((hide) => distance(player, hide) < 1);
  if (spot) {
    showMessage(`You tuck into the ${spot.label}. Quiet as a moonbeam.`, 2.2);
    return;
  }
  const item = nearbyDistractionItem();
  if (item) {
    showMessage(`The ${item.label} can distract grown-ups. Tap Toy to pick it up.`, 2);
    return;
  }
  if (state.level >= 2 && distance(player, puppy) < 1.6) {
    showMessage("The puppy wants to play. Tap Toy nearby before it gets too excited.", 2.2);
    return;
  }
  if (state.level >= 3 && state.crumbsLeft > 0) {
    showMessage("Tap Toy to place snack crumbs and guide the puppy toward nap zones.", 2.2);
    return;
  }
  if (state.level >= 5 && !state.burglarCaught) {
    showMessage("Guide the poodle near the burglar, then tap Toy for Fetch.", 2.3);
    return;
  }
  showMessage("Move next to a marked object to Search, or use Toy to make a distraction.", 1.9);
}

function updateObjective() {
  const left = searchSpots.length - state.searched.size;
  const itemText = state.carriedItem ? ` Carrying: ${state.carriedItem.label}.` : "";
  const puppyText = state.level >= 2 ? ` Puppy ${Math.round(puppy.excitement)}%.` : "";
  const crumbText = state.level >= 3 ? ` Crumbs ${state.crumbsLeft}.` : "";
  const napText = puppy.napTimer > 0 ? " Puppy napping." : "";
  const weatherText = state.level >= 4 ? (state.thunderTimer > 0 ? " Thunder masks noise!" : " Rainy day.") : "";
  const burglarText = state.level >= 5 ? (state.burglarCaught ? " Burglar caught!" : " Catch burglar.") : "";
  objectiveEl.textContent = `Level ${state.level}. Pieces ${state.pieces.size}/3. ${left} spots left.${puppyText}${crumbText}${weatherText}${burglarText}${napText}${itemText}`;
  actionBtn.textContent = "Search";
  const nearbyItem = nearbyDistractionItem();
  distractBtn.textContent = state.carriedItem
    ? "Drop"
    : nearbyItem
      ? "Pick"
      : canCalmPuppy()
      ? "Pet"
      : canCommandPoodle()
        ? "Fetch"
      : state.level >= 3 && state.crumbsLeft > 0
        ? "Snack"
        : "Toy";
}

function showMessage(text, seconds = 2) {
  state.message = text;
  state.messageTimer = seconds;
  promptEl.textContent = text;
  promptEl.classList.add("visible");
}

function update(dt) {
  if (!state.playing) return;
  updatePlayer(dt);
  updatePuppy(dt);
  updateObjective();
  if (state.carriedItem) {
    state.carriedItem.x = player.x;
    state.carriedItem.y = player.y;
  }
  updateDistractions(dt);
  updateCrumbs(dt);
  updateWeather(dt);
  updateBurglar(dt);
  updateAdults(dt);
  state.noises = state.noises
    .map((noise) => ({ ...noise, timer: noise.timer - dt }))
    .filter((noise) => noise.timer > 0);
  if (adults.some(canSee)) {
    if (!state.wasSeen) {
      state.spotted += 1;
      state.wasSeen = true;
    }
    state.calm = Math.max(0, state.calm - 34 * dt);
    if (state.calm <= 0) lose();
  } else {
    state.wasSeen = false;
    state.calm = Math.min(100, state.calm + (player.hidden ? 18 : 6) * dt);
  }
  calmFill.style.transform = `scaleX(${state.calm / 100})`;
  if (state.messageTimer > 0) {
    state.messageTimer -= dt;
    if (state.messageTimer <= 0) promptEl.classList.remove("visible");
  }
}

function draw() {
  const viewW = canvas.clientWidth;
  const viewH = canvas.clientHeight;
  const scale = Math.min(viewW / (WORLD_W * TILE), viewH / (WORLD_H * TILE));
  const worldPxW = WORLD_W * TILE * scale;
  const worldPxH = WORLD_H * TILE * scale;
  const ox = (viewW - worldPxW) / 2;
  const oy = (viewH - worldPxH) / 2;

  const bg = ctx.createLinearGradient(0, 0, viewW, viewH);
  bg.addColorStop(0, "#426e69");
  bg.addColorStop(1, "#263f4f");
  ctx.clearRect(0, 0, viewW, viewH);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, viewW, viewH);
  ctx.fillStyle = "rgba(255, 247, 226, 0.08)";
  ctx.beginPath();
  ctx.arc(viewW * 0.18, viewH * 0.18, Math.min(viewW, viewH) * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  ctx.fillStyle = "rgba(24, 20, 32, 0.28)";
  roundRect(-8, -8, WORLD_W * TILE + 16, WORLD_H * TILE + 16, 22);

  drawHouse();
  state.noises.forEach(drawNoise);
  adults.forEach(drawSight);
  drawHidingSpots();
  drawNapZones();
  state.crumbs.forEach(drawCrumb);
  distractionItems.forEach(drawDistractionItem);
  state.droppedDistractions.forEach(drawActiveDistraction);
  searchSpots.forEach(drawSearchSpot);
  drawBurglar();
  adults.forEach(drawAdult);
  drawPuppy();
  drawPlayer();

  ctx.restore();
  drawRainOverlay(viewW, viewH);
}

function tileRect(x, y, w = 1, h = 1) {
  ctx.fillRect(x * TILE, y * TILE, w * TILE, h * TILE);
}

function drawHouse() {
  const floorGradient = ctx.createLinearGradient(0, 0, 0, WORLD_H * TILE);
  floorGradient.addColorStop(0, "#fae8bd");
  floorGradient.addColorStop(1, "#ebc988");
  ctx.fillStyle = floorGradient;
  roundRect(0, 0, WORLD_W * TILE, WORLD_H * TILE, 18);
  for (let y = 0; y < WORLD_H; y += 1) {
    for (let x = 0; x < WORLD_W; x += 1) {
      ctx.fillStyle = (x + y) % 2 ? "rgba(255,255,255,0.1)" : "rgba(129,84,52,0.055)";
      tileRect(x, y);
      ctx.fillStyle = "rgba(112, 73, 48, 0.08)";
      ctx.fillRect(x * TILE + 7, y * TILE + 8, TILE - 14, 2);
    }
  }
  ctx.fillStyle = colors.rug;
  roundRect(10.2 * TILE, 8.8 * TILE, 4.8 * TILE, 2.6 * TILE, 16);
  ctx.fillStyle = "rgba(255, 247, 226, 0.22)";
  for (let i = 0; i < 5; i += 1) {
    ctx.fillRect((10.5 + i * 0.85) * TILE, 9 * TILE, 8, 2.2 * TILE);
  }
  ctx.fillStyle = colors.roomA;
  roundRect(2 * TILE, 1.4 * TILE, 4.8 * TILE, 2 * TILE, 16);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(2.35 * TILE, 1.8 * TILE, 4.1 * TILE, 8);
  ctx.fillStyle = colors.roomB;
  roundRect(12.2 * TILE, 1.4 * TILE, 5.4 * TILE, 2 * TILE, 16);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(12.6 * TILE, 1.8 * TILE, 4.6 * TILE, 8);
  ctx.fillStyle = colors.wall;
  walls.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    ctx.fillStyle = colors.wallEdge;
    ctx.fillRect(x * TILE + 3, y * TILE + 6, TILE, TILE);
    ctx.fillStyle = colors.wall;
    tileRect(x, y);
    ctx.fillStyle = colors.wallTop;
    ctx.fillRect(x * TILE, y * TILE, TILE, 8);
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(x * TILE + 6, y * TILE + 4, TILE - 12, 2);
    ctx.fillStyle = colors.wall;
  });
  furniture.forEach(drawFurniture);
}

function furnitureColor(type) {
  return {
    counter: "#d9edf0",
    shelf: "#ba9272",
    bed: "#eaa3ad",
    chair: "#78b98f",
    table: "#c99367",
    storage: "#d86d83",
  }[type];
}

function drawFurniture(item) {
  const x = item.x * TILE + 5;
  const y = item.y * TILE + 5;
  const w = item.w * TILE - 10;
  const h = item.h * TILE - 10;
  ctx.fillStyle = "rgba(47, 39, 53, 0.18)";
  roundRect(x + 4, y + 7, w, h, 10);
  ctx.fillStyle = furnitureColor(item.type);
  roundRect(x, y, w, h, 10);
  ctx.fillStyle = "rgba(255,255,255,0.26)";
  ctx.fillRect(x + 9, y + 9, Math.max(8, w - 18), 5);
  ctx.fillStyle = "rgba(55, 37, 48, 0.16)";
  ctx.fillRect(x + 9, y + h - 10, Math.max(8, w - 18), 4);

  if (item.type === "bed") {
    ctx.fillStyle = "#fff2c8";
    roundRect(x + 12, y + 10, 36, 22, 8);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(x + 56, y + 10, w - 68, 7);
  }
  if (item.type === "shelf") {
    ctx.fillStyle = "rgba(58, 35, 38, 0.22)";
    for (let i = 1; i < item.w; i += 1) ctx.fillRect(x + i * TILE - 6, y + 8, 4, h - 16);
  }
  if (item.type === "table") {
    ctx.fillStyle = "#7b513e";
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.5, 12, 0, Math.PI * 2);
    ctx.fill();
  }
  if (item.type === "storage") {
    ctx.fillStyle = "#f5bd3f";
    ctx.fillRect(x + w * 0.5 - 5, y + 8, 10, h - 16);
    ctx.fillStyle = "#6f4f93";
    roundRect(x + w * 0.5 - 8, y + h * 0.5 - 7, 16, 14, 5);
  }
}

function drawSight(adult) {
  const ax = (adult.x + 0.5) * TILE;
  const ay = (adult.y + 0.5) * TILE;
  const angle = Math.atan2(adult.dir.y, adult.dir.x);
  const spread = Math.acos(adult.sightDot);
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.arc(ax, ay, adult.sightRange * TILE, angle - spread, angle + spread);
  ctx.closePath();
  ctx.fillStyle = adult.alert ? "rgba(239, 120, 109, 0.24)" : colors.sight;
  ctx.fill();
  ctx.strokeStyle = adult.alert ? "rgba(239, 120, 109, 0.68)" : colors.sightEdge;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,247,226,0.34)";
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.arc(ax, ay, 1.45 * TILE, angle - 0.28, angle + 0.28);
  ctx.closePath();
  ctx.fill();
}

function drawNoise(noise) {
  const progress = 1 - noise.timer / noise.duration;
  const x = noise.x * TILE;
  const y = noise.y * TILE;
  ctx.strokeStyle = noise.masked ? `rgba(255, 247, 226, ${0.42 * (1 - progress)})` : `rgba(79, 158, 220, ${0.45 * (1 - progress)})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, noise.radius * TILE * progress, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 247, 226, ${0.3 * (1 - progress)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, noise.radius * TILE * Math.max(0, progress - 0.18), 0, Math.PI * 2);
  ctx.stroke();
}

function drawRainOverlay(viewW, viewH) {
  if (state.level < 4) return;
  ctx.save();
  ctx.strokeStyle = colors.rain;
  ctx.lineWidth = 1.4;
  const drift = (performance.now() / 22) % 36;
  for (let x = -40; x < viewW + 40; x += 28) {
    for (let y = -40; y < viewH + 40; y += 36) {
      ctx.beginPath();
      ctx.moveTo(x + drift, y + drift);
      ctx.lineTo(x + drift - 9, y + drift + 19);
      ctx.stroke();
    }
  }
  if (state.thunderFlash > 0) {
    ctx.fillStyle = `rgba(255, 247, 226, ${0.22 * state.thunderFlash})`;
    ctx.fillRect(0, 0, viewW, viewH);
  }
  ctx.restore();
}

function drawAdult(adult) {
  const x = (adult.x + 0.5) * TILE;
  const y = (adult.y + 0.5) * TILE;
  ctx.fillStyle = colors.shadow;
  ctx.beginPath();
  ctx.ellipse(x, y + 15, 18, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.adultDark;
  ctx.beginPath();
  ctx.arc(x, y + 2, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = adult.alert ? colors.alert : adult.color;
  ctx.beginPath();
  ctx.arc(x, y - 2, 16, 0, Math.PI * 2);
  ctx.fill();
  if (adult.role === "listener") {
    ctx.strokeStyle = "#fff7e9";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x - 11, y - 18, 5, -0.4, 1.4);
    ctx.arc(x + 11, y - 18, 5, 1.7, 3.6);
    ctx.stroke();
  } else {
    ctx.fillStyle = "rgba(255,247,226,0.85)";
    roundRect(x - 11, y - 20, 22, 5, 3);
  }
  ctx.fillStyle = "#f1caa8";
  ctx.beginPath();
  ctx.arc(x + adult.dir.x * 10, y + adult.dir.y * 10, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff7e9";
  ctx.beginPath();
  ctx.arc(x + adult.dir.x * 12 - adult.dir.y * 4, y + adult.dir.y * 12 + adult.dir.x * 4, 2.6, 0, Math.PI * 2);
  ctx.arc(x + adult.dir.x * 12 + adult.dir.y * 4, y + adult.dir.y * 12 - adult.dir.x * 4, 2.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawBurglar() {
  if (state.level < 5 || state.burglarCaught) return;
  const x = burglar.x * TILE;
  const y = burglar.y * TILE;
  const wobble = Math.sin(performance.now() / 140) * 2;
  ctx.fillStyle = colors.shadow;
  ctx.beginPath();
  ctx.ellipse(x, y + 15, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.burglar;
  ctx.beginPath();
  ctx.arc(x, y - 1 + wobble, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.burglarStripe;
  ctx.fillRect(x - 12, y - 8 + wobble, 24, 4);
  ctx.fillRect(x - 13, y + 2 + wobble, 26, 4);
  ctx.fillStyle = "#2f2735";
  roundRect(x - 13, y - 21 + wobble, 26, 8, 4);
  ctx.fillStyle = "#f1caa8";
  ctx.beginPath();
  ctx.arc(x, y - 11 + wobble, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2f2735";
  ctx.beginPath();
  ctx.arc(x - 3, y - 12 + wobble, 1.7, 0, Math.PI * 2);
  ctx.arc(x + 3, y - 12 + wobble, 1.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2f2735";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y - 8 + wobble, 4, 1.1 * Math.PI, 1.9 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "#6f4f93";
  roundRect(x + 10, y + 1 + wobble, 10, 14, 4);
  if (burglar.scare > 0) {
    ctx.fillStyle = "rgba(255,247,226,0.94)";
    roundRect(x - 18, y - 43, 36, 18, 8);
    ctx.fillStyle = colors.burglar;
    ctx.font = "900 12px Trebuchet MS, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", x, y - 34);
  }
}

function drawDistractionItem(item) {
  if (item.used || item.carried) return;
  drawToyMarker(item.x, item.y, item.kind, false);
}

function drawActiveDistraction(item) {
  const pulse = Math.sin(performance.now() / 130) * 0.5 + 0.5;
  drawToyMarker(item.x, item.y, item.kind, true, pulse);
}

function drawToyMarker(x, y, kind, active, pulse = 0) {
  const px = x * TILE;
  const py = y * TILE;
  const color = kind === "music" ? colors.music : kind === "bounce" ? colors.clue : colors.toy;
  ctx.fillStyle = active ? `rgba(255, 247, 226, ${0.24 + pulse * 0.14})` : "rgba(255, 247, 226, 0.2)";
  ctx.beginPath();
  ctx.arc(px, py, active ? 24 + pulse * 8 : 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(47, 39, 53, 0.17)";
  ctx.beginPath();
  ctx.ellipse(px + 2, py + 12, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  if (kind === "music") {
    roundRect(px - 13, py - 11, 26, 22, 6);
    ctx.fillStyle = "#fff7e9";
    ctx.fillRect(px - 7, py - 4, 14, 3);
    ctx.beginPath();
    ctx.arc(px + 7, py + 4, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "bounce") {
    ctx.beginPath();
    ctx.arc(px, py, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff7e9";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py, 8, -0.7, 1.2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(px - 7, py - 11, 5, 0, Math.PI * 2);
    ctx.arc(px + 7, py - 11, 5, 0, Math.PI * 2);
    ctx.arc(px, py, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff7e9";
    ctx.beginPath();
    ctx.arc(px - 4, py - 2, 2, 0, Math.PI * 2);
    ctx.arc(px + 4, py - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPuppy() {
  if (state.level < 2) return;
  const x = puppy.x * TILE;
  const y = puppy.y * TILE;
  const wag = Math.sin(puppy.wag * 12) * (puppy.excitement > 60 ? 8 : 4);
  const bounce = puppy.napTimer > 0 ? 0 : Math.sin(puppy.wag * 9) * 1.6;
  ctx.fillStyle = colors.shadow;
  ctx.beginPath();
  ctx.ellipse(x, y + 15, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = colors.poodleCream;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + 13, y - 3 + bounce);
  ctx.quadraticCurveTo(x + 24, y - 20 + wag + bounce, x + 30, y - 8 + wag + bounce);
  ctx.stroke();
  ctx.lineCap = "butt";

  ctx.fillStyle = colors.poodleCream;
  ctx.beginPath();
  ctx.ellipse(x, y + 2 + bounce, 18, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  drawPoodleFluff(x - 13, y + 1 + bounce, 7);
  drawPoodleFluff(x, y + 3 + bounce, 8);
  drawPoodleFluff(x + 13, y + 1 + bounce, 7);

  ctx.fillStyle = colors.poodleFluff;
  ctx.beginPath();
  ctx.ellipse(x - 16, y + 9 + bounce, 4, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 5, y + 10 + bounce, 4, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 8, y + 10 + bounce, 4, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 17, y + 9 + bounce, 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors.poodleCream;
  ctx.beginPath();
  ctx.ellipse(x, y - 10 + bounce, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  drawPoodleFluff(x - 7, y - 18 + bounce, 7);
  drawPoodleFluff(x, y - 21 + bounce, 8);
  drawPoodleFluff(x + 7, y - 18 + bounce, 7);

  ctx.fillStyle = "#d2a978";
  ctx.beginPath();
  ctx.ellipse(x - 12, y - 10 + bounce, 5, 9, -0.35, 0, Math.PI * 2);
  ctx.ellipse(x + 12, y - 10 + bounce, 5, 9, 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2f2735";
  ctx.beginPath();
  ctx.arc(x - 4, y - 12 + bounce, 1.7, 0, Math.PI * 2);
  ctx.arc(x + 4, y - 12 + bounce, 1.7, 0, Math.PI * 2);
  ctx.arc(x, y - 7 + bounce, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2f2735";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y - 6 + bounce, 5, 0.14 * Math.PI, 0.86 * Math.PI);
  ctx.stroke();

  if (puppy.napTimer > 0) {
    ctx.fillStyle = "rgba(255,247,226,0.94)";
    roundRect(x - 14, y - 42, 28, 17, 8);
    ctx.fillStyle = colors.puppyDark;
    ctx.font = "900 12px Trebuchet MS, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("zzz", x, y - 33);
    return;
  }
  if (puppy.excitement > 72) {
    ctx.fillStyle = "rgba(255,247,226,0.92)";
    roundRect(x - 18, y - 38, 36, 18, 8);
    ctx.fillStyle = colors.puppyDark;
    ctx.font = "900 12px Trebuchet MS, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("woof", x, y - 29);
  }
}

function drawPoodleFluff(x, y, r) {
  ctx.fillStyle = colors.poodleFluff;
  ctx.beginPath();
  ctx.arc(x - r * 0.45, y, r * 0.62, 0, Math.PI * 2);
  ctx.arc(x + r * 0.35, y - r * 0.25, r * 0.68, 0, Math.PI * 2);
  ctx.arc(x + r * 0.1, y + r * 0.35, r * 0.62, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer() {
  const x = player.x * TILE;
  const y = player.y * TILE;
  ctx.globalAlpha = player.hidden ? 0.55 : 1;
  ctx.fillStyle = colors.shadow;
  ctx.beginPath();
  ctx.ellipse(x, y + 15, 16, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2d8b78";
  ctx.beginPath();
  ctx.arc(x, y + 2, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.child;
  ctx.beginPath();
  ctx.arc(x, y - 2, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.childTrim;
  roundRect(x - 9, y - 2, 18, 16, 5);
  ctx.fillStyle = "#f1b67e";
  ctx.beginPath();
  ctx.arc(x, y - 6, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2f2735";
  ctx.beginPath();
  ctx.arc(x - 3.5, y - 7, 1.8, 0, Math.PI * 2);
  ctx.arc(x + 3.5, y - 7, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2f2735";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y - 5, 4, 0.18 * Math.PI, 0.82 * Math.PI);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawHidingSpots() {
  hidingSpots.forEach((spot) => {
    ctx.fillStyle = "rgba(47, 39, 53, 0.16)";
    roundRect((spot.x - 0.5) * TILE + 4, (spot.y - 0.5) * TILE + 6, TILE, TILE, 13);
    ctx.fillStyle = colors.hide;
    roundRect((spot.x - 0.48) * TILE, (spot.y - 0.48) * TILE, TILE * 0.96, TILE * 0.96, 12);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect((spot.x - 0.28) * TILE, (spot.y - 0.32) * TILE, 6, TILE * 0.64);
    ctx.fillRect((spot.x + 0.05) * TILE, (spot.y - 0.32) * TILE, 6, TILE * 0.64);
    ctx.strokeStyle = "rgba(255,255,255,0.72)";
    ctx.lineWidth = 3;
    ctx.strokeRect((spot.x - 0.32) * TILE, (spot.y - 0.32) * TILE, TILE * 0.64, TILE * 0.64);
  });
}

function drawNapZones() {
  if (state.level < 3) return;
  napZones.forEach((zone) => {
    const x = zone.x * TILE;
    const y = zone.y * TILE;
    const pulse = Math.sin(performance.now() / 420) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(112, 199, 143, ${0.16 + pulse * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 34, 23, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(79, 158, 220, 0.5)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y, 27, 17, -0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fff7e9";
    ctx.font = "900 13px Trebuchet MS, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Z", x, y);
  });
}

function drawCrumb(crumb) {
  const x = crumb.x * TILE;
  const y = crumb.y * TILE;
  ctx.fillStyle = "rgba(47, 39, 53, 0.14)";
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 6, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d99b51";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.arc(x + 7, y + 3, 3.5, 0, Math.PI * 2);
  ctx.arc(x - 6, y + 2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,247,226,0.7)";
  ctx.beginPath();
  ctx.arc(x + 1, y - 1, 1.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawSearchSpot(spot) {
  const checked = state.searched.has(spot.id);
  const isRecent = state.nearMiss === spot.id;
  const isFound = state.won && spot.id === treasureSpot.id;
  const hasFoundPiece = checked && spot.pieceSymbol && state.pieces.has(spot.id);
  const pulse = isFound ? Math.sin(performance.now() / 180) : 0;
  const x = spot.x * TILE;
  const y = spot.y * TILE;

  ctx.fillStyle = isFound
    ? "rgba(245, 189, 63, 0.28)"
    : checked
      ? "rgba(85, 72, 78, 0.12)"
      : "rgba(255, 247, 226, 0.24)";
  ctx.beginPath();
  ctx.arc(x, y, isFound ? 31 + pulse * 5 : isRecent ? 24 : 19, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isFound ? colors.goal : hasFoundPiece ? colors.piece : checked ? "#9f9280" : colors.clue;
  ctx.beginPath();
  ctx.arc(x, y, isFound ? 15 : 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = checked ? "rgba(79,68,74,0.34)" : colors.clueEdge;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#fff7e9";
  ctx.font = "800 15px Trebuchet MS, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(isFound ? "!" : hasFoundPiece ? symbolGlyphs[spot.pieceSymbol] : checked ? "x" : "?", x, y + 0.5);

  if (isFound) {
    ctx.strokeStyle = "rgba(255, 247, 226, 0.9)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 23 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function loop(time) {
  const dt = Math.min(0.05, (time - state.lastTime) / 1000 || 0);
  state.lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function showDialog(title, text, buttonText, onClick) {
  state.playing = false;
  dialogTitle.textContent = title;
  dialogText.textContent = text;
  dialogButton.textContent = buttonText;
  dialogButton.onclick = () => onClick();
  lockPanel.classList.add("hidden");
  levelPanel.classList.remove("hidden");
  renderLevelPanel();
  dialogButton.classList.remove("hidden");
  dialog.classList.remove("hidden");
}

function renderLevelPanel() {
  levelChoices.innerHTML = "";
  levelNames.forEach((name, index) => {
    const level = index + 1;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = level <= state.unlockedLevel ? `${level}. ${name}` : `${level}. Locked`;
    button.disabled = level > state.unlockedLevel;
    button.addEventListener("click", () => start(level));
    levelChoices.appendChild(button);
  });

  stickerShelf.innerHTML = "";
  const title = document.createElement("div");
  title.className = "sticker-title";
  title.textContent = "Sticker Shelf";
  stickerShelf.appendChild(title);
  Object.entries(stickerCatalog).forEach(([id, sticker]) => {
    const badge = document.createElement("span");
    const earned = state.stickers.has(id);
    badge.className = earned ? "sticker earned" : "sticker";
    badge.textContent = earned ? sticker.mark : "--";
    badge.title = sticker.label;
    stickerShelf.appendChild(badge);
  });
}

function showLevelSelect(title = "Choose a Level", text = "Replay an unlocked level or continue your newest adventure.") {
  state.playing = false;
  dialogTitle.textContent = title;
  dialogText.textContent = text;
  dialogButton.textContent = "Continue";
  dialogButton.onclick = () => start(state.unlockedLevel);
  lockPanel.classList.add("hidden");
  levelPanel.classList.remove("hidden");
  renderLevelPanel();
  dialog.classList.remove("hidden");
}

function showLockDialog() {
  state.playing = false;
  state.lockInput = [];
  dialogTitle.textContent = "Unlock the Chest";
  dialogText.textContent = "Tap the three symbols from the board-game pieces. Missing pieces can still be guessed.";
  dialogButton.textContent = "Keep searching";
  dialogButton.onclick = () => {
    dialog.classList.add("hidden");
    state.playing = true;
    showMessage("Find more pieces or try the chest lock again.", 2);
  };
  lockPanel.classList.remove("hidden");
  levelPanel.classList.add("hidden");
  renderLockPanel();
  dialog.classList.remove("hidden");
}

function renderLockPanel() {
  lockClues.innerHTML = "";
  pieceSpots.forEach((spot, index) => {
    const clue = document.createElement("span");
    const found = state.pieces.has(spot.id);
    clue.textContent = found ? `${index + 1}: ${symbolGlyphs[spot.pieceSymbol]}` : `${index + 1}: ?`;
    clue.className = found ? "found" : "";
    lockClues.appendChild(clue);
  });
  lockCode.textContent = [0, 1, 2].map((index) => symbolGlyphs[state.lockInput[index]] || "_").join(" ");
  lockChoices.innerHTML = "";
  lockSymbols.forEach((symbol) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = symbolGlyphs[symbol];
    button.setAttribute("aria-label", symbol);
    button.addEventListener("click", () => chooseLockSymbol(symbol));
    lockChoices.appendChild(button);
  });
}

function chooseLockSymbol(symbol) {
  if (state.lockInput.length >= 3) state.lockInput = [];
  state.lockInput.push(symbol);
  tone(520 + state.lockInput.length * 80, 0.05);
  if (state.lockInput.length === 3) {
    if (state.lockInput.every((entry, index) => entry === lockCodeSymbols[index])) {
      completeWin();
      return;
    }
    showMessage("The lock clicks softly, but not open. Try the piece order again.", 2.4);
    state.lockInput = [];
  }
  renderLockPanel();
}

function start(level = 1) {
  state.level = level;
  pickRun();
  player.x = 1.5;
  player.y = 10.5;
  puppy.x = puppy.startX;
  puppy.y = puppy.startY;
  puppy.excitement = level >= 2 ? 18 : 0;
  puppy.barkCooldown = 2.2;
  puppy.napTimer = 0;
  puppy.napCooldown = 0;
  puppy.wag = 0;
  state.calm = 100;
  state.searches = 0;
  state.searched.clear();
  state.pieces.clear();
  state.carriedItem = null;
  state.droppedDistractions = [];
  state.nearMiss = null;
  state.noises = [];
  state.distractionsUsed = 0;
  state.spotted = 0;
  state.puppyBarks = 0;
  state.crumbs = [];
  state.crumbsLeft = level >= 3 ? 5 : 0;
  state.crumbsUsed = 0;
  state.puppyNaps = 0;
  state.thunderTimer = 0;
  state.thunderCooldown = level >= 4 ? 3.2 : 0;
  state.thunderCount = 0;
  state.thunderFlash = 0;
  state.burglarCaught = false;
  state.burglarCommands = 0;
  state.wasSeen = false;
  state.lockInput = [];
  state.won = false;
  distractionItems.forEach((item) => {
    item.x = item.startX;
    item.y = item.startY;
    item.carried = false;
    item.used = false;
    item.cooldown = 0;
  });
  adults.forEach((adult) => {
    adult.x = adult.start.x;
    adult.y = adult.start.y;
    adult.target = 1;
    adult.dir = { ...adult.start.dir };
    adult.alert = null;
    adult.pause = 0;
    adult.scan = 0;
  });
  burglar.x = burglar.startX;
  burglar.y = burglar.startY;
  burglar.target = 0;
  burglar.caught = false;
  burglar.scare = 0;
  calmFill.style.transform = "scaleX(1)";
  updateObjective();
  dialog.classList.add("hidden");
  showMessage(
    level >= 5
      ? "Level 5: a burglar sneaks in. Use Fetch to send the poodle after them."
      : level >= 4
      ? "Level 4: thunder masks noise, but the poodle gets nervous."
      : level >= 3
      ? "Level 3: place snack crumbs with Toy and guide the puppy to nap zones."
      : level >= 2
      ? "Level 2: the puppy wants to play. Pet it with Toy before it barks."
      : "Find pieces, search for the chest, then unlock it quietly.",
    3.6,
  );
  state.playing = true;
}

function findChest() {
  if (state.level >= 5 && !state.burglarCaught) {
    state.won = true;
    showMessage("The chest is safe, but the burglar is still sneaking. Use the poodle first.", 3);
    return;
  }
  state.won = true;
  tone(880, 0.12);
  showMessage(`The chest was hidden in the ${treasureSpot.place}. Now unlock it.`, 2.2);
  showLockDialog();
}

function rating() {
  if (secretEndingUnlocked()) return "Family Game Night";
  if (state.calm >= 80 && state.searches <= 7 && state.spotted <= 1 && state.pieces.size === 3) return "Master Tiptoer";
  if (state.calm >= 55 && state.spotted <= 3) return "Quiet Sneaker";
  return "Brave Finder";
}

function secretEndingUnlocked() {
  return state.level >= 4 && state.pieces.size === 3 && state.calm >= 82 && state.spotted <= 1 && state.puppyBarks <= 1;
}

function awardStickers() {
  const earned = [];
  if (state.spotted === 0 && state.calm >= 70) earned.push("quietShoes");
  if (state.level >= 2 && state.puppyBarks === 0) earned.push("poodlePal");
  if (state.level >= 3 && state.puppyNaps > 0) earned.push("snackGenius");
  if (state.level >= 4 && state.thunderCount > 0 && state.spotted <= 2) earned.push("thunderTimer");
  if (state.level >= 5 && state.burglarCaught) earned.push("poodlePatrol");
  if (rating() === "Master Tiptoer") earned.push("masterTiptoer");
  if (secretEndingUnlocked()) earned.push("gameNight");
  state.earnedStickers = earned.filter((id) => !state.stickers.has(id));
  earned.forEach((id) => state.stickers.add(id));
  saveProgress();
}

function stickerText() {
  if (state.earnedStickers.length === 0) return "\nStickers earned: none this run";
  return `\nStickers earned: ${state.earnedStickers.map((id) => stickerCatalog[id].label).join(", ")}`;
}

function scoreText() {
  const perfect = state.pieces.size === 3 ? "Complete board game ending!" : "Board game found, with pieces still missing.";
  const puppyLine = state.level >= 2 ? `\nPuppy barks: ${state.puppyBarks}` : "";
  const snackLine = state.level >= 3 ? `\nSnack crumbs used: ${state.crumbsUsed}\nPuppy naps: ${state.puppyNaps}` : "";
  const rainLine = state.level >= 4 ? `\nThunder rumbles: ${state.thunderCount}` : "";
  const burglarLine = state.level >= 5 ? `\nBurglar caught: ${state.burglarCaught ? "yes" : "no"}\nFetch commands: ${state.burglarCommands}` : "";
  return `Level ${state.level} complete!
${perfect}

Rating: ${rating()}
Calm left: ${Math.round(state.calm)}%
Searches: ${state.searches}
Distractions used: ${state.distractionsUsed}
Times spotted: ${state.spotted}
Board-game pieces: ${state.pieces.size}/3${puppyLine}${snackLine}${rainLine}${burglarLine}`;
}

function completeWin() {
  state.won = true;
  tone(980, 0.14);
  unlockLevel(state.level + 1);
  awardStickers();
  const resultText = `${scoreText()}${stickerText()}`;
  if (state.level === 1) {
    showDialog("Level 1 Cleared!", `${resultText}

Next: Puppy Wants to Play. The puppy follows you, gets excited, and may bark unless you calm it with Toy.`, "Level 2", () => start(2));
    return;
  }
  if (state.level === 2) {
    showDialog("Level 2 Cleared!", `${resultText}

Next: Snack Trail. Place crumbs with Toy to guide the puppy into cozy nap zones.`, "Level 3", () => start(3));
    return;
  }
  if (state.level === 3) {
    showDialog("Level 3 Cleared!", `${resultText}

Next: Rainy Day. Thunder hides noisy searches, but the poodle gets nervous and may bark.`, "Level 4", () => start(4));
    return;
  }
  if (state.level === 4) {
    showDialog("Level 4 Cleared!", `${resultText}

Next: Poodle Patrol. A burglar sneaks in, and the poodle can catch them with Fetch.`, "Level 5", () => start(5));
    return;
  }
  if (secretEndingUnlocked()) {
    showDialog("Family Game Night!", `${resultText}

Secret ending unlocked: everyone gathers around the table, the poodle curls up beside the box, and the hidden board game becomes the best rainy-day surprise.`, "Play again", () => start(1));
    return;
  }
  showDialog("Treasure Unlocked!", resultText, "Play again", () => start(1));
}

function lose() {
  const puppyLine = state.level >= 2 ? `\nPuppy barks: ${state.puppyBarks}` : "";
  const snackLine = state.level >= 3 ? `\nSnack crumbs used: ${state.crumbsUsed}\nPuppy naps: ${state.puppyNaps}` : "";
  const rainLine = state.level >= 4 ? `\nThunder rumbles: ${state.thunderCount}` : "";
  const burglarLine = state.level >= 5 ? `\nBurglar caught: ${state.burglarCaught ? "yes" : "no"}\nFetch commands: ${state.burglarCommands}` : "";
  showDialog("Take a breath", `You were spotted for too long. Try hiding, waiting, and moving after the sight cone passes.

Calm left: ${Math.round(state.calm)}%
Searches: ${state.searches}
Distractions used: ${state.distractionsUsed}
Times spotted: ${state.spotted}
Board-game pieces: ${state.pieces.size}/3${puppyLine}${snackLine}${rainLine}${burglarLine}`, "Try again", () => start(state.level));
}

let audioContext;
function tone(freq, seconds) {
  if (!state.sound) return;
  const BrowserAudioContext = window.AudioContext || window.webkitAudioContext;
  if (!BrowserAudioContext) return;
  audioContext ||= new BrowserAudioContext();
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.frequency.value = freq;
  gain.gain.value = 0.035;
  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + seconds);
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
  if (event.key === " " || event.key === "Enter") interact();
  if (event.key.toLowerCase() === "e") useDistraction();
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
document.querySelectorAll(".touch-pad button").forEach((button) => {
  const dir = button.dataset.dir;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    pressedDirs.add(dir);
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener("pointerup", () => pressedDirs.delete(dir));
  button.addEventListener("pointercancel", () => pressedDirs.delete(dir));
  button.addEventListener("pointerleave", () => pressedDirs.delete(dir));
});
actionBtn.addEventListener("click", interact);
distractBtn.addEventListener("click", useDistraction);
soundBtn.addEventListener("click", () => {
  state.sound = !state.sound;
  soundBtn.textContent = state.sound ? "On" : "Snd";
  tone(520, 0.06);
});
shareBtn.addEventListener("click", shareGame);

async function shareGame() {
  const shareData = {
    title: "Tiptoe Treasure",
    text: "Play Tiptoe Treasure, a cozy stealth search game.",
    url: window.location.href,
  };
  try {
    if (navigator.share && !window.location.protocol.startsWith("file")) {
      await navigator.share(shareData);
      showMessage("Shared from your phone.", 1.8);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    showMessage("Game link copied.", 1.8);
  } catch {
    showMessage("Host this folder online, then share that link.", 2.6);
  }
}

if ("serviceWorker" in navigator && !window.location.protocol.startsWith("file")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

setupMap();
resize();
loadProgress();
showLevelSelect(
  "Tiptoe Treasure",
  "Search the cozy house, unlock new levels, and collect stickers for quiet, clever runs.",
);
requestAnimationFrame(loop);
