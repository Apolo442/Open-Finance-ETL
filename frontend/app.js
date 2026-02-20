/**
 * Hub Open Finance - Lógica do Front-end
 * Funcionalidades: Busca, Listagem, Filtros, Gráficos e Tabelas
 */

let chartInstance = null;
let allUsers = []; // Cache local para permitir filtros rápidos sem novas chamadas de rede

// --- 1. Inicialização e Event Listeners ---

window.addEventListener("DOMContentLoaded", () => {
  loadUserList(); // Popula a barra lateral
  fetchData(); // Busca o usuário padrão (USER-901 ou o que estiver no input)
});

// Busca manual (Botão e Enter)
document.getElementById("fetchBtn").addEventListener("click", fetchData);
document.getElementById("customerId").addEventListener("keypress", (e) => {
  if (e.key === "Enter") fetchData();
});

// Filtro de Ordenação na Barra Lateral
document.getElementById("sortOrder").addEventListener("change", renderUserList);

// Sorteio de Usuário Aleatório
document.getElementById("randomBtn").addEventListener("click", fetchRandomUser);

// --- 2. Funções de Busca (API) ---

/**
 * Busca os dados detalhados de um cliente específico
 */
async function fetchData() {
  const customerId = document.getElementById("customerId").value.trim();
  if (!customerId) return;

  // UI Feedback: Mostra loading e limpa estados anteriores
  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("error").classList.add("hidden");

  try {
    const response = await fetch(`/api/v1/score?customerId=${customerId}`);
    const result = await response.json();

    if (result.status === "success" && result.data) {
      // Normaliza a resposta (n8n pode devolver objeto ou array de 1 posição)
      const userData = Array.isArray(result.data)
        ? result.data[0]
        : result.data;
      updateDashboard(userData);
    } else {
      throw new Error("Cliente não encontrado.");
    }
  } catch (err) {
    console.error("Erro na busca:", err);
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("error").classList.remove("hidden");
  }
}

/**
 * Carrega a lista completa de usuários para a barra lateral
 */
async function loadUserList() {
  try {
    const response = await fetch("/api/v1/users");
    const result = await response.json();

    if (result.status === "success" && result.data) {
      allUsers = result.data;
      renderUserList();
    }
  } catch (err) {
    console.error("Erro ao carregar lista lateral:", err);
  }
}

/**
 * Sorteia um ID no backend e carrega os detalhes
 */
async function fetchRandomUser() {
  const btn = document.getElementById("randomBtn");
  btn.classList.add("animate-pulse");

  try {
    const response = await fetch("/api/v1/random-user");
    const result = await response.json();

    if (result.status === "success" && result.customerId) {
      document.getElementById("customerId").value = result.customerId;
      fetchData();
    }
  } catch (err) {
    console.error("Erro no sorteio:", err);
  } finally {
    btn.classList.remove("animate-pulse");
  }
}

// --- 3. Renderização da Interface ---

/**
 * Renderiza a lista de usuários na barra lateral com base na ordenação escolhida
 */
