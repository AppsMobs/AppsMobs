class ConfigUI {
    constructor() {
        this.urlInput = document.getElementById('licenseUrl');
        this.saveBtn = document.getElementById('saveBtn');
        this.quitBtn = document.getElementById('quitBtn');
        this.err = document.getElementById('err');
        this.ok = document.getElementById('ok');
        this.init();
    }
    init() {
        this.saveBtn.addEventListener('click', () => this.save());
        this.quitBtn.addEventListener('click', () => window.close());
    }
    async save() {
        const url = (this.urlInput.value || '').trim();
        if (!/^https:\/\//i.test(url)) {
            this.showErr("URL invalide. Elle doit commencer par https://");
            return;
        }
        try {
            if (window.electronAPI && window.electronAPI.setLicenseServerUrl) {
                const res = await window.electronAPI.setLicenseServerUrl(url);
                if (res && res.success) {
                    this.showOk('Enregistré. L\'application va s\'ouvrir.');
                    setTimeout(() => { window.close(); }, 700);
                    return;
                }
                this.showErr((res && res.message) || 'Erreur inconnue');
            } else {
                this.showErr('API non disponible');
            }
        } catch (e) {
            this.showErr(String(e));
        }
    }
    showErr(msg) {
        this.err.textContent = msg;
        this.err.style.display = 'block';
        this.ok.style.display = 'none';
    }
    showOk(msg) {
        this.ok.textContent = msg;
        this.ok.style.display = 'block';
        this.err.style.display = 'none';
    }
}
new ConfigUI();

