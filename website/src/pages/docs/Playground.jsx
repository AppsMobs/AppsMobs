import DocsLayout from '../DocsLayout'
import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'

export default function Playground(){
  const [searchQuery, setSearchQuery] = useState('')
  
  const toc = [
    { href: '#overview', label: 'Overview' },
    { href: '#functions-table', label: 'Functions Table' },
    { href: '#basic-controls', label: 'Basic Controls' },
    { href: '#navigation', label: 'Navigation' },
    { href: '#swipes', label: 'Directional Swipes' },
    { href: '#image-detection', label: 'Image Detection' },
    { href: '#loops', label: 'Search & Click Loops' },
    { href: '#utilities', label: 'Utilities' },
    { href: '#system', label: 'System & Network' },
    { href: '#examples', label: 'Complete Examples' },
    { href: '#image-guide', label: 'Image Guide' },
    { href: '#script-structure', label: 'Script Structure' }
  ]

  // List of all functions with their details
  const allFunctions = [
    { id: 'click', num: 1, name: 'click', title: 'Click - Single tap', category: 'Basic Controls', func: 'click(x, y)' },
    { id: 'doubleclick', num: 2, name: 'doubleclick', title: 'Double Click - Double tap', category: 'Basic Controls', func: 'doubleclick(x, y)' },
    { id: 'write', num: 3, name: 'write', title: 'Write - Type text', category: 'Basic Controls', func: 'write(text)' },
    { id: 'swipe', num: 4, name: 'swipe', title: 'Swipe - Custom swipe', category: 'Basic Controls', func: 'swipe(x1, y1, x2, y2, duration)' },
    { id: 'back', num: 5, name: 'back', title: 'Back - Back button', category: 'Navigation', func: 'back()' },
    { id: 'home', num: 6, name: 'home', title: 'Home - Home button', category: 'Navigation', func: 'home()' },
    { id: 'enter', num: 7, name: 'enter', title: 'Enter - Enter key', category: 'Navigation', func: 'enter() / entre()' },
    { id: 'switch', num: 8, name: 'switch', title: 'Switch - Switch application', category: 'Navigation', func: 'switch()' },
    { id: 'sleep', num: 9, name: 'sleep', title: 'Sleep - Wait', category: 'Navigation', func: 'sleep(seconds)' },
    { id: 'swipe-up', num: 10, name: 'swipe_up', title: 'Swipe Up - Scroll up', category: 'Directional Swipes', func: 'swipe_up() / upswipe()' },
    { id: 'swipe-down', num: 11, name: 'swipe_down', title: 'Swipe Down - Scroll down', category: 'Directional Swipes', func: 'swipe_down() / downswipe()' },
    { id: 'swipe-left', num: 12, name: 'swipe_left', title: 'Swipe Left - Scroll left', category: 'Directional Swipes', func: 'swipe_left() / leftswipe()' },
    { id: 'swipe-right', num: 13, name: 'swipe_right', title: 'Swipe Right - Scroll right', category: 'Directional Swipes', func: 'swipe_right() / rightswipe()' },
    { id: 'find', num: 14, name: 'Find', title: 'Find - Find image (infinite loop)', category: 'Image Detection', func: 'Find(image, conf)' },
    { id: 'findd', num: 15, name: 'Findd', title: 'Findd - Find image (once)', category: 'Image Detection', func: 'Findd(image, conf)' },
    { id: 'finddd', num: 16, name: 'Finddd', title: 'Finddd - Find image (returns None)', category: 'Image Detection', func: 'Finddd(image, conf)' },
    { id: 'findtf', num: 17, name: 'Findtf', title: 'Findtf - Check if image exists', category: 'Image Detection', func: 'Findtf(image, conf)' },
    { id: 'findtfmultiple', num: 18, name: 'Findtfmultiple', title: 'Findtfmultiple - Check multiple images', category: 'Image Detection', func: 'Findtfmultiple(images, conf)' },
    { id: 'findallimages', num: 19, name: 'FindAllImages', title: 'FindAllImages - Find all images in a list', category: 'Image Detection', func: 'FindAllImages(images, conf)' },
    { id: 'findmulti', num: 20, name: 'Findmulti', title: 'Findmulti - Find one image among many (loop)', category: 'Image Detection', func: 'Findmulti(images, conf)' },
    { id: 'findposclick', num: 21, name: 'FindPosClick', title: 'FindPosClick - Search and click (infinite loop)', category: 'Search & Click Loops', func: 'FindPosClick(image, conf)' },
    { id: 'findposclicksound', num: 22, name: 'FindPosClickSound', title: 'FindPosClickSound - Search and click with sound alert', category: 'Search & Click Loops', func: 'FindPosClickSound(image, conf, max_attempts)' },
    { id: 'findposclicklist', num: 23, name: 'FindPosClickList', title: 'FindPosClickList - Search among multiple images and click', category: 'Search & Click Loops', func: 'FindPosClickList(images, conf)' },
    { id: 'findposclicklistloop', num: 24, name: 'FindPosClickListLoop', title: 'FindPosClickListLoop - Search among multiple images (loop)', category: 'Search & Click Loops', func: 'FindPosClickListLoop(images, conf)' },
    { id: 'finddoubleclick', num: 25, name: 'Finddoubleclick', title: 'Finddoubleclick - Search and double-click', category: 'Search & Click Loops', func: 'Finddoubleclick(image, conf)' },
    { id: 'findanddoubleclick', num: 26, name: 'FindAndDoubleClick', title: 'FindAndDoubleClick - Search among multiple and double-click', category: 'Search & Click Loops', func: 'FindAndDoubleClick(images, conf)' },
    { id: 'random-delay', num: 27, name: 'random_delay', title: 'Random Delay - Random wait', category: 'Utilities', func: 'random_delay(min, max)' },
    { id: 'wait-for-image', num: 28, name: 'wait_for_image', title: 'Wait For Image - Wait for image to appear', category: 'Utilities', func: 'wait_for_image(image, confidence, timeout)' },
    { id: 'long-press', num: 29, name: 'long_press', title: 'Long Press - Long press at position', category: 'Utilities', func: 'long_press(x, y, duration_ms)' },
    { id: 'long-press-image', num: 30, name: 'long_press_image', title: 'Long Press Image - Long press on image', category: 'Utilities', func: 'long_press_image(image, duration_ms, confidence)' },
    { id: 'screenshot', num: 31, name: 'screenshot', title: 'Screenshot - Capture screen', category: 'Utilities', func: 'screenshot(filename)' },
    { id: 'toggle-airplane-mode', num: 32, name: 'toggle_airplane_mode', title: 'Toggle Airplane Mode', category: 'System & Network', func: 'toggle_airplane_mode()' },
    { id: 'clear-cache', num: 33, name: 'clear_cache', title: 'Clear Cache - Clear app cache', category: 'System & Network', func: 'clear_cache(package_name)' },
    { id: 'restart-app', num: 34, name: 'restart_app', title: 'Restart App - Restart application', category: 'System & Network', func: 'restart_app(package_name)' },
  ]

  // Filter functions based on search query
  const filteredFunctions = useMemo(() => {
    if (!searchQuery.trim()) return allFunctions
    const query = searchQuery.toLowerCase()
    return allFunctions.filter(func => 
      func.name.toLowerCase().includes(query) ||
      func.title.toLowerCase().includes(query) ||
      func.category.toLowerCase().includes(query) ||
      func.func.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Scroll to function
  const scrollToFunction = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  
  return (
    <DocsLayout title="Playground - Code Blocks" toc={toc}>
      
      {/* 📸 PLACE IMAGE HERE: /public/assets/playground-editor.png */}
      {/* Description: Screenshot of the Playground editor with code blocks */}
      <div className="doc-gallery mb-8">
        <img src="/assets/editor.png" alt="Playground Editor" className="rounded-lg border border-white/10" />
      </div>

      <section id="overview" className="doc-section">
        <h2 className="doc-h2">Playground Overview</h2>
        <p className="doc-p">
          The <strong>Playground</strong> is the built-in script editor in AppsMobs. 
          It contains pre-made code blocks that you can insert with a single click.
          All these blocks are available in the left sidebar of the editor.
        </p>
        
        <div className="doc-callout bg-cyan/10 border-cyan/30">
          <strong>💡 Tip:</strong> Click on a block in the sidebar to automatically insert it 
          into your script at the cursor position.
        </div>
        
        <p className="doc-p mt-4">
          For more information about creating and running scripts, see the <Link to="/docs/scripts" className="text-cyan hover:underline">Python Scripts</Link> documentation.
        </p>
      </section>

      <hr className="doc-hr" />

      {/* ============================= */}
      {/* SEARCH AND FUNCTIONS TABLE */}
      {/* ============================= */}
      <section id="functions-table" className="doc-section">
        <h2 className="doc-h2">🔍 Search & Functions Reference</h2>
        <p className="doc-p">
          Use the search bar below to quickly find any function, or browse the complete table of all available functions.
          Click on any function name to jump directly to its detailed documentation.
        </p>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search functions... (e.g., 'click', 'Find', 'image', 'wait')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-cyan/50 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-white/60">
              Found <strong className="text-cyan">{filteredFunctions.length}</strong> function{filteredFunctions.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Functions Table */}
        <div className="doc-table-wrapper">
          <table className="doc-table">
            <thead>
              <tr>
                <th className="w-16">#</th>
                <th>Function</th>
                <th>Category</th>
                <th>Signature</th>
                <th className="w-32">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFunctions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-white/60">
                    No functions found matching "{searchQuery}". Try a different search term.
                  </td>
                </tr>
              ) : (
                filteredFunctions.map((func) => (
                  <tr key={func.id} className="hover:bg-white/5 transition-colors">
                    <td className="text-center font-mono text-white/70">{func.num}</td>
                    <td>
                      <code className="text-cyan font-semibold">{func.name}</code>
                    </td>
                    <td className="text-white/70">{func.category}</td>
                    <td>
                      <code className="text-white/60 font-mono text-sm">{func.func}</code>
                    </td>
                    <td>
                      <button
                        onClick={() => scrollToFunction(func.id)}
                        className="px-3 py-1.5 bg-cyan/20 hover:bg-cyan/30 text-cyan border border-cyan/30 rounded text-sm transition-all hover:scale-105"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="doc-callout bg-blue-500/10 border-blue-500/30 mt-6">
          <strong>💡 Quick Tips:</strong>
          <ul className="doc-list mt-2">
            <li>Search by function name (e.g., "click", "Find"), category (e.g., "Image Detection"), or signature</li>
            <li>Click "View Details" to jump directly to the function's complete documentation</li>
            <li>Use keyboard shortcuts: Focus the search bar and type to filter instantly</li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      {/* ============================= */}
      {/* BASIC CONTROLS */}
      {/* ============================= */}
      <section id="basic-controls" className="doc-section">
        <h2 className="doc-h2">🎮 Basic Controls</h2>
        <p className="doc-p">
          These functions allow you to interact directly with the Android screen.
        </p>

        <div className="doc-subsection" id="click">
          <h3 className="doc-h3">1. Click - Single tap</h3>
          <p className="doc-p">
            Performs a click at a specific screen position. Coordinates are in pixels.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Click at position (x, y)
click(540, 960)

# Example: Click at screen center (1920x1080)
click(960, 540)

# Example: Click a button in bottom right
click(1800, 1000)`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>x</code></td><td>int</td><td>Horizontal position (0 = left)</td></tr>
                <tr><td><code>y</code></td><td>int</td><td>Vertical position (0 = top)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="doc-subsection mt-6" id="doubleclick">
          <h3 className="doc-h3">2. Double Click - Double tap</h3>
          <p className="doc-p">
            Performs two quick taps at the same location. Useful for opening applications or quick validation.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Double click at position (x, y)
doubleclick(540, 960)

# Example: Double click on an app icon
doubleclick(200, 300)`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6" id="write">
          <h3 className="doc-h3">3. Write - Type text</h3>
          <p className="doc-p">
            Types text as if using a virtual keyboard. Useful for filling forms.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Type text
write("Hello AppsMobs!")

# Example: Fill an email field
write("user@example.com")

# Example: Type a password
write("my_password_123")`}</code></pre>
          </div>
          
          <div className="doc-note">
            ⚠️ Text is typed character by character with a slight delay to simulate human input.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="swipe">
          <h3 className="doc-h3">4. Swipe - Custom swipe</h3>
          <p className="doc-p">
            Performs a swipe from point A to point B with customizable duration.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Swipe from (x1, y1) to (x2, y2)
swipe(500, 800, 500, 400, duration=500)

# Example: Scroll up (from bottom to top)
swipe(540, 1600, 540, 800, duration=700)

# Example: Scroll down (from top to bottom)
swipe(540, 800, 540, 1600, duration=700)

# Example: Horizontal swipe left
swipe(1200, 540, 400, 540, duration=500)`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th></tr>
              </thead>
              <tbody>
                <tr><td><code>x1</code></td><td>int</td><td>Start X position</td><td>-</td></tr>
                <tr><td><code>y1</code></td><td>int</td><td>Start Y position</td><td>-</td></tr>
                <tr><td><code>x2</code></td><td>int</td><td>End X position</td><td>-</td></tr>
                <tr><td><code>y2</code></td><td>int</td><td>End Y position</td><td>-</td></tr>
                <tr><td><code>duration</code></td><td>int</td><td>Duration in milliseconds</td><td>500</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      {/* ============================= */}
      {/* NAVIGATION */}
      {/* ============================= */}
      <section id="navigation" className="doc-section">
        <h2 className="doc-h2">🧭 Navigation</h2>
        <p className="doc-p">
          Functions for navigating the Android interface.
        </p>

        <div className="doc-subsection" id="back">
          <h3 className="doc-h3">5. Back - Back button</h3>
          <div className="doc-code">
            <pre><code className="language-python">{`# Press the back button
back()

# Example: Go back to previous screen
back()`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6" id="home">
          <h3 className="doc-h3">6. Home - Home button</h3>
          <div className="doc-code">
            <pre><code className="language-python">{`# Return to home screen
home()

# Example: Close an app and return home
home()`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6" id="enter">
          <h3 className="doc-h3">7. Enter - Enter key</h3>
          <div className="doc-code">
            <pre><code className="language-python">{`# Press enter
enter()
# or
entre()

# Example: Submit a form
write("my text")
enter()`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6" id="switch">
          <h3 className="doc-h3">8. Switch - Switch application</h3>
          <div className="doc-code">
            <pre><code className="language-python">{`# Open recent apps menu
switch()

# Example: Switch between two apps
switch()
sleep(1)
# Next app appears`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6" id="sleep">
          <h3 className="doc-h3">9. Sleep - Wait</h3>
          <div className="doc-code">
            <pre><code className="language-python">{`# Wait for a number of seconds
sleep(2)  # Wait 2 seconds
sleep(0.5)  # Wait 500ms

# Example: Wait for animation to finish
click(540, 960)
sleep(2)
back()`}</code></pre>
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      {/* ============================= */}
      {/* DIRECTIONAL SWIPES */}
      {/* ============================= */}
      <section id="swipes" className="doc-section">
        <h2 className="doc-h2">📱 Directional Swipes</h2>
        <p className="doc-p">
          Predefined swipes with random variation to simulate human behavior.
        </p>

        <div className="doc-subsection" id="swipe-up">
          <h3 className="doc-h3">10. Swipe Up - Scroll up</h3>
          <div className="doc-code">
            <pre><code className="language-python">{`# Scroll up (swipe from bottom to top)
swipe_up()
# or
upswipe()

# Example: Scroll in a list
swipe_up()
sleep(1)
swipe_up()`}</code></pre>
          </div>
          
          <div className="doc-note">
            💡 The position varies randomly to avoid bot detection.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="swipe-down">
          <h3 className="doc-h3">11. Swipe Down - Scroll down</h3>
          <div className="doc-code">
            <pre><code className="language-python">{`# Scroll down
swipe_down()
# or
downswipe()

# Example: Go back to top of page
swipe_down()`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6" id="swipe-left">
          <h3 className="doc-h3">12. Swipe Left - Scroll left</h3>
          <div className="doc-code">
            <pre><code className="language-python">{`# Scroll left
swipe_left()
# or
leftswipe()

# Example: Navigate a carousel
swipe_left()
sleep(0.5)
swipe_left()`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6" id="swipe-right">
          <h3 className="doc-h3">13. Swipe Right - Scroll right</h3>
          <div className="doc-code">
            <pre><code className="language-python">{`# Scroll right
swipe_right()
# or
rightswipe()

# Example: Go back to previous page in carousel
swipe_right()`}</code></pre>
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      {/* ============================= */}
      {/* IMAGE DETECTION */}
      {/* ============================= */}
      <section id="image-detection" className="doc-section">
        <h2 className="doc-h2">🔍 Image Detection</h2>
        <p className="doc-p">
          Uses computer vision to find elements on screen. 
          Images must be in your script's <code>scripts/img/</code> folder.
        </p>

        <div className="doc-callout bg-purple-500/10 border-purple-500/30">
          <strong>📚 Learn more:</strong> See the <Link to="/docs/scripts#images" className="text-cyan hover:underline">Images Guide</Link> section 
          in <Link to="/docs/scripts" className="text-cyan hover:underline">Python Scripts</Link> for details on organizing image files.
        </div>

        <div className="doc-subsection" id="find">
          <h3 className="doc-h3">14. Find - Find image (infinite loop)</h3>
          <p className="doc-p">
            Searches for an image until found. This function never stops.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Search for an image until found
x, y = Find("button.png", 0.8)

# Example: Wait for a button to appear
x, y = Find("start_button.png", 0.9)
click(x, y)`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>image</code></td><td>str</td><td>Path to image (relative to scripts/img/)</td></tr>
                <tr><td><code>conf</code></td><td>float</td><td>Confidence (0.0-1.0), e.g. 0.8 = 80%</td></tr>
                <tr><td><code>region</code></td><td>tuple</td><td>Optional: (x, y, width, height)</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-warning bg-yellow-500/20 border-yellow-500/50">
            ⚠️ This function loops infinitely. Use with caution or in a separate thread.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="findd">
          <h3 className="doc-h3">15. Findd - Find image (once)</h3>
          <p className="doc-p">
            Searches for an image <strong>once</strong> on the screen. Returns coordinates <code>(x, y)</code> if found, 
            or <code>False</code> if not found. This is the non-looping version of <code>Find</code> - it performs a single search 
            attempt and returns immediately.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Search for an image once
result = Findd("button.png", 0.8)

if result:
    x, y = result
    click(x, y)
else:
    print("Button not found")`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>image</code></td><td>str</td><td>Path to image (relative to scripts/img/)</td></tr>
                <tr><td><code>conf</code></td><td>float</td><td>Confidence threshold (0.0-1.0)</td></tr>
                <tr><td><code>region</code></td><td>tuple</td><td>Optional: (x, y, width, height) search area</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use <code>Findd</code> when you want to check if an element exists without blocking, 
            or when you need conditional logic based on whether an image is found. Unlike <code>Find</code>, this won't loop infinitely.
          </div>
          
          <div className="doc-note">
            <strong>📝 Return value:</strong> Returns <code>(x, y)</code> tuple if found, <code>False</code> if not found. 
            Use <code>if result:</code> to check, but note that <code>(0, 0)</code> is a valid coordinate - use <code>result is not False</code> for strict checking.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="finddd">
          <h3 className="doc-h3">16. Finddd - Find image (returns None)</h3>
          <p className="doc-p">
            Similar to <code>Findd</code> but returns <code>None</code> instead of <code>False</code> when not found. 
            This makes it easier to use with Python's <code>is None</code> checks and avoids confusion with coordinate <code>(0, 0)</code>.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Search for an image
pos = Finddd("icon.png", 0.8)

if pos is not None:
    x, y = pos
    click(x, y)
else:
    print("Icon not found")`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>image</code></td><td>str</td><td>Path to image (relative to scripts/img/)</td></tr>
                <tr><td><code>conf</code></td><td>float</td><td>Confidence threshold (0.0-1.0)</td></tr>
                <tr><td><code>region</code></td><td>tuple</td><td>Optional: (x, y, width, height) search area</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use <code>Finddd</code> instead of <code>Findd</code> if you prefer <code>None</code> 
            over <code>False</code>, especially when working with coordinates where <code>(0, 0)</code> might be a valid position. 
            <code>pos is not None</code> is more explicit than checking truthiness.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="findtf">
          <h3 className="doc-h3">17. Findtf - Check if image exists (boolean)</h3>
          <p className="doc-p">
            Checks if an image exists on screen and returns <code>True</code> or <code>False</code>. 
            This function doesn't return coordinates - it only tells you whether the image is present. 
            Perfect for conditional logic when you don't need the exact position.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Check if an image exists
exists = Findtf("loading.png", 0.8)

if exists:
    print("Loading in progress...")
    sleep(2)
else:
    print("Loading complete")

# Example: Wait until loading disappears
while Findtf("loading.png", 0.8):
    sleep(0.5)
print("Page loaded!")`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>image</code></td><td>str</td><td>Path to image (relative to scripts/img/)</td></tr>
                <tr><td><code>conf</code></td><td>float</td><td>Confidence threshold (0.0-1.0)</td></tr>
                <tr><td><code>region</code></td><td>tuple</td><td>Optional: (x, y, width, height) search area</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use <code>Findtf</code> when you only need to know if something exists, 
            not where it is. Faster than <code>Findd</code> when you don't need coordinates. Ideal for waiting loops 
            or checking if popups/loading indicators are present.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="findtfmultiple">
          <h3 className="doc-h3">18. Findtfmultiple - Check multiple images</h3>
          <p className="doc-p">
            Checks if <strong>at least one</strong> image from a list exists on screen. Returns <code>True</code> as soon as 
            it finds the first matching image, or <code>False</code> if none are found. Searches images in the order provided.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Check if any image exists
images = ["error.png", "warning.png", "success.png"]
found = Findtfmultiple(images, 0.8)

if found:
    print("An image was found!")
else:
    print("No images found")

# Example: Check for different popup types
popups = ["close_button.png", "ok_button.png", "cancel.png"]
if Findtfmultiple(popups, 0.8):
    FindPosClickList(popups, 0.8)  # Close whichever is found`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>images</code></td><td>list</td><td>List of image paths to search</td></tr>
                <tr><td><code>conf</code></td><td>float</td><td>Confidence threshold (applied to all images)</td></tr>
                <tr><td><code>region</code></td><td>tuple</td><td>Optional: (x, y, width, height) search area</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use when you need to check if any of several possible images exist, 
            such as different types of error messages, popup variants, or UI states. More efficient than calling 
            <code>Findtf</code> multiple times in a loop.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="findallimages">
          <h3 className="doc-h3">19. FindAllImages - Find all images in a list</h3>
          <p className="doc-p">
            Searches <strong>all</strong> images in a list and returns a dictionary mapping each image name to its position. 
            If an image is not found, its value in the dictionary is <code>None</code>. This is useful when you need to check 
            multiple elements at once and decide which one to interact with.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Search multiple images
images = ["button1.png", "button2.png", "button3.png"]
results = FindAllImages(images, 0.8)

# Result: {"button1.png": (x1, y1), "button2.png": None, "button3.png": (x3, y3)}
for image, pos in results.items():
    if pos:
        x, y = pos
        print(f"{image} found at ({x}, {y})")
        click(x, y)
        break

# Example: Check which menu items are visible
menu_items = ["home.png", "settings.png", "profile.png", "logout.png"]
visible = FindAllImages(menu_items, 0.8)

if visible["logout.png"]:
    click(*visible["logout.png"])  # Click logout if visible`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>images</code></td><td>list</td><td>List of image paths to search</td></tr>
                <tr><td><code>conf</code></td><td>float</td><td>Confidence threshold (applied to all images)</td></tr>
                <tr><td><code>region</code></td><td>tuple</td><td>Optional: (x, y, width, height) search area</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use <code>FindAllImages</code> when you need to check the state of multiple UI elements 
            simultaneously, or when you want to choose which element to interact with based on what's visible. More efficient than 
            multiple individual <code>Findd</code> calls.
          </div>
          
          <div className="doc-note">
            <strong>📝 Return format:</strong> Returns a dictionary like <code>{`{"image1.png": (x, y), "image2.png": None}`}</code>. 
            Each image maps to either <code>(x, y)</code> coordinates or <code>None</code> if not found.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="findmulti">
          <h3 className="doc-h3">20. Findmulti - Find one image among many (loop)</h3>
          <p className="doc-p">
            Searches for <strong>one</strong> image from a list in an <strong>infinite loop</strong> until any image is found. 
            Checks all images in the list repeatedly, returning coordinates as soon as the first match is detected. 
            This is the multi-image version of <code>Find</code> - it loops infinitely until one image appears.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Search for one image among many (infinite loop)
images = ["popup1.png", "popup2.png", "popup3.png"]
x, y = Findmulti(images, 0.8)

# Returns as soon as one image is found
click(x, y)

# Example: Wait for any notification popup
popups = ["error_popup.png", "success_popup.png", "warning_popup.png"]
x, y = Findmulti(popups, 0.8)
FindPosClick(popups, 0.8)  # Click whichever appears`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>images</code></td><td>list</td><td>List of image paths to search</td></tr>
                <tr><td><code>conf</code></td><td>float</td><td>Confidence threshold (applied to all images)</td></tr>
                <tr><td><code>region</code></td><td>tuple</td><td>Optional: (x, y, width, height) search area</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-warning bg-yellow-500/20 border-yellow-500/50">
            <strong>⚠️ Infinite Loop:</strong> This function loops indefinitely until one image is found. Use with caution 
            and ensure one of the images will eventually appear, or run in a separate thread with a timeout mechanism.
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use when you expect one of several possible images to appear (e.g., different popup types, 
            multiple success indicators) and you want to wait indefinitely until any one appears. Consider using <code>wait_for_image</code> 
            with a timeout if you need time limits.
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      {/* ============================= */}
      {/* SEARCH & CLICK LOOPS */}
      {/* ============================= */}
      <section id="loops" className="doc-section">
        <h2 className="doc-h2">🔄 Search & Click Loops</h2>
        <p className="doc-p">
          These functions combine image search and automatic clicking.
        </p>

        <div className="doc-subsection" id="findposclick">
          <h3 className="doc-h3">21. FindPosClick - Search and click (infinite loop)</h3>
          <p className="doc-p">
            Searches for an image in an <strong>infinite loop</strong> and clicks it automatically as soon as it's found. 
            This combines <code>Find</code> and <code>click</code> into a single function that waits until the image appears, 
            then clicks it immediately. The function loops indefinitely until the image is detected.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Search and click on an image (waits until found)
FindPosClick("continue_button.png", 0.8)

# With offset to click next to the image (useful for buttons with text)
FindPosClick("button.png", 0.8, xp=10, yp=-5)

# Example: Wait for and click "Play" button
FindPosClick("play_button.png", 0.9)

# Example: Click with offset to avoid overlapping elements
FindPosClick("icon.png", 0.85, xp=5, yp=-3)`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>image</code></td><td>str</td><td>Path to image (relative to scripts/img/)</td></tr>
                <tr><td><code>conf</code></td><td>float</td><td>Confidence threshold (0.0-1.0)</td></tr>
                <tr><td><code>region</code></td><td>tuple</td><td>Optional: (x, y, width, height) search area</td></tr>
                <tr><td><code>xp</code></td><td>int</td><td>X offset for click position (default: 0). Positive = right, negative = left</td></tr>
                <tr><td><code>yp</code></td><td>int</td><td>Y offset for click position (default: 0). Positive = down, negative = up</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-warning bg-yellow-500/20 border-yellow-500/50">
            <strong>⚠️ Infinite Loop:</strong> This function loops indefinitely until the image is found. 
            Ensure the image will eventually appear, or use <code>FindPosClickSound</code> for timeout alerts.
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use when you need to wait for a button or element to appear and click it immediately. 
            Common use cases: waiting for loading to complete, waiting for popups, clicking dynamic buttons that appear after delays.
          </div>
          
          <div className="doc-note">
            <strong>📝 Click offset:</strong> Use <code>xp</code> and <code>yp</code> to adjust the click position. 
            This is useful when the image detection finds the center, but you need to click a specific part (e.g., text label, 
            corner of button). A small random variation is automatically added to simulate human clicks.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="findposclicksound">
          <h3 className="doc-h3">22. FindPosClickSound - Search and click with sound alert</h3>
          <p className="doc-p">
            Similar to <code>FindPosClick</code> but plays an <strong>alarm sound</strong> if the image is not found after 
            a specified number of attempts. This is useful for monitoring critical operations where you need to be alerted 
            if something goes wrong. After playing the sound, it continues searching.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Search with sound alert after 20 attempts
FindPosClickSound("important_button.png", 0.8, max_attempts=20)

# Useful for detecting problems or stuck operations
FindPosClickSound("error.png", 0.9, max_attempts=30)

# Example: Monitor a critical step
FindPosClickSound("continue_button.png", 0.85, max_attempts=15)
# Alarm plays if button doesn't appear after 15 searches`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>image</code></td><td>str</td><td>Path to image (relative to scripts/img/)</td></tr>
                <tr><td><code>conf</code></td><td>float</td><td>Confidence threshold (0.0-1.0)</td></tr>
                <tr><td><code>region</code></td><td>tuple</td><td>Optional: (x, y, width, height) search area</td></tr>
                <tr><td><code>xp</code></td><td>int</td><td>X offset for click (default: 0)</td></tr>
                <tr><td><code>yp</code></td><td>int</td><td>Y offset for click (default: 0)</td></tr>
                <tr><td><code>max_attempts</code></td><td>int</td><td>Number of searches before playing alarm (default: 20)</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-warning bg-yellow-500/20 border-yellow-500/50">
            <strong>⚠️ Sound File Required:</strong> Requires <code>alarm.mp3</code> file in the script directory. 
            If the file is missing, the function will still work but won't play sound.
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use for critical operations where you need to know if something is stuck or taking too long. 
            Ideal for monitoring automated processes, detecting errors, or alerting when expected elements don't appear within a reasonable time.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="findposclicklist">
          <h3 className="doc-h3">23. FindPosClickList - Search among multiple images and click</h3>
          <p className="doc-p">
            Searches through a list of images and clicks the <strong>first one found</strong>. This performs a single search pass 
            through all images in the list. If none are found, the function completes without clicking. Unlike the loop version, 
            this only tries once per image.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Search among multiple images (one attempt)
images = ["ok.png", "confirm.png", "validate.png"]
FindPosClickList(images, 0.8)

# Example: Handle different confirmation button variants
buttons = ["yes.png", "ok.png", "accept.png"]
FindPosClickList(buttons, 0.85)

# Example: Close any popup variant
popups = ["close_x.png", "close_button.png", "dismiss.png"]
FindPosClickList(popups, 0.8)`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>images</code></td><td>list</td><td>List of image paths to search</td></tr>
                <tr><td><code>conf</code></td><td>float</td><td>Confidence threshold (applied to all images)</td></tr>
                <tr><td><code>region</code></td><td>tuple</td><td>Optional: (x, y, width, height) search area</td></tr>
                <tr><td><code>xp</code></td><td>int</td><td>X offset for click (default: 0)</td></tr>
                <tr><td><code>yp</code></td><td>int</td><td>Y offset for click (default: 0)</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use when you have multiple possible button variants (e.g., different languages, 
            different UI themes) and want to click whichever one is present. Searches images in order and clicks the first match. 
            If you need to wait for any image to appear, use <code>FindPosClickListLoop</code> instead.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="findposclicklistloop">
          <h3 className="doc-h3">24. FindPosClickListLoop - Search among multiple images (loop)</h3>
          <p className="doc-p">
            Loops <strong>indefinitely</strong> searching through a list of images until one is found, then clicks it immediately. 
            This is the multi-image version of <code>FindPosClick</code> - it keeps searching through all images in the list 
            repeatedly until any one appears.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Infinite loop on multiple images
images = ["popup1.png", "popup2.png", "close.png"]
FindPosClickListLoop(images, 0.8)

# Example: Wait for any notification popup variant
notifications = ["error.png", "success.png", "warning.png", "info.png"]
FindPosClickListLoop(notifications, 0.85)

# Example: Handle different popup close buttons
close_buttons = ["x_button.png", "close.png", "dismiss.png", "ok.png"]
FindPosClickListLoop(close_buttons, 0.8)`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>images</code></td><td>list</td><td>List of image paths to search</td></tr>
                <tr><td><code>conf</code></td><td>float</td><td>Confidence threshold (applied to all images)</td></tr>
                <tr><td><code>region</code></td><td>tuple</td><td>Optional: (x, y, width, height) search area</td></tr>
                <tr><td><code>xp</code></td><td>int</td><td>X offset for click (default: 0)</td></tr>
                <tr><td><code>yp</code></td><td>int</td><td>Y offset for click (default: 0)</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-warning bg-yellow-500/20 border-yellow-500/50">
            <strong>⚠️ Infinite Loop:</strong> This function loops indefinitely until one image from the list is found. 
            Ensure at least one image will eventually appear, or use a timeout mechanism.
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use when you expect one of several possible images to appear (e.g., different popup types, 
            multiple button variants) and you need to wait indefinitely until any one appears, then click it immediately.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="finddoubleclick">
          <h3 className="doc-h3">25. Finddoubleclick - Search and double-click</h3>
          <p className="doc-p">
            Searches for an image in an <strong>infinite loop</strong> and performs a <strong>double-click</strong> as soon as it's found. 
            This is useful for opening applications (which often require double-clicking on desktop/launcher), selecting items, 
            or performing actions that require a double-tap gesture.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Search for an image and double-click (waits until found)
Finddoubleclick("app_icon.png", 0.8)

# Example: Open an app from launcher
Finddoubleclick("chrome_icon.png", 0.9)

# Example: Double-click to select/edit text
Finddoubleclick("text_field.png", 0.85)`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>image</code></td><td>str</td><td>Path to image (relative to scripts/img/)</td></tr>
                <tr><td><code>conf</code></td><td>float</td><td>Confidence threshold (0.0-1.0)</td></tr>
                <tr><td><code>region</code></td><td>tuple</td><td>Optional: (x, y, width, height) search area</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-warning bg-yellow-500/20 border-yellow-500/50">
            <strong>⚠️ Infinite Loop:</strong> This function loops indefinitely until the image is found. Ensure the image will eventually appear.
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use when you need to double-click on an element (e.g., opening apps, selecting text, 
            opening context menus). Unlike single-click functions, double-click is often required for specific UI interactions.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="findanddoubleclick">
          <h3 className="doc-h3">26. FindAndDoubleClick - Search among multiple and double-click</h3>
          <p className="doc-p">
            Searches through a list of images in an <strong>infinite loop</strong> and double-clicks the <strong>first one found</strong>. 
            This is the multi-image version of <code>Finddoubleclick</code>. It continuously searches through all images in the list 
            until any one appears, then double-clicks it.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Double-click on first image found (waits until one appears)
images = ["icon1.png", "icon2.png"]
FindAndDoubleClick(images, 0.8)

# Example: Open any app from multiple variants
app_icons = ["app_v1.png", "app_v2.png", "app_v3.png"]
FindAndDoubleClick(app_icons, 0.85)

# Example: Handle different launcher icon styles
launcher_icons = ["icon_normal.png", "icon_dark.png", "icon_light.png"]
FindAndDoubleClick(launcher_icons, 0.9)`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>images</code></td><td>list</td><td>List of image paths to search</td></tr>
                <tr><td><code>conf</code></td><td>float</td><td>Confidence threshold (applied to all images)</td></tr>
                <tr><td><code>region</code></td><td>tuple</td><td>Optional: (x, y, width, height) search area</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-warning bg-yellow-500/20 border-yellow-500/50">
            <strong>⚠️ Infinite Loop:</strong> This function loops indefinitely until one image from the list is found. 
            Ensure at least one image will eventually appear.
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use when you have multiple possible icon/image variants and need to double-click whichever one appears. 
            Ideal for handling different app versions, themes, or UI variants that require double-click interaction.
          </div>
          
          <div className="doc-note">
            <strong>📝 Difference from Finddoubleclick:</strong> <code>Finddoubleclick</code> searches for ONE specific image, 
            while <code>FindAndDoubleClick</code> searches among MULTIPLE images and double-clicks whichever appears first.
          </div>
        </div>

      </section>

      <hr className="doc-hr" />

      {/* ============================= */}
      {/* UTILITIES */}
      {/* ============================= */}
      <section id="utilities" className="doc-section">
        <h2 className="doc-h2">🛠️ Advanced Utilities</h2>

        <div className="doc-subsection" id="random-delay">
          <h3 className="doc-h3">27. Random Delay - Random wait</h3>
          <p className="doc-p">
            Waits for a <strong>random time</strong> between min and max seconds. This introduces natural variation in timing 
            to simulate human behavior and avoid detection as a bot. The delay is uniformly distributed between the min and max values.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Wait between 0.5 and 1.5 seconds (random)
random_delay(0.5, 1.5)

# Example: Realistic variations between actions
click(540, 960)
random_delay(1, 3)  # Variable wait (1-3 seconds)
swipe_up()
random_delay(0.5, 1)  # Short variable wait

# Example: Simulate human reading time
FindPosClick("button.png", 0.8)
random_delay(2, 4)  # Wait 2-4 seconds as if reading
write("text")`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>min_seconds</code></td><td>float</td><td>Minimum wait time in seconds</td></tr>
                <tr><td><code>max_seconds</code></td><td>float</td><td>Maximum wait time in seconds</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use between actions to simulate human behavior. Essential for avoiding bot detection 
            and making automation appear more natural. Recommended after clicks, swipes, and text input.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="wait-for-image">
          <h3 className="doc-h3">28. Wait For Image - Wait for image to appear</h3>
          <p className="doc-p">
            Waits for an image to appear on screen with a <strong>timeout</strong>. Unlike <code>Find</code> which loops infinitely, 
            this function stops after the timeout period if the image is not found. Returns coordinates if found, <code>None</code> if timeout.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Wait up to 30 seconds for image to appear
pos = wait_for_image("loading_complete.png", confidence=0.8, timeout=30)

if pos:
    x, y = pos
    click(x, y)
else:
    print("Timeout: Image did not appear")

# Example: Wait for page load with short timeout
pos = wait_for_image("page_loaded.png", confidence=0.85, timeout=10)
if not pos:
    print("Page took too long to load")
    return

# Example: Wait for specific region
pos = wait_for_image("button.png", confidence=0.8, timeout=15, region=(100, 200, 400, 300))`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>image_path</code></td><td>str</td><td>Path to image (relative to scripts/img/)</td></tr>
                <tr><td><code>confidence</code></td><td>float</td><td>Confidence threshold (0.0-1.0), default: 0.8</td></tr>
                <tr><td><code>timeout</code></td><td>int</td><td>Maximum wait time in seconds, default: 30</td></tr>
                <tr><td><code>region</code></td><td>tuple</td><td>Optional: (x, y, width, height) search area</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use when you need to wait for an element but want to avoid infinite loops. 
            Perfect for waiting for loading indicators, page transitions, or conditional elements that may or may not appear. 
            Safer than <code>Find</code> because it has a timeout.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="long-press">
          <h3 className="doc-h3">29. Long Press - Long press at position</h3>
          <p className="doc-p">
            Performs a <strong>long press</strong> (hold) at a specific screen position. The duration is specified in milliseconds. 
            This is the coordinate-based version - you provide exact (x, y) coordinates rather than searching for an image.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Long press for 1 second (1000ms) at position
long_press(540, 960, duration_ms=1000)

# Example: Open context menu (2 seconds)
long_press(500, 800, duration_ms=2000)

# Example: Start dragging from a known position
long_press(300, 600, duration_ms=1500)
sleep(0.3)
swipe(300, 600, 300, 300)  # Drag after long press`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>x</code></td><td>int</td><td>Horizontal position (pixels)</td></tr>
                <tr><td><code>y</code></td><td>int</td><td>Vertical position (pixels)</td></tr>
                <tr><td><code>duration_ms</code></td><td>int</td><td>Duration of long press in <strong>milliseconds</strong> (default: 1000)</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use when you know the exact coordinates where you want to long press. 
            For image-based long press, use <code>long_press_image</code> (function 30).
          </div>
        </div>

        <div className="doc-subsection mt-6" id="long-press-image">
          <h3 className="doc-h3">30. Long Press Image - Long press on image</h3>
          <p className="doc-p">
            Searches for an image and performs a <strong>long press</strong> on it if found. This combines image detection 
            with long press action. The function searches once and performs the long press if the image is found.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Find an image and long press on it
long_press_image("item.png", duration_ms=1500, confidence=0.8)

# Example: Open context menu on an item
long_press_image("menu_item.png", duration_ms=2000, confidence=0.85)

# Example: Select text by long pressing
long_press_image("text_field.png", duration_ms=1000, confidence=0.9)`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>image_path</code></td><td>str</td><td>Path to image (relative to scripts/img/)</td></tr>
                <tr><td><code>duration_ms</code></td><td>int</td><td>Duration of long press in <strong>milliseconds</strong> (default: 1000)</td></tr>
                <tr><td><code>confidence</code></td><td>float</td><td>Confidence threshold (0.0-1.0), default: 0.8</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use when you need to long press on an element identified by image, 
            such as context menus, item selection, or drag handles. If the image is not found, the function returns without action.
          </div>
          
        </div>

        <div className="doc-subsection mt-6" id="screenshot">
          <h3 className="doc-h3">31. Screenshot - Capture screen</h3>
          <p className="doc-p">
            Captures a screenshot of the current device screen and saves it to a file. Useful for debugging, documentation, 
            or verifying script execution. Screenshots are saved automatically by the system.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Capture the screen
screenshot("capture.png")

# Example: Capture before and after an action
screenshot("before.png")
click(540, 960)
sleep(2)
screenshot("after.png")

# Example: Document error states
if Findtf("error.png", 0.8):
    screenshot("error_state.png")
    print("Error detected, screenshot saved")`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>filename</code></td><td>str</td><td>Name/path for screenshot file (default: "screenshot.png")</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use for debugging script issues, documenting automation results, 
            creating reference images for detection, or capturing error states. Screenshots are automatically saved 
            by the AppsMobs system.
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      {/* ============================= */}
      {/* SYSTEM & NETWORK */}
      {/* ============================= */}
      <section id="system" className="doc-section">
        <h2 className="doc-h2">⚙️ System & Network</h2>

        <div className="doc-subsection" id="toggle-airplane-mode">
          <h3 className="doc-h3">32. Toggle Airplane Mode</h3>
          <p className="doc-p">
            Toggles airplane mode ON and then OFF to reset network connections. This automatically enables airplane mode, 
            waits 3 seconds, then disables it and waits 4 seconds. Useful for resetting Wi-Fi, Bluetooth, and mobile data connections.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Enable then disable airplane mode (resets network)
toggle_airplane_mode()

# Useful for resetting network connection when stuck
toggle_airplane_mode()
sleep(2)
# Network should be reset and reconnected

# Example: Use when network operations fail
if not Findtf("connected.png", 0.8):
    toggle_airplane_mode()  # Reset network
    sleep(5)  # Wait for reconnection`}</code></pre>
          </div>
          
          <div className="doc-warning bg-yellow-500/20 border-yellow-500/50">
            <strong>⚠️ Timing:</strong> This function automatically handles timing:
            <ul className="doc-list mt-2">
              <li>Enables airplane mode</li>
              <li>Waits 3 seconds</li>
              <li>Disables airplane mode</li>
              <li>Waits 4 seconds (total ~7 seconds)</li>
            </ul>
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use when network connections are stuck, apps can't connect, or you need to reset 
            Wi-Fi/Bluetooth/mobile data. Common use case: reset network before retrying failed operations.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="clear-cache">
          <h3 className="doc-h3">33. Clear Cache - Clear app cache</h3>
          <p className="doc-p">
            Clears the cache for a specific Android application by package name. This removes cached data, temporary files, 
            and can help resolve app issues or reset app state. Requires the app's package name (e.g., "com.android.chrome").
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Clear an app's cache
clear_cache("com.android.chrome")

# Example: Clear cache for specific app
clear_cache("com.example.myapp")

# Example: Reset app state before automation
clear_cache("com.example.game")
sleep(1)
restart_app("com.example.game")

# Common package names:
# Chrome: "com.android.chrome"
# YouTube: "com.google.android.youtube"
# Gmail: "com.google.android.gm"`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>package_name</code></td><td>str</td><td>Android package name (e.g., "com.android.chrome"), default: "com.android.chrome"</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use to reset app state, clear stored data, or troubleshoot app issues. 
            Often used before restarting an app or when app behavior is inconsistent. Does not delete user data, only cache.
          </div>
        </div>

        <div className="doc-subsection mt-6" id="restart-app">
          <h3 className="doc-h3">34. Restart App - Restart application</h3>
          <p className="doc-p">
            Restarts an Android application by package name. This forces the app to close completely and then reopens it. 
            The function goes to home screen, trims caches, and launches the app's main activity.
          </p>
          
          <div className="doc-code">
            <pre><code className="language-python">{`# Restart an application
restart_app("com.example.myapp")

# Example: Restart Chrome
restart_app("com.android.chrome")

# Example: Reset app state completely
clear_cache("com.example.game")
restart_app("com.example.game")
sleep(3)  # Wait for app to fully load

# Example: Restart after error
if Findtf("error.png", 0.8):
    restart_app("com.example.myapp")
    sleep(3)
    # Try again`}</code></pre>
          </div>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>package_name</code></td><td>str</td><td>Android package name (e.g., "com.example.app"), default: "com.example.app"</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="doc-note">
            <strong>💡 When to use:</strong> Use when an app is frozen, unresponsive, or needs a fresh start. 
            Often combined with <code>clear_cache</code> for a complete reset. After restarting, wait a few seconds 
            for the app to fully load before continuing automation.
          </div>
          
          <div className="doc-note">
            <strong>📝 How it works:</strong> The function presses home, trims caches, and launches the main activity. 
            This ensures a clean restart rather than just bringing the app to foreground.
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      {/* ============================= */}
      {/* COMPLETE EXAMPLES */}
      {/* ============================= */}
      <section id="examples" className="doc-section">
        <h2 className="doc-h2">💡 Complete Examples</h2>

        <div className="doc-subsection">
          <h3 className="doc-h3">Example 1: Open an app and interact</h3>
          <div className="doc-code">
            <pre><code className="language-python">{`# Open an app and click a button
def my_script(android_client, device_serial, **kwargs):
    result = {'success': False, 'message': '', 'data': {}}
    
    try:
        # 1. Go to home
        home()
        sleep(1)
        
        # 2. Find and click app icon
        FindPosClick("app_icon.png", 0.8)
        sleep(3)  # Wait for app to open
        
        # 3. Find and click a button in the app
        FindPosClick("start_button.png", 0.9)
        sleep(2)
        
        # 4. Fill a form
        FindPosClick("username_field.png", 0.8)
        write("my_username")
        sleep(1)
        
        FindPosClick("password_field.png", 0.8)
        write("my_password")
        sleep(1)
        
        # 5. Submit
        FindPosClick("login_button.png", 0.9)
        
        result['success'] = True
        result['message'] = 'Login successful'
        
    except Exception as e:
        result['message'] = f'Error: {e}'
    
    return result`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Example 2: Auto-scroll in a list</h3>
          <div className="doc-code">
            <pre><code className="language-python">{`# Scroll in a list until finding an element
def my_script(android_client, device_serial, **kwargs):
    result = {'success': False, 'message': '', 'data': {}}
    
    try:
        max_scrolls = 10
        scrolls = 0
        
        while scrolls < max_scrolls:
            # Check if element is visible
            if Findtf("target_item.png", 0.8):
                # Found! Click it
                FindPosClick("target_item.png", 0.8)
                result['success'] = True
                result['message'] = 'Element found and clicked'
                break
            
            # Not found, scroll
            swipe_up()
            random_delay(1, 2)
            scrolls += 1
        
        if not result['success']:
            result['message'] = 'Element not found after 10 scrolls'
            
    except Exception as e:
        result['message'] = f'Error: {e}'
    
    return result`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Example 3: Handle popups automatically</h3>
          <div className="doc-code">
            <pre><code className="language-python">{`# Automatically close popups
def my_script(android_client, device_serial, **kwargs):
    result = {'success': False, 'message': '', 'data': {}}
    
    try:
        # List of possible close buttons
        close_buttons = [
            "close.png",
            "x_button.png",
            "ok_button.png",
            "skip.png"
        ]
        
        # Find and click first one found
        FindPosClickList(close_buttons, 0.8)
        sleep(1)
        
        result['success'] = True
        result['message'] = 'Popup closed'
        
    except Exception as e:
        result['message'] = f'Error: {e}'
    
    return result`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Example 4: Script with robust error handling</h3>
          <div className="doc-code">
            <pre><code className="language-python">{`# Script with multiple checks
def my_script(android_client, device_serial, **kwargs):
    result = {'success': False, 'message': '', 'data': {}}
    
    try:
        # Step 1: Verify home screen is visible
        if not Findtf("home_screen.png", 0.8):
            result['message'] = 'Home screen not detected'
            return result
        
        # Step 2: Open app
        FindPosClick("app_icon.png", 0.9)
        
        # Step 3: Wait for app to load
        pos = wait_for_image("app_loaded.png", confidence=0.8, timeout=10)
        if not pos:
            result['message'] = 'App did not load'
            return result
        
        # Step 4: Perform main action
        FindPosClick("action_button.png", 0.85)
        sleep(2)
        
        # Step 5: Verify result
        if Findtf("success.png", 0.8):
            result['success'] = True
            result['message'] = 'Action successful'
        else:
            result['message'] = 'Action failed (success indicator not found)'
            
    except Exception as e:
        result['message'] = f'Error: {e}'
    
    return result`}</code></pre>
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      {/* ============================= */}
      {/* IMAGE GUIDE */}
      {/* ============================= */}
      <section id="image-guide" className="doc-section">
        <h2 className="doc-h2">📸 Image Detection Guide</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Where to place your images</h3>
          <p className="doc-p">
            Create an <code>img/</code> folder next to your Python script:
          </p>
          
          <div className="doc-code">
            <pre><code>{`scripts/
├── my_script.py
└── img/
    ├── button.png
    ├── icon.png
    └── popup.png`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Tips for creating good images</h3>
          <ul className="doc-list">
            <li>✅ Use sharp, high-quality screenshots</li>
            <li>✅ Avoid images that are too large (200x200 pixels max recommended)</li>
            <li>✅ Capture only the element you're interested in (button, icon)</li>
            <li>✅ Use transparent background (PNG) if possible</li>
            <li>✅ Test with different confidence levels (0.7 to 0.9)</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Recommended confidence levels</h3>
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Confidence</th><th>Use Case</th></tr>
              </thead>
              <tbody>
                <tr><td><code>0.9 - 1.0</code></td><td>Unique, very specific elements (exact icons)</td></tr>
                <tr><td><code>0.8 - 0.9</code></td><td>Buttons, standard UI elements (recommended)</td></tr>
                <tr><td><code>0.7 - 0.8</code></td><td>Variable elements (texts, changing images)</td></tr>
                <tr><td><code>&lt; 0.7</code></td><td>Not recommended (too many false positives)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <p className="doc-p mt-4">
          For more details on script structure and image organization, see <Link to="/docs/scripts" className="text-cyan hover:underline">Python Scripts</Link> documentation.
        </p>
      </section>

      <hr className="doc-hr" />

      {/* ============================= */}
      {/* SCRIPT STRUCTURE */}
      {/* ============================= */}
      <section id="script-structure" className="doc-section">
        <h2 className="doc-h2">📋 Script Structure</h2>
        
        <p className="doc-p">All scripts must follow this structure:</p>
        
        <div className="doc-code">
          <pre><code className="language-python">{`def my_script(android_client, device_serial, **kwargs):
    """
    Your automation script
    
    Args:
        android_client: Instance to control device (automatically provided)
        device_serial: Device serial number (e.g. "R58M67Q75DW")
        **kwargs: Optional parameters passed from interface
    
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
        # (click, swipe, Find, etc.)
        
        click(540, 960)
        sleep(1)
        
        result['success'] = True
        result['message'] = 'Script executed successfully'
        result['data'] = {'action': 'completed'}
        
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
          Learn more about script execution and best practices in the <Link to="/docs/scripts" className="text-cyan hover:underline">Python Scripts</Link> documentation.
        </p>
      </section>
      
    </DocsLayout>
  )
}
