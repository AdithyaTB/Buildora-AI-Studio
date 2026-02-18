import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Check, Star, Zap, Crown } from 'lucide-react';

const Pricing = () => {
    const { user, refreshUser } = useAuth();

    // Dynamically load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePurchase = async (plan) => {
        if (!user) {
            alert("Please login first!");
            return;
        }

        try {
            // 1. Create Order
            const { data: order } = await api.post('/payment/create-order', { plan });

            // 2. Open Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Buildora AI",
                description: `Upgrade to ${plan.toUpperCase()} Plan`,
                order_id: order.id,
                handler: async (response) => {
                    try {
                        // 3. Verify Payment
                        const verifyRes = await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan
                        });

                        if (verifyRes.data.success) {
                            alert("Payment Successful! Credits Added 🚀");
                            await refreshUser();
                        } else {
                            alert("Payment verification failed.");
                        }
                    } catch (error) {
                        console.error("Verification Error", error);
                        alert("Payment verification failed on server.");
                    }
                },
                theme: { color: "#4f46e5" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Payment initiation failed", error);
            alert("Failed to start payment. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 pt-24 px-4 pb-20">
            <div className="max-w-7xl mx-auto text-center mb-16">
                <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
                <p className="text-gray-400">Pay as you go. No hidden fees.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Free Plan */}
                <div className="bg-slate-800 rounded-2xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col">
                    <div className="mb-4">
                        <span className="text-gray-400 font-medium">Starter</span>
                        <div className="text-3xl font-bold text-white mt-2">Free</div>
                        <div className="text-sm text-gray-500">Forever</div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-gray-300"><Check className="w-5 h-5 text-green-500" /> 50 Credits on Signup</li>
                        <li className="flex items-center gap-2 text-gray-300"><Check className="w-5 h-5 text-green-500" /> Basic Generation</li>
                        <li className="flex items-center gap-2 text-gray-300"><Check className="w-5 h-5 text-green-500" /> Community Access</li>
                    </ul>
                    <button className="w-full py-3 rounded-xl bg-white/10 text-white font-medium cursor-not-allowed opacity-70">
                        Current Plan
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-slate-800 rounded-2xl p-8 border border-indigo-500 relative transform scale-105 shadow-2xl flex flex-col">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 px-4 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> MOST POPULAR
                    </div>
                    <div className="mb-4">
                        <span className="text-indigo-400 font-medium">Pro</span>
                        <div className="text-3xl font-bold text-white mt-2">₹299</div>
                        <div className="text-sm text-gray-500">per month</div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-white"><Zap className="w-5 h-5 text-yellow-400" /> 500 Credits</li>
                        <li className="flex items-center gap-2 text-white"><Check className="w-5 h-5 text-indigo-400" /> Priority Generation</li>
                        <li className="flex items-center gap-2 text-white"><Check className="w-5 h-5 text-indigo-400" /> Private Projects</li>
                        <li className="flex items-center gap-2 text-white"><Check className="w-5 h-5 text-indigo-400" /> Export Code</li>
                    </ul>
                    <button
                        onClick={() => handlePurchase('pro')}
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-500/25"
                    >
                        Get Pro
                    </button>
                </div>

                {/* Yearly Plan */}
                <div className="bg-slate-800 rounded-2xl p-8 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col">
                    <div className="mb-4">
                        <span className="text-purple-400 font-medium">Enterprise</span>
                        <div className="text-3xl font-bold text-white mt-2">₹2999</div>
                        <div className="text-sm text-gray-500">per year</div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-gray-300"><Crown className="w-5 h-5 text-purple-500" /> 8000 Credits</li>
                        <li className="flex items-center gap-2 text-gray-300"><Check className="w-5 h-5 text-purple-400" /> All Pro Features</li>
                        <li className="flex items-center gap-2 text-gray-300"><Check className="w-5 h-5 text-purple-400" /> 2 Months Free</li>
                        <li className="flex items-center gap-2 text-gray-300"><Check className="w-5 h-5 text-purple-400" /> Dedicated Support</li>
                    </ul>
                    <button
                        onClick={() => handlePurchase('yearly')}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold transition-all"
                    >
                        Get Yearly
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
