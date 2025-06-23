// crawler.js
const axios = require("axios");
const cheerio = require("cheerio");
const { config } = require("./config");

const visited = new Set();
const results = [];
const progress = {
  total: 0,
  done: 0,
};

async function crawl(url, depth = 0) {
  if (visited.has(url) || depth > config.maxDepth) {
    console.log(`Skipping ${url} (visited or depth ${depth} too deep)`);
    return;
  }
  visited.add(url);

  progress.total++;
  console.log(`➡️ Crawling URL: ${url} (depth ${depth})`);

  try {
    const res = await axios.get(url, { timeout: 8000 });
    const $ = cheerio.load(res.data);

    const title = $("title").text().trim() || "No title";
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "No description";

    console.log(`✅ Fetched: ${url}`);
    console.log(`🔖 Title: ${title}`);
    console.log(`📝 Description: ${description.substring(0, 100)}${description.length > 100 ? "..." : ""}`);

    results.push({ url, title, description });

    if (depth < config.maxDepth) {
      const links = $("a[href]")
        .map((_, a) => {
          try {
            return new URL($(a).attr("href"), url).href;
          } catch {
            return null;
          }
        })
        .get()
        .filter((href) => href && href.startsWith("http"));

      console.log(`🔗 Found ${links.length} links on ${url}`);

      for (const link of links) {
        await crawl(link, depth + 1);
      }
    }
  } catch (e) {
    console.error(`❌ Failed to crawl ${url}: ${e.message}`);
    results.push({ url, error: e.message });
  } finally {
    progress.done++;
    console.log(`✅ Done ${progress.done} of ${progress.total}`);
  }
}

module.exports = { crawl, results, progress };
