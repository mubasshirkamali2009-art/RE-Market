import React from 'react';

export default function AboutUs() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 py-16 px-4 sm:px-6 lg:px-8 text-center border-b border-gray-100">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          About <span className="text-emerald-600">ReSell Hub</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
          Giving unused items a second life while building a sustainable marketplace for everyone.
        </p>
      </div>

      {/* Our Mission & Vision */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              At ReSell Hub, we believe that one persons pre-loved item is another persons treasure. Our mission is to make peer-to-peer buying and selling simple, secure, and impactful. By extending the lifecycle of everyday goods, we collectively reduce landfill waste and carbon emissions.
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why It Matters</h2>
            <p className="text-gray-600 leading-relaxed">
              Every smart choice counts. Buying second-hand isnt just about saving money—its about making a positive environmental impact. We provide the statistics, tools, and platform needed to turn sustainable choices into everyday habits.
            </p>
          </div>
          
          {/* Stats Snapshot Display Box */}
          <div className="bg-emerald-600 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 w-40 h-40 bg-emerald-500 rounded-full opacity-50 blur-lg"></div>
            <h3 className="text-2xl font-bold mb-6">Our Platform Blueprint</h3>
            <div className="space-y-6">
              <div>
                <span className="block text-4xl font-extrabold">3,500+</span>
                <span className="text-emerald-100 text-sm">Products Reused & Recycled</span>
              </div>
              <div>
                <span className="block text-4xl font-extrabold">1,250 KG</span>
                <span className="text-emerald-100 text-sm">Global Waste Reduced</span>
              </div>
              <div>
                <span className="block text-4xl font-extrabold">820 KG</span>
                <span className="text-emerald-100 text-sm">CO₂ Emissions Saved Safely</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}