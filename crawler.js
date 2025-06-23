// crawler.js dufhjerthgrjfhugtrfuhgt
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
  if (visited.has(url) || depth > config.maxDepth) return;
  visited.add(url);

  progress.total++;
  try {
    const res = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(res.data);

    const title = $("title").text() || "No title";
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "No description";

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

      for (let link of links) {
        await crawl(link, depth + 1);
      }
    }
  } catch (e) {
    results.push({ url, error: e.message });
  } finally {
    progress.done++;
  }
}

module.exports = { crawl, results, visited, progress };
