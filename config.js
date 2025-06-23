const config = {
  maxDepth: 2,
  seedUrls: [
    "https://example.com",
    "https://railway.app"
  ]
};

function updateConfig(newConfig) {
  if (newConfig.maxDepth !== undefined) {
    config.maxDepth = parseInt(newConfig.maxDepth, 10) || config.maxDepth;
  }
  if (newConfig.seedUrls) {
    config.seedUrls = newConfig.seedUrls.filter(url => url.trim()).map(url => url.trim());
  }
}

module.exports = { config, updateConfig };
