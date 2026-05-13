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

## 2026-05-13 追記: AdSense向けコンテンツ拡充テスト

作業ブランチ:

- `experiment-content-expansion`
- `main` から分岐
- `main` 側では先に `Remove global AdSense script` をコミット済み
- このブランチでは、AdSenseの「コンテンツ不足」「操作目的ページ」判定を避けるため、本文量と機種別資料性を増やすテストを実施

### 1. AdSenseスクリプトの全SPA一律読み込み停止

- `index.html` から Google AdSense のグローバル読み込みを削除済み
- `pagead2` / `adsbygoogle` / `ca-pub-2580366430135867` は現状コード内に残していない
- Google Analytics は維持
- 目的:
  - すべてのHash URLへAuto adsが入り得る状態を止める
  - 問い合わせ/規約/操作中心ページに広告が出るリスクを下げる

### 2. トップページの構成整理

`src/App.jsx` / `src/App.css`

- ファーストビューの長文説明を短い機能リストへ変更
  - `仮想収支とRUSH性能をすばやく検証`
  - `確率の偏りをスランプグラフで可視化`
  - `公開スペックに基づく非公式シミュレーター`
- 機種カードをトップページ上部へ移動
- 長いサイト説明は `初めての方・当サイトのポリシー` の `<details>` 内へ格納
- 冒頭の免責文はページ下部へ移動
  - `本サイトは娯楽用です。実機・店舗での結果を保証しません。`
  - `/#/terms` へのリンク付き
- フッター直前に短い定型免責を追加
  - 確率確認用の非公式ファンメイドツールであること
  - 実際の金銭/景品/換金/賭け/店舗結果を扱わないこと
  - 仮想出玉/仮想消費は参考値であること

### 3. 機種概要の資料化

`src/machines/index.js` / `src/App.jsx` / `src/App.css`

- 各機種に `machineDetails` を追加
- 機種ページ上部に `機種概要` を表示
- `機種概要` 自体は折りたたみ
- `機種概要` の中も以下を折りたたみ表示
  - `スペック詳細`
  - `大当たり振り分け`
  - `各モード毎の特徴`
- 折りたたみマーク:
  - 閉じている時: `▼`
  - 開いている時: `▲`
  - 外側と内側のマークが干渉しないよう、外側CSSは `> summary` に限定
- 画像は表示しない
- 参考元として `ちょんぼりすた様` をリンク付きで表示

対応済み機種:

- `eリコリス・リコイル`
  - 参考: `https://chonborista.com/pachinko/newgin/251935/`
  - 機種概要、特徴、スペック詳細、通常時振り分け、RUSH中モードA/B、ULTIMATE DRIVE、モード特徴を追加
- `eカケグルイ 7500ver.`
  - 参考: `https://chonborista.com/pachinko/daiichi/254383/`
  - 機種概要、特徴、スペック詳細、通常時、50/50ジャッジメント、ツラヌキチャレンジ、RUSH中、各状態の特徴を追加
- `eひきこまり吸血姫の悶々`
  - 参考: `https://chonborista.com/pachinko/fujishouji/257318/`
  - 機種概要、特徴、スペック詳細、CZ成功時、LT中、烈核解放CZ/超孤紅の恤RUSH/孤紅の恤BONUSの特徴を追加

### 4. 新規機種 `eひきこまり吸血姫の悶々`

追加ファイル:

- `src/logic/hikikomariEngine.js`

機種データ:

- `id`: `hikikomari`
- `name`: `eひきこまり吸血姫の悶々`
- `shortName`: `ひきこまり`
- 通常時大当り: `1/348`
- CZ突入率: `1/129`
- 右打ち中大当り: `1/99`
- CZ: `10回`
- LT: `144回`
- LT継続率: `約77%`
- 賞球: `1＆5＆15`
- カウント: `10C`

エンジン仕様:

- 通常時は `1/348` の通常時大当りと `1/129` のCZ突入を別抽選
- 同一回転で両方成立した場合は通常時大当りを優先
- CZ成功期待度約33%は、10回転で約33%になる1回転あたりの成功確率で近似
- 通常時大当り/CZ成功後の振り分け:
  - 7.3%: 1800仮想玉 + LT
  - 43.7%: 1500仮想玉 + LT
  - 49.0%: 1500仮想玉 + 通常へ
- LT中振り分け:
  - 6.25%: 6000仮想玉 + 1G連
  - 18.75%: 4500仮想玉
  - 18.75%: 3000仮想玉
  - 6.25%: 1500仮想玉
  - 50.0%: 吸血姫BONUS 1500仮想玉

1G連処理:

- `6000仮想玉 + 1G連` を引いた場合、6000を加算後にLT中大当りと同じ振り分けを再抽選
- 再抽選でも `6000仮想玉 + 1G連` を引いた場合は同じ処理をループ
- 最低でも `6000+1500 = 7500` の表示になる
- 履歴/最終イベントには内訳を表示
  - 例: `吸血姫BONUS 7500仮想玉 (6000+1500) RUSHリセット`
  - 例: `吸血姫BONUS 19500仮想玉 (6000+6000+6000+1500) RUSHリセット`

### 5. 機種ページのスクロール改善

`src/App.jsx` / `src/App.css`

- Hashルート変更時に `window.scrollTo({ top: 0, left: 0 })` を実行
  - メインページから機種ページへ移動した時にスクロール位置が下に残らないようにする
- 機種ページ上部を `sim-sticky-header` として固定
  - `トップへ`
  - `リセット`
  - `機種概要`
- 既存の `action-card` sticky と重ならないよう `top` を調整
- 注意:
  - 機種概要を開いたままスクロールすると固定エリアが大きくなる
  - 見づらい場合は「機種概要の見出しだけ固定、開いた中身は通常スクロール」へ再調整するとよい

### 6. 検証済み

実行済み:

```bash
npm.cmd run lint
npm.cmd run build
```

プレビュー確認済み:

- `http://127.0.0.1:5173/`
- `http://127.0.0.1:5173/#/machines/rikoriko`
- `http://127.0.0.1:5173/#/machines/kakegurui-7500`
- `http://127.0.0.1:5173/#/machines/hikikomari`

エンジン直接確認:

- `hikikomariEngine` を直接importして5000回転程度回し、CZ/LT/履歴生成が例外なく動くことを確認
- `6000+1G連` の最低7500表示と連続ループ時の内訳表示を確認

### 7. 次にmainへ反映する場合の注意

- 現在のブランチは `experiment-content-expansion`
- 未コミット変更には以下が含まれる
  - `src/App.jsx`
  - `src/App.css`
  - `src/machines/index.js`
  - `src/logic/hikikomariEngine.js`
  - `HANDOFF.md`
- 反映前に、機種概要の固定表示がスマホで邪魔にならないか実機表示で確認推奨
- 参考元リンクは外部サイトなので、文言は「参考: ちょんぼりすた様」に留め、画像は使わない方針を維持する
