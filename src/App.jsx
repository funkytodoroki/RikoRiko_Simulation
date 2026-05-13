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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [route.type, route.machineId]);

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

  if (route.type === "privacy") {
    return <StaticPage page="privacy" />;
  }

  if (route.type === "terms") {
    return <StaticPage page="terms" />;
  }

  if (route.type === "contact") {
    return <StaticPage page="contact" />;
  }

  return <TopPage machines={machines} />;
}

function TopPage({ machines }) {
  return (
    <main className="app-shell top-page">
      <header className="top-hero">
        <p className="eyebrow">Pachinko Probability Simulator</p>
        <h1>パチンコ確率シミュレーター</h1>
        <ul className="feature-list" aria-label="主な機能">
          <li>仮想収支とRUSH性能をすばやく検証</li>
          <li>確率の偏りをスランプグラフで可視化</li>
          <li>公開スペックに基づく非公式シミュレーター</li>
        </ul>
      </header>

      <section className="machine-list" aria-label="機種一覧">
        {machines.map((machine) => (
          <article key={machine.id} className="machine-card">
            <div>
              <span className="machine-badge">{machine.shortName}</span>
              <h2>{machine.name}</h2>
              <p>{machine.description}</p>
              <p className="rights-note">
                非公式ファンメイド。権利元、メーカー、店舗とは無関係です。
              </p>
            </div>

            <dl className="machine-specs">
              <SpecTerm label="通常確率" value={machine.specSummary.normalOdds} />
              <SpecTerm label="RUSH確率" value={machine.specSummary.rushOdds} />
              <SpecTerm label="突入率" value={machine.specSummary.rushEntry} />
              <SpecTerm label="継続率目安" value={machine.specSummary.continuation} />
            </dl>

            <button
              type="button"
              className="primary machine-start"
              onClick={() => navigateToMachine(machine.id)}
            >
              シミュレーションを開始
            </button>
          </article>
        ))}
      </section>

      <details className="info-section guide-details">
        <summary>初めての方・当サイトのポリシー</summary>
        <div className="guide-content">
          <section>
            <h2>このサイトでできること</h2>
            <p>
              このサイトは、公開されている機種スペックをもとに、初当たり、RUSH突入、継続、大当たり後の仮想出玉の変化を確認できる確率シミュレーターです。
              1回転ずつ試すだけでなく、次の大当たりまでまとめて進めることで、確率の偏りや展開の違いを短時間で観察できます。
            </p>
            <p>
              仮想1000円あたりの回転数を変更すると、同じスペックでも仮想消費の増え方が変わります。
              回転率の違いによって、初当たりまでの仮想消費やスランプグラフの見え方がどう変化するかを確認できます。
            </p>
          </section>

          <section>
            <h2>シミュレーションで確認できる主な項目</h2>
            <p>
              シミュレーターでは、初当たり回数、初当たり確率、RUSH突入回数、RUSH突入率、総大当たり回数、RUSH中の大当たり回数などを表示します。
              これらの数値は、実際の遊技結果ではなく、乱数によって発生した仮想的な試行結果です。
            </p>
            <p>
              スランプグラフでは、仮想出玉の増減を時系列で確認できます。
              短い試行では結果が大きく上下することがあり、試行を重ねるほどスペック上の傾向に近づきやすくなります。
            </p>
          </section>

          <section>
            <h2>結果を見るときの注意点</h2>
            <p>
              確率は、分母まで試行すれば必ず当たるというものではありません。
              たとえば大当たり確率が約1/200の機種でも、早く当たることもあれば、数百回転以上当たらないこともあります。
            </p>
            <p>
              RUSH突入率や継続率も同じで、短い試行ではスペック値から大きくズレる場合があります。
              このサイトでは、そのような確率のゆらぎを観察しやすくするために、結果を履歴やグラフで表示しています。
            </p>
          </section>

          <section>
            <h2>このサイトが扱わないもの</h2>
            <p>
              このサイトは娯楽用・確率確認用の非公式ファンメイドツールです。
              実際の金銭、景品、換金、賭け、店舗での遊技結果を扱うサービスではありません。
            </p>
            <p>
              表示される仮想出玉や仮想消費は、シミュレーション上の参考値です。
              実機や店舗で同じ結果になること、収益や損失が発生すること、特定の結果が得られることを保証するものではありません。
            </p>
          </section>
        </div>
      </details>

      <Disclaimer />
      <FooterDisclaimer />
      <SiteFooter />
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
    const totalVirtualSpend = Math.abs(Math.min(state.money, 0));

    return { firstHitRate, rushEntryRate, totalVirtualSpend };
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
          <strong>{formatter.format(latestHit.payout)}仮想玉</strong>
        </div>
      )}

      <div className="sim-sticky-header">
        <header className="top-bar">
          <button type="button" className="back-button" onClick={onBack}>
            トップへ
          </button>
          <button type="button" className="reset-button" onClick={handleReset}>
            リセット
          </button>
        </header>

        <MachineGuide machine={machine} />
      </div>

      <section className="hero-panel">
        <div className="machine-title">
          <p className="eyebrow">Pachinko Probability Simulator</p>
          <h1>{machine.name}</h1>
          <p className="rights-note">
            非公式ファンメイド。権利元、メーカー、店舗とは無関係です。
          </p>
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
            <span>仮想玉数</span>
            <strong>{formatSigned(state.balls)}玉</strong>
          </div>
          <div>
            <span>仮想消費</span>
            <strong>{formatter.format(stats.totalVirtualSpend)}円相当</strong>
          </div>
        </div>
      </section>

      <section className="action-card">
        <label className="base-select">
          <span>仮想1000円あたりの回転数</span>
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
                {value}回転 / 仮想1000円
              </option>
            ))}
          </select>
        </label>
        <div className="action-buttons">
          <button type="button" onClick={handleSpin}>
            1回転
          </button>
          <button type="button" className="primary" onClick={handleSkip}>
            次の大当たりまで
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
        <Stat label="総大当たり" value={`${state.totalHits}回`} />
        <Stat label="RUSH大当たり" value={`${state.rushHitCount}回`} />
      </section>

      <section className="graph-card">
        <div className="section-title">
          <h2>スランプグラフ</h2>
          <span>現在の仮想玉数 {formatSigned(state.balls)}玉</span>
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
                    総回転 {item.totalSpin}回 / 大当たりまで {item.spin}回
                  </span>
                </div>
                <div className="history-result">
                  <strong>{formatter.format(item.payout)}仮想玉</strong>
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
      <Disclaimer />
      <SiteFooter />
    </main>
  );
}

