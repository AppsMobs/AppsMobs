import DocsLayout from '../DocsLayout'
import { Link } from 'react-router-dom'

export default function GettingStarted(){
  const toc = [
    { href: '#overview', label: 'Overview' },
    { href: '#prereq', label: 'Prerequisites' },
    { href: '#install', label: 'Install the App' },
    { href: '#first-run', label: 'First Run' },
    { href: '#license', label: 'License Activation' },
    { href: '#enable-debugging', label: 'Enable USB Debugging' },
    { href: '#usb', label: 'Pair Over USB' },
    { href: '#verify-connection', label: 'Verify Connection' },
    { href: '#mirror', label: 'Open Mirror & Control' },
    { href: '#actions', label: 'Use Quick Actions' },
    { href: '#first-script', label: 'Run Your First Script' },
    { href: '#wifi', label: 'Switch to Wi‑Fi (Optional)' },
    { href: '#tips', label: 'Tips for Stability' },
    { href: '#troubleshoot', label: 'Troubleshooting' }
  ]
  
  return (
    <DocsLayout title="Getting Started" toc={toc}>
      
      <section id="overview" className="doc-section">
        <h2 className="doc-h2">Getting Started Overview</h2>
        <div className="doc-callout bg-green-500/10 border-green-500/30">
          <strong>✅ Installer-First Approach:</strong> AppsMobs .exe bundles ADB, scrcpy, and Python runtime. 
          No extra installs are required - just download and run the installer!
        </div>
        
        <p className="doc-p mt-4">
          This guide will walk you through installing AppsMobs, connecting your first Android device, and running your first automation. 
          The entire process takes about 10-15 minutes.
        </p>

        <div className="doc-steps">
          <div className="doc-step">
            <div className="doc-step-number">1</div>
            <div className="doc-step-content">
              <h4>Install AppsMobs</h4>
              <p>Download and run the Windows installer (.exe)</p>
            </div>
          </div>
          
          <div className="doc-step">
            <div className="doc-step-number">2</div>
            <div className="doc-step-content">
              <h4>Enable USB Debugging</h4>
              <p>Enable Developer options and USB debugging on your Android device</p>
            </div>
          </div>
          
          <div className="doc-step">
            <div className="doc-step-number">3</div>
            <div className="doc-step-content">
              <h4>Connect Device</h4>
              <p>Connect via USB and accept the debugging prompt on your device</p>
            </div>
          </div>
          
          <div className="doc-step">
            <div className="doc-step-number">4</div>
            <div className="doc-step-content">
              <h4>Start Using</h4>
              <p>Open mirror, use quick actions, or run your first script</p>
            </div>
          </div>
        </div>

        <div className="doc-table-wrapper mt-6">
          <table className="doc-table">
            <thead>
              <tr><th>Step</th><th>What You See</th><th>Important Tip</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Install</strong></td>
                <td>Setup wizard with progress indicators</td>
                <td>Close Android Studio if running to avoid port conflicts</td>
              </tr>
              <tr>
                <td><strong>First Run</strong></td>
                <td>Dashboard with empty device list</td>
                <td>Allow Windows Defender/firewall if prompted</td>
              </tr>
              <tr>
                <td><strong>USB Connect</strong></td>
                <td>Device appears in list with "online" status</td>
                <td>Accept fingerprint prompt on device screen</td>
              </tr>
              <tr>
                <td><strong>License (if needed)</strong></td>
                <td>Activation screen with email/key fields</td>
                <td>Enter credentials from your account dashboard</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="prereq" className="doc-section">
        <h2 className="doc-h2">Prerequisites</h2>
        <p className="doc-p">
          Before installing, make sure you have the following:
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">Windows Requirements</h3>
          <ul className="doc-list">
            <li><strong>Operating System:</strong> Windows 10/11 (64-bit) - Both Home and Pro editions work</li>
            <li><strong>Administrator Access:</strong> Required for installation (you can run normally after installation)</li>
            <li><strong>Disk Space:</strong> ~500MB free space for application and bundled tools</li>
            <li><strong>Internet:</strong> Required for initial download and license activation</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Android Device Requirements</h3>
          <ul className="doc-list">
            <li><strong>Android Version:</strong> Android 5.0 (API 21) or higher</li>
            <li><strong>Developer Options:</strong> Must be enabled (we'll show you how below)</li>
            <li><strong>USB Debugging:</strong> Must be enabled (we'll show you how below)</li>
            <li><strong>USB Cable:</strong> Data-capable USB cable (charge-only cables won't work)</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Optional but Recommended</h3>
          <ul className="doc-list">
            <li>Latest USB drivers for your Android device manufacturer (Samsung, Google, etc.)</li>
            <li>Wi-Fi network if you plan to use wireless connection (after initial USB pairing)</li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="install" className="doc-section">
        <h2 className="doc-h2">Install the App</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Step 1: Download</h3>
          <ol className="doc-list">
            <li>Go to the <Link to="/download" className="text-cyan hover:underline">Download</Link> page</li>
            <li>Download the latest AppsMobs installer for Windows (.exe file)</li>
            <li>File size is typically ~200-300MB (includes all bundled tools)</li>
          </ol>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Step 2: Run Installer</h3>
          <ol className="doc-list">
            <li>Double-click the downloaded .exe file</li>
            <li>If Windows SmartScreen appears, click "More info" then "Run anyway"</li>
            <li>Follow the installation wizard:
              <ul className="doc-list ml-6 mt-2">
                <li>Accept the license agreement</li>
                <li>Choose installation directory (default is fine)</li>
                <li>Select start menu folder (default is fine)</li>
                <li>Click "Install" and wait for completion</li>
              </ul>
            </li>
            <li>When done, click "Finish" - the app may launch automatically</li>
          </ol>

          <div className="doc-callout bg-yellow-500/10 border-yellow-500/30 mt-4">
            <strong>⚠️ Important:</strong> If you have Android Studio or other ADB tools running, close them before installation 
            to avoid port conflicts. You can reopen them after AppsMobs is installed.
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Step 3: Launch AppsMobs</h3>
          <ol className="doc-list">
            <li>Find AppsMobs in your Start menu</li>
            <li>Or use the desktop shortcut if one was created</li>
            <li>The app will launch and show the Dashboard</li>
          </ol>

          <div className="doc-note mt-4">
            <strong>First Launch Tip:</strong> On first launch, Windows may show a firewall/defender prompt. 
            Click "Allow" to let AppsMobs communicate with connected devices.
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="first-run" className="doc-section">
        <h2 className="doc-h2">First Run</h2>
        <p className="doc-p">
          When you first launch AppsMobs, you'll see the Dashboard interface:
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">Dashboard Overview</h3>
          <ul className="doc-list">
            <li>
              <strong>Device List:</strong> Initially empty, will show connected devices here
            </li>
            <li>
              <strong>Quick Actions:</strong> Available once a device is connected
            </li>
            <li>
              <strong>Scripts Tab:</strong> Access to the built-in Playground editor
            </li>
            <li>
              <strong>Console Tab:</strong> View logs and script output
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Windows Security Prompts</h3>
          <p className="doc-p">
            On first run, Windows may show security prompts:
          </p>
          <ul className="doc-list">
            <li>
              <strong>Firewall Prompt:</strong> Windows Defender may ask for network access. 
              Click "Allow access" - this is needed for device discovery.
            </li>
            <li>
              <strong>SmartScreen:</strong> If you see a SmartScreen warning, click "More info" then "Run anyway". 
              This is normal for new applications.
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">What to Do Next</h3>
          <p className="doc-p">
            Before connecting a device, prepare your Android phone/tablet by enabling USB debugging (see next section).
          </p>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="license" className="doc-section">
        <h2 className="doc-h2">License Activation</h2>
        <p className="doc-p">
          If your plan requires a license, you'll need to activate it before full functionality is available.
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">When Activation is Required</h3>
          <ul className="doc-list">
            <li>All paid plans (Normal, Pro, Team) require activation</li>
            <li>Free trial periods may have limited functionality</li>
            <li>Some features may be locked until activation</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">How to Activate</h3>
          <ol className="doc-list">
            <li>Open AppsMobs Dashboard</li>
            <li>If prompted, go to the License/Activation section</li>
            <li>Enter your:
              <ul className="doc-list ml-6 mt-2">
                <li><strong>Email:</strong> The email address associated with your account</li>
                <li><strong>License Key:</strong> Your license key (format: LIC-XXXXXXXX)</li>
              </ul>
            </li>
            <li>Click "Activate" - the app will verify and store a secure token locally</li>
            <li>Once activated, you're ready to use all features</li>
          </ol>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">License Management</h3>
          <ul className="doc-list">
            <li>
              <strong>Offline Use:</strong> Works offline after activation until license refresh (typically 30 days)
            </li>
            <li>
              <strong>Revoke & Re-assign:</strong> You can revoke licenses from your account dashboard and activate on a new machine
            </li>
            <li>
              <strong>Multiple Machines:</strong> License limits depend on your plan (see <Link to="/docs/pricing" className="text-cyan hover:underline">Pricing</Link>)
            </li>
          </ul>
        </div>

        <div className="doc-callout bg-blue-500/10 border-blue-500/30 mt-4">
          <strong>💡 Need a License?</strong> Visit the <Link to="/shop" className="text-cyan hover:underline">Shop</Link> page to purchase a plan, 
          or check the <Link to="/docs/referral-rewards" className="text-cyan hover:underline">Referral & Rewards</Link> system to earn free license weeks with tokens.
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="enable-debugging" className="doc-section">
        <h2 className="doc-h2">Enable USB Debugging on Android</h2>
        <p className="doc-p">
          Before connecting your device, you need to enable Developer Options and USB Debugging. This process varies slightly by device, 
          but the general steps are the same.
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">Step 1: Enable Developer Options</h3>
          <ol className="doc-list">
            <li>Open <strong>Settings</strong> on your Android device</li>
            <li>Scroll down to <strong>About phone</strong> (or <strong>About device</strong>)</li>
            <li>Find <strong>Build number</strong> (not Build version)</li>
            <li>Tap <strong>Build number</strong> <strong>7 times</strong> rapidly</li>
            <li>You'll see a message: "You are now a developer!" (or similar)</li>
          </ol>

          <div className="doc-note mt-4">
            <strong>Note:</strong> On some devices, Build number might be under "Software information" or "Device information". 
            If you don't see it, look for "Version" or similar and tap that instead.
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Step 2: Enable USB Debugging</h3>
          <ol className="doc-list">
            <li>Go back to <strong>Settings</strong> (Developer options is now visible)</li>
            <li>Open <strong>Developer options</strong> (usually near the bottom of Settings)</li>
            <li>Find <strong>USB debugging</strong> toggle</li>
            <li>Turn it <strong>ON</strong></li>
            <li>If prompted, confirm the warning dialog</li>
          </ol>

          <div className="doc-warning bg-yellow-500/20 border-yellow-500/50 mt-4">
            <strong>⚠️ Security Note:</strong> USB debugging allows your computer to control the device. Only enable it on trusted computers. 
            You can disable it when not using AppsMobs.
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Step 3: Additional Settings (Recommended)</h3>
          <p className="doc-p">
            While in Developer options, also enable these for better experience:
          </p>
          <ul className="doc-list">
            <li>
              <strong>"Stay awake":</strong> Keeps screen on while charging (prevents screen lock during automations)
            </li>
            <li>
              <strong>"USB debugging (Security settings)":</strong> Allows automatic authorization (optional, for convenience)
            </li>
            <li>
              <strong>"Disable absolute volume":</strong> Better volume control (if available)
            </li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="usb" className="doc-section">
        <h2 className="doc-h2">Pair Over USB</h2>
        <p className="doc-p">
          Now that USB debugging is enabled, let's connect your device:
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">Step 1: Physical Connection</h3>
          <ol className="doc-list">
            <li>Use a <strong>data-capable USB cable</strong> (not charge-only)</li>
            <li>Connect your Android device to your Windows PC</li>
            <li>On your device, you may see a USB connection notification</li>
            <li>If prompted on device, select <strong>"File Transfer"</strong> or <strong>"MTP"</strong> mode (not "Charge only")</li>
          </ol>

          <div className="doc-callout bg-yellow-500/10 border-yellow-500/30 mt-4">
            <strong>💡 Cable Quality Matters:</strong> Cheap or damaged cables may cause connection issues. 
            Try a different cable or USB port if connection fails.
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Step 2: Accept Debugging Authorization</h3>
          <p className="doc-p">
            When you connect for the first time, your device will show an authorization prompt:
          </p>
          <ol className="doc-list">
            <li>Look for a popup on your device screen: <strong>"Allow USB debugging?"</strong></li>
            <li>Check the box: <strong>"Always allow from this computer"</strong> (optional but recommended)</li>
            <li>Tap <strong>"OK"</strong> or <strong>"Allow"</strong></li>
          </ol>

          <div className="doc-warning bg-red-500/10 border-red-500/30 mt-4">
            <strong>🔒 Security Warning:</strong> Only accept if you trust the computer. The RSA key fingerprint should match. 
            If you're unsure, tap "Cancel" and verify you're connecting to the right computer.
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Step 3: Verify Connection in AppsMobs</h3>
          <p className="doc-p">
            After accepting the prompt:
          </p>
          <ol className="doc-list">
            <li>Open AppsMobs Dashboard</li>
            <li>Your device should appear in the device list</li>
            <li>Status should show <strong>"online"</strong> (green indicator)</li>
            <li>You'll see device info: model name, Android version, serial number</li>
          </ol>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="verify-connection" className="doc-section">
        <h2 className="doc-h2">Verify Connection</h2>
        <p className="doc-p">
          Once your device appears in the Dashboard, verify everything works:
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">Device Status Indicators</h3>
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Status</th><th>Meaning</th><th>What to Do</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>online</strong> ✅</td>
                  <td>Device is connected and ready</td>
                  <td>Ready to use! Proceed with mirroring or scripts</td>
                </tr>
                <tr>
                  <td><strong>unauthorized</strong> ⚠️</td>
                  <td>Fingerprint not accepted</td>
                  <td>Re-plug USB cable and accept prompt on device</td>
                </tr>
                <tr>
                  <td><strong>offline</strong> ❌</td>
                  <td>Device detected but not responding</td>
                  <td>Check cable, try different USB port, restart device</td>
                </tr>
                <tr>
                  <td><strong>disconnected</strong> ❌</td>
                  <td>Device not detected</td>
                  <td>Install OEM USB drivers, check cable, verify USB debugging enabled</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Test Quick Actions</h3>
          <p className="doc-p">
            Try a quick action to verify the connection works:
          </p>
          <ol className="doc-list">
            <li>Select your device in the Dashboard</li>
            <li>Try clicking "Screenshot" - you should see a screenshot appear</li>
            <li>Try "Home" button - your device should return to home screen</li>
            <li>If these work, your connection is good!</li>
          </ol>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="mirror" className="doc-section">
        <h2 className="doc-h2">Open Mirror & Control</h2>
        <p className="doc-p">
          Screen mirroring lets you see and control your Android device on your PC screen:
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">Opening the Mirror</h3>
          <ol className="doc-list">
            <li>Select your device in the Dashboard</li>
            <li>Click <strong>"Open Mirror"</strong> button (or right-click → "Open Mirror")</li>
            <li>A new window opens showing your device screen</li>
            <li>Wait a few seconds for the initial connection to establish</li>
          </ol>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Default Settings</h3>
          <p className="doc-p">
            AppsMobs uses optimized defaults for stability:
          </p>
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Setting</th><th>Default Value</th><th>When to Change</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Bitrate</strong></td>
                  <td>2 Mbps</td>
                  <td>Lower (1M) for Wi-Fi; raise (4-8M) for USB if you need more clarity</td>
                </tr>
                <tr>
                  <td><strong>Max FPS</strong></td>
                  <td>15 FPS</td>
                  <td>Lower (10) on slow PCs; raise (30-60) on powerful machines</td>
                </tr>
                <tr>
                  <td><strong>Max Resolution</strong></td>
                  <td>1920px width</td>
                  <td>Lower (1280) if CPU-bound; raise (no limit) for high-res displays</td>
                </tr>
                <tr>
                  <td><strong>Stay Awake</strong></td>
                  <td>Enabled</td>
                  <td>Keep enabled to prevent screen lock during automations</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Adjusting Settings</h3>
          <p className="doc-p">
            If you experience issues, try adjusting:
          </p>
          <ul className="doc-list">
            <li>
              <strong>Stuttering/Frame drops:</strong> Lower FPS (10-15) or bitrate (1M)
            </li>
            <li>
              <strong>Black screen:</strong> Lower resolution or bitrate, verify device permissions
            </li>
            <li>
              <strong>High CPU usage:</strong> Lower FPS and resolution
            </li>
            <li>
              <strong>Low quality on USB:</strong> Raise bitrate (4-8M) since USB has more bandwidth
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Controlling the Device</h3>
          <p className="doc-p">
            Once mirroring is active:
          </p>
          <ul className="doc-list">
            <li><strong>Mouse clicks</strong> on the mirror window control the device</li>
            <li><strong>Keyboard typing</strong> is forwarded to the device</li>
            <li><strong>Clipboard</strong> is synchronized between PC and device</li>
            <li><strong>Right-click</strong> on mirror window for additional options</li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="actions" className="doc-section">
        <h2 className="doc-h2">Use Quick Actions</h2>
        <p className="doc-p">
          Quick Actions let you perform common tasks without opening the mirror:
        </p>

        <div className="doc-table-wrapper">
          <table className="doc-table">
            <thead>
              <tr><th>Action</th><th>What It Does</th><th>Use Case</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Wi‑Fi Toggle</strong></td>
                <td>Enable/disable wireless quickly</td>
                <td>Reset network, test connectivity</td>
              </tr>
              <tr>
                <td><strong>Airplane Mode</strong></td>
                <td>Toggle airplane mode on/off</td>
                <td>Reset radios, fix connectivity issues</td>
              </tr>
              <tr>
                <td><strong>Home</strong></td>
                <td>Press home button</td>
                <td>Return to home screen, close apps</td>
              </tr>
              <tr>
                <td><strong>Back</strong></td>
                <td>Press back button</td>
                <td>Navigate back, close dialogs</td>
              </tr>
              <tr>
                <td><strong>Recents</strong></td>
                <td>Open recent apps menu</td>
                <td>Switch apps, close apps</td>
              </tr>
              <tr>
                <td><strong>Volume Up/Down</strong></td>
                <td>Adjust media volume</td>
                <td>Control audio levels</td>
              </tr>
              <tr>
                <td><strong>Brightness Up/Down</strong></td>
                <td>Adjust screen brightness</td>
                <td>Save battery, adjust visibility</td>
              </tr>
              <tr>
                <td><strong>Screenshot</strong></td>
                <td>Capture and save screen</td>
                <td>Document states, debug issues</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">How to Use Quick Actions</h3>
          <ol className="doc-list">
            <li>Select one or more devices in the Dashboard</li>
            <li>Find the Quick Actions section (usually in the device row or sidebar)</li>
            <li>Click the desired action button</li>
            <li>The action executes immediately on all selected devices</li>
          </ol>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="first-script" className="doc-section">
        <h2 className="doc-h2">Run Your First Script</h2>
        <p className="doc-p">
          Let's run a simple script to verify automation works:
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">Using the Playground Editor</h3>
          <ol className="doc-list">
            <li>Select your device in the Dashboard</li>
            <li>Open the <strong>"Scripts"</strong> tab</li>
            <li>Click <strong>"Playground Editor"</strong> (or "New Script")</li>
            <li>The built-in editor opens with a template</li>
          </ol>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Simple Example Script</h3>
          <p className="doc-p">
            Replace the template with this simple script:
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`def my_script(android_client, device_serial, **kwargs):
    result = {'success': False, 'message': '', 'data': {}}
    
    try:
        # Go to home screen
        home()
        sleep(1)
        
        # Tap near the bottom center (adjust coordinates for your device)
        click(540, 1680)
        sleep(1)
        
        # Type a message
        write("Hello from AppsMobs!")
        sleep(1)
        
        # Press back
        back()
        
        result['success'] = True
        result['message'] = 'Script completed successfully!'
        
    except Exception as e:
        result['message'] = f'Error: {e}'
    
    return result

SCRIPT_INFO = {
    'name': 'My First Script',
    'description': 'Simple test script',
    'author': 'You',
    'version': '1.0.0',
    'max_duration': 30
}`}</code></pre>
          </div>

          <div className="doc-note mt-4">
            <strong>Note:</strong> Adjust the coordinates (540, 1680) based on your device screen size. 
            For a 1920x1080 device, center-bottom would be around (960, 1000). See <Link to="/docs/playground" className="text-cyan hover:underline">Playground</Link> for coordinate system details.
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Running the Script</h3>
          <ol className="doc-list">
            <li>Click <strong>"Run"</strong> or press F5</li>
            <li>Watch the Console tab for output</li>
            <li>Observe your device - it should execute the actions</li>
            <li>Check the result message in the Console</li>
          </ol>
        </div>

        <div className="doc-callout bg-purple-500/10 border-purple-500/30 mt-4">
          <strong>📚 Next Steps:</strong> Explore the <Link to="/docs/playground" className="text-cyan hover:underline">Playground</Link> documentation 
          to learn about all 35+ available functions, or check <Link to="/docs/scripts" className="text-cyan hover:underline">Python Scripts</Link> 
          for more advanced scripting techniques.
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="wifi" className="doc-section">
        <h2 className="doc-h2">Switch to Wi‑Fi (Optional)</h2>
        <p className="doc-p">
          After the initial USB pairing, you can connect wirelessly over Wi-Fi for more flexibility:
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">Prerequisites</h3>
          <ul className="doc-list">
            <li>Device must be paired via USB first (one-time setup)</li>
            <li>PC and device must be on the same Wi-Fi network</li>
            <li>Device IP address (find in Settings → About → Status → IP address)</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Method 1: Using AppsMobs (Easiest)</h3>
          <ol className="doc-list">
            <li>With device connected via USB, select it in Dashboard</li>
            <li>Find <strong>"Enable Wi-Fi Connection"</strong> or similar action</li>
            <li>Click it - AppsMobs will automatically:
              <ul className="doc-list ml-6 mt-2">
                <li>Enable TCP/IP mode on device</li>
                <li>Get the device IP address</li>
                <li>Connect wirelessly</li>
              </ul>
            </li>
            <li>Once connected, you can disconnect USB</li>
          </ol>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Method 2: Manual Commands</h3>
          <p className="doc-p">
            If you prefer command-line or AppsMobs action isn't available:
          </p>
          
          <div className="doc-code">
            <pre><code className="language-bash">{`# Step 1: Enable TCP/IP mode (device connected via USB)
adb tcpip 5555

# Step 2: Get device IP address
# On device: Settings → About → Status → IP address
# Or use: adb shell ip route | grep wlan0

# Step 3: Connect wirelessly (replace IP with your device IP)
adb connect YOUR_DEVICE_IP:5555

# Verify connection
adb devices  # Should show YOUR_DEVICE_IP:5555`}</code></pre>
          </div>

          <div className="doc-note mt-4">
            <strong>Example:</strong> If your device IP is 192.168.1.100, use: <code>adb connect 192.168.1.100:5555</code>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Wi-Fi Connection Tips</h3>
          <ul className="doc-list">
            <li>
              <strong>Same Network:</strong> PC and device must be on the same Wi-Fi network
            </li>
            <li>
              <strong>IP May Change:</strong> Device IP can change when reconnecting to Wi-Fi - you may need to reconnect
            </li>
            <li>
              <strong>Performance:</strong> USB is generally faster and more stable for mirroring
            </li>
            <li>
              <strong>Range:</strong> Keep device relatively close to router for best performance
            </li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="tips" className="doc-section">
        <h2 className="doc-h2">Tips for Stability</h2>
        <p className="doc-p">
          Follow these tips for the best experience:
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">Connection Stability</h3>
          <ul className="doc-list">
            <li>
              <strong>Prefer USB for long sessions:</strong> USB is more stable than Wi-Fi for extended use
            </li>
            <li>
              <strong>Use quality cables:</strong> Data-capable USB cables prevent connection drops
            </li>
            <li>
              <strong>Avoid USB hubs:</strong> Connect directly to PC USB port when possible
            </li>
            <li>
              <strong>Keep cable secure:</strong> Loose connections cause intermittent issues
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Performance Optimization</h3>
          <ul className="doc-list">
            <li>
              <strong>Close heavy apps:</strong> Close resource-intensive apps on both PC and device for smoother mirroring
            </li>
            <li>
              <strong>Keep CPU/GPU headroom:</strong> Don't run other video-intensive apps while mirroring
            </li>
            <li>
              <strong>Lower settings if needed:</strong> If you see stutters, lower FPS/bitrate (see mirror settings)
            </li>
            <li>
              <strong>Monitor system resources:</strong> Check Task Manager if performance degrades
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Script Execution</h3>
          <ul className="doc-list">
            <li>
              <strong>Test on one device first:</strong> Before running on multiple devices, test on one
            </li>
            <li>
              <strong>Use appropriate delays:</strong> Add <code>sleep()</code> between actions to avoid race conditions
            </li>
            <li>
              <strong>Monitor logs:</strong> Watch Console tab for errors or warnings
            </li>
            <li>
              <strong>Set max_duration:</strong> Always set <code>max_duration</code> in SCRIPT_INFO to prevent infinite loops
            </li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="troubleshoot" className="doc-section">
        <h2 className="doc-h2">Troubleshooting</h2>
        <p className="doc-p">
          Common issues and their solutions:
        </p>

        <div className="doc-table-wrapper">
          <table className="doc-table">
            <thead>
              <tr><th>Symptom</th><th>Likely Cause</th><th>Solution</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Device not listed</strong></td>
                <td>Missing drivers, bad cable, or debugging disabled</td>
                <td>
                  <ol className="doc-list">
                    <li>Install OEM USB drivers (Samsung, Google, etc.)</li>
                    <li>Try different USB cable/port</li>
                    <li>Verify USB debugging is enabled</li>
                    <li>Check Windows Device Manager for unrecognized devices</li>
                  </ol>
                </td>
              </tr>
              <tr>
                <td><strong>adb unauthorized</strong></td>
                <td>Fingerprint not accepted</td>
                <td>
                  <ol className="doc-list">
                    <li>Re-plug USB cable</li>
                    <li>Accept fingerprint prompt on device</li>
                    <li>Check "Always allow from this computer"</li>
                    <li>If persistent, revoke USB debugging authorizations in Developer options</li>
                  </ol>
                </td>
              </tr>
              <tr>
                <td><strong>Black mirror screen</strong></td>
                <td>Performance issue or permission problem</td>
                <td>
                  <ol className="doc-list">
                    <li>Lower FPS (10) and bitrate (1M) in mirror settings</li>
                    <li>Verify device screen isn't locked</li>
                    <li>Try USB instead of Wi-Fi</li>
                    <li>Check device permissions for screen recording</li>
                  </ol>
                </td>
              </tr>
              <tr>
                <td><strong>Script not executing</strong></td>
                <td>Syntax error or missing functions</td>
                <td>
                  <ol className="doc-list">
                    <li>Check Console tab for error messages</li>
                    <li>Verify script structure (see <Link to="/docs/scripts" className="text-cyan hover:underline">Scripts</Link>)</li>
                    <li>Test with simple script first</li>
                    <li>Ensure SCRIPT_INFO is defined</li>
                  </ol>
                </td>
              </tr>
              <tr>
                <td><strong>Connection drops frequently</strong></td>
                <td>Cable, Wi-Fi, or driver issue</td>
                <td>
                  <ol className="doc-list">
                    <li>Use high-quality USB cable</li>
                    <li>If Wi-Fi, ensure strong signal and same network</li>
                    <li>Update USB drivers</li>
                    <li>Try different USB port (prefer USB 3.0)</li>
                  </ol>
                </td>
              </tr>
              <tr>
                <td><strong>High CPU usage</strong></td>
                <td>Mirroring settings too high</td>
                <td>
                  <ol className="doc-list">
                    <li>Lower FPS to 10-15</li>
                    <li>Lower max resolution to 1280px</li>
                    <li>Reduce bitrate to 1-2M</li>
                    <li>Close other resource-intensive apps</li>
                  </ol>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Getting More Help</h3>
          <ul className="doc-list">
            <li>Check the <Link to="/faq" className="text-cyan hover:underline">FAQ</Link> page for common questions</li>
            <li>Review <Link to="/docs/concepts" className="text-cyan hover:underline">Concepts</Link> for terminology explanations</li>
            <li>Consult <Link to="/docs/core" className="text-cyan hover:underline">Core Usage</Link> for advanced features</li>
            <li>Check Console logs for detailed error messages</li>
          </ul>
        </div>
      </section>

    </DocsLayout>
  )
}
