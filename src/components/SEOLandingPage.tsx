import React from 'react';
import { 
  TrendingUp, 
  Brain, 
  Globe, 
  BarChart3, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Award
} from 'lucide-react';
import StructuredData, { getHomePageSchema, getFAQSchema } from './StructuredData';

const SEOLandingPage: React.FC = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      title: "AI Investment Assistant",
      description: "Get personalized investment advice powered by advanced AI technology. Ask questions, get insights, and manage your portfolio with natural language commands.",
      keywords: ["AI investment advisor", "portfolio management AI", "investment chatbot"]
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Advanced Bond Analysis",
      description: "Comprehensive bond analysis with smart payment frequency detection, cash flow projections, and yield optimization tools.",
      keywords: ["bond analysis", "bond calculator", "fixed income analysis"]
    },
    {
      icon: <Globe className="h-8 w-8 text-green-600" />,
      title: "Multi-Currency Support",
      description: "Track investments in multiple currencies with real-time exchange rates and automatic currency conversion.",
      keywords: ["multi-currency portfolio", "currency converter", "international investments"]
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      title: "Real-Time Portfolio Tracking",
      description: "Monitor your investments with live price updates, performance metrics, and comprehensive analytics dashboard.",
      keywords: ["portfolio tracker", "real-time prices", "investment performance"]
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Secure & Private",
      description: "Your data is secure with client-side storage. No account required, complete privacy and data ownership.",
      keywords: ["secure portfolio", "private investment tracking", "data security"]
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Lightning Fast",
      description: "Optimized for speed with modern web technologies. Fast loading, responsive design, and smooth user experience.",
      keywords: ["fast portfolio tracker", "responsive design", "modern web app"]
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Users", icon: <Users className="h-6 w-6" /> },
    { number: "4.8/5", label: "User Rating", icon: <Star className="h-6 w-6" /> },
    { number: "50+", label: "Supported Assets", icon: <Award className="h-6 w-6" /> },
    { number: "100%", label: "Free to Use", icon: <CheckCircle className="h-6 w-6" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Financial Advisor",
      content: "This portfolio tracker has revolutionized how I manage my clients' investments. The AI assistant is incredibly helpful for quick analysis.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Individual Investor",
      content: "The bond analysis feature is outstanding. It automatically detects payment frequencies and provides accurate cash flow projections.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Portfolio Manager",
      content: "Multi-currency support is a game-changer for international portfolios. The real-time exchange rates are always accurate.",
      rating: 5
    }
  ];

  return (
    <>
      <StructuredData data={getHomePageSchema()} />
      <StructuredData data={getFAQSchema()} />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Professional Investment Portfolio Tracker
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Track and analyze your investments with AI-powered insights, advanced bond analysis, 
              and multi-currency support. Free, secure, and designed for serious investors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center">
                Start Tracking Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                View Demo
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white dark:bg-gray-800 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4 text-purple-600">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Powerful Features for Modern Investors
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Everything you need to manage your investment portfolio with professional-grade tools and AI assistance.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {feature.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {feature.keywords.map((keyword, keyIndex) => (
                      <span 
                        key={keyIndex}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-gray-50 dark:bg-gray-800 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Trusted by Investors Worldwide
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                See what our users say about their experience
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Ready to Take Control of Your Investments?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Join thousands of investors who trust our platform for portfolio management. 
                Start tracking your investments today - it's completely free.
              </p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 rounded-lg font-semibold text-xl transition-colors">
                Get Started Free
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                No credit card required • No account needed • Start in seconds
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SEOLandingPage;
