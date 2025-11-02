export default function Privacy() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-white/60">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="glass rounded-xl p-8 border border-white/10 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <div className="space-y-3 text-white/80">
              <p><strong>Account Information:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Email address (required for account creation)</li>
                <li>Password (hashed, never stored in plain text)</li>
                <li>Name and country (optional profile information)</li>
              </ul>
              <p className="mt-4"><strong>License & Usage Data:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>License keys and expiration dates</li>
                <li>Device identifiers (for license activation)</li>
                <li>Payment transaction information (processed by third parties)</li>
              </ul>
              <p className="mt-4"><strong>Referral & Token Data:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Referral codes and usage statistics</li>
                <li>Token balances and transaction history</li>
                <li>Referral relationships (who referred whom)</li>
                <li>Token redemption history</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <div className="space-y-3 text-white/80">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Provide and maintain the Service</li>
                <li>Process your license purchases and payments</li>
                <li>Send you important updates about your account and licenses</li>
                <li>Respond to your support requests</li>
                <li>Verify your identity for security purposes</li>
                <li>Manage the referral program and token system</li>
                <li>Track and award referral tokens</li>
                <li>Process token redemptions for free licenses</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Data Storage & Security</h2>
            <div className="space-y-3 text-white/80">
              <p>
                <strong>Local Execution:</strong> All automation and device control operations run locally 
                on your computer. We do not have access to your device data, screenshots, or automation scripts.
              </p>
              <p>
                <strong>Cloud Storage:</strong> Only essential account and license data is stored on our servers 
                (Supabase). All data is encrypted in transit and at rest.
              </p>
              <p>
                <strong>Passwords:</strong> Passwords are hashed using bcrypt and never stored in plain text.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Referral Program Data</h2>
            <div className="space-y-3 text-white/80">
              <p>
                When you participate in our referral program, we collect and store:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Referral Codes:</strong> Your unique referral code is generated and stored to track referrals</li>
                <li><strong>Referral Relationships:</strong> We link referred users to their referrer's account to process token rewards</li>
                <li><strong>Token Balances:</strong> Your token balance, earning history, and redemption transactions are stored</li>
                <li><strong>Purchase Verification:</strong> We verify referred users' purchases to award tokens accurately</li>
              </ul>
              <p className="mt-4">
                This data is used solely for operating the referral program and processing token rewards. 
                We do not share referral relationships or token data with third parties except as required by law.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Third-Party Services</h2>
            <div className="space-y-3 text-white/80">
              <p>We use the following third-party services:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Supabase:</strong> Database and authentication (data storage, including referral and token data)</li>
                <li><strong>Resend:</strong> Email delivery service (transactional emails)</li>
                <li><strong>PayPal:</strong> Payment processing (if you choose PayPal)</li>
                <li><strong>Stripe:</strong> Payment processing (if available in your region)</li>
              </ul>
              <p className="mt-4">
                These services have their own privacy policies. We recommend reviewing them.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Data Sharing</h2>
            <div className="space-y-3 text-white/80">
              <p>We do NOT:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Sell your personal information to third parties</li>
                <li>Share your data for advertising purposes</li>
                <li>Access your device screenshots or automation scripts</li>
                <li>Monitor your device usage beyond license verification</li>
              </ul>
              <p className="mt-4">
                We may share data only when:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Required by law or legal process</li>
                <li>To protect our rights or prevent fraud</li>
                <li>With your explicit consent</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
            <div className="space-y-3 text-white/80">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update your account information at any time</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Export your account data</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing emails (transactional emails cannot be disabled)</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at <a href="mailto:support@appsmobs.com" className="text-cyan hover:text-cyan/80">support@appsmobs.com</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Cookies & Tracking</h2>
            <div className="space-y-3 text-white/80">
              <p>
                We use minimal cookies only for authentication sessions. We do not use tracking cookies, 
                analytics cookies, or advertising cookies.
              </p>
              <p>
                Session cookies are essential for maintaining your login state and are automatically deleted 
                when you log out.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
            <p className="text-white/80 leading-relaxed">
              AppsMobs is not intended for users under the age of 18. We do not knowingly collect personal 
              information from children. If you believe we have collected information from a child, please 
              contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. International Data Transfers</h2>
            <p className="text-white/80 leading-relaxed">
              Your data may be processed and stored in servers located outside your country. By using the Service, 
              you consent to the transfer of your data to these locations. We ensure adequate security measures 
              are in place regardless of location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Changes to This Policy</h2>
            <p className="text-white/80 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes via 
              email or through the Service. Continued use after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
            <p className="text-white/80 leading-relaxed">
              For questions about this Privacy Policy or your data, contact us at <a href="mailto:support@appsmobs.com" className="text-cyan hover:text-cyan/80">support@appsmobs.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

