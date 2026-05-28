function goTo(page) {
    window.location.href = page;
}

let chartType = "bar";
let chart;
let income = 0, expense = 0, savings = 0;

// ── RICH DEMO DATA (shared across all pages) ──
const DEMO_TRANSACTIONS = [
    { date: "2026-05-01", amount: 52000, type: "income",  category: "Salary",    description: "Monthly Salary" },
    { date: "2026-05-02", amount: 4200,  type: "expense", category: "Food",      description: "Groceries & Dining" },
    { date: "2026-05-04", amount: 1800,  type: "expense", category: "Travel",    description: "Petrol & Cab" },
    { date: "2026-05-06", amount: 12000, type: "income",  category: "Freelance", description: "Client Project" },
    { date: "2026-05-08", amount: 5500,  type: "expense", category: "Shopping",  description: "Clothing & Electronics" },
    { date: "2026-05-10", amount: 2200,  type: "expense", category: "Bills",     description: "Electricity & Net" },
    { date: "2026-05-12", amount: 8000,  type: "income",  category: "Bonus",     description: "Performance Bonus" },
    { date: "2026-05-14", amount: 3100,  type: "expense", category: "Food",      description: "Restaurant Outings" },
    { date: "2026-05-16", amount: 1500,  type: "expense", category: "Health",    description: "Pharmacy & Doctor" },
    { date: "2026-05-18", amount: 4500,  type: "income",  category: "Rent",      description: "Tenant Rent Received" },
    { date: "2026-05-20", amount: 2800,  type: "expense", category: "Shopping",  description: "Amazon Order" },
    { date: "2026-05-22", amount: 900,   type: "expense", category: "Travel",    description: "Weekend Trip" },
    { date: "2026-05-24", amount: 6000,  type: "income",  category: "Freelance", description: "Design Work" },
    { date: "2026-05-25", amount: 1200,  type: "expense", category: "Bills",     description: "Mobile Recharge & OTT" },
    { date: "2026-05-27", amount: 3500,  type: "expense", category: "Food",      description: "Weekly Groceries" }
];

function getTransactions() {
    let stored = JSON.parse(localStorage.getItem("transactions")) || [];
    return stored.length > 0 ? stored : DEMO_TRANSACTIONS;
}

// ── ANIMATION ──
function animateValue(id, start, end, duration) {
    let range = end - start;
    let current = start;
    let increment = end > start ? 1 : -1;
    let stepTime = Math.abs(Math.floor(duration / (range || 1)));
    let obj = document.getElementById(id);
    let timer = setInterval(() => {
        current += increment;
        obj.innerText = current.toLocaleString("en-IN");
        if (current == end) clearInterval(timer);
    }, stepTime);
}

// ── TOGGLE CHART ──
function toggleChart() {
    chartType = chartType === "bar" ? "pie" : "bar";
    loadChart();
}

// ── LOAD CHART ──
function loadChart() {
    if (chart) chart.destroy();
    chart = new Chart(document.getElementById("myChart"), {
        type: chartType,
        data: {
            labels: ["Income", "Expense", "Savings"],
            datasets: [{
                label: "Amount (₹)",
                data: [income, expense, savings],
                backgroundColor: ["#2ecc71", "#e63946", "#457b9d"],
                borderWidth: 2,
                borderColor: ["#27ae60", "#c0392b", "#1d3557"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: chartType === "pie" ? "right" : "top",
                    labels: { font: { size: 13 }, color: "#333" }
                },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            return " ₹" + ctx.parsed.toLocaleString("en-IN");
                        }
                    }
                }
            },
            scales: chartType === "bar" ? {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: v => "₹" + v.toLocaleString("en-IN")
                    }
                }
            } : {}
        }
    });
}

