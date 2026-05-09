export const SPEC = {
  normalOdds: 204,
  rushOdds: 99,
  supportSpins: 135,
  yenPerUnit: 1000,
  ballsPerUnit: 250,
  judgementEntryRate: 0.25,
  judgementSuccessRate: 0.5,
  tsuranukiLoopRate: 0.3,
  fateSuccessRate: 0.6,
};

const MODE_LABELS = {
  normal: "通常",
  rush: "RUSH",
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
    s.lastEvent = `${maxSpins.toLocaleString()}回転で当たりなし`;
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
    addGraphPoint(s, "持ち玉遊技");
    return;
  }

  s.money -= SPEC.yenPerUnit;
  s.balls -= SPEC.ballsPerUnit;
  addGraphPoint(s, "投資");
}

function advanceRushSpin(s) {
  s.spins += 1;
  s.totalSpins += 1;
  s.currentRushSpins += 1;
  s.supportLeft -= 1;
}

function normalHit(s) {
  s.firstHitCount += 1;
  s.totalHits += 1;

  if (Math.random() < SPEC.judgementEntryRate) {
    const chain = ["通常大当たり 1500個", "50/50ジャッジメント突入"];
    let payout = 1500;
    s.balls += 1500;

    const judgement = resolveJudgement(s, chain);
    payout += judgement.payout;

    finishHit(s, {
      category: "初当たり",
      type: chain.join(" → "),
      payout,
    });
    return;
  }

  s.balls += 300;
  s.mode = "normal";
  s.supportLeft = 0;

  finishHit(s, {
    category: "初当たり",
    type: "通常大当たり 300個 通常へ",
    payout: 300,
  });
}

function resolveJudgement(s, chain) {
  if (Math.random() < SPEC.judgementSuccessRate) {
    chain.push("50/50成功 7500個");
    s.balls += 7500;
    const tsuranuki = resolveTsuranuki(s, chain);
    return { payout: 7500 + tsuranuki.payout };
  }

  chain.push("50/50失敗 1500個 通常へ");
  s.balls += 1500;
  s.mode = "normal";
  s.supportLeft = 0;
  return { payout: 1500 };
}

function resolveTsuranuki(s, chain) {
  let payout = 0;
  let loopCount = 0;

  while (Math.random() < SPEC.tsuranukiLoopRate) {
    loopCount += 1;
    payout += 7500;
    s.balls += 7500;
    chain.push(`ツラヌキチャレンジ成功 ${loopCount}回目 7500個`);
  }

  payout += 1500;
  s.balls += 1500;
  chain.push("ツラヌキチャレンジ終了 1500個 RUSHへ");
  enterRush(s);
  return { payout };
}

function rushHit(s) {
  s.rushHitCount += 1;
  s.totalHits += 1;
  s.balls += 1500;

  const chain = ["RUSH大当たり 1500個"];
  let payout = 1500;

  if (Math.random() < 0.42) {
    chain.push("運命の一撃突入");
    const fate = resolveFateAttack(s, chain);
    payout += fate.payout;
  } else {
    chain.push("RUSHリセット");
    resetRush(s);
    s.mode = "rush";
  }

  finishHit(s, {
    category: "RUSH",
    type: chain.join(" → "),
    payout,
  });
}

function resolveFateAttack(s, chain) {
  if (Math.random() < SPEC.fateSuccessRate) {
    chain.push("運命の一撃成功");
    return resolveTsuranuki(s, chain);
  }

  chain.push("運命の一撃失敗 RUSHへ");
  resetRush(s);
  s.mode = "rush";
  return { payout: 0 };
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
  s.lastEvent = "RUSH終了";
  addGraphPoint(s, "RUSH終了");
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
