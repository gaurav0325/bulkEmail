// Centralized Database Manager for API Integration
// This file replaces localStorage with API calls to the backend database

class DatabaseManager {
    constructor() {
        this.apiBase = '/.netlify/functions';
        this.sessionToken = null;
        this.currentUser = null;
        this.isOnline = navigator.onLine;

        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('[DatabaseManager] Back online - syncing data...');
            this.syncPendingChanges();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('[DatabaseManager] Gone offline - using local cache');
        });
    }

    // API call wrapper with error handling
    async apiCall(endpoint, data = {}, method = 'POST') {
        try {
            const response = await fetch(`${this.apiBase}/${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.sessionToken ? `Bearer ${this.sessionToken}` : ''
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error(`[DatabaseManager] API call failed for ${endpoint}:`, error);

            // If offline, store for later sync
            if (!this.isOnline) {
                this.storePendingSync(endpoint, data, method);
            }

            throw error;
        }
    }

    // Store operations for offline sync
    storePendingSync(endpoint, data, method) {
        const pending = JSON.parse(localStorage.getItem('pendingSyncs') || '[]');
        pending.push({
            endpoint,
            data,
            method,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        });
        localStorage.setItem('pendingSyncs', JSON.stringify(pending));
    }

    // Sync pending changes when back online
    async syncPendingChanges() {
        const pending = JSON.parse(localStorage.getItem('pendingSyncs') || '[]');

        for (const sync of pending) {
            try {
                await this.apiCall(sync.endpoint, sync.data, sync.method);
                console.log(`[DatabaseManager] Synced pending change: ${sync.endpoint}`);
            } catch (error) {
                console.error(`[DatabaseManager] Failed to sync: ${sync.endpoint}`, error);
                // Keep failed syncs for retry
                continue;
            }
        }

        // Clear successfully synced items
        localStorage.removeItem('pendingSyncs');
    }

    // User Authentication Methods
    async registerUser(email, password, fullName) {
        try {
            const result = await this.apiCall('auth-register', {
                email,
                password,
                fullName
            });

            console.log('[DatabaseManager] User registered successfully:', result);
            return result;
        } catch (error) {
            console.error('[DatabaseManager] Registration failed:', error);
            throw error;
        }
    }

    async loginUser(email, password, rememberMe = true) {
        try {
            const result = await this.apiCall('auth-login', {
                email,
                password,
                rememberMe
            });

            if (result.success) {
                // Store session data
                this.sessionToken = result.session.token;
                this.currentUser = result.user;

                // Store in localStorage for session persistence
                localStorage.setItem('db_session_token', this.sessionToken);
                localStorage.setItem('db_session_expires', result.session.expiresAt.toString());
                localStorage.setItem('db_current_user', JSON.stringify(this.currentUser));

                console.log('[DatabaseManager] Login successful, session stored');
                return result;
            }
        } catch (error) {
            console.error('[DatabaseManager] Login failed:', error);
            throw error;
        }
    }

    async verifySession() {
        // Check localStorage first
        const storedToken = localStorage.getItem('db_session_token');
        const storedExpiry = localStorage.getItem('db_session_expires');
        const storedUser = localStorage.getItem('db_current_user');

        if (!storedToken || !storedExpiry || !storedUser) {
            console.log('[DatabaseManager] No stored session found');
            return false;
        }

        // Check if session is expired
        if (Date.now() > parseInt(storedExpiry)) {
            console.log('[DatabaseManager] Stored session expired');
            this.clearSession();
            return false;
        }

        try {
            // Verify with backend
            const result = await this.apiCall('auth-verify-session', {
                token: storedToken
            });

            if (result.success) {
                this.sessionToken = storedToken;
                this.currentUser = result.user;
                console.log('[DatabaseManager] Session verified successfully');
                return {
                    success: true,
                    user: result.user,
                    userData: result.userData
                };
            }
        } catch (error) {
            console.error('[DatabaseManager] Session verification failed:', error);
            this.clearSession();
            return false;
        }
    }

    clearSession() {
        this.sessionToken = null;
        this.currentUser = null;
        localStorage.removeItem('db_session_token');
        localStorage.removeItem('db_session_expires');
        localStorage.removeItem('db_current_user');
        console.log('[DatabaseManager] Session cleared');
    }

    // Data Sync Methods
    async saveContacts(contacts) {
        try {
            const result = await this.apiCall('data-sync', {
                token: this.sessionToken,
                action: 'save_contacts',
                data: contacts
            });

            console.log('[DatabaseManager] Contacts saved to database:', result);
            return result;
        } catch (error) {
            console.error('[DatabaseManager] Failed to save contacts:', error);
            // Fallback to localStorage if API fails
            localStorage.setItem('contacts', JSON.stringify(contacts));
            throw error;
        }
    }

    async saveCompanies(companies) {
        try {
            const result = await this.apiCall('data-sync', {
                token: this.sessionToken,
                action: 'save_companies',
                data: companies
            });

            console.log('[DatabaseManager] Companies saved to database:', result);
            return result;
        } catch (error) {
            console.error('[DatabaseManager] Failed to save companies:', error);
            // Fallback to localStorage if API fails
            localStorage.setItem('companies', JSON.stringify(companies));
            throw error;
        }
    }

    async saveEmailHistory(emailHistory) {
        try {
            const result = await this.apiCall('data-sync', {
                token: this.sessionToken,
                action: 'save_email_history',
                data: emailHistory
            });

            console.log('[DatabaseManager] Email history saved to database:', result);
            return result;
        } catch (error) {
            console.error('[DatabaseManager] Failed to save email history:', error);
            // Fallback to localStorage if API fails
            localStorage.setItem('emailHistory', JSON.stringify(emailHistory));
            throw error;
        }
    }

    async getAllUserData() {
        try {
            const result = await this.apiCall('data-sync', {
                token: this.sessionToken,
                action: 'get_all_data'
            });

            console.log('[DatabaseManager] Retrieved all user data from database');
            return result.data;
        } catch (error) {
            console.error('[DatabaseManager] Failed to get user data:', error);

            // Fallback to localStorage if API fails
            const fallbackData = {
                contacts: JSON.parse(localStorage.getItem('contacts') || '[]'),
                companies: JSON.parse(localStorage.getItem('companies') || '[]'),
                emailHistory: JSON.parse(localStorage.getItem('emailHistory') || '[]')
            };

            console.log('[DatabaseManager] Using localStorage fallback data');
            return fallbackData;
        }
    }

    async saveAllUserData(data) {
        try {
            const result = await this.apiCall('data-sync', {
                token: this.sessionToken,
                action: 'save_all_data',
                data: data
            });

            console.log('[DatabaseManager] All user data saved to database:', result);
            return result;
        } catch (error) {
            console.error('[DatabaseManager] Failed to save all user data:', error);

            // Fallback to localStorage if API fails
            if (data.contacts) localStorage.setItem('contacts', JSON.stringify(data.contacts));
            if (data.companies) localStorage.setItem('companies', JSON.stringify(data.companies));
            if (data.emailHistory) localStorage.setItem('emailHistory', JSON.stringify(data.emailHistory));

            throw error;
        }
    }

    // Migration helper - move localStorage data to database
    async migrateLocalStorageToDatabase() {
        console.log('[DatabaseManager] Starting localStorage to database migration...');

        try {
            const localData = {
                contacts: JSON.parse(localStorage.getItem('contacts') || '[]'),
                companies: JSON.parse(localStorage.getItem('companies') || '[]'),
                emailHistory: JSON.parse(localStorage.getItem('emailHistory') || '[]')
            };

            if (localData.contacts.length > 0 || localData.companies.length > 0 || localData.emailHistory.length > 0) {
                await this.saveAllUserData(localData);
                console.log('[DatabaseManager] Migration completed successfully');

                // Optionally clear localStorage after successful migration
                // localStorage.removeItem('contacts');
                // localStorage.removeItem('companies');
                // localStorage.removeItem('emailHistory');

                return true;
            } else {
                console.log('[DatabaseManager] No local data to migrate');
                return false;
            }
        } catch (error) {
            console.error('[DatabaseManager] Migration failed:', error);
            return false;
        }
    }

    // Utility methods
    isAuthenticated() {
        return this.sessionToken && this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getSessionToken() {
        return this.sessionToken;
    }
}

// Create global instance
const dbManager = new DatabaseManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseManager;
}