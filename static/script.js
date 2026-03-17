const chatEl = document.getElementById("chat");
const composerEl = document.getElementById("composer");
const inputEl = document.getElementById("promptInput");

const tabButtons = document.querySelectorAll(".tab-button");
const chatPanel = document.getElementById("panel-chatbot");
const explorePanel = document.getElementById("panel-explore");

const metricSelectEl = document.getElementById("metricSelect");
const metricSampleEl = document.getElementById("metricSample");
const graphsEl = document.getElementById("graphs");
const apiTimeInfoUrl = window.API_TIME_INFO_URL || "/api/time-info";

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

function buildDateTimePayload() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8);
  return { date, time };
}

async function parseApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const textBody = await response.text();
  return { error: textBody || "Non-JSON response from backend." };
}

function uniqueUrls(urls) {
  const seen = new Set();
  const result = [];

  urls.forEach((urlValue) => {
    const absolute = new URL(urlValue, window.location.origin).toString();
    if (!seen.has(absolute)) {
      seen.add(absolute);
      result.push(absolute);
    }
  });

  return result;
}

function buildApiCandidates() {
  const path = window.location.pathname;
  const basePath = path.endsWith("/") ? path : `${path.substring(0, path.lastIndexOf("/") + 1)}`;

  return uniqueUrls([
    apiTimeInfoUrl,
    "/api/time-info",
    "api/time-info",
    `${basePath}api/time-info`
  ]);
}

async function fetchTimeInfoWithGet(payload, baseUrl) {
  const getUrl = new URL(baseUrl);
  getUrl.search = new URLSearchParams(payload).toString();
  const response = await fetch(getUrl.toString());
  const responseData = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(responseData.error || "GET request failed");
  }

  return responseData;
}

async function fetchTimeInfo(payload) {
  const candidates = buildApiCandidates();
  let lastError = "API not found.";

  for (const candidateUrl of candidates) {
    try {
      const response = await fetch(candidateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseData = await parseApiResponse(response);

      if (!response.ok) {
        if (response.status === 404) {
          lastError = `Not found at ${candidateUrl}`;
          continue;
        }

        const backendMessage = String(responseData.error || "Request failed");
        if (backendMessage.toLowerCase().includes("csrf")) {
          return fetchTimeInfoWithGet(payload, candidateUrl);
        }

        lastError = backendMessage;
        continue;
      }

      return responseData;
    } catch (error) {
      lastError = error.message || "Network error.";
      continue;
    }
  }

  throw new Error(lastError);
}

composerEl.addEventListener("submit", async (event) => {
  event.preventDefault();

  const prompt = inputEl.value.trim();
  if (!prompt) return;

  appendMessage(prompt, "user");
  inputEl.value = "";

  const typingBubble = appendMessage("Sending to Flask...", "bot", "typing");

  try {
    const payload = buildDateTimePayload();
    const backendResponse = await fetchTimeInfo(payload);
    typingBubble.remove();
    appendMessage(`Flask extracted values:\n${JSON.stringify(backendResponse, null, 2)}`, "bot");
  } catch (error) {
    typingBubble.remove();
    appendMessage(`Backend error: ${error.message}`, "bot");
  }
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchTab(button.dataset.tab);
  });
});

setupMetrics();
renderGraphs();
appendMessage(
  "Welcome. Send a prompt and I will call Flask with date/time JSON, then show the returned time info.",
  "bot"
);
