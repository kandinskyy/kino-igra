// Materials are local SVG definitions. Every rendered robot receives unique IDs.
export const wardrobe = {
  wizard: {
    cloth: "#283347",
    pants: "#34414b",
    boot: "#58443b",
    trim: "#c7a260",
    sleeve: "#283347",
    cape: "#273145",
  },
  cruella: {
    cloth: "#30313c",
    pants: "#292b34",
    boot: "#6d3339",
    trim: "#e4decd",
    sleeve: "#35323d",
    cape: "#ded9c9",
  },
  matrix: {
    cloth: "#242f35",
    pants: "#263338",
    boot: "#18272d",
    trim: "#7d9996",
    sleeve: "#27383c",
    cape: "#243337",
  },
  fight: {
    cloth: "#a34341",
    pants: "#6b6659",
    boot: "#5e493d",
    trim: "#d3a083",
    sleeve: "#a74b46",
  },
  dune: {
    cloth: "#3f5052",
    pants: "#405354",
    boot: "#344547",
    trim: "#a0ad9e",
    sleeve: "#4c6060",
    cape: "#a59875",
  },
  captain: {
    cloth: "#405e90",
    pants: "#3c577e",
    boot: "#8d4846",
    trim: "#d1dce1",
    sleeve: "#466592",
  },
  iron: {
    cloth: "#b9443c",
    pants: "#b7483d",
    boot: "#b8473e",
    trim: "#d7b16b",
    sleeve: "#c35645",
  },
  xenomorph: {
    cloth: "#35464e",
    pants: "#374951",
    boot: "#283a44",
    trim: "#8ba69e",
    sleeve: "#425a60",
  },
  marty: {
    cloth: "#e78049",
    pants: "#64839b",
    boot: "#e8e6dc",
    trim: "#f2b379",
    sleeve: "#9abacb",
  },
  hulk: {
    cloth: "#79a568",
    pants: "#79638b",
    boot: "#7ca568",
    trim: "#b9c69b",
    sleeve: "#7dab67",
  },
  thor: {
    cloth: "#526475",
    pants: "#354858",
    boot: "#4b514f",
    trim: "#b9c8cc",
    sleeve: "#677f91",
    cape: "#a9464c",
  },
  widow: {
    cloth: "#2f3a49",
    pants: "#35404d",
    boot: "#26323d",
    trim: "#b69b67",
    sleeve: "#354251",
  },
  brother: {
    cloth: "#a79c8a",
    pants: "#566570",
    boot: "#514b41",
    trim: "#ddd1b5",
    sleeve: "#b4a993",
  },
  terminator: {
    cloth: "#35434d",
    pants: "#3b4850",
    boot: "#29373e",
    trim: "#aebbc0",
    sleeve: "#3a4751",
  },
  pirate: {
    cloth: "#746052",
    pants: "#777464",
    boot: "#5b473d",
    trim: "#c6a570",
    sleeve: "#cbbda4",
    cape: "#6e594b",
  },
  gandalf: {
    cloth: "#97aab0",
    pants: "#81969a",
    boot: "#756c5c",
    trim: "#cbd8d6",
    sleeve: "#a4b5b9",
    cape: "#839b9f",
  },
  forrest: {
    cloth: "#e7dcca",
    pants: "#c4b698",
    boot: "#e9ece4",
    trim: "#a5b5ba",
    sleeve: "#ded3bc",
  },
  wolf: {
    cloth: "#48576e",
    pants: "#43516b",
    boot: "#34434f",
    trim: "#c6af6c",
    sleeve: "#495a71",
  },
  bill: {
    cloth: "#e5b835",
    pants: "#e4ba39",
    boot: "#e9d49c",
    trim: "#313b3f",
    sleeve: "#e6bd43",
  },
  jason: {
    cloth: "#637368",
    pants: "#54605d",
    boot: "#3a494a",
    trim: "#aaa897",
    sleeve: "#69796b",
  },
  spider: {
    cloth: "#c45464",
    pants: "#426b8b",
    boot: "#c05a68",
    trim: "#243e57",
    sleeve: "#c05b6e",
  },
  thanos: {
    cloth: "#76648e",
    pants: "#61577d",
    boot: "#b3945e",
    trim: "#d6b66c",
    sleeve: "#9982aa",
  },
  loki: {
    cloth: "#385f51",
    pants: "#40584e",
    boot: "#354c45",
    trim: "#c7af65",
    sleeve: "#506e58",
    cape: "#344e44",
  },
  jedi: {
    cloth: "#2a3741",
    pants: "#29383e",
    boot: "#25343c",
    trim: "#bcc7c1",
    sleeve: "#303f46",
  },
};
export function tint(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  return (
    "#" +
    [n >> 16, (n >> 8) & 255, n & 255]
      .map((v) =>
        Math.round(v + (amount >= 0 ? (255 - v) * amount : v * amount))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
