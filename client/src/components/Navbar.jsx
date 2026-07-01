import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, LogOut, Code, Layout, CreditCard, User as UserIcon, Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="bg-slate-900 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
                            <Bot className="h-8 w-8 text-indigo-500" />
                            <span className="tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                Buildora.AI
                            </span>
                        </Link>
                        {/* Desktop Menu */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link to="/builder" className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-all">Builder</Link>
                                <Link to="/community" className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-all">Community</Link>
                                <Link to="/pricing" className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-all">Pricing</Link>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Right Side (Auth/Profile) */}
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6 gap-4">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                        <span className="text-indigo-400 text-sm font-medium">{user.credits} Credits</span>
                                    </div>

                                    {/* Profile Dropdown */}
                                    <div className="relative" ref={profileRef}>
                                        <button
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors focus:outline-none"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-transparent hover:border-indigo-400 transition-all">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isProfileOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-2xl py-2 border border-white/10 transform origin-top-right transition-all animation-fade-in-down">
                                                <div className="px-4 py-3 border-b border-white/5">
                                                    <p className="text-xs text-gray-500">Signed in as</p>
                                                    <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                                                </div>
                                                <div className="py-1">
                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <UserIcon className="w-4 h-4" /> Profile
                                                    </Link>
                                                    <Link
                                                        to="/payment-history"
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <CreditCard className="w-4 h-4" /> Payment History
                                                    </Link>
                                                    {user.role === 'admin' && (
                                                        <Link
                                                            to="/admin/dashboard"
                                                            className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-400 hover:bg-white/5 hover:text-indigo-300 transition-colors font-medium border-t border-white/5"
                                                            onClick={() => setIsProfileOpen(false)}
                                                        >
                                                            <Layout className="w-4 h-4" /> Admin Analytics
                                                        </Link>
                                                    )}
                                                </div>
                                                <div className="py-1 border-t border-white/5">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" /> Sign out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex gap-3">
                                    <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Login</Link>
                                    <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-slate-900 border-b border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/builder" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-white hover:bg-slate-800 block px-3 py-2 rounded-md text-base font-medium">Builder</Link>
                        <Link to="/community" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-white hover:bg-slate-800 block px-3 py-2 rounded-md text-base font-medium">Community</Link>
                        <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-white hover:bg-slate-800 block px-3 py-2 rounded-md text-base font-medium">Pricing</Link>
                    </div>
                    {user ? (
                        <div className="pt-4 pb-4 border-t border-white/10">
                            <div className="flex items-center px-5">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium leading-none text-white">{user.name}</div>
                                    <div className="text-sm font-medium leading-none text-gray-400 mt-1">{user.email}</div>
                                </div>
                                <div className="ml-auto bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                                    <span className="text-indigo-400 text-xs font-medium">{user.credits} Cr</span>
                                </div>
                            </div>
                            <div className="mt-3 px-2 space-y-1">
                                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-slate-800">Your Profile</Link>
                                <Link to="/payment-history" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-slate-800">Payment History</Link>
                                 {user.role === 'admin' && (
                                    <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 font-semibold">Admin Analytics</Link>
                                )}
                                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-slate-800">
                                    Sign out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-4 pb-4 border-t border-white/10">
                            <div className="mt-3 px-2 space-y-1">
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-slate-800">Login</Link>
                                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-indigo-400 hover:text-indigo-300 hover:bg-slate-800">Create Account</Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
