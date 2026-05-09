# パチンコシミュレーター 引き継ぎ資料

## プロジェクト概要

- プロジェクトパス: `c:\Users\funky\OneDrive\デスクトップ\webapp\pachinko_sim\pachinko-app`
- React + Vite 製のパチンコシミュレーター
- スマホ表示を主軸にしたUI
- GitHub Pages / Vercel 両対応のため `vite.config.js` は `base: './'`
- ルーティングは Hash URL
  - トップ: `/#/`
  - リコリコ: `/#/machines/rikoriko`
  - カケグルイ: `/#/machines/kakegurui-7500`

## 主要ファイル

- `src/App.jsx`
  - Hash URLルーティング
  - トップページ
  - 共通シミュレーターUI
  - 通常時はヒーロー部に `通常時回転数`
  - RUSH中はヒーロー部に `電サポ残り`
- `src/App.css`
  - スマホ向けUI
  - 機種カード、当たり演出、グラフなど
- `src/machines/index.js`
  - 機種一覧
  - 各機種の `id`, `name`, `shortName`, `description`, `specSummary`, `engine`
- `src/logic/rikorikoEngine.js`
  - リコリコ用エンジン
- `src/logic/kakeguruiEngine.js`
  - eカケグルイ 7500ver. 用エンジン

## 実装済み機能

- トップページから機種選択
- 機種切替時はシミュレーション状態リセット
- 1回転ボタン
- 当たるまでスキップ
- 1000円ベース設定
- 投資額
- 玉収支
- スランプグラフ
- 初当たり回数
- 通常回転累計
- 初当たり確率
- RUSH突入回数
- RUSH突入率
- 総当たり
- RUSH中当たり
- 大当たり履歴
- 当たり時の `大当たり!` 演出

## 投資・持ち玉ロジック

通常時のベース消費は以下の仕様。

- `1000円ベースN回転` ごとに `250玉` 消費扱い
- 玉収支がプラスなら、持ち玉から `250玉` 消費
  - 投資額は増えない
  - グラフラベル: `持ち玉遊技`
- 玉収支が `0以下` なら、追加投資
  - `money -= 1000`
  - `balls -= 250`
  - グラフラベル: `投資`

注意:

- `money` は負数で管理
- UIでは `Math.abs(Math.min(state.money, 0))` で投資額表示
- `balls` は差玉/持ち玉的に使っている
  - プラスなら持ち玉あり
  - マイナスなら投資超過

## 通常時回転数表示

- `state.normalSpins`: 累計通常回転数
- `state.currentNormalSpins`: 現在の通常滞在での回転数
- ヒーロー部:
  - `state.mode === "normal"` のとき `通常時回転数`
  - それ以外は `電サポ残り`
- 当たって通常に戻った時、RUSH終了で通常に戻った時は `currentNormalSpins = 0`

## リコリコ仕様

ファイル: `src/logic/rikorikoEngine.js`

基本:

- 通常: `1/259.7`
- RUSH: `1/97.1`
- 電サポ: `132回`
- RUSH突入時:
  - 30%で `rushB`
  - 70%で `rushA`

通常大当たり:

- 0.1%: 1500個 + RUSH
- 44.9%: 600個 + RUSH
- 5.0%: 310個 + RUSH
- 30%: 600個 + 通常
- 20%: 310個 + 通常

RUSH A:

- 750個
- RUSHリセット
- 50%でモードBへ

RUSH B:

- 50%: 3000個、90%でモードAへ
- 50%: アルティメットドライブ
  - 基本6000個
  - 以降50%で3000個ループ
  - 終了後90%でモードAへ、10%でB継続

## カケグルイ仕様

ファイル: `src/logic/kakeguruiEngine.js`

基本:

- 台名: `eカケグルイ 7500ver.`
- 通常: `1/204`
- RUSH: `1/99`
- 電サポ: `135回`
- 50/50ジャッジメント突入率: `25%`
- 50/50成功率: `50%`
- RUSH継続率: 約75%
- 運命の一撃成功率: `60%`

通常時:

- 当選時:
  - 25%: 1500個 + 50/50ジャッジメントへ
  - 75%: 300個 + 通常へ

50/50ジャッジメント:

- 突入時に即時抽選
- 50%: 7500個 + ツラヌキチャレンジへ
- 50%: 1500個 + 通常へ

ツラヌキチャレンジ:

- 突入時に即時抽選
- 30%: 7500個 + ツラヌキチャレンジ継続
- 70%: 1500個 + RUSH 135回へ
- 成功分はループする

RUSH:

- 135回
- `1/99` で当たり
- 当選時:
  - 42%: 1500個 + 運命の一撃へ
  - 58%: 1500個 + RUSH 135回リセット

運命の一撃:

- 突入時に即時抽選
- 60%: 成功 + ツラヌキチャレンジへ
- 40%: 失敗 + RUSH 135回へ戻る
- 通常落ちではない

## 削除/リネーム済み

削除済み:

- `src/App copy.jsx`
- `src/logic/pachinkoEngine copy.js`

リネーム済み:

- `src/logic/pachinkoEngine.js`
- `src/logic/rikorikoEngine.js`

## 検証コマンド

PowerShellでは `npm.ps1` 実行ポリシーに引っかかることがあるため、基本は `npm.cmd` を使う。

```bash
npm.cmd run lint
npm.cmd run build
```

## GitHub / Vercel

- GitHub repo: `funkytodoroki/RikoRiko_Simulation`
- GitHub Pages URL:
  - `https://funkytodoroki.github.io/RikoRiko_Simulation/`
- Vercel対応のため `vite.config.js` は `base: './'`
- GitHub Pagesも相対パスで動作確認済み
- 以前のVercel表示不具合は `base: '/RikoRiko_Simulation/'` 固定が原因だった

## 次回作業時のおすすめ確認

1. `npm.cmd run lint`
2. `npm.cmd run build`
3. ブラウザで以下を確認
   - `/#/`
   - `/#/machines/rikoriko`
   - `/#/machines/kakegurui-7500`
4. 通常時の大きな数字が `通常時回転数`
5. RUSH中の大きな数字が `電サポ残り`
6. 当たり後、持ち玉がある間は投資額が増えない
7. 持ち玉がなくなった後に再投資が始まる
