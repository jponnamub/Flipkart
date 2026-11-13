const STORAGE_KEY = "interview-agent-studio.agents";

const demoAgent = {
  id: "demo-senior-product-coach",
  name: "Senior Product Coach",
  role: "Product Manager",
  company: "marketplace company",
  stage: "Final onsite loop",
  goals:
    "Help me sharpen product sense, metrics thinking, tradeoff explanations, and concise STAR stories.",
  support: ["Behavioral stories", "Case practice", "Role research"],
  tone: "Challenging mock interviewer",
  sessionLength: "30 minute mock interview",
  rules:
    "Ask one question at a time. Push for clearer metrics. End with a stronger sample answer.",
  createdAt: new Date().toISOString(),
};

let agents = loadAgents();
let activeAgentId = agents[0]?.id || null;

const form = document.querySelector("#agent-form");
const agentList = document.querySelector("#agent-list");
const activeAgent = document.querySelector("#active-agent");
const coachOutput = document.querySelector("#coach-output");
const practiceInput = document.querySelector("#practice-input");
const copyPromptButton = document.querySelector("#copy-prompt");
const coachButton = document.querySelector("#coach-button");
const clearAgentsButton = document.querySelector("#clear-agents");
const loadDemoButton = document.querySelector("#load-demo");
const toast = document.querySelector("#toast");

render();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const support = formData.getAll("support");

  const agent = {
    id: crypto.randomUUID(),
    name: normalizeText(formData.get("name")),
    role: normalizeText(formData.get("role")),
    company: normalizeText(formData.get("company")) || "your target company",
    stage: normalizeText(formData.get("stage")),
    goals: normalizeText(formData.get("goals")),
    support: support.length ? support : ["General interview coaching"],
    tone: normalizeText(formData.get("tone")),
    sessionLength: normalizeText(formData.get("sessionLength")),
    rules: normalizeText(formData.get("rules")),
    createdAt: new Date().toISOString(),
  };

  agents = [agent, ...agents];
  activeAgentId = agent.id;
  saveAgents();
  form.reset();
  render();
  showToast(`${agent.name} saved and selected.`);
  document.querySelector("#agents").scrollIntoView({ behavior: "smooth" });
});

loadDemoButton.addEventListener("click", () => {
  document.querySelector("#agent-name").value = demoAgent.name;
  document.querySelector("#target-role").value = demoAgent.role;
  document.querySelector("#company").value = demoAgent.company;
  document.querySelector("#stage").value = demoAgent.stage;
  document.querySelector("#goals").value = demoAgent.goals;
  document.querySelector("#tone").value = demoAgent.tone;
  document.querySelector("#session-length").value = demoAgent.sessionLength;
  document.querySelector("#rules").value = demoAgent.rules;

  document.querySelectorAll("input[name='support']").forEach((input) => {
    input.checked = demoAgent.support.includes(input.value);
  });

  showToast("Demo agent details loaded into the builder.");
});

coachButton.addEventListener("click", () => {
  const agent = getActiveAgent();

  if (!agent) {
    showToast("Create or select an agent first.");
    return;
  }

  const task = normalizeText(practiceInput.value);
  const plan = createCoachingPlan(agent, task);
  coachOutput.textContent = plan;
});

copyPromptButton.addEventListener("click", async () => {
  const agent = getActiveAgent();

  if (!agent) {
    return;
  }

  await copyText(createReusablePrompt(agent));
  showToast("Reusable prompt copied.");
});

clearAgentsButton.addEventListener("click", () => {
  if (!agents.length) {
    showToast("There are no saved agents to clear.");
    return;
  }

  const confirmed = window.confirm(
    "Clear all saved interview agents from this browser?"
  );

  if (!confirmed) {
    return;
  }

  agents = [];
  activeAgentId = null;
  saveAgents();
  render();
  showToast("Saved agents cleared.");
});

agentList.addEventListener("click", async (event) => {
  const action = event.target.closest("[data-action]");
  const card = event.target.closest("[data-agent-id]");

  if (!card) {
    return;
  }

  const agentId = card.dataset.agentId;

  if (!action) {
    activeAgentId = agentId;
    render();
    document.querySelector("#coach").scrollIntoView({ behavior: "smooth" });
    return;
  }

  const agent = agents.find((item) => item.id === agentId);

  if (!agent) {
    return;
  }

  if (action.dataset.action === "copy") {
    await copyText(createReusablePrompt(agent));
    showToast(`${agent.name} prompt copied.`);
  }

  if (action.dataset.action === "delete") {
    agents = agents.filter((item) => item.id !== agentId);
    if (activeAgentId === agentId) {
      activeAgentId = agents[0]?.id || null;
    }
    saveAgents();
    render();
    showToast(`${agent.name} deleted.`);
  }
});

