const $ = s => document.querySelector(s);
const messages = $("#messages");
const tracePanel = $("#tracePanel");
const traceContent = $("#traceContent");
let lastRun = null;

async function init() {
  try {
    const [health, skills] = await Promise.all([
      fetch("/api/health").then(r => r.json()),
      fetch("/api/skills").then(r => r.json())
    ]);
    $("#modeLabel").textContent = health.mode === "live" ? "LIVE MODEL" : "DEMO MODE";
    $("#statusDot").style.color = health.mode === "live" ? "var(--good)" : "var(--warn)";
    $("#skillList").innerHTML = skills.map(s =>
      `<div class="skill"><b>${escapeHtml(s.name)}</b><span>${escapeHtml(s.description)}</span></div>`
    ).join("");
  } catch {
    $("#modeLabel").textContent = "OFFLINE";
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

function addMessage(role, text, meta = "") {
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  el.innerHTML = `<div><div class="bubble">${escapeHtml(text)}</div>${meta ? `<div class="meta">${meta}</div>` : ""}</div>`;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

function showTrace(run) {
  lastRun = run;
  traceContent.innerHTML = `
    <div class="meta">Trace ID: ${escapeHtml(run.traceId)}</div>
    <div class="trace">
      ${run.timeline.map(e => `
        <div class="trace-item">
          <b>${escapeHtml(e.type.toUpperCase())}</b>
          <p>${escapeHtml(e.detail)}</p>
          ${e.confidence ? `<p>Confidence: ${Math.round(e.confidence*100)}%</p>` : ""}
        </div>
      `).join("")}
    </div>
    <div class="meta">Selected skills: ${run.selectedSkills.map(s => escapeHtml(s.name)).join(", ") || "None"}</div>
  `;
}

async function sendMessage(text) {
  if (!text.trim()) return;
  $(".welcome")?.remove();
  addMessage("user", text);
  $("#send").disabled = true;
  $("#send").textContent = "Working…";
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({message: text})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    addMessage("agent", data.answer, `Trace ${data.traceId.slice(0,8)} • ${data.mode.toUpperCase()} • ${Math.round(data.confidence*100)}% confidence`);
    showTrace(data);
  } catch (e) {
    addMessage("agent", `Error: ${e.message}`);
  } finally {
    $("#send").disabled = false;
    $("#send").textContent = "Send ↑";
  }
}

$("#composer").addEventListener("submit", e => {
  e.preventDefault();
  const input = $("#input");
  const text = input.value;
  input.value = "";
  sendMessage(text);
});

$("#input").addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    $("#composer").requestSubmit();
  }
});

document.querySelectorAll("[data-prompt]").forEach(btn =>
  btn.addEventListener("click", () => sendMessage(btn.dataset.prompt))
);

$("#traceBtn").addEventListener("click", () => tracePanel.classList.remove("hidden"));
$("#closeTrace").addEventListener("click", () => tracePanel.classList.add("hidden"));
$("#newChat").addEventListener("click", () => {
  messages.innerHTML = `<div class="welcome"><div class="orb">Y</div><h2>New mission.</h2><p>Give me a goal and I’ll build an execution trace.</p></div>`;
  traceContent.innerHTML = `<p class="muted">Run a mission to see the agent trace.</p>`;
});

init();
