// Simple backend exposing /metrics
const express = require("express");
const os = require("os");
const cors = require("cors");   
const app = express();
const PORT = 5000;

app.use(cors()); 

app.get("/metrics", (req, res) => {
  const metrics = {
    hostname: os.hostname(),
    platform: os.platform(),
    osType: os.type(),
    arch: os.arch(),
    uptime_minutes: (os.uptime() / 60).toFixed(1),
    total_memory_mb: (os.totalmem() / 1024 / 1024).toFixed(0),
    free_memory_mb: (os.freemem() / 1024 / 1024).toFixed(0),
    cpu_count: os.cpus().length,
    cpu_model: os.cpus()[0].model,
    timestamp: new Date().toISOString()
  };
  res.json(metrics);
});

app.listen(PORT, () => {
  console.log(`✅ Metrics API running on http://localhost:${PORT}/metrics`);
});
