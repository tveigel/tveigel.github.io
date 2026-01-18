// HRI Study Results Visualization
// Loads results_data.json and renders charts and tables

let resultsData = null;

// Color palette for SAT levels
const colors = {
    conservative: {
        bg: 'rgba(34, 139, 34, 0.7)',
        border: 'rgb(34, 139, 34)'
    },
    moderate: {
        bg: 'rgba(255, 165, 0, 0.7)',
        border: 'rgb(255, 165, 0)'
    },
    risky: {
        bg: 'rgba(220, 20, 60, 0.7)',
        border: 'rgb(220, 20, 60)'
    },
    transparencyYes: {
        bg: 'rgba(70, 130, 180, 0.7)',
        border: 'rgb(70, 130, 180)'
    },
    transparencyNo: {
        bg: 'rgba(169, 169, 169, 0.7)',
        border: 'rgb(169, 169, 169)'
    }
};

const satColors = [colors.conservative, colors.moderate, colors.risky];
const satLabels = ['Conservative', 'Moderate', 'Risky'];

// Utility functions
function formatP(p) {
    if (p < 0.001) return '< .001';
    return p.toFixed(3).replace('0.', '.');
}

function formatF(anova) {
    if (!anova) return 'N/A';
    return `F(${anova.df1}, ${anova.df2}) = ${anova.F.toFixed(2)}, p ${formatP(anova.p)}, η² = ${anova.eta_sq.toFixed(3)}`;
}

function getSignificanceMarker(p) {
    if (p < 0.001) return '***';
    if (p < 0.01) return '**';
    if (p < 0.05) return '*';
    return '';
}

// Load data and initialize
async function init() {
    try {
        const response = await fetch('results_data.json');
        resultsData = await response.json();
        
        renderStudyInfo();
        renderFrustrationSection();
        renderTLXSection();
        renderUtilitySection();
        renderIntelligenceSection();
        renderSummary();
    } catch (error) {
        console.error('Error loading results data:', error);
        document.body.innerHTML = '<p class="error">Error loading results data. Please ensure results_data.json exists.</p>';
    }
}

// Render study overview
function renderStudyInfo() {
    document.getElementById('design-text').textContent = resultsData.study_info.design;
    document.getElementById('n-participants').textContent = resultsData.study_info.n_participants;
    document.getElementById('n-observations').textContent = resultsData.study_info.n_observations;
}

// Create a bar chart with error bars
function createBarChart(canvasId, data, labels, title, yAxisLabel, yMax = null) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const means = labels.map(l => data[l]?.mean || 0);
    const errors = labels.map(l => data[l]?.ci_95 || 0);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: means,
                backgroundColor: satColors.map(c => c.bg),
                borderColor: satColors.map(c => c.border),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: title,
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: yMax,
                    title: {
                        display: true,
                        text: yAxisLabel
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Speed-Accuracy Tradeoff Level'
                    }
                }
            }
        },
        plugins: [{
            id: 'errorBars',
            afterDatasetsDraw: (chart) => {
                const ctx = chart.ctx;
                chart.data.datasets.forEach((dataset, datasetIndex) => {
                    const meta = chart.getDatasetMeta(datasetIndex);
                    meta.data.forEach((bar, index) => {
                        const error = errors[index];
                        const x = bar.x;
                        const y = bar.y;
                        const yScale = chart.scales.y;
                        const errorTop = yScale.getPixelForValue(means[index] + error);
                        const errorBottom = yScale.getPixelForValue(means[index] - error);
                        
                        ctx.save();
                        ctx.strokeStyle = '#333';
                        ctx.lineWidth = 2;
                        
                        // Vertical line
                        ctx.beginPath();
                        ctx.moveTo(x, errorTop);
                        ctx.lineTo(x, errorBottom);
                        ctx.stroke();
                        
                        // Top cap
                        ctx.beginPath();
                        ctx.moveTo(x - 5, errorTop);
                        ctx.lineTo(x + 5, errorTop);
                        ctx.stroke();
                        
                        // Bottom cap
                        ctx.beginPath();
                        ctx.moveTo(x - 5, errorBottom);
                        ctx.lineTo(x + 5, errorBottom);
                        ctx.stroke();
                        
                        ctx.restore();
                    });
                });
            }
        }]
    });
}

