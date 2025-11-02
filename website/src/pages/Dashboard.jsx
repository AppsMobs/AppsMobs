import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChatAIWrapper from '../components/ChatAI/ChatAIWrapper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('licenses');
  const [licenses, setLicenses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [dateFilter, setDateFilter] = useState('7d');
  
  // Tokens & Referrals states
  const [tokens, setTokens] = useState({ tokens: 0, total_earned: 0, total_redeemed: 0 });
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [redeemWeeks, setRedeemWeeks] = useState(1);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    country: ''
  });
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'general',
    message: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Charger licences
      const licensesRes = await fetch(`${API_URL}/api/my-licenses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let licensesList = [];
      if (licensesRes.ok) {
        const licensesData = await licensesRes.json();
        licensesList = licensesData.licenses || [];
        setLicenses(licensesList);
      }

      // Charger commandes
      const ordersRes = await fetch(`${API_URL}/api/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }

      // Charger profil
      const profileRes = await fetch(`${API_URL}/api/my-profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.profile) {
          setProfileForm({
            firstName: profileData.profile.first_name || '',
            lastName: profileData.profile.last_name || '',
            country: profileData.profile.country || ''
          });
          setProfile(profileData.profile);
        }
      }

      // Charger jetons
      const tokensRes = await fetch(`${API_URL}/api/my-tokens`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (tokensRes.ok) {
        const tokensData = await tokensRes.json();
        setTokens(tokensData.tokens || { tokens: 0, total_earned: 0, total_redeemed: 0 });
      }

      // Charger code de parrainage
      const referralCodeRes = await fetch(`${API_URL}/api/my-referral-code`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (referralCodeRes.ok) {
        const referralCodeData = await referralCodeRes.json();
        setReferralCode(referralCodeData.code || '');
      }

      // Charger historique referrals
      const referralsRes = await fetch(`${API_URL}/api/my-referrals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (referralsRes.ok) {
        const referralsData = await referralsRes.json();
        setReferrals(referralsData.referrals || []);
      }

      // Générer les notifications
      generateNotifications(licensesList);
    } catch (err) {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = (licensesList) => {
    const notifs = [];
    const now = Date.now() / 1000;
    
    licensesList.forEach(license => {
      if (license.expires_at) {
        const daysUntilExpiry = Math.floor((license.expires_at - now) / 86400);
        
        if (daysUntilExpiry > 0 && daysUntilExpiry <= 7) {
          notifs.push({
            id: `expiry_${license.id}`,
            type: 'warning',
            message: `License ${license.key?.substring(0, 8) || '...'}... expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`,
            license: license
          });
        }
        
        if (daysUntilExpiry > 0 && daysUntilExpiry <= 1) {
          notifs.push({
            id: `expiry_urgent_${license.id}`,
            type: 'error',
            message: `URGENT: License ${license.key?.substring(0, 8) || '...'}... expires today!`,
            license: license
          });
        }
      }
    });

    if (licensesList.length === 0) {
      notifs.push({
        id: 'no_license',
        type: 'info',
        message: 'You don\'t have any active licenses. Browse our plans to get started.',
        action: '/shop'
      });
    }

    setNotifications(notifs);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Error updating profile');
      }
    } catch (err) {
      setError('Error updating profile');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const mailtoLink = `mailto:support@appsmobs.com?subject=${encodeURIComponent(contactForm.subject)}&body=${encodeURIComponent(
      `Category: ${contactForm.category}\n\n${contactForm.message}\n\nFrom: ${user?.email}`
    )}`;
    
    window.location.href = mailtoLink;
    setSuccess('Opening your email client...');
  };

  const copyReferralCode = () => {
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setSuccess('Referral link copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRedeemTokens = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (tokens.tokens < redeemWeeks * 100) {
      setError(`You need ${redeemWeeks * 100} tokens but you only have ${tokens.tokens}`);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/redeem-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ weeks: redeemWeeks })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message || 'Tokens redeemed successfully!');
        setTokens({
          tokens: data.tokens?.remaining || tokens.tokens,
          total_earned: tokens.total_earned,
          total_redeemed: tokens.total_redeemed + (redeemWeeks * 100)
        });
        // Recharger les licences
        loadData();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.error || 'Error redeeming tokens');
      }
    } catch (err) {
      setError('Error redeeming tokens');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'text-green-400 bg-green-500/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'failed':
      case 'cancelled':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-white/60 bg-white/10';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'normal':
        return 'text-blue-400';
      case 'pro':
        return 'text-purple-400';
      case 'team':
        return 'text-emerald-400';
      default:
        return 'text-white';
    }
  };

  const getPlanName = (plan) => {
    switch (plan) {
      case 'normal':
        return 'Normal Plan';
      case 'pro':
        return 'Pro Plan';
      case 'team':
        return 'Team Plan';
      default:
        return 'Free Plan';
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="container py-16 text-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  const menuItems = [
    { id: 'licenses', label: 'My Licenses', icon: '🔑' },
    { id: 'orders', label: 'Order History', icon: '📦' },
    { id: 'referrals', label: 'Referrals & Tokens', icon: null, iconImg: '/assets/token.png' },
    { id: 'profile', label: 'Profile Settings', icon: '👤' },
    { id: 'contact', label: 'Contact Support', icon: '✉️' }
  ];

  return (
    <div className="min-h-screen bg-bg">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-bg/80 border-r border-white/10 p-6">
          {/* Logo & Brand */}
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="AppsMobs" className="w-8 h-8" />
              <span className="font-bold text-xl text-cyan">AppsMobs</span>
            </Link>
            <div className="text-xs text-white/60 mb-1">{getPlanName(licenses[0]?.plan || 'normal')}</div>
            <div className="text-xs text-white/40">{user?.email}</div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  activeSection === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.iconImg ? (
                  <img src={item.iconImg} alt="" className="w-5 h-5 object-contain" />
                ) : (
                  <span className="text-lg">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </button>
            ))}
            
            <div className="my-4 border-t border-white/10"></div>
            
            <Link
              to="/"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <span className="text-lg">🏠</span>
              <span>Home</span>
            </Link>
            <Link
              to="/shop"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <span className="text-lg">🛒</span>
              <span>Shop</span>
            </Link>
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <span className="text-lg">📚</span>
              <span>Documentation</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-8">
            {/* Header with filters */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {activeSection === 'licenses' && 'My Licenses'}
                  {activeSection === 'orders' && 'Order History'}
                  {activeSection === 'referrals' && 'Referrals & Tokens'}
                  {activeSection === 'profile' && 'Profile Settings'}
                  {activeSection === 'contact' && 'Contact Support'}
                </h1>
                <p className="text-white/60 text-sm">
                  {activeSection === 'licenses' && 'Manage and view all your licenses'}
                  {activeSection === 'orders' && 'View your purchase history and receipts'}
                  {activeSection === 'referrals' && 'Earn tokens by referring friends'}
                  {activeSection === 'profile' && 'Update your account information'}
                  {activeSection === 'contact' && 'Get help from our support team'}
                </p>
              </div>
              {(activeSection === 'licenses' || activeSection === 'orders') && (
                <div className="flex items-center gap-3">
                  <div className="flex gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                    {['1d', '7d', '30d'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setDateFilter(filter)}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                          dateFilter === filter
                            ? 'bg-white/10 text-white'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                  {activeSection === 'licenses' && licenses.length > 0 && (
                    <button
                      onClick={() => {
                        const data = licenses.map(l => ({
                          License: l.key || 'N/A',
                          Plan: l.plan,
                          Created: formatDate(l.created_at),
                          Expires: l.expires_at ? formatDate(l.expires_at) : 'Never',
                          Status: l.expires_at && l.expires_at < Date.now() / 1000 ? 'Expired' : 'Active'
                        }));
                        const csv = [
                          Object.keys(data[0]).join(','),
                          ...data.map(d => Object.values(d).join(','))
                        ].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `appsMobs-licenses-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                        setSuccess('Licenses exported successfully!');
                        setTimeout(() => setSuccess(''), 3000);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export CSV
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-300">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 rounded-lg bg-green-500/20 border border-green-500 text-green-300">
                {success}
              </div>
            )}

            {/* Notifications */}
            {notifications.length > 0 && activeSection === 'licenses' && (
              <div className="mb-6 space-y-2">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border ${
                      notif.type === 'error'
                        ? 'bg-red-500/20 border-red-500/50 text-red-300'
                        : notif.type === 'warning'
                        ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                        : 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{notif.type === 'error' ? '🚨' : notif.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                          <span className="font-semibold text-sm">{notif.message}</span>
                        </div>
                        {notif.action && (
                          <a href={notif.action} className="text-xs underline mt-1 inline-block">
                            {notif.action === '/shop' ? 'View Plans →' : 'View Details →'}
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => setNotifications(notifs => notifs.filter(n => n.id !== notif.id))}
                        className="text-current/60 hover:text-current text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Licenses Section */}
            {activeSection === 'licenses' && (
              <div className="glass rounded-xl p-6 border border-white/10">
                {licenses.length === 0 ? (
                  <div className="text-center py-16 text-white/60">
                    <div className="text-6xl mb-4">🔑</div>
                    <p className="text-lg mb-2">No licenses yet</p>
                    <a href="/shop" className="btn-pill cyan mt-4 inline-block">
                      Browse Plans
                    </a>
                  </div>
                ) : (
                  <>
                    {/* Statistics */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="glass rounded-lg p-4 border border-white/10">
                        <div className="text-2xl font-bold text-cyan mb-1">{licenses.length}</div>
                        <div className="text-xs text-white/60">Total Licenses</div>
                      </div>
                      <div className="glass rounded-lg p-4 border border-white/10">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {licenses.filter(l => !l.expires_at || l.expires_at > Date.now() / 1000).length}
                        </div>
                        <div className="text-xs text-white/60">Active Licenses</div>
                      </div>
                      <div className="glass rounded-lg p-4 border border-white/10">
                        <div className="text-2xl font-bold text-purple-400 mb-1">
                          {licenses.reduce((sum, l) => {
                            const planLimit = { normal: 1, pro: 2, team: 5 };
                            return sum + (planLimit[l.plan] || 0);
                          }, 0)}
                        </div>
                        <div className="text-xs text-white/60">Device Slots</div>
                      </div>
                    </div>

                    {/* Licenses List */}
                    <div className="space-y-4">
                      <div className="text-sm font-semibold text-white/60 mb-4">All Licenses</div>
                      {licenses.map(license => {
                        const isExpired = license.expires_at && license.expires_at < Date.now() / 1000;
                        const daysLeft = license.expires_at 
                          ? Math.floor((license.expires_at - Date.now() / 1000) / 86400)
                          : null;
                        const expiryPercent = license.expires_at && !isExpired && daysLeft !== null
                          ? Math.max(0, Math.min(100, (daysLeft / 365) * 100))
                          : license.expires_at ? 0 : 100;

                        return (
                          <div
                            key={license.id}
                            className="glass rounded-lg p-5 border border-white/10 hover:border-white/20 transition-all"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className={`text-lg font-bold ${getPlanColor(license.plan)}`}>
                                    {license.plan.toUpperCase()}
                                  </h3>
                                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(isExpired ? 'expired' : 'active')}`}>
                                    {isExpired ? 'Expired' : 'Active'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="text-sm text-white/80 font-mono">{license.key || 'N/A'}</p>
                                  <button
                                    onClick={() => {
                                      const keyToCopy = license.key || '';
                                      if (keyToCopy) {
                                        navigator.clipboard.writeText(keyToCopy);
                                        setSuccess('License key copied!');
                                        setTimeout(() => setSuccess(''), 2000);
                                      }
                                    }}
                                    className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                                    title="Copy license key"
                                  >
                                    📋 Copy
                                  </button>
                                </div>
                              </div>
                            </div>

                            {license.expires_at && !isExpired && (
                              <div className="mb-4">
                                <div className="flex justify-between text-xs text-white/60 mb-1">
                                  <span>Time remaining</span>
                                  <span>{daysLeft} days</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${
                                      daysLeft < 30 ? 'bg-red-400' : daysLeft < 90 ? 'bg-yellow-400' : 'bg-green-400'
                                    }`}
                                    style={{ width: `${expiryPercent}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-white/60">Created:</span>
                                <span className="ml-2 text-white">{formatDate(license.created_at)}</span>
                              </div>
                              {license.expires_at && (
                                <div>
                                  <span className="text-white/60">Expires:</span>
                                  <span className={`ml-2 ${isExpired ? 'text-red-400' : daysLeft < 30 ? 'text-yellow-400' : 'text-white'}`}>
                                    {formatDate(license.expires_at)}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="text-white/60">Device Slots:</span>
                                <span className="ml-2 text-white">
                                  {(() => {
                                    const planLimit = { normal: 1, pro: 2, team: 5 };
                                    return planLimit[license.plan] || 0;
                                  })()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Orders Section */}
            {activeSection === 'orders' && (
              <div className="glass rounded-xl p-6 border border-white/10">
                <div className="text-sm font-semibold text-white/60 mb-4">All Orders</div>
                {orders.length === 0 ? (
                  <div className="text-center py-16 text-white/60">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-lg">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div
                        key={order.id}
                        className="glass rounded-lg p-5 border border-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`text-lg font-bold ${getPlanColor(order.plan)}`}>
                                {order.plan?.toUpperCase() || 'Unknown'}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-xs text-white/60">
                              {order.payment_method && <span className="capitalize">{order.payment_method}</span>}
                              {order.reference && <span className="ml-2 font-mono">Ref: {order.reference}</span>}
                            </p>
                          </div>
                          {order.amount && (
                            <div className="text-right">
                              <div className="text-lg font-bold">€{order.amount.toFixed(2)}</div>
                              {order.months && <div className="text-xs text-white/60">{order.months} months</div>}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-white/50">{formatDate(order.created_at)}</div>
                        {(order.license_key || order.key) && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <span className="text-xs text-white/60">License Key: </span>
                            <span className="text-xs font-mono text-cyan">{order.license_key || order.key}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="glass rounded-xl p-6 border border-white/10">
                <div className="text-sm font-semibold text-white/60 mb-6">Account Information</div>
                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60"
                    />
                    <p className="text-xs text-white/50 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <input
                      type="text"
                      value={profileForm.country}
                      onChange={(e) => setProfileForm({...profileForm, country: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-pill cyan justify-center"
                  >
                    <span className="btn-label">Update Profile</span>
                  </button>
                </form>
              </div>
            )}

            {/* Referrals & Tokens Section */}
            {activeSection === 'referrals' && (
              <div className="space-y-6">
                    {/* Tokens Overview */}
                    <div className="glass rounded-xl p-6 border border-white/10">
                      <h3 className="text-xl font-bold mb-4 text-cyan">Your Tokens</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-cyan/20 to-purple-500/20 rounded-lg p-4 border border-cyan/30">
                          <div className="text-2xl font-bold text-cyan mb-1">{tokens.tokens || 0}</div>
                          <div className="text-sm text-white/70">Available Tokens</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500/20 to-cyan/20 rounded-lg p-4 border border-emerald-500/30">
                          <div className="text-2xl font-bold text-emerald-400 mb-1">{tokens.total_earned || 0}</div>
                          <div className="text-sm text-white/70">Total Earned</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
                          <div className="text-2xl font-bold text-purple-400 mb-1">{tokens.total_redeemed || 0}</div>
                          <div className="text-sm text-white/70">Total Redeemed</div>
                        </div>
                      </div>
                    </div>

                    {/* Referral Code */}
                    <div className="glass rounded-xl p-6 border border-white/10">
                      <h3 className="text-xl font-bold mb-4 text-cyan">Your Referral Code</h3>
                      <p className="text-white/70 text-sm mb-4">
                        Share this link with friends and earn 10 tokens when they purchase a license!
                      </p>
                      <div className="flex gap-3 items-center">
                        <div className="flex-1 bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                          <code className="text-cyan font-mono text-lg">
                            {referralCode || 'Loading...'}
                          </code>
                        </div>
                        <button
                          onClick={copyReferralCode}
                          className="btn-pill cyan px-6"
                        >
                          📋 Copy Link
                        </button>
                      </div>
                      <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <p className="text-sm text-emerald-400">
                          💡 <strong>How it works:</strong> When someone registers with your code and purchases a license, you'll automatically receive 10 tokens!
                        </p>
                      </div>
                    </div>

                    {/* Redeem Tokens */}
                    {tokens.tokens >= 100 && (
                      <div className="glass rounded-xl p-6 border border-white/10">
                        <h3 className="text-xl font-bold mb-4 text-cyan">Redeem Tokens</h3>
                        <p className="text-white/70 text-sm mb-4">
                          Exchange 100 tokens for 1 week of free license. Maximum 4 weeks per redemption.
                        </p>
                        <form onSubmit={handleRedeemTokens} className="space-y-4 max-w-md">
                          <div>
                            <label className="block text-sm font-medium mb-2">Number of Weeks</label>
                            <select
                              value={redeemWeeks}
                              onChange={(e) => setRedeemWeeks(parseInt(e.target.value))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan"
                              max={Math.floor(tokens.tokens / 100)}
                            >
                              {Array.from({ length: Math.min(4, Math.floor(tokens.tokens / 100)) }, (_, i) => i + 1).map(weeks => (
                                <option key={weeks} value={weeks}>{weeks} Week{weeks > 1 ? 's' : ''} ({weeks * 100} tokens)</option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="submit"
                            className="btn-pill purple w-full"
                          >
                            ✨ Redeem {redeemWeeks * 100} Tokens for {redeemWeeks} Week{redeemWeeks > 1 ? 's' : ''}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Referrals History */}
                    <div className="glass rounded-xl p-6 border border-white/10">
                      <h3 className="text-xl font-bold mb-4 text-cyan">Referrals History</h3>
                      {referrals.length === 0 ? (
                        <p className="text-white/60 text-sm">No referrals yet. Share your code to start earning tokens!</p>
                      ) : (
                        <div className="space-y-3">
                          {referrals.map((referral) => (
                            <div
                              key={referral.id}
                              className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-center justify-between"
                            >
                              <div>
                                <div className="text-white font-medium">{referral.referee_email}</div>
                                <div className="text-white/60 text-sm mt-1">
                                  {formatDate(referral.created_at)} • Code: {referral.referral_code}
                                </div>
                              </div>
                              <div className="text-right">
                                {referral.purchase_made ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-emerald-400">✓</span>
                                    <span className="text-emerald-400 font-semibold">+{referral.tokens_awarded || 10} tokens</span>
                                  </div>
                                ) : (
                                  <span className="text-yellow-400 text-sm">Pending purchase</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="glass rounded-xl p-6 border border-white/10">
                <div className="text-sm font-semibold text-white/60 mb-6">Contact Support</div>
                <form onSubmit={handleContactSubmit} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={contactForm.category}
                      onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan focus:outline-none"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="billing">Billing & Payment</option>
                      <option value="technical">Technical Support</option>
                      <option value="license">License Issues</option>
                      <option value="feature">Feature Request</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      required
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan focus:outline-none"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      required
                      rows={6}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan focus:outline-none"
                      placeholder="Please describe your issue or question in detail..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-pill cyan justify-center"
                  >
                    <span className="btn-label">Send Message</span>
                  </button>
                  <p className="text-xs text-white/50 text-center">
                    This will open your email client to send a message to support@appsmobs.com
                  </p>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
      <ChatAIWrapper />
    </div>
  );
}
