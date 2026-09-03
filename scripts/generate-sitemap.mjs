// Writes public/sitemap.xml. Run: node scripts/generate-sitemap.mjs
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://nebula-cascade.com";

const entries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/film", changefreq: "monthly", priority: "0.8" },
  { path: "/work/yourtruths", changefreq: "monthly", priority: "0.9" },
  { path: "/work/nebula-cascade", changefreq: "monthly", priority: "0.8" },
];

const urls = entries
  .map(
    (e) => `  <url>
    <loc>${BASE_URL}${e.path}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(resolve(__dirname, "../public/sitemap.xml"), xml);
console.log(`sitemap.xml written (${entries.length} entries)`);
