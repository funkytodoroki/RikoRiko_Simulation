import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { findMachineById, machines } from "./machines";

const formatter = new Intl.NumberFormat("ja-JP");

export default function App() {
  const [route, setRoute] = useState(() => parseHashRoute());

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHashRoute());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const selectedMachine =
    route.type === "machine" ? findMachineById(route.machineId) : null;

  if (selectedMachine) {
    return (
      <Simulator
        key={selectedMachine.id}
        machine={selectedMachine}
        onBack={() => navigateToTop()}
      />
    );
  }

  return <TopPage machines={machines} />;
}

function TopPage({ machines }) {
  return (
    <main className="app-shell top-page">
      <header className="top-hero">
        <p className="eyebrow">Pachinko Simulator</p>
        <h1>遊びたい機種を選択</h1>
        <p>
          1000円ベースを変えながら、出玉推移とRUSH性能をスマホでサクッと検証できます。
        </p>
      </header>

      <section className="machine-list" aria-label="機種一覧">
        {machines.map((machine) => (
          <article key={machine.id} className="machine-card">
            <div>
              <span className="machine-badge">{machine.shortName}</span>
              <h2>{machine.name}</h2>
              <p>{machine.description}</p>
            </div>

            <dl className="machine-specs">
              <SpecTerm label="通常" value={machine.specSummary.normalOdds} />
              <SpecTerm label="RUSH" value={machine.specSummary.rushOdds} />
              <SpecTerm label="突入率" value={machine.specSummary.rushEntry} />
              <SpecTerm label="継続率" value={machine.specSummary.continuation} />
            </dl>

            <button
              type="button"
              className="primary machine-start"
              onClick={() => navigateToMachine(machine.id)}
            >
              この機種で遊ぶ
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}

function Simulator({ machine, onBack }) {
  const { engine } = machine;
  const [state, setState] = useState(() => engine.createInitialState());
  const [settings, setSettings] = useState({
    baseSpinsPer1000: 11,
  });

  const stats = useMemo(() => {
    const firstHitRate =
      state.firstHitCount > 0
        ? (state.normalSpins / state.firstHitCount).toFixed(1)
        : "-";
    const rushEntryRate =
      state.firstHitCount > 0
        ? `${((state.rushCount / state.firstHitCount) * 100).toFixed(1)}%`
        : "-";
    const totalInvestment = Math.abs(Math.min(state.money, 0));

    return { firstHitRate, rushEntryRate, totalInvestment };
  }, [state]);

  const graph = useMemo(() => buildGraph(state.graph), [state.graph]);
  const latestHit = state.history[0];
  const isNormalMode = state.mode === "normal";
  const mainCounterLabel = isNormalMode ? "通常時回転数" : "電サポ残り";
  const mainCounterValue = isNormalMode
    ? state.currentNormalSpins
    : state.supportLeft;

  const handleSpin = () => {
    setState((prev) => engine.spinOnce(prev, settings));
  };

  const handleSkip = () => {
    setState((prev) => engine.spinUntilHit(prev, settings));
  };

  const handleReset = () => {
    setState(engine.createInitialState());
  };

  return (
    <main className="app-shell">
      {latestHit && (
        <div key={latestHit.id} className="hit-effect" aria-live="polite">
          <span>大当たり!</span>
          <strong>{formatter.format(latestHit.payout)}玉</strong>
        </div>
      )}

      <header className="top-bar">
        <button type="button" className="back-button" onClick={onBack}>
          トップへ
        </button>
        <button type="button" className="reset-button" onClick={handleReset}>
          リセット
        </button>
      </header>

      <section className="hero-panel">
        <div className="machine-title">
          <p className="eyebrow">Pachinko Simulator</p>
          <h1>{machine.name}</h1>
        </div>

        <div className="mode-row">
          <span>現在モード</span>
          <strong>{engine.getModeLabel(state.mode)}</strong>
        </div>

        <div className="support-meter">
          <span>{mainCounterLabel}</span>
          <strong>{mainCounterValue}</strong>
          <small>回</small>
        </div>

        <div className="hero-numbers">
          <div>
            <span>玉収支</span>
            <strong>{formatSigned(state.balls)}玉</strong>
          </div>
          <div>
            <span>投資</span>
            <strong>{formatter.format(stats.totalInvestment)}円</strong>
          </div>
        </div>
      </section>

      <section className="action-card">
        <label className="base-select">
          <span>1000円あたりの回転数</span>
          <select
            value={settings.baseSpinsPer1000}
            onChange={(event) =>
              setSettings({
                ...settings,
                baseSpinsPer1000: Number(event.target.value),
              })
            }
          >
            {Array.from({ length: 20 }, (_, i) => 6 + i).map((value) => (
              <option key={value} value={value}>
                {value}回転 / 1000円
              </option>
            ))}
          </select>
        </label>
        <div className="action-buttons">
          <button type="button" onClick={handleSpin}>
            1回転
          </button>
          <button type="button" className="primary" onClick={handleSkip}>
            当たるまで
          </button>
        </div>
      </section>

      <section className="quick-stats">
        <Stat label="初当たり" value={`${state.firstHitCount}回`} />
        <Stat label="初当たり確率" value={`1/${stats.firstHitRate}`} />
        <Stat label="RUSH突入" value={`${state.rushCount}回`} />
        <Stat label="突入率" value={stats.rushEntryRate} />
        <Stat label="通常回転" value={`${state.normalSpins}回`} />
        <Stat label="現在回転" value={`${state.spins}回`} />
        <Stat label="総当たり" value={`${state.totalHits}回`} />
        <Stat label="RUSH当たり" value={`${state.rushHitCount}回`} />
      </section>

      <section className="graph-card">
        <div className="section-title">
          <h2>スランプグラフ</h2>
          <span>現在出玉 {formatSigned(state.balls)}玉</span>
        </div>
        <svg className="slump-graph" viewBox="0 0 720 260" role="img">
          <line
            x1="40"
            y1={graph.zeroY}
            x2="700"
            y2={graph.zeroY}
            className="zero-line"
          />
          <polyline points={graph.path} className="graph-line" />
        </svg>
        <p className="last-event">{state.lastEvent}</p>
      </section>

      <section className="history-section">
        <div className="section-title">
          <h2>大当たり履歴</h2>
          <span>最新50件</span>
        </div>
        <div className="history-list">
          {state.history.length === 0 ? (
            <p className="empty">まだ大当たりはありません。</p>
          ) : (
            state.history.slice(0, 50).map((item) => (
              <article key={item.id} className="history-row">
                <div>
                  <strong>{item.type}</strong>
                  <span>
                    総回転 {item.totalSpin}回 / 当選まで {item.spin}回
                  </span>
                </div>
                <div className="history-result">
                  <strong>{formatter.format(item.payout)}玉</strong>
                  <span>{item.modeAfter}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <footer className="spec-note">
        通常 {machine.specSummary.normalOdds} / RUSH {machine.specSummary.rushOdds} /
        電サポ {machine.specSummary.supportSpins}
      </footer>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SpecTerm({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function parseHashRoute() {
  const hash = window.location.hash.replace(/^#/, "");
  const normalizedHash = hash === "" ? "/" : hash;
  const machineMatch = normalizedHash.match(/^\/machines\/([^/]+)$/);

  if (machineMatch) {
    return { type: "machine", machineId: machineMatch[1] };
  }

  return { type: "top" };
}

function navigateToTop() {
  window.location.hash = "/";
}

function navigateToMachine(machineId) {
  window.location.hash = `/machines/${machineId}`;
}

function buildGraph(points) {
  if (points.length === 0) {
    return { path: "", zeroY: 130 };
  }

  const width = 660;
  const height = 220;
  const left = 40;
  const top = 20;
  const maxX = Math.max(...points.map((point) => point.x), 1);
  const values = points.map((point) => point.y);
  const minY = Math.min(...values, -1000);
  const maxY = Math.max(...values, 1000);
  const rangeY = Math.max(maxY - minY, 1);

  const zeroY = top + ((maxY - 0) / rangeY) * height;
  const path = points
    .map((point) => {
      const x = left + (point.x / maxX) * width;
      const y = top + ((maxY - point.y) / rangeY) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return { path, zeroY };
}

function formatSigned(value) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatter.format(value)}`;
}
