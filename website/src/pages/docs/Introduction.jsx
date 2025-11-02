import DocsLayout from '../DocsLayout'
import { Link } from 'react-router-dom'

export default function Introduction(){
  const toc = [
    { href: '#what-is', label: 'What is AppsMobs' },
    { href: '#features', label: 'Key Features' },
    { href: '#who-for', label: 'Who is it for' },
    { href: '#included', label: 'What\'s Included' },
    { href: '#bundled-vs-system', label: 'Bundled vs System Tools' },
    { href: '#requirements', label: 'System Requirements' },
    { href: '#why-local', label: 'Why Local Execution' },
    { href: '#architecture', label: 'Architecture Overview' },
    { href: '#next-steps', label: 'Next Steps' }
  ]
  
  return (
    <DocsLayout title="Introduction" toc={toc}>
      
      <section id="what-is" className="doc-section">
        <h2 className="doc-h2">What is AppsMobs?</h2>
        <p className="doc-p">
          <strong>AppsMobs</strong> is a powerful desktop application for Windows that allows you to control one or multiple Android devices, 
          mirror their screens with an optimized scrcpy implementation, and automate actions with or without code. 
          Everything runs locally on your Windows machine for maximum performance and privacy.
        </p>
        
        <div className="doc-callout bg-cyan/10 border-cyan/30">
          <strong>🎯 Core Purpose:</strong> AppsMobs bridges the gap between simple device mirroring and advanced automation, 
          providing both a user-friendly interface for beginners and powerful scripting capabilities for power users.
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="features" className="doc-section">
        <h2 className="doc-h2">✨ Key Features</h2>
        
        <div className="doc-table-wrapper">
          <table className="doc-table">
            <thead>
              <tr><th>Feature</th><th>Description</th><th>Benefit</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Plug-and-Play</strong></td>
                <td>Works out of the box on Windows with bundled tools</td>
                <td>No technical setup required</td>
              </tr>
              <tr>
                <td><strong>Multi-Device Control</strong></td>
                <td>Control one or several devices simultaneously</td>
                <td>Manage multiple devices from one interface</td>
              </tr>
              <tr>
                <td><strong>Optimized Mirroring</strong></td>
                <td>Tuned bitrate/FPS defaults for stability (2M bitrate default)</td>
                <td>Smooth screen mirroring with low latency</td>
              </tr>
              <tr>
                <td><strong>Quick Actions</strong></td>
                <td>Wi-Fi toggle, Airplane mode, navigation, volume, brightness</td>
                <td>Common tasks in one click</td>
              </tr>
              <tr>
                <td><strong>Python Automation</strong></td>
                <td>No-code tasks or full Python script execution</td>
                <td>Automate repetitive workflows</td>
              </tr>
              <tr>
                <td><strong>Image Recognition</strong></td>
                <td>Computer vision for UI element detection</td>
                <td>Works with any app without code changes</td>
              </tr>
              <tr>
                <td><strong>Secure Licensing</strong></td>
                <td>Activation, revoke, and re-assign licenses</td>
                <td>Flexible license management</td>
              </tr>
              <tr>
                <td><strong>Local Execution</strong></td>
                <td>All processing happens on your machine</td>
                <td>Privacy and performance guaranteed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="who-for" className="doc-section">
        <h2 className="doc-h2">👥 Who is AppsMobs For?</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Beginners</h3>
          <p className="doc-p">
            If you want plug-and-play device control with a friendly UI, AppsMobs is perfect for you. 
            No command-line knowledge required - everything works through the intuitive Dashboard interface.
          </p>
          <ul className="doc-list">
            <li>✅ Simple device mirroring and control</li>
            <li>✅ One-click quick actions</li>
            <li>✅ Visual interface with no coding needed</li>
            <li>✅ Built-in <Link to="/docs/playground" className="text-cyan hover:underline">Playground editor</Link> with pre-made code blocks</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Power Users</h3>
          <p className="doc-p">
            For users who need fast mirroring, advanced controls, and automation capabilities, AppsMobs provides:
          </p>
          <ul className="doc-list">
            <li>✅ High-performance screen mirroring (optimized scrcpy)</li>
            <li>✅ <Link to="/docs/scripts" className="text-cyan hover:underline">Python scripting</Link> with full API access</li>
            <li>✅ Multi-device parallel execution</li>
            <li>✅ <Link to="/docs/playground" className="text-cyan hover:underline">35+ automation functions</Link> for complex workflows</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Teams & Developers</h3>
          <p className="doc-p">
            Teams automating repeatable Android workflows will appreciate:
          </p>
          <ul className="doc-list">
            <li>✅ <Link to="/docs/core" className="text-cyan hover:underline">Multi-device management</Link> from one dashboard</li>
            <li>✅ Parallel script execution across devices</li>
            <li>✅ Per-device logging and debugging</li>
            <li>✅ <Link to="/docs/referral-rewards" className="text-cyan hover:underline">Team licensing options</Link> (up to 5 devices)</li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="included" className="doc-section">
        <h2 className="doc-h2">📦 What's Included</h2>
        
        <div className="doc-callout bg-green-500/10 border-green-500/30">
          <strong>✅ No Extra Installs Required.</strong> The Windows installer (.exe) bundles ADB, scrcpy, 
          and the Python runtime needed to operate the app. Everything you need is included!
        </div>

        <div className="doc-subsection mt-4">
          <h3 className="doc-h3">Core Components</h3>
          <ul className="doc-list">
            <li>
              <strong>Optimized scrcpy:</strong> Tuned for smooth mirroring and control with default settings 
              (2M bitrate, 15 FPS max, 1920px max resolution)
            </li>
            <li>
              <strong>Bundled ADB:</strong> Configured for reliability and isolated from system PATH to avoid conflicts
            </li>
            <li>
              <strong>Dashboard Interface:</strong> Device list, quick actions, logs, and script management all in one place
            </li>
            <li>
              <strong>Scripts Editor:</strong> Built-in <Link to="/docs/playground" className="text-cyan hover:underline">Playground editor</Link> 
              with 35+ pre-made code blocks for Python automations
            </li>
            <li>
              <strong>Image Detection Engine:</strong> Computer vision for UI element recognition using template matching
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">What You Get</h3>
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Component</th><th>Version</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr><td>scrcpy</td><td>Latest stable</td><td>✅ Bundled & Optimized</td></tr>
                <tr><td>ADB</td><td>Latest stable</td><td>✅ Bundled & Isolated</td></tr>
                <tr><td>Python Runtime</td><td>3.10+</td><td>✅ Included</td></tr>
                <tr><td>Image Recognition</td><td>OpenCV-based</td><td>✅ Built-in</td></tr>
                <tr><td>Electron Framework</td><td>Latest</td><td>✅ Desktop UI</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="bundled-vs-system" className="doc-section">
        <h2 className="doc-h2">Bundled vs System Tools</h2>
        <p className="doc-p">
          AppsMobs uses bundled tools by default, but you can optionally use system-installed tools if needed.
        </p>
        
        <div className="doc-table-wrapper">
          <table className="doc-table">
            <thead>
              <tr><th>Aspect</th><th>Bundled (Default)</th><th>System Installed</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Setup</strong></td>
                <td>✅ No install needed - included in .exe</td>
                <td>❌ Requires manual ADB/scrcpy install</td>
              </tr>
              <tr>
                <td><strong>Updates</strong></td>
                <td>✅ Managed by app releases</td>
                <td>⚠️ Managed manually by you</td>
              </tr>
              <tr>
                <td><strong>Conflicts</strong></td>
                <td>✅ Isolated and sandboxed</td>
                <td>⚠️ Can conflict with PATH tools</td>
              </tr>
              <tr>
                <td><strong>Performance</strong></td>
                <td>✅ Tuned defaults (2M bitrate, optimized FPS)</td>
                <td>⚠️ Depends on your configuration</td>
              </tr>
              <tr>
                <td><strong>Compatibility</strong></td>
                <td>✅ Tested together, guaranteed to work</td>
                <td>⚠️ May have version mismatches</td>
              </tr>
              <tr>
                <td><strong>Best For</strong></td>
                <td>✅ Most users (recommended)</td>
                <td>Advanced users with specific needs</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="doc-callout bg-blue-500/10 border-blue-500/30 mt-4">
          <strong>💡 Recommendation:</strong> Use bundled tools (default) unless you have a specific reason to use system tools. 
          Bundled tools are tested together and guaranteed to work seamlessly.
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="requirements" className="doc-section">
        <h2 className="doc-h2">💻 System Requirements</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Windows Requirements</h3>
          <ul className="doc-list">
            <li><strong>OS:</strong> Windows 10/11 (64-bit) - Both Home and Pro editions supported</li>
            <li><strong>RAM:</strong> Minimum 4GB, 8GB recommended for multi-device usage</li>
            <li><strong>Disk Space:</strong> ~500MB for application and bundled tools</li>
            <li><strong>Network:</strong> Internet connection for license activation (offline use after activation)</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Android Device Requirements</h3>
          <ul className="doc-list">
            <li><strong>Developer Options:</strong> Must be enabled (Settings → About → Tap Build Number 7 times)</li>
            <li><strong>USB Debugging:</strong> Must be enabled (Settings → Developer Options → USB Debugging)</li>
            <li><strong>Android Version:</strong> Android 5.0 (API 21) or higher</li>
            <li><strong>USB Cable:</strong> Data-capable USB cable for initial pairing (USB 2.0 or higher)</li>
            <li><strong>Wi-Fi (Optional):</strong> Same network as PC for wireless connection</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Optional Requirements</h3>
          <div className="doc-note">
            <strong>Python:</strong> Python is <em>not</em> required for normal use. It is only needed if you plan to write 
            advanced custom scripts outside the built-in Playground editor. For most users, the built-in editor with 
            pre-made code blocks is sufficient. See <Link to="/docs/scripts" className="text-cyan hover:underline">Python Scripts</Link> for more details.
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="why-local" className="doc-section">
        <h2 className="doc-h2">🔒 Why Local Execution?</h2>
        <p className="doc-p">
          AppsMobs runs everything locally on your machine - no cloud services, no external dependencies. Here's why this matters:
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">Privacy & Security</h3>
          <ul className="doc-list">
            <li>
              <strong>Your data stays local:</strong> Device video, screen content, and all inputs never leave your machine
            </li>
            <li>
              <strong>No third-party servers:</strong> No data is sent to external services for processing
            </li>
            <li>
              <strong>Offline capable:</strong> Once activated, works completely offline (until license refresh)
            </li>
            <li>
              <strong>Encrypted communication:</strong> Direct USB/ADB connection with device authentication
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Performance & Reliability</h3>
          <ul className="doc-list">
            <li>
              <strong>Low latency:</strong> Local mirroring is consistently faster than cloud relays (no network hops)
            </li>
            <li>
              <strong>No bandwidth limits:</strong> Screen mirroring quality isn't limited by internet connection
            </li>
            <li>
              <strong>Reliability:</strong> No dependency on external services to operate the core functionality
            </li>
            <li>
              <strong>Predictable performance:</strong> Performance depends on your hardware, not external factors
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Cost & Control</h3>
          <ul className="doc-list">
            <li><strong>No ongoing costs:</strong> One-time license purchase, no monthly fees</li>
            <li><strong>Full control:</strong> You control when and how the app runs</li>
            <li><strong>No vendor lock-in:</strong> Your workflows aren't tied to cloud services</li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="architecture" className="doc-section">
        <h2 className="doc-h2">🏗️ Architecture Overview</h2>
        <p className="doc-p">
          Understanding how AppsMobs works under the hood helps you use it more effectively:
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">Desktop Application (Electron)</h3>
          <p className="doc-p">
            The main interface is built with Electron, providing a native Windows experience. It manages:
          </p>
          <ul className="doc-list">
            <li>Device discovery and connection management</li>
            <li>UI rendering (Dashboard, Scripts editor, Console)</li>
            <li>Communication between UI and native processes</li>
            <li>Script execution orchestration</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Android Bridge (ADB)</h3>
          <p className="doc-p">
            ADB (Android Debug Bridge) is the communication layer between your PC and Android devices:
          </p>
          <ul className="doc-list">
            <li>Device detection and pairing</li>
            <li>Command execution on devices</li>
            <li>Screen capture and input injection</li>
            <li>File transfer and app management</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Screen Mirroring (scrcpy)</h3>
          <p className="doc-p">
            scrcpy handles screen mirroring and control with optimized settings:
          </p>
          <ul className="doc-list">
            <li>Real-time screen streaming (default: 2M bitrate, 15 FPS max)</li>
            <li>Mouse and keyboard input forwarding</li>
            <li>Clipboard synchronization</li>
            <li>Optimized for Windows performance</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Script Execution Engine</h3>
          <p className="doc-p">
            Python scripts run in isolated environments with injected functions:
          </p>
          <ul className="doc-list">
            <li>Automatic function injection (35+ functions available)</li>
            <li>Image detection via OpenCV</li>
            <li>Per-device script execution</li>
            <li>Real-time logging and error handling</li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="next-steps" className="doc-section">
        <h2 className="doc-h2">🚀 Next Steps</h2>
        <p className="doc-p">
          Ready to get started? Follow these steps:
        </p>
        
        <div className="doc-steps">
          <div className="doc-step">
            <div className="doc-step-number">1</div>
            <div className="doc-step-content">
              <h4>Get Started</h4>
              <p>Read <Link to="/docs/getting-started" className="text-cyan hover:underline">Getting Started</Link> for installation and first-run setup instructions.</p>
            </div>
          </div>
          
          <div className="doc-step">
            <div className="doc-step-number">2</div>
            <div className="doc-step-content">
              <h4>Quick Start</h4>
              <p>Follow the <Link to="/docs/quickstart" className="text-cyan hover:underline">Quickstart</Link> guide for a rapid setup in 5 minutes.</p>
            </div>
          </div>
          
          <div className="doc-step">
            <div className="doc-step-number">3</div>
            <div className="doc-step-content">
              <h4>Learn Core Usage</h4>
              <p>Explore <Link to="/docs/core" className="text-cyan hover:underline">Core Usage</Link> to understand the Dashboard and basic operations.</p>
            </div>
          </div>
          
          <div className="doc-step">
            <div className="doc-step-number">4</div>
            <div className="doc-step-content">
              <h4>Understand Concepts</h4>
              <p>Review <Link to="/docs/concepts" className="text-cyan hover:underline">Concepts</Link> for key terminology and workflows.</p>
            </div>
          </div>
          
          <div className="doc-step">
            <div className="doc-step-number">5</div>
            <div className="doc-step-content">
              <h4>Start Automating</h4>
              <p>Check out <Link to="/docs/playground" className="text-cyan hover:underline">Playground</Link> and <Link to="/docs/scripts" className="text-cyan hover:underline">Python Scripts</Link> when ready to automate.</p>
            </div>
          </div>
        </div>

        <div className="doc-callout bg-purple-500/10 border-purple-500/30 mt-6">
          <strong>📚 Documentation Map:</strong>
          <ul className="mt-2 space-y-1">
            <li>• <Link to="/docs/getting-started" className="text-cyan hover:underline">Getting Started</Link> - Installation & setup</li>
            <li>• <Link to="/docs/quickstart" className="text-cyan hover:underline">Quickstart</Link> - Fast track setup</li>
            <li>• <Link to="/docs/core" className="text-cyan hover:underline">Core Usage</Link> - Dashboard & basic operations</li>
            <li>• <Link to="/docs/concepts" className="text-cyan hover:underline">Concepts</Link> - Key concepts explained</li>
            <li>• <Link to="/docs/scripts" className="text-cyan hover:underline">Python Scripts</Link> - Script creation guide</li>
            <li>• <Link to="/docs/playground" className="text-cyan hover:underline">Playground</Link> - Complete function reference</li>
            <li>• <Link to="/docs/pricing" className="text-cyan hover:underline">Pricing & Licenses</Link> - License information</li>
            <li>• <Link to="/docs/referral-rewards" className="text-cyan hover:underline">Referral & Rewards</Link> - Token system</li>
          </ul>
        </div>
      </section>

    </DocsLayout>
  )
}
