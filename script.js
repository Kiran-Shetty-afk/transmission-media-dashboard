// Media Data
const mediaData = {
    wired: [
        {
            name: 'Twisted Pair (UTP/STP)',
            speed: 1000,
            speedRange: '10 Mbps - 1 Gbps',
            cost: 'Cheap',
            costValue: 1,
            interference: 'High',
            interferenceValue: 3,
            reliability: 85,
            coverage: '100m',
            coverageValue: 100
        },
        {
            name: 'Coaxial Cable',
            speed: 10000,
            speedRange: '10 Mbps - 10 Gbps',
            cost: 'Moderate',
            costValue: 2,
            interference: 'Medium',
            interferenceValue: 2,
            reliability: 90,
            coverage: '500m',
            coverageValue: 500
        },
        {
            name: 'Optical Fiber',
            speed: 100000,
            speedRange: '1 Gbps - 100 Gbps',
            cost: 'Expensive',
            costValue: 3,
            interference: 'Low',
            interferenceValue: 1,
            reliability: 99,
            coverage: '100km',
            coverageValue: 100000
        }
    ],
    wireless: [
        {
            name: 'Wi-Fi',
            speed: 1000,
            speedRange: '100 Mbps - 1 Gbps',
            cost: 'Moderate',
            costValue: 2,
            interference: 'High',
            interferenceValue: 3,
            reliability: 75,
            coverage: '100m',
            coverageValue: 100
        },
        {
            name: 'Bluetooth',
            speed: 50,
            speedRange: '1 Mbps - 50 Mbps',
            cost: 'Cheap',
            costValue: 1,
            interference: 'Medium',
            interferenceValue: 2,
            reliability: 80,
            coverage: '10m',
            coverageValue: 10
        },
        {
            name: 'Microwave (Satellite)',
            speed: 1000,
            speedRange: '1 Mbps - 1 Gbps',
            cost: 'Expensive',
            costValue: 3,
            interference: 'Medium',
            interferenceValue: 2,
            reliability: 85,
            coverage: '10000km',
            coverageValue: 10000000
        },
        {
            name: 'Infrared',
            speed: 100,
            speedRange: '100 Kbps - 100 Mbps',
            cost: 'Cheap',
            costValue: 1,
            interference: 'Low',
            interferenceValue: 1,
            reliability: 70,
            coverage: '5m',
            coverageValue: 5
        }
    ]
};

// Global Variables
let speedChart, costChart, radarChart;
let selectedComparison = [];

// Helper Functions
function getAllMedia() {
    return [...mediaData.wired, ...mediaData.wireless];
}

function getFilteredData() {
    let data = getAllMedia();

    if (selectedComparison.length > 0) {
        data = data.filter(m => selectedComparison.includes(m.name));
    } else {
        const mediaType = document.getElementById('mediaType').value;
        if (mediaType !== 'all') {
            data = mediaData[mediaType];
        }
    }

    return data;
}

// Summary Cards
function updateSummaryCards() {
    const allMedia = getAllMedia();
    
    const fastest = allMedia.reduce((max, m) => m.speed > max.speed ? m : max);
    const cheapest = allMedia.filter(m => m.cost === 'Cheap')[0];
    const longest = allMedia.reduce((max, m) => m.coverageValue > max.coverageValue ? m : max);
    const reliable = allMedia.reduce((max, m) => m.reliability > max.reliability ? m : max);

    document.getElementById('fastestMedium').textContent = fastest.name.split(' ')[0];
    document.getElementById('cheapestMedium').textContent = cheapest.name.split(' ')[0];
    document.getElementById('longestRange').textContent = longest.name.split(' ')[0];
    document.getElementById('mostReliable').textContent = reliable.name.split(' ')[0];
}

// Comparison Selector
function initComparisonSelector() {
    const selector = document.getElementById('comparisonSelector');
    const allMedia = getAllMedia();
    
    selector.innerHTML = allMedia.map((media, index) => `
        <div class="media-checkbox" id="checkbox-${index}">
            <input type="checkbox" id="media-${index}" value="${media.name}" 
                   onchange="updateComparison('${media.name}', this.checked)">
            <label for="media-${index}" style="cursor: pointer; margin: 0;">${media.name}</label>
        </div>
    `).join('');
}

