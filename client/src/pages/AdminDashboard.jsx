import { useState, useEffect } from 'react';
import { getAdminStats, processRefund } from '../api/stripeService';
import { DollarSign, CheckCircle, XCircle, RefreshCw, Users, AlertCircle, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const statusColors = {
    succeeded: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    refunded: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refundLoading, setRefundLoading] = useState(null); // stores paymentIntentId of item being refunded

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await getAdminStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to load admin stats", error);
            toast.error("Not authorized or failed to fetch admin stats.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleRefund = async (paymentIntentId) => {
        if (!window.confirm("Are you sure you want to refund this payment? This will process a refund via Stripe and revert the user's credits.")) {
            return;
        }

        setRefundLoading(paymentIntentId);
        try {
            await processRefund(paymentIntentId);
            toast.success("Refund processed successfully!");
            // Refresh stats to update table
            await fetchStats();
        } catch (error) {
            console.error("Refund processing failed:", error);
            toast.error(error.response?.data?.message || "Failed to process refund.");
        } finally {
            setRefundLoading(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white pt-28 px-4 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
                    <span className="text-slate-400 text-sm">Loading Payment Analytics...</span>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-slate-950 text-white pt-28 px-4 flex items-center justify-center">
                <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold">Access Denied</h3>
                    <p className="text-slate-400 text-sm mt-2">You do not have administrative privileges to access this dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-28 px-4 pb-20">
            <div className="max-w-7xl mx-auto">
                {/* Title */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight">Admin Payment Analytics</h1>
                    <p className="text-slate-400 text-sm mt-1">Review revenue metrics, transactions history, and process refund requests.</p>
                </div>

                {/* Grid Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {/* card 1 */}
                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                            <h3 className="text-3xl font-extrabold text-white mt-1">₹{stats.totalRevenue}.00</h3>
                        </div>
                        <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>

                    {/* card 2 */}
                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Successful Payments</span>
                            <h3 className="text-3xl font-extrabold text-white mt-1">{stats.successfulPayments}</h3>
                        </div>
                        <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>

                    {/* card 3 */}
                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Failed Payments</span>
                            <h3 className="text-3xl font-extrabold text-white mt-1">{stats.failedPayments}</h3>
                        </div>
                        <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
                            <XCircle className="w-6 h-6" />
                        </div>
                    </div>

                    {/* card 4 */}
                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Refunded Count</span>
                            <h3 className="text-3xl font-extrabold text-white mt-1">{stats.refundCount}</h3>
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                            <RefreshCw className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Secondary Section - Graphs Placeholder and Recent Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Monthly revenue metrics */}
                    <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                        <h3 className="font-bold text-lg text-white mb-6">Monthly Revenue Growth</h3>
                        {stats.monthlyRevenue.length === 0 ? (
                            <p className="text-slate-500 text-sm">No monthly transaction data available.</p>
                        ) : (
                            <div className="space-y-4">
                                {stats.monthlyRevenue.map((m, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">{m.month}</span>
                                        <div className="flex items-center gap-4 flex-1 justify-end">
                                            <div className="h-2 bg-indigo-500 rounded-full max-w-[120px]" style={{ width: `${Math.min(100, (m.revenue / (stats.totalRevenue || 1)) * 100)}px` }}></div>
                                            <span className="font-bold text-white text-sm">₹{m.revenue}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Recent transactions list */}
                    <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-white">Recent Transactions</h3>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live feed</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/20">
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-850 text-sm">
                                    {stats.recentTransactions.map((t) => (
                                        <tr key={t._id} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-white">{t.userId?.name || 'Deleted User'}</div>
                                                <div className="text-slate-500 text-xs mt-0.5">{t.userId?.email || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-350 text-xs">
                                                {formatDate(t.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[t.paymentStatus || 'pending']}`}>
                                                    {t.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-white">
                                                ₹{t.amount}.00
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {t.paymentStatus === 'succeeded' && (
                                                    <button
                                                        onClick={() => handleRefund(t.paymentIntentId)}
                                                        disabled={refundLoading === t.paymentIntentId}
                                                        className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 ml-auto cursor-pointer"
                                                    >
                                                        {refundLoading === t.paymentIntentId ? (
                                                            <>
                                                                <Loader2 className="w-3 h-3 animate-spin" /> Refunding...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <RefreshCw className="w-3 h-3" /> Refund
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                                {t.paymentStatus === 'refunded' && (
                                                    <span className="text-xs text-slate-500 italic pr-2">Reverted</span>
                                                )}
                                                {t.paymentStatus === 'failed' && (
                                                    <span className="text-xs text-rose-500 italic pr-2">Dropped</span>
                                                )}
                                                {t.paymentStatus === 'pending' && (
                                                    <span className="text-xs text-amber-500 italic pr-2">Awaiting</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
