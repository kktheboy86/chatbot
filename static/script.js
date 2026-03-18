const chatEl = document.getElementById("chat");
const tabButtons = document.querySelectorAll(".tab-button");
const chatPanel = document.getElementById("panel-chatbot");
const explorePanel = document.getElementById("panel-explore");
const metricSelectEl = document.getElementById("metricSelect");
const metricSampleEl = document.getElementById("metricSample");
const graphsEl = document.getElementById("graphs");

// Tabs
function switchTab(tabName) {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  const showChat = tabName === "chatbot";
  chatPanel.classList.toggle("active", showChat);
  explorePanel.classList.toggle("active", !showChat);

  if (!showChat) renderGraphs();
}

// Metrics
const metricPool = [
  "Customer Churn Rate",
  "Weekly Active Users",
  "Average Resolution Time",
  "Net Promoter Score",
  "Revenue Per Customer",
  "Transaction Success Rate",
  "Cost to Serve"
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function sampleText(metric) {
  const change = randomInt(-8, 14);
  const direction = change >= 0 ? "up" : "down";
  return `${metric} is ${direction} ${Math.abs(change)}% vs previous period.`;
}

function renderGraphs() {
  graphsEl.innerHTML = "<p>Sample graphs rendered here.</p>";
}

function setupMetrics() {
  shuffle(metricPool).slice(0, 3).forEach((metric) => {
    const option = document.createElement("option");
    option.value = metric;
    option.textContent = metric;
    metricSelectEl.appendChild(option);
  });

  metricSelectEl.addEventListener("change", () => {
    const metric = metricSelectEl.value;
    metricSampleEl.textContent = metric
      ? sampleText(metric)
      : "Pick a metric.";
    renderGraphs();
  });
}

// Init
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

setupMetrics();
renderGraphs();

// Auto-scroll chat
if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;

// Auto-focus input
const inputEl = document.getElementById("promptInput");
if (inputEl) inputEl.focus();
