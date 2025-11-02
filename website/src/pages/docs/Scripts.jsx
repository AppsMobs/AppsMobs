import DocsLayout from '../DocsLayout'
import { Link } from 'react-router-dom'

export default function Scripts(){
  const toc = [
    { href: '#overview', label: 'Overview' },
    { href: '#structure', label: 'Script Structure' },
    { href: '#quick-example', label: 'Quick Example' },
    { href: '#execution', label: 'Execution' },
    { href: '#functions', label: 'Available Functions' },
    { href: '#images', label: 'Using Images' },
    { href: '#best-practices', label: 'Best Practices' }
  ]
  return (
    <DocsLayout title="Python Scripts" toc={toc}>
      
      {/* 📸 PLACE IMAGE HERE: /public/assets/scripts-editor.png */}
      {/* Description: Screenshot of the script editor with a script open */}
      <div className="doc-gallery mb-8">
        <img src="/assets/scripts.png" alt="Scripts Editor" className="rounded-lg border border-white/10" />
      </div>

      <section id="overview" className="doc-section">
        <h2 className="doc-h2">Overview</h2>
        <p className="doc-p">
          <strong>Python scripts</strong> allow you to automate actions on your Android devices.
          You can create your scripts in the built-in editor (Playground) or use local files.
        </p>
        
        <div className="doc-callout bg-cyan/10 border-cyan/30">
          <strong>💡 New:</strong> Check out the <Link to="/docs/playground" className="text-cyan hover:underline">Playground - Code Blocks</Link> page 
          to see all available code blocks with their complete explanations!
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="structure" className="doc-section">
        <h2 className="doc-h2">Script Structure</h2>
        <p className="doc-p">All scripts must follow this structure:</p>
        
        <div className="doc-code">
          <pre><code className="language-python">{`def my_script(android_client, device_serial, **kwargs):
    """
    Your automation script
    
    Args:
        android_client: Instance to control device (automatically provided)
        device_serial: Device serial number (e.g. "R58M67Q75DW")
        **kwargs: Optional parameters
    
    Returns:
        dict: {'success': bool, 'message': str, 'data': {}}
    """
    result = {
        'success': False,
        'message': '',
        'data': {}
    }
    
    try:
        # YOUR CODE HERE
        # All functions are available directly
        # No need to import, they are automatically injected
        
        click(540, 960)
        sleep(1)
        swipe_up()
        
        result['success'] = True
        result['message'] = 'Script executed successfully'
        
    except Exception as e:
        result['message'] = f'Error: {str(e)}'
    
    return result

# Script information (REQUIRED)
SCRIPT_INFO = {
    'name': 'My Script',
    'description': 'Description of what the script does',
    'author': 'Your Name',
    'version': '1.0.0',
    'max_duration': 60  # Maximum time in seconds
}`}</code></pre>
        </div>
        
        <p className="doc-p mt-4">
          For detailed explanations of all available functions, see the <Link to="/docs/playground" className="text-cyan hover:underline">Playground - Code Blocks</Link> documentation.
        </p>
      </section>

      <hr className="doc-hr" />

      <section id="quick-example" className="doc-section">
        <h2 className="doc-h2">Quick Example</h2>
        
        <div className="doc-code">
          <pre><code className="language-python">{`def my_script(android_client, device_serial, **kwargs):
    result = {'success': False, 'message': '', 'data': {}}
    
    try:
        # 1. Go to home screen
        home()
        sleep(1)
        
        # 2. Find and click YouTube icon
        FindPosClick("youtube_icon.png", 0.8)
        sleep(3)  # Wait for app to open
        
        # 3. Scroll through videos
        for i in range(5):
            swipe_up()
            random_delay(1, 2)
        
        result['success'] = True
        result['message'] = 'Script completed'
        
    except Exception as e:
        result['message'] = f'Error: {e}'
    
    return result

SCRIPT_INFO = {
    'name': 'YouTube Navigation',
    'description': 'Opens YouTube and scrolls through videos',
    'author': 'You',
    'version': '1.0.0',
    'max_duration': 60
}`}</code></pre>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="execution" className="doc-section">
        <h2 className="doc-h2">Execution</h2>
        
        <h3 className="doc-h3">Via Desktop Interface</h3>
        <ol className="doc-list">
          <li>Connect your Android devices</li>
          <li>Select one or multiple devices in the Dashboard</li>
          <li>Open the <strong>"Scripts"</strong> tab</li>
          <li>Choose your script (.py file or Playground editor)</li>
          <li>Click <strong>"Run"</strong></li>
          <li>Follow logs in the <strong>"Console"</strong> tab</li>
        </ol>

        {/* 📸 PLACE IMAGE HERE: /public/assets/run-script-interface.png */}
        {/* Description: Screenshot showing the interface to run a script */}
        
        <h3 className="doc-h3 mt-6">Execution Model</h3>
        <div className="doc-table-wrapper">
          <table className="doc-table">
            <thead>
              <tr><th>Aspect</th><th>Details</th></tr>
            </thead>
            <tbody>
              <tr><td>Scope</td><td>Per selected device (isolated)</td></tr>
              <tr><td>Logs</td><td>Stored and displayed per device session</td></tr>
              <tr><td>Stop</td><td>Can be interrupted from Dashboard at any time</td></tr>
              <tr><td>Multi-device</td><td>Parallel execution on multiple devices</td></tr>
            </tbody>
          </table>
        </div>
        
        <p className="doc-p mt-4">
          Learn more about using the Dashboard in the <Link to="/docs/core" className="text-cyan hover:underline">Core Usage</Link> documentation.
        </p>
      </section>

      <hr className="doc-hr" />

      <section id="functions" className="doc-section">
        <h2 className="doc-h2">Available Functions</h2>
        <p className="doc-p">
          All functions are <strong>automatically injected</strong> into your scripts. 
          You don't need to import them!
        </p>

        <div className="doc-table-wrapper">
          <table className="doc-table">
            <thead>
              <tr><th>Function</th><th>Description</th><th>Link</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><code>click(x, y)</code></td>
                <td>Single tap</td>
                <td><Link to="/docs/playground#basic-controls" className="text-cyan hover:underline">See details</Link></td>
              </tr>
              <tr>
                <td><code>swipe(x1, y1, x2, y2)</code></td>
                <td>Custom swipe</td>
                <td><Link to="/docs/playground#basic-controls" className="text-cyan hover:underline">See details</Link></td>
              </tr>
              <tr>
                <td><code>write(text)</code></td>
                <td>Type text</td>
                <td><Link to="/docs/playground#basic-controls" className="text-cyan hover:underline">See details</Link></td>
              </tr>
              <tr>
                <td><code>Find(image, conf)</code></td>
                <td>Find image (loop)</td>
                <td><Link to="/docs/playground#image-detection" className="text-cyan hover:underline">See details</Link></td>
              </tr>
              <tr>
                <td><code>FindPosClick(image, conf)</code></td>
                <td>Search and click</td>
                <td><Link to="/docs/playground#loops" className="text-cyan hover:underline">See details</Link></td>
              </tr>
              <tr>
                <td><code>swipe_up(), swipe_down()</code></td>
                <td>Directional swipes</td>
                <td><Link to="/docs/playground#swipes" className="text-cyan hover:underline">See details</Link></td>
              </tr>
              <tr>
                <td><code>random_delay(min, max)</code></td>
                <td>Random wait</td>
                <td><Link to="/docs/playground#utilities" className="text-cyan hover:underline">See details</Link></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="doc-callout bg-purple-500/10 border-purple-500/30 mt-4">
          <strong>📚 Complete documentation:</strong> All functions with code examples are documented 
          in the <Link to="/docs/playground" className="text-cyan hover:underline font-bold">Playground - Code Blocks</Link> page.
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="images" className="doc-section">
        <h2 className="doc-h2">Using Images</h2>
        <p className="doc-p">
          For image detection, create an <code>img/</code> folder next to your script:
        </p>

        <div className="doc-code">
          <pre><code>{`scripts/
├── my_script.py
└── img/
    ├── button.png
    ├── icon.png
    └── popup.png`}</code></pre>
        </div>

        <p className="doc-p mt-4">
          Images are automatically searched in this folder. Use relative paths:
        </p>

        <div className="doc-code">
          <pre><code className="language-python">{`# Automatic search in scripts/my_script/img/
FindPosClick("button.png", 0.8)  # Searches in img/button.png`}</code></pre>
        </div>
        
        <p className="doc-p mt-4">
          For more details on image detection and confidence levels, see the <Link to="/docs/playground#image-guide" className="text-cyan hover:underline">Image Detection Guide</Link> in the Playground documentation.
        </p>
      </section>

      <hr className="doc-hr" />

      <section id="best-practices" className="doc-section">
        <h2 className="doc-h2">Best Practices</h2>
        
        <ul className="doc-list">
          <li>✅ <strong>Test on one device</strong> before deploying to multiple</li>
          <li>✅ <strong>Use random_delay()</strong> to simulate human behavior</li>
          <li>✅ <strong>Handle errors</strong> with try/except</li>
          <li>✅ <strong>Verify images</strong> before clicking with Findtf()</li>
          <li>✅ <strong>Limit max_duration</strong> in SCRIPT_INFO to avoid infinite loops</li>
          <li>✅ <strong>Organize your images</strong> in the img/ folder of each script</li>
        </ul>
        
        <p className="doc-p mt-4">
          For more examples and complete script templates, check out the <Link to="/docs/playground#examples" className="text-cyan hover:underline">Complete Examples</Link> section in the Playground documentation.
        </p>
      </section>

    </DocsLayout>
  )
}
