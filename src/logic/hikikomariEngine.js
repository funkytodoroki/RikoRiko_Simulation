export const SPEC = {
  normalOdds: 348,
  czEntryOdds: 129,
  rushOdds: 99,
  czSpins: 10,
  supportSpins: 144,
  yenPerUnit: 1000,
  ballsPerUnit: 250,
  czSuccessTargetRate: 0.33,
};

const CZ_SUCCESS_PER_SPIN =
  1 - (1 - SPEC.czSuccessTargetRate) ** (1 / SPEC.czSpins);

const MODE_LABELS = {
  normal: "通常",
  cz: "烈核解放CZ",
  rush: "超孤紅の恤RUSH",
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
    } else if (Math.random() < 1 / SPEC.czEntryOdds) {
      enterCz(s);
    }

    return s;
  }

  if (s.mode === "cz") {
    advanceSupportSpin(s);

    if (Math.random() < CZ_SUCCESS_PER_SPIN) {
      czSuccess(s);
    } else if (s.supportLeft <= 0) {
      leaveCz(s);
    }

    return s;
  }

  advanceSupportSpin(s);

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

function advanceSupportSpin(s) {
  s.spins += 1;
  s.totalSpins += 1;
  s.currentRushSpins += 1;
  s.supportLeft -= 1;
}

function enterCz(s) {
  s.mode = "cz";
  s.supportLeft = SPEC.czSpins;
  s.currentRushSpins = 0;
  s.spins = 0;
  s.lastEvent = "烈核解放CZ突入";
  addHistory(s, {
    category: "CZ",
    type: "烈核解放CZ突入",
    payout: 0,
  });
  addGraphPoint(s, "烈核解放CZ突入");
}

function leaveCz(s) {
  s.mode = "normal";
  s.supportLeft = 0;
  s.currentRushSpins = 0;
  s.currentNormalSpins = 0;
  s.spins = 0;
  s.lastEvent = "烈核解放CZ終了 通常へ";
  addHistory(s, {
    category: "CZ",
    type: "烈核解放CZ終了 通常へ",
    payout: 0,
  });
  addGraphPoint(s, "烈核解放CZ終了");
}

function normalHit(s) {
  resolveEntryHit(s, "通常大当たり");
}

function czSuccess(s) {
  resolveEntryHit(s, "烈核解放CZ成功");
}

function resolveEntryHit(s, prefix) {
  const r = Math.random() * 100;
  let payout = 1500;
  let label = `${prefix} 1500仮想玉 通常へ`;
  let rush = false;

  if (r < 7.3) {
    payout = 1800;
    label = `${prefix} 1800仮想玉 LT`;
    rush = true;
  } else if (r < 51) {
    payout = 1500;
    label = `${prefix} 1500仮想玉 LT`;
    rush = true;
  }

  s.firstHitCount += 1;
  s.totalHits += 1;
  s.balls += payout;

  if (rush) {
    enterRush(s);
  } else {
    s.mode = "normal";
    s.supportLeft = 0;
    s.currentRushSpins = 0;
  }

  finishHit(s, {
    category: prefix.includes("CZ") ? "CZ成功" : "初当たり",
    type: label,
    payout,
    rushEntered: rush,
  });
}

function enterRush(s) {
  s.rushCount += 1;
  resetRush(s);
  s.mode = "rush";
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
  s.lastEvent = "LT終了";
  addHistory(s, {
    category: "LT",
    type: "超孤紅の恤RUSH終了 通常へ",
    payout: 0,
  });
  addGraphPoint(s, "LT終了");
}

function rushHit(s) {
  const bonus = drawRushBonusChain();

  s.rushHitCount += 1;
  s.totalHits += 1;
  s.balls += bonus.payout;
  resetRush(s);
  s.mode = "rush";

  finishHit(s, {
    category: "LT",
    type: `${bonus.label} RUSHリセット`,
    payout: bonus.payout,
  });
}

function drawRushBonusChain() {
  const parts = [];
  let finalBonusName = "孤紅の恤BONUS";

  for (;;) {
    const r = Math.random() * 100;

    if (r < 6.25) {
      parts.push(6000);
      continue;
    }

    if (r < 25) {
      parts.push(4500);
      break;
    }

    if (r < 43.75) {
      parts.push(3000);
      break;
    }

    if (r < 50) {
      parts.push(1500);
      break;
    }

    parts.push(1500);
    finalBonusName = "吸血姫BONUS";
    break;
  }

  const payout = parts.reduce((sum, part) => sum + part, 0);
  const breakdown = parts.join("+");
  const label =
    parts.length > 1
      ? `${finalBonusName} ${payout}仮想玉 (${breakdown})`
      : `${finalBonusName} ${payout}仮想玉`;

  return { label, payout };
}

function finishHit(s, entry) {
  addHistory(s, entry);
  addGraphPoint(s, entry.type);
  s.currentNormalSpins = 0;
  s.spins = 0;
  s.lastEvent = entry.type;
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
