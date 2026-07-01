import { Link } from 'react-router-dom';
import { Bot, Zap, Code, Layout, Globe, ArrowRight, Star, CheckCircle, Github, Twitter, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-white overflow-hidden selection:bg-indigo-500/30">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10 opacity-30 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-indigo-300 mb-8 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            v1.0 is now live
                        </div>
                        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                                Describe Your Idea.
                            </span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mt-2">
                                Buildora Builds It.
                            </span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Turn text prompts into production-ready websites in seconds.
                            The world's most advanced AI website builder. No coding required.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/builder" className="group bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 flex items-center justify-center gap-2">
                                Start Building for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/community" className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all backdrop-blur-sm border border-white/10 hover:border-white/20">
                                View Community
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-slate-800/30 backdrop-blur-md border-y border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Why Choose Buildora?</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Experience the future of web development with features designed for speed and quality.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <Zap className="w-8 h-8 text-yellow-400" />, title: "Instant Generation", desc: "From prompt to deployed website in under 30 seconds." },
                            { icon: <Code className="w-8 h-8 text-blue-400" />, title: "Clean Code", desc: "Production-ready React + Tailwind code that you can export." },
                            { icon: <Layout className="w-8 h-8 text-green-400" />, title: "Responsive Design", desc: "Looks perfect on mobile, tablet, and desktop automatically." }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="p-8 bg-slate-900/50 border border-white/10 rounded-2xl hover:border-indigo-500/50 transition-colors group hover:bg-slate-900/80"
                            >
                                <div className="mb-4 bg-slate-800 w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="py-24 bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-gray-400">Three simple steps to your dream website.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent -z-10"></div>

                        {[
                            { step: "01", title: "Describe", desc: "Enter a detailed prompt describing your website's purpose and style." },
                            { step: "02", title: "Generate", desc: "Watch as AI writes code, styles, and content in real-time." },
                            { step: "03", title: "Publish", desc: "Preview, edit code if needed, and export or deploy instantly." }
                        ].map((item, index) => (
                            <div key={index} className="text-center relative">
                                <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full border-4 border-slate-900 flex items-center justify-center mb-6 shadow-xl relative z-10 group">
                                    <span className="text-3xl font-bold text-indigo-500 group-hover:scale-110 transition-transform">{item.step}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-white mb-12 text-center">Loved by Builders</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: "Alex Chen", role: "Startup Founder", text: "Built my MVP landing page in 10 minutes. The code quality is surprisingly good." },
                            { name: "Sarah Jones", role: "Freelancer", text: "I use this to prototype ideas for clients. It saves me hours of initial setup time." },
                            { name: "Mike Ross", role: "Developer", text: "The Tailwind integration is flawless. It understands my design requirements perfectly." }
                        ].map((t, i) => (
                            <div key={i} className="bg-slate-900/50 p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                                <div className="flex items-center gap-1 text-yellow-500 mb-4">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                                <p className="text-gray-300 mb-6 italic">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-sm">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-white">{t.name}</div>
                                        <div className="text-xs text-gray-500">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-950 py-12 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
                                <Bot className="h-6 w-6 text-indigo-500" />
                                <span>Buildora.AI</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Empowering everyone to build the web with AI.
                                Design, generate, and deploy in seconds.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link to="/builder" className="hover:text-indigo-400 transition-colors">Builder</Link></li>
                                <li><Link to="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
                                <li><Link to="/community" className="hover:text-indigo-400 transition-colors">Showcase</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Support</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Connect</h4>
                            <div className="flex gap-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-8 text-center text-xs text-gray-600">
                        © {new Date().getFullYear()} Buildora AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
