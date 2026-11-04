import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { font } from "./brand";

// Inter (giấy phép SIL OFL 1.1) — đủ dấu tiếng Việt. File nằm trong public/fonts.
const faces = [
  { family: font.display, file: "InterDisplay-Bold.otf", weight: "700" },
  { family: font.display, file: "InterDisplay-ExtraBold.otf", weight: "800" },
  { family: font.display, file: "InterDisplay-Black.otf", weight: "900" },
  { family: font.body, file: "Inter-SemiBold.otf", weight: "600" },
];

export const loadFonts = () =>
  Promise.all(
    faces.map((f) =>
      loadFont({ family: f.family, url: staticFile(`fonts/${f.file}`), weight: f.weight }),
    ),
  );
