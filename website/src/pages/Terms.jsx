import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan to-purple-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-white/60 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-white/50 text-sm mt-2 max-w-2xl mx-auto">
            Please read these Terms of Service carefully before using AppsMobs. By accessing or using our Service, you agree to be bound by these Terms.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="glass rounded-xl p-6 border border-white/10 mb-12">
          <h2 className="text-xl font-bold mb-4 text-cyan">Table of Contents</h2>
          <nav className="space-y-2">
            <a href="#agreement" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              1. Agreement to Terms
            </a>
            <a href="#definitions" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              2. Definitions
            </a>
            <a href="#license" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              3. License Grant & Usage Rights
            </a>
            <a href="#restrictions" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              4. Restrictions & Prohibited Uses
            </a>
            <a href="#payment" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              5. Payment Terms & Billing
            </a>
            <a href="#account" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              6. Account Responsibility
            </a>
            <a href="#termination" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              7. Termination & Cancellation
            </a>
            <a href="#intellectual" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              8. Intellectual Property Rights
            </a>
            <a href="#warranties" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              9. Disclaimers & Warranties
            </a>
            <a href="#liability" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              10. Limitation of Liability
            </a>
            <a href="#indemnification" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              11. Indemnification
            </a>
            <a href="#changes" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              12. Changes to Terms
            </a>
            <a href="#governing" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              13. Governing Law & Disputes
            </a>
            <a href="#referrals" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              14. Referral Program & Tokens
            </a>
            <a href="#contact" className="block text-white/70 hover:text-cyan transition-colors text-sm">
              15. Contact Information
            </a>
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {/* Section 1 */}
          <section id="agreement" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">1. Agreement to Terms</h2>
            <div className="prose prose-invert max-w-none space-y-4 text-white/80 leading-relaxed">
              <p className="text-base">
                By accessing or using AppsMobs ("Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. 
                If you disagree with any part of these terms, you may not access or use the Service.
              </p>
              <p className="text-base">
                These Terms constitute a legally binding agreement between you ("User", "you", or "your") and AppsMobs ("we", "us", "our", or "Company"). 
                Your use of the Service is conditional upon your acceptance of and compliance with these Terms.
              </p>
              <p className="text-base">
                If you are accessing or using the Service on behalf of a company or organization, you represent and warrant that you have the authority 
                to bind such entity to these Terms, and "you" and "your" will refer to that entity.
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-6">
                <p className="text-yellow-300 text-sm font-medium">
                  <strong>Important:</strong> By using AppsMobs, you acknowledge that you have read, understood, and agree to be bound by these Terms. 
                  If you do not agree with these Terms, please do not use the Service.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="definitions" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">2. Definitions</h2>
            <div className="space-y-4 text-white/80 leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">2.1 Key Terms</h3>
                <ul className="space-y-3 ml-6 list-disc text-base">
                  <li>
                    <strong className="text-white">"Service"</strong> refers to the AppsMobs software application, website, and all related services 
                    provided by AppsMobs, including but not limited to device control, automation scripts, and license management.
                  </li>
                  <li>
                    <strong className="text-white">"License"</strong> means a non-exclusive, non-transferable right granted to you to use the Service 
                    for a specified period and according to your subscription plan.
                  </li>
                  <li>
                    <strong className="text-white">"User"</strong> or <strong className="text-white">"You"</strong> refers to the individual or entity 
                    accessing or using the Service.
                  </li>
                  <li>
                    <strong className="text-white">"Subscription Plan"</strong> refers to the selected billing plan (Normal, Pro, or Team) 
                    that determines the features and device limits available to you.
                  </li>
                  <li>
                    <strong className="text-white">"License Key"</strong> means the unique alphanumeric code provided to you upon purchase 
                    that enables access to the Service.
                  </li>
                  <li>
                    <strong className="text-white">"Content"</strong> refers to all data, scripts, configurations, and materials created, 
                    uploaded, or transmitted through the Service.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="license" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">3. License Grant & Usage Rights</h2>
            <div className="space-y-6 text-white/80 leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">3.1 Grant of License</h3>
                <p className="text-base mb-4">
                  Subject to your compliance with these Terms and payment of applicable fees, AppsMobs grants you a limited, non-exclusive, 
                  non-transferable, revocable license to use the Service during your active subscription period.
                </p>
                <p className="text-base">
                  This license is personal to you and may not be sublicensed, assigned, or transferred to any third party without our prior written consent.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">3.2 Subscription Plans & Device Limits</h3>
                <p className="text-base mb-4">
                  Your license usage rights depend on your selected subscription plan:
                </p>
                <div className="grid md:grid-cols-3 gap-4 my-6">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="font-semibold text-blue-400 mb-2">Normal Plan</h4>
                    <p className="text-sm text-white/70">1 simultaneous device</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="font-semibold text-purple-400 mb-2">Pro Plan</h4>
                    <p className="text-sm text-white/70">2 simultaneous devices</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="font-semibold text-emerald-400 mb-2">Team Plan</h4>
                    <p className="text-sm text-white/70">5 simultaneous devices</p>
                  </div>
                </div>
                <p className="text-base">
                  Exceeding your plan's device limit may result in service restrictions or require plan upgrades.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">3.3 License Duration</h3>
                <p className="text-base mb-4">
                  Your license is valid for the duration specified in your subscription:
                </p>
                <ul className="space-y-2 ml-6 list-disc text-base">
                  <li><strong className="text-white">Monthly:</strong> Valid for 30 days from activation</li>
                  <li><strong className="text-white">Quarterly:</strong> Valid for 90 days (3 months) from activation</li>
                  <li><strong className="text-white">Semi-Annual:</strong> Valid for 180 days (6 months) from activation</li>
                  <li><strong className="text-white">Annual:</strong> Valid for 365 days (12 months) from activation</li>
                </ul>
                <p className="text-base mt-4">
                  Your license expires at the end of your billing period. You must renew your subscription to continue using the Service beyond the expiration date.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">3.4 License Activation</h3>
                <p className="text-base">
                  To activate your license, you must provide your registered email address and the license key provided upon purchase. 
                  The license is tied to your account and cannot be shared or transferred.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="restrictions" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">4. Restrictions & Prohibited Uses</h2>
            <div className="space-y-6 text-white/80 leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">4.1 General Restrictions</h3>
                <p className="text-base mb-4">You agree NOT to:</p>
                <ul className="space-y-3 ml-6 list-disc text-base">
                  <li>
                    <strong className="text-white">Reverse engineer, decompile, or disassemble</strong> the Software, or attempt to derive the source code 
                    from the executable code
                  </li>
                  <li>
                    <strong className="text-white">Copy, modify, or create derivative works</strong> of the Software or any part thereof
                  </li>
                  <li>
                    <strong className="text-white">Remove, alter, or obscure</strong> any proprietary notices, labels, or marks on the Software
                  </li>
                  <li>
                    <strong className="text-white">Share, resell, redistribute, or sublicense</strong> your license to any third party
                  </li>
                  <li>
                    <strong className="text-white">Use the Service for illegal purposes</strong> or in violation of any applicable laws or regulations
                  </li>
                  <li>
                    <strong className="text-white">Circumvent or attempt to circumvent</strong> any security measures, license restrictions, or usage limits
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">4.2 Prohibited Activities</h3>
                <p className="text-base mb-4">You are expressly prohibited from using the Service to:</p>
                <ul className="space-y-3 ml-6 list-disc text-base">
                  <li>Access or control devices without proper authorization or consent</li>
                  <li>Interfere with, disrupt, or damage any network, server, or system</li>
                  <li>Transmit viruses, malware, or any other harmful code</li>
                  <li>Harvest or collect information about other users without their consent</li>
                  <li>Impersonate any person or entity, or misrepresent your affiliation</li>
                  <li>Violate any privacy rights, intellectual property rights, or other rights of third parties</li>
                  <li>Engage in any form of automated data collection, scraping, or crawling</li>
                </ul>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-6">
                <p className="text-red-300 text-sm font-medium">
                  <strong>Violation of these restrictions may result in immediate termination of your license and legal action.</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="payment" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">5. Payment Terms & Billing</h2>
            <div className="space-y-6 text-white/80 leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">5.1 Payment Methods</h3>
                <p className="text-base mb-4">
                  We accept the following payment methods:
                </p>
                <ul className="space-y-2 ml-6 list-disc text-base">
                  <li><strong className="text-white">PayPal:</strong> Instant processing for PayPal accounts</li>
                  <li><strong className="text-white">Binance Pay:</strong> Cryptocurrency payments (requires manual verification within 24-48 hours)</li>
                </ul>
                <p className="text-base mt-4">
                  All prices are displayed in EUR (€) and are exclusive of applicable taxes unless otherwise stated.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">5.2 Billing & Renewal</h3>
                <p className="text-base mb-4">
                  <strong className="text-white">Subscription Model:</strong> All fees are charged in advance for the selected subscription period (1, 3, 6, or 12 months).
                </p>
                <p className="text-base mb-4">
                  <strong className="text-white">No Auto-Renewal:</strong> Subscriptions do not automatically renew. You must manually renew your license 
                  before expiration to continue using the Service.
                </p>
                <p className="text-base">
                  <strong className="text-white">Price Changes:</strong> We reserve the right to modify subscription prices at any time. 
                  Price changes will not affect your current subscription period but will apply to renewals.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">5.3 Refund Policy</h3>
                <p className="text-base mb-4">
                  We offer a <strong className="text-white">14-day money-back guarantee</strong> for new subscriptions. To request a refund:
                </p>
                <ol className="space-y-2 ml-6 list-decimal text-base">
                  <li>Contact support@appsmobs.com within 14 days of your purchase</li>
                  <li>Include your license key and email address used for registration</li>
                  <li>Provide a reason for the refund request</li>
                </ol>
                <p className="text-base mt-4">
                  Refunds are processed within 5-10 business days and will be issued to the original payment method. 
                  After 14 days, refunds are granted only at our discretion and under exceptional circumstances.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">5.4 Payment Failures & Disputes</h3>
                <p className="text-base mb-4">
                  If payment fails or is declined, your access to the Service may be suspended until payment is successfully processed. 
                  You are responsible for ensuring your payment method is valid and has sufficient funds.
                </p>
                <p className="text-base">
                  If you dispute a charge, please contact us at support@appsmobs.com before initiating a chargeback. 
                  Chargebacks without prior communication may result in account suspension or termination.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="account" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">6. Account Responsibility</h2>
            <div className="space-y-6 text-white/80 leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">6.1 Account Security</h3>
                <p className="text-base mb-4">You are responsible for:</p>
                <ul className="space-y-2 ml-6 list-disc text-base">
                  <li>Maintaining the confidentiality and security of your account credentials</li>
                  <li>All activities that occur under your account, whether authorized or not</li>
                  <li>Ensuring your password is strong and unique</li>
                  <li>Notifying us immediately of any unauthorized access or security breach</li>
                  <li>Keeping your email address updated in your account settings</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">6.2 Account Information</h3>
                <p className="text-base mb-4">
                  You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. 
                  False or misleading information may result in account suspension or termination.
                </p>
                <p className="text-base">
                  You are responsible for maintaining the accuracy of your contact information, including your email address, 
                  as it is used for important communications, license delivery, and account recovery.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">6.3 License Key Management</h3>
                <p className="text-base mb-4">
                  Your license key is provided to you upon purchase and is tied to your account email. You are responsible for:
                </p>
                <ul className="space-y-2 ml-6 list-disc text-base">
                  <li>Safeguarding your license key and not sharing it with others</li>
                  <li>Using your license key only on devices within your plan's device limit</li>
                  <li>Reporting lost or stolen license keys immediately</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="termination" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">7. Termination & Cancellation</h2>
            <div className="space-y-6 text-white/80 leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">7.1 Termination by You</h3>
                <p className="text-base mb-4">
                  You may cancel your subscription at any time. Cancellation can be done through your account dashboard or by contacting support@appsmobs.com.
                </p>
                <p className="text-base mb-4">
                  <strong className="text-white">Effect of Cancellation:</strong> Your license will remain active until the end of your current billing period. 
                  You will continue to have access to the Service until your license expires.
                </p>
                <p className="text-base">
                  <strong className="text-white">No Partial Refunds:</strong> Cancellation does not entitle you to a refund for the unused portion of your subscription period.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">7.2 Termination by Us</h3>
                <p className="text-base mb-4">
                  We may terminate or suspend your access to the Service immediately, without prior notice, for:
                </p>
                <ul className="space-y-2 ml-6 list-disc text-base">
                  <li>Breach of these Terms of Service</li>
                  <li>Violation of applicable laws or regulations</li>
                  <li>Fraudulent, abusive, or illegal activity</li>
                  <li>Non-payment of fees</li>
                  <li>Security or operational concerns</li>
                </ul>
                <p className="text-base mt-4">
                  Upon termination, your right to use the Service ceases immediately, and your license key will be deactivated.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">7.3 Effect of Termination</h3>
                <p className="text-base mb-4">
                  Upon termination of your license:
                </p>
                <ul className="space-y-2 ml-6 list-disc text-base">
                  <li>You must immediately cease all use of the Service</li>
                  <li>All licenses granted to you will immediately terminate</li>
                  <li>You may not be entitled to any refund except as required by law</li>
                  <li>All data associated with your account may be deleted after a reasonable retention period</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section id="intellectual" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">8. Intellectual Property Rights</h2>
            <div className="space-y-6 text-white/80 leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">8.1 Ownership</h3>
                <p className="text-base mb-4">
                  The Service, including all software, code, text, graphics, logos, icons, and other materials, is owned by AppsMobs and is protected 
                  by copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
                <p className="text-base">
                  These Terms do not grant you any rights to use our trademarks, service marks, logos, or brand names. 
                  All rights not expressly granted are reserved by AppsMobs.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">8.2 User Content</h3>
                <p className="text-base mb-4">
                  You retain ownership of any content you create, upload, or transmit through the Service ("User Content"), including automation scripts, 
                  configurations, and custom code.
                </p>
                <p className="text-base mb-4">
                  By using the Service, you grant AppsMobs a limited, non-exclusive, worldwide, royalty-free license to:
                </p>
                <ul className="space-y-2 ml-6 list-disc text-base">
                  <li>Store and process your User Content as necessary to provide the Service</li>
                  <li>Use aggregated, anonymized data for analytics and service improvement</li>
                </ul>
                <p className="text-base mt-4">
                  You are solely responsible for ensuring your User Content does not violate any third-party rights or applicable laws.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section id="warranties" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">9. Disclaimers & Warranties</h2>
            <div className="space-y-6 text-white/80 leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">9.1 Service Availability</h3>
                <p className="text-base mb-4">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. 
                  We do not warrant that:
                </p>
                <ul className="space-y-2 ml-6 list-disc text-base">
                  <li>The Service will be uninterrupted, error-free, or completely secure</li>
                  <li>All defects or errors will be corrected</li>
                  <li>The Service will meet your specific requirements or expectations</li>
                  <li>The results obtained from using the Service will be accurate or reliable</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">9.2 Disclaimer of Warranties</h3>
                <p className="text-base mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, APPSMOBS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="space-y-2 ml-6 list-disc text-base">
                  <li>Implied warranties of merchantability and fitness for a particular purpose</li>
                  <li>Warranties of non-infringement</li>
                  <li>Warranties arising from course of dealing or usage of trade</li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-6">
                <p className="text-blue-300 text-sm">
                  Some jurisdictions do not allow the exclusion of implied warranties, so the above exclusions may not apply to you.
                </p>
              </div>
            </div>
          </section>

          {/* Section 10 */}
          <section id="liability" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">10. Limitation of Liability</h2>
            <div className="space-y-6 text-white/80 leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">10.1 Limitation</h3>
                <p className="text-base mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, APPSMOBS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
                  OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="space-y-2 ml-6 list-disc text-base">
                  <li>Loss of profits, revenue, data, or business opportunities</li>
                  <li>Cost of substitute goods or services</li>
                  <li>Business interruption or loss of goodwill</li>
                  <li>Any damages resulting from use or inability to use the Service</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">10.2 Maximum Liability</h3>
                <p className="text-base mb-4">
                  IN NO EVENT SHALL APPSMOBS'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THE SERVICE EXCEED 
                  THE AMOUNT YOU PAID TO APPSMOBS IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
                </p>
                <p className="text-base">
                  This limitation applies regardless of the legal theory on which the claim is based (contract, tort, negligence, or otherwise).
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-6">
                <p className="text-blue-300 text-sm">
                  Some jurisdictions do not allow the limitation of liability for incidental or consequential damages, so the above limitations may not apply to you.
                </p>
              </div>
            </div>
          </section>

          {/* Section 11 */}
          <section id="indemnification" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">11. Indemnification</h2>
            <div className="space-y-4 text-white/80 leading-relaxed">
              <p className="text-base">
                You agree to indemnify, defend, and hold harmless AppsMobs, its officers, directors, employees, agents, and affiliates from and against 
                any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to:
              </p>
              <ul className="space-y-2 ml-6 list-disc text-base">
                <li>Your use or misuse of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights, including intellectual property or privacy rights</li>
                <li>Your User Content or any content you create, upload, or transmit through the Service</li>
              </ul>
            </div>
          </section>

          {/* Section 12 */}
          <section id="changes" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">12. Changes to Terms</h2>
            <div className="space-y-4 text-white/80 leading-relaxed">
              <p className="text-base mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by:
              </p>
              <ul className="space-y-2 ml-6 list-disc text-base">
                <li>Emailing registered users at their registered email address</li>
                <li>Displaying a notice on our website or within the Service</li>
                <li>Updating the "Last updated" date at the top of these Terms</li>
              </ul>
              <p className="text-base mt-4">
                Continued use of the Service after changes become effective constitutes your acceptance of the modified Terms. 
                If you do not agree with the changes, you must stop using the Service and cancel your subscription.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section id="governing" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">13. Governing Law & Disputes</h2>
            <div className="space-y-6 text-white/80 leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">13.1 Governing Law</h3>
                <p className="text-base">
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which AppsMobs operates, 
                  without regard to its conflict of law provisions.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">13.2 Dispute Resolution</h3>
                <p className="text-base mb-4">
                  In the event of any dispute arising out of or relating to these Terms or the Service:
                </p>
                <ol className="space-y-2 ml-6 list-decimal text-base">
                  <li>You agree to first contact us at support@appsmobs.com to attempt to resolve the dispute amicably</li>
                  <li>If the dispute cannot be resolved within 60 days, you agree to submit to binding arbitration</li>
                  <li>Arbitration shall be conducted in accordance with the rules of a recognized arbitration organization</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">13.3 Class Action Waiver</h3>
                <p className="text-base">
                  You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, 
                  consolidated, or representative action.
                </p>
              </div>
            </div>
          </section>

          {/* Section 14 */}
          <section id="referrals" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">14. Referral Program & Tokens</h2>
            <div className="prose prose-invert max-w-none space-y-4 text-white/80 leading-relaxed">
              <p className="text-base">
                AppsMobs offers a referral program that allows users to earn tokens ("Tokens") by referring new users to the Service.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-white">14.1 Referral Tokens</h3>
              <p className="text-base">
                Users earn 10 Tokens for each successful referral when:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-base">
                <li>A new user registers using your unique referral code</li>
                <li>The referred user completes a purchase of any license plan</li>
                <li>The purchase payment is successfully processed</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-white">14.2 Token Redemption</h3>
              <p className="text-base">
                Tokens can be redeemed for free license weeks:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-base">
                <li>100 Tokens = 1 week of license (1 simultaneous device)</li>
                <li>You can redeem up to 4 weeks (400 tokens) per transaction</li>
                <li>Redeemed licenses are non-refundable and cannot be converted back to tokens</li>
                <li>License weeks obtained through token redemption follow the same Terms as purchased licenses</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-white">14.3 Referral Code Usage</h3>
              <p className="text-base">
                By participating in the referral program, you agree that:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-base">
                <li>You will not use fraudulent means to generate referrals (e.g., fake accounts, bots, or self-referrals)</li>
                <li>You will not spam or harass users with your referral code</li>
                <li>You cannot use your own referral code to earn tokens</li>
                <li>Each referral code can only be used once per user</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-white">14.4 Token Validity</h3>
              <p className="text-base">
                Tokens do not expire and have no cash value. Tokens cannot be transferred, sold, or exchanged for money. 
                Tokens are account-specific and cannot be shared between accounts.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-white">14.5 Fraud Prevention</h3>
              <p className="text-base">
                We reserve the right to:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-base">
                <li>Review and verify all referrals before awarding tokens</li>
                <li>Suspend or revoke tokens earned through fraudulent activity</li>
                <li>Terminate accounts involved in referral program abuse</li>
                <li>Modify or discontinue the referral program at any time with reasonable notice</li>
              </ul>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-6">
                <p className="text-yellow-300 text-sm">
                  <strong>Note:</strong> We reserve the right to modify referral rewards, token redemption rates, 
                  or program terms at any time. Changes will be communicated via email or Service notifications.
                </p>
              </div>
            </div>
          </section>

          {/* Section 15 */}
          <section id="contact" className="glass rounded-xl p-8 border border-white/10 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 text-cyan">15. Contact Information</h2>
            <div className="space-y-4 text-white/80 leading-relaxed">
              <p className="text-base mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-base mb-2">
                  <strong className="text-white">Email:</strong>{' '}
                  <a href="mailto:support@appsmobs.com" className="text-cyan hover:text-cyan/80 underline">
                    support@appsmobs.com
                  </a>
                </p>
                <p className="text-base">
                  <strong className="text-white">Website:</strong>{' '}
                  <a href="/" className="text-cyan hover:text-cyan/80 underline">
                    appsmobs.com
                  </a>
                </p>
              </div>
              <p className="text-base mt-4">
                We aim to respond to all inquiries within 48 hours during business days.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link to="/privacy" className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm">
            Privacy Policy
          </Link>
          <Link to="/about" className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm">
            About Us
          </Link>
          <a
            href="mailto:support@appsmobs.com"
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
