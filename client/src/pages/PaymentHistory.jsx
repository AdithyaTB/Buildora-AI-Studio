import { useState, useEffect } from 'react';
import { getPaymentHistory } from '../api/stripeService';
import { Search, Filter, Calendar, CreditCard, ExternalLink, ShieldCheck, HelpCircle, ChevronLeft, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const statusColors = {
    succeeded: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    refunded: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
};

const PaymentHistory = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await getPaymentHistory({ page, limit: 10, search, status });
            setPayments(data.payments);
            setTotalPages(data.pages);
        } catch (error) {
            console.error("Failed to load payments history", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchHistory();
        }, 300); // Debounce search queries

        return () => clearTimeout(delayDebounce);
    }, [page, search, status]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-28 px-4 pb-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <button 
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium mb-3 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Profile
                        </button>
                        <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
                        <p className="text-slate-400 text-sm mt-1">Monitor invoices, payment history, and credit transactions.</p>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by Transaction ID, Reference, or Intent..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="w-full md:w-56 relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            className="w-full appearance-none bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-10 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="succeeded">Succeeded</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </div>

                {/* History Table Container */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 bg-slate-800/40 rounded-xl animate-pulse w-full"></div>
                            ))}
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <CreditCard className="w-12 h-12 text-slate-600 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-300">No transactions found</h3>
                            <p className="text-slate-500 text-sm mt-1 max-w-sm">No payment records match your filters or search keywords.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Transaction ID</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Method</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50 text-sm">
                                    {payments.map((p) => (
                                        <tr 
                                            key={p._id}
                                            onClick={() => setSelectedPayment(p)}
                                            className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-500" />
                                                    <span>{formatDate(p.createdAt)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-indigo-300 group-hover:text-indigo-400 transition-colors">
                                                {p.transactionId || p.paymentIntentId || 'Pending'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[p.paymentStatus || 'pending']}`}>
                                                    {p.paymentStatus || 'pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 capitalize text-slate-400">
                                                {p.paymentMethod || 'card'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-white whitespace-nowrap">
                                                ₹{p.amount}.00
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-800/50 bg-slate-900/20 text-sm">
                            <span className="text-slate-400">Page {page} of {totalPages}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 border border-slate-800 hover:border-slate-700 bg-slate-900 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 border border-slate-800 hover:border-slate-700 bg-slate-900 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedPayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Overlay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPayment(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative overflow-hidden shadow-2xl z-10"
                        >
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="absolute right-4 top-4 p-1 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-xl font-bold text-white mb-2">Transaction Details</h3>
                            <p className="text-slate-400 text-xs mb-6">Payment metadata and details for this invoice.</p>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 border-b border-slate-850 pb-3">
                                    <span className="text-slate-400 text-sm">Status</span>
                                    <span className={`text-sm font-semibold capitalize text-right text-indigo-400`}>
                                        {selectedPayment.paymentStatus}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 border-b border-slate-850 pb-3">
                                    <span className="text-slate-400 text-sm">Amount Paid</span>
                                    <span className="text-sm font-bold text-white text-right">₹{selectedPayment.amount}.00 ({selectedPayment.currency.toUpperCase()})</span>
                                </div>
                                <div className="grid grid-cols-2 border-b border-slate-850 pb-3">
                                    <span className="text-slate-400 text-sm">Created Date</span>
                                    <span className="text-sm text-slate-350 text-right">{formatDate(selectedPayment.createdAt)}</span>
                                </div>
                                <div className="grid grid-cols-2 border-b border-slate-850 pb-3">
                                    <span className="text-slate-400 text-sm">Order Reference</span>
                                    <span className="text-sm font-mono text-slate-300 text-right">{selectedPayment.orderReference || 'N/A'}</span>
                                </div>
                                <div className="grid grid-cols-2 border-b border-slate-850 pb-3">
                                    <span className="text-slate-400 text-sm">Payment Intent ID</span>
                                    <span className="text-sm font-mono text-slate-300 text-right break-all text-xs">{selectedPayment.paymentIntentId || 'N/A'}</span>
                                </div>
                                <div className="grid grid-cols-2 border-b border-slate-850 pb-3">
                                    <span className="text-slate-400 text-sm">Transaction ID</span>
                                    <span className="text-sm font-mono text-slate-300 text-right break-all text-xs">{selectedPayment.transactionId || 'N/A'}</span>
                                </div>
                                <div className="grid grid-cols-2 pb-3">
                                    <span className="text-slate-400 text-sm">Payment Method</span>
                                    <span className="text-sm capitalize text-slate-350 text-right">{selectedPayment.paymentMethod || 'card'}</span>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                {selectedPayment.receiptUrl ? (
                                    <a
                                        href={selectedPayment.receiptUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer text-sm"
                                    >
                                        <ExternalLink className="w-4 h-4" /> View Stripe Receipt
                                    </a>
                                ) : (
                                    <div className="flex-1 bg-slate-800 text-slate-400 font-medium py-3 rounded-xl text-center text-xs flex items-center justify-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-slate-500" /> Stripe signature verified
                                    </div>
                                )}
                                <button
                                    onClick={() => setSelectedPayment(null)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold py-3 rounded-xl transition-all text-sm"
                                >
                                    Dismiss Details
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaymentHistory;
