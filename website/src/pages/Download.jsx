import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Download() {
  const { isAuthenticated } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = (platform) => {
    setDownloading(true);
    // Ici vous pouvez ajouter la logique de téléchargement
    // Pour l'instant, on simule juste un téléchargement
    setTimeout(() => {
      setDownloading(false);
      // Rediriger vers le fichier de téléchargement réel
      // window.location.href = `/downloads/AppsMobs-${platform}.exe`;
      alert(`Download will start for ${platform}. In production, this will download the actual file.`);
    }, 1000);
  };

  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="hero-badge mb-6 inline-flex">
            <span className="dot" />
            <span className="label">Download AppsMobs</span>
          </div>
          <h1 className="hero-title mb-6">
            Get Started with AppsMobs
          </h1>
          <p className="hero-subtitle max-w-2xl mx-auto">
            Download the desktop application for Windows, macOS, or Linux. 
            Control and automate your Android devices with ease.
          </p>
        </div>

        {/* Download Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              platform: 'Windows',
              icon: '🪟',
              description: 'Windows 10/11 (64-bit)',
              filename: 'AppsMobs-Setup.exe',
              size: '~50 MB',
              recommended: true
            },
            {
              platform: 'macOS',
              icon: '🍎',
              description: 'macOS 10.15+ (Intel & Apple Silicon)',
              filename: 'AppsMobs.dmg',
              size: '~45 MB',
              recommended: false
            },
            {
              platform: 'Linux',
              icon: '🐧',
              description: 'AppImage for Linux',
              filename: 'AppsMobs.AppImage',
              size: '~48 MB',
              recommended: false
            }
          ].map((item) => (
            <div
              key={item.platform}
              className={`glass rounded-xl p-6 border border-white/10 hover:border-cyan/30 transition-all ${
                item.recommended ? 'ring-2 ring-cyan/30' : ''
              }`}
            >
              {item.recommended && (
                <div className="mb-3">
                  <span className="text-xs px-2 py-1 rounded bg-cyan/20 text-cyan border border-cyan/30">
                    Recommended
                  </span>
                </div>
              )}
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.platform}</h3>
              <p className="text-sm text-white/60 mb-4">{item.description}</p>
              <div className="text-xs text-white/50 mb-4 space-y-1">
                <div>File: {item.filename}</div>
                <div>Size: {item.size}</div>
              </div>
              <button
                onClick={() => handleDownload(item.platform)}
                disabled={downloading}
                className="btn-pill cyan w-full justify-center disabled:opacity-50"
              >
                <span className="btn-label">
                  {downloading ? 'Downloading...' : 'Download'}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Installation Instructions */}
        <div className="glass rounded-xl p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold mb-6">Installation Instructions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span>🪟</span> Windows
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-white/70 ml-4">
                <li>Download the AppsMobs-Setup.exe file</li>
                <li>Run the installer and follow the setup wizard</li>
                <li>Launch AppsMobs from the Start menu</li>
                <li>Connect your Android device via USB or Wi-Fi</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span>🍎</span> macOS
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-white/70 ml-4">
                <li>Download the AppsMobs.dmg file</li>
                <li>Open the DMG and drag AppsMobs to Applications</li>
                <li>Open AppsMobs from Applications (may require allowing in Security settings)</li>
                <li>Connect your Android device via USB or Wi-Fi</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span>🐧</span> Linux
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-white/70 ml-4">
                <li>Download the AppsMobs.AppImage file</li>
                <li>Make it executable: <code className="bg-white/10 px-2 py-1 rounded">chmod +x AppsMobs.AppImage</code></li>
                <li>Run the AppImage: <code className="bg-white/10 px-2 py-1 rounded">./AppsMobs.AppImage</code></li>
                <li>Connect your Android device via USB or Wi-Fi</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="glass rounded-xl p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold mb-6">System Requirements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Desktop Requirements</h3>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>• Windows 10/11 (64-bit) OR macOS 10.15+ OR Linux (Ubuntu 20.04+)</li>
                <li>• 4 GB RAM minimum (8 GB recommended)</li>
                <li>• 100 MB free disk space</li>
                <li>• Internet connection for license activation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Android Device Requirements</h3>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>• Android 5.0+ (API 21+)</li>
                <li>• USB Debugging enabled (Settings → Developer Options)</li>
                <li>• USB cable OR same Wi-Fi network</li>
                <li>• ADB drivers installed (for Windows)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* License Activation */}
        {!isAuthenticated && (
          <div className="glass rounded-xl p-8 border border-cyan/30 bg-cyan/10 text-center">
            <h2 className="text-xl font-bold mb-4">Need a License?</h2>
            <p className="text-white/80 mb-6">
              Purchase a license to unlock all AppsMobs features and remove limitations.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/shop" className="btn-pill cyan">
                Browse Plans
              </a>
              <a href="/register" className="btn-pill purple">
                Create Account
              </a>
            </div>
          </div>
        )}

        {/* Support */}
        <div className="mt-8 text-center text-white/60 text-sm">
          <p>Having trouble? Check our <a href="/docs" className="text-cyan hover:text-cyan/80">documentation</a> or <a href="/faq" className="text-cyan hover:text-cyan/80">FAQ</a></p>
          <p className="mt-2">For support, email <a href="mailto:support@appsmobs.com" className="text-cyan hover:text-cyan/80">support@appsmobs.com</a></p>
        </div>
      </div>
    </div>
  );
}

