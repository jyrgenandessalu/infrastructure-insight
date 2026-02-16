async function loadMetrics() {
  try {
    const res = await fetch("/api/metrics");
    const data = await res.json();
    document.getElementById("metrics").innerHTML = `
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
  } catch (err) {
    document.getElementById("metrics").innerText = "Error loading metrics.";
    console.error(err);
  }
}
loadMetrics();
setInterval(loadMetrics, 10000);
