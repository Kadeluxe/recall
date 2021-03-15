import * as fg from "fast-glob";
import * as fs from "fs";
import * as path from "path";

const rootPath = path.resolve(__dirname, "../..");

const search = [
  "packages/*/dist",
  "packages/*/tsconfig.tsbuildinfo",
];

fg
  .sync(
    search.map(x => path.resolve(rootPath, x).replaceAll("\\", "/")),
    {onlyFiles: false},
  )
  .forEach(x => fs.rmSync(x, {recursive: true}));
