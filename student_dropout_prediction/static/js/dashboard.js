/**
 * ==============================================================================
 * Project: AI-Based Student Dropout Prediction and Early Warning System
 * File: static/js/dashboard.js
 * Stage: Stage 9 - Student Risk Dashboard and Early Warning Overview
 * ==============================================================================
 * Connects the dashboard page to GET /api/dashboard.
 * Renders:
 *   - KPI stat cards (total, low, medium, high)
 *   - Doughnut chart (risk distribution)
 *   - Bar chart (students per risk tier)
 *   - Histogram chart (dropout probability distribution)
 *   - Filterable, paginated student risk table
 * No personal identifiers are displayed at any point.
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    // ------------------------------------------------------------------
    // DOM References
    // ------------------------------------------------------------------
    const kpiTotal      = document.getElementById("kpi-total");
    const kpiLow        = document.getElementById("kpi-low");
    const kpiMedium     = document.getElementById("kpi-medium");
    const kpiHigh       = document.getElementById("kpi-high");
    const kpiLowPct     = document.getElementById("kpi-low-pct");
    const kpiMediumPct  = document.getElementById("kpi-medium-pct");
    const kpiHighPct    = document.getElementById("kpi-high-pct");
    const sourceLabel   = document.getElementById("source-info-label");
    const sourceNote    = document.getElementById("source-info-note");
    const tableBody     = document.getElementById("risk-table-body");
    const filterCountBadge = document.getElementById("filter-count-badge");
    const pageInfo      = document.getElementById("page-info");
    const btnPrev       = document.getElementById("btn-prev-page");
    const btnNext       = document.getElementById("btn-next-page");

    // Source toggle buttons
    const btnBenchmark  = document.getElementById("btn-source-benchmark");
    const btnLive       = document.getElementById("btn-source-live");

    // Filter buttons
    const filterButtons = document.querySelectorAll(".filter-btn");

    // Chart instances (stored for destruction on re-render)
    let chartDoughnut  = null;
    let chartBar       = null;
    let chartHistogram = null;

    // ------------------------------------------------------------------
    // Application State
    // ------------------------------------------------------------------
    let currentSource = "benchmark";
    let currentFilter = "all";
    let currentPage   = 1;
    const PAGE_SIZE   = 50;

    // ------------------------------------------------------------------
    // 1. INITIALISE — load benchmark cohort on page load
    // ------------------------------------------------------------------
    loadDashboard();

    // ------------------------------------------------------------------
    // 2. SOURCE TOGGLE LISTENERS
    // ------------------------------------------------------------------
    if (btnBenchmark) {
        btnBenchmark.addEventListener("click", () => {
            currentSource = "benchmark";
            currentPage   = 1;
            currentFilter = "all";
            resetFilterButtons();
            updateSourceToggleUI("benchmark");
            loadDashboard();
        });
    }

    if (btnLive) {
        btnLive.addEventListener("click", () => {
            currentSource = "live";
            currentPage   = 1;
            currentFilter = "all";
            resetFilterButtons();
            updateSourceToggleUI("live");
            loadDashboard();
        });
    }

    // ------------------------------------------------------------------
    // 3. FILTER BUTTON LISTENERS
    // ------------------------------------------------------------------
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            currentFilter = btn.dataset.filter;
            currentPage   = 1;

            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            loadDashboard();
        });
    });

    // ------------------------------------------------------------------
    // 4. PAGINATION LISTENERS
    // ------------------------------------------------------------------
    if (btnPrev) {
        btnPrev.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                loadDashboard();
            }
        });
    }

    if (btnNext) {
        btnNext.addEventListener("click", () => {
            currentPage++;
            loadDashboard();
        });
    }

    // ------------------------------------------------------------------
    // 5. LOAD DASHBOARD DATA (API call + render)
    // ------------------------------------------------------------------
    async function loadDashboard() {
        setTableLoading(true);

        try {
            const url = `/api/dashboard?source=${currentSource}&filter=${currentFilter}&page=${currentPage}&page_size=${PAGE_SIZE}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Server returned HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.status !== "success") {
                throw new Error(data.message || "API returned an error status.");
            }

            renderKPIs(data.summary);
            renderSourceBar(data);
            renderDoughnutChart(data.summary);
            renderBarChart(data.summary);
            renderHistogramChart(data.probability_distribution);
            renderTable(data.records, data.pagination);

        } catch (err) {
            showTableError(`Failed to load dashboard data: ${err.message}`);
            console.error("[Dashboard] Error:", err);
        }
    }

    // ------------------------------------------------------------------
    // 6. RENDER KPI CARDS
    // ------------------------------------------------------------------
    function renderKPIs(summary) {
        if (!summary) return;

        animateCounter(kpiTotal,  summary.total_predictions);
        animateCounter(kpiLow,    summary.low_risk_count);
        animateCounter(kpiMedium, summary.medium_risk_count);
        animateCounter(kpiHigh,   summary.high_risk_count);

        if (kpiLowPct)    kpiLowPct.textContent    = `${summary.low_risk_percentage}%`;
        if (kpiMediumPct) kpiMediumPct.textContent  = `${summary.medium_risk_percentage}%`;
        if (kpiHighPct)   kpiHighPct.textContent    = `${summary.high_risk_percentage}%`;
    }

    function animateCounter(el, target) {
        if (!el) return;
        const duration = 600;
        const start    = performance.now();
        const from     = parseInt(el.textContent) || 0;

        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const val = Math.round(from + (target - from) * easeOut(progress));
            el.textContent = val.toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    function easeOut(t) { return 1 - (1 - t) * (1 - t); }

    // ------------------------------------------------------------------
    // 7. RENDER SOURCE INFO BAR
    // ------------------------------------------------------------------
    function renderSourceBar(data) {
        if (sourceLabel) {
            sourceLabel.textContent = `📊 ${data.source_label}`;
        }
        if (sourceNote) {
            if (data.has_data) {
                sourceNote.textContent = data.message;
            } else {
                sourceNote.textContent = data.message + " Submit a student prediction on the Home page first.";
            }
        }
    }

    // ------------------------------------------------------------------
    // 8. DOUGHNUT CHART
    // ------------------------------------------------------------------
    function renderDoughnutChart(summary) {
        const ctx = document.getElementById("chart-doughnut");
        if (!ctx) return;

        if (chartDoughnut) { chartDoughnut.destroy(); chartDoughnut = null; }

        const low  = summary.low_risk_count    || 0;
        const med  = summary.medium_risk_count || 0;
        const high = summary.high_risk_count   || 0;
        const total = low + med + high;

        if (total === 0) {
            renderEmptyChartPlaceholder("chart-doughnut", "No data available");
            return;
        }

        chartDoughnut = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["Low Risk", "Medium Risk", "High Risk"],
                datasets: [{
                    data: [low, med, high],
                    backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                    borderColor: "#ffffff",
                    borderWidth: 3,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "60%",
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                                return ` ${ctx.label}: ${ctx.parsed.toLocaleString()} students (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Render custom legend
        const legendEl = document.getElementById("doughnut-legend");
        if (legendEl) {
            legendEl.innerHTML = [
                { label: "Low Risk",    color: "#10b981", count: low  },
                { label: "Medium Risk", color: "#f59e0b", count: med  },
                { label: "High Risk",   color: "#ef4444", count: high }
            ].map(item => `
                <span class="legend-item">
                    <span class="legend-dot" style="background:${item.color}"></span>
                    ${item.label}: <strong>${item.count.toLocaleString()}</strong>
                </span>
            `).join("");
        }
    }

    // ------------------------------------------------------------------
    // 9. BAR CHART
    // ------------------------------------------------------------------
    function renderBarChart(summary) {
        const ctx = document.getElementById("chart-bar");
        if (!ctx) return;

        if (chartBar) { chartBar.destroy(); chartBar = null; }

        const low  = summary.low_risk_count    || 0;
        const med  = summary.medium_risk_count || 0;
        const high = summary.high_risk_count   || 0;

        if (low + med + high === 0) {
            renderEmptyChartPlaceholder("chart-bar", "No data available");
            return;
        }

        chartBar = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Low Risk", "Medium Risk", "High Risk"],
                datasets: [{
                    label: "Number of Students",
                    data: [low, med, high],
                    backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                    borderColor:     ["#059669", "#d97706", "#dc2626"],
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.parsed.y.toLocaleString()} students`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 50, font: { size: 11 } },
                        grid: { color: "#e2e8f0" }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 } }
                    }
                }
            }
        });
    }

    // ------------------------------------------------------------------
    // 10. HISTOGRAM CHART
    // ------------------------------------------------------------------
    function renderHistogramChart(probDist) {
        const ctx = document.getElementById("chart-histogram");
        if (!ctx) return;

        if (chartHistogram) { chartHistogram.destroy(); chartHistogram = null; }

        if (!probDist) {
            renderEmptyChartPlaceholder("chart-histogram", "No data available");
            return;
        }

        const labels = Object.keys(probDist);
        const values = Object.values(probDist);
        const colors = ["#10b981", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];

        chartHistogram = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Number of Students",
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors.map(c => c + "cc"),
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.parsed.y.toLocaleString()} students in this range`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { font: { size: 11 } },
                        grid: { color: "#e2e8f0" }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 } }
                    }
                }
            }
        });
    }

    // ------------------------------------------------------------------
    // 11. RENDER TABLE
    // ------------------------------------------------------------------
    function renderTable(records, pagination) {
        if (!tableBody) return;

        if (!records || records.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <div class="empty-state-icon">📭</div>
                            <h3>No records to display</h3>
                            <p>
                                ${currentSource === "live"
                                    ? "No live predictions have been submitted yet. Visit the Home page and submit a student record to see results here."
                                    : "No records match the current filter criteria."}
                            </p>
                        </div>
                    </td>
                </tr>`;

            updateFilterCount(0);
            updatePagination({ page: 1, total_pages: 1, total_filtered: 0 });
            return;
        }

        tableBody.innerHTML = records.map(rec => {
            const riskBadgeClass  = rec.risk_category === "Low Risk" ? "badge-low"
                : rec.risk_category === "Medium Risk" ? "badge-medium" : "badge-high";
            const statusClass = rec.status === "On Track" ? "status-on-track"
                : rec.status === "Advisory Check" ? "status-advisory" : "status-review";

            return `
            <tr>
                <td><span class="table-ref-id">${escapeHtml(rec.reference_id)}</span></td>
                <td>${escapeHtml(rec.timestamp)}</td>
                <td><span class="table-badge ${riskBadgeClass}">${escapeHtml(rec.risk_category)}</span></td>
                <td><strong>${rec.dropout_risk_percentage}%</strong></td>
                <td>${escapeHtml(rec.dropout_risk_label)}</td>
                <td><span class="${statusClass}">${escapeHtml(rec.status)}</span></td>
            </tr>`;
        }).join("");

        updateFilterCount(pagination.total_filtered);
        updatePagination(pagination);
    }

    function updateFilterCount(count) {
        if (filterCountBadge) {
            filterCountBadge.textContent = `Showing ${count.toLocaleString()} record${count !== 1 ? "s" : ""}`;
        }
    }

    function updatePagination(pagination) {
        if (pageInfo) {
            pageInfo.textContent = `Page ${pagination.page} of ${pagination.total_pages}`;
        }
        if (btnPrev)  btnPrev.disabled  = (pagination.page <= 1);
        if (btnNext)  btnNext.disabled  = (pagination.page >= pagination.total_pages);
    }

    // ------------------------------------------------------------------
    // 12. HELPERS
    // ------------------------------------------------------------------
    function setTableLoading(isLoading) {
        if (isLoading && tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" class="table-loading">⏳ Loading records…</td></tr>`;
        }
    }

    function showTableError(message) {
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" class="table-loading" style="color:#dc2626;">⚠️ ${escapeHtml(message)}</td></tr>`;
        }
    }

    function updateSourceToggleUI(source) {
        if (btnBenchmark) btnBenchmark.classList.toggle("active", source === "benchmark");
        if (btnLive)      btnLive.classList.toggle("active",      source === "live");
    }

    function resetFilterButtons() {
        filterButtons.forEach(b => b.classList.remove("active"));
        const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
        if (allBtn) allBtn.classList.add("active");
    }

    function renderEmptyChartPlaceholder(canvasId, message) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        const context = ctx.getContext("2d");
        context.clearRect(0, 0, ctx.width, ctx.height);
        context.fillStyle = "#94a3b8";
        context.font = "14px Inter, sans-serif";
        context.textAlign = "center";
        context.fillText(message, ctx.width / 2, ctx.height / 2 + 4);
    }

    function escapeHtml(str) {
        if (str == null) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
});
