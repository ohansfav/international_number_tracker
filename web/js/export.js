// Advanced Export Functionality for Nigerian Phone Tracker
class PhoneTrackerExport {
    constructor() {
        this.exportFormats = ['csv', 'json', 'pdf', 'excel'];
    }

    // Main export function
    async exportData(format, data, options = {}) {
        switch (format.toLowerCase()) {
            case 'csv':
                return this.exportToCSV(data, options);
            case 'json':
                return this.exportToJSON(data, options);
            case 'pdf':
                return this.exportToPDF(data, options);
            case 'excel':
                return this.exportToExcel(data, options);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    // Export to CSV format
    exportToCSV(data, options = {}) {
        const {
            filename = `nigeria_phone_tracker_${new Date().toISOString().split('T')[0]}.csv`,
            includeHeaders = true,
            delimiter = ',',
            fields = null
        } = options;

        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('No data to export');
        }

        // Determine which fields to include
        const defaultFields = [
            'phone_number', 'carrier', 'region', 'timezone', 
            'phone_type', 'date_added', 'last_tracked', 'notes'
        ];
        
        const exportFields = fields || defaultFields;
        
        // Create CSV content
        let csvContent = '';
        
        // Add headers
        if (includeHeaders) {
            const headers = exportFields.map(field => 
                this.formatCSVHeader(field)
            ).join(delimiter);
            csvContent += headers + '\n';
        }
        
        // Add data rows
        data.forEach(row => {
            const rowData = exportFields.map(field => {
                const value = row[field] || '';
                return this.formatCSVValue(value, delimiter);
            }).join(delimiter);
            csvContent += rowData + '\n';
        });
        
        // Create and download file
        this.downloadFile(csvContent, filename, 'text/csv');
        
        return { success: true, filename, recordCount: data.length };
    }

    // Export to JSON format
    exportToJSON(data, options = {}) {
        const {
            filename = `nigeria_phone_tracker_${new Date().toISOString().split('T')[0]}.json`,
            prettyPrint = true,
            includeMetadata = true
        } = options;

        if (!data) {
            throw new Error('No data to export');
        }

        const exportData = {
            export_date: new Date().toISOString(),
            version: '2.0.0',
            application: 'Nigeria Phone Tracker - Professional Edition'
        };

        if (includeMetadata) {
            exportData.metadata = {
                total_records: Array.isArray(data) ? data.length : 1,
                export_format: 'json',
                generated_by: 'Nigeria Phone Tracker'
            };
        }

        exportData.data = data;

        const jsonString = prettyPrint 
            ? JSON.stringify(exportData, null, 2)
            : JSON.stringify(exportData);

        this.downloadFile(jsonString, filename, 'application/json');
        
        return { 
            success: true, 
            filename, 
            recordCount: Array.isArray(data) ? data.length : 1 
        };
    }

    // Export to PDF format (simplified version)
    async exportToPDF(data, options = {}) {
        const {
            filename = `nigeria_phone_tracker_${new Date().toISOString().split('T')[0]}.pdf`,
            title = 'Nigeria Phone Tracker Report',
            includeCharts = false,
            includeSummary = true
        } = options;

        if (!data) {
            throw new Error('No data to export');
        }

        // For a complete PDF export, you would need a library like jsPDF
        // This is a simplified version that creates an HTML report
        
        const htmlContent = this.generateHTMLReport(data, {
            title,
            includeCharts,
            includeSummary
        });

        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };

        return { 
            success: true, 
            filename, 
            recordCount: Array.isArray(data) ? data.length : 1,
            format: 'html_print'
        };
    }

    // Export to Excel format (simplified version)
    exportToExcel(data, options = {}) {
        const {
            filename = `nigeria_phone_tracker_${new Date().toISOString().split('T')[0]}.xlsx`,
            sheetName = 'Phone Numbers',
            includeSummary = true
        } = options;

        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('No data to export');
        }

        // For a complete Excel export, you would need a library like SheetJS
        // This is a simplified version that creates multiple CSV sheets
        
        // Main data sheet
        const mainCSV = this.createCSVContent(data);
        
        // Summary sheet
        let summaryCSV = '';
        if (includeSummary) {
            const summary = this.generateSummaryStats(data);
            summaryCSV = this.createCSVContent(summary);
        }

        // Create a zip-like structure (simplified)
        const combinedContent = [
            `Sheet: ${sheetName}`,
            mainCSV,
            '',
            includeSummary ? `Sheet: Summary` : '',
            includeSummary ? summaryCSV : ''
        ].filter(Boolean).join('\n');

        this.downloadFile(combinedContent, filename.replace('.xlsx', '.csv'), 'text/csv');
        
