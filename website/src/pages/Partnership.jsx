import { Link } from 'react-router-dom'

export default function Partnership() {
  return (
    <>
      {/* Hero Section */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hero-badge mb-6 inline-flex">
            <span className="dot" />
            <span className="label">Partnerships</span>
          </div>
          <h1 className="hero-title">
            Become a Partner
          </h1>
          <p className="hero-subtitle max-w-2xl mx-auto">
            Join our partner program and unlock exclusive benefits, higher commissions, and priority support
          </p>
        </div>
      </section>

      {/* Benefits & Requirements Section */}
      <section className="container py-12 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Benefits */}
            <div className="glass rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-cyan/5 to-emerald-500/5">
              <h2 className="text-3xl font-bold mb-6 text-cyan">Partner Benefits</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-lg">Higher Commission Rates</h3>
                    <p className="text-white/70">Up to 15% commission for qualified partners, significantly higher than standard referral rates</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-lg">Priority Support</h3>
                    <p className="text-white/70">Dedicated support channel with faster response times and direct access to our team</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-lg">Marketing Materials</h3>
                    <p className="text-white/70">Access to banners, logos, promotional content, and co-branded materials</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-lg">Co-Marketing Opportunities</h3>
                    <p className="text-white/70">Collaborate on campaigns, content creation, and joint promotional activities</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-lg">Early Access</h3>
                    <p className="text-white/70">Get early access to new features, beta testing opportunities, and product updates</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="glass rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              <h2 className="text-3xl font-bold mb-6 text-purple-400">Partnership Requirements</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-lg">Active Presence</h3>
                    <p className="text-white/70">Established platform, website, or community with regular audience engagement</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-lg">Quality Traffic</h3>
                    <p className="text-white/70">Relevant audience interested in automation, Android tools, or related technologies</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-lg">Minimum Sales</h3>
                    <p className="text-white/70">At least 5 successful referrals in the last 30 days to demonstrate consistent performance</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-lg">Brand Alignment</h3>
                    <p className="text-white/70">Content and values aligned with AppsMobs mission of automation and innovation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="glass rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-cyan/5 via-purple-500/5 to-emerald-500/5 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-cyan/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-cyan">1</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Apply</h3>
                <p className="text-white/70 text-sm">Submit your partnership application with details about your platform and audience</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-400">2</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Review</h3>
                <p className="text-white/70 text-sm">Our team reviews your application and evaluates your fit for the program</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-400">3</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Partner</h3>
                <p className="text-white/70 text-sm">Get approved and start earning with enhanced commission rates and support</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="inline-block glass rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-cyan/10 to-emerald-500/10">
              <h2 className="text-2xl font-bold mb-4 text-white">Ready to Become a Partner?</h2>
              <p className="text-white/70 mb-6 max-w-xl mx-auto">
                Join our partner program and start earning with higher commissions, priority support, and exclusive benefits.
              </p>
              <a
                href="mailto:partners@appsmobs.com?subject=Partnership Inquiry"
                className="btn-pill cyan inline-flex items-center gap-2 px-8 py-4 text-lg"
              >
                <svg className="btn-icon w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span className="btn-label">Apply for Partnership</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

