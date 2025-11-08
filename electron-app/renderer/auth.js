class AuthManager {
    constructor() {
        this.lang = (localStorage.getItem('language') || 'fr');
        this.i18n = {
            fr: {
                auth_subtitle: 'Authentification requise',
                offline_detected: 'Mode hors ligne détecté',
                offline_hint: 'Vérifiez votre connexion internet avant de réessayer.',
                email: 'Email',
                email_placeholder: 'votre@email.com',
                license_key: 'Clé de licence',
                license_placeholder: 'Votre clé de licence',
                remember_me: 'Se souvenir de moi',
                sign_in: 'Se connecter',
                buy_license: 'Acheter une licence',
                sign_up: "S'inscrire",
                help: 'Aide',
                license_info_title: '💡 Informations sur les licences',
                info_pro: 'Plan Pro: Accès complet à toutes les fonctionnalités',
                info_team: 'Plan Team: Fonctionnalités avancées + support prioritaire',
                info_security: 'Vos données sont chiffrées et sécurisées',
                info_ssl: 'Connexion SSL/TLS avec le serveur',
                fill_all: 'Veuillez remplir tous les champs',
                auth_success: 'Authentification réussie !',
                auth_error: "Erreur d'authentification",
                server_error: 'Erreur de connexion au serveur'
            },
            en: {
                auth_subtitle: 'Authentication required',
                offline_detected: 'Offline mode detected',
                offline_hint: 'Check your internet connection and try again.',
                email: 'Email',
                email_placeholder: 'your@email.com',
                license_key: 'License key',
                license_placeholder: 'Your license key',
                remember_me: 'Remember me',
                sign_in: 'Sign in',
                buy_license: 'Buy a license',
                sign_up: 'Sign up',
                help: 'Help',
                license_info_title: '💡 License information',
                info_pro: 'Pro Plan: Full access to all features',
                info_team: 'Team Plan: Advanced features + priority support',
                info_security: 'Your data is encrypted and secure',
                info_ssl: 'SSL/TLS connection with the server',
                fill_all: 'Please fill in all fields',
                auth_success: 'Authentication successful!',
                auth_error: 'Authentication error',
                server_error: 'Server connection error'
            }
        };
        this.form = document.getElementById('authForm');
        this.emailInput = document.getElementById('email');
        this.licenseKeyInput = document.getElementById('licenseKey');
        this.authButton = document.getElementById('authButton');
        this.buttonText = document.getElementById('buttonText');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');
        this.offlineMode = document.getElementById('offlineMode');
        this.rememberMe = document.getElementById('rememberMe');
        this.helpLink = document.getElementById('helpLink');
        this.langBtnEn = document.getElementById('auth-lang-en');
        this.langBtnFr = document.getElementById('auth-lang-fr');

        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.helpLink.addEventListener('click', (e) => this.handleHelp(e));
        if (this.langBtnEn) this.langBtnEn.addEventListener('click', () => this.setLanguage('en'));
        if (this.langBtnFr) this.langBtnFr.addEventListener('click', () => this.setLanguage('fr'));
        
        // Vérifier le mode hors ligne
        this.checkOfflineMode();
        // Mettre à jour dynamiquement lors des changements d'état réseau
        window.addEventListener('online', () => {
            if (this.offlineMode) this.offlineMode.classList.add('hidden');
        });
        window.addEventListener('offline', () => {
            if (this.offlineMode) this.offlineMode.classList.remove('hidden');
        });
        
        // Charger le logo depuis les assets packagés
        this.loadLogo();
        
        // Charger les données sauvegardées
        this.loadSavedCredentials();

        // Appliquer la langue au chargement
        this.applyTranslations();
    }

    t(key) {
        const dict = this.i18n[this.lang] || this.i18n.fr;
        return (dict && dict[key]) || key;
    }

    async loadLogo() {
        try {
            const el = document.getElementById('authLogo');
            if (!el) return;
            if (window.electronAPI && window.electronAPI.getAssetPath) {
                // Essayer d'abord PNG, puis ICO, puis chemin relatif
                const png = await window.electronAPI.getAssetPath('icons/Logo.png');
                const ico = await window.electronAPI.getAssetPath('icons/Logo.ico');
                if (png && png !== 'null') {
                    el.src = png;
                    el.onerror = () => {
                        if (ico && ico !== 'null') {
                            el.src = ico;
                        } else {
                            // Fallback: chemin relatif depuis renderer
                            el.src = '../assets/icons/Logo.png';
                            el.onerror = () => {
                                el.src = '../assets/icons/Logo.ico';
                            };
                        }
                    };
                } else if (ico && ico !== 'null') {
                    el.src = ico;
                } else {
                    // Fallback direct
                    el.src = '../assets/icons/Logo.png';
                    el.onerror = () => {
                        el.src = '../assets/icons/Logo.ico';
                    };
                }
                el.style.display = 'block';
            } else {
                // Fallback si API non disponible
                el.src = '../assets/icons/Logo.png';
                el.onerror = () => {
                    el.src = '../assets/icons/Logo.ico';
                };
            }
        } catch (e) {
            console.warn('Erreur chargement logo:', e);
            const el = document.getElementById('authLogo');
            if (el) {
                el.src = '../assets/icons/Logo.png';
            }
        }
    }

    setLanguage(lang) {
        this.lang = (lang === 'en' ? 'en' : 'fr');
        try { localStorage.setItem('language', this.lang); } catch {}
        this.applyTranslations();
    }

    applyTranslations() {
        // Text content
        document.querySelectorAll('[data-i18n-text]').forEach(el => {
            const key = el.getAttribute('data-i18n-text');
            if (key) el.textContent = this.t(key);
        });
        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) el.setAttribute('placeholder', this.t(key));
        });
    }

    checkOfflineMode() {
        if (navigator.onLine) {
            this.offlineMode.classList.add('hidden');
        } else {
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
                if (data.licenseKey) {
                    this.licenseKeyInput.value = data.licenseKey;
                }
                if (this.rememberMe) {
                    this.rememberMe.checked = true;
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
            this.showError(this.t('fill_all'));
            return;
        }

        this.setLoading(true);

        try {
            const result = await this.authenticate(email, licenseKey);
            
            if (result.success) {
                this.showSuccess(this.t('auth_success'));
                
                // Sauvegarder les données si demandé
                if (this.rememberMe && this.rememberMe.checked) {
                    this.saveCredentials(email, licenseKey);
                } else {
                    this.clearCredentials();
                }
                
                // Rediriger vers l'application principale
                setTimeout(() => {
                    this.redirectToApp(result);
                }, 1200);
            } else {
                this.showError(result.message || this.t('auth_error'));
            }
        } catch (error) {
            this.showError(this.t('server_error'));
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

    // Demo mode removed

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
            // Stocker seulement l'email (la clé n'est pas stockée pour sécurité)
            // L'utilisateur devra la ressaisir à chaque fois sauf si "Se souvenir" est coché
            const data = { 
                email, 
                // Note: licenseKey n'est plus stocké en clair pour sécurité
                // L'utilisateur devra la ressaisir
                timestamp: Date.now() 
            };
            localStorage.setItem('appsMobs_auth', JSON.stringify(data));
        } catch (e) {
            console.log('Impossible de sauvegarder les données');
        }
    }

    clearCredentials() {
        try {
            localStorage.removeItem('appsMobs_auth');
        } catch (e) {
            console.log('Impossible d\'effacer les données');
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
