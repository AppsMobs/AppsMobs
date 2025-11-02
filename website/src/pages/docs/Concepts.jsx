import DocsLayout from '../DocsLayout'
import { Link } from 'react-router-dom'

export default function Concepts(){
  const toc = [
    { href: '#overview', label: 'Overview' },
    { href: '#devices', label: 'Devices & Connection' },
    { href: '#scrcpy', label: 'Screen Mirroring (scrcpy)' },
    { href: '#actions', label: 'Quick Actions' },
    { href: '#scripts', label: 'Scripts & Automation' },
    { href: '#licensing', label: 'Licensing Model' },
    { href: '#security', label: 'Security Model' },
    { href: '#architecture', label: 'Technical Architecture' }
  ]
  
  return (
    <DocsLayout title="Concepts" toc={toc}>
      
      <section id="overview" className="doc-section">
        <h2 className="doc-h2">Concepts Overview</h2>
        <p className="doc-p">
          This page explains the key concepts, terminology, and workflows in AppsMobs. Understanding these concepts 
          will help you use the application more effectively and troubleshoot issues.
        </p>
      </section>

      <hr className="doc-hr" />

      <section id="devices" className="doc-section">
        <h2 className="doc-h2">📱 Devices & Connection</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Device Discovery</h3>
          <p className="doc-p">
            AppsMobs automatically discovers connected Android devices using ADB (Android Debug Bridge). 
            The discovery process:
          </p>
          <ul className="doc-list">
            <li>Scans for USB-connected devices</li>
            <li>Scans for Wi-Fi connected devices (after initial USB pairing)</li>
            <li>Updates the device list in real-time</li>
            <li>Shows device status and information (model, Android version, serial)</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Device Selection</h3>
          <p className="doc-p">
            You can work with devices in two modes:
          </p>
          <ul className="doc-list">
            <li>
              <strong>Single Selection:</strong> Select one device to focus on it. Actions execute only on this device.
            </li>
            <li>
              <strong>Multi-Selection:</strong> Select multiple devices (Ctrl+Click). Actions execute in parallel on all selected devices.
            </li>
          </ul>

          <div className="doc-callout bg-blue-500/10 border-blue-500/30 mt-4">
            <strong>💡 Use Case:</strong> Multi-selection is perfect for batch operations like taking screenshots from all devices 
            or running the same script on multiple devices simultaneously.
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Connection Status</h3>
          <p className="doc-p">
            Each device shows a status indicating its current state:
          </p>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Status</th><th>Meaning</th><th>What You Can Do</th><th>How to Fix If Issues</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>online</strong> ✅</td>
                  <td>Device is connected and ready for control</td>
                  <td>All actions available: mirror, scripts, quick actions</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td><strong>unauthorized</strong> ⚠️</td>
                  <td>USB debugging fingerprint not accepted</td>
                  <td>Limited - device detected but not authorized</td>
                  <td>Re-plug USB cable and accept fingerprint prompt on device</td>
                </tr>
                <tr>
                  <td><strong>offline</strong> ❌</td>
                  <td>Device detected but not responding</td>
                  <td>Cannot use device</td>
                  <td>Check cable, restart device, verify USB debugging enabled</td>
                </tr>
                <tr>
                  <td><strong>disconnected</strong> ❌</td>
                  <td>Device not detected at all</td>
                  <td>Cannot use device</td>
                  <td>Install OEM USB drivers, check cable, verify connection</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Per-Device Logs</h3>
          <p className="doc-p">
            Each device maintains its own log history:
          </p>
          <ul className="doc-list">
            <li><strong>View logs:</strong> Click on device → "Logs" or open Console tab</li>
            <li><strong>Script output:</strong> All <code>print()</code> statements appear in device logs</li>
            <li><strong>Error messages:</strong> Exceptions and errors are logged with timestamps</li>
            <li><strong>Action history:</strong> Quick actions and mirror operations are logged</li>
          </ul>

          <div className="doc-note mt-4">
            Logs are stored per device session and help diagnose issues. Check logs if scripts fail or devices behave unexpectedly.
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="scrcpy" className="doc-section">
        <h2 className="doc-h2">🖥️ Screen Mirroring (scrcpy)</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">What is scrcpy?</h3>
          <p className="doc-p">
            <strong>scrcpy</strong> is an open-source screen mirroring tool that streams your Android device's screen to your PC. 
            AppsMobs uses an optimized version with tuned defaults for Windows.
          </p>
          <ul className="doc-list">
            <li>Real-time screen streaming (low latency)</li>
            <li>Mouse and keyboard input forwarding</li>
            <li>Clipboard synchronization</li>
            <li>No root access required</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Optimized Defaults</h3>
          <p className="doc-p">
            AppsMobs configures scrcpy with settings optimized for stability and performance:
          </p>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Setting</th><th>Default Value</th><th>Purpose</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Video Bitrate</strong></td>
                  <td>2 Mbps</td>
                  <td>Balance between quality and bandwidth (lower = less CPU, more stable)</td>
                </tr>
                <tr>
                  <td><strong>Max FPS</strong></td>
                  <td>15 FPS</td>
                  <td>Frame rate cap to reduce CPU usage while maintaining smooth experience</td>
                </tr>
                <tr>
                  <td><strong>Max Resolution</strong></td>
                  <td>1920px width</td>
                  <td>Limit resolution to reduce processing load</td>
                </tr>
                <tr>
                  <td><strong>Stay Awake</strong></td>
                  <td>Enabled</td>
                  <td>Prevents screen from locking during mirroring</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">When to Adjust Settings</h3>
          <ul className="doc-list">
            <li>
              <strong>Stuttering or frame drops:</strong> Lower FPS (10) and/or bitrate (1M)
            </li>
            <li>
              <strong>Low quality on USB:</strong> Raise bitrate (4-8M) - USB has more bandwidth than Wi-Fi
            </li>
            <li>
              <strong>High CPU usage:</strong> Lower FPS and resolution (1280px)
            </li>
            <li>
              <strong>Need higher quality:</strong> Raise bitrate and FPS (if your PC can handle it)
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Input Forwarding</h3>
          <p className="doc-p">
            When mirroring is active, you can control the device directly:
          </p>
          <ul className="doc-list">
            <li><strong>Mouse clicks</strong> on the mirror window = taps on device</li>
            <li><strong>Keyboard typing</strong> is forwarded to the device</li>
            <li><strong>Clipboard</strong> syncs automatically (copy on PC → paste on device)</li>
            <li><strong>Right-click</strong> shows context menu with additional options</li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="actions" className="doc-section">
        <h2 className="doc-h2">⚡ Quick Actions</h2>
        <p className="doc-p">
          Quick Actions are one-click controls for common device operations. They execute instantly without opening the mirror.
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">Action Categories</h3>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Category</th><th>Actions</th><th>What It Does</th><th>Use Case</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Connectivity</strong></td>
                  <td>Wi‑Fi Toggle, Airplane Mode</td>
                  <td>Enable/disable network features</td>
                  <td>Reset network, test connectivity, save battery</td>
                </tr>
                <tr>
                  <td><strong>Navigation</strong></td>
                  <td>Home, Back, Recents</td>
                  <td>System navigation buttons</td>
                  <td>Navigate apps, close dialogs, switch apps</td>
                </tr>
                <tr>
                  <td><strong>Media</strong></td>
                  <td>Volume Up/Down/Mute</td>
                  <td>Adjust audio levels</td>
                  <td>Control audio, prepare for video recording</td>
                </tr>
                <tr>
                  <td><strong>Display</strong></td>
                  <td>Brightness Up/Down</td>
                  <td>Adjust screen brightness</td>
                  <td>Save battery, adjust visibility</td>
                </tr>
                <tr>
                  <td><strong>Capture</strong></td>
                  <td>Screenshot</td>
                  <td>Capture and save screen</td>
                  <td>Document states, debug issues, create reports</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Execution Model</h3>
          <ul className="doc-list">
            <li><strong>Instant execution:</strong> Actions happen immediately when clicked</li>
            <li><strong>Multi-device support:</strong> If multiple devices selected, action executes on all</li>
            <li><strong>No confirmation:</strong> Actions execute directly (for speed)</li>
            <li><strong>Logged:</strong> All actions are logged in device console for audit trail</li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="scripts" className="doc-section">
        <h2 className="doc-h2">🤖 Scripts & Automation</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Script Types</h3>
          <p className="doc-p">
            AppsMobs supports two automation approaches:
          </p>
          
          <ul className="doc-list">
            <li>
              <strong>Playground Editor:</strong> Built-in visual editor with pre-made code blocks. 
              Perfect for beginners - just click blocks to insert functions. See <Link to="/docs/playground" className="text-cyan hover:underline">Playground</Link>.
            </li>
            <li>
              <strong>Python Files:</strong> Write full Python scripts in external files. 
              More flexible for advanced users. See <Link to="/docs/scripts" className="text-cyan hover:underline">Python Scripts</Link>.
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Function Injection</h3>
          <p className="doc-p">
            All automation functions are automatically available in your scripts - no imports needed:
          </p>
          <ul className="doc-list">
            <li><strong>35+ functions</strong> are injected into script namespace</li>
            <li><strong>Direct access:</strong> Just call <code>click()</code>, <code>swipe()</code>, etc.</li>
            <li><strong>Per-device context:</strong> Each script execution gets its own device client</li>
            <li><strong>Image detection:</strong> Functions use images from <code>scripts/img/</code> folder</li>
          </ul>

          <div className="doc-callout bg-purple-500/10 border-purple-500/30 mt-4">
            <strong>📚 Function Reference:</strong> See the <Link to="/docs/playground" className="text-cyan hover:underline">Playground</Link> page 
            for complete documentation of all 35+ functions with examples.
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Execution Model</h3>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Aspect</th><th>Details</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Scope</strong></td>
                  <td>Each script runs per selected device (isolated execution environment)</td>
                </tr>
                <tr>
                  <td><strong>Parallel Execution</strong></td>
                  <td>If multiple devices selected, scripts run simultaneously on all</td>
                </tr>
                <tr>
                  <td><strong>Logs</strong></td>
                  <td>Per-device logs show output, errors, and execution status</td>
                </tr>
                <tr>
                  <td><strong>Interruption</strong></td>
                  <td>Can stop script execution from Dashboard at any time</td>
                </tr>
                <tr>
                  <td><strong>Timeout</strong></td>
                  <td>Scripts respect <code>max_duration</code> in SCRIPT_INFO</td>
                </tr>
                <tr>
                  <td><strong>Error Handling</strong></td>
                  <td>Scripts should return result dict with success/message fields</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Image Detection</h3>
          <p className="doc-p">
            Scripts use computer vision to find UI elements:
          </p>
          <ul className="doc-list">
            <li><strong>Template matching:</strong> Compares screenshots with reference images</li>
            <li><strong>Confidence threshold:</strong> How similar image must be (0.0-1.0, typically 0.8)</li>
            <li><strong>Image storage:</strong> Reference images in <code>scripts/img/</code> folder</li>
            <li><strong>Region search:</strong> Optional area restriction for faster detection</li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="licensing" className="doc-section">
        <h2 className="doc-h2">🔐 Licensing Model</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">License Tiers</h3>
          <p className="doc-p">
            AppsMobs offers different plans based on your needs:
          </p>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Plan</th><th>Simultaneous Devices</th><th>Best For</th><th>Key Features</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Normal</strong></td>
                  <td>1 device</td>
                  <td>Personal use, single device automation</td>
                  <td>All core features, scripting, mirroring</td>
                </tr>
                <tr>
                  <td><strong>Pro</strong></td>
                  <td>2 devices</td>
                  <td>Power users, small-scale automation</td>
                  <td>Multi-device, parallel scripts, advanced features</td>
                </tr>
                <tr>
                  <td><strong>Team</strong></td>
                  <td>5 devices</td>
                  <td>Teams, larger automation projects</td>
                  <td>Collaboration, priority support, all Pro features</td>
                </tr>
                <tr>
                  <td><strong>1 Week</strong></td>
                  <td>1 device</td>
                  <td>Short-term testing, trials</td>
                  <td>Full Normal plan features, 7-day duration</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="doc-callout bg-cyan/10 border-cyan/30 mt-4">
            <strong>💡 Earn Free Licenses:</strong> Use the <Link to="/docs/referral-rewards" className="text-cyan hover:underline">Referral & Rewards</Link> system 
            to earn tokens and exchange 100 tokens for 1 week of free license!
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Activation Process</h3>
          <ol className="doc-list">
            <li><strong>Purchase:</strong> Buy a license from the <Link to="/shop" className="text-cyan hover:underline">Shop</Link> page</li>
            <li><strong>Activate:</strong> Enter email and license key in AppsMobs</li>
            <li><strong>Verification:</strong> App contacts server to verify license (internet required)</li>
            <li><strong>Token Storage:</strong> Secure token stored locally for offline use</li>
            <li><strong>Refresh:</strong> Token refreshes periodically (typically every 30 days, requires internet)</li>
          </ol>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">License Management</h3>
          <ul className="doc-list">
            <li>
              <strong>Revoke:</strong> You can revoke licenses from your account dashboard to free them up for another machine
            </li>
            <li>
              <strong>Re-assign:</strong> After revoking, activate the same license key on a different machine
            </li>
            <li>
              <strong>Offline Use:</strong> Works offline after activation until token refresh (usually 30 days)
            </li>
            <li>
              <strong>Multiple Machines:</strong> Limit depends on your plan (see <Link to="/docs/pricing" className="text-cyan hover:underline">Pricing</Link>)
            </li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="security" className="doc-section">
        <h2 className="doc-h2">🔒 Security Model</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Local Execution</h3>
          <p className="doc-p">
            <strong>All processing happens on your machine:</strong>
          </p>
          <ul className="doc-list">
            <li>Device video and screen content never leave your PC</li>
            <li>Inputs and commands stay local</li>
            <li>No cloud services involved in core operations</li>
            <li>Scripts execute on your machine, not on external servers</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Device Authentication</h3>
          <p className="doc-p">
            <strong>Secure pairing with devices:</strong>
          </p>
          <ul className="doc-list">
            <li>RSA key fingerprint verification when pairing</li>
            <li>You must explicitly authorize each computer</li>
            <li>USB debugging authorization prompt on device</li>
            <li>Can revoke authorizations from Developer options</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">License Security</h3>
          <ul className="doc-list">
            <li>
              <strong>Secure token storage:</strong> Activation tokens stored locally with encryption
            </li>
            <li>
              <strong>Server verification:</strong> Licenses verified against server during activation
            </li>
            <li>
              <strong>No data tampering:</strong> App does not modify mobile device data or system partitions
            </li>
            <li>
              <strong>Revocable:</strong> You can revoke licenses if device is lost or compromised
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Script Security</h3>
          <ul className="doc-list">
            <li>
              <strong>Input validation:</strong> All user inputs (serials, file paths) are validated to prevent injection attacks
            </li>
            <li>
              <strong>Path traversal protection:</strong> Scripts can only access files in designated directories
            </li>
            <li>
              <strong>Isolated execution:</strong> Scripts run in isolated environments per device
            </li>
            <li>
              <strong>Timeout protection:</strong> Scripts respect max_duration to prevent infinite loops
            </li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="architecture" className="doc-section">
        <h2 className="doc-h2">🏗️ Technical Architecture</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Component Overview</h3>
          <p className="doc-p">
            AppsMobs consists of several integrated components:
          </p>
          
          <ul className="doc-list">
            <li>
              <strong>Electron Desktop App:</strong> Main UI built with Electron framework, provides native Windows experience
            </li>
            <li>
              <strong>ADB (Android Debug Bridge):</strong> Communication layer between PC and Android devices, handles commands and file operations
            </li>
            <li>
              <strong>scrcpy:</strong> Screen mirroring and input forwarding, optimized for Windows performance
            </li>
            <li>
              <strong>Python Runtime:</strong> Executes automation scripts with injected functions
            </li>
            <li>
              <strong>Image Recognition (OpenCV):</strong> Computer vision for UI element detection
            </li>
            <li>
              <strong>Bridge Layer:</strong> Electron ↔ Python communication for script execution
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Data Flow</h3>
          <div className="doc-code">
            <pre><code>{`User Action (Dashboard)
    ↓
Electron Process (UI)
    ↓
ADB Command / Script Execution
    ↓
Android Device
    ↓
Response / Screen Update
    ↓
Display in Mirror / Console`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Script Execution Flow</h3>
          <ol className="doc-list">
            <li>User selects device(s) and script</li>
            <li>Electron sends execution request to Python bridge</li>
            <li>Bridge loads script and injects functions</li>
            <li>Script executes with device client context</li>
            <li>Output/errors streamed back to Console</li>
            <li>Result returned to Dashboard</li>
          </ol>
        </div>
      </section>

    </DocsLayout>
  )
}
