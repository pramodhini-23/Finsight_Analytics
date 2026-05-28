function goTo(page) {
    window.location.href = page;
}

let chartType = "bar";
let chart;
let income = 0, expense = 0, savings = 0;

// 🔢 ANIMATION
function animateValue(id, start, end, duration) {
    let range = end - start;
    let current = start;
    let increment = end > start ? 1 : -1;
    let stepTime = Math.abs(Math.floor(duration / (range || 1)));

    let obj = document.getElementById(id);

    let timer = setInterval(() => {
        current += increment;
        obj.innerText = current;
        if (current == end) clearInterval(timer);
    }, stepTime);
}

// 🔄 TOGGLE CHART
function toggleChart() {
    chartType = chartType === "bar" ? "pie" : "bar";
    loadChart();
}

// 📊 LOAD CHART
function loadChart() {
    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("myChart"), {
        type: chartType,
        data: {
            labels: ["Income", "Expense", "Savings"],
            datasets: [{
                data: [income, expense, savings],
                backgroundColor: ["#2ecc71", "#e63946", "#457b9d"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// 🚀 DASHBOARD LOGIC
if (window.location.pathname.includes("index.html")) {

    let transactions = [
        { type: "income", amount: 5000 },
        { type: "expense", amount: 1200 },
        { type: "expense", amount: 800 },
        { type: "income", amount: 3000 },
        { type: "expense", amount: 1500 }
    ];

    transactions.forEach(t => {
        if (t.type === "income") income += Number(t.amount);
        else expense += Number(t.amount);
    });

    savings = income - expense;

    animateValue("income", 0, income, 800);
    animateValue("expense", 0, expense, 800);
    animateValue("savings", 0, savings, 800);

    loadChart();

    document.getElementById("insightList").innerHTML = `
        <li>💰 You are saving money consistently.</li>
        <li>📊 Your spending is under control.</li>
        <li>📈 Maintain this balance for growth.</li>
    `;

    const recentList = document.getElementById("recentList");
    recentList.innerHTML = "";

    transactions.slice(-5).reverse().forEach(t => {
        const div = document.createElement("div");
        div.className = "transaction-item";

        div.innerHTML = `
            <span class="${t.type}">${t.type.toUpperCase()}</span>
            <span>₹${t.amount}</span>
        `;

        recentList.appendChild(div);
    });
}
if (window.location.pathname.includes("analytics.html")) {

    let income = 0, expense = 0;
    let monthly = {};
    let categories = {};

    let transactions = [
        { type: "income", amount: 5000, category: "Salary", month: "Jan" },
        { type: "expense", amount: 1200, category: "Food", month: "Jan" },
        { type: "expense", amount: 800, category: "Travel", month: "Feb" },
        { type: "income", amount: 3000, category: "Freelance", month: "Feb" },
        { type: "expense", amount: 1500, category: "Shopping", month: "Mar" }
    ];

    transactions.forEach(t => {

        if (t.type === "income") income += Number(t.amount);
        else expense += Number(t.amount);

        if (!monthly[t.month]) monthly[t.month] = 0;
        monthly[t.month] += Number(t.amount);

        if (!categories[t.category]) categories[t.category] = 0;
        categories[t.category] += Number(t.amount);
    });

    function createChart(ctxId, config) {
        return new Chart(document.getElementById(ctxId), {
            ...config,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: 5 },
                plugins: {
                    legend: {
                        position: 'right',
                        align: 'center',
                        labels: {
                            boxWidth: 10,
                            padding: 5
                        }
                    }
                },
                animation: {
                    duration: 1200,
                    easing: 'easeOutBounce'
                }
            }
        });
    }

    createChart("compareChart", {
        type: "doughnut",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                data: [income, expense],
                backgroundColor: ["#2ecc71", "#e63946"]
            }]
        }
    });

    createChart("monthlyChart", {
        type: "line",
        data: {
            labels: Object.keys(monthly),
            datasets: [{
                label: "Monthly Spending",
                data: Object.values(monthly),
                borderColor: "#9d0208",
                tension: 0.3,
                fill: false
            }]
        }
    });

    createChart("categoryChart", {
        type: "pie",
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    "#9d0208",
                    "#e63946",
                    "#ff6b6b",
                    "#ff9f1c",
                    "#457b9d"
                ]
            }]
        }
    });
}
function setBudget() {
    const input = document.getElementById("budgetInput").value;
    const status = document.getElementById("budgetStatus");

    if (!input) return;

    const budget = Number(input);

    if (budget > 1000) {
        status.innerText = "🚨 Budget Exceeded";
        status.style.color = "red";
    } else {
        status.innerText = "✅ Financially Stable";
        status.style.color = "green";
    }
}
/* ===== ADD TRANSACTION ===== */

function saveTransaction() {
    const date = document.getElementById("date").value;
    const amount = document.getElementById("amount").value;
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const message = document.getElementById("message");

    // ❌ VALIDATION
    if (!date || !amount || !type || !category || !description) {
        message.innerText = "⚠️ Please fill all fields!";
        message.style.color = "red";
        return;
    }

    // ✅ SAVE DATA
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    transactions.push({
        date,
        amount: Number(amount),
        type,
        category,
        description
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));

    // ✅ SUCCESS MESSAGE
    message.innerText = "✅ Transaction Saved Successfully!";
    message.style.color = "green";

    // 🧹 CLEAR FORM
    document.getElementById("date").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("type").value = "";
    document.getElementById("category").value = "";
    document.getElementById("description").value = "";
}
/* ===== TRANSACTION PAGE ===== */

