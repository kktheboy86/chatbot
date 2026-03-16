const chatEl = document.getElementById("chat");
const composerEl = document.getElementById("composer");
const inputEl = document.getElementById("promptInput");

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

appendMessage("Welcome. Your prompt will appear on the left, and my response appears on the right.", "bot");
