import { Link } from 'react-router-dom'
import { DOCS_URL } from '../config'
import { useEffect, useState } from 'react'
import PixelBlast from '../components/PixelBlast'

export default function Home(){
  const tabs = ['dashboard','scripts','control','security']
  const [tab, setTab] = useState('dashboard')

  const showcase = {
    dashboard: {
      label: 'Developement',
      img: '/assets/dashboard.png',
      desc: 'Plan, organize, and run your workflows with clarity. A unified panel to see devices, statuses, and actions at a glance.'
    },
    scripts: {
      label: 'No Coding',
      img: '/assets/scripts.png',
      desc: 'Build automations without code. Use ready‑made blocks, reuse, duplicate, and run instantly on selected devices.'
    },
    control: {
      label: 'Control',
      img: '/assets/control.png',
      desc: 'Launch optimized scrcpy, capture screenshots, tweak FPS/bitrate, and access essential Android controls with one click.'
    },
    security: {
      label: 'Visual Action',
      img: '/assets/console.png',
      desc: 'Trigger reliable visual actions and track results clearly. Local execution with transparent logs for full control.'
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      setTab(prev => tabs[(tabs.indexOf(prev)+1)%tabs.length])
    }, 7000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      {/* HERO */}
			<section className="hero-animated">
				<div className="container py-20">
					<div className="flex flex-col items-center text-center">
						<div className="hero-badge mb-6">
							<span className="dot" />
							<span className="label">AppsMobs AI</span>
						</div>
						<h1 className="hero-title">
							Automate better with AppsMobs
						</h1>
						<p className="hero-subtitle">
							All‑in‑one toolkit to control Android devices and launch optimized scrcpy.<br />
							Create and run automation scripts, and manage licenses with ease.
						</p>

						<div className="logo-container">
							<div className="logo-glow"></div>
							<img src="/assets/Logo.png" alt="AppsMobs Logo" className="logo-image" />
						</div>

						<div className="mt-12 flex flex-wrap gap-3 justify-center text-center">
							<a href="/downloads/BootyBot-setup.exe" className="btn-pill cyan">
								<svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
									<path d="M3 5.5L11 4v7H3V5.5zm10-1.6L21 3v8h-8V3.9zM3 13h8v7l-8-1.2V13zm10 0h8v7l-8-1.8V13z"/>
								</svg>
								<span className="btn-label">Download for Windows</span>
							</a>
							<a href="/shop" className="btn-pill purple">
								<svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
									<path d="M12 2a3 3 0 013 3v1h2a2 2 0 012 2v4h-2V9h-2v2a2 2 0 01-2 2h-1v2h2v2h-2v3h-2v-3H8v-2h2v-2H9a2 2 0 01-2-2V6a2 2 0 012-2h2V2h1z"/>
								</svg>
								<span className="btn-label">Buy license</span>
							</a>
						</div>
					</div>
				</div>
			</section>


      {/* CENTERED HEADER WITH 4 BORDERLESS BUTTONS */}
      <section>
        <div className="container pt-8">
          <div className="tab-strip">
            <div className="tab-line"></div>
            <div className="tab-buttons">
              {tabs.map(key => (
                <button key={key} onClick={()=>setTab(key)} className={`strip-btn ${tab===key? 'active' : ''}`}>
                  {showcase[key].label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="container py-10 max-w-6xl mx-auto flex flex-col items-center">
          <div key={tab} className="w-full">
            <img src={showcase[tab].img} alt="Screenshot" className="storybook-shot" />
            <div className="storybook-desc">{showcase[tab].desc}</div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID (placed under screenshots) */}
      <section>
        <div className="container py-14">
          <div className="features-grid">
            {/* Multi‑device manager */}
            <div className="feature">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="2" y="6" width="9" height="12" rx="2"/>
                  <rect x="13" y="4" width="9" height="14" rx="2"/>
                </svg>
              </div>
              <h3 className="feature-title">Multi‑device manager</h3>
              <p className="feature-desc">Select, group, and act on multiple devices in one place.</p>
            </div>

            {/* Optimized scrcpy */}
            <div className="feature">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="4" width="18" height="12" rx="2"/>
                  <path d="M9 20h6"/>
                </svg>
              </div>
              <h3 className="feature-title">Optimized scrcpy</h3>
              <p className="feature-desc">Launch with tuned FPS/bitrate for smooth mirrors and control.</p>
            </div>

            {/* Script editor */}
            <div className="feature">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 6h16M4 10h10M4 14h8M4 18h6"/>
                </svg>
              </div>
              <h3 className="feature-title">Script editor</h3>
              <p className="feature-desc">Built‑in Monaco editor with reusable blocks and instant run.</p>
            </div>

            {/* Zero-detection */}
            <div className="feature">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/>
                  <path d="M15 9l-6 6"/>
                </svg>
              </div>
              <h3 className="feature-title">Zero‑detection</h3>
              <p className="feature-desc">0% detectable as a bot — interactions are human‑like by design.</p>
            </div>

            {/* Screenshots & controls */}
            <div className="feature">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4" y="7" width="16" height="11" rx="2"/>
                  <circle cx="12" cy="12.5" r="3"/>
                </svg>
              </div>
              <h3 className="feature-title">Screenshots & controls</h3>
              <p className="feature-desc">Capture and operate devices cleanly during sessions.</p>
            </div>

            {/* Secure licensing */}
            <div className="feature">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="11" width="18" height="9" rx="2"/>
                  <path d="M7 11V8a5 5 0 0 1 10 0v3"/>
                </svg>
              </div>
              <h3 className="feature-title">Secure licensing</h3>
              <p className="feature-desc">100% secure activation with revoke and updates; encrypted in transit.</p>
            </div>

            {/* Local execution */}
            <div className="feature">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 4h16v10H4zM8 18h8"/>
                </svg>
              </div>
              <h3 className="feature-title">Local execution</h3>
              <p className="feature-desc">No cloud dependency. 100% local and does not modify mobile data.</p>
            </div>

            {/* Python scripts */}
            <div className="feature">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M8 7h6a3 3 0 0 1 3 3v2H9a3 3 0 0 1-3-3V8a1 1 0 0 1 1-1z"/>
                  <path d="M16 17H10a3 3 0 0 1-3-3v-2h8a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1z"/>
                  <circle cx="14" cy="7" r=".5"/>
                  <circle cx="10" cy="17" r=".5"/>
                </svg>
              </div>
              <h3 className="feature-title">Python scripts</h3>
              <p className="feature-desc">Scripts run in Python for power, clarity, and ecosystem support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (compact 4-step image grid) */}
      <section>
        <div className="container py-16 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="hero-badge mb-6 inline-flex">
              <span className="dot" />
              <span className="label">How it works</span>
            </div>
          </div>
          <div className="how-title hero-subtitle">How it works</div>
          <div className="how-grid">
            <div className="how-item">
              <div className="how-anim connect" aria-hidden="true">
                <span className="device phone"></span>
                <span className="device pc"></span>
                <span className="link usb"></span>
                <span className="packets"></span>
                <span className="adb">adb</span>
              </div>
              <h4 className="how-h4">Connect devices</h4>
              <p className="how-p">Select one or many devices from a unified dashboard.</p>
            </div>
            <div className="how-item">
              <div className="how-anim scripts" aria-hidden="true">
                <div className="code-line line1">
                  <span className="char keyword">f</span>
                  <span className="char keyword">r</span>
                  <span className="char keyword">o</span>
                  <span className="char keyword">m</span>
                  <span className="char normal"> </span>
                  <span className="char import">c</span>
                  <span className="char import">o</span>
                  <span className="char import">r</span>
                  <span className="char import">e</span>
                  <span className="char normal">.</span>
                  <span className="char import">a</span>
                  <span className="char import">n</span>
                  <span className="char import">d</span>
                  <span className="char import">r</span>
                  <span className="char import">o</span>
                  <span className="char import">i</span>
                  <span className="char import">d</span>
                  <span className="char normal"> </span>
                  <span className="char keyword">i</span>
                  <span className="char keyword">m</span>
                  <span className="char keyword">p</span>
                  <span className="char keyword">o</span>
                  <span className="char keyword">r</span>
                  <span className="char keyword">t</span>
                  <span className="char normal"> </span>
                  <span className="char function">t</span>
                  <span className="char function">a</span>
                  <span className="char function">p</span>
                  <span className="char normal">,</span>
                  <span className="char normal"> </span>
                  <span className="char function">t</span>
                  <span className="char function">e</span>
                  <span className="char function">x</span>
                  <span className="char function">t</span>
                </div>
                <div className="code-line line2"></div>
                <div className="code-line line3">
                  <span className="char keyword">d</span>
                  <span className="char keyword">e</span>
                  <span className="char keyword">f</span>
                  <span className="char normal"> </span>
                  <span className="char function">r</span>
                  <span className="char function">u</span>
                  <span className="char function">n</span>
                  <span className="char normal">(</span>
                  <span className="char parameter">a</span>
                  <span className="char parameter">n</span>
                  <span className="char parameter">d</span>
                  <span className="char parameter">r</span>
                  <span className="char parameter">o</span>
                  <span className="char parameter">i</span>
                  <span className="char parameter">d</span>
                  <span className="char normal">_</span>
                  <span className="char parameter">c</span>
                  <span className="char parameter">l</span>
                  <span className="char parameter">i</span>
                  <span className="char parameter">e</span>
                  <span className="char parameter">n</span>
                  <span className="char parameter">t</span>
                  <span className="char normal">,</span>
                  <span className="char normal"> </span>
                  <span className="char parameter">s</span>
                  <span className="char parameter">e</span>
                  <span className="char parameter">r</span>
                  <span className="char parameter">i</span>
                  <span className="char parameter">a</span>
                  <span className="char parameter">l</span>
                  <span className="char normal">)</span>
                  <span className="char normal">:</span>
                </div>
                <div className="code-line line4">
                  <span className="char indent"> </span>
                  <span className="char indent"> </span>
                  <span className="char indent"> </span>
                  <span className="char indent"> </span>
                  <span className="char function">t</span>
                  <span className="char function">a</span>
                  <span className="char function">p</span>
                  <span className="char normal">(</span>
                  <span className="char number">5</span>
                  <span className="char number">4</span>
                  <span className="char number">0</span>
                  <span className="char normal">,</span>
                  <span className="char normal"> </span>
                  <span className="char number">1</span>
                  <span className="char number">6</span>
                  <span className="char number">8</span>
                  <span className="char number">0</span>
                  <span className="char normal">)</span>
                </div>
                <div className="code-line line5">
                  <span className="char indent"> </span>
                  <span className="char indent"> </span>
                  <span className="char indent"> </span>
                  <span className="char indent"> </span>
                  <span className="char function">t</span>
                  <span className="char function">e</span>
                  <span className="char function">x</span>
                  <span className="char function">t</span>
                  <span className="char normal">(</span>
                  <span className="char string">"</span>
                  <span className="char string">H</span>
                  <span className="char string">e</span>
                  <span className="char string">l</span>
                  <span className="char string">l</span>
                  <span className="char string">o</span>
                  <span className="char normal"> </span>
                  <span className="char string">f</span>
                  <span className="char string">r</span>
                  <span className="char string">o</span>
                  <span className="char string">m</span>
                  <span className="char normal"> </span>
                  <span className="char string">A</span>
                  <span className="char string">p</span>
                  <span className="char string">p</span>
                  <span className="char string">s</span>
                  <span className="char string">M</span>
                  <span className="char string">o</span>
                  <span className="char string">b</span>
                  <span className="char string">s</span>
                  <span className="char string">!</span>
                  <span className="char string">"</span>
                  <span className="char normal">)</span>
                </div>
                <span className="cursor cursor1"></span>
                <span className="cursor cursor2"></span>
                <span className="cursor cursor3"></span>
                <span className="cursor cursor4"></span>
                <span className="cursor cursor5"></span>
              </div>
              <h4 className="how-h4">Create or run scripts</h4>
              <p className="how-p">Use the editor or blocks and run instantly on selected devices.</p>
            </div>
            <div className="how-item">
              <div className="how-anim control" aria-hidden="true">
                <span className="phone"></span>
                <span className="tap"></span>
                <span className="screenshot"></span>
              </div>
              <h4 className="how-h4">Control & capture</h4>
              <p className="how-p">Open optimized scrcpy, adjust FPS/bitrate, and capture screenshots.</p>
            </div>
            <div className="how-item">
              <div className="how-anim logs" aria-hidden="true">
                <span className="log l1"></span>
                <span className="log l2"></span>
                <span className="log l3"></span>
                <span className="log l4"></span>
              </div>
              <h4 className="how-h4">Review results</h4>
              <p className="how-p">Check logs locally. Private by design; nothing touches mobile data.</p>
            </div>
          </div>
          <p className="how-note">
            For setup and usage details, please read the documentation.<br />
            We’ll walk you through installation, connecting devices, and writing or running scripts.<br />
            <a href={DOCS_URL} className="btn-doc" style={{marginTop:'10px', display:'inline-flex'}} target="_blank" rel="noreferrer">
              <svg className="doc-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 4a2 2 0 0 1 2-2h5l5 5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4z" fill="currentColor"/>
                <path d="M13 2v5h5" fill="currentColor"/>
              </svg>
              Open documentation
            </a>
          </p>
        </div>
      </section>
      {/* REFERRAL PROGRAM SECTION - STYLED LIKE HOW IT WORKS */}
      <section>
        <div className="container py-16 max-w-6xl mx-auto relative">
          {/* Animated background patterns */}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-emerald-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.75s' }}></div>
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
                <span className="label">Referral Program</span>
              </div>
            </div>
            <div className="how-title hero-subtitle mb-4">Earn Rewards by Inviting Friends</div>
            <p className="hero-subtitle text-center mb-16 max-w-3xl mx-auto">
              Share AppsMobs with your network and get rewarded for every successful referral. 
              Build your token collection and unlock free licenses!
            </p>

            {/* How It Works - 4 Step Grid (matching how-it-works style) */}
            <div className="how-grid mb-20">
              {/* Step 1: Get Code */}
              <div className="how-item referral-process-item">
                <div className="process-circle circle-1"></div>
                <div className="how-anim referral-code" aria-hidden="true">
                  <span className="code-badge"></span>
                  <span className="code-prefix">REF</span>
                  <span className="code-char char1"></span>
                  <span className="code-char char2"></span>
                  <span className="code-char char3"></span>
                  <span className="code-char char4"></span>
                  <span className="code-check"></span>
                  <span className="code-glow"></span>
                </div>
                <h4 className="how-h4">Get Your Code</h4>
                <p className="how-p">Generate your unique referral code from the dashboard in seconds.</p>
          </div>

              {/* Step 2: Share */}
              <div className="how-item referral-process-item">
                <div className="process-circle circle-2"></div>
                <div className="how-anim referral-share" aria-hidden="true">
                  <span className="share-link-box"></span>
                  <span className="share-arrow arrow1"></span>
                  <span className="share-arrow arrow2"></span>
                  <span className="share-arrow arrow3"></span>
                  <span className="share-platform platform1"></span>
                  <span className="share-platform platform2"></span>
                  <span className="share-platform platform3"></span>
                  <span className="share-particle particle1"></span>
                  <span className="share-particle particle2"></span>
                  <span className="share-particle particle3"></span>
                  <span className="share-particle particle4"></span>
                </div>
                <h4 className="how-h4">Share & Invite</h4>
                <p className="how-p">Share your referral link via social media, email, or any platform.</p>
              </div>

              {/* Step 3: Earn Tokens */}
              <div className="how-item referral-process-item">
                <div className="process-circle circle-3"></div>
                <div className="how-anim referral-earn" aria-hidden="true">
                  <span className="token-stack"></span>
                  <span className="token-flying token1"></span>
                  <span className="token-flying token2"></span>
                  <span className="token-flying token3"></span>
                  <span className="token-counter">+10</span>
                  <span className="token-sparkle sparkle1"></span>
                  <span className="token-sparkle sparkle2"></span>
                  <span className="token-sparkle sparkle3"></span>
                </div>
                <h4 className="how-h4">Earn Tokens</h4>
                <p className="how-p">Get 10 tokens automatically when someone purchases through your link.</p>
              </div>

              {/* Step 4: Redeem */}
              <div className="how-item referral-process-item">
                <div className="process-circle circle-4"></div>
                <div className="how-anim referral-redeem" aria-hidden="true">
                  <span className="redeem-box"></span>
                  <span className="redeem-arrow"></span>
                  <span className="redeem-check"></span>
                  <span className="redeem-glow"></span>
                </div>
                <h4 className="how-h4">Redeem Rewards</h4>
                <p className="how-p">Exchange 100 tokens for 1 week of free license. Track everything in real-time.</p>
            </div>
          </div>

            {/* Rewards Showcase - ReactBits Style */}
          <div className="mb-16">
              <div className="text-center mb-12">
                <div className="hero-badge mb-6 inline-flex">
                  <span className="dot" />
                  <span className="label">Rewards</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Your Rewards</h3>
                <p className="text-white/60 text-base max-w-2xl mx-auto">
                  Build your token collection and unlock exclusive benefits. Start earning rewards today by sharing with your friends.
                      </p>
                    </div>

              <div className="rewards-grid">
                {/* Grande carte */}
                <div className="rewards-card rewards-card-large rewards-card-white">
                  <div className="rewards-icon">
                    <img src="/assets/token.png" alt="Token" className="rewards-token-img" />
                  </div>
                  <div className="rewards-number">10 Tokens</div>
                  <h4 className="rewards-title">Earn Per Referral</h4>
                  <p className="rewards-desc">Get 10 tokens instantly when someone purchases through your unique referral link. No limits, no expiration.</p>
                  <div className="rewards-cta">
                    <span>Instant payout</span>
                    <div className="rewards-dot rewards-dot-white"></div>
                </div>
              </div>

                {/* Petite carte 1 */}
                <div className="rewards-card rewards-card-small rewards-card-white">
                  <div className="rewards-icon">🔓</div>
                  <div className="rewards-number">Free Week</div>
                  <h4 className="rewards-title">Redeem License</h4>
                  <p className="rewards-desc">100 tokens = 1 week free</p>
                  <div className="rewards-cta">
                    <span>Unlock premium</span>
                    <div className="rewards-dot rewards-dot-white"></div>
                    </div>
                      </div>

                {/* Petite carte 2 */}
                <div className="rewards-card rewards-card-small rewards-card-pink">
                  <div className="rewards-icon">📈</div>
                  <div className="rewards-number">Dashboard</div>
                  <h4 className="rewards-title">Track Progress</h4>
                  <p className="rewards-desc">Real-time analytics</p>
                  <div className="rewards-cta">
                    <span>View stats</span>
                    <div className="rewards-dot rewards-dot-pink"></div>
                      </div>
                    </div>
                  </div>

            {/* Nouvelle grille de 3 cartes */}
            <div className="rewards-grid-4 mt-8">
              {/* Rectangle 1 - Tokens Never Expire */}
              <div className="rewards-card rewards-card-rectangle rewards-card-cyan">
                <div className="rewards-icon">⏰</div>
                <div className="rewards-number">∞</div>
                <h4 className="rewards-title">Tokens Never Expire</h4>
                <p className="rewards-desc">Accumulate tokens at your own pace without any time pressure. There's no expiration date, no rush, and no limits on how long you can keep your tokens.</p>
                <div className="rewards-cta">
                  <span>No limits</span>
                  <div className="rewards-dot rewards-dot-cyan"></div>
                </div>
              </div>

              {/* Carré 1 */}
              <div className="rewards-card rewards-card-square rewards-card-emerald">
                <div className="rewards-icon">⭐</div>
                <div className="rewards-number">25</div>
                <h4 className="rewards-title">First Referral</h4>
                <p className="rewards-desc">Bonus tokens</p>
                <div className="rewards-cta">
                  <span>Get started</span>
                  <div className="rewards-dot rewards-dot-emerald"></div>
            </div>
          </div>

              {/* Carré 2 - Secure & Transparent */}
              <div className="rewards-card rewards-card-square rewards-card-white">
                <div className="rewards-icon">🔒</div>
                <div className="rewards-number">✓</div>
                <h4 className="rewards-title">Secure & Transparent</h4>
                <p className="rewards-desc">All transactions are tracked and verified automatically</p>
                <div className="rewards-cta">
                  <span>Verified</span>
                  <div className="rewards-dot rewards-dot-white"></div>
                </div>
              </div>
            </div>
          </div>


          {/* CTA */}
          <div className="text-center">
            <Link 
              to="/dashboard" 
              className="btn-pill cyan inline-flex items-center gap-3 px-8 py-4 text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan/20 hover:shadow-cyan/40"
            >
              <svg className="btn-icon w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
              <span className="btn-label">Get Your Referral Link Now</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
        </div>
      </section>

      {/* COMMUNITY SECTION */}
      <section className="container py-20">
        <div className="community-section-wrapper">
          <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}>
            <PixelBlast
              variant="circle"
              pixelSize={6}
              color="#22d3ee"
              patternScale={3}
              patternDensity={1.2}
              pixelSizeJitter={0.5}
              enableRipples
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              liquid
              liquidStrength={0.12}
              liquidRadius={1.2}
              liquidWobbleSpeed={5}
              speed={0.6}
              edgeFade={0.25}
              transparent
            />
            </div>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="hero-title">
              Loved by the community
            </h2>
            <p className="community-description max-w-2xl mx-auto">
              Join thousands of users who are automating their Android devices and sharing their success stories. Get support, share tips, and connect with fellow automation enthusiasts.
              </p>
              <a
              href="https://discord.gg/wz3KM6JdMG"
                target="_blank"
                rel="noreferrer"
              className="btn-pill cyan inline-flex items-center gap-3 px-8 py-4 text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan/20 hover:shadow-cyan/40"
              >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              <span className="btn-label">Join Discord Community</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
          </div>
        </div>
      </section>

      {/* Optional sections below kept for SEO; hidden visually */}
      <section className="hidden"></section>
    </>
  )
}

function FeatureCard(){ return null }
function TabBtn(){ return null }

