/**
 * ==============================================================================
 * Project: AI-Based Student Dropout Prediction and Early Warning System
 * File: static/js/script.js
 * Stage: Stage 7 - Frontend and Backend Development
 * ==============================================================================
 * Connects the interactive HTML form to the Flask backend API using fetch().
 * Includes:
 * - Client-side validation
 * - Asynchronous JSON form submission to POST /predict
 * - Loading indicator state management
 * - Response rendering (success message and error display)
 * - 1-Click sample profile pre-fillers for rapid testing
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    const studentForm = document.getElementById("student-form");
    const submitBtn = document.getElementById("btn-submit");
    const responseCard = document.getElementById("response-card");
    const responseIcon = document.getElementById("response-icon");
    const responseTitle = document.getElementById("response-title");
    const responseMessage = document.getElementById("response-message");
    const responseDetails = document.getElementById("response-details");
    const responseTable = document.getElementById("response-table");

    // Stage 8 Prediction Result Elements
    const resultBanner = document.getElementById("result-banner");
    const resultTierBadge = document.getElementById("result-tier-badge");
    const resultProbability = document.getElementById("result-probability");
    const resultClassBadge = document.getElementById("result-class-badge");
    const gaugeBar = document.getElementById("gauge-bar");
    const resultExplanation = document.getElementById("result-explanation");
    const suggestionsCard = document.getElementById("suggestions-card");
    const suggestionsList = document.getElementById("suggestions-list");
    const resultEthicalNote = document.getElementById("result-ethical-note");

    // Sample pre-fill buttons
    const btnLoadLow = document.getElementById("btn-load-low");
    const btnLoadMed = document.getElementById("btn-load-med");
    const btnLoadHigh = document.getElementById("btn-load-high");
    const btnResetForm = document.getElementById("btn-reset-form");

    // ==========================================================================
    // 1. ASYNCHRONOUS FORM SUBMISSION TO FLASK BACKEND
    // ==========================================================================
    if (studentForm) {
        studentForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Client-side validation
            if (!studentForm.checkValidity()) {
                studentForm.reportValidity();
                return;
            }

            // Extract form inputs into key-value dictionary
            const formData = new FormData(studentForm);
            const payload = {};
            for (let [key, value] of formData.entries()) {
                payload[key] = parseFloat(value);
            }

            // UI: Set loading state
            setLoading(true);
            hideResponse();

            try {
                // Submit to Flask backend POST /predict
                const response = await fetch("/predict", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.ok && result.status === "success") {
                    showSuccessResponse(result);
                } else {
                    showErrorResponse(result.message || "Failed to validate student record.", result.invalid_fields || result.missing_fields);
                }
            } catch (error) {
                showErrorResponse(
                    "Network error: Unable to reach the Flask backend server. Please verify that 'python app.py' is running on http://127.0.0.1:5000.",
                    [error.message]
                );
            } finally {
                setLoading(false);
            }
        });
    }

    // ==========================================================================
    // 2. UI RESPONSE RENDERING HELPERS
    // ==========================================================================
    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.classList.add("loading");
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove("loading");
            submitBtn.disabled = false;
        }
    }

    function hideResponse() {
        responseCard.className = "response-card hidden";
        responseDetails.classList.add("hidden");
        responseTable.innerHTML = "";
        if (gaugeBar) {
            gaugeBar.style.width = "0%";
            gaugeBar.className = "gauge-fill";
        }
    }

    function showSuccessResponse(data) {
        responseCard.className = "response-card status-success";

        // Determine risk badge and gauge classes
        const tier = data.risk_category || "Unknown";
        let tierClass = "tier-low";
        let gaugeClass = "gauge-low";
        let icon = "🟢";

        if (tier.toLowerCase().includes("medium")) {
            tierClass = "tier-medium";
            gaugeClass = "gauge-medium";
            icon = "🟡";
        } else if (tier.toLowerCase().includes("high")) {
            tierClass = "tier-high";
            gaugeClass = "gauge-high";
            icon = "🔴";
        }

        // Header
        responseIcon.textContent = icon;
        responseTitle.textContent = `Prediction Result: ${tier}`;
        responseMessage.textContent = `Random Forest Classifier completed 1st-semester early-warning inference.`;

        // 1. Result Metrics
        if (resultTierBadge) {
            resultTierBadge.textContent = tier;
            resultTierBadge.className = `badge-tier ${tierClass}`;
        }

        const pct = typeof data.dropout_risk_percentage === "number"
            ? data.dropout_risk_percentage.toFixed(1)
            : parseFloat(data.dropout_risk_percentage || 0).toFixed(1);

        if (resultProbability) {
            resultProbability.textContent = `${pct}%`;
        }

        if (resultClassBadge) {
            const classText = data.dropout_risk_label || (data.dropout_risk_class === 1 ? "Dropout" : "Graduate / Enrolled");
            resultClassBadge.textContent = `${classText} (Binary Class: ${data.dropout_risk_class})`;
        }

        // 2. Risk Gauge Animation
        if (gaugeBar) {
            gaugeBar.className = `gauge-fill ${gaugeClass}`;
            // Small timeout allows smooth CSS transition from 0%
            setTimeout(() => {
                gaugeBar.style.width = `${Math.min(Math.max(parseFloat(pct), 0), 100)}%`;
            }, 50);
        }

        // 3. Model Explanation
        if (resultExplanation) {
            resultExplanation.textContent = data.explanation || "No explanation provided.";
        }

        // 4. Support Suggestions
        if (suggestionsList && Array.isArray(data.support_suggestions)) {
            suggestionsList.innerHTML = "";
            data.support_suggestions.forEach(suggestion => {
                const li = document.createElement("li");
                li.textContent = suggestion;
                suggestionsList.appendChild(li);
            });
        }

        // 5. Ethical Notice
        if (resultEthicalNote && data.ethical_note) {
            resultEthicalNote.textContent = data.ethical_note;
        }

        // 6. Validated Student Attributes Snapshot
        if (data.summary) {
            responseTable.innerHTML = "";
            const summaryMap = {
                "1st Sem Approved Units": data.summary.first_semester_approved,
                "1st Sem Average Grade": `${data.summary.first_semester_grade} / 20`,
                "Tuition Up To Date": data.summary.tuition_fees_up_to_date,
                "Has Debt (Debtor)": data.summary.debtor,
                "Scholarship Recipient": data.summary.scholarship_holder,
                "Age at Enrollment": `${data.summary.age_at_enrollment} years old`
            };

            for (const [label, val] of Object.entries(summaryMap)) {
                const item = document.createElement("div");
                item.className = "response-item";
                item.innerHTML = `<strong>${label}:</strong> ${val}`;
                responseTable.appendChild(item);
            }
            responseDetails.classList.remove("hidden");
        }

        // Ensure visible containers and scroll
        if (resultBanner) resultBanner.style.display = "grid";
        if (suggestionsCard) suggestionsCard.style.display = "block";
        responseCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function showErrorResponse(message, details) {
        responseCard.className = "response-card status-error";
        responseIcon.textContent = "⚠️";
        responseTitle.textContent = "Prediction / Validation Error";
        responseMessage.textContent = message;

        // Hide prediction-specific components on error
        if (resultBanner) resultBanner.style.display = "none";
        if (suggestionsCard) suggestionsCard.style.display = "none";
        if (gaugeBar) gaugeBar.style.width = "0%";
        if (resultExplanation) resultExplanation.textContent = "";

        if (details) {
            responseTable.innerHTML = "";
            if (Array.isArray(details)) {
                details.forEach(item => {
                    const el = document.createElement("div");
                    el.className = "response-item";
                    el.innerHTML = `<strong>Issue:</strong> ${item}`;
                    responseTable.appendChild(el);
                });
            } else if (typeof details === "object") {
                for (const [field, err] of Object.entries(details)) {
                    const el = document.createElement("div");
                    el.className = "response-item";
                    el.innerHTML = `<strong>${field}:</strong> ${err}`;
                    responseTable.appendChild(el);
                }
            }
            responseDetails.classList.remove("hidden");
        }

        responseCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // ==========================================================================
    // 3. SAMPLE PROFILE PRE-FILL LOGIC (1-CLICK TESTING)
    // ==========================================================================
    async function loadSampleProfile(tier) {
        hideResponse();
        try {
            const resp = await fetch(`/api/sample/${tier}`);
            const json = await resp.json();
            if (resp.ok && json.status === "success") {
                populateForm(json.data);
                highlightActiveButton(tier);
            } else {
                alert(`Could not load sample: ${json.message}`);
            }
        } catch (err) {
            console.error("Failed to load sample profile:", err);
        }
    }

    function populateForm(data) {
        for (const [key, val] of Object.entries(data)) {
            const input = studentForm.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = val;
            }
        }
    }

    function highlightActiveButton(tier) {
        [btnLoadLow, btnLoadMed, btnLoadHigh].forEach(b => b.classList.remove("active-btn"));
        if (tier === "low") btnLoadLow.classList.add("active-btn");
        if (tier === "medium") btnLoadMed.classList.add("active-btn");
        if (tier === "high") btnLoadHigh.classList.add("active-btn");
    }

    if (btnLoadLow) btnLoadLow.addEventListener("click", () => loadSampleProfile("low"));
    if (btnLoadMed) btnLoadMed.addEventListener("click", () => loadSampleProfile("medium"));
    if (btnLoadHigh) btnLoadHigh.addEventListener("click", () => loadSampleProfile("high"));

    if (btnResetForm) {
        btnResetForm.addEventListener("click", () => {
            studentForm.reset();
            hideResponse();
            [btnLoadLow, btnLoadMed, btnLoadHigh].forEach(b => b.classList.remove("active-btn"));
        });
    }
});
