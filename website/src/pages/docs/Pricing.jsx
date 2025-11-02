import DocsLayout from '../DocsLayout'
import { Link } from 'react-router-dom'

export default function Pricing(){
  const toc = [
    { href: '#overview', label: 'Pricing Overview' },
    { href: '#tiers', label: 'License Tiers' },
    { href: '#comparison', label: 'Plan Comparison' },
    { href: '#activation', label: 'Activation & Management' },
    { href: '#renewal', label: 'License Renewal' },
    { href: '#tokens', label: 'Earn Free Licenses with Tokens' },
    { href: '#faq', label: 'FAQ' }
  ]
  
  return (
    <DocsLayout title="Pricing & Licenses" toc={toc}>
      
      <section id="overview" className="doc-section">
        <h2 className="doc-h2">Pricing Overview</h2>
        <p className="doc-p">
          AppsMobs offers flexible licensing options to suit different needs, from personal use to team deployments. 
          All plans include full access to core features, scripting capabilities, and screen mirroring.
        </p>

        <div className="doc-callout bg-green-500/10 border-green-500/30">
          <strong>💡 New:</strong> Earn free license weeks using the <Link to="/docs/referral-rewards" className="text-cyan hover:underline">Referral & Rewards</Link> system! 
          Share your referral link and exchange 100 tokens for 1 week of free license.
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="tiers" className="doc-section">
        <h2 className="doc-h2">📦 License Tiers</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Normal Plan - Personal Use</h3>
          <ul className="doc-list">
            <li><strong>Simultaneous Devices:</strong> 1 device at a time</li>
            <li><strong>Best For:</strong> Personal use, single device automation, learning</li>
            <li><strong>Features:</strong>
              <ul className="doc-list ml-6 mt-2">
                <li>Full screen mirroring with optimized scrcpy</li>
                <li>All quick actions (Wi-Fi, navigation, volume, etc.)</li>
                <li>Python scripting with 35+ functions</li>
                <li>Image detection and automation</li>
                <li>Built-in Playground editor</li>
              </ul>
            </li>
            <li><strong>Price:</strong> Check <Link to="/shop" className="text-cyan hover:underline">Shop</Link> for current pricing</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Pro Plan - Power Users</h3>
          <ul className="doc-list">
            <li><strong>Simultaneous Devices:</strong> 2 devices at once</li>
            <li><strong>Best For:</strong> Power users, small-scale automation, managing multiple devices</li>
            <li><strong>Features:</strong> Everything in Normal, plus:
              <ul className="doc-list ml-6 mt-2">
                <li>Parallel script execution on multiple devices</li>
                <li>Multi-device batch operations</li>
                <li>Enhanced multi-device management</li>
                <li>Priority feature requests</li>
              </ul>
            </li>
            <li><strong>Price:</strong> Check <Link to="/shop" className="text-cyan hover:underline">Shop</Link> for current pricing</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Team Plan - Small Teams</h3>
          <ul className="doc-list">
            <li><strong>Simultaneous Devices:</strong> 5 devices at once</li>
            <li><strong>Best For:</strong> Small teams, larger automation projects, collaboration</li>
            <li><strong>Features:</strong> Everything in Pro, plus:
              <ul className="doc-list ml-6 mt-2">
                <li>Up to 5 simultaneous device connections</li>
                <li>Team collaboration features</li>
                <li>Priority support and faster response times</li>
                <li>Shared script library (coming soon)</li>
              </ul>
            </li>
            <li><strong>Price:</strong> Check <Link to="/shop" className="text-cyan hover:underline">Shop</Link> for current pricing</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">1 Week Plan - Short Term</h3>
          <ul className="doc-list">
            <li><strong>Simultaneous Devices:</strong> 1 device (same as Normal)</li>
            <li><strong>Duration:</strong> 7 days from activation</li>
            <li><strong>Best For:</strong> Testing, short-term projects, trials</li>
            <li><strong>Features:</strong> Full Normal plan features for 7 days</li>
            <li><strong>Note:</strong> Can be purchased multiple times or earned via tokens</li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="comparison" className="doc-section">
        <h2 className="doc-h2">📊 Plan Comparison</h2>
        
        <div className="doc-table-wrapper">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Normal</th>
                <th>Pro</th>
                <th>Team</th>
                <th>1 Week</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Simultaneous Devices</strong></td>
                <td>1</td>
                <td>2</td>
                <td>5</td>
                <td>1</td>
              </tr>
              <tr>
                <td><strong>Screen Mirroring</strong></td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
              </tr>
              <tr>
                <td><strong>Quick Actions</strong></td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
              </tr>
              <tr>
                <td><strong>Python Scripting</strong></td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
              </tr>
              <tr>
                <td><strong>Image Detection</strong></td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
              </tr>
              <tr>
                <td><strong>Playground Editor</strong></td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
              </tr>
              <tr>
                <td><strong>Parallel Script Execution</strong></td>
                <td>❌</td>
                <td>✅</td>
                <td>✅</td>
                <td>❌</td>
              </tr>
              <tr>
                <td><strong>Multi-Device Batch Ops</strong></td>
                <td>❌</td>
                <td>✅</td>
                <td>✅</td>
                <td>❌</td>
              </tr>
              <tr>
                <td><strong>Priority Support</strong></td>
                <td>Standard</td>
                <td>Priority</td>
                <td>Highest</td>
                <td>Standard</td>
              </tr>
              <tr>
                <td><strong>License Duration</strong></td>
                <td>Subscription</td>
                <td>Subscription</td>
                <td>Subscription</td>
                <td>7 days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="activation" className="doc-section">
        <h2 className="doc-h2">🔐 Activation & Management</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">How Activation Works</h3>
          <ol className="doc-list">
            <li><strong>Purchase:</strong> Buy a license from the <Link to="/shop" className="text-cyan hover:underline">Shop</Link> page</li>
            <li><strong>Receive License Key:</strong> License key (format: LIC-XXXXXXXX) sent to your email</li>
            <li><strong>Activate in App:</strong>
              <ul className="doc-list ml-6 mt-2">
                <li>Open AppsMobs Dashboard</li>
                <li>Go to License/Activation section</li>
                <li>Enter your email and license key</li>
                <li>Click "Activate"</li>
              </ul>
            </li>
            <li><strong>Verification:</strong> App contacts server to verify license (internet required)</li>
            <li><strong>Local Token:</strong> Secure token stored locally for offline use</li>
          </ol>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">License Management</h3>
          <p className="doc-p">
            Manage your licenses from your account dashboard:
          </p>
          <ul className="doc-list">
            <li>
              <strong>View Licenses:</strong> See all your active licenses, expiration dates, and assigned machines
            </li>
            <li>
              <strong>Revoke License:</strong> Deactivate a license on one machine to free it up for another
            </li>
            <li>
              <strong>Re-assign:</strong> After revoking, activate the same license key on a different machine
            </li>
            <li>
              <strong>Usage History:</strong> View license activation and usage history
            </li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Offline Usage</h3>
          <ul className="doc-list">
            <li>
              <strong>Works Offline:</strong> Once activated, AppsMobs works completely offline
            </li>
            <li>
              <strong>Token Refresh:</strong> License token refreshes periodically (typically every 30 days)
            </li>
            <li>
              <strong>Refresh Requires Internet:</strong> Need internet connection for token refresh (not daily use)
            </li>
            <li>
              <strong>Extended Offline:</strong> Can work offline for up to the token validity period
            </li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="renewal" className="doc-section">
        <h2 className="doc-h2">🔄 License Renewal</h2>
        
        <div className="doc-subsection">
          <h3 className="doc-h3">Subscription Plans</h3>
          <p className="doc-p">
            Normal, Pro, and Team plans are subscription-based:
          </p>
          <ul className="doc-list">
            <li><strong>Auto-renewal:</strong> Subscriptions renew automatically (check your plan details)</li>
            <li><strong>Billing Cycle:</strong> Monthly or yearly (depends on plan purchased)</li>
            <li><strong>Cancel Anytime:</strong> You can cancel subscription from your account dashboard</li>
            <li><strong>Access Until End:</strong> License remains active until current billing period ends</li>
          </ul>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">1 Week Plans</h3>
          <ul className="doc-list">
            <li><strong>Single Use:</strong> 1 Week licenses are one-time, non-renewing</li>
            <li><strong>Multiple Purchases:</strong> Can purchase multiple 1-week licenses</li>
            <li><strong>Stacking:</strong> Each license adds 7 days from activation date</li>
            <li><strong>Token Exchange:</strong> Can also earn 1-week licenses via tokens (see below)</li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="tokens" className="doc-section">
        <h2 className="doc-h2">🪙 Earn Free Licenses with Tokens</h2>
        <p className="doc-p">
          The <Link to="/docs/referral-rewards" className="text-cyan hover:underline">Referral & Rewards</Link> system lets you earn free license weeks:
        </p>

        <div className="doc-subsection">
          <h3 className="doc-h3">How It Works</h3>
          <ol className="doc-list">
            <li><strong>Share Your Link:</strong> Get your unique referral code from Dashboard</li>
            <li><strong>Friends Sign Up:</strong> People sign up using your referral link</li>
            <li><strong>They Purchase:</strong> When someone you referred makes a purchase</li>
            <li><strong>You Get Tokens:</strong> Receive 10 tokens automatically</li>
            <li><strong>Exchange:</strong> 100 tokens = 1 week of free license</li>
          </ol>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Conversion Rates</h3>
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Referrals Needed</th><th>Tokens Earned</th><th>License Weeks</th></tr>
              </thead>
              <tbody>
                <tr><td>10 referrals</td><td>100 tokens</td><td>1 week ✅</td></tr>
                <tr><td>20 referrals</td><td>200 tokens</td><td>2 weeks ✅</td></tr>
                <tr><td>30 referrals</td><td>300 tokens</td><td>3 weeks ✅</td></tr>
                <tr><td>40 referrals</td><td>400 tokens</td><td>4 weeks ✅ (max per transaction)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="doc-callout bg-cyan/10 border-cyan/30 mt-4">
          <strong>💡 Learn More:</strong> See the complete <Link to="/docs/referral-rewards" className="text-cyan hover:underline">Referral & Rewards</Link> documentation 
          for detailed information about the token system, earning methods, and redemption process.
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="faq" className="doc-section">
        <h2 className="doc-h2">❓ Frequently Asked Questions</h2>

        <div className="doc-subsection">
          <h3 className="doc-h3">Q: Can I use AppsMobs offline?</h3>
          <p className="doc-p">
            <strong>A:</strong> Yes! After initial activation, AppsMobs works completely offline. You only need internet 
            for license activation and periodic token refresh (typically every 30 days).
          </p>
        </div>

        <div className="doc-subsection mt-4">
          <h3 className="doc-h3">Q: Can I use my license on multiple computers?</h3>
          <p className="doc-p">
            <strong>A:</strong> License limits depend on your plan (1 device for Normal, 2 for Pro, 5 for Team). 
            You can revoke a license from one machine and activate it on another, but you cannot use the same license 
            on more devices than your plan allows simultaneously.
          </p>
        </div>

        <div className="doc-subsection mt-4">
          <h3 className="doc-h3">Q: What happens if I revoke a license?</h3>
          <p className="doc-p">
            <strong>A:</strong> Revoking deactivates the license on that machine immediately. The license becomes available 
            to activate on a new machine. All data and settings remain on the original machine - only the license is deactivated.
          </p>
        </div>

        <div className="doc-subsection mt-4">
          <h3 className="doc-h3">Q: Can I upgrade from Normal to Pro?</h3>
          <p className="doc-p">
            <strong>A:</strong> Yes! Contact support with your current license key and request an upgrade. 
            You'll receive a prorated credit toward the Pro plan.
          </p>
        </div>

        <div className="doc-subsection mt-4">
          <h3 className="doc-h3">Q: What payment methods are accepted?</h3>
          <p className="doc-p">
            <strong>A:</strong> We accept Stripe (credit cards), PayPal, and Binance Pay. Visit the <Link to="/shop" className="text-cyan hover:underline">Shop</Link> page 
            to see all available payment options.
          </p>
        </div>

        <div className="doc-subsection mt-4">
          <h3 className="doc-h3">Q: Are there refunds?</h3>
          <p className="doc-p">
            <strong>A:</strong> Refund policies depend on your plan. Contact support with your license key for refund inquiries. 
            Generally, refunds are available within a reasonable time frame after purchase.
          </p>
        </div>

        <div className="doc-subsection mt-4">
          <h3 className="doc-h3">Q: Can I cancel my subscription?</h3>
          <p className="doc-p">
            <strong>A:</strong> Yes, you can cancel your subscription at any time from your account dashboard. 
            Your license remains active until the end of the current billing period. After cancellation, the license will not renew.
          </p>
        </div>

        <div className="doc-subsection mt-4">
          <h3 className="doc-h3">Q: What's the difference between device limit and machine limit?</h3>
          <p className="doc-p">
            <strong>A:</strong> 
            <ul className="doc-list">
              <li><strong>Device limit:</strong> How many Android devices you can control simultaneously (1, 2, or 5)</li>
              <li><strong>Machine limit:</strong> How many Windows PCs can run AppsMobs with the same license (typically 1, but can revoke/reassign)</li>
            </ul>
            Most plans allow 1 machine. You can revoke from one PC and activate on another.
          </p>
        </div>
      </section>

    </DocsLayout>
  )
}
