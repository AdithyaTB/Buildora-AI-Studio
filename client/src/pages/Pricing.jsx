import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Check, Star, Zap, Crown, Loader } from 'lucide-react';
import { useState } from 'react';

const Pricing = () => {
    const { user } = useAuth();
    const [loadingPlan, setLoadingPlan] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('payment') === 'cancelled') {
            alert('Payment was cancelled. You can try again when you are ready.');
        }
    }, [location]);

    const handlePurchase = async (planType) => {
        if (!user) {
            alert("Please login first to upgrade your plan!");
            return;
        }
        // Redirect to new Stripe Elements Checkout page
        navigate(`/checkout?plan=${planType}`);
    };

    return (
        <div className="min-h-screen bg-slate-900 pt-24 px-4 pb-20">
            <div className="max-w-7xl mx-auto text-center mb-16">
                <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
                <p className="text-gray-400">Pay as you go. No hidden fees.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
                {/* Free Plan */}
                <div className="bg-slate-800 rounded-2xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col">
                    <div className="mb-4">
                        <span className="text-gray-400 font-medium">Starter</span>
                        <div className="text-3xl font-bold text-white mt-2">Free</div>
                        <div className="text-sm text-gray-500">Forever</div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-gray-300"><Check className="w-5 h-5 text-green-500" /> Limited Credits on Signup</li>
                        <li className="flex items-center gap-2 text-gray-300"><Check className="w-5 h-5 text-green-500" /> Basic Generation</li>
                        <li className="flex items-center gap-2 text-gray-300"><Check className="w-5 h-5 text-green-500" /> Community Access</li>
                    </ul>
                    <button className={`w-full py-3 rounded-xl bg-white/10 text-white font-medium ${user?.plan === 'free' ? 'border border-gray-500/30' : ''} cursor-not-allowed opacity-70`}>
                        {user?.plan === 'free' ? 'Current Plan' : 'Free Plan'}
                    </button>
                </div>

                {/* Pro Plan */}
                <div className={`bg-slate-800 rounded-2xl p-8 border ${user?.plan === 'pro-monthly' ? 'border-emerald-500' : 'border-indigo-500'} relative transform scale-105 shadow-2xl flex flex-col`}>
                    <div className="mb-4">
                        <span className="text-indigo-400 font-medium">Pro Monthly</span>
                        <div className="text-3xl font-bold text-white mt-2">₹499</div>
                        <div className="text-sm text-gray-500">per month</div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-white"><Zap className="w-5 h-5 text-yellow-400" /> 500 Credits</li>
                        <li className="flex items-center gap-2 text-white"><Check className="w-5 h-5 text-indigo-400" /> Priority Generation</li>
                        <li className="flex items-center gap-2 text-white"><Check className="w-5 h-5 text-indigo-400" /> Private Projects</li>
                        <li className="flex items-center gap-2 text-white"><Check className="w-5 h-5 text-indigo-400" /> Export Code</li>
                    </ul>
                    <button
                        onClick={() => handlePurchase('pro-monthly')}
                        disabled={loadingPlan === 'pro-monthly' || user?.plan === 'pro-monthly'}
                        className={`w-full py-3 rounded-xl ${user?.plan === 'pro-monthly' ? 'bg-emerald-600/20 text-emerald-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25'} font-bold transition-all flex justify-center items-center gap-2`}
                    >
                        {loadingPlan === 'pro-monthly' && <Loader className="w-4 h-4 animate-spin" />}
                        {user?.plan === 'pro-monthly' ? 'Current Plan' : 'Subscribe Monthly'}
                    </button>
                </div>

                {/* Yearly Plan */}
                <div className={`bg-slate-800 rounded-2xl p-8 border ${user?.plan === 'pro-yearly' ? 'border-emerald-500' : 'border-purple-500/50 hover:border-purple-500'} relative transform scale-105 transition-all flex flex-col`}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 px-4 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> BEST VALUE
                    </div>
                    <div className="mb-4">
                        <span className="text-purple-400 font-medium">Pro Yearly</span>
                        <div className="text-3xl font-bold text-white mt-2">₹4,999</div>
                        <div className="text-sm text-gray-500">per year</div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-gray-300"><Crown className="w-5 h-5 text-purple-500" /> 8000 Credits</li>
                        <li className="flex items-center gap-2 text-gray-300"><Check className="w-5 h-5 text-purple-400" /> All Pro Features</li>
                        <li className="flex items-center gap-2 text-gray-300"><Check className="w-5 h-5 text-purple-400" /> ~2 Months Free</li>
                        <li className="flex items-center gap-2 text-gray-300"><Check className="w-5 h-5 text-purple-400" /> Dedicated Support</li>
                    </ul>
                    <button
                        onClick={() => handlePurchase('pro-yearly')}
                        disabled={loadingPlan === 'pro-yearly' || user?.plan === 'pro-yearly'}
                        className={`w-full py-3 rounded-xl flex justify-center items-center gap-2 ${user?.plan === 'pro-yearly' ? 'bg-emerald-600/20 text-emerald-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'} font-bold transition-all`}
                    >
                        {loadingPlan === 'pro-yearly' && <Loader className="w-4 h-4 animate-spin" />}
                        {user?.plan === 'pro-yearly' ? 'Current Plan' : 'Subscribe Yearly'}
                    </button>
                </div>
            </div>

            {/* Credit Packs section */}
            <div className="max-w-5xl mx-auto pt-8 border-t border-white/10">
                <div className="text-center mb-8">
                    <span className="text-amber-400 font-bold uppercase tracking-widest text-sm">Need More Power?</span>
                    <h2 className="text-3xl font-bold text-white mt-2">One-Time Credit Add-ons</h2>
                    <p className="text-gray-400 text-sm mt-2 max-w-xl mx-auto">No subscription required. Instantly adds credits to your current balance so you can keep generating.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <button
                        onClick={() => handlePurchase('credits-199')}
                        disabled={loadingPlan === 'credits-199'}
                        className="bg-slate-800/80 p-6 rounded-2xl border border-white/5 hover:border-amber-500/50 transition-all flex flex-col items-center justify-center text-center group"
                    >
                        <Zap className="w-8 h-8 text-amber-500/50 group-hover:text-amber-400 transition-colors mb-4" />
                        <div className="text-xl font-bold text-white">150 Credits</div>
                        <div className="text-amber-400 font-bold mt-2">₹199</div>
                    </button>

                    <button
                        onClick={() => handlePurchase('credits-399')}
                        disabled={loadingPlan === 'credits-399'}
                        className="bg-slate-800 p-6 rounded-2xl border border-amber-500/20 hover:border-amber-500 transition-all flex flex-col items-center justify-center text-center transform hover:-translate-y-1 shadow-lg shadow-amber-500/5 group"
                    >
                        <Zap className="w-10 h-10 text-amber-500 mb-4" />
                        <div className="text-2xl font-bold text-white">400 Credits</div>
                        <div className="text-amber-400 font-bold mt-2 text-lg">₹399</div>
                    </button>

                    <button
                        onClick={() => handlePurchase('credits-799')}
                        disabled={loadingPlan === 'credits-799'}
                        className="bg-slate-800/80 p-6 rounded-2xl border border-white/5 hover:border-amber-500/50 transition-all flex flex-col items-center justify-center text-center group"
                    >
                        <Zap className="w-8 h-8 text-amber-500/50 group-hover:text-amber-400 transition-colors mb-4" />
                        <div className="text-xl font-bold text-white">1000 Credits</div>
                        <div className="text-amber-400 font-bold mt-2">₹799</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