// ════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════
if (window.location.pathname.includes("index.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/")) {

    let transactions = getTransactions();

    transactions.forEach(t => {
        if (t.type === "income") income += Number(t.amount);
        else expense += Number(t.amount);
    });
    savings = income - expense;

    animateValue("income",  0, income,  1000);
    animateValue("expense", 0, expense, 1000);
    animateValue("savings", 0, savings, 1000);

    setTimeout(() => loadChart(), 300);

    // Smart Insights
    const ratio = expense / income;
    let insights = [];
    if (ratio < 0.5)       insights.push("🔥 Excellent! You are saving more than 50% of your income.");
    else if (ratio < 0.75) insights.push("✅ Good balance — keep reducing discretionary spending.");
    else if (ratio < 1)    insights.push("⚠️ Spending is high. Try budgeting your top categories.");
    else                   insights.push("🚨 Expenses exceed income! Take immediate action.");

    const topCat = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
        topCat[t.category] = (topCat[t.category] || 0) + t.amount;
    });
    const sorted = Object.entries(topCat).sort((a,b) => b[1]-a[1]);
    if (sorted.length > 0) insights.push(`📊 Highest spend: <strong>${sorted[0][0]}</strong> — ₹${sorted[0][1].toLocaleString("en-IN")}`);
    insights.push(`💰 Net Savings this period: <strong>₹${savings.toLocaleString("en-IN")}</strong>`);

    document.getElementById("insightList").innerHTML = insights.map(i => `<li>${i}</li>`).join("");

    // Recent Transactions
    const recentList = document.getElementById("recentList");
    recentList.innerHTML = "";
    transactions.slice(-6).reverse().forEach(t => {
        const div = document.createElement("div");
        div.className = "transaction-item";
        div.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0;";
        div.innerHTML = `
            <div>
                <span style="font-weight:600;color:#333">${t.description || t.category}</span>
                <span style="font-size:12px;color:#888;display:block">${t.date} · ${t.category}</span>
            </div>
            <span style="font-weight:700;color:${t.type==='income'?'#2ecc71':'#e63946'};font-size:16px">
                ${t.type==='income'?'+':'-'}₹${Number(t.amount).toLocaleString("en-IN")}
            </span>`;
        recentList.appendChild(div);
    });
}

// ════════════════════════════════════════════
//  ANALYTICS
// ════════════════════════════════════════════
if (window.location.pathname.includes("analytics.html")) {

    let transactions = getTransactions();
    let totalIncome = 0, totalExpense = 0;
    let monthly = {}, categories = {};

    transactions.forEach(t => {
        const amt = Number(t.amount);
        if (t.type === "income") totalIncome += amt;
        else totalExpense += amt;

        const month = t.date ? new Date(t.date).toLocaleString("default", { month: "short" }) : "N/A";
        if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };
        if (t.type === "income") monthly[month].income += amt;
        else monthly[month].expense += amt;

        if (t.type === "expense") {
            categories[t.category] = (categories[t.category] || 0) + amt;
        }
    });

    function createChart(ctxId, config) {
        return new Chart(document.getElementById(ctxId), {
            ...config,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "right",
                        labels: { boxWidth: 12, font: { size: 12 }, color: "#333" }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => " ₹" + Number(ctx.parsed.toFixed ? ctx.parsed : ctx.raw).toLocaleString("en-IN")
                        }
                    }
                },
                animation: { duration: 1200, easing: "easeOutBounce" }
            }
        });
    }

    // Income vs Expense Doughnut
    createChart("compareChart", {
        type: "doughnut",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{ data: [totalIncome, totalExpense], backgroundColor: ["#2ecc71", "#e63946"], borderWidth: 2 }]
        }
    });

    // Monthly Line Chart
    const months = Object.keys(monthly);
    createChart("monthlyChart", {
        type: "line",
        data: {
            labels: months,
            datasets: [
                {
                    label: "Income",
                    data: months.map(m => monthly[m].income),
                    borderColor: "#2ecc71", backgroundColor: "rgba(46,204,113,0.1)",
                    tension: 0.4, fill: true, pointRadius: 5
                },
                {
                    label: "Expense",
                    data: months.map(m => monthly[m].expense),
                    borderColor: "#e63946", backgroundColor: "rgba(230,57,70,0.1)",
                    tension: 0.4, fill: true, pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top", labels: { font: { size: 12 } } },
                tooltip: { callbacks: { label: ctx => " ₹" + ctx.parsed.y.toLocaleString("en-IN") } }
            },
            scales: {
                y: { beginAtZero: true, ticks: { callback: v => "₹" + v.toLocaleString("en-IN") } }
            }
        }
    });

    // Category Pie
    const catColors = ["#9d0208","#e63946","#ff6b6b","#ff9f1c","#457b9d","#2ecc71","#8338ec"];
    createChart("categoryChart", {
        type: "pie",
        data: {
            labels: Object.keys(categories),
            datasets: [{ data: Object.values(categories), backgroundColor: catColors, borderWidth: 2 }]
        }
    });

    // AI Insights
    const insightEl = document.getElementById("aiInsights");
    if (insightEl) {
        const ratio = totalExpense / totalIncome;
        const topCat = Object.entries(categories).sort((a,b)=>b[1]-a[1]);
        insightEl.innerHTML = [
            `💡 Expense ratio: <strong>${(ratio*100).toFixed(1)}%</strong> of income`,
            topCat[0] ? `🏆 Top spend: <strong>${topCat[0][0]}</strong> (₹${topCat[0][1].toLocaleString("en-IN")})` : "",
            `💰 Net savings: <strong>₹${(totalIncome-totalExpense).toLocaleString("en-IN")}</strong>`,
            ratio < 0.6 ? "✅ Great financial health!" : ratio < 0.9 ? "⚠️ Moderate spend — watch expenses" : "🚨 Overspending alert!"
        ].filter(Boolean).map(i => `<li>${i}</li>`).join("");
    }
}

