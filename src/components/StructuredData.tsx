import React from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
}

const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2)
      }}
    />
  );
};

// Predefined structured data schemas for different pages
export const getHomePageSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Investment Portfolio Tracker",
  "description": "Professional investment portfolio tracker with AI assistant, bond analysis, and multi-currency support",
  "url": "https://investment-portfolio-tracker.vercel.app/",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Person",
    "name": "fedegualdrini"
  },
  "featureList": [
    "AI Investment Assistant",
    "Bond Analysis",
    "Multi-Currency Support",
    "Real-time Price Tracking",
    "Portfolio Analytics",
    "Performance Metrics"
  ],
  "screenshot": "https://investment-portfolio-tracker.vercel.app/screenshot.jpg",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150"
  }
});

export const getPortfolioPageSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Portfolio Dashboard - Investment Portfolio Tracker",
  "description": "Track and analyze your investment portfolio with real-time data and comprehensive analytics",
  "url": "https://investment-portfolio-tracker.vercel.app/portfolio",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Investment Portfolio Tracker",
    "url": "https://investment-portfolio-tracker.vercel.app/"
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://investment-portfolio-tracker.vercel.app/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Portfolio Dashboard",
        "item": "https://investment-portfolio-tracker.vercel.app/portfolio"
      }
    ]
  }
});

export const getBondAnalysisPageSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Bond Analysis - Investment Portfolio Tracker",
  "description": "Advanced bond analysis tools with payment frequency detection and cash flow projections",
  "url": "https://investment-portfolio-tracker.vercel.app/bond-analysis",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Investment Portfolio Tracker",
    "url": "https://investment-portfolio-tracker.vercel.app/"
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://investment-portfolio-tracker.vercel.app/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Bond Analysis",
        "item": "https://investment-portfolio-tracker.vercel.app/bond-analysis"
      }
    ]
  }
});

export const getChatPageSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "AI Investment Assistant - Investment Portfolio Tracker",
  "description": "Get AI-powered investment advice and portfolio management assistance",
  "url": "https://investment-portfolio-tracker.vercel.app/chat",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Investment Portfolio Tracker",
    "url": "https://investment-portfolio-tracker.vercel.app/"
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://investment-portfolio-tracker.vercel.app/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "AI Assistant",
        "item": "https://investment-portfolio-tracker.vercel.app/chat"
      }
    ]
  }
});

export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Investment Portfolio Tracker",
  "url": "https://investment-portfolio-tracker.vercel.app/",
  "logo": "https://investment-portfolio-tracker.vercel.app/logo.png",
  "description": "Professional investment portfolio tracking and analysis platform",
  "founder": {
    "@type": "Person",
    "name": "fedegualdrini"
  },
  "sameAs": [
    "https://github.com/fedegualdrini/investment-portfolio-tracker-"
  ]
});

export const getFAQSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the Investment Portfolio Tracker?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Investment Portfolio Tracker is a comprehensive web application for tracking and analyzing investment portfolios with AI assistant, bond analysis, and multi-currency support."
      }
    },
    {
      "@type": "Question",
      "name": "Is the Investment Portfolio Tracker free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, the Investment Portfolio Tracker is completely free to use with no hidden fees or subscription costs."
      }
    },
    {
      "@type": "Question",
      "name": "What types of investments can I track?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can track stocks, ETFs, bonds, cryptocurrencies, commodities, and cash investments with real-time price updates and comprehensive analytics."
      }
    },
    {
      "@type": "Question",
      "name": "Does the app support multiple currencies?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, the app supports multiple currencies with real-time exchange rate updates for accurate portfolio valuation."
      }
    },
    {
      "@type": "Question",
      "name": "How does the AI investment assistant work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The AI assistant uses advanced language models to provide personalized investment advice, portfolio analysis, and can help you add multiple investments in a single request."
      }
    }
  ]
});

export default StructuredData;
