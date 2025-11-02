class AuthManager {
    constructor() {
        this.form = document.getElementById('authForm');
        this.emailInput = document.getElementById('email');
        this.licenseKeyInput = document.getElementById('licenseKey');
        this.authButton = document.getElementById('authButton');
        this.buttonText = document.getElementById('buttonText');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');
        this.offlineMode = document.getElementById('offlineMode');
        this.demoModeLink = document.getElementById('demoMode');
        this.helpLink = document.getElementById('helpLink');

        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.demoModeLink.addEventListener('click', (e) => this.handleDemoMode(e));
        this.helpLink.addEventListener('click', (e) => this.handleHelp(e));
        
        // Vérifier le mode hors ligne
        this.checkOfflineMode();
        
        // Charger les données sauvegardées
        this.loadSavedCredentials();
    }

    checkOfflineMode() {
        if (!navigator.onLine) {
            this.offlineMode.classList.remove('hidden');
        }
    }

    loadSavedCredentials() {
        try {
            const saved = localStorage.getItem('appsMobs_auth');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.email) {
                    this.emailInput.value = data.email;
                }
            }
        } catch (e) {
            console.log('Aucune donnée sauvegardée');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const email = this.emailInput.value.trim();
        const licenseKey = this.licenseKeyInput.value.trim();

        if (!email || !licenseKey) {
            this.showError('Veuillez remplir tous les champs');
            return;
        }

        this.setLoading(true);

        try {
            const result = await this.authenticate(email, licenseKey);
            
            if (result.success) {
                this.showSuccess('Authentification réussie !');
                
                // Sauvegarder les données
                this.saveCredentials(email, licenseKey);
                
                // Rediriger vers l'application principale
                setTimeout(() => {
                    this.redirectToApp(result);
                }, 1200);
            } else {
                this.showError(result.message || 'Erreur d\'authentification');
            }
        } catch (error) {
            this.showError('Erreur de connexion au serveur');
            console.error('Auth error:', error);
        } finally {
            this.setLoading(false);
        }
    }

    async authenticate(email, licenseKey) {
        if (window.electronAPI && window.electronAPI.verifyLicense) {
            try {
                const result = await window.electronAPI.verifyLicense(email, licenseKey);
                return result;
            } catch (e) {
                return { success: false, message: 'Erreur de communication' };
            }
        }
        return { success: false, message: 'API non disponible' };
    }

    handleDemoMode(e) {
        e.preventDefault();
        this.showSuccess('Mode démo activé');
        setTimeout(() => {
            this.redirectToApp({
                success: true,
                plan: 'demo',
                jwt_token: 'demo_token',
                expires_at: Date.now() + (60 * 60 * 1000)
            });
        }, 800);
    }

    handleHelp(e) {
        e.preventDefault();
        this.showSuccess('Redirection vers l\'aide...');
    }

    redirectToApp(authData) {
        if (window.electronAPI && window.electronAPI.setAuthData) {
            window.electronAPI.setAuthData(authData);
        }
        if (window.electronAPI && window.electronAPI.closeAuthWindow) {
            window.electronAPI.closeAuthWindow();
        }
    }

    saveCredentials(email, licenseKey) {
        try {
            const data = { email, licenseKey, timestamp: Date.now() };
            localStorage.setItem('appsMobs_auth', JSON.stringify(data));
        } catch (e) {
            console.log('Impossible de sauvegarder les données');
        }
    }

    setLoading(loading) {
        this.authButton.disabled = loading;
        if (loading) {
            this.buttonText.style.display = 'none';
            this.loadingSpinner.style.display = 'block';
        } else {
            this.buttonText.style.display = 'block';
            this.loadingSpinner.style.display = 'none';
        }
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.successMessage.style.display = 'none';
    }

    showSuccess(message) {
        this.successMessage.textContent = message;
        this.successMessage.style.display = 'block';
        this.errorMessage.style.display = 'none';
    }
}

new AuthManager();
