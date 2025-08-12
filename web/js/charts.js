// Charts and Analytics for Nigerian Phone Tracker
class PhoneTrackerCharts {
    constructor() {
        this.carrierChart = null;
        this.typeChart = null;
        this.chartColors = [
            '#0066cc', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
            '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#6610f2'
        ];
    }

    // Initialize analytics charts
    initializeCharts() {
        this.createCarrierChart();
        this.createTypeChart();
    }

    // Create carrier distribution chart
    createCarrierChart() {
        const ctx = document.getElementById('carrier-chart');
        if (!ctx) return;

        this.carrierChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: this.chartColors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    // Create phone type distribution chart
    createTypeChart() {
        const ctx = document.getElementById('type-chart');
        if (!ctx) return;

        this.typeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Count',
                    data: [],
                    backgroundColor: this.chartColors[0],
                    borderColor: this.chartColors[0],
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Count: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Update charts with new data
    updateCharts(stats) {
        if (!stats) return;

        this.updateCarrierChart(stats.carrier_distribution || {});
        this.updateTypeChart(stats.phone_type_distribution || {});
    }

    // Update carrier distribution chart
    updateCarrierChart(carrierData) {
        if (!this.carrierChart) return;

        const labels = Object.keys(carrierData);
        const data = Object.values(carrierData);

        this.carrierChart.data.labels = labels;
        this.carrierChart.data.datasets[0].data = data;
        this.carrierChart.update('active');
    }

    // Update phone type distribution chart
    updateTypeChart(typeData) {
        if (!this.typeChart) return;

        const labels = Object.keys(typeData);
        const data = Object.values(typeData);

        this.typeChart.data.labels = labels;
        this.typeChart.data.datasets[0].data = data;
        this.typeChart.update('active');
    }

    // Generate chart image for export
    async generateChartImage(chartId, filename) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return null;

        try {
            // Convert canvas to blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || `${chartId}_${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return blob;
        } catch (error) {
            console.error('Failed to generate chart image:', error);
            return null;
        }
    }

    // Export all charts as images
    async exportAllCharts() {
        const charts = [
            { id: 'carrier-chart', filename: 'carrier_distribution.png' },
            { id: 'type-chart', filename: 'phone_type_distribution.png' }
        ];

        const results = [];
        for (const chart of charts) {
            const result = await this.generateChartImage(chart.id, chart.filename);
            if (result) {
                results.push(chart.filename);
            }
        }

        return results;
    }

    // Create summary statistics visualization
    createSummaryChart(containerId, stats) {
        const container = document.getElementById(containerId);
        if (!container || !stats) return;

        const html = `
            <div class="row text-center">
                <div class="col-md-3 mb-3">
                    <div class="card stats-card">
                        <div class="card-body">
                            <h3 class="text-primary">${stats.total_numbers || 0}</h3>
                            <p class="text-muted mb-0">Total Numbers</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card stats-card success">
                        <div class="card-body">
                            <h3 class="text-success">${stats.valid_numbers || 0}</h3>
                            <p class="text-muted mb-0">Valid Numbers</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card stats-card danger">
                        <div class="card-body">
                            <h3 class="text-danger">${stats.invalid_numbers || 0}</h3>
                            <p class="text-muted mb-0">Invalid Numbers</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card stats-card info">
                        <div class="card-body">
                            <h3 class="text-info">${stats.recent_activity || 0}</h3>
                            <p class="text-muted mb-0">Recent Activity</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // Create time-based activity chart
    createActivityChart(containerId, activityData) {
        const container = document.getElementById(containerId);
        if (!container || !activityData) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'activity-chart';
        container.innerHTML = '';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: activityData.labels || [],
                datasets: [{
                    label: 'Activity',
                    data: activityData.data || [],
                    borderColor: this.chartColors[0],
                    backgroundColor: this.chartColors[0] + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // Generate PDF report with charts
    async generatePDFReport(stats) {
        // This would require a PDF library like jsPDF
        console.log('PDF report generation would be implemented here');
        
        // For now, show a placeholder
        alert('PDF report generation would be implemented with charts and statistics included.');
    }

    // Destroy charts to free memory
    destroyCharts() {
        if (this.carrierChart) {
            this.carrierChart.destroy();
            this.carrierChart = null;
        }
        
        if (this.typeChart) {
            this.typeChart.destroy();
            this.typeChart = null;
        }
    }

    // Resize charts when container size changes
    resizeCharts() {
        if (this.carrierChart) {
            this.carrierChart.resize();
        }
        
        if (this.typeChart) {
            this.typeChart.resize();
        }
    }
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.charts = new PhoneTrackerCharts();
    
    // Initialize charts if analytics page is visible
    const analyticsPage = document.getElementById('analytics-page');
    if (analyticsPage && analyticsPage.style.display !== 'none') {
        window.charts.initializeCharts();
    }
});

// Global function to update analytics charts
window.updateAnalyticsCharts = (stats) => {
    if (window.charts) {
        // Initialize charts if not already done
        if (!window.charts.carrierChart || !window.charts.typeChart) {
            window.charts.initializeCharts();
        }
        
        // Update charts with new data
        window.charts.updateCharts(stats);
    }
};

// Handle window resize for responsive charts
window.addEventListener('resize', () => {
    if (window.charts) {
        window.charts.resizeCharts();
    }
});

// Export for use in other modules
window.PhoneTrackerCharts = PhoneTrackerCharts;