// ════════════════════════════════════════════
//  BUDGET (Analytics page)
// ════════════════════════════════════════════
function setBudget() {
    const input = document.getElementById("budgetInput").value;
    const status = document.getElementById("budgetStatus");
    if (!input) return;
    const budget = Number(input);
    const transactions = getTransactions();
    const totalExpense = transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
    if (totalExpense > budget) {
        status.innerText = `🚨 Budget Exceeded! Spent ₹${totalExpense.toLocaleString("en-IN")} vs Budget ₹${budget.toLocaleString("en-IN")}`;
        status.style.color = "red";
    } else {
        status.innerText = `✅ Within Budget! Spent ₹${totalExpense.toLocaleString("en-IN")} of ₹${budget.toLocaleString("en-IN")}`;
        status.style.color = "green";
    }
}

// ════════════════════════════════════════════
//  ADD TRANSACTION
// ════════════════════════════════════════════
function saveTransaction() {
    const date        = document.getElementById("date").value;
    const amount      = document.getElementById("amount").value;
    const type        = document.getElementById("type").value;
    const category    = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const message     = document.getElementById("message");

    if (!date || !amount || !type || !category || !description) {
        message.innerText = "⚠️ Please fill all fields!";
        message.style.color = "red";
        return;
    }

    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    transactions.push({ date, amount: Number(amount), type, category, description });
    localStorage.setItem("transactions", JSON.stringify(transactions));

    message.innerText = "✅ Transaction Saved Successfully!";
    message.style.color = "green";

    document.getElementById("date").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("type").value = "";
    document.getElementById("category").value = "";
    document.getElementById("description").value = "";
}

// ════════════════════════════════════════════
//  TRANSACTIONS PAGE
// ════════════════════════════════════════════
if (window.location.pathname.includes("transaction.html")) {
    loadTransactions();
}

function loadTransactions(filtered = null) {
    let transactions = getTransactions();
    let data = filtered !== null ? filtered : transactions;
    const table = document.getElementById("transactionTable");
    table.innerHTML = "";
    if (data.length === 0) {
        table.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888">No transactions found.</td></tr>`;
        return;
    }
    data.forEach((t, index) => {
        table.innerHTML += `
        <tr>
          <td>${t.date}</td>
          <td style="color:${t.type==='income'?'#2ecc71':'#e63946'};font-weight:600">₹${Number(t.amount).toLocaleString("en-IN")}</td>
          <td><span style="background:${t.type==='income'?'#dcfce7':'#fee2e2'};color:${t.type==='income'?'#166534':'#991b1b'};padding:2px 8px;border-radius:12px;font-size:12px">${t.type.toUpperCase()}</span></td>
          <td>${t.category}</td>
          <td>${t.description}</td>
          <td>
            <button class="action-btn edit" onclick="editTransaction(${index})">Edit</button>
            <button class="action-btn delete" onclick="deleteTransaction(${index})">Delete</button>
          </td>
        </tr>`;
    });
}

function deleteTransaction(index) {
    let transactions = JSON.parse(localStorage.getItem("transactions")) || DEMO_TRANSACTIONS;
    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    loadTransactions();
}

