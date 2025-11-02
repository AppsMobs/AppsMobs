import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Docs from './pages/Docs'
import GettingStarted from './pages/docs/GettingStarted'
import Introduction from './pages/docs/Introduction'
import Quickstart from './pages/docs/Quickstart'
import Concepts from './pages/docs/Concepts'
import Pricing from './pages/docs/Pricing'
import Core from './pages/docs/Core'
import Scripts from './pages/docs/Scripts'
import Playground from './pages/docs/Playground'
import ReferralRewards from './pages/docs/ReferralRewards'
import FAQ from './pages/FAQ'
import Shop from './pages/Shop'
import Register from './pages/Register'
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import ResendVerification from './pages/ResendVerification'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Download from './pages/Download'
import About from './pages/About'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Partnership from './pages/Partnership'
import { PopupProvider } from './components/Popup/PopupManager'
import ChatAIWrapper from './components/ChatAI/ChatAIWrapper'
import SEO from './components/SEO'

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO />
      <Navbar />
      {/* Bannière promotionnelle de lancement */}
      <div className="relative bg-bg border-b border-cyan/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan/5 via-transparent to-purple/5"></div>
        <div className="container relative py-3">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-cyan/10 border border-cyan/30 rounded-full">
                <span className="text-cyan text-sm font-bold">LAUNCH</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-white/80 text-sm">Get</span>
                <span className="text-cyan font-bold text-2xl">70% OFF</span>
                <span className="text-white/80 text-sm">for the first customers</span>
              </div>
            </div>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-sm">Promo code:</span>
              <div className="flex items-center gap-2 px-4 py-2 bg-black/30 border border-white/10 rounded-lg">
                <span className="font-mono font-semibold text-cyan tracking-wider">APPSBLACKFRIDAY25</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('APPSBLACKFRIDAY25');
                  }}
                  className="ml-1 p-1 hover:bg-white/10 rounded transition-colors"
                  title="Copier le code"
                >
                  <svg className="w-4 h-4 text-white/60 hover:text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatAIWrapper />
    </div>
  )
}

export default function App() {
  return (
    <PopupProvider>
      <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={
        <Layout>
          <Home />
        </Layout>
      } />
      <Route path="/docs" element={
        <Layout>
          <GettingStarted />
        </Layout>
      } />
      <Route path="/docs/introduction" element={
        <Layout>
          <Introduction />
        </Layout>
      } />
      <Route path="/docs/getting-started" element={
        <Layout>
          <GettingStarted />
        </Layout>
      } />
      <Route path="/docs/quickstart" element={
        <Layout>
          <Quickstart />
        </Layout>
      } />
      <Route path="/docs/concepts" element={
        <Layout>
          <Concepts />
        </Layout>
      } />
      <Route path="/docs/pricing" element={
        <Layout>
          <Pricing />
        </Layout>
      } />
      <Route path="/docs/core" element={
        <Layout>
          <Core />
        </Layout>
      } />
      <Route path="/docs/scripts" element={
        <Layout>
          <Scripts />
        </Layout>
      } />
      <Route path="/docs/playground" element={
        <Layout>
          <Playground />
        </Layout>
      } />
      <Route path="/docs/referral-rewards" element={
        <Layout>
          <ReferralRewards />
        </Layout>
      } />
      <Route path="/faq" element={
        <Layout>
          <FAQ />
        </Layout>
      } />
      <Route path="/shop" element={
        <Layout>
          <Shop />
        </Layout>
      } />
      <Route path="/register" element={
        <Layout>
          <Register />
        </Layout>
      } />
      <Route path="/login" element={
        <Layout>
          <Login />
        </Layout>
      } />
      <Route path="/verify-email" element={
        <Layout>
          <VerifyEmail />
        </Layout>
      } />
      <Route path="/resend-verification" element={
        <Layout>
          <ResendVerification />
        </Layout>
      } />
      <Route path="/forgot-password" element={
        <Layout>
          <ForgotPassword />
        </Layout>
      } />
      <Route path="/reset-password" element={
        <Layout>
          <ResetPassword />
        </Layout>
      } />
      <Route path="/download" element={
        <Layout>
          <Download />
        </Layout>
      } />
      <Route path="/about" element={
        <Layout>
          <About />
        </Layout>
      } />
      <Route path="/terms" element={
        <Layout>
          <Terms />
        </Layout>
      } />
      <Route path="/privacy" element={
        <Layout>
          <Privacy />
        </Layout>
      } />
      <Route path="/partnership" element={
        <Layout>
          <Partnership />
        </Layout>
      } />
    </Routes>
    </PopupProvider>
  )
}
