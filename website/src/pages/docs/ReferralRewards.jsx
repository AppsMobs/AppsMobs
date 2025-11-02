import DocsLayout from '../DocsLayout'
import { Link } from 'react-router-dom'

export default function ReferralRewards(){
  const toc = [
    { href: '#overview', label: 'Overview' },
    { href: '#referral-system', label: 'Referral System' },
    { href: '#tokens-system', label: 'Tokens System' },
    { href: '#earning-tokens', label: 'Earning Tokens' },
    { href: '#redeeming-tokens', label: 'Redeeming Tokens' },
    { href: '#dashboard', label: 'Dashboard & Tracking' },
    { href: '#examples', label: 'Examples & Use Cases' },
    { href: '#faq', label: 'FAQ' }
  ]
  
  return (
    <DocsLayout title="Referral & Rewards System" toc={toc}>
      
      {/* 🪙 TOKEN LOGO INTEGRATED */}
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
        <img src="/assets/token.png" alt="Token" className="w-16 h-16" />
        <div>
          <h2 className="text-2xl font-bold text-cyan mb-2">Rewards System</h2>
          <p className="text-white/70">Earn tokens by referring friends and exchange them for free licenses</p>
        </div>
      </div>

      <section id="overview" className="doc-section">
        <h2 className="doc-h2">🎁 Overview</h2>
        <p className="doc-p">
          The <strong>Referral & Rewards</strong> system allows you to:
        </p>
        <ul className="doc-list">
          <li>🎯 Generate a unique referral link</li>
          <li>💰 Earn <strong>10 tokens</strong> per referred person who makes a purchase</li>
          <li>🪙 Exchange <strong>100 tokens</strong> for <strong>1 week of free license</strong></li>
          <li>📊 Track your statistics in real-time</li>
        </ul>

        <div className="doc-callout bg-green-500/10 border-green-500/30 mt-4">
          <strong>💡 Related:</strong> Learn how to access your dashboard and manage licenses in the <Link to="/docs/core" className="text-cyan hover:underline">Core Usage</Link> documentation.
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="referral-system" className="doc-section">
        <h2 className="doc-h2">🔗 Referral System</h2>

        <div className="doc-subsection">
          <h3 className="doc-h3">How to get your referral code</h3>
          <p className="doc-p">
            Every registered user automatically receives a <strong>unique referral code</strong> 
            in the format <code>REF-XXXXXXXX</code>.
          </p>

          <div className="doc-code">
            <pre><code className="language-javascript">{`// API: Get your referral code
GET /api/my-referral-code
Headers: { Authorization: "Bearer <token>" }

// Response
{
  "code": "REF-ABC12345",
  "usage_count": 5,
  "referralLink": "https://appsmobs.com/register?ref=REF-ABC12345"
}`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">How to share your link</h3>
          <ol className="doc-list">
            <li>Go to your <strong>Dashboard</strong></li>
            <li>Open the <strong>"Referrals & Tokens"</strong> tab</li>
            <li>Copy your unique link or the <code>REF-XXXXXXXX</code> code</li>
            <li>Share it with friends via email, social media, etc.</li>
          </ol>

          <div className="doc-code">
            <pre><code className="language-plaintext">{`Example referral link:
https://appsmobs.com/register?ref=REF-ABC12345`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">How it works for referred users</h3>
          <p className="doc-p">When someone registers with your link:</p>
          
          <ol className="doc-list">
            <li>✅ The code is <strong>automatically pre-filled</strong> in the registration form</li>
            <li>✅ The user can modify or add another code if they wish</li>
            <li>✅ After registration, a record is created in the database</li>
            <li>⏳ <strong>Tokens are NOT yet awarded</strong> (waiting for a purchase)</li>
          </ol>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Automatic token attribution</h3>
          <p className="doc-p">
            The <strong>10 tokens</strong> are awarded <strong>automatically</strong> when:
          </p>
          
          <ul className="doc-list">
            <li>✅ The referred person used your code during registration</li>
            <li>✅ They make a <strong>purchase</strong> (any plan: Normal, Pro, or Team)</li>
            <li>✅ The <strong>payment is confirmed</strong> (Stripe, PayPal, or Binance)</li>
          </ul>

          <div className="doc-code">
            <pre><code className="language-javascript">{`// Automatic backend function (executed after each purchase)
async function awardReferralTokens(refereeEmail) {
    // 1. Find active referral for this email
    const referral = await findActiveReferral(refereeEmail);
    
    if (!referral) {
        return; // No referral found
    }
    
    // 2. Award 10 tokens to referrer
    const TOKENS_PER_REFERRAL = 10;
    await updateTokens(referral.referrer_email, TOKENS_PER_REFERRAL);
    
    // 3. Mark as completed (won't be re-awarded)
    await markReferralComplete(referral.id);
    
    // 4. Send notification to referrer
    await sendEmail(referral.referrer_email, "10 tokens earned!");
}`}</code></pre>
          </div>

          <div className="doc-callout bg-green-500/10 border-green-500/30 mt-4">
            <strong>✅ Important points:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Tokens are awarded <strong>only once</strong> per referral</li>
              <li>• Regardless of which plan is purchased (Normal, Pro, or Team)</li>
              <li>• Tokens <strong>never expire</strong></li>
              <li>• You can accumulate as many tokens as you want</li>
            </ul>
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="tokens-system" className="doc-section">
        <h2 className="doc-h2">🪙 Tokens System</h2>

        <div className="doc-subsection">
          <h3 className="doc-h3">Token balance</h3>
          <p className="doc-p">
            Your token balance is visible in the Dashboard:
          </p>

          <div className="doc-code">
            <pre><code className="language-javascript">{`// API: Get your balance
GET /api/my-tokens
Headers: { Authorization: "Bearer <token>" }

// Response
{
  "tokens": {
    "tokens": 150,           // Current balance
    "total_earned": 200,     // Total earned since start
    "total_redeemed": 50     // Total redeemed
  }
}`}</code></pre>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Calculation example</h3>
          
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Action</th><th>Tokens</th><th>Balance</th></tr>
              </thead>
              <tbody>
                <tr><td>Initial</td><td>-</td><td>0</td></tr>
                <tr><td>+ Referral 1 (purchase)</td><td>+10</td><td>10</td></tr>
                <tr><td>+ Referral 2 (purchase)</td><td>+10</td><td>20</td></tr>
                <tr><td>+ Referral 3 (purchase)</td><td>+10</td><td>30</td></tr>
                <tr><td>+ Referral 4 (purchase)</td><td>+10</td><td>40</td></tr>
                <tr><td>+ Referral 5 (purchase)</td><td>+10</td><td>50</td></tr>
                <tr><td>...</td><td>...</td><td>...</td></tr>
                <tr><td>+ Referral 10 (purchase)</td><td>+10</td><td><strong>100</strong></td></tr>
                <tr><td>Redeem (1 week)</td><td>-100</td><td>0</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="earning-tokens" className="doc-section">
        <h2 className="doc-h2">💰 Earning Tokens</h2>

        <h3 className="doc-h3">Method 1: Referrals (10 tokens)</h3>
        <p className="doc-p">The main method to earn tokens:</p>
        
        <div className="doc-steps">
          <div className="doc-step">
            <div className="doc-step-number">1</div>
            <div className="doc-step-content">
              <h4>Share your link</h4>
              <p>Copy your unique link from the Dashboard and share it</p>
            </div>
          </div>
          
          <div className="doc-step">
            <div className="doc-step-number">2</div>
            <div className="doc-step-content">
              <h4>Someone registers</h4>
              <p>A new person registers with your link</p>
            </div>
          </div>
          
          <div className="doc-step">
            <div className="doc-step-number">3</div>
            <div className="doc-step-content">
              <h4>They make a purchase</h4>
              <p>The referred person purchases a subscription (any plan)</p>
            </div>
          </div>
          
          <div className="doc-step">
            <div className="doc-step-number">4</div>
            <div className="doc-step-content">
              <h4>You receive 10 tokens</h4>
              <p>Tokens are automatically added to your account</p>
            </div>
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="redeeming-tokens" className="doc-section">
        <h2 className="doc-h2">🔄 Redeeming Tokens</h2>

        <div className="doc-subsection">
          <h3 className="doc-h3">Conversion</h3>
          <div className="doc-callout bg-cyan/10 border-cyan/30 text-center">
            <div className="text-4xl mb-2">🪙 100 Tokens = 1 Week License</div>
            <p className="text-sm text-white/70">Maximum 4 weeks per transaction (400 tokens)</p>
          </div>

          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr><th>Weeks</th><th>Tokens Required</th><th>Equivalent</th></tr>
              </thead>
              <tbody>
                <tr><td>1 week</td><td>100 tokens</td><td>10 referrals</td></tr>
                <tr><td>2 weeks</td><td>200 tokens</td><td>20 referrals</td></tr>
                <tr><td>3 weeks</td><td>300 tokens</td><td>30 referrals</td></tr>
                <tr><td>4 weeks</td><td>400 tokens</td><td>40 referrals (max per transaction)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">How to redeem</h3>
          
          <div className="doc-code">
            <pre><code className="language-javascript">{`// API: Redeem tokens
POST /api/redeem-tokens
Headers: { Authorization: "Bearer <token>" }
Body: {
  "weeks": 1  // Number of weeks (1-4)
}

// Response
{
  "message": "1 week license created",
  "license": {
    "key": "LIC-ABC123...",
    "plan": "normal",
    "expires_at": 1735689600
  },
  "tokens": {
    "remaining": 50,
    "total_earned": 200,
    "total_redeemed": 150
  }
}`}</code></pre>
          </div>

          <ol className="doc-list mt-4">
            <li>Go to <strong>Dashboard → Referrals & Tokens</strong></li>
            <li>Select number of weeks (1-4)</li>
            <li>Click <strong>"🪙 Redeem X tokens"</strong></li>
            <li>License is automatically created and sent by email</li>
          </ol>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Redeemed license characteristics</h3>
          <ul className="doc-list">
            <li>✅ <strong>Normal Plan</strong> (1 simultaneous device)</li>
            <li>✅ <strong>All features</strong> of Normal plan</li>
            <li>✅ <strong>Non-refundable</strong> (cannot be converted back to tokens)</li>
            <li>✅ <strong>Same conditions</strong> as purchased licenses</li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="dashboard" className="doc-section">
        <h2 className="doc-h2">📊 Dashboard & Tracking</h2>

        <div className="doc-subsection">
          <h3 className="doc-h3">Referrals & Tokens section</h3>
          <p className="doc-p">
            In your Dashboard, the <strong>"Referrals & Tokens"</strong> tab displays:
          </p>
          
          <div className="doc-table-wrapper mt-4">
            <table className="doc-table">
              <thead>
                <tr><th>Element</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Your Code</strong></td>
                  <td>Unique code <code>REF-XXXXXXXX</code> with copy button</td>
                </tr>
                <tr>
                  <td><strong>Share Link</strong></td>
                  <td>Complete URL ready to share</td>
                </tr>
                <tr>
                  <td><strong>Statistics</strong></td>
                  <td>Number of registrations, tokens earned</td>
                </tr>
                <tr>
                  <td><strong>Token Balance</strong></td>
                  <td>Available tokens, total earned, total redeemed</td>
                </tr>
                <tr>
                  <td><strong>History</strong></td>
                  <td>List of referrals and redemptions</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="examples" className="doc-section">
        <h2 className="doc-h2">💡 Examples & Use Cases</h2>

        <div className="doc-subsection">
          <h3 className="doc-h3">Use case 1: Earn 1 free week</h3>
          <p className="doc-p">
            <strong>Goal:</strong> Exchange 100 tokens for 1 free week
          </p>
          
          <ol className="doc-list">
            <li>Share your link with <strong>10 friends</strong></li>
            <li>Each of them registers with your link</li>
            <li>Each of them purchases a subscription (even the Normal plan)</li>
            <li>You receive <strong>10 tokens × 10 = 100 tokens</strong></li>
            <li>Exchange for <strong>1 free week</strong> ✅</li>
          </ol>

          <div className="doc-callout bg-blue-500/10 border-blue-500/30">
            <strong>⏱️ Estimated time:</strong> Variable depending on your network, but it's completely free for you!
          </div>
        </div>

        <div className="doc-subsection mt-6">
          <h3 className="doc-h3">Use case 2: Maximize tokens</h3>
          <p className="doc-p">
            <strong>Strategy:</strong> Accumulate maximum tokens
          </p>
          
          <ul className="doc-list">
            <li>✅ Share your link on social media</li>
            <li>✅ Create content (tutorials, videos) mentioning AppsMobs</li>
            <li>✅ Tokens never expire - accumulate as much as you want</li>
            <li>✅ Redeem when needed (minimum 100 tokens required)</li>
          </ul>
        </div>
      </section>

      <hr className="doc-hr" />

      <section id="faq" className="doc-section">
        <h2 className="doc-h2">❓ FAQ - Tokens & Referral</h2>

        <div className="doc-subsection">
          <h3 className="doc-h3">Q: Do tokens expire?</h3>
          <p className="doc-p">
            <strong>A:</strong> No, tokens never expire. Accumulate them at your own pace.
          </p>
        </div>

        <div className="doc-subsection mt-4">
          <h3 className="doc-h3">Q: Can I use multiple referral codes?</h3>
          <p className="doc-p">
            <strong>A:</strong> No, during registration, only one code can be used. 
            If multiple codes are provided, only the first one is taken into account.
          </p>
        </div>

        <div className="doc-subsection mt-4">
          <h3 className="doc-h3">Q: What happens if someone uses my code but purchases later?</h3>
          <p className="doc-p">
            <strong>A:</strong> Tokens are awarded <strong>when the purchase is made</strong>, not during registration. 
            If the person purchases in 1 week or 1 month, you will always receive the 10 tokens.
          </p>
        </div>

        <div className="doc-subsection mt-4">
          <h3 className="doc-h3">Q: Can I redeem less than 100 tokens?</h3>
          <p className="doc-p">
            <strong>A:</strong> No, the minimum is 100 tokens (1 week). 
            You can redeem 1, 2, 3 or 4 weeks maximum per transaction.
          </p>
        </div>

        <div className="doc-subsection mt-4">
          <h3 className="doc-h3">Q: Do licenses redeemed with tokens have the same features?</h3>
          <p className="doc-p">
            <strong>A:</strong> Yes, they are identical to purchased Normal plan licenses, 
            with all complete features.
          </p>
        </div>
      </section>

    </DocsLayout>
  )
}
