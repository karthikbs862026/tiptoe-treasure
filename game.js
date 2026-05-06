const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const promptEl = document.querySelector("#prompt");
const objectiveEl = document.querySelector("#objective");
const calmFill = document.querySelector("#calmFill");
const dialog = document.querySelector("#dialog");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogText = document.querySelector("#dialogText");
const dialogButton = document.querySelector("#dialogButton");
const actionBtn = document.querySelector("#actionBtn");
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
let treasureSpot = searchSpots[0];

const adults = [
  {
    x: 8,
    y: 2,
    dir: { x: 1, y: 0 },
    alert: null,
    path: [
      [8, 2],
      [12, 2],
      [12, 5],
      [8, 5],
    ],
    target: 1,
    pause: 0,
  },
  {
    x: 12,
    y: 9,
    dir: { x: 0, y: -1 },
    alert: null,
    path: [
      [12, 9],
      [16, 9],
      [16, 6],
      [12, 6],
    ],
    target: 1,
    pause: 0,
  },
];

const player = {
  x: 1.5,
  y: 10.5,
  speed: 3.15,
  radius: 0.28,
  hidden: false,
};

const state = {
  playing: false,
  won: false,
  calm: 100,
  searches: 0,
  searched: new Set(),
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

function updateAdults(dt) {
  adults.forEach((adult) => {
    if (adult.alert) {
      updateAlertAdult(adult, dt);
      return;
    }
    if (adult.pause > 0) {
      adult.pause -= dt;
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
      adult.pause = 0.65;
      return;
    }
    adult.dir = { x: vx / len, y: vy / len };
    adult.x += adult.dir.x * 1.15 * dt;
    adult.y += adult.dir.y * 1.15 * dt;
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

  if (adult.alert.timer < 1.25 && len > 0.45) {
    moveEntity(adult, adult.dir.x * 1.55, adult.dir.y * 1.55, dt);
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
}

function searchHint(spot) {
  const d = distance(spot, treasureSpot);
  if (d < 2.2) return "Very warm. The board game must be close.";
  if (d < 4.3) return "Warm. This side of the house feels promising.";
  if (d < 6.3) return "Cool. Try another nearby room.";
  return "Cold. The hiding place is probably far from here.";
}

function makeNoise(source, strength = 1) {
  state.noises.push({
    x: source.x,
    y: source.y,
    timer: 0.75,
    duration: 0.75,
    radius: 3.4 + strength * 1.6,
  });
  return alertAdults(source, strength);
}

function alertAdults(source, strength) {
  let heard = 0;
  adults.forEach((adult) => {
    const adultCenter = { x: adult.x + 0.5, y: adult.y + 0.5 };
    const hearingRange = 4.9 + strength * 1.6;
    if (distance(adultCenter, source) <= hearingRange) {
      adult.alert = {
        x: source.x,
        y: source.y,
        timer: 2.2,
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
  if (dist > 4.1 || dist < 0.1) return false;
  const dot = (vx / dist) * adult.dir.x + (vy / dist) * adult.dir.y;
  if (dot < 0.63) return false;
  const steps = Math.ceil(dist * 8);
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    if (walls.has(`${Math.floor(ax + vx * t)},${Math.floor(ay + vy * t)}`)) return false;
  }
  return true;
}

function interact() {
  if (!state.playing) return;
  const nearbySpot = searchSpots.find((spot) => distance(player, spot) < 1.05);
  if (nearbySpot) {
    if (state.searched.has(nearbySpot.id)) {
      showMessage(`You already checked the ${nearbySpot.place}.`, 1.8);
      return;
    }
    state.searches += 1;
    state.searched.add(nearbySpot.id);
    const heard = makeNoise(nearbySpot, 1);
    if (nearbySpot.id === treasureSpot.id) {
      win();
      return;
    }
    state.nearMiss = nearbySpot.id;
    state.calm = Math.max(0, state.calm - (heard ? 8 : 5));
    const warning = heard ? " Someone heard that." : "";
    showMessage(`Not in the ${nearbySpot.place}. ${searchHint(nearbySpot)}${warning}`, heard ? 3.8 : 3.1);
    updateObjective();
    tone(440, 0.06);
    return;
  }
  const spot = hidingSpots.find((hide) => distance(player, hide) < 1);
  if (spot) {
    showMessage(`You tuck into the ${spot.label}. Quiet as a moonbeam.`, 2.2);
    return;
  }
  showMessage("Move next to a marked object, then tap Search.", 1.7);
}

function updateObjective() {
  const left = searchSpots.length - state.searched.size;
  objectiveEl.textContent = `Search quietly. ${left} possible spots left.`;
  actionBtn.textContent = "Search";
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
  updateAdults(dt);
  state.noises = state.noises
    .map((noise) => ({ ...noise, timer: noise.timer - dt }))
    .filter((noise) => noise.timer > 0);
  if (adults.some(canSee)) {
    state.calm = Math.max(0, state.calm - 34 * dt);
    if (state.calm <= 0) lose();
  } else {
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
  searchSpots.forEach(drawSearchSpot);
  adults.forEach(drawAdult);
  drawPlayer();

  ctx.restore();
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
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.arc(ax, ay, 4.1 * TILE, angle - 0.75, angle + 0.75);
  ctx.closePath();
  ctx.fillStyle = colors.sight;
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
  ctx.strokeStyle = `rgba(79, 158, 220, ${0.45 * (1 - progress)})`;
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
  ctx.fillStyle = adult.alert ? colors.alert : colors.adult;
  ctx.beginPath();
  ctx.arc(x, y - 2, 16, 0, Math.PI * 2);
  ctx.fill();
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

function drawSearchSpot(spot) {
  const checked = state.searched.has(spot.id);
  const isRecent = state.nearMiss === spot.id;
  const isFound = state.won && spot.id === treasureSpot.id;
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

  ctx.fillStyle = isFound ? colors.goal : checked ? "#9f9280" : colors.clue;
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
  ctx.fillText(isFound ? "!" : checked ? "x" : "?", x, y + 0.5);

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
  dialogButton.onclick = onClick;
  dialog.classList.remove("hidden");
}

function start() {
  pickRun();
  player.x = 1.5;
  player.y = 10.5;
  state.calm = 100;
  state.searches = 0;
  state.searched.clear();
  state.nearMiss = null;
  state.noises = [];
  state.won = false;
  adults[0].x = 8;
  adults[0].y = 2;
  adults[0].target = 1;
  adults[0].dir = { x: 1, y: 0 };
  adults[0].alert = null;
  adults[0].pause = 0;
  adults[1].x = 12;
  adults[1].y = 9;
  adults[1].target = 1;
  adults[1].dir = { x: 0, y: -1 };
  adults[1].alert = null;
  adults[1].pause = 0;
  calmFill.style.transform = "scaleX(1)";
  updateObjective();
  dialog.classList.add("hidden");
  showMessage("Search carefully. Noise can make grown-ups turn and investigate.", 3.2);
  state.playing = true;
}

function win() {
  state.won = true;
  tone(880, 0.12);
  showDialog("Found it!", `The board game was hidden in the ${treasureSpot.place}. You found it after ${state.searches} searches and kept your cool.`, "Play again", start);
}

function lose() {
  showDialog("Take a breath", "You were spotted for too long. Try hiding, waiting, and moving after the sight cone passes.", "Try again", start);
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
showDialog(
  "Tiptoe Treasure",
  "Search the cozy house for a hidden board game. Checking objects makes noise, so use warmer or colder hints and hide when grown-ups turn your way.",
  "Start",
  start,
);
requestAnimationFrame(loop);