agentList.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const card = event.target.closest("[data-agent-id]");
  if (!card || event.target.closest("[data-action]")) {
    return;
  }

  event.preventDefault();
  activeAgentId = card.dataset.agentId;
  render();
  document.querySelector("#coach").scrollIntoView({ behavior: "smooth" });
});

function render() {
  renderAgentList();
  renderActiveAgent();
}

function renderAgentList() {
  if (!agents.length) {
    agentList.innerHTML = `
      <div class="agent-card">
        <h3>No agents yet</h3>
        <p>Create your first interview helper above or load the demo to see how the studio works.</p>
      </div>
    `;
    return;
  }

  agentList.innerHTML = agents
    .map((agent) => {
      const tags = agent.support
        .slice(0, 3)
        .map((item) => `<span class="tag">${escapeHtml(item)}</span>`)
        .join("");

      return `
        <article
          class="agent-card ${agent.id === activeAgentId ? "is-active" : ""}"
          data-agent-id="${agent.id}"
          tabindex="0"
          aria-label="Select ${escapeHtml(agent.name)}"
        >
          <div>
            <h3>${escapeHtml(agent.name)}</h3>
            <p>${escapeHtml(agent.role)} - ${escapeHtml(agent.stage)}</p>
          </div>
          <p>${escapeHtml(truncate(agent.goals, 150))}</p>
          <div class="tag-row">${tags}</div>
          <div class="agent-actions">
            <button class="icon-button" type="button" data-action="copy">Copy prompt</button>
            <button class="icon-button" type="button" data-action="delete">Delete</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderActiveAgent() {
  const agent = getActiveAgent();
  copyPromptButton.disabled = !agent;

  if (!agent) {
    activeAgent.className = "active-agent-empty";
    activeAgent.textContent = "Create or select an agent to begin.";
    coachOutput.textContent = "Your generated prompt and coaching plan will appear here.";
    return;
  }

  activeAgent.className = "active-agent-summary";
  activeAgent.innerHTML = `
    <div>
      <h3>${escapeHtml(agent.name)}</h3>
      <p>${escapeHtml(agent.role)} for ${escapeHtml(agent.company)}</p>
    </div>
    <div class="tag-row">
      <span class="tag">${escapeHtml(agent.stage)}</span>
      <span class="tag">${escapeHtml(agent.tone)}</span>
      <span class="tag">${escapeHtml(agent.sessionLength)}</span>
    </div>
    <p>${escapeHtml(agent.goals)}</p>
  `;

  if (!coachOutput.textContent.trim() || coachOutput.textContent.includes("will appear here")) {
    coachOutput.textContent = createReusablePrompt(agent);
  }
}

function createReusablePrompt(agent) {
  const rules = agent.rules
    ? `\nSpecial rules: ${agent.rules}`
    : "\nSpecial rules: Ask clarifying questions when context is missing.";

  return `You are ${agent.name}, an interview preparation agent.

Target role: ${agent.role}
Company or industry: ${agent.company}
Interview stage: ${agent.stage}
Main goals: ${agent.goals}
Support areas: ${agent.support.join(", ")}
Coaching style: ${agent.tone}
Default session length: ${agent.sessionLength}${rules}

How to help:
1. Ask one focused question or give one focused task at a time.
2. Diagnose weak points in structure, specificity, role fit, and impact.
3. Give concrete rewrites, sample answers, rubrics, and practice drills.
4. Adapt to any interview-related request the user gives you, including planning, mock interviews, answer feedback, research, and negotiation.
5. End each response with the next best action for the user.`;
}

function createCoachingPlan(agent, task) {
  const actualTask =
    task ||
    `Prepare me for a ${agent.stage.toLowerCase()} for a ${agent.role} role.`;

  return `${createReusablePrompt(agent)}

Current user request:
${actualTask}

Coaching plan:
- Clarify the target outcome: what a strong answer or session should accomplish for ${agent.role}.
- Use the ${agent.support.join(", ")} focus areas to choose the right drill.
- Start with a concise structure the user can follow.
- Ask for missing context only if it changes the advice.
- Give feedback in three parts: what works, what is unclear, and the exact upgrade.

Suggested first response:
"Let's work on this in ${agent.sessionLength.toLowerCase()} mode. First, give me your rough answer or the facts you want to include. I will tighten it for ${agent.company}, point out gaps, and give you a stronger version to practice."`;
}

function getActiveAgent() {
  return agents.find((agent) => agent.id === activeAgentId) || null;
}

function loadAgents() {
  try {
    const storedAgents = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(storedAgents) ? storedAgents : [];
  } catch (error) {
    console.warn("Unable to load saved agents", error);
    return [];
  }
}

function saveAgents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
}

function normalizeText(value) {
  return String(value || "").trim();
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
