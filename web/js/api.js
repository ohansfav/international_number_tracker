// API Service for Nigerian Phone Tracker
class PhoneTrackerAPI {
    constructor() {
        this.baseURL = 'http://127.0.0.1:5000/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }
  
    
    // Generic HTTP request method
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                headers: { ...this.defaultHeaders, ...(options.headers || {}) },
                ...options
            };

            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        return await this.request('/health');
    }

    // Validate phone number
    async validatePhoneNumber(phoneNumber) {
        return await this.request('/validate', {
            method: 'POST',
            body: JSON.stringify({ phone_number: phoneNumber })
        });
    }

    // Get phone number information
    async getPhoneInfo(phoneNumber) {
        return await this.request('/info', {
            method: 'POST',
            body: JSON.stringify({ phone_number: phoneNumber })
        });
    }

    // Get enhanced phone number information (including owner and location)
    async getEnhancedPhoneInfo(phoneNumber) {
        return await this.request('/enhanced-info', {
            method: 'POST',
            body: JSON.stringify({ phone_number: phoneNumber })
        });
    }

    // Get owner information for phone number
    async getOwnerInfo(phoneNumber) {
        return await this.request('/owner-info', {
            method: 'POST',
            body: JSON.stringify({ phone_number: phoneNumber })
        });
    }

    // Get location information for phone number
    async getLocationInfo(phoneNumber) {
        return await this.request('/location-info', {
            method: 'POST',
            body: JSON.stringify({ phone_number: phoneNumber })
        });
    }

    // Track phone number
    async trackPhoneNumber(phoneNumber, notes = '') {
        return await this.request('/track', {
            method: 'POST',
            body: JSON.stringify({ phone_number: phoneNumber, notes })
        });
    }

    // Get tracked numbers with pagination
    async getTrackedNumbers(page = 1, perPage = 50, search = '') {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString()
        });
        
        if (search) {
            params.append('search', search);
        }

        return await this.request(`/numbers?${params.toString()}`);
    }

    // Delete tracked number
    async deleteTrackedNumber(phoneNumber) {
        return await this.request(`/numbers/${encodeURIComponent(phoneNumber)}`, {
            method: 'DELETE'
        });
    }

    // Search numbers
    async searchNumbers(query) {
        return await this.request(`/search?q=${encodeURIComponent(query)}`);
    }

    // Get statistics
    async getStatistics() {
        return await this.request('/stats');
    }

    // Export data as CSV
    async exportCSV() {
        try {
            const response = await fetch(`${this.baseURL}/export/csv`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nigeria_phone_tracker_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            return { success: true };
        } catch (error) {
            console.error('Export CSV failed:', error);
            throw error;
        }
    }

    // Export data as JSON
    async exportJSON() {
        try {
            const response = await fetch(`${this.baseURL}/export/json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nigeria_phone_tracker_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            return { success: true };
        } catch (error) {
            console.error('Export JSON failed:', error);
            throw error;
        }
    }

    // Import CSV file
    async importCSV(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${this.baseURL}/import/csv`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Import CSV failed:', error);
            throw error;
        }
    }

    // Backup database
    async backupDatabase() {
        try {
            const response = await fetch(`${this.baseURL}/backup`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `phone_numbers_backup_${new Date().toISOString().split('T')[0]}.db`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            return { success: true };
        } catch (error) {
            console.error('Backup failed:', error);
            throw error;
        }
    }

    // Clear all data
    async clearAllData() {
        return await this.request('/clear', {
            method: 'POST'
        });
    }
}

// Utility functions
class APIUtils {
    // Format phone number for display
    static formatPhoneNumber(phoneNumber) {
        if (!phoneNumber) return '';
        
        // Remove all non-digit characters except +
        const cleaned = phoneNumber.replace(/[^\d+]/g, '');
        
        if (cleaned.startsWith('+234')) {
            // International format: +234 801 234 5678
            return cleaned.replace(/(\+234)(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
        } else if (cleaned.startsWith('234')) {
            // International without +: 234 801 234 5678
            return cleaned.replace(/(234)(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
        } else if (cleaned.startsWith('0')) {
            // Local format: 0801 234 5678
            return cleaned.replace(/(0)(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
        } else if (cleaned.length === 10) {
            // Local without leading zero: 801 234 5678
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
        }
        
        return phoneNumber;
    }

    // Format date for display
    static formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }

    // Get carrier icon based on carrier name
    static getCarrierIcon(carrier) {
        const carrierLower = carrier ? carrier.toLowerCase() : '';
        
        if (carrierLower.includes('mtn')) {
            return 'bi-sim';
        } else if (carrierLower.includes('airtel')) {
            return 'bi-sim';
        } else if (carrierLower.includes('glo') || carrierLower.includes('globacom')) {
            return 'bi-sim';
        } else if (carrierLower.includes('9mobile')) {
            return 'bi-sim';
        } else {
            return 'bi-sim';
        }
    }

    // Get status badge HTML
    static getStatusBadge(isValid, phoneType) {
        if (isValid) {
            const typeClass = phoneType === 'Mobile' ? 'bg-success' : 'bg-info';
            return `<span class="badge ${typeClass} status-badge">
                        <i class="bi bi-check-circle me-1"></i>${phoneType || 'Valid'}
                    </span>`;
        } else {
            return `<span class="badge bg-danger status-badge">
                        <i class="bi bi-x-circle me-1"></i>Invalid
                    </span>`;
        }
    }

    // Show loading spinner
    static showLoading() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.display = 'block';
        }
    }

    // Hide loading spinner
    static hideLoading() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    // Show toast notification
    static showToast(title, message, type = 'info') {
        const toastEl = document.getElementById('toast');
        const toastTitle = document.getElementById('toast-title');
        const toastMessage = document.getElementById('toast-message');
        
        if (toastEl && toastTitle && toastMessage) {
            toastTitle.textContent = title;
            toastMessage.textContent = message;
            
            // Set toast color based on type
            toastEl.className = `toast bg-${type} text-white`;
            
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
        }
    }

    // Handle API errors
    static handleAPIError(error, customMessage = '') {
        console.error('API Error:', error);
        
        const message = customMessage || error.message || 'An error occurred. Please try again.';
        APIUtils.showToast('Error', message, 'danger');
    }

    // Debounce function for search
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Validate phone number format
    static isValidPhoneFormat(phoneNumber) {
        if (!phoneNumber) return false;
        
        // Remove all non-digit characters except +
        const cleaned = phoneNumber.replace(/[^\d+]/g, '');
        
        // Check various valid formats
        const patterns = [
            /^\+234\d{10}$/,  // International format
            /^234\d{10}$/,    // International without +
            /^0\d{10}$/,      // Local with leading zero
            /^\d{10}$/        // Local without leading zero
        ];
        
        return patterns.some(pattern => pattern.test(cleaned));
    }

    // Generate pagination HTML
    static generatePagination(currentPage, totalPages, onPageChange) {
        if (totalPages <= 1) return '';
        
        let html = '';
        
        // Previous button
        html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="event.preventDefault(); ${onPageChange}(${currentPage - 1})">
                        <i class="bi bi-chevron-left"></i>
                    </a>
                 </li>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                            <a class="page-link" href="#" onclick="event.preventDefault(); ${onPageChange}(${i})">${i}</a>
                         </li>`;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }
        
        // Next button
        html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="event.preventDefault(); ${onPageChange}(${currentPage + 1})">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                 </li>`;
        
        return html;
    }
}

// Initialize API service
const api = new PhoneTrackerAPI();

// Export for use in other modules
window.PhoneTrackerAPI = PhoneTrackerAPI;
window.APIUtils = APIUtils;
window.api = api;