function editTransaction(index) {
    let transactions = JSON.parse(localStorage.getItem("transactions")) || DEMO_TRANSACTIONS;
    const t = transactions[index];
    const newAmount   = prompt("Edit Amount:", t.amount);
    const newCategory = prompt("Edit Category:", t.category);
    if (newAmount && newCategory) {
        t.amount   = Number(newAmount);
        t.category = newCategory;
        localStorage.setItem("transactions", JSON.stringify(transactions));
        loadTransactions();
    }
}

function applyFilters() {
    let transactions = getTransactions();
    const search   = document.getElementById("search").value.toLowerCase();
    const date     = document.getElementById("filterDate").value;
    const category = document.getElementById("filterCategory").value.toLowerCase();
    let filtered = transactions.filter(t => {
        return (
            ((t.description||"").toLowerCase().includes(search) || t.category.toLowerCase().includes(search)) &&
            (date ? t.date === date : true) &&
            (category ? t.category.toLowerCase().includes(category) : true)
        );
    });
    loadTransactions(filtered);
}

// ════════════════════════════════════════════
//  REPORTS
// ════════════════════════════════════════════
if (window.location.pathname.includes("reports.html")) {
    loadReport();
}

function loadReport() {
    let transactions = getTransactions();
    let weekIncome = 0, weekExpense = 0, monthIncome = 0, monthExpense = 0;
    const now = new Date();
    const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);

    transactions.forEach(t => {
        const d = new Date(t.date);
        if (d >= weekAgo) {
            t.type === "income" ? weekIncome += t.amount : weekExpense += t.amount;
        }
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
            t.type === "income" ? monthIncome += t.amount : monthExpense += t.amount;
        }
    });

    document.getElementById("weekIncome").innerText  = weekIncome.toLocaleString("en-IN");
    document.getElementById("weekExpense").innerText  = weekExpense.toLocaleString("en-IN");
    document.getElementById("monthIncome").innerText  = monthIncome.toLocaleString("en-IN");
    document.getElementById("monthExpense").innerText = monthExpense.toLocaleString("en-IN");

    let insights = [];
    if (monthExpense > monthIncome) insights.push("⚠️ Spending is higher than income this month.");
    else insights.push("✅ Good financial balance this month.");
    insights.push(`📊 Total transactions: <strong>${transactions.length}</strong>`);
    insights.push(`💰 Monthly Net: <strong>₹${(monthIncome-monthExpense).toLocaleString("en-IN")}</strong>`);
    document.getElementById("reportInsight").innerHTML = insights.map(i => `<p>${i}</p>`).join("");
}

function downloadReport() {
    const transactions = getTransactions();
    let csv = "Date,Amount,Type,Category,Description\n";
    transactions.forEach(t => {
        csv += `${t.date},${t.amount},${t.type},${t.category},"${t.description||''}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "finsight_report.csv";
    link.click();
}

// ════════════════════════════════════════════
//  PROFILE & SMART SCORE
// ════════════════════════════════════════════
function logout() {
    alert("Logged out successfully!");
    window.location.href = "../index.html";
}

if (window.location.pathname.includes("profile.html")) {
    calculateScore();
}

function calculateScore() {
    const transactions = getTransactions();
    let inc = 0, exp = 0;
    transactions.forEach(t => {
        if (t.type === "income") inc += t.amount;
        else exp += t.amount;
    });

    let score = 0;
    if (inc === 0) { score = 20; }
    else {
        const ratio = exp / inc;
        if (ratio < 0.5)      score = 90;
        else if (ratio < 0.75) score = 70;
        else if (ratio < 1)    score = 50;
        else                   score = 30;
    }

    const scoreValue  = document.getElementById("scoreValue");
    const scoreCircle = document.getElementById("scoreCircle");
    const scoreText   = document.getElementById("scoreText");
    if (!scoreValue) return;

    scoreValue.innerText = score;
    if (score >= 80) {
        scoreCircle.className = "score-circle good";
        scoreText.innerText = "🔥 Excellent financial control!";
    } else if (score >= 60) {
        scoreCircle.className = "score-circle medium";
        scoreText.innerText = "🙂 You're doing okay, improve a bit.";
    } else {
        scoreCircle.className = "score-circle bad";
        scoreText.innerText = "⚠️ High spending, take control!";
    }
}
