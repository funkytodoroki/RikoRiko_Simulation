export const SPEC = {
  normalOdds: 259.7,
  rushOdds: 97.1,
  supportSpins: 132,
  yenPerUnit: 1000,
  ballsPerUnit: 250,
  rushStartModeBRate: 0.3,
};

const MODE_LABELS = {
  normal: "通常",
  rushA: "RUSH A",
  rushB: "RUSH B",
};

export const createInitialState = () => ({
  mode: "normal",
  spins: 0,
  totalSpins: 0,
  normalSpins: 0,
  currentNormalSpins: 0,
  currentRushSpins: 0,
  normalSpendCounter: 0,
  history: [],
  graph: [{ x: 0, y: 0, label: "開始" }],
  money: 0,
  balls: 0,
  rushCount: 0,
  firstHitCount: 0,
  rushHitCount: 0,
  totalHits: 0,
  supportLeft: 0,
  lastEvent: "シミュレーション開始",
});

export const getModeLabel = (mode) => MODE_LABELS[mode] ?? mode;

export const spinOnce = (state, settings) => {
  const s = cloneState(state);

  if (s.mode === "normal") {
    advanceNormalSpin(s, settings);

    if (Math.random() < 1 / SPEC.normalOdds) {
      normalHit(s);
    }

    return s;
  }

  advanceRushSpin(s);

  if (Math.random() < 1 / SPEC.rushOdds) {
    rushHit(s);
  } else if (s.supportLeft <= 0) {
    leaveRush(s);
  }

  return s;
};

export const spinUntilHit = (state, settings, maxSpins = 10000) => {
  let s = cloneState(state);
  const startHits = s.totalHits;
  let spun = 0;

  while (s.totalHits === startHits && spun < maxSpins) {
    s = spinOnce(s, settings);
    spun += 1;
  }

  if (spun >= maxSpins && s.totalHits === startHits) {
    s.lastEvent = `${maxSpins.toLocaleString()}回転で大当たりなし`;
  }

  return s;
};

function cloneState(state) {
  return {
    ...state,
    history: [...state.history],
    graph: [...state.graph],
  };
}

function advanceNormalSpin(s, settings) {
  const base = Math.max(1, Number(settings.baseSpinsPer1000) || 1);

  s.spins += 1;
  s.totalSpins += 1;
  s.normalSpins += 1;
  s.currentNormalSpins += 1;
  s.normalSpendCounter += 1;

  while (s.normalSpendCounter >= base) {
    spendNormalUnit(s);
    s.normalSpendCounter -= base;
  }
}

function spendNormalUnit(s) {
  if (s.balls > 0) {
    s.balls = Math.max(0, s.balls - SPEC.ballsPerUnit);
    addGraphPoint(s, "持ち玉での仮想遊技");
    return;
  }

  s.money -= SPEC.yenPerUnit;
  s.balls -= SPEC.ballsPerUnit;
  addGraphPoint(s, "仮想消費");
}

function advanceRushSpin(s) {
  s.spins += 1;
  s.totalSpins += 1;
  s.currentRushSpins += 1;
  s.supportLeft -= 1;
}

function normalHit(s) {
  const r = Math.random() * 100;
  let payout;
  let label;
  let rush = false;

  if (r < 0.1) {
    payout = 1500;
    label = "通常大当たり 1500仮想玉 RUSH";
    rush = true;
  } else if (r < 45) {
    payout = 600;
    label = "通常大当たり 600仮想玉 RUSH";
    rush = true;
  } else if (r < 50) {
    payout = 310;
    label = "通常大当たり 310仮想玉 RUSH";
    rush = true;
  } else if (r < 80) {
    payout = 600;
    label = "通常大当たり 600仮想玉 通常へ";
  } else {
    payout = 310;
    label = "通常大当たり 310仮想玉 通常へ";
  }

  s.firstHitCount += 1;
  s.totalHits += 1;
  s.balls += payout;

  if (rush) {
    enterRush(s);
  } else {
    s.mode = "normal";
    s.supportLeft = 0;
  }

  addHistory(s, {
    category: "初当たり",
    type: label,
    payout,
    rushEntered: rush,
  });
  addGraphPoint(s, label);
  s.currentNormalSpins = 0;
  s.spins = 0;
  s.lastEvent = label;
}

function enterRush(s) {
  s.rushCount += 1;
  resetRush(s);
  s.mode = Math.random() < SPEC.rushStartModeBRate ? "rushB" : "rushA";
}

function resetRush(s) {
  s.supportLeft = SPEC.supportSpins;
  s.currentRushSpins = 0;
}

function leaveRush(s) {
  s.mode = "normal";
  s.supportLeft = 0;
  s.currentRushSpins = 0;
  s.currentNormalSpins = 0;
  s.spins = 0;
  s.lastEvent = "RUSH終了";
  addGraphPoint(s, "RUSH終了");
}

function rushHit(s) {
  if (s.mode === "rushA") {
    rushAHit(s);
    return;
  }

  if (s.mode === "rushB") {
    rushBHit(s);
  }
}

function rushAHit(s) {
  const payout = 750;
  const moveToB = Math.random() < 0.5;

  s.rushHitCount += 1;
  s.totalHits += 1;
  s.balls += payout;
  resetRush(s);
  s.mode = moveToB ? "rushB" : "rushA";

  const label = `RUSH A 750仮想玉 リセット${moveToB ? " モードBへ" : ""}`;
  addHistory(s, {
    category: "RUSH",
    type: label,
    payout,
  });
  addGraphPoint(s, label);
  s.spins = 0;
  s.lastEvent = label;
}

function rushBHit(s) {
  const isUltimate = Math.random() >= 0.5;

  if (!isUltimate) {
    const payout = 3000;
    const moveToA = Math.random() < 0.9;

    s.rushHitCount += 1;
    s.totalHits += 1;
    s.balls += payout;
    resetRush(s);
    s.mode = moveToA ? "rushA" : "rushB";

    const label = `RUSH B 3000仮想玉 リセット${moveToA ? " モードAへ" : ""}`;
    addHistory(s, {
      category: "RUSH",
      type: label,
      payout,
    });
    addGraphPoint(s, label);
    s.spins = 0;
    s.lastEvent = label;
    return;
  }

  const ultimateExtra = drawUltimateDrive();
  const payout = 6000 + ultimateExtra;
  const moveToA = Math.random() < 0.9;

  s.rushHitCount += 1;
  s.totalHits += 1;
  s.balls += payout;
  resetRush(s);
  s.mode = moveToA ? "rushA" : "rushB";

  const loopCount = ultimateExtra / 3000;
  const label = `アルティメットドライブ ${payout}仮想玉 (${loopCount}ループ)${
    moveToA ? " モードAへ" : ""
  }`;
  addHistory(s, {
    category: "アルティメット",
    type: label,
    payout,
  });
  addGraphPoint(s, label);
  s.spins = 0;
  s.lastEvent = label;
}

function drawUltimateDrive() {
  let payout = 0;

  while (Math.random() < 0.5) {
    payout += 3000;
  }

  return payout;
}

function addHistory(s, entry) {
  s.history.unshift({
    id: `${s.totalHits}-${s.totalSpins}-${Math.random().toString(36).slice(2)}`,
    totalSpin: s.totalSpins,
    spin: s.spins,
    modeAfter: getModeLabel(s.mode),
    ...entry,
  });
}

function addGraphPoint(s, label) {
  s.graph.push({
    x: s.normalSpins,
    y: s.balls,
    label,
  });
}
