import * as hikikomariEngine from "../logic/hikikomariEngine";
import * as kakeguruiEngine from "../logic/kakeguruiEngine";
import * as rikorikoEngine from "../logic/rikorikoEngine";

export const machines = [
  {
    id: "rikoriko",
    name: "eリコリス・リコイル",
    shortName: "リコリコ",
    description:
      "通常時の大当たりからRUSH突入を目指すタイプ。RUSH中のモード差と出玉分布を仮想環境で確認できます。",
    specSummary: {
      normalOdds: "1/259.7",
      rushOdds: "1/97.1",
      rushEntry: "50%",
      continuation: "約75%",
      supportSpins: "132回",
    },
    overview: [
      "公開スペック上の通常時大当たり確率、RUSH中確率、電サポ回数をもとに、通常時からRUSH中までの流れを仮想的に確認できます。",
      "通常時の初当たり後にRUSHへ進む振り分けと、RUSH中の大当たり分布を乱数で試行します。表示される結果は実機や店舗での挙動を再現または保証するものではありません。",
    ],
    simulationPoints: [
      "初当たりまでの通常回転数と仮想消費の増え方",
      "RUSH突入率が短期試行でどの程度ぶれるか",
      "RUSH中の大当たり回数と仮想出玉の偏り",
    ],
    specNotes: [
      "確率値は公開スペックをもとにしたシミュレーション用の値です。",
      "RUSH突入率や継続率は長期試行の目安であり、短期結果では大きく上下する場合があります。",
    ],
    machineDetails: {
      reference: {
        label: "ちょんぼりすた様",
        url: "https://chonborista.com/pachinko/newgin/251935/",
      },
      profileRows: [
        { label: "台の名称", value: "eリコリス・リコイル" },
        { label: "メーカー", value: "ニューギン" },
        { label: "仕様", value: "2種" },
        { label: "導入日", value: "2026年4月6日" },
        { label: "導入予定台数", value: "約8,000台" },
      ],
      features: [
        "大人気シリーズが初のパチンコ化",
        "遊びやすさとまとまった仮想出玉の変化を確認しやすいスペック",
        "RUSH突入率は50%、RUSH継続率は約75%",
        "RUSH中はモードAとモードBを行き来するゲーム性",
        "RUSH中の払出は750個、3000個、6000個＋ULTIMATE DRIVEのパターンを持つ",
        "ULTIMATE DRIVEは3000個上乗せが50%でループする仕様",
      ],
      specRows: [
        { group: "大当り", label: "通常時", value: "1/259.7" },
        { group: "大当り", label: "RUSH中", value: "1/97.1" },
        { group: "RUSH", label: "突入率", value: "50%" },
        { group: "RUSH", label: "継続率", value: "約75%" },
        { group: "電サポ回数", label: "", value: "132回" },
        { group: "賞球", label: "", value: "1＆6＆8＆15" },
        { group: "カウント", label: "", value: "10C" },
      ],
      payoutTables: [
        {
          title: "通常時",
          headers: ["払出", "電サポ", "割合"],
          rows: [
            ["1500個", "RUSH(132回)", "0.1%"],
            ["600個", "RUSH(132回)", "44.9%"],
            ["310個", "チンアナゴBONUS成功 / RUSH(132回)", "5.0%"],
            ["600個", "通常時へ", "30.0%"],
            ["310個", "チンアナゴBONUS失敗 / 通常時へ", "20.0%"],
          ],
        },
        {
          title: "RUSH中 モードA",
          headers: ["払出", "電サポ", "割合"],
          rows: [["750個", "RUSH(132回)", "100%"]],
        },
        {
          title: "RUSH中 モードB",
          headers: ["払出", "電サポ", "割合"],
          rows: [
            ["3000個", "RUSH(132回)", "50%"],
            ["6000個", "ULTIMATE DRIVE移行", "50%"],
          ],
          notes: [
            "RUSH突入時は約30%でモードBからスタート",
            "モードAからモードBへの移行率は大当り時の50%",
            "モードBの50%でULTIMATE DRIVEが発生し、3000個の上乗せが50%でループ",
          ],
        },
        {
          title: "ULTIMATE DRIVEの獲得出玉割合",
          headers: ["獲得出玉", "割合"],
          rows: [
            ["9001個以上", "25%"],
            ["9000個", "25%"],
            ["6000個", "50%"],
          ],
          notes: ["ULTIMATE DRIVE終了後はRUSHへ移行"],
        },
      ],
      modeFeatures: [
        {
          title: "モードA",
          points: [
            "大当り時は750個＋RUSH継続",
            "大当り時の50%でモードBに移行",
          ],
        },
        {
          title: "モードB",
          points: [
            "大当り時の50%は3000個＋RUSH継続",
            "大当り時の50%は6000個＋UD（アルティメットドライブ）へ突入",
            "大当り後は一部を除きモードAへ移行し、継続の可能性もあります",
          ],
        },
        {
          title: "UD（アルティメットドライブ）",
          points: [
            "本機最大の出玉トリガー",
            "突入時点で6000個＋3000個の上乗せが50%でループ",
            "UD終了後はRUSH継続",
          ],
        },
      ],
    },
    engine: rikorikoEngine,
  },
  {
    id: "kakegurui-7500",
    name: "eカケグルイ 7500ver.",
    shortName: "カケグルイ",
    description:
      "初当たり時の分岐とRUSH中の上乗せ挙動を仮想的に試せるスペックです。表示値は確率検証用の参考値です。",
    specSummary: {
      normalOdds: "1/204",
      rushOdds: "1/99",
      rushEntry: "25%",
      continuation: "約75%",
      supportSpins: "0回または135回",
    },
    overview: [
      "公開スペック上の通常時大当たり確率、RUSH中確率、突入分岐をもとに、初当たり後の振り分けとRUSH中の流れを仮想的に確認できます。",
      "通常時、50/50ジャッジメント、デラネクチャレンジ、RUSHの各状態を乱数で試行します。表示される仮想出玉や仮想消費は確率確認用の参考値です。",
    ],
    simulationPoints: [
      "初当たり後の分岐が仮想出玉に与える影響",
      "RUSH突入率と継続結果が短期試行でどの程度ぶれるか",
      "一撃出玉が発生した場合のスランプグラフの変化",
    ],
    specNotes: [
      "突入率や継続率はシミュレーション上の長期的な目安です。",
      "0回または135回の電サポなど、状態ごとの挙動は仮想的な試行結果として表示します。",
    ],
    machineDetails: {
      reference: {
        label: "ちょんぼりすた様",
        url: "https://chonborista.com/pachinko/daiichi/254383/",
      },
      profileRows: [
        { label: "台の名称", value: "eカケグルイ 7500ver." },
        { label: "メーカー", value: "Daiichi" },
        { label: "仕様", value: "1種2種混合機" },
        { label: "導入日", value: "2026年5月11日" },
        { label: "導入予定", value: "8000台(2スペック合算)" },
      ],
      features: [
        "美少女が狂う1/2の大勝負をテーマにした最狂ツラヌキSPEC",
        "たった一度の大当りが、状況をひっくり返す可能性を持つゲーム性",
      ],
      specRows: [
        { group: "大当り", label: "通常時", value: "1/204" },
        { group: "大当り", label: "RUSH中", value: "1/99" },
        { group: "50/50ジャッジメント", label: "突入率", value: "25%" },
        { group: "50/50ジャッジメント", label: "成功率", value: "50%" },
        { group: "RUSH継続率", label: "", value: "約75%" },
        { group: "運命の一撃成功率", label: "", value: "約60%" },
        { group: "電サポ回数", label: "", value: "0 or 135回" },
        { group: "賞球", label: "", value: "1＆4＆15" },
        { group: "カウント", label: "", value: "10C" },
      ],
      payoutTables: [
        {
          title: "通常時",
          headers: ["払出", "電サポ", "割合"],
          rows: [
            ["1500個", "50/50ジャッジメント", "25%"],
            ["300個", "通常時へ", "75%"],
          ],
        },
        {
          title: "50/50ジャッジメント中",
          headers: ["払出", "電サポ", "割合"],
          rows: [
            ["7500個", "ツラヌキチャレンジ", "50%"],
            ["1500個", "通常時へ", "50%"],
          ],
        },
        {
          title: "ツラヌキチャレンジ中",
          headers: ["払出", "電サポ", "割合"],
          rows: [
            ["7500個", "ツラヌキチャレンジ", "30%"],
            ["1500個", "RUSH(135回)", "70%"],
          ],
        },
        {
          title: "RUSH中",
          headers: ["払出", "電サポ", "割合"],
          rows: [
            ["1500個", "運命の一撃", "42%"],
            ["1500個", "RUSH(135回)", "58%"],
          ],
          notes: [
            "運命の一撃は60%で成功しツラヌキチャレンジへ、40%で失敗しRUSHへ移行します。",
          ],
        },
      ],
      modeFeatures: [
        {
          title: "50/50ジャッジメント",
          points: [
            "通常時の一部大当りから移行",
            "成功時は7500個＋ツラヌキチャレンジへ移行",
            "失敗時は1500個＋通常時へ移行",
          ],
        },
        {
          title: "ツラヌキチャレンジ",
          points: [
            "7500個の大当りを契機に継続を狙う状態",
            "30%で7500個＋ツラヌキチャレンジ継続",
            "70%で1500個＋RUSH(135回)へ移行",
          ],
        },
        {
          title: "RUSH",
          points: [
            "電サポ135回で大当りを目指す状態",
            "大当り時の42%で運命の一撃へ移行",
            "運命の一撃は成功でツラヌキチャレンジへ、失敗でRUSHへ戻ります",
          ],
        },
      ],
    },
    engine: kakeguruiEngine,
  },
  {
    id: "hikikomari",
    name: "eひきこまり吸血姫の悶々",
    shortName: "ひきこまり",
    description:
      "通常時のCZ突入と大当たりを別抽選で扱い、CZ突破からLT突入を目指すスペックです。LT中の出玉分布も仮想的に確認できます。",
    specSummary: {
      normalOdds: "1/348",
      rushOdds: "1/99",
      rushEntry: "CZ 1/129",
      continuation: "約77%",
      supportSpins: "10回または144回",
    },
    overview: [
      "公開スペック上の通常時大当たり確率、CZ突入率、右打ち中確率をもとに、通常時からCZ、LTまでの流れを仮想的に確認できます。",
      "通常時はCZ突入と大当たりを別抽選で扱い、CZ成功後や通常時大当たり後の振り分けを乱数で試行します。表示される結果は確率確認用の参考値です。",
    ],
    simulationPoints: [
      "通常時からCZへ入るまでの回転数と仮想消費の増え方",
      "CZ10回転での成功結果が短期試行でどの程度ぶれるか",
      "LT中の大当たり回数と仮想出玉の偏り",
    ],
    specNotes: [
      "CZ突入率1/129と通常時大当たり1/348は、シミュレーション上では別抽選として扱います。",
      "CZ成功期待度約33%は、10回転で約33%になる1回転あたりの成功確率で近似しています。",
    ],
    machineDetails: {
      reference: {
        label: "ちょんぼりすた様",
        url: "https://chonborista.com/pachinko/fujishouji/257318/",
      },
      profileRows: [
        { label: "台の名称", value: "eひきこまり吸血姫の悶々" },
        { label: "メーカー", value: "藤商事" },
        { label: "仕様", value: "1種2種混合機" },
        { label: "導入日", value: "2026年5月11日" },
        { label: "導入予定", value: "約8,000台" },
      ],
      features: [
        "通常時は約1/129で烈核解放CZに突入",
        "CZは10回転継続し、成功期待度は約33%",
        "CZ突破時は約51%でラッキートリガーへ直行",
        "LTは144回のSTで、継続率は約77%",
        "右打ち中の大当たりはすべて1500個以上",
        "RUSH中大当りの約50%で、平均獲得出玉約4300個の孤紅の恤BONUSに突入",
      ],
      specRows: [
        { group: "大当り", label: "通常時", value: "1/348" },
        { group: "大当り", label: "右打ち中", value: "1/99" },
        { group: "CZ", label: "突入率", value: "1/129" },
        { group: "CZ", label: "抽選回数", value: "10回" },
        { group: "CZ", label: "成功期待度", value: "約33%" },
        { group: "LT", label: "回数", value: "144回" },
        { group: "LT", label: "継続率", value: "約77%" },
        { group: "賞球", label: "", value: "1＆5＆15" },
        { group: "カウント", label: "", value: "10C" },
      ],
      payoutTables: [
        {
          title: "CZ成功時（特図1・特図2）",
          headers: ["払出", "移行先", "割合"],
          rows: [
            ["1800個", "超孤紅の恤RUSH(144回)", "7.3%"],
            ["1500個", "超孤紅の恤RUSH(144回)", "43.7%"],
            ["1500個", "通常時へ", "49.0%"],
          ],
        },
        {
          title: "LT「超孤紅の恤RUSH」中",
          headers: ["払出", "BONUS名称", "割合"],
          rows: [
            ["6000個 +1G連!?", "孤紅の恤BONUS(144回)", "6.25%"],
            ["4500個", "孤紅の恤BONUS(144回)", "18.75%"],
            ["3000個", "孤紅の恤BONUS(144回)", "18.75%"],
            ["1500個", "孤紅の恤BONUS(144回)", "6.25%"],
            ["1500個", "吸血姫BONUS(144回)", "50.0%"],
          ],
          notes: [
            "大当りの約50%が孤紅の恤BONUS、約50%が吸血姫BONUSです。",
            "孤紅の恤BONUS内の振り分けを加味したトータル割合として記載しています。",
          ],
        },
      ],
      modeFeatures: [
        {
          title: "烈核解放CZ",
          points: [
            "通常時のCZ突入抽選または大当たり後の振り分けから移行を狙う状態",
            "10回転の抽選で成功期待度は約33%",
            "成功後の振り分けでLT突入または通常時移行を決定します",
          ],
        },
        {
          title: "超孤紅の恤RUSH",
          points: [
            "144回のSTで右打ち中大当りを目指すLT状態",
            "右打ち中大当りはすべて1500個以上",
            "大当り後は144回にリセットし、LT継続を目指します",
          ],
        },
        {
          title: "孤紅の恤BONUS",
          points: [
            "LT中大当りの約50%で突入する出玉寄りのBONUS",
            "3000個、4500個、6000個+1G連などの振り分けを持ちます",
            "シミュレーションでは1G連表記を出玉加算として扱います",
          ],
        },
      ],
    },
    engine: hikikomariEngine,
  },
];

export const findMachineById = (machineId) =>
  machines.find((machine) => machine.id === machineId);
