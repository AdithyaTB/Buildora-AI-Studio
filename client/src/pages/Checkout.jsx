import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, verifyPayment } from '../api/stripeService';
import { useAuth } from '../context/AuthContext';
import StripeProvider from '../components/StripeProvider';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const PLANS = {
    'pro-monthly': { name: 'Pro Monthly', amount: 499, description: 'Best for individual creators. 500 monthly generation credits.', credits: 500, currency: 'INR' },
    'pro-yearly': { name: 'Pro Yearly', amount: 4999, description: 'Supercharge your design workflow. 8000 credits & 2 months free.', credits: 8000, currency: 'INR' },
    'credits-199': { name: '₹199 Credit Pack', amount: 199, description: 'One-time top up. Adds 150 generation credits.', credits: 150, currency: 'INR' },
    'credits-399': { name: '₹399 Credit Pack', amount: 399, description: 'Best value top up. Adds 400 generation credits.', credits: 400, currency: 'INR' },
    'credits-799': { name: '₹799 Credit Pack', amount: 799, description: 'Heavy duty top up. Adds 1000 generation credits.', credits: 1000, currency: 'INR' }
};

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const planType = searchParams.get('plan') || 'pro-monthly';
    const plan = PLANS[planType] || PLANS['pro-monthly'];

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        if (!user) {
            toast.error("Please login to proceed to checkout");
            navigate('/login');
        }
    }, [user, navigate]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            // 1. Create Payment Intent on backend
            const { clientSecret } = await createPaymentIntent(planType);

            // 2. Confirm Payment Intent with Stripe Elements
            const cardElement = elements.getElement(CardElement);
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name,
                        email
                    }
                }
            });

            if (error) {
                console.error("Payment Confirmation Error:", error);
                setErrorMsg(error.message || "Card verification failed.");
                setLoading(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                // 3. Verify Payment with backend to update status & credits
                await verifyPayment(paymentIntent.id);
                setPaymentSuccess(true);
                toast.success("Payment successful!");
                await refreshUser();
            } else {
                setErrorMsg(`Payment process status: ${paymentIntent.status}`);
            }
        } catch (err) {
            console.error("Checkout flow failed:", err);
            setErrorMsg(err.response?.data?.message || err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const calculatedTax = parseFloat((plan.amount * 0.18).toFixed(2)); // Mock 18% GST/Tax
    const totalAmount = parseFloat((plan.amount + calculatedTax).toFixed(2));

    const cardElementOptions = {
        style: {
            base: {
                color: '#ffffff',
                fontFamily: 'Outfit, Inter, system-ui, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#94a3b8'
                },
                iconColor: '#818cf8'
            },
            invalid: {
                color: '#ef4444',
                iconColor: '#ef4444'
            }
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <AnimatePresence mode="wait">
                {!paymentSuccess ? (
                    <>
                        {/* Order Summary Column */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="md:col-span-5 bg-slate-800/80 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl flex flex-col justify-between"
                        >
                            <div>
                                <button 
                                    onClick={() => navigate('/pricing')}
                                    className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium mb-6 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Pricing
                                </button>
                                
                                <h3 className="text-xl font-bold text-white mb-2">Order Summary</h3>
                                <p className="text-slate-400 text-xs mb-6">Review your order before securely checking out.</p>

                                <div className="border-b border-slate-700/50 pb-4 mb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-white">{plan.name}</h4>
                                            <p className="text-xs text-indigo-300 font-medium">{plan.credits} Credits Included</p>
                                        </div>
                                        <span className="font-bold text-white">₹{plan.amount}.00</span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>Subtotal</span>
                                        <span>₹{plan.amount}.00</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>Estimated Tax (18% GST)</span>
                                        <span>₹{calculatedTax}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-700/50 pt-4 flex justify-between items-center text-lg font-bold text-white">
                                <span>Total Amount</span>
                                <span className="text-indigo-400">₹{totalAmount}</span>
                            </div>
                        </motion.div>

                        {/* Payment Details Form Column */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="md:col-span-7 bg-slate-800/80 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-indigo-400" />
                                Secure Payment Details
                            </h3>

                            <form onSubmit={handleFormSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Billing Name</label>
                                        <input 
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Billing Email</label>
                                        <input 
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="border border-slate-700/50 bg-slate-900 p-4 rounded-xl">
                                    <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3">Card Information</label>
                                    <div className="px-2 py-3 bg-slate-950 border border-slate-800 rounded-lg">
                                        <CardElement options={cardElementOptions} />
                                    </div>
                                </div>

                                {errorMsg && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-500/30 text-red-400 text-sm rounded-xl"
                                    >
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{errorMsg}</span>
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!stripe || loading}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-5 h-5" /> Pay Securely ₹{totalAmount}
                                        </>
                                    )}
                                </button>
                                
                                <p className="text-center text-xs text-slate-500 leading-normal">
                                    Your payment information is encrypted and secured via bank-grade Stripe protocols.
                                </p>
                            </form>
                        </motion.div>
                    </>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="col-span-12 text-center bg-slate-800/80 border border-slate-700/50 p-12 rounded-3xl max-w-2xl mx-auto shadow-2xl flex flex-col items-center"
                    >
                        <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-6" />
                        <h2 className="text-3xl font-extrabold text-white mb-4">Payment Confirmed!</h2>
                        <p className="text-slate-300 mb-2 leading-relaxed">
                            Thank you for your order. Your purchase has been processed, and **{plan.credits} credits** have been instantly added to your account.
                        </p>
                        <p className="text-slate-400 text-sm mb-8">
                            A confirmation invoice receipt has been dispatched to **{email}**.
                        </p>
                        
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/profile')}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
                            >
                                View Profile Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/builder')}
                                className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-3 rounded-xl transition-all"
                            >
                                Start Building
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Checkout = () => {
    return (
        <div className="min-h-screen bg-slate-950 pt-28 px-4 pb-20">
            <StripeProvider>
                <CheckoutForm />
            </StripeProvider>
        </div>
    );
};

export default Checkout;
