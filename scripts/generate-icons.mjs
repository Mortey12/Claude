import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../public/icons");
mkdirSync(outDir, { recursive: true });

const jobs = [
  { src: "icon-source.svg", out: "icon-192.png", size: 192 },
  { src: "icon-source.svg", out: "icon-512.png", size: 512 },
  { src: "icon-source.svg", out: "icon-180.png", size: 180 },
  { src: "icon-source.svg", out: "icon-32.png", size: 32 },
  { src: "icon-maskable-source.svg", out: "icon-maskable-512.png", size: 512 },
];

for (const job of jobs) {
  const srcPath = path.resolve(__dirname, job.src);
  const outPath = path.join(outDir, job.out);
  await sharp(srcPath).resize(job.size, job.size).png().toFile(outPath);
  console.log("wrote", outPath);
}
