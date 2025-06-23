// server.js rawr
const express = require("express");
const fs = require("fs");
const path = require("path");
const { crawl, results } = require("./crawler");
const { config, updateConfig } = require("./config");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.post("/start", async (req, res) => {
  updateConfig(req.body);
  results.length = 0;

  for (const url of config.seedUrls) {
    await crawl(url);
  }

  if (!fs.existsSync("data")) fs.mkdirSync("data");
  fs.writeFileSync("data/results.json", JSON.stringify(results, null, 2));

  res.json({ done: true, total: results.length });
});

app.get("/results", (req, res) => {
  const resultsPath = path.join(__dirname, "data/results.json");
  if (fs.existsSync(resultsPath)) {
    const data = fs.readFileSync(resultsPath, "utf-8");
    res.type("json").send(data);
  } else {
    res.json([]);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
