import * as kakeguruiEngine from "../logic/kakeguruiEngine";
import * as rikorikoEngine from "../logic/rikorikoEngine";

export const machines = [
  {
    id: "rikoriko",
    name: "eリコリス・リコイル",
    shortName: "リコリコ",
    description:
      "通常50%でRUSH突入。モードA/Bとアルティメットドライブを搭載した荒めの検証用スペックです。",
    specSummary: {
      normalOdds: "1/259.7",
      rushOdds: "1/97.1",
      rushEntry: "50%",
      continuation: "75%",
      supportSpins: "132回",
    },
    engine: rikorikoEngine,
  },
  {
    id: "kakegurui-7500",
    name: "eカケグルイ 7500ver.",
    shortName: "カケグルイ",
    description:
      "初当たりの25%から50/50ジャッジメントへ。ツラヌキチャレンジと運命の一撃で7500個ループを狙うスペックです。",
    specSummary: {
      normalOdds: "1/204",
      rushOdds: "1/99",
      rushEntry: "25%",
      continuation: "約75%",
      supportSpins: "0 or 135回",
    },
    engine: kakeguruiEngine,
  },
];

export const findMachineById = (machineId) =>
  machines.find((machine) => machine.id === machineId);
