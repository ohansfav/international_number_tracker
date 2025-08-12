// Main Application Controller for International Number Tracker
class PhoneTrackerApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentNumbersPage = 1;
        this.numbersPerPage = 50;
        this.searchQuery = '';
        this.currentValidation = null;
        
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadDashboardData();
            
            // Set up Electron API listeners
            this.setupElectronListeners();
            
            console.log('International Number Tracker initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            APIUtils.showToast('Error', 'Failed to initialize application', 'danger');
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Search input (with debounce)
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const debouncedSearch = APIUtils.debounce(() => {
                this.searchQuery = searchInput.value.trim();
                this.currentNumbersPage = 1;
                this.loadNumbers();
            }, 500);
            
            searchInput.addEventListener('input', debouncedSearch);
        }

        // Enter key on search input
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchNumbers();
                }
            });
        }

        // Phone input validation (real-time)
        const phoneInput = document.getElementById('phone-input');
        if (phoneInput) {
            phoneInput.addEventListener('input', () => {
                this.validatePhoneInput();
            });
        }

        // Enter key on phone input
        if (phoneInput) {
            phoneInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.validateNumber();
                }
            });
        }
    }

    setupElectronListeners() {
        if (window.electronAPI) {
            // Import dialog
            window.electronAPI.onImportDialog(() => {
                this.showImportDialog();
            });

            // Export dialog
            window.electronAPI.onExportDialog(() => {
                this.showExportDialog();
            });

            // Generate report
            window.electronAPI.onGenerateReport(() => {
                this.generateReport();
            });

            // Clear data dialog
            window.electronAPI.onClearDataDialog(() => {
                this.showClearDataDialog();
            });

            // Settings dialog
            window.electronAPI.onSettingsDialog(() => {
                this.showSettings();
            });

            // About dialog
            window.electronAPI.onAboutDialog(() => {
                this.showAboutDialog();
            });
        }
    }

    // Page Management
    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page-content').forEach(page => {
            page.style.display = 'none';
        });

        // Show selected page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.style.display = 'block';
            targetPage.classList.add('fade-in');
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentPage = pageName;

        // Load page-specific data
        this.loadPageData(pageName);
    }

    async loadPageData(pageName) {
        try {
            switch (pageName) {
                case 'dashboard':
                    await this.loadDashboardData();
                    break;
                case 'numbers':
                    await this.loadNumbers();
                    break;
                case 'analytics':
                    await this.loadAnalytics();
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${pageName} data:`, error);
            APIUtils.showToast('Error', `Failed to load ${pageName} data`, 'danger');
        }
    }

    // Dashboard Functions
    async loadDashboardData() {
        APIUtils.showLoading();
        
        try {
            const stats = await api.getStatistics();
            this.updateDashboardStats(stats);
            
            const recentNumbers = await api.getTrackedNumbers(1, 5);
            this.updateRecentNumbers(recentNumbers.numbers);
            
        } catch (error) {
            APIUtils.handleAPIError(error, 'Failed to load dashboard data');
        } finally {
            APIUtils.hideLoading();
        }
    }

    updateDashboardStats(stats) {
        const elements = {
            'total-numbers': stats.total_numbers || 0,
            'valid-numbers': stats.valid_numbers || 0,
            'invalid-numbers': stats.invalid_numbers || 0,
            'recent-activity': stats.recent_activity || 0
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value.toLocaleString();
                element.parentElement.parentElement.classList.add('fade-in');
            }
        });
    }

    updateRecentNumbers(numbers) {
        const container = document.getElementById('recent-numbers-list');
        
        if (!numbers || numbers.length === 0) {
            container.innerHTML = '<p class="text-muted">No recent numbers found</p>';
            return;
        }

        const html = numbers.map(num => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                <div>
                    <strong>${APIUtils.formatPhoneNumber(num.phone_number)}</strong>
                    <br>
                    <small class="text-muted">${num.carrier || 'Unknown'}</small>
                </div>
                <div>
                    ${APIUtils.getStatusBadge(num.is_valid, num.phone_type)}
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // Phone Number Tracking Functions
    validatePhoneInput() {
        const phoneInput = document.getElementById('phone-input');
        const trackBtn = document.getElementById('track-btn');
        
        if (!phoneInput || !trackBtn) return;

        const isValid = APIUtils.isValidPhoneFormat(phoneInput.value);
        
        if (isValid) {
            phoneInput.classList.remove('is-invalid');
            phoneInput.classList.add('is-valid');
        } else {
            phoneInput.classList.remove('is-valid');
            if (phoneInput.value.length > 0) {
                phoneInput.classList.add('is-invalid');
            }
        }
    }

    async validateNumber() {
        const phoneInput = document.getElementById('phone-input');
        const phoneNumber = phoneInput.value.trim();
        
        if (!phoneNumber) {
            APIUtils.showToast('Validation', 'Please enter a phone number', 'warning');
            return;
        }

        if (!APIUtils.isValidPhoneFormat(phoneNumber)) {
            APIUtils.showToast('Validation', 'Invalid phone number format', 'warning');
            return;
        }

        APIUtils.showLoading();
        
        try {
            const result = await api.validatePhoneNumber(phoneNumber);
            this.currentValidation = result;
            
            if (result.is_valid) {
                // Get enhanced information including owner and location data
                const enhancedInfo = await api.getEnhancedPhoneInfo(phoneNumber);
                this.showEnhancedPhoneDetails(enhancedInfo);
                
                // Enable track button
                const trackBtn = document.getElementById('track-btn');
                if (trackBtn) {
                    trackBtn.disabled = false;
                }
                
                APIUtils.showToast('Validation', 'Phone number is valid', 'success');
            } else {
                APIUtils.showToast('Validation', 'Phone number is invalid', 'danger');
                
                const trackBtn = document.getElementById('track-btn');
                if (trackBtn) {
                    trackBtn.disabled = true;
                }
            }
        } catch (error) {
            APIUtils.handleAPIError(error, 'Failed to validate phone number');
        } finally {
            APIUtils.hideLoading();
        }
    }

    showEnhancedPhoneDetails(enhancedInfo) {
        // Show basic phone details
        this.showPhoneDetails(enhancedInfo);
        
        // Show owner information
        this.showOwnerDetails(enhancedInfo.owner_info);
        
        // Show location information
        this.showLocationDetails(enhancedInfo.location_info);
    }

    showPhoneDetails(info) {
        const detailsCard = document.getElementById('phone-details');
        const contentDiv = document.getElementById('phone-info-content');
        
        if (!detailsCard || !contentDiv) return;

        const html = `
            <div class="row">
                <div class="col-md-6">
                    <table class="table table-borderless">
                        <tr>
                            <td><strong>Phone Number:</strong></td>
                            <td>${APIUtils.formatPhoneNumber(info.phone_number)}</td>
                        </tr>
                        <tr>
                            <td><strong>National Format:</strong></td>
                            <td>${info.national_format || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>Country Code:</strong></td>
                            <td>+${info.country_code || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>Region:</strong></td>
                            <td>${info.region || 'N/A'}</td>
                        </tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <table class="table table-borderless">
                        <tr>
                            <td><strong>Carrier:</strong></td>
                            <td>${info.carrier || 'Unknown'}</td>
                        </tr>
                        <tr>
                            <td><strong>Phone Type:</strong></td>
                            <td>${info.phone_type || 'Unknown'}</td>
                        </tr>
                        <tr>
                            <td><strong>Location:</strong></td>
                            <td>${info.location || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>Timezone:</strong></td>
                            <td>${Array.isArray(info.timezone) ? info.timezone.join(', ') : info.timezone || 'N/A'}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="mt-3">
                ${APIUtils.getStatusBadge(info.is_valid, info.phone_type)}
            </div>
        `;

        contentDiv.innerHTML = html;
        detailsCard.style.display = 'block';
        detailsCard.classList.add('fade-in');
    }

    showOwnerDetails(ownerInfo) {
        const ownerCard = document.getElementById('owner-details');
        const contentDiv = document.getElementById('owner-info-content');
        
        if (!ownerCard || !contentDiv || !ownerInfo) return;

        const riskLevel = ownerInfo.risk_score < 0.3 ? 'low' : 
                         ownerInfo.risk_score < 0.7 ? 'medium' : 'high';
        const riskBadge = riskLevel === 'low' ? 'success' : 
                         riskLevel === 'medium' ? 'warning' : 'danger';

        const spamLevel = ownerInfo.spam_probability < 0.2 ? 'low' : 
                         ownerInfo.spam_probability < 0.5 ? 'medium' : 'high';
        const spamBadge = spamLevel === 'low' ? 'success' : 
                         spamLevel === 'medium' ? 'warning' : 'danger';

        const html = `
            <div class="row">
                <div class="col-md-6">
                    <h6 class="text-primary mb-3">
                        <i class="bi bi-person-fill me-2"></i>Personal Information
                    </h6>
                    <table class="table table-borderless">
                        <tr>
                            <td><strong>Name:</strong></td>
                            <td>${ownerInfo.name || 'Unknown'}</td>
                        </tr>
                        <tr>
                            <td><strong>Email:</strong></td>
                            <td>${ownerInfo.email || 'Not available'}</td>
                        </tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6 class="text-info mb-3">
                        <i class="bi bi-shield-fill me-2"></i>Risk Assessment
                    </h6>
                    <table class="table table-borderless">
                        <tr>
                            <td><strong>Risk Score:</strong></td>
                            <td>
                                <span class="badge bg-${riskBadge}">
                                    ${riskLevel.toUpperCase()} (${(ownerInfo.risk_score * 100).toFixed(1)}%)
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Spam Probability:</strong></td>
                            <td>
                                <span class="badge bg-${spamBadge}">
                                    ${spamLevel.toUpperCase()} (${(ownerInfo.spam_probability * 100).toFixed(1)}%)
                                </span>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            ${ownerInfo.social_profiles && Object.keys(ownerInfo.social_profiles).length > 0 ? `
            <div class="mt-3">
                <h6 class="text-secondary mb-2">
                    <i class="bi bi-share-fill me-2"></i>Social Profiles
                </h6>
                <div class="d-flex gap-2 flex-wrap">
                    ${Object.entries(ownerInfo.social_profiles).map(([platform, url]) => `
                        <a href="${url}" target="_blank" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-${platform === 'linkedin' ? 'linkedin' : platform === 'twitter' ? 'twitter' : 'globe'} me-1"></i>
                            ${platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </a>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;

        contentDiv.innerHTML = html;
        ownerCard.style.display = 'block';
        ownerCard.classList.add('fade-in');
    }

    showLocationDetails(locationInfo) {
        const locationCard = document.getElementById('location-details');
        const contentDiv = document.getElementById('location-info-content');
        
        if (!locationCard || !contentDiv || !locationInfo) return;

        const detailed = locationInfo.detailed_location || {};
        const html = `
            <div class="row">
                <div class="col-md-6">
                    <h6 class="text-success mb-3">
                        <i class="bi bi-geo-alt-fill me-2"></i>Basic Location
                    </h6>
                    <table class="table table-borderless">
                        <tr>
                            <td><strong>Region:</strong></td>
                            <td>${locationInfo.region || 'Unknown'}</td>
                        </tr>
                        <tr>
                            <td><strong>Location:</strong></td>
                            <td>${locationInfo.basic_location || 'Unknown'}</td>
                        </tr>
                    </table>
                </div>
                ${detailed.latitude && detailed.longitude ? `
                <div class="col-md-6">
                    <h6 class="text-warning mb-3">
                        <i class="bi bi-pin-map-fill me-2"></i>Detailed Location
                    </h6>
                    <table class="table table-borderless">
                        <tr>
                            <td><strong>City:</strong></td>
                            <td>${detailed.city || 'Unknown'}</td>
                        </tr>
                        <tr>
                            <td><strong>State:</strong></td>
                            <td>${detailed.state || 'Unknown'}</td>
                        </tr>
                        <tr>
                            <td><strong>Country:</strong></td>
                            <td>${detailed.country || 'Unknown'}</td>
                        </tr>
                        <tr>
                            <td><strong>Coordinates:</strong></td>
                            <td><small>${detailed.latitude.toFixed(4)}, ${detailed.longitude.toFixed(4)}</small></td>
                        </tr>
                    </table>
                </div>
                ` : ''}
            </div>
            ${locationInfo.map_html ? `
            <div class="mt-3">
                <h6 class="text-info mb-2">
                    <i class="bi bi-map me-2"></i>Location Map
                </h6>
                <div class="border rounded" style="height: 300px; overflow: hidden;">
                    ${locationInfo.map_html}
                </div>
            </div>
            ` : ''}
            <div class="mt-2">
                <small class="text-muted">
                    <i class="bi bi-info-circle me-1"></i>
                    Location data is approximate and based on phone number region
                </small>
            </div>
        `;

        contentDiv.innerHTML = html;
        locationCard.style.display = 'block';
        locationCard.classList.add('fade-in');
    }

    async trackNumber() {
        const phoneInput = document.getElementById('phone-input');
        const notesInput = document.getElementById('notes-input');
        
        const phoneNumber = phoneInput.value.trim();
        const notes = notesInput.value.trim();

        if (!phoneNumber) {
            APIUtils.showToast('Tracking', 'Please enter a phone number', 'warning');
            return;
        }

        APIUtils.showLoading();

        try {
            const result = await api.trackPhoneNumber(phoneNumber, notes);
            
            if (result.success) {
                APIUtils.showToast('Success', 'Phone number tracked successfully', 'success');
                this.clearForm();
                
                // Refresh dashboard data
                if (this.currentPage === 'dashboard') {
                    await this.loadDashboardData();
                }
            } else {
                APIUtils.showToast('Error', result.message || 'Failed to track phone number', 'danger');
            }
        } catch (error) {
            APIUtils.handleAPIError(error, 'Failed to track phone number');
        } finally {
            APIUtils.hideLoading();
        }
    }

    clearForm() {
        const phoneInput = document.getElementById('phone-input');
        const notesInput = document.getElementById('notes-input');
        const trackBtn = document.getElementById('track-btn');
        const detailsCard = document.getElementById('phone-details');
        const ownerCard = document.getElementById('owner-details');
        const locationCard = document.getElementById('location-details');

        if (phoneInput) {
            phoneInput.value = '';
            phoneInput.classList.remove('is-valid', 'is-invalid');
        }
        
        if (notesInput) {
            notesInput.value = '';
        }
        
        if (trackBtn) {
            trackBtn.disabled = true;
        }
        
        if (detailsCard) {
            detailsCard.style.display = 'none';
        }

        if (ownerCard) {
            ownerCard.style.display = 'none';
        }

        if (locationCard) {
            locationCard.style.display = 'none';
        }

        this.currentValidation = null;
    }

    // Numbers Management Functions
    async loadNumbers() {
        APIUtils.showLoading();
        
        try {
            const result = await api.getTrackedNumbers(
                this.currentNumbersPage, 
                this.numbersPerPage, 
                this.searchQuery
            );
            
            this.updateNumbersTable(result.numbers);
            this.updatePagination(result.page, result.pages);
            
        } catch (error) {
            APIUtils.handleAPIError(error, 'Failed to load tracked numbers');
        } finally {
            APIUtils.hideLoading();
        }
    }

    updateNumbersTable(numbers) {
        const tbody = document.getElementById('numbers-table-body');
        
        if (!numbers || numbers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        No tracked numbers found
                    </td>
                </tr>
            `;
            return;
        }

        const html = numbers.map(num => `
            <tr>
                <td>
                    <strong>${APIUtils.formatPhoneNumber(num.phone_number)}</strong>
                </td>
                <td>
                    <i class="bi ${APIUtils.getCarrierIcon(num.carrier)} me-1"></i>
                    ${num.carrier || 'Unknown'}
                </td>
                <td>${num.phone_type || 'Unknown'}</td>
                <td>${APIUtils.formatDate(num.date_added)}</td>
                <td>
                    <small class="text-muted">${num.notes || '-'}</small>
                </td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-outline-primary me-1" 
                            onclick="app.viewNumberDetails('${num.phone_number}')"
                            title="View Details">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="app.deleteNumber('${num.phone_number}')"
                            title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = html;
    }

    updatePagination(currentPage, totalPages) {
        const pagination = document.getElementById('pagination');
        
        if (!pagination) return;

        pagination.innerHTML = APIUtils.generatePagination(
            currentPage, 
            totalPages, 
            'app.goToPage'
        );
    }

    goToPage(page) {
        this.currentNumbersPage = page;
        this.loadNumbers();
    }

    searchNumbers() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            this.searchQuery = searchInput.value.trim();
            this.currentNumbersPage = 1;
            this.loadNumbers();
        }
    }

    refreshNumbers() {
        this.currentNumbersPage = 1;
        this.searchQuery = '';
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        this.loadNumbers();
    }

    async deleteNumber(phoneNumber) {
        if (!confirm(`Are you sure you want to delete ${APIUtils.formatPhoneNumber(phoneNumber)}?`)) {
            return;
        }

        APIUtils.showLoading();

        try {
            const result = await api.deleteTrackedNumber(phoneNumber);
            
            if (result.success) {
                APIUtils.showToast('Success', 'Phone number deleted successfully', 'success');
                this.loadNumbers();
                
                // Refresh dashboard if on dashboard
                if (this.currentPage === 'dashboard') {
                    await this.loadDashboardData();
                }
            } else {
                APIUtils.showToast('Error', result.message || 'Failed to delete phone number', 'danger');
            }
        } catch (error) {
            APIUtils.handleAPIError(error, 'Failed to delete phone number');
        } finally {
            APIUtils.hideLoading();
        }
    }

    async viewNumberDetails(phoneNumber) {
        try {
            const info = await api.getPhoneInfo(phoneNumber);
            
            // Show details in a modal or alert for now
            const details = Object.entries(info)
                .filter(([key, value]) => value && key !== 'error')
                .map(([key, value]) => {
                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return `${label}: ${Array.isArray(value) ? value.join(', ') : value}`;
                })
                .join('\n');
            
            alert(`Phone Number Details:\n\n${details}`);
            
        } catch (error) {
            APIUtils.handleAPIError(error, 'Failed to get phone number details');
        }
    }

    // Analytics Functions
    async loadAnalytics() {
        APIUtils.showLoading();
        
        try {
            const stats = await api.getStatistics();
            this.updateCharts(stats);
            
        } catch (error) {
            APIUtils.handleAPIError(error, 'Failed to load analytics data');
        } finally {
            APIUtils.hideLoading();
        }
    }

    updateCharts(stats) {
        // This function will be implemented in charts.js
        if (window.updateAnalyticsCharts) {
            window.updateAnalyticsCharts(stats);
        }
    }

    // Import/Export Functions
    showImportDialog() {
        const modal = new bootstrap.Modal(document.getElementById('importModal'));
        modal.show();
    }

    showExportDialog() {
        const modal = new bootstrap.Modal(document.getElementById('exportModal'));
        modal.show();
    }

    async importNumbers() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];
        
        if (!file) {
            APIUtils.showToast('Import', 'Please select a CSV file', 'warning');
            return;
        }

        APIUtils.showLoading();

        try {
            const result = await api.importCSV(file);
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('importModal'));
            modal.hide();
            
            if (result.errors.length === 0) {
                APIUtils.showToast('Success', `Successfully imported ${result.imported} numbers`, 'success');
            } else {
                APIUtils.showToast('Import Complete', 
                    `Imported ${result.imported} numbers with ${result.errors.length} errors`, 
                    'warning');
            }
            
            // Refresh current page data
            this.loadPageData(this.currentPage);
            
            // Clear file input
            fileInput.value = '';
            
        } catch (error) {
            APIUtils.handleAPIError(error, 'Failed to import numbers');
        } finally {
            APIUtils.hideLoading();
        }
    }

    async exportData(format) {
        APIUtils.showLoading();

        try {
            if (format === 'csv') {
                await api.exportCSV();
            } else if (format === 'json') {
                await api.exportJSON();
            }
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('exportModal'));
            modal.hide();
            
            APIUtils.showToast('Success', `Data exported as ${format.toUpperCase()}`, 'success');
            
        } catch (error) {
            APIUtils.handleAPIError(error, `Failed to export data as ${format.toUpperCase()}`);
        } finally {
            APIUtils.hideLoading();
        }
    }

    // Settings and Dialog Functions
    showSettings() {
        alert('Settings dialog would be implemented here with user preferences, theme selection, etc.');
    }

    showAboutDialog() {
        alert('International Number Tracker - Professional Edition\n\nVersion 2.0.0\n\nA professional tool for managing international phone numbers with validation, tracking, and analytics capabilities.');
    }

    showClearDataDialog() {
        if (confirm('Are you sure you want to clear all tracked phone numbers? This action cannot be undone.')) {
            this.clearAllData();
        }
    }

    async clearAllData() {
        APIUtils.showLoading();

        try {
            const result = await api.clearAllData();
            
            if (result.success) {
                APIUtils.showToast('Success', 'All data cleared successfully', 'success');
                
                // Refresh current page
                this.loadPageData(this.currentPage);
                
            } else {
                APIUtils.showToast('Error', 'Failed to clear data', 'danger');
            }
        } catch (error) {
            APIUtils.handleAPIError(error, 'Failed to clear data');
        } finally {
            APIUtils.hideLoading();
        }
    }

    generateReport() {
        alert('Report generation would be implemented here with PDF export capabilities.');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PhoneTrackerApp();
});

// Global functions for onclick handlers
window.showPage = (pageName) => {
    if (window.app) {
        window.app.showPage(pageName);
    }
};

window.validateNumber = () => {
    if (window.app) {
        window.app.validateNumber();
    }
};

window.trackNumber = () => {
    if (window.app) {
        window.app.trackNumber();
    }
};

window.clearForm = () => {
    if (window.app) {
        window.app.clearForm();
    }
};

window.searchNumbers = () => {
    if (window.app) {
        window.app.searchNumbers();
    }
};

window.refreshNumbers = () => {
    if (window.app) {
        window.app.refreshNumbers();
    }
};

window.showImportDialog = () => {
    if (window.app) {
        window.app.showImportDialog();
    }
};

window.showExportDialog = () => {
    if (window.app) {
        window.app.showExportDialog();
    }
};

window.importNumbers = () => {
    if (window.app) {
        window.app.importNumbers();
    }
};

window.exportData = (format) => {
    if (window.app) {
        window.app.exportData(format);
    }
};

window.showSettings = () => {
    if (window.app) {
        window.app.showSettings();
    }
};