function renderUserList() {
  const container = document.getElementById("userList");
  const sortVal = document.getElementById("sortOrder").value;

  // Lógica de Ordenação
  let sorted = [...allUsers];
  if (sortVal === "desc") {
    sorted.sort((a, b) => b.credit_score - a.credit_score);
  } else if (sortVal === "asc") {
    sorted.sort((a, b) => a.credit_score - b.credit_score);
  } else if (sortVal === "esg") {
    // Ordena da maior nota ESG para a menor
    sorted.sort((a, b) => (b.esg_score || 0) - (a.esg_score || 0));
  }

  container.innerHTML = ""; // Limpa a lista atual

  sorted.forEach((user) => {
    const div = document.createElement("div");

    // Cor do Score na lista (Verde/Amarelo/Vermelho)
    const scoreColor =
      user.credit_score >= 700
        ? "text-emerald-600"
        : user.credit_score >= 400
          ? "text-yellow-600"
          : "text-red-600";

    div.className =
      "p-3 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-white transition-all flex justify-between items-center group shadow-sm";

    div.onclick = () => {
      document.getElementById("customerId").value = user.customer_id;
      fetchData();
      // Scroll suave para o topo no mobile ao selecionar
      if (window.innerWidth < 1024)
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    div.innerHTML = `
            <div>
                <p class="text-xs font-bold text-slate-700 group-hover:text-indigo-600">${user.customer_id}</p>
                <p class="text-[10px] text-slate-400 uppercase font-medium">ESG: ${user.esg_score || 0}</p>
            </div>
            <div class="text-right">
                <span class="text-sm font-black ${scoreColor}">${user.credit_score}</span>
            </div>
        `;
    container.appendChild(div);
  });
}

/**
 * Atualiza todos os elementos visuais do Dashboard principal
 */
function updateDashboard(data) {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");

  // 1. Credit Score
  const score = data.credit_score;
  document.getElementById("creditScore").innerText = score;
  const scoreBar = document.getElementById("scoreBar");

  setTimeout(() => {
    scoreBar.style.width = `${(score / 1000) * 100}%`;
  }, 100);

  scoreBar.className =
    "h-2.5 rounded-full transition-all duration-1000 ease-out ";
  if (score >= 700) scoreBar.className += "bg-emerald-500";
  else if (score >= 400) scoreBar.className += "bg-yellow-400";
  else scoreBar.className += "bg-red-500";

  // 2. ESG Score
  const esg = parseFloat(data.esg_score || 0);
  document.getElementById("esgScore").innerText = esg.toFixed(1);
  const esgLabel = document.getElementById("esgLabel");

  if (esg >= 7) {
    esgLabel.innerText = "Sustentável (Bônus Verde)";
    esgLabel.className =
      "mt-3 text-xs font-bold text-emerald-700 bg-emerald-100 inline-block px-3 py-1 rounded-full text-center w-full";
  } else if (esg >= 4) {
    esgLabel.innerText = "Impacto Moderado";
    esgLabel.className =
      "mt-3 text-xs font-bold text-yellow-700 bg-yellow-100 inline-block px-3 py-1 rounded-full text-center w-full";
  } else {
    esgLabel.innerText = "Alto Risco ESG";
    esgLabel.className =
      "mt-3 text-xs font-bold text-red-700 bg-red-100 inline-block px-3 py-1 rounded-full text-center w-full";
  }

  // 3. Metadados e Data
  const dateObj = data.last_updated ? new Date(data.last_updated) : new Date();
  document.getElementById("lastUpdated").innerText =
    dateObj.toLocaleString("pt-BR");

  // 4. Processamento de Transações
  let transactions = [];
  if (typeof data.transactions_enriched === "string") {
    try {
      transactions = JSON.parse(data.transactions_enriched);
    } catch (e) {
      transactions = [];
    }
  } else {
    transactions = data.transactions_enriched || [];
  }

  renderChart(transactions);
  renderTable(transactions);
}

// --- 4. Componentes Gráficos ---

function renderChart(transactions) {
  const ctx = document.getElementById("categoryChart").getContext("2d");
  const counts = { Investment: 0, Essential: 0, Leisure: 0, Outros: 0 };

  transactions.forEach((tx) => {
    const cat = tx.category_enriched;
    if (counts[cat] !== undefined) counts[cat]++;
    else counts["Outros"]++;
  });

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Investimentos", "Essenciais", "Lazer", "Outros"],
      datasets: [
        {
          data: [
            counts["Investment"],
            counts["Essential"],
            counts["Leisure"],
            counts["Outros"],
          ],
          backgroundColor: ["#10b981", "#3b82f6", "#f43f5e", "#94a3b8"],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "75%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 10, padding: 20, font: { size: 11 } },
        },
      },
    },
  });
}

function renderTable(transactions) {
  const tbody = document.getElementById("transactionsTableBody");
  tbody.innerHTML = "";

  // Exibe as 6 primeiras transações para não quebrar o layout
  const displayTx = transactions.slice(0, 6);

  displayTx.forEach((tx) => {
    const tr = document.createElement("tr");
    tr.className =
      "border-b border-slate-100 hover:bg-slate-50 transition-colors";

    let catBadge = "";
    if (tx.category_enriched === "Investment")
      catBadge =
        '<span class="px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">Investment</span>';
    else if (tx.category_enriched === "Essential")
      catBadge =
        '<span class="px-2 py-1 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">Essential</span>';
    else if (tx.category_enriched === "Leisure")
      catBadge =
        '<span class="px-2 py-1 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase">Leisure</span>';
    else
      catBadge = `<span class="px-2 py-1 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">${tx.category_enriched || "Outros"}</span>`;

    const txId = tx.id || tx.transaction_id || "-";

    tr.innerHTML = `
            <td class="p-3 text-slate-500 font-mono text-[10px]">${txId}</td>
            <td class="p-3">${catBadge}</td>
            <td class="p-3 font-semibold text-slate-700 text-sm">${tx.esg_score || 0} / 10</td>
        `;
    tbody.appendChild(tr);
  });
}