if (window.location.pathname.includes("transaction.html")) {
    loadTransactions();
}

function loadTransactions(filtered = null) {
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let data = filtered || transactions;

    const table = document.getElementById("transactionTable");
    table.innerHTML = "";

    data.forEach((t, index) => {
        table.innerHTML += `
        <tr>
          <td>${t.date}</td>
          <td>₹${t.amount}</td>
          <td>${t.type}</td>
          <td>${t.category}</td>
          <td>${t.description}</td>
          <td>
            <button class="action-btn edit" onclick="editTransaction(${index})">Edit</button>
            <button class="action-btn delete" onclick="deleteTransaction(${index})">Delete</button>
          </td>
        </tr>`;
    });
}

/* DELETE */
function deleteTransaction(index) {
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    loadTransactions();
}

/* EDIT */
function editTransaction(index) {
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    const t = transactions[index];

    const newAmount = prompt("Edit Amount:", t.amount);
    const newCategory = prompt("Edit Category:", t.category);

    if (newAmount && newCategory) {
        t.amount = Number(newAmount);
        t.category = newCategory;

        localStorage.setItem("transactions", JSON.stringify(transactions));
        loadTransactions();
    }
}

/* FILTER + SEARCH */
function applyFilters() {
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    const search = document.getElementById("search").value.toLowerCase();
    const date = document.getElementById("filterDate").value;
    const category = document.getElementById("filterCategory").value.toLowerCase();

    let filtered = transactions.filter(t => {
        return (
            (t.description.toLowerCase().includes(search) ||
             t.category.toLowerCase().includes(search)) &&

            (date ? t.date === date : true) &&
            (category ? t.category.toLowerCase().includes(category) : true)
        );
    });

    loadTransactions(filtered);
}
/* ===== SIMPLE REPORT WITH DEMO DATA ===== */

if (window.location.pathname.includes("reports.html")) {
    loadReport();
}

function loadReport() {

    let transactions = JSON.parse(localStorage.getItem("transactions"));

    // 🌱 DEMO DATA IF EMPTY
    if (!transactions || transactions.length === 0) {
        transactions = [
            { date: "2026-05-01", amount: 5000, type: "income", category: "Salary" },
            { date: "2026-05-02", amount: 1000, type: "expense", category: "Food" },
            { date: "2026-05-03", amount: 700, type: "expense", category: "Travel" },
            { date: "2026-05-05", amount: 2000, type: "income", category: "Freelance" },
            { date: "2026-05-06", amount: 1200, type: "expense", category: "Shopping" }
        ];
    }

    let weekIncome = 0, weekExpense = 0;
    let monthIncome = 0, monthExpense = 0;

    let now = new Date();
    let weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    transactions.forEach(t => {
        let d = new Date(t.date);

        // WEEK
        if (d >= weekAgo) {
            t.type === "income" ? weekIncome += t.amount : weekExpense += t.amount;
        }

        // MONTH
        if (d.getMonth() === now.getMonth()) {
            t.type === "income" ? monthIncome += t.amount : monthExpense += t.amount;
        }
    });

    // DISPLAY
    document.getElementById("weekIncome").innerText = weekIncome;
    document.getElementById("weekExpense").innerText = weekExpense;
    document.getElementById("monthIncome").innerText = monthIncome;
    document.getElementById("monthExpense").innerText = monthExpense;

    // 🧠 INSIGHTS
    let insights = [];

    if (monthExpense > monthIncome) {
        insights.push("⚠️ Spending is higher than income this month");
    } else {
        insights.push("✅ Good financial balance this month");
    }

    insights.push(`📊 Total transactions: ${transactions.length}`);

    document.getElementById("reportInsight").innerHTML =
        insights.map(i => `<p>${i}</p>`).join("");
}

/* DOWNLOAD */
function downloadReport() {
    let data = localStorage.getItem("transactions") || "[]";

    let blob = new Blob([data], { type: "application/json" });
    let link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "report.json";
    link.click();
}
/* ===== PROFILE PAGE ===== */


// LOGOUT
function logout() {
    alert("Logged out successfully!");
    window.location.href = "../index.html";
}
/* ===== SMART SPENDING SCORE ===== */

if (window.location.pathname.includes("profile.html")) {
    calculateScore();
}

function calculateScore() {

    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    // fallback demo data
    if (transactions.length === 0) {
        transactions = [
            { type: "income", amount: 5000 },
            { type: "expense", amount: 2000 },
            { type: "expense", amount: 1000 }
        ];
    }

    let income = 0, expense = 0;

    transactions.forEach(t => {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
    });

    let score = 0;

    if (income === 0) {
        score = 20;
    } else {
        let ratio = expense / income;

        if (ratio < 0.5) score = 90;
        else if (ratio < 0.75) score = 70;
        else if (ratio < 1) score = 50;
        else score = 30;
    }

    const scoreValue = document.getElementById("scoreValue");
    const scoreCircle = document.getElementById("scoreCircle");
    const scoreText = document.getElementById("scoreText");

    scoreValue.innerText = score;

    // COLOR + MESSAGE
    if (score >= 80) {
        scoreCircle.className = "score-circle good";
        scoreText.innerText = "🔥 Excellent financial control!";
    }
    else if (score >= 60) {
        scoreCircle.className = "score-circle medium";
        scoreText.innerText = "🙂 You're doing okay, improve a bit.";
    }
    else {
        scoreCircle.className = "score-circle bad";
        scoreText.innerText = "⚠️ High spending, take control!";
    }
}
