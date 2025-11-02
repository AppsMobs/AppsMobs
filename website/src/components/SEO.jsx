import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://appsmobs.com';

// SEO Configuration by page
const SEO_CONFIG = {
  '/': {
    title: 'AppsMobs - Automate Your Android Devices with Powerful Python Scripts',
    description: 'Control your Android devices, create advanced Python automation scripts, and manage your licenses. Complete solution for mobile automation with optimized scrcpy. Plans from €9/month.',
    keywords: 'android automation, python scripts, scrcpy, android control, AppsMobs, mobile automation, android licenses',
    ogType: 'website',
    image: '/assets/Logo.png',
    schemaType: 'SoftwareApplication'
  },
  '/shop': {
    title: 'Buy AppsMobs License - Plans from €9/month | AppsMobs',
    description: 'Choose your AppsMobs plan: Normal (€9/month), Pro (€15/month) or Team (€45/month). Launch discount -70% with code APPSBLACKFRIDAY25. Secure payment via PayPal, Stripe and Binance.',
    keywords: 'buy AppsMobs, AppsMobs license, AppsMobs price, AppsMobs plans, AppsMobs promo code',
    ogType: 'product',
    image: '/assets/Logo.png',
    schemaType: 'Product'
  },
  '/download': {
    title: 'Download AppsMobs for Windows - Free Installation | AppsMobs',
    description: 'Download AppsMobs free for Windows. Android device control, Python script creation, modern interface. Fast and secure installation.',
    keywords: 'download AppsMobs, install AppsMobs, AppsMobs Windows, AppsMobs download',
    ogType: 'website',
    image: '/assets/Logo.png',
    schemaType: 'SoftwareApplication'
  },
  '/about': {
    title: 'About AppsMobs - Our Mission and Vision | AppsMobs',
    description: 'Discover AppsMobs: a complete Android automation solution created for developers and power users. Our mission is to simplify mobile automation.',
    keywords: 'about AppsMobs, AppsMobs team, AppsMobs mission, AppsMobs history',
    ogType: 'website',
    image: '/assets/Logo.png',
    schemaType: 'Organization'
  },
  '/faq': {
    title: 'AppsMobs FAQ - Frequently Asked Questions and Answers | AppsMobs',
    description: 'Find answers to your questions about AppsMobs: installation, licenses, scripts, payments, support. Complete FAQ to help you.',
    keywords: 'AppsMobs FAQ, AppsMobs questions, AppsMobs help, AppsMobs support',
    ogType: 'website',
    image: '/assets/Logo.png',
    schemaType: 'FAQPage'
  },
  '/docs/pricing': {
    title: 'AppsMobs Pricing and Licenses - Detailed Plans | AppsMobs',
    description: 'Discover our plans and pricing: Normal (€9/month), Pro (€15/month), Team (€45/month). Up to 20% discounts for annual subscriptions. Token system for free licenses.',
    keywords: 'AppsMobs pricing, AppsMobs prices, AppsMobs plans, AppsMobs licenses, AppsMobs rates',
    ogType: 'website',
    image: '/assets/Logo.png',
    schemaType: 'Offer'
  }
};

// Schema JSON-LD by type
const getSchema = (pathname, config) => {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': config.schemaType || 'SoftwareApplication',
    'name': 'AppsMobs',
    'applicationCategory': 'DesktopApplication',
    'operatingSystem': 'Windows',
    'offers': {
      '@type': 'AggregateOffer',
      'priceCurrency': 'EUR',
      'lowPrice': '9',
      'highPrice': '45',
      'offerCount': '3'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'reviewCount': '127'
    }
  };

  if (config.schemaType === 'Product' && pathname === '/shop') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': 'AppsMobs License',
      'description': config.description,
      'brand': {
        '@type': 'Brand',
        'name': 'AppsMobs'
      },
      'offers': [
        {
          '@type': 'Offer',
          'name': 'Normal Plan',
          'price': '9',
          'priceCurrency': 'EUR',
          'availability': 'https://schema.org/InStock'
        },
        {
          '@type': 'Offer',
          'name': 'Pro Plan',
          'price': '15',
          'priceCurrency': 'EUR',
          'availability': 'https://schema.org/InStock'
        },
        {
          '@type': 'Offer',
          'name': 'Team Plan',
          'price': '45',
          'priceCurrency': 'EUR',
          'availability': 'https://schema.org/InStock'
        }
      ]
    };
  }

  if (config.schemaType === 'FAQPage' && pathname === '/faq') {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What is AppsMobs?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'AppsMobs is a Windows application that allows you to control Android devices, create Python automation scripts, and manage your licenses easily.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What are the license prices?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Our plans start at €9/month for Normal (1 device), €15/month for Pro (3 devices), and €45/month for Team (unlimited). Up to 20% discounts for annual subscriptions.'
          }
        }
      ]
    };
  }

  return baseSchema;
};

export default function SEO({ title, description, keywords, image, type = 'website' }) {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Use default config or props provided
  const pageConfig = SEO_CONFIG[pathname] || {
    title: title || 'AppsMobs - Professional Android Automation',
    description: description || 'Control your Android devices and create advanced Python automation scripts with AppsMobs.',
    keywords: keywords || 'AppsMobs, android automation, python scripts',
    ogType: type,
    image: image || '/assets/Logo.png',
    schemaType: 'SoftwareApplication'
  };

  const fullTitle = `${pageConfig.title} | AppsMobs`;
  const fullImageUrl = `${SITE_URL}${pageConfig.image}`;

  useEffect(() => {
    // Meta tags dynamiques
    document.title = fullTitle;
    
    // Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', pageConfig.description);

    // Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', pageConfig.keywords);

    // Open Graph
    const ogTags = {
      'og:title': fullTitle,
      'og:description': pageConfig.description,
      'og:type': pageConfig.ogType,
      'og:url': `${SITE_URL}${pathname}`,
      'og:image': fullImageUrl,
      'og:site_name': 'AppsMobs',
      'og:locale': 'en_US'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Twitter Card
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': fullTitle,
      'twitter:description': pageConfig.description,
      'twitter:image': fullImageUrl,
      'twitter:site': '@AppsMobs'
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${SITE_URL}${pathname}`);

    // Schema.org JSON-LD
    let schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(getSchema(pathname, pageConfig));
  }, [pathname, fullTitle, pageConfig, fullImageUrl]);

  return null;
}

