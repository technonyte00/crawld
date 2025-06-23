// crawler.js ahhhhhhhhhhhhhhhhhhghghgghfhh
const axios = require("axios");
const cheerio = require("cheerio");
const { config } = require("./config");

const visited = new Set();
const results = [];

async function crawl(url, depth = 0) {
  if (visited.has(url) || depth > config.maxDepth) return;
  visited.add(url);

  try {
    const res = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(res.data);

    const title = $("title").text() || "No title";
    const description = $('meta[name="description"]').attr("content") 
                     || $('meta[property="og:description"]').attr("content") 
                     || "No description";

    results.push({ url, title, description });

    if (depth < config.maxDepth) {
      const links = $("a[href]")
        .map((_, a) => new URL($(a).attr("href"), url).href)
        .get()
        .filter(href => href.startsWith("http"));

      for (let link of links) {
        await crawl(link, depth + 1);
      }
    }
  } catch (e) {
    results.push({ url, error: e.message });
  }
}

module.exports = { crawl, results, visited };
