import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      {/* Hero Section */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hero-badge mb-6 inline-flex">
            <span className="dot" />
            <span className="label">About AppsMobs</span>
          </div>
          <h1 className="hero-title mb-6">
            Automating Android workflows, one device at a time
          </h1>
          <p className="hero-subtitle max-w-2xl mx-auto">
            AppsMobs was born from the need for a simple, powerful tool to control and automate Android devices. 
            We believe automation should be accessible to everyone.
          </p>
        </div>
      </section>

      {/* Our Mission Section */}
      <section>
        <div className="container py-16 max-w-6xl mx-auto relative">
          {/* Animated background patterns */}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.75s' }}></div>
            </div>
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `
                linear-gradient(rgba(34,211,238,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(34,211,238,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="hero-badge mb-6 inline-flex">
                <span className="dot" />
                <span className="label">Our Mission</span>
              </div>
            </div>
            <div className="how-title hero-subtitle mb-4">Our Mission</div>
            <p className="hero-subtitle text-center mb-16 max-w-3xl mx-auto">
              To provide the most intuitive and powerful platform for Android device control and automation. 
              We're committed to making automation accessible, secure, and efficient for everyone.
            </p>

            {/* Mission Values Grid */}
            <div className="how-grid mb-20">
              <div className="how-item">
                <div className="how-anim connect" aria-hidden="true">
                  <span className="device phone"></span>
                  <span className="device pc"></span>
                  <span className="link usb"></span>
                </div>
                <h4 className="how-h4">Focused</h4>
                <p className="how-p">We focus on what matters: reliable automation that works every time.</p>
              </div>

              <div className="how-item">
                <div className="how-anim control" aria-hidden="true">
                  <span className="phone"></span>
                  <span className="tap"></span>
                  <span className="screenshot"></span>
                </div>
                <h4 className="how-h4">Secure</h4>
                <p className="how-p">Your data stays local, always private. No cloud dependencies, no data collection.</p>
              </div>

              <div className="how-item">
                <div className="how-anim scripts" aria-hidden="true">
                  <div className="code-line line1">
                    <span className="char keyword">f</span>
                    <span className="char keyword">a</span>
                    <span className="char keyword">s</span>
                    <span className="char keyword">t</span>
                  </div>
                </div>
                <h4 className="how-h4">Fast</h4>
                <p className="how-p">Optimized performance for real-time control and instant script execution.</p>
              </div>

              <div className="how-item">
                <div className="how-anim logs" aria-hidden="true">
                  <span className="log l1"></span>
                  <span className="log l2"></span>
                  <span className="log l3"></span>
                  <span className="log l4"></span>
                </div>
                <h4 className="how-h4">Transparent</h4>
                <p className="how-p">Open architecture with comprehensive logs and full control over your workflows.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section>
        <div className="container py-16 max-w-6xl mx-auto relative">
          {/* Animated background patterns */}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cyan/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-emerald-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.75s' }}></div>
            </div>
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `
                linear-gradient(rgba(167,139,250,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(167,139,250,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="hero-badge mb-6 inline-flex">
                <span className="dot" />
                <span className="label">Features</span>
              </div>
            </div>
            <div className="how-title hero-subtitle mb-4">What We Offer</div>
            <p className="hero-subtitle text-center mb-16 max-w-3xl mx-auto">
              Powerful tools and features designed to make Android automation simple, secure, and efficient.
            </p>

            {/* Features Grid */}
            <div className="how-grid mb-20">
              <div className="how-item">
                <div className="how-anim connect" aria-hidden="true">
                  <span className="device phone"></span>
                  <span className="device pc"></span>
                  <span className="device phone" style={{left: '60%', animationDelay: '0.2s'}}></span>
                  <span className="link usb"></span>
                </div>
                <h4 className="how-h4">Multi-Device Control</h4>
                <p className="how-p">Manage multiple Android devices simultaneously with an intuitive unified interface.</p>
              </div>

              <div className="how-item">
                <div className="how-anim scripts" aria-hidden="true">
                  <div className="code-line line1">
                    <span className="char keyword">n</span>
                    <span className="char keyword">o</span>
                    <span className="char normal"> </span>
                    <span className="char keyword">c</span>
                    <span className="char keyword">o</span>
                    <span className="char keyword">d</span>
                    <span className="char keyword">e</span>
                  </div>
                  <div className="code-line line2"></div>
                  <div className="code-line line3">
                    <span className="char keyword">a</span>
                    <span className="char keyword">u</span>
                    <span className="char keyword">t</span>
                    <span className="char keyword">o</span>
                    <span className="char keyword">m</span>
                    <span className="char keyword">a</span>
                    <span className="char keyword">t</span>
                    <span className="char keyword">e</span>
                  </div>
                </div>
                <h4 className="how-h4">No-Code Automation</h4>
                <p className="how-p">Create powerful automation scripts without writing code. Use visual blocks or Python for advanced workflows.</p>
              </div>

              <div className="how-item">
                <div className="how-anim control" aria-hidden="true">
                  <span className="phone"></span>
                  <span className="tap"></span>
                  <span className="screenshot"></span>
                </div>
                <h4 className="how-h4">Developer Tools</h4>
                <p className="how-p">Built-in script editor with syntax highlighting, API access, and comprehensive documentation.</p>
              </div>

              <div className="how-item">
                <div className="how-anim logs" aria-hidden="true">
                  <span className="log l1"></span>
                  <span className="log l2"></span>
                  <span className="log l3"></span>
                  <span className="log l4"></span>
                </div>
                <h4 className="how-h4">Privacy First</h4>
                <p className="how-p">Everything runs locally on your machine. Complete control over your automation workflows.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section>
        <div className="container py-16 max-w-6xl mx-auto relative">
          {/* Animated background patterns */}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.75s' }}></div>
            </div>
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `
                linear-gradient(rgba(34,211,238,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(52,211,153,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="hero-badge mb-6 inline-flex">
                <span className="dot" />
                <span className="label">Why Choose Us</span>
              </div>
            </div>
            <div className="how-title hero-subtitle mb-4">Why Choose AppsMobs?</div>
            <p className="hero-subtitle text-center mb-16 max-w-3xl mx-auto">
              Built for users who demand simplicity, power, and control. Experience the difference.
            </p>

            {/* Benefits Grid */}
            <div className="how-grid mb-20">
              <div className="how-item">
                <div className="how-anim connect" aria-hidden="true">
                  <span className="device phone"></span>
                  <span className="device pc"></span>
                  <span className="link usb"></span>
                </div>
                <h4 className="how-h4">Simple & Intuitive</h4>
                <p className="how-p">User-friendly interface designed for both beginners and advanced users.</p>
              </div>

              <div className="how-item">
                <div className="how-anim scripts" aria-hidden="true">
                  <div className="code-line line1">
                    <span className="char keyword">f</span>
                    <span className="char keyword">l</span>
                    <span className="char keyword">e</span>
                    <span className="char keyword">x</span>
                    <span className="char keyword">i</span>
                    <span className="char keyword">b</span>
                    <span className="char keyword">l</span>
                    <span className="char keyword">e</span>
                  </div>
                </div>
                <h4 className="how-h4">Flexible Pricing</h4>
                <p className="how-p">Choose from Normal, Pro, or Team plans. Upgrade or downgrade anytime.</p>
              </div>

              <div className="how-item">
                <div className="how-anim control" aria-hidden="true">
                  <span className="phone"></span>
                  <span className="tap"></span>
                  <span className="screenshot"></span>
                </div>
                <h4 className="how-h4">Active Support</h4>
                <p className="how-p">Get help when you need it with priority support options and comprehensive documentation.</p>
              </div>

              <div className="how-item">
                <div className="how-anim logs" aria-hidden="true">
                  <span className="log l1"></span>
                  <span className="log l2"></span>
                  <span className="log l3"></span>
                  <span className="log l4"></span>
                </div>
                <h4 className="how-h4">Regular Updates</h4>
                <p className="how-p">Continuous improvements with new features, bug fixes, and security updates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-2xl p-12 border border-white/10 bg-gradient-to-br from-cyan/10 via-purple-500/10 to-emerald-500/10 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4 text-white">Ready to Get Started?</h2>
              <p className="text-white/80 mb-8 text-lg">
                Download AppsMobs and start automating your Android workflows today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/download" className="btn-pill cyan inline-flex items-center gap-2">
                  <svg className="btn-icon w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                  <span className="btn-label">Download Now</span>
                </Link>
                <Link to="/shop" className="btn-pill purple inline-flex items-center gap-2">
                  <svg className="btn-icon w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM1 2v2h2l3.6 7.59-1.35 2.45c-.15.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  <span className="btn-label">View Plans</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container py-12 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/60 text-sm">
            Have questions? Check our <Link to="/faq" className="text-cyan hover:text-cyan/80 transition-colors">FAQ</Link> or contact us at{' '}
            <a href="mailto:support@appsmobs.com" className="text-cyan hover:text-cyan/80 transition-colors">support@appsmobs.com</a>
          </p>
        </div>
      </section>
    </>
  );
}
