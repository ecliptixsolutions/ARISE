import { readFileSync, writeFileSync } from "node:fs";

const path = ".output/server/wrangler.json";
const config = JSON.parse(readFileSync(path, "utf8"));

config.name = "arisehealthcaresolutions";
config.kv_namespaces = [
  {
    binding: "BLOG_IMAGES",
    id: "9faf82cdc005460484b2199f50c87c65",
  },
];

writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
