import DocsLayout from '../DocsLayout'
import { Link } from 'react-router-dom'

export default function Quickstart(){
  const toc = [
    { href: '#overview', label: 'Quick Start Overview' },
    { href: '#install', label: '1. Install (2 min)' },
    { href: '#enable-debug', label: '2. Enable Debugging (3 min)' },
    { href: '#connect', label: '3. Connect Device (1 min)' },
    { href: '#verify', label: '4. Verify Connection (1 min)' },
    { href: '#first-action', label: '5. First Action (1 min)' },
    { href: '#next', label: 'What\'s Next' }
  ]
  
  return (
    <DocsLayout title="Quickstart" toc={toc}>
      
      <section id="overview" className="doc-section">
        <h2 className="doc-h2">Quick Start Guide</h2>
        <p className="doc-p">
          Get AppsMobs up and running in <strong>5 minutes</strong>. This quick guide covers the absolute essentials 
          to get your first device connected and working.
        </p>

        <div className="doc-callout bg-green-500/10 border-green-500/30">
          <strong>⏱️ Total Time:</strong> ~5 minutes | <strong>Requirements:</strong> Windows PC, Android device, USB cable
        </div>

        <div className="doc-table-wrapper mt-6">
          <table className="doc-table">
            <thead>
              <tr><th>Step</th><th>Time</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>1. Install</strong></td><td>2 min</td><td>Download and run installer</td></tr>
              <tr><td><strong>2. Enable Debugging</strong></td><td>3 min</td><td>Enable USB debugging on device</td></tr>
              <tr><td><strong>3. Connect</strong></td><td>1 min</td><td>Plug in USB and accept prompt</td></tr>
              <tr><td><strong>4. Verify</strong></td><td>1 min</td><td>Check device appears in Dashboard</td></tr>
              <tr><td><strong>5. First Action</strong></td><td>1 min</td><td>Take a screenshot or open mirror</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="install" className="doc-section">
        <h2 className="doc-h2">Step 1: Install (2 minutes)</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Download & Install</h3>
          <ol className="doc-list">
            <li>Go to <Link to="/download" className="text-cyan hover:underline">Download page</Link></li>
            <li>Download the Windows installer (.exe)</li>
            <li>Run the installer - click "Next" through the wizard</li>
            <li>Click "Install" and wait for completion</li>
            <li>Launch AppsMobs from Start menu</li>
          </ol>

          <div className="doc-callout bg-blue-500/10 border-blue-500/30 mt-4">
            <strong>💡 That's it!</strong> No additional tools to install - ADB, scrcpy, and Python runtime are all bundled.
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="enable-debug" className="doc-section">
        <h2 className="doc-h2">Step 2: Enable USB Debugging (3 minutes)</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Enable Developer Options</h3>
          <ol className="doc-list">
            <li>On your Android device: <strong>Settings</strong> → <strong>About phone</strong></li>
            <li>Find <strong>Build number</strong> and tap it <strong>7 times</strong></li>
            <li>You'll see: "You are now a developer!"</li>
          </ol>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Enable USB Debugging</h3>
          <ol className="doc-list">
            <li>Go back to <strong>Settings</strong> → <strong>Developer options</strong></li>
            <li>Turn on <strong>USB debugging</strong></li>
            <li>Confirm any warning dialogs</li>
          </ol>

          <div className="doc-warning bg-yellow-500/20 border-yellow-500/50 mt-4">
            <strong>⚠️ Security:</strong> USB debugging allows computer control. Only enable on trusted computers.
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="connect" className="doc-section">
        <h2 className="doc-h2">Step 3: Connect Device (1 minute)</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Physical Connection</h3>
          <ol className="doc-list">
            <li>Connect device to PC with USB cable</li>
            <li>On device, select <strong>"File Transfer"</strong> mode if prompted</li>
            <li>Device shows popup: <strong>"Allow USB debugging?"</strong></li>
            <li>Check <strong>"Always allow from this computer"</strong></li>
            <li>Tap <strong>"OK"</strong></li>
          </ol>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Verify in AppsMobs</h3>
          <ul className="doc-list">
            <li>Open AppsMobs Dashboard</li>
            <li>Your device should appear in the device list</li>
            <li>Status should show <strong>"online"</strong> (green)</li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="verify" className="doc-section">
        <h2 className="doc-h2">Step 4: Verify Connection (1 minute)</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Quick Test</h3>
          <ol className="doc-list">
            <li>Select your device in Dashboard</li>
            <li>Click <strong>"Screenshot"</strong> button</li>
            <li>Screenshot should appear - connection is working! ✅</li>
          </ol>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Connection Status Guide</h3>
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Status</th><th>Meaning</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>online</strong> ✅</td><td>Ready to use!</td></tr>
                <tr><td><strong>unauthorized</strong> ⚠️</td><td>Re-plug USB and accept prompt</td></tr>
                <tr><td><strong>offline/disconnected</strong> ❌</td><td>Check cable, drivers, or debugging enabled</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="first-action" className="doc-section">
        <h2 className="doc-h2">Step 5: Your First Action (1 minute)</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Option 1: Open Screen Mirror</h3>
          <ol className="doc-list">
            <li>Select device in Dashboard</li>
            <li>Click <strong>"Open Mirror"</strong></li>
            <li>Device screen appears in new window</li>
            <li>Click in window to control device</li>
          </ol>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Option 2: Try Quick Actions</h3>
          <ul className="doc-list">
            <li><strong>Screenshot:</strong> Capture device screen</li>
            <li><strong>Home:</strong> Return to home screen</li>
            <li><strong>Back:</strong> Navigate back</li>
            <li><strong>Volume Up/Down:</strong> Adjust volume</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Option 3: Run a Simple Script</h3>
          <ol className="doc-list">
            <li>Select device, open <strong>"Scripts"</strong> tab</li>
            <li>Click <strong>"Playground Editor"</strong></li>
            <li>Use a pre-made block or write simple code:</li>
          </ol>
          
          <div className="doc-code mt-4">
            <pre><code className="language-python">{`def my_script(android_client, device_serial, **kwargs):
    result = {'success': False, 'message': '', 'data': {}}
    try:
        home()  # Go to home
        sleep(1)
        click(540, 960)  # Tap somewhere
        result['success'] = True
    except Exception as e:
        result['message'] = str(e)
    return result

SCRIPT_INFO = {'name': 'Test', 'version': '1.0', 'max_duration': 30}`}</code></pre>
          </div>
          
          <p className="doc-p mt-4">
            Click <strong>"Run"</strong> and watch it execute on your device!
          </p>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="next" className="doc-section">
        <h2 className="doc-h2">What's Next?</h2>
        <p className="doc-p">
          Congratulations! You've successfully set up AppsMobs. Now explore these resources:
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">Learn the Basics</h3>
          <ul className="doc-list">
            <li>
              <Link to="/docs/core" className="text-cyan hover:underline">Core Usage</Link> - Master the Dashboard and basic operations
            </li>
            <li>
              <Link to="/docs/concepts" className="text-cyan hover:underline">Concepts</Link> - Understand key terminology and workflows
            </li>
            <li>
              <Link to="/docs/getting-started" className="text-cyan hover:underline">Getting Started</Link> - Detailed setup guide with troubleshooting
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Start Automating</h3>
          <ul className="doc-list">
            <li>
              <Link to="/docs/playground" className="text-cyan hover:underline">Playground - Code Blocks</Link> - Browse 35+ pre-made functions with full explanations
            </li>
            <li>
              <Link to="/docs/scripts" className="text-cyan hover:underline">Python Scripts</Link> - Learn script structure and best practices
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Advanced Topics</h3>
          <ul className="doc-list">
            <li>
              <Link to="/docs/pricing" className="text-cyan hover:underline">Pricing & Licenses</Link> - Choose the right plan for your needs
            </li>
            <li>
              <Link to="/docs/referral-rewards" className="text-cyan hover:underline">Referral & Rewards</Link> - Earn free license weeks with tokens
            </li>
          </ul>
        </div>

        <div className="doc-callout bg-cyan/10 border-cyan/30 mt-6">
          <strong>🎓 Learning Path:</strong>
          <ol className="doc-list mt-2">
            <li>Quickstart (you're here!) → Core Usage → Concepts</li>
            <li>Then: Playground → Python Scripts</li>
            <li>Advanced: Multi-device automation, complex workflows</li>
          </ol>
        </div>
      </section>

    </DocsLayout>
  )
}