// Create interaction plot (grouped bar chart)
function createInteractionChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const transparencyLevels = ['Yes', 'No'];
    
    const datasets = transparencyLevels.map((trans, idx) => {
        const means = satLabels.map(sat => {
            const key = `${sat}_${trans}`;
            return data[key]?.mean || 0;
        });
        const colorSet = idx === 0 ? colors.transparencyYes : colors.transparencyNo;
        
        return {
            label: `Uncertainty: ${trans}`,
            data: means,
            backgroundColor: colorSet.bg,
            borderColor: colorSet.border,
            borderWidth: 2
        };
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: satLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: title,
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Mean Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'SAT Level'
                    }
                }
            }
        }
    });
}

// Populate descriptive statistics table
function populateDescriptiveTable(tableId, data) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';
    
    satLabels.forEach(sat => {
        const stats = data[sat];
        if (stats) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sat}</td>
                <td>${stats.mean.toFixed(2)}</td>
                <td>${stats.sd.toFixed(2)}</td>
                <td>[${(stats.mean - stats.ci_95).toFixed(2)}, ${(stats.mean + stats.ci_95).toFixed(2)}]</td>
            `;
            tbody.appendChild(row);
        }
    });
}

// Render ANOVA results
function renderAnovaResult(containerId, anova, label = 'Main effect of SAT') {
    const container = document.getElementById(containerId);
    if (!anova) {
        container.innerHTML = '<p class="no-data">ANOVA data not available</p>';
        return;
    }
    
    const sig = anova.significant ? '<span class="significant">*</span>' : '';
    container.innerHTML = `
        <p class="anova-text">
            <strong>${label}:</strong> ${formatF(anova)}${sig}
        </p>
    `;
}

// Render post-hoc results
function renderPosthoc(containerId, posthoc) {
    const container = document.getElementById(containerId);
    if (!posthoc || posthoc.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<h5>Pairwise Comparisons (Bonferroni corrected)</h5><ul class="posthoc-list">';
    posthoc.forEach(comp => {
        const sig = comp.significant ? ' <span class="significant">*</span>' : '';
        html += `<li>${comp.contrast}: t(${comp.df}) = ${comp.t.toFixed(2)}, p = ${formatP(comp.p_adj)}${sig}</li>`;
    });
    html += '</ul>';
    container.innerHTML = html;
}

// Render frustration section
function renderFrustrationSection() {
    // Frustration about robot performance
    const perfData = resultsData.analyses.FrustrationRobotPerformance;
    createBarChart('chart-frustration-performance-sat', perfData.descriptives_SAT, satLabels, 
        'Frustration about Robot Performance by SAT Level', 'Frustration (1-7)', 7);
    populateDescriptiveTable('table-frustration-performance', perfData.descriptives_SAT);
    renderAnovaResult('anova-frustration-performance', perfData.anova_SAT);
    renderPosthoc('posthoc-frustration-performance', perfData.posthoc_SAT);
    
    // Interaction chart
    createInteractionChart('chart-frustration-performance-interaction', 
        perfData.descriptives_SAT_Transparency, 
        'Frustration (Performance) by SAT x Uncertainty Communication');
    
    // Interaction stats
    const interactionContainer = document.getElementById('interaction-frustration-performance');
    const satTransAnova = perfData.anova_SAT_Transparency;
    if (satTransAnova && satTransAnova['SAT * Transparency']) {
        const interaction = satTransAnova['SAT * Transparency'];
        const sig = interaction.significant ? '<span class="significant">*</span>' : '';
        interactionContainer.innerHTML = `
            <p class="anova-text"><strong>Interaction (SAT × Uncertainty):</strong> ${formatF(interaction)}${sig}</p>
        `;
    }
    
    // Frustration about robot decisions
    const decData = resultsData.analyses.FrustrationRobotDecision;
    createBarChart('chart-frustration-decision-sat', decData.descriptives_SAT, satLabels,
        'Frustration about Robot Decisions by SAT Level', 'Frustration (1-7)', 7);
    populateDescriptiveTable('table-frustration-decision', decData.descriptives_SAT);
    renderAnovaResult('anova-frustration-decision', decData.anova_SAT);
    renderPosthoc('posthoc-frustration-decision', decData.posthoc_SAT);
}

// Render NASA TLX section
function renderTLXSection() {
    // Overall TLX
    const tlxData = resultsData.analyses.TLX_Overall;
    createBarChart('chart-tlx-overall-sat', tlxData.descriptives_SAT, satLabels,
        'Overall NASA TLX by SAT Level', 'Workload (1-21)', 21);
    populateDescriptiveTable('table-tlx-overall', tlxData.descriptives_SAT);
    renderAnovaResult('anova-tlx-overall', tlxData.anova_SAT);
    
    // TLX Subscales grouped chart
    const subscales = [
        { key: 'TLX_Mental', label: 'Mental' },
        { key: 'TLX_Physical', label: 'Physical' },
        { key: 'TLX_Temporal', label: 'Temporal' },
        { key: 'TLX_Performance', label: 'Performance' },
        { key: 'TLX_Effort', label: 'Effort' },
        { key: 'TLX_Frustration', label: 'Frustration' }
    ];
    
    const ctx = document.getElementById('chart-tlx-subscales').getContext('2d');
    
    const datasets = satLabels.map((sat, idx) => {
        const means = subscales.map(sub => {
            const data = resultsData.analyses[sub.key]?.descriptives_SAT[sat];
            return data?.mean || 0;
        });
        
        return {
            label: sat,
            data: means,
            backgroundColor: satColors[idx].bg,
            borderColor: satColors[idx].border,
            borderWidth: 2
        };
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subscales.map(s => s.label),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'NASA TLX Subscales by SAT Level',
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 21,
                    title: {
                        display: true,
                        text: 'Score (1-21)'
                    }
                }
            }
        }
    });
    
    // Subscales ANOVA table
    const tbody = document.querySelector('#table-tlx-subscales-anova tbody');
    tbody.innerHTML = '';
    
    subscales.forEach(sub => {
        const anova = resultsData.analyses[sub.key]?.anova_SAT;
        if (anova) {
            const row = document.createElement('tr');
            const sig = anova.significant ? ' *' : '';
            row.innerHTML = `
                <td>${sub.label}</td>
                <td>${anova.F.toFixed(2)}${sig}</td>
                <td>(${anova.df1}, ${anova.df2})</td>
                <td>${formatP(anova.p)}</td>
                <td>${anova.eta_sq.toFixed(3)}</td>
            `;
            if (anova.significant) {
                row.classList.add('significant-row');
            }
            tbody.appendChild(row);
        }
    });
}

// Render utility section
function renderUtilitySection() {
    const utilData = resultsData.analyses.Utility_Score;
    
    createBarChart('chart-utility-sat', utilData.descriptives_SAT, satLabels,
        'Perceived Utility by SAT Level', 'Utility Score (1-4)', 4);
    populateDescriptiveTable('table-utility', utilData.descriptives_SAT);
    renderAnovaResult('anova-utility', utilData.anova_SAT);
    renderPosthoc('posthoc-utility', utilData.posthoc_SAT);
    
    // Utility by Transparency
    const ctx = document.getElementById('chart-utility-transparency').getContext('2d');
    const transData = utilData.descriptives_Transparency;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Yes', 'No'],
            datasets: [{
                label: 'Utility',
                data: [transData['Yes']?.mean || 0, transData['No']?.mean || 0],
                backgroundColor: [colors.transparencyYes.bg, colors.transparencyNo.bg],
                borderColor: [colors.transparencyYes.border, colors.transparencyNo.border],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Perceived Utility by Uncertainty Communication',
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 4,
                    title: { display: true, text: 'Utility Score (1-4)' }
                },
                x: {
                    title: { display: true, text: 'Uncertainty Communication' }
                }
            }
        }
    });
    
    renderAnovaResult('anova-utility-transparency', utilData.anova_Transparency, 
        'Main effect of Uncertainty Communication');
}

// Render intelligence section
function renderIntelligenceSection() {
    const intData = resultsData.analyses.Godspeed_Intelligence;
    
    createBarChart('chart-intelligence-sat', intData.descriptives_SAT, satLabels,
        'Perceived Intelligence by SAT Level', 'Intelligence Score (1-5)', 5);
    populateDescriptiveTable('table-intelligence', intData.descriptives_SAT);
    renderAnovaResult('anova-intelligence', intData.anova_SAT);
    renderPosthoc('posthoc-intelligence', intData.posthoc_SAT);
}

// Render summary section
function renderSummary() {
    const summary = resultsData.summary;
    
    // SAT findings list
    const satFindings = document.getElementById('sat-findings');
    const satEffects = summary.significant_effects.filter(e => e.effect === 'SAT (main effect)');
    
    satEffects.forEach(effect => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${effect.dv}:</strong> F = ${effect.F.toFixed(2)}, p ${formatP(effect.p)}, η² = ${effect.eta_sq.toFixed(3)}`;
        satFindings.appendChild(li);
    });
    
    // Summary table
    const tbody = document.querySelector('#table-summary tbody');
    tbody.innerHTML = '';
    
    summary.significant_effects.forEach(effect => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${effect.dv}</td>
            <td>${effect.effect}</td>
            <td>${effect.F.toFixed(2)}</td>
            <td>${formatP(effect.p)}</td>
            <td>${effect.eta_sq.toFixed(3)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
