export default function Docs(){
  return (
    <div className="container py-10 doc-layout">
      {/* LEFT: Sidebar navigation */}
      <aside className="doc-sidebar">
        <div className="doc-sidebar-inner">
          <h2 className="doc-sidebar-title">Documentation</h2>
          <a href="#getting-started">Getting Started</a>
          <a href="#requirements">Requirements</a>
          <a href="#install-tools">Install ADB & scrcpy</a>
          <a href="#connect-usb">Connect via USB</a>
          <a href="#connect-wifi">Connect via Wi‑Fi</a>
          <a href="#run-app">Run the Desktop App</a>
          <a href="#use-app">Use the App</a>
          <a href="#scripts">Python Scripts</a>
          <a href="#troubleshooting">Troubleshooting</a>
        </div>
      </aside>

      {/* CENTER: Main content */}
      <main className="doc-main">
        <h1 className="doc-title">AppsMobs Documentation</h1>

        <section id="getting-started" className="doc-section">
          <h2 className="doc-h2">Getting Started</h2>
          <p className="doc-p">AppsMobs lets you control Android devices, open an optimized scrcpy, and run automations with or without code.</p>
          <div className="doc-callout">
            <strong>No extra installs required.</strong> The Windows installer (.exe) bundles everything your users need (ADB, scrcpy, runtime). You don’t need to install Python or Android tools separately.
          </div>
          <ol className="doc-list">
            <li>Download and install the latest AppsMobs for Windows (.exe).</li>
            <li>Open AppsMobs and go to <em>Dashboard</em>.</li>
            <li>Connect your Android device via USB and accept the debugging prompt on the phone.</li>
            <li>Your device appears in the list — you can now mirror, control, or run scripts.</li>
          </ol>
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Step</th><th>What you see</th><th>Tip</th></tr>
              </thead>
              <tbody>
                <tr><td>Install</td><td>Setup wizard</td><td>Close Android Studio if running</td></tr>
                <tr><td>First run</td><td>Dashboard</td><td>Allow Windows Defender if prompted</td></tr>
                <tr><td>USB connect</td><td>Device listed</td><td>Accept fingerprint on the device</td></tr>
              </tbody>
            </table>
          </div>
          <div className="doc-gallery">
            <img src="/assets/dashboard.png" alt="AppsMobs Dashboard" />
            <img src="/assets/control.png" alt="scrcpy Control" />
          </div>
        </section>

        <hr className="doc-hr" />

        <section id="requirements" className="doc-section">
          <h2 className="doc-h2">Requirements</h2>
          <ul className="doc-list">
            <li>Windows 10/11 (x64)</li>
            <li>Android device with Developer options enabled</li>
            <li>USB cable (first pairing) or same Wi‑Fi network</li>
            <li>Optional: Python 3.10+ only if you plan to write advanced custom scripts</li>
          </ul>
        </section>

        <section id="install-tools" className="doc-section">
          <h2 className="doc-h2">Install ADB & scrcpy (Windows)</h2>
          <p className="doc-p">Nothing to install — AppsMobs includes a private copy of ADB and scrcpy, configured for best performance.</p>
          <ul className="doc-list">
            <li>Bundled tools are isolated (no PATH conflicts).</li>
            <li>Power users can still use their system ADB if desired.</li>
            <li>Updates arrive with new app releases.</li>
          </ul>
          <div className="doc-note">Tip: If you already have ADB on PATH, AppsMobs will still work.</div>
        </section>

        <hr className="doc-hr" />

        <section id="connect-usb" className="doc-section">
          <h2 className="doc-h2">Connect via USB</h2>
          <ol className="doc-list">
            <li>Enable USB debugging on the phone (Developer options).</li>
            <li>Plug in the device and accept the fingerprint prompt.</li>
            <li>Verify it appears:</li>
          </ol>
          <div className="doc-code"><pre><code>adb devices  # optional, AppsMobs lists devices automatically</code></pre></div>
          <p className="doc-note">It should show as <em>device</em>. If <em>unauthorized</em>, re‑plug and accept the prompt.</p>
        </section>

        <section id="connect-wifi" className="doc-section">
          <h2 className="doc-h2">Connect via Wi‑Fi (ADB over TCP/IP)</h2>
          <p className="doc-p">Pair once over USB, then switch to wireless. You can use the built‑in AppsMobs action or run the following commands:</p>
          <div className="doc-code"><pre><code>adb tcpip 5555
adb shell ip route | grep wlan0
adb connect YOUR_DEVICE_IP:5555</code></pre></div>
          <p className="doc-note">Replace <code>YOUR_DEVICE_IP</code> with the device IP from Wi‑Fi settings.</p>
          <ol className="doc-list">
            <li>Ensure phone and PC are on the same network.</li>
            <li>Use the Dashboard action to avoid typing commands.</li>
            <li>If connect fails, re‑pair via USB and retry.</li>
          </ol>
        </section>

        <hr className="doc-hr" />

        <section id="run-app" className="doc-section">
          <h2 className="doc-h2">Run the Desktop App</h2>
          <ol className="doc-list">
            <li>Install AppsMobs for Windows.</li>
            <li>Activate your license (if required).</li>
            <li>Open the Dashboard: connected device(s) appear automatically.</li>
          </ol>
          <div className="doc-gallery">
            <img src="/assets/scripts.png" alt="Scripts Editor" />
            <img src="/assets/console.png" alt="Logs Console" />
          </div>
        </section>

        <hr className="doc-hr" />

        <section id="use-app" className="doc-section">
          <h2 className="doc-h2">Use the App</h2>
          <ul className="doc-list">
            <li><strong>Open scrcpy:</strong> optimized mirror; adjust FPS/bitrate.</li>
            <li><strong>Quick actions:</strong> Wi‑Fi, Airplane, volume, brightness, navigation.</li>
            <li><strong>Screenshots:</strong> capture clean images during sessions.</li>
            <li><strong>No‑code blocks:</strong> build and run tasks without coding.</li>
          </ul>
        </section>

        <section id="scripts" className="doc-section">
          <h2 className="doc-h2">Python Scripts</h2>
          <p className="doc-p">Create scripts in your <code>scripts/</code> folder or use the in‑app editor. Minimal example:</p>
          <div className="doc-code"><pre><code>from scripts.android_functions import tap, text

# tap(x=540, y=1680)
text("Hello from AppsMobs!")
</code></pre></div>
          <p className="doc-note">See <code>core/android_functions.py</code> for the complete API.</p>
        </section>

        <section id="troubleshooting" className="doc-section">
          <h2 className="doc-h2">Troubleshooting</h2>
          <ul className="doc-list">
            <li><strong>Not detected:</strong> install OEM USB drivers; try another cable/port.</li>
            <li><strong>adb unauthorized:</strong> re‑plug and accept the fingerprint prompt.</li>
            <li><strong>scrcpy black screen:</strong> lower bitrate/FPS; verify permissions.</li>
          </ul>
        </section>
      </main>

      {/* RIGHT: Page table of contents */}
      <aside className="doc-right">
        <div className="doc-right-inner">
          <p className="doc-right-title">On this page</p>
          <a href="#getting-started">Getting Started</a>
          <a href="#requirements">Requirements</a>
          <a href="#install-tools">Install ADB & scrcpy</a>
          <a href="#connect-usb">Connect via USB</a>
          <a href="#connect-wifi">Connect via Wi‑Fi</a>
          <a href="#run-app">Run the Desktop App</a>
          <a href="#use-app">Use the App</a>
          <a href="#scripts">Python Scripts</a>
          <a href="#troubleshooting">Troubleshooting</a>
        </div>
      </aside>
    </div>
  )
}

