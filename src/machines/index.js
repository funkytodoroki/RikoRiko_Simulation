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
    engine: rikorikoEngine,
  },
  {
    id: "kakegurui-7500",
    name: "e賭ケグルイ 7500ver.",
    shortName: "賭ケグルイ",
    description:
      "初当たり時の分岐とRUSH中の上乗せ挙動を仮想的に試せるスペックです。表示値は確率検証用の参考値です。",
    specSummary: {
      normalOdds: "1/204",
      rushOdds: "1/99",
      rushEntry: "25%",
      continuation: "約75%",
      supportSpins: "0回または135回",
    },
    engine: kakeguruiEngine,
  },
];

export const findMachineById = (machineId) =>
  machines.find((machine) => machine.id === machineId);