function MachineGuide({ machine }) {
  if (machine.machineDetails) {
    return <MachineDetailGuide machine={machine} />;
  }

  return (
    <section className="machine-guide" aria-label={`${machine.name}の機種説明`}>
      <div className="section-title">
        <h2>機種説明</h2>
        <span>{machine.shortName}</span>
      </div>

      <div className="guide-block">
        <h3>スペック概要</h3>
        {machine.overview.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="guide-block">
        <h3>シミュレーションの見どころ</h3>
        <ul>
          {machine.simulationPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>

      <div className="guide-block">
        <h3>スペック値の注意点</h3>
        <ul>
          {machine.specNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function MachineDetailGuide({ machine }) {
  const { machineDetails } = machine;

  return (
    <details className="machine-guide machine-overview-details">
      <summary>
        <span>機種概要</span>
        <span>{machine.shortName}</span>
      </summary>

      <dl className="detail-table profile-table">
        {machineDetails.profileRows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="guide-block">
        <h3>{machine.name}の特徴</h3>
        <ul>
          {machineDetails.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>

      <details className="machine-detail-panel">
        <summary>スペック詳細</summary>
        <dl className="detail-table spec-detail-table">
          {machineDetails.specRows.map((row) => (
            <div key={`${row.group}-${row.label || row.value}`}>
              <dt>{row.group}</dt>
              {row.label && <dd className="detail-sub-label">{row.label}</dd>}
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </details>

      <details className="machine-detail-panel">
        <summary>大当たり振り分け</summary>
        <div className="payout-table-list">
          {machineDetails.payoutTables.map((table) => (
            <div key={table.title} className="payout-table-block">
              <h3>{table.title}</h3>
              <table className="payout-table">
                <thead>
                  <tr>
                    {table.headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => (
                    <tr key={row.join("-")}>
                      {row.map((cell) => (
                        <td key={cell}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {table.notes && (
                <ul className="detail-notes">
                  {table.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </details>

      <details className="machine-detail-panel">
        <summary>各モード毎の特徴</summary>
        <div className="mode-feature-list">
          {machineDetails.modeFeatures.map((mode) => (
            <div key={mode.title} className="guide-block">
              <h3>{mode.title}</h3>
              <ul>
                {mode.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>

      <p className="reference-note">
        参考:
        <a href={machineDetails.reference.url} target="_blank" rel="noreferrer">
          {machineDetails.reference.label}
        </a>
      </p>
    </details>
  );
}

function StaticPage({ page }) {
  const content = staticPages[page];

  return (
    <main className="app-shell top-page">
      <header className="top-bar">
        <button type="button" className="back-button" onClick={navigateToTop}>
          トップへ
        </button>
      </header>

      <article className="policy-page">
        <p className="eyebrow">Site Policy</p>
        <h1>{content.title}</h1>
        {content.formUrl && (
          <a
            className="form-link"
            href={content.formUrl}
            target="_blank"
            rel="noreferrer"
          >
            お問い合わせフォームを開く
          </a>
        )}
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>

      <SiteFooter />
    </main>
  );
}

function Disclaimer() {
  return (
    <p className="disclaimer compact-disclaimer">
      本サイトは娯楽用です。実機・店舗での結果を保証しません。
      <a href="#/terms">利用規約・免責</a>
    </p>
  );
}

function FooterDisclaimer() {
  return (
    <p className="footer-disclaimer">
      このサイトは確率確認を目的とした非公式ファンメイドツールです。
      実際の金銭、景品、換金、賭け、店舗での結果を扱わず、表示される仮想出玉や仮想消費は参考値です。
    </p>
  );
}

function SiteFooter() {
  return (
    <nav className="site-footer" aria-label="サイト情報">
      <a href="#/privacy">プライバシーポリシー</a>
      <a href="#/terms">利用規約・免責</a>
      <a href="#/contact">お問い合わせ</a>
    </nav>
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

  if (normalizedHash === "/privacy") {
    return { type: "privacy" };
  }

  if (normalizedHash === "/terms") {
    return { type: "terms" };
  }

  if (normalizedHash === "/contact") {
    return { type: "contact" };
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

const staticPages = {
  privacy: {
    title: "プライバシーポリシー",
    sections: [
      {
        heading: "アクセス解析と広告について",
        body: [
          "当サイトでは、利用状況の把握とサイト改善のために Google Analytics を使用する場合があります。また、広告配信のために Google AdSense を使用する場合があります。",
          "これらのサービスでは Cookie などの技術を利用し、ユーザーのブラウザ情報や閲覧情報が収集されることがあります。個人を直接特定する情報の収集を目的とするものではありません。",
        ],
      },
      {
        heading: "Cookie の管理",
        body: [
          "Cookie の利用はブラウザ設定から無効にできます。設定方法は利用中のブラウザのヘルプをご確認ください。",
        ],
      },
      {
        heading: "免責",
        body: [
          "当サイトのシミュレーション結果は娯楽と確率検証を目的とした参考情報です。実際の遊技結果、収益、損失、店舗での挙動を保証しません。",
        ],
      },
    ],
  },
  terms: {
    title: "利用規約・免責",
    sections: [
      {
        heading: "サイトの目的",
        body: [
          "当サイトはパチンコ機の確率的な挙動を仮想的に確認するための非公式ファンメイドツールです。実際の金銭、景品、換金、賭けを扱うサービスではありません。",
        ],
      },
      {
        heading: "利用上の注意",
        body: [
          "表示される仮想玉数や仮想消費はシミュレーション上の値です。実店舗や実機で同じ結果になることを示すものではありません。",
          "未成年の方、遊技への不安や依存に関する心配がある方は、実際の遊技を目的として本サイトを利用しないでください。",
        ],
      },
      {
        heading: "権利関係",
        body: [
          "当サイトは非公式であり、掲載している名称やスペックの権利元、メーカー、店舗とは関係ありません。問題がある場合はお問い合わせページからご連絡ください。",
        ],
      },
    ],
  },
  contact: {
    title: "お問い合わせ",
    formUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfo7Ovcr1TE9pTynLjrPZvA5VnPn9Qz34wXEJc9J2fwvtixAg/viewform?usp=publish-editor",
    sections: [
      {
        heading: "連絡方法",
        body: [
          "サイト内容、権利関係、広告表示、ポリシーに関するご連絡は、Googleフォームからお願いします。",
          "お問い合わせ時は、問題の内容、確認した日時、必要に応じて対象ページや機種名が分かる情報を本文に記載してください。",
        ],
      },
      {
        heading: "対応方針",
        body: [
          "不正確な情報、権利上の懸念、広告表示の問題が確認できた場合は、内容の修正または削除を検討します。",
        ],
      },
    ],
  },
};