        return { 
            success: true, 
            filename: filename.replace('.xlsx', '.csv'), 
            recordCount: data.length,
            format: 'csv_multi_sheet'
        };
    }

    // Generate HTML report
    generateHTMLReport(data, options = {}) {
        const { title, includeCharts, includeSummary } = options;
        
        const summary = includeSummary ? this.generateSummaryStats(data) : null;
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .data-table th { background-color: #f2f2f2; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    
    ${includeSummary && summary ? this.generateSummaryHTML(summary) : ''}
    
    <div class="data-section">
        <h2>Phone Number Data</h2>
        ${this.generateDataTableHTML(data)}
    </div>
    
    <div class="footer no-print">
        <p>Generated by Nigeria Phone Tracker - Professional Edition</p>
    </div>
</body>
</html>`;

        return html;
    }

    // Generate summary statistics
    generateSummaryStats(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return { total: 0, message: 'No data available' };
        }

        const stats = {
            total_records: data.length,
            valid_numbers: data.filter(item => item.is_valid).length,
            invalid_numbers: data.filter(item => !item.is_valid).length,
            carriers: {},
            phone_types: {},
            regions: {}
        };

        // Calculate distributions
        data.forEach(item => {
            // Carrier distribution
            const carrier = item.carrier || 'Unknown';
            stats.carriers[carrier] = (stats.carriers[carrier] || 0) + 1;

            // Phone type distribution
            const type = item.phone_type || 'Unknown';
            stats.phone_types[type] = (stats.phone_types[type] || 0) + 1;

            // Region distribution
            const region = item.region || 'Unknown';
            stats.regions[region] = (stats.regions[region] || 0) + 1;
        });

        return stats;
    }

    // Generate summary HTML
    generateSummaryHTML(summary) {
        return `
    <div class="summary">
        <h2>Summary Statistics</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div>
                <strong>Total Records:</strong> ${summary.total_records}
            </div>
            <div>
                <strong>Valid Numbers:</strong> ${summary.valid_numbers}
            </div>
            <div>
                <strong>Invalid Numbers:</strong> ${summary.invalid_numbers}
            </div>
        </div>
        
        ${Object.keys(summary.carriers).length > 0 ? `
        <h3>Top Carriers</h3>
        <ul>
            ${Object.entries(summary.carriers)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([carrier, count]) => `<li>${carrier}: ${count}</li>`)
                .join('')}
        </ul>
        ` : ''}
    </div>`;
    }

    // Generate data table HTML
    generateDataTableHTML(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return '<p>No data available</p>';
        }

        const headers = ['Phone Number', 'Carrier', 'Type', 'Region', 'Date Added', 'Notes'];
        const fields = ['phone_number', 'carrier', 'phone_type', 'region', 'date_added', 'notes'];

        let html = '<table class="data-table"><thead><tr>';
        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '</tr></thead><tbody>';

        data.forEach(row => {
            html += '<tr>';
            fields.forEach(field => {
                const value = row[field] || '';
                html += `<td>${this.escapeHtml(value)}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        return html;
    }

    // Create CSV content
    createCSVContent(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }

        const headers = Object.keys(data[0]);
        let csv = headers.join(',') + '\n';

        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] || '';
                return this.formatCSVValue(value, ',');
            });
            csv += values.join(',') + '\n';
        });

        return csv;
    }

    // Format CSV header
    formatCSVHeader(field) {
        return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Format CSV value
    formatCSVValue(value, delimiter) {
        if (value === null || value === undefined) {
            return '';
        }
        
        const stringValue = String(value);
        
        // If the value contains the delimiter, quotes, or newlines, wrap in quotes
        if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
    }

    // Download file helper
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    // Escape HTML for safety
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Generate custom report with filters
    async generateCustomReport(filters = {}, options = {}) {
        try {
            // Get filtered data from API
            const response = await api.getTrackedNumbers(1, 10000, filters.search || '');
            let data = response.numbers;

            // Apply additional filters
            if (filters.carrier) {
                data = data.filter(item => 
                    item.carrier && item.carrier.toLowerCase().includes(filters.carrier.toLowerCase())
                );
            }

            if (filters.phoneType) {
                data = data.filter(item => 
                    item.phone_type === filters.phoneType
                );
            }

            if (filters.dateFrom) {
                data = data.filter(item => 
                    new Date(item.date_added) >= new Date(filters.dateFrom)
                );
            }

            if (filters.dateTo) {
                data = data.filter(item => 
                    new Date(item.date_added) <= new Date(filters.dateTo)
                );
            }

            // Export filtered data
            return this.exportData(options.format || 'csv', data, {
                filename: options.filename || `custom_report_${new Date().toISOString().split('T')[0]}.${options.format || 'csv'}`,
                includeSummary: options.includeSummary !== false
            });

        } catch (error) {
            console.error('Failed to generate custom report:', error);
            throw error;
        }
    }

    // Backup functionality
    async createBackup() {
        try {
            const numbers = await api.getTrackedNumbers(1, 100000);
            const stats = await api.getStatistics();
            
            const backupData = {
                backup_date: new Date().toISOString(),
                version: '2.0.0',
                statistics: stats,
                phone_numbers: numbers.numbers
            };

            return this.exportToJSON(backupData, {
                filename: `phone_tracker_backup_${new Date().toISOString().split('T')[0]}.json`,
                prettyPrint: true
            });

        } catch (error) {
            console.error('Failed to create backup:', error);
            throw error;
        }
    }
}

// Initialize export functionality
document.addEventListener('DOMContentLoaded', () => {
    window.exportManager = new PhoneTrackerExport();
});

// Export for use in other modules
window.PhoneTrackerExport = PhoneTrackerExport;
