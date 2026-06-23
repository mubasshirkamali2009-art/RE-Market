import React from 'react';

export default function WhyShopWithUs() {
  // Hardcoded value proposition features
  const features = [
    {
      id: 1,
      icon: (
        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
      ),
      title: "Fast Delivery",
      description: "Get your products shipped securely and delivered straight to your doorstep within 24 to 48 hours."
    },
    {
      id: 2,
      icon: (
        <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      ),
      title: "Secure Payments",
      description: "We protect your transactions with industry-standard encryption, supporting SSL safe checkout channels."
    },
    {
      id: 3,
      icon: (
        <svg className="w-8 h-8 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.213 15M16 10V5h-5"></path>
        </svg>
      ),
      title: "Easy Returns",
      description: "Not satisfied with your order? Send it back effortlessly within 7 days for a hassle-free, full refund."
    },
    {
      id: 4,
      icon: (
        <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
      title: "24/7 Support",
      description: "Our dedicated support desk is available around the clock to assist you with any questions or issues."
    }
  ];

  return (
    <section className="bg-gray-50 dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Text */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">
            Why Shop With <span className="text-blue-600 dark:text-blue-400">Re-Market</span>?
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-slate-400">
            We prioritize safety, speed, and customer satisfaction to make your peer-to-peer shopping experience seamless.
          </p>
        </div>

        {/* Feature Cards Grid Layout */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-md dark:hover:border-slate-600 transition-all duration-300 flex flex-col items-center text-center group"
            >
              {/* Icon Container */}
              <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl group-hover:scale-110 transition-transform duration-300 mb-4">
                {feature.icon}
              </div>
              
              {/* Card Title */}
              <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">
                {feature.title}
              </h3>
              
              {/* Card Body */}
              <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}