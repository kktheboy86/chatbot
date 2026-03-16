const chatEl = document.getElementById("chat");
const composerEl = document.getElementById("composer");
const inputEl = document.getElementById("promptInput");

const tabButtons = document.querySelectorAll(".tab-button");
const chatPanel = document.getElementById("panel-chatbot");
const explorePanel = document.getElementById("panel-explore");

const metricSelectEl = document.getElementById("metricSelect");
const metricSampleEl = document.getElementById("metricSample");
const graphsEl = document.getElementById("graphs");

const metricPool = [
  "Customer Churn Rate",
  "Weekly Active Users",
  "Average Resolution Time",
  "Net Promoter Score",
  "Revenue Per Customer",
  "Transaction Success Rate",
  "Cost to Serve"
];

const graphTitles = [
  "Monthly Trend",
  "Quarterly Comparison",
  "Region Split",
  "Forecast Window",
  "Daily Movement",
  "Conversion Pattern"
];

function appendMessage(text, role, extraClass = "") {
  const item = document.createElement("div");
  item.className = `message ${role} ${extraClass}`.trim();
  item.textContent = text;
  chatEl.appendChild(item);
  chatEl.scrollTop = chatEl.scrollHeight;
  return item;
}

function buildResponse(prompt) {
  const value = prompt.toLowerCase();

  if (value.includes("hello") || value.includes("hi")) {
    return "Hi! Ask me anything and I will reply right here.";
  }

  if (value.includes("time")) {
    return `Current time is ${new Date().toLocaleTimeString()}.`;
  }

  if (value.includes("date")) {
    return `Today is ${new Date().toLocaleDateString()}.`;
  }

  return `You asked: "${prompt}"\n\nThis is a demo chatbot response. Replace this logic with an API call for real AI answers.`;
}

function switchTab(tabName) {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  const showChat = tabName === "chatbot";
  chatPanel.classList.toggle("active", showChat);
  explorePanel.classList.toggle("active", !showChat);

  if (!showChat) {
    renderGraphs();
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sampleText(metric) {
  const change = randomInt(-8, 14);
  const direction = change >= 0 ? "up" : "down";
  return `${metric} is ${direction} ${Math.abs(change)}% versus the previous period. This is sample text to preview the metrics insight area.`;
}

function seriesToPath(values, width, height, padding) {
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = max - min || 1;

  return values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * usableWidth;
      const y = height - padding - ((value - min) / spread) * usableHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function makeGraphSvg() {
  const width = 320;
  const height = 170;
  const padding = 14;
  const values = Array.from({ length: 10 }, () => randomInt(20, 100));
  const path = seriesToPath(values, width, height, padding);

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Sample metric graph">
      <line x1="14" y1="145" x2="306" y2="145" stroke="#cbd5e1" stroke-width="1" />
      <line x1="14" y1="20" x2="14" y2="145" stroke="#cbd5e1" stroke-width="1" />
      <path d="${path}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;

  return svg;
}

function renderGraphs() {
  graphsEl.innerHTML = "";
  const titles = shuffle(graphTitles).slice(0, 4);

  titles.forEach((title) => {
    const card = document.createElement("article");
    card.className = "graph-card";
    card.innerHTML = `<h3>${title}</h3>${makeGraphSvg()}`;
    graphsEl.appendChild(card);
  });
}

function setupMetrics() {
  const selectedMetrics = shuffle(metricPool).slice(0, 3);

  selectedMetrics.forEach((metric) => {
    const option = document.createElement("option");
    option.value = metric;
    option.textContent = metric;
    metricSelectEl.appendChild(option);
  });

  metricSelectEl.addEventListener("change", () => {
    const metric = metricSelectEl.value;
    if (!metric) {
      metricSampleEl.textContent = "Pick a metric to display a sample summary.";
      return;
    }

    metricSampleEl.textContent = sampleText(metric);
    renderGraphs();
  });
}

composerEl.addEventListener("submit", (event) => {
  event.preventDefault();

  const prompt = inputEl.value.trim();
  if (!prompt) return;

  appendMessage(prompt, "user");
  inputEl.value = "";

  const typingBubble = appendMessage("Typing...", "bot", "typing");

  setTimeout(() => {
    typingBubble.remove();
    appendMessage(buildResponse(prompt), "bot");
  }, 500);
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchTab(button.dataset.tab);
  });
});

setupMetrics();
renderGraphs();
appendMessage(
  "Welcome. Your prompt appears on the left, and my response appears on the right.",
  "bot"
);