function updateComparison(mediaName, isChecked) {
    if (isChecked) {
        if (selectedComparison.length < 4) {
            selectedComparison.push(mediaName);
        } else {
            alert('You can select maximum 4 media for comparison');
            event.target.checked = false;
            return;
        }
    } else {
        selectedComparison = selectedComparison.filter(m => m !== mediaName);
    }

    updateCheckboxStyles();
    updateDashboard();
}

function updateCheckboxStyles() {
    getAllMedia().forEach((media, index) => {
        const checkboxDiv = document.getElementById(`checkbox-${index}`);
        if (selectedComparison.includes(media.name)) {
            checkboxDiv.classList.add('selected');
        } else {
            checkboxDiv.classList.remove('selected');
        }
    });
}

function applyFilters() {
    selectedComparison = [];
    getAllMedia().forEach((media, index) => {
        document.getElementById(`media-${index}`).checked = false;
    });
    updateCheckboxStyles();
    updateDashboard();
}

// Charts
function initCharts() {
    const data = getFilteredData();

    if (data.length === 0) {
        document.getElementById('noResults').style.display = 'block';
        document.querySelector('.charts-grid').style.display = 'none';
        return;
    } else {
        document.getElementById('noResults').style.display = 'none';
        document.querySelector('.charts-grid').style.display = 'grid';
    }

    // Speed Chart
    const speedCtx = document.getElementById('speedChart').getContext('2d');
    speedChart = new Chart(speedCtx, {
        type: 'bar',
        data: {
            labels: data.map(m => m.name),
            datasets: [{
                label: 'Max Speed (Mbps)',
                data: data.map(m => m.speed),
                backgroundColor: [
                    '#667eea', '#764ba2', '#f093fb', '#4facfe',
                    '#43e97b', '#fa709a', '#fee140'
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    type: 'logarithmic',
                    title: {
                        display: true,
                        text: 'Speed (Mbps) - Log Scale'
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Cost Chart
    const costCtx = document.getElementById('costChart').getContext('2d');
    const costCounts = { 'Cheap': 0, 'Moderate': 0, 'Expensive': 0 };
    data.forEach(m => costCounts[m.cost]++);

    costChart = new Chart(costCtx, {
        type: 'pie',
        data: {
            labels: ['Cheap', 'Moderate', 'Expensive'],
            datasets: [{
                data: [costCounts.Cheap, costCounts.Moderate, costCounts.Expensive],
                backgroundColor: ['#6bcf7f', '#ffd93d', '#ff6b6b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Radar Chart
    const radarCtx = document.getElementById('radarChart').getContext('2d');
    radarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: ['Speed', 'Reliability', 'Low Interference', 'Coverage', 'Cost Efficiency'],
            datasets: data.map((m, i) => ({
                label: m.name,
                data: [
                    Math.min(m.speed / 1000, 100),
                    m.reliability,
                    (4 - m.interferenceValue) * 25,
                    Math.min(m.coverageValue / 100, 100),
                    (4 - m.costValue) * 33
                ],
                borderColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140'][i],
                backgroundColor: ['#667eea33', '#764ba233', '#f093fb33', '#4facfe33', '#43e97b33', '#fa709a33', '#fee14033'][i]
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Table
function updateTable() {
    const data = getFilteredData();
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px; color: #666;">No results found</td></tr>';
        return;
    }

    data.forEach(media => {
        const isWired = mediaData.wired.includes(media);
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><strong>${media.name}</strong></td>
            <td><span class="metric-badge" style="background: ${isWired ? '#667eea' : '#43e97b'}; color: white;">${isWired ? 'Wired' : 'Wireless'}</span></td>
            <td>${media.speedRange}</td>
            <td><span class="metric-badge badge-${media.cost.toLowerCase()}">${media.cost}</span></td>
            <td><span class="metric-badge badge-${media.interference.toLowerCase()}">${media.interference}</span></td>
            <td>${media.reliability}%</td>
            <td>${media.coverage}</td>
        `;
    });
}

// Dashboard Update
function updateDashboard() {
    if (speedChart) speedChart.destroy();
    if (costChart) costChart.destroy();
    if (radarChart) radarChart.destroy();
    
    initCharts();
    updateTable();
}

function updateCharts() {
    updateDashboard();
}

// Initialize on Load
window.onload = function() {
    updateSummaryCards();
    initComparisonSelector();
    initCharts();
    updateTable();
};