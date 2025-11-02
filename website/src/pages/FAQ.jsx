import { useState, useMemo } from 'react';

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqData = [
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
    },
    {
      category: 'Referrals & Tokens',
      questions: [
        {
          q: 'What is the referral program?',
          a: 'Earn 10 tokens for every friend who signs up using your referral code and purchases a license. Share your code from the Dashboard to start earning!'
        },
        {
          q: 'How do I get my referral code?',
          a: 'Log in to your Dashboard, go to "Referrals & Tokens" section, and copy your unique referral link. Share it with friends to earn tokens when they purchase.'
        },
        {
          q: 'What can I do with tokens?',
          a: 'Exchange 100 tokens for 1 week of free license (1 simultaneous device). You can exchange up to 4 weeks at a time. Tokens never expire.'
        },
        {
          q: 'When do I receive tokens?',
          a: 'You receive 10 tokens automatically when someone uses your referral code and completes a purchase. Tokens appear in your account immediately after their payment is confirmed.'
        },
        {
          q: 'Can I buy tokens?',
          a: 'No, tokens can only be earned through the referral program. There is no way to purchase tokens directly.'
        },
        {
          q: 'Do tokens expire?',
          a: 'No, tokens never expire. You can accumulate them and use them whenever you want to purchase free license weeks.'
        },
        {
          q: 'Can I use my own referral code?',
          a: 'No, you cannot use your own referral code to earn tokens. Referral codes are meant to share with others.'
        },
        {
          q: 'How do I redeem tokens for a free week?',
          a: 'Go to Dashboard > Referrals & Tokens, enter the number of weeks you want (1-4), and click "Redeem". Your license key will be sent to your email immediately.'
        }
      ]
    },
    {
      category: 'Technical & Setup',
      questions: [
        {
          q: 'What operating systems are supported?',
          a: 'Windows 10/11 (optimized), macOS and Linux (equivalent features if scrcpy and adb are installed).'
        },
        {
          q: 'How do I activate the license?',
          a: 'Enter your email and license key in the app (Electron). Demo mode is available offline.'
        },
        {
          q: 'Can I create my own scripts?',
          a: 'Yes, Python scripts with simplified API and integrated editor (Monaco).'
        },
        {
          q: 'What is scrcpy?',
          a: 'scrcpy is a free and open-source application to display and control Android devices connected via USB or wirelessly. AppsMobs integrates scrcpy for device control.'
        }
      ]
    }
  ];

  // Filter FAQ data based on search query and category
  const filteredFaqData = useMemo(() => {
    return faqData.map(section => {
      // Filter by category
      if (selectedCategory !== 'all' && section.category !== selectedCategory) {
        return null;
      }

      // Filter questions by search query
      const filteredQuestions = section.questions.filter(faq => {
        const query = searchQuery.toLowerCase();
        return (
          faq.q.toLowerCase().includes(query) ||
          faq.a.toLowerCase().includes(query)
        );
      });

      // Return section only if it has matching questions
      if (filteredQuestions.length === 0) {
        return null;
      }

      return {
        ...section,
        questions: filteredQuestions
      };
    }).filter(Boolean);
  }, [searchQuery, selectedCategory]);

  // Get all categories for filter buttons
  const categories = ['all', ...faqData.map(s => s.category)];

  return (
    <div className="container py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Everything you need to know about AppsMobs licenses, features, and support
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-cyan/20 border-2 border-cyan text-cyan'
                  : 'bg-white/5 border-2 border-white/10 text-white/70 hover:border-white/20 hover:text-white'
              }`}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        {filteredFaqData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl font-semibold mb-2">No results found</p>
            <p className="text-white/60">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-cyan/20 text-cyan hover:bg-cyan/30 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* FAQ Sections */}
        {filteredFaqData.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredFaqData.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-3">
                <h3 className="text-sm font-semibold text-cyan-400 mb-4 uppercase tracking-wider sticky top-0 bg-bg/80 backdrop-blur py-2 z-10">
                  {section.category}
                </h3>
                {section.questions.map((faq, index) => (
                  <details
                    key={index}
                    className="group glass rounded-lg p-4 border border-white/5 hover:border-white/10 transition-all cursor-pointer open:bg-white/5"
                  >
                    <summary className="flex items-start justify-between gap-3 list-none cursor-pointer">
                      <span className="text-sm font-medium text-white/90 group-open:text-white pr-4 flex-1">
                        {faq.q}
                      </span>
                      <svg
                        className="w-5 h-5 text-white/50 flex-shrink-0 mt-0.5 transform transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <p className="text-sm text-white/70 mt-3 pl-0 leading-relaxed">
                      {faq.a}
                    </p>
                  </details>
                ))}
          </div>
        ))}
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <div className="glass rounded-xl p-8 border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
            <p className="text-white/70 mb-6">
              Can't find what you're looking for? Our support team is here to help!
            </p>
            <a
              href="mailto:support@appsmobs.com"
              className="btn-pill cyan inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="btn-label">Contact Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
