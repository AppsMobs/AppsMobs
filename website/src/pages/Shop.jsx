import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';

// Initialiser Stripe
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

export default function Shop() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDuration, setSelectedDuration] = useState(1); // 1, 3, 6, 12 months
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'stripe' or 'paypal'
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Discount code states
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [discountCode, setDiscountCode] = useState(null); // { code: 'CODE20', percent: 20, description: '...' }
  const [discountCodeError, setDiscountCodeError] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);

  // Calculate discount percentages
  const discounts = {
    1: 0,
    3: 5, // 5% off
    6: 10, // 10% off
    12: 20 // 20% off
  };

  // Base monthly prices
  const basePrices = {
    normal: 9,
    pro: 15,
    team: 45
  };

  // Calculate final prices with discount (duration + discount code)
  const calculatePrice = (plan) => {
    if (plan === 'week') {
      // Plan 1 semaine acheté avec jetons
      return {
        monthly: 0,
        total: 0,
        savings: 0,
        discountPercent: 0,
        isTokenPlan: true,
        tokenPrice: 100
      };
    }
    const basePrice = basePrices[plan];
    const durationDiscountPercent = discounts[selectedDuration];
    const total = basePrice * selectedDuration;
    const durationDiscount = total * (durationDiscountPercent / 100);
    const priceAfterDuration = total - durationDiscount;
    
    // Appliquer le code de réduction sur le prix après réduction de durée
    const codeDiscountPercent = discountCode ? discountCode.percent : 0;
    const codeDiscount = priceAfterDuration * (codeDiscountPercent / 100);
    const finalPrice = priceAfterDuration - codeDiscount;
    
    return {
      monthly: basePrice,
      total: finalPrice,
      savings: durationDiscount + codeDiscount,
      discountPercent: durationDiscountPercent,
      codeDiscount: codeDiscount,
      codeDiscountPercent: codeDiscountPercent,
      originalTotal: total,
      afterDurationDiscount: priceAfterDuration
    };
  };

  // Verify discount code
  const verifyDiscountCode = async () => {
    if (!discountCodeInput.trim()) {
      setDiscountCodeError('Please enter a discount code');
      return;
    }

    setVerifyingCode(true);
    setDiscountCodeError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/discount/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          code: discountCodeInput.trim().toUpperCase()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setDiscountCodeError(data.error || 'Invalid discount code');
        setDiscountCode(null);
        return;
      }

      // Code valide
      setDiscountCode({
        code: discountCodeInput.trim().toUpperCase(),
        percent: data.discount_percent,
        description: data.description || `Réduction de ${data.discount_percent}%`
      });
      setDiscountCodeError('');
      setSuccess(`Discount code applied! ${data.discount_percent}% off`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setDiscountCodeError('Error verifying code. Please try again.');
      setDiscountCode(null);
    } finally {
      setVerifyingCode(false);
    }
  };

  // Remove discount code
  const removeDiscountCode = () => {
    setDiscountCode(null);
    setDiscountCodeInput('');
    setDiscountCodeError('');
  };

  const [userTokens, setUserTokens] = useState(0);

  // Charger les jetons de l'utilisateur
  useEffect(() => {
    if (isAuthenticated) {
      loadUserTokens();
    }
  }, [isAuthenticated]);

  const loadUserTokens = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/my-tokens`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserTokens(data.tokens?.tokens || 0);
      }
    } catch (err) {
      console.error('Error loading tokens:', err);
    }
  };

  const plans = [
    {
      name: '1 Week Trial',
      plan: 'week',
      badge: 'Token Purchase',
      isTokenPlan: true,
      tokenPrice: 100,
      features: [
        '1 Simultaneous Device',
        'All core AppsMobs features',
        'Automated script execution',
        'Unlimited screenshots',
        'Detailed activity logs',
        'Perfect for testing'
      ],
      popular: false
    },
    {
      name: 'Normal',
      plan: 'normal',
      badge: null,
      features: [
        '1 Simultaneous Device',
        'All core AppsMobs features',
        'Automated script execution',
        'Unlimited screenshots',
        'Detailed activity logs',
        'Email support (48h response)',
        'Automatic updates'
      ],
      popular: false
    },
    {
      name: 'Pro',
      plan: 'pro',
      badge: 'Most Popular',
      features: [
        '2 Simultaneous Devices',
        'All Normal plan features',
        'Advanced automation tools',
        'Custom script creation',
        'Priority email support (24h response)',
        'API access',
        'Advanced analytics & reports'
      ],
      popular: true
    },
    {
      name: 'Team',
      plan: 'team',
      badge: 'Best Value',
      features: [
        '5 Simultaneous Devices',
        'All Pro plan features',
        'Team collaboration tools',
        'User management & permissions',
        'Enterprise support (12h response)',
        'SSO integration',
        'Audit logs & compliance',
        'Dedicated account manager'
      ],
      popular: false
    }
  ];

  const durations = [
    { value: 1, label: '1 Month', savings: null },
    { value: 3, label: '3 Months', savings: 'Save 5%' },
    { value: 6, label: '6 Months', savings: 'Save 10%' },
    { value: 12, label: '12 Months', savings: 'Save 20%' }
  ];

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedPlan(plan);
    setPaymentMethod(null);
    setError('');
    setSuccess('');
  };

  const handleTokenPurchase = async () => {
    if (!selectedPlan || !selectedPlan.isTokenPlan) return;

    setLoading({ [selectedPlan.plan]: true });
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/redeem-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          weeks: 1
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Error purchasing with tokens');
        setLoading({ [selectedPlan.plan]: false });
        return;
      }

      setSuccess('License purchased successfully with tokens! Check your email for the license key.');
      setSelectedPlan(null);
      setLoading({ [selectedPlan.plan]: false });
      
      // Recharger les jetons
      loadUserTokens();
      
      // Recharger après 3 secondes pour mettre à jour l'affichage
      setTimeout(() => {
        loadUserTokens();
      }, 3000);
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading({ [selectedPlan.plan]: false });
    }
  };

  // Vérifier le succès du paiement au chargement
  useEffect(() => {
    const success = searchParams.get('success');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && sessionId) {
      // Paiement Stripe réussi
      verifyStripePayment(sessionId);
      // Nettoyer l'URL
      setSearchParams({});
    }
  }, [searchParams]);

  const [binanceData, setBinanceData] = useState(null);

  const handlePayment = async (method) => {
    if (!selectedPlan) return;

    setError('');
    setSuccess('');

    if (method === 'stripe') {
      setPaymentMethod('stripe');
      await handleStripePayment();
    } else if (method === 'paypal') {
      // Pour PayPal, on affiche directement les boutons qui créeront la commande
      if (!PAYPAL_CLIENT_ID) {
        setError('PayPal n\'est pas configuré. Vérifiez que VITE_PAYPAL_CLIENT_ID est défini dans votre fichier .env');
        return;
      }
      setPaymentMethod('paypal');
      console.log('PayPal sélectionné, Client ID:', PAYPAL_CLIENT_ID);
    } else if (method === 'binance') {
      setPaymentMethod('binance');
    }
  };


  const handleBinancePayment = async () => {
    if (!selectedPlan) return;

    setLoading({ [selectedPlan.plan]: true });
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/create-binance-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: selectedPlan.plan,
          months: selectedDuration,
          discount_code: discountCode?.code || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la création de la commande Binance');
        setLoading({ [selectedPlan.plan]: false });
        return;
      }

      setBinanceData(data);
      setSuccess(`Commande Binance créée ! Référence: ${data.reference}`);
      setLoading({ [selectedPlan.plan]: false });
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
      setLoading({ [selectedPlan.plan]: false });
    }
  };

  const handleStripePayment = async () => {
    if (!stripePromise) {
      setError('Stripe n\'est pas configuré. Contactez le support.');
      return;
    }

    setLoading({ [selectedPlan.plan]: true });

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/create-stripe-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: selectedPlan.plan,
          months: selectedDuration,
          discount_code: discountCode?.code || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la création de la session de paiement');
        setLoading({ [selectedPlan.plan]: false });
        return;
      }

      // Rediriger vers Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
      setLoading({ [selectedPlan.plan]: false });
    }
  };


  const verifyStripePayment = async (sessionId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/verify-stripe-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la vérification du paiement');
        return;
      }

      setSuccess(data.message || 'Paiement réussi ! Votre licence a été créée et un email a été envoyé.');
      setSelectedPlan(null);
    } catch (err) {
      setError('Erreur lors de la vérification du paiement');
    }
  };

  const handlePayPalApprove = async (data, actions) => {
    return actions.order.capture().then(async (details) => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/api/capture-paypal-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ orderId: data.orderID })
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Erreur lors de la capture du paiement');
          return;
        }

        setSuccess(result.message || 'Paiement réussi ! Votre licence a été créée et un email a été envoyé.');
        setSelectedPlan(null);
        setPaypalOrderId(null);
        // Réinitialiser le code de réduction après paiement réussi
        if (discountCode) {
          removeDiscountCode();
        }
      } catch (err) {
        setError('Erreur lors de la capture du paiement');
      }
    });
  };

  const handlePurchase = async (planData) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setError('');
    setSuccess('');
    setLoading({ [planData.plan]: true });

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/api/purchase-license`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: planData.plan,
          months: selectedDuration,
          discount_code: discountCode?.code || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de l\'achat');
        setLoading({ [planData.plan]: false });
        return;
      }

      setSuccess(`Licence ${planData.name} achetée avec succès ! Un email avec votre clé de licence a été envoyé.`);
      setLoading({ [planData.plan]: false });
      setSelectedPlan(null);
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
      setLoading({ [planData.plan]: false });
    }
  };

  return (
    <div className="min-h-screen py-16">
      {/* Hero Section */}
      <section className="container mb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="hero-badge mb-6 inline-flex">
            <span className="dot" />
            <span className="label">Choose Your Plan</span>
          </div>
          <h1 className="hero-title mb-6">
            Select Your License Plan
          </h1>
          <p className="hero-subtitle">
            Choose the perfect plan for your automation needs. All plans include full access to AppsMobs features with flexible duration options.
          </p>
        </div>
      </section>

      {/* Duration Selector - Simple & Practical (masqué pour le plan 1 semaine) */}
      {selectedPlan?.plan !== 'week' && (
      <section className="container mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Select Billing Duration</h3>
              <div className="flex items-center gap-2">
                {discounts[selectedDuration] > 0 && (
                  <span className="text-sm font-medium text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full">
                    {discounts[selectedDuration]}% OFF
                  </span>
                )}
                {discountCode && (
                  <span className="text-sm font-medium text-cyan-400 bg-cyan-500/20 px-3 py-1 rounded-full">
                    +{discountCode.percent}% Code
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {durations.map((duration) => {
                const isSelected = selectedDuration === duration.value;
                return (
                  <button
                    key={duration.value}
                    onClick={() => setSelectedDuration(duration.value)}
                    className={`relative flex items-center gap-2 px-5 py-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/20'
                        : 'border-white/10 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10'
                    }`}
                  >
                    <span className={`font-medium ${
                      isSelected ? 'text-white' : 'text-white/80'
                    }`}>
                      {duration.label}
                    </span>
                    {duration.savings && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        isSelected 
                          ? 'bg-emerald-500/30 text-emerald-300' 
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {duration.savings}
                      </span>
                    )}
                    {isSelected && (
                      <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      )}


      {/* Plans Grid */}
      <section className="container mb-16">
        <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const pricing = calculatePrice(plan.plan);
            const isSelected = selectedPlan?.plan === plan.plan;
            
            return (
              <div
                key={plan.plan}
                className={`relative glass rounded-2xl p-8 flex flex-col transition-all ${
                  plan.popular
                    ? 'ring-2 ring-cyan/50 shadow-2xl shadow-cyan/20 scale-105'
                    : ''
                } ${
                  isSelected
                    ? 'ring-2 ring-cyan shadow-xl'
                    : 'hover:scale-[1.02] hover:shadow-xl'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan to-purple-500 text-bg px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                      {plan.badge}
                    </span>
        </div>
      )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-3xl font-bold mb-2">{plan.name}</h3>
                  {plan.isTokenPlan ? (
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-cyan text-4xl font-extrabold">
                        {plan.tokenPrice}
                      </span>
                      <span className="text-white/50 text-lg">tokens</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-cyan text-4xl font-extrabold">
                          €{pricing.monthly.toFixed(0)}
                        </span>
                        <span className="text-white/50 text-lg">/month</span>
                      </div>
                      <div className="space-y-1">
                        {(pricing.discountPercent > 0 || pricing.codeDiscountPercent > 0) && (
                          <div className="text-sm text-green-400">
                            {pricing.discountPercent > 0 && (
                              <div>Duration: -{pricing.discountPercent}% (€{(pricing.originalTotal - pricing.afterDurationDiscount).toFixed(2)})</div>
                            )}
                            {pricing.codeDiscountPercent > 0 && (
                              <div>Code: -{pricing.codeDiscountPercent}% (€{pricing.codeDiscount.toFixed(2)})</div>
                            )}
                            <div className="font-semibold mt-1">
                              Total savings: €{pricing.savings.toFixed(2)}
                            </div>
                          </div>
                        )}
                        {pricing.codeDiscountPercent > 0 && pricing.discountPercent > 0 && (
                          <div className="text-white/40 text-xs line-through">
                            €{pricing.originalTotal.toFixed(2)} → €{pricing.afterDurationDiscount.toFixed(2)} → €{pricing.total.toFixed(2)}
                          </div>
                        )}
                        <div className="text-white/60 text-sm font-medium">
                          €{pricing.total.toFixed(2)} for {selectedDuration} {selectedDuration === 1 ? 'month' : 'months'}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-cyan mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-white/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {!isSelected ? (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={!isAuthenticated}
                    className="btn-pill cyan w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="btn-label">
                      {!isAuthenticated ? 'Sign In to Purchase' : plan.isTokenPlan ? 'Purchase with Tokens' : 'Select Plan'}
                    </span>
                  </button>
                ) : plan.isTokenPlan ? (
                  <div className="space-y-3">
                    {userTokens >= plan.tokenPrice ? (
                      <button
                        onClick={handleTokenPurchase}
                        disabled={loading[plan.plan]}
                        className="btn-pill purple w-full justify-center disabled:opacity-50"
                      >
                        <span className="btn-label">
                          {loading[plan.plan] ? 'Processing...' : `Purchase for ${plan.tokenPrice} Tokens`}
                        </span>
                      </button>
                    ) : (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
                        <p className="text-red-400 text-sm mb-2">Insufficient Tokens</p>
                        <p className="text-white/60 text-xs">
                          You have {userTokens} tokens, but need {plan.tokenPrice}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Discount Code Section - Affiché AVANT le choix de méthode de paiement */}
                    {selectedPlan && selectedPlan.plan !== 'week' && (
                      <div className="mb-4 p-4 bg-black/20 border border-white/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h4 className="text-sm font-semibold text-white">Have a discount code?</h4>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={discountCodeInput}
                              onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !verifyingCode) {
                                  verifyDiscountCode();
                                }
                              }}
                              placeholder="Enter discount code"
                              disabled={verifyingCode || !!discountCode}
                              className={`w-full bg-black/30 border rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all ${
                                discountCodeError
                                  ? 'border-red-500 focus:ring-red-500/50'
                                  : discountCode
                                  ? 'border-green-500 focus:ring-green-500/50'
                                  : 'border-white/10 focus:ring-cyan/50 focus:border-cyan/50'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            />
                            {discountCodeError && (
                              <p className="text-red-400 text-xs mt-1">{discountCodeError}</p>
                            )}
                            {discountCode && (
                              <div className="mt-1 flex items-center gap-2">
                                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-green-400 text-xs font-medium">
                                  {discountCode.description || `${discountCode.percent}% discount applied`}
                                </span>
                                <button
                                  onClick={removeDiscountCode}
                                  className="ml-auto text-white/60 hover:text-white text-xs underline"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={verifyDiscountCode}
                            disabled={verifyingCode || !!discountCode || !discountCodeInput.trim()}
                            className="px-4 py-2 bg-gradient-to-r from-cyan to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 disabled:from-white/10 disabled:to-white/5 disabled:text-white/40 rounded-lg text-white text-sm font-semibold transition-all shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
                          >
                            {verifyingCode ? 'Verifying...' : discountCode ? 'Applied ✓' : 'Apply'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Prix final calculé avec réduction */}
                    {selectedPlan && selectedPlan.plan !== 'week' && (
                      <div className="mb-4 p-4 bg-cyan/5 border border-cyan/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-sm">Total to pay:</span>
                          <span className="text-cyan font-bold text-xl">
                            €{calculatePrice(selectedPlan.plan).total.toFixed(2)}
                          </span>
                        </div>
                        {calculatePrice(selectedPlan.plan).savings > 0 && (
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-green-400">Savings:</span>
                            <span className="text-green-400 font-semibold">
                              -€{calculatePrice(selectedPlan.plan).savings.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Choix de méthode de paiement - Affiché après l'application du code */}
                    <div className="text-center text-sm text-white/60 mb-4">
                      Choose payment method:
                    </div>

                    {/* PayPal Payment */}
                    {paymentMethod === 'paypal' && PAYPAL_CLIENT_ID && (
                      <div className="w-full">
                        <PayPalScriptProvider options={{ 
                          clientId: PAYPAL_CLIENT_ID,
                          currency: 'EUR'
                        }}>
                          <PayPalButtons
                            createOrder={async () => {
                              try {
                                const token = localStorage.getItem('authToken');
                                if (!token) {
                                  throw new Error('Vous devez être connecté');
                                }
                                const response = await fetch(`${API_URL}/api/create-paypal-order`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({
                                    plan: selectedPlan.plan,
                                    months: selectedDuration,
                                    discount_code: discountCode?.code || null
                                  })
                                });
                                const data = await response.json();
                                if (!response.ok) {
                                  throw new Error(data.error || 'Erreur lors de la création de la commande');
                                }
                                return data.orderId;
                              } catch (error) {
                                setError(error.message || 'Erreur lors de la création de la commande PayPal');
                                throw error;
                              }
                            }}
                            onApprove={handlePayPalApprove}
                            onError={(err) => {
                              console.error('Erreur PayPal:', err);
                              setError('Erreur lors du paiement PayPal: ' + (err.message || 'Erreur inconnue'));
                            }}
                            onCancel={(data) => {
                              console.log('Paiement PayPal annulé:', data);
                              setError('');
                            }}
                            style={{
                              layout: 'vertical',
                              color: 'blue',
                              shape: 'rect',
                              label: 'paypal'
                            }}
                          />
                        </PayPalScriptProvider>
        </div>
      )}

                    {/* Message si PayPal n'est pas configuré */}
                    {paymentMethod === 'paypal' && !PAYPAL_CLIENT_ID && (
                      <div className="w-full p-4 rounded-lg bg-yellow-500/20 border border-yellow-500 text-yellow-300 text-center">
                        PayPal n'est pas configuré. Veuillez ajouter VITE_PAYPAL_CLIENT_ID dans votre fichier .env
        </div>
      )}

                    {/* Binance Success */}
                    {binanceData && (
                      <div className="w-full p-4 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 text-yellow-100">
                        <h4 className="font-bold mb-3 text-lg flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.138 8.853l3.79 3.79 3.787-3.79L18.67 10.15l-3.786 3.79 3.79 3.79-1.277 1.276-3.79-3.788-3.79 3.79-1.278-1.278 3.79-3.79-3.788-3.79 1.278-1.276z"/>
                          </svg>
                          Commande Binance créée !
                        </h4>
                        
                        <div className="bg-yellow-900/30 rounded-lg p-3 mb-3 border border-yellow-600/30">
                          <p className="text-sm mb-1 font-semibold">Référence de paiement :</p>
                          <p className="text-lg font-mono font-bold text-yellow-300 mb-2">{binanceData.reference}</p>
                          <p className="text-sm mb-1 font-semibold">Montant à payer :</p>
                          <p className="text-xl font-bold text-yellow-300">€{binanceData.amount.toFixed(2)}</p>
                        </div>

                        <div className="bg-blue-900/30 rounded-lg p-3 mb-3 border border-blue-600/30">
                          <h5 className="font-bold mb-2 text-blue-300 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Procédure à suivre :
                          </h5>
                          <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Effectuez le paiement en crypto via Binance avec le montant exact : <strong className="text-yellow-300">€{binanceData.amount.toFixed(2)}</strong></li>
                            <li><strong className="text-yellow-300">Envoyez la référence suivante au support :</strong></li>
                            <li className="ml-4 font-mono text-yellow-300 bg-yellow-900/50 px-2 py-1 rounded">{binanceData.reference}</li>
                            <li>Contactez-nous à <a href="mailto:support@appsmobs.com" className="text-blue-400 hover:text-blue-300 underline">support@appsmobs.com</a> avec :
                              <ul className="list-disc list-inside ml-4 mt-1">
                                <li>Votre référence de paiement</li>
                                <li>La preuve de paiement (screenshot ou hash de transaction)</li>
            </ul>
                            </li>
                            <li>Nous validerons votre paiement sous <strong className="text-green-300">24-48 heures</strong></li>
                            <li>Une fois validé, vous recevrez votre <strong className="text-green-300">clé de licence par email</strong></li>
                          </ol>
                        </div>

                        <div className="bg-green-900/30 rounded-lg p-3 border border-green-600/30">
                          <p className="text-xs text-green-300 flex items-start gap-2">
                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span><strong>Email de support :</strong> <a href="mailto:support@appsmobs.com" className="underline hover:text-green-200">support@appsmobs.com</a></span>
                          </p>
                        </div>
                      </div>
                    )}


                    {/* Binance Payment */}
                    {paymentMethod === 'binance' && (
                      <div className="w-full space-y-4">
                        <button
                          onClick={handleBinancePayment}
                          disabled={loading[plan.plan]}
                          className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold hover:from-yellow-600 hover:to-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.138 8.853l3.79 3.79 3.787-3.79L18.67 10.15l-3.786 3.79 3.79 3.79-1.277 1.276-3.79-3.788-3.79 3.79-1.278-1.278 3.79-3.79-3.788-3.79 1.278-1.276z"/>
                          </svg>
                          Payer avec Binance
                        </button>
        </div>
      )}

                    {/* Payment Method Selector */}
                    {!paymentMethod && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePayment('paypal');
                          }}
                          disabled={loading[plan.plan] || !PAYPAL_CLIENT_ID}
                          className="px-4 py-3 rounded-lg bg-[#0070ba] text-white font-semibold hover:bg-[#005ea6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.195a.641.641 0 0 1-.633.74ZM6.02 1.802l-2.19 14.065h4.194c3.793 0 6.747-1.477 7.677-5.64.046-.249.08-.494.103-.732.218-1.589.086-2.731-.365-3.664-.53-1.083-1.732-1.603-3.373-1.603h-5.047l-.792 5.04H6.02Z"/>
                          </svg>
                          PayPal
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePayment('binance');
                          }}
                          disabled={loading[plan.plan]}
                          className="px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold hover:from-yellow-600 hover:to-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.138 8.853l3.79 3.79 3.787-3.79L18.67 10.15l-3.786 3.79 3.79 3.79-1.277 1.276-3.79-3.788-3.79 3.79-1.278-1.278 3.79-3.79-3.788-3.79 1.278-1.276z"/>
                          </svg>
                          Binance
                        </button>
        </div>
      )}

            <button
                      onClick={() => {
                        setSelectedPlan(null);
                        setPaymentMethod(null);
                        setBinanceData(null);
                      }}
                      className="w-full py-2 text-sm text-white/60 hover:text-white transition-colors"
                    >
                      Cancel
            </button>
          </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Error/Success Messages */}
      {error && (
        <div className="container max-w-2xl mb-8">
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-6 py-4 rounded-xl">
          {error}
          </div>
        </div>
      )}

      {success && (
        <div className="container max-w-2xl mb-8">
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-6 py-4 rounded-xl">
          {success}
          </div>
        </div>
      )}

      {/* FAQ Section - Compact Design */}
      <section className="container mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-white/60 text-sm">Everything you need to know about AppsMobs licenses</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            {[
              {
                category: 'Plans & Features',
                questions: [
                  {
                    q: 'What\'s the difference between plans?',
                    a: 'The main difference is the number of simultaneous devices: Normal (1), Pro (2), and Team (5). All plans include full AppsMobs features.'
                  },
                  {
                    q: 'Can I upgrade or downgrade my plan?',
                    a: 'Yes, you can change your plan at any time. Contact support@appsmobs.com and we\'ll handle the transition with prorated billing.'
                  },
                  {
                    q: 'What happens if I exceed my device limit?',
                    a: 'You\'ll need to disconnect a device before connecting a new one, or upgrade to a plan with more simultaneous device slots.'
                  },
                  {
                    q: 'Do all plans have the same features?',
                    a: 'All plans include core features. Pro adds advanced tools, API access, and analytics. Team adds collaboration, SSO, and dedicated support.'
                  }
                ]
              },
              {
                category: 'Payment & Billing',
                questions: [
                  {
                    q: 'What payment methods do you accept?',
                    a: 'We accept PayPal and Binance Pay. PayPal processes instantly. Binance Pay requires manual verification (24-48h).'
                  },
                  {
                    q: 'How long does Binance Pay take?',
                    a: 'After payment, send your reference to support@appsmobs.com with proof. We validate within 24-48 hours and email your license key.'
                  },
                  {
                    q: 'Can I pay annually?',
                    a: 'Yes! Choose the 12-month duration for a 20% discount. You can also select 3 or 6 months with 5% and 10% discounts respectively.'
                  },
                  {
                    q: 'Do you offer refunds?',
                    a: 'We offer a 14-day money-back guarantee for new subscriptions. Contact support@appsmobs.com with your license key for refund requests.'
                  }
                ]
              },
              {
                category: 'License & Activation',
                questions: [
                  {
                    q: 'How do I activate my license?',
                    a: 'After purchase, you\'ll receive your license key via email. Enter your email and license key in the AppsMobs desktop app to activate.'
                  },
                  {
                    q: 'Can I use my license on multiple computers?',
                    a: 'Yes, but only up to your plan\'s simultaneous device limit. You can revoke and reassign devices from your account dashboard.'
                  },
                  {
                    q: 'What if I lose my license key?',
                    a: 'Contact support@appsmobs.com with your registered email address. We can resend your license key or help you access your account.'
                  },
                  {
                    q: 'How long is my license valid?',
                    a: 'License duration depends on your subscription: 1, 3, 6, or 12 months. Your license remains active until the end of the billing period.'
                  }
                ]
              },
              {
                category: 'Support & Updates',
                questions: [
                  {
                    q: 'What kind of support do you offer?',
                    a: 'Normal: Email support (48h), Pro: Priority support (24h), Team: Enterprise support (12h) + dedicated account manager.'
                  },
                  {
                    q: 'Are updates included?',
                    a: 'Yes! All plans include automatic updates with new features, bug fixes, and security patches at no additional cost.'
                  },
                  {
                    q: 'Can I cancel my subscription?',
                    a: 'Yes, you can cancel anytime. Your license remains active until the end of your current billing period. No partial refunds for unused time.'
                  },
                  {
                    q: 'How do I contact support?',
                    a: 'Email us at support@appsmobs.com. Include your license key or email for faster assistance. Response times vary by plan.'
                  }
                ]
              }
            ].map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-2">
                <h3 className="text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider">
                  {section.category}
                </h3>
                {section.questions.map((faq, index) => (
                  <details
                    key={index}
                    className="group glass rounded-lg p-3 border border-white/5 hover:border-white/10 transition-all cursor-pointer open:bg-white/5"
                  >
                    <summary className="flex items-start justify-between gap-2 list-none cursor-pointer">
                      <span className="text-sm font-medium text-white/90 group-open:text-white pr-4">
                        {faq.q}
                      </span>
                      <svg 
                        className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5 transform transition-transform group-open:rotate-180" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="text-xs text-white/70 mt-2 pl-0 leading-relaxed">
                      {faq.a}
                    </p>
                  </details>
                ))}
          </div>
        ))}
      </div>
    </div>
      </section>

      {/* Auth Notice */}
      {!isAuthenticated && (
        <div className="container max-w-2xl">
          <div className="glass rounded-xl p-6 text-center">
            <p className="text-white/80 mb-4">
              You need to be logged in to purchase a license.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/login" className="btn-pill cyan">
                Sign In
              </a>
              <a href="/register" className="btn-pill purple">
                Create Account
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
