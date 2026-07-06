import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import Editor from '../components/Editor';
import PreviewFrame from '../components/PreviewFrame'; // Assumed component
import { Send, Code, Eye, Download, Save, Share2, Loader2, LayoutTemplate, X, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Builder = () => {
    const { user, refreshUser } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('preview'); // 'preview' or 'code'
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    // Save Modal State
    const [projectTitle, setProjectTitle] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        try {
            // Deduct Credits First
            try {
                await axios.post('/auth/deduct-credits');
                refreshUser(); // Update UI credits immediately
            } catch (err) {
                toast.error(err.response?.data?.message || "Insufficient credits");
                setLoading(false);
                return;
            }

            // Direct Frontend Generation
            const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                ]
            });

            const result = await model.generateContent(`
You are an elite AI Website Generator.
Your task is to generate a UNIQUE and ORIGINAL complete production-ready website in a SINGLE HTML file using:
- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript
- Modern UI/UX
- Fully Responsive Design
- Animations using CSS or JS
- Clean semantic structure
- Beautiful typography and spacing
- Glassmorphism / Neumorphism modern design
- Light & Dark mode toggle
- Smooth scrolling and micro-interactions

STRICT RULES:
- Output ONLY one single HTML file
- Do NOT include explanations
- Include Tailwind CDN: <script src="https://cdn.tailwindcss.com"></script>
- Include all CSS and JS inside the same file
- Ensure responsive design for mobile, tablet, desktop
- Use modern sections: Hero, Features, About, Projects/Gallery, Testimonials, Pricing, Contact, Footer
- Add hover effects, transitions, and animations
- Use gradient colors and modern shadows
- Code must be clean, well-indented, and production-ready
- Do NOT simulate copyright or trademarks of existing brands. Create unique content.

User Prompt:
${prompt}

Return ONLY the final HTML file code. Do not wrap in markdown code blocks like \`\`\`html ... \`\`\`. Just the raw code.
`);

            const response = await result.response;
            let text = response.text();

            // Cleanup markdown if present (Regex to match strictly ```html content ```)
            const htmlMatch = text.match(/```html\s*([\s\S]*?)```/);
            if (htmlMatch) {
                text = htmlMatch[1];
            } else if (text.startsWith("```")) {
                text = text.replace(/```/g, "");
            }

            const cleanCode = text.trim();

            // Generate full HTML wrapped version for viewing
            let finalCode = cleanCode;
            if (!finalCode.toLowerCase().includes("<!doctype html>")) {
                finalCode = `<!DOCTYPE html>\n<html>\n<head>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body>\n${finalCode}\n</body>\n</html>`;
            }

            // We store both versions
            setGeneratedCode({ snippet: cleanCode, full: finalCode });

            // We can still optionally refresh user credits if we want to sync with backend,
            // but since we are bypassing backend generation, credits won't decrease automatically.
            // For now, we just generate.

        } catch (error) {
            console.error(error);
            toast.error("Generation failed: " + (error.message || error.toString()));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProject = async () => {
        if (!generatedCode) return;
        setSaveLoading(true);
        try {
            await axios.post('/projects', {
                prompt,
                generatedCode: generatedCode.snippet,
                fullSourceCode: generatedCode.full,
                title: projectTitle,
                isPublic
            });
            setIsSaveModalOpen(false);
            toast.success("Project saved successfully!");
        } catch (error) {
            console.error("Save failed:", error);
            toast.error("Failed to save project");
        } finally {
            setSaveLoading(false);
        }
    };

    const downloadCode = () => {
        const payload = typeof generatedCode === 'object' ? generatedCode.full : generatedCode;
        const blob = new Blob([payload], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const openInNewTab = () => {
        const payload = typeof generatedCode === 'object' ? generatedCode.full : generatedCode;
        if (!payload) return;
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(payload);
            newWindow.document.close();
        } else {
            toast.error("Please allow popups for this website to open the preview in a new tab.");
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-white flex flex-col md:flex-row overflow-hidden">

            {/* Left Sidebar - Chat & Controls */}
            <div className="w-full md:w-[400px] flex flex-col border-r border-white/10 bg-slate-900/50 backdrop-blur-md z-10">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <LayoutTemplate className="w-5 h-5 text-indigo-400" />
                        Website Builder
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Describe your dream website and watch it come to life.</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Prompt Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Your Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. A portfolio for a photographer with a dark theme, image gallery, and contact form..."
                            className="w-full h-40 bg-slate-800 border-2 border-slate-700 rounded-xl p-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none placeholder:text-gray-600"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> Generate Website
                            </>
                        )}
                    </button>

                    {/* Instructions / Tips */}
                    {(!generatedCode || (typeof generatedCode === 'object' && !generatedCode.snippet)) && (
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                            <h4 className="text-indigo-300 font-semibold mb-2 text-sm">Tips for better results:</h4>
                            <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4">
                                <li>Be specific about sections (Hero, Features, Footer).</li>
                                <li>Mention color schemes (Dark mode, Gradient, Pastel).</li>
                                <li>Ask for specific functionality (Contact form, Gallery).</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Main Area - Preview & Code */}
            <div className="flex-1 flex flex-col h-[calc(100vh-64px)] relative bg-slate-950">
                {/* Visual Loading State Overlay */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center"
                        >
                            <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <BotIcon className="absolute inset-0 m-auto text-indigo-400 w-8 h-8 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Creating your masterpiece...</h3>
                            <p className="text-gray-400 animate-pulse">Writing HTML... Styling with Tailwind... Assembling components...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {generatedCode ? (
                    <>
                        {/* Toolbar */}
                        <div className="h-14 border-b border-white/10 bg-slate-900/50 flex items-center justify-between px-6 backdrop-blur-md">
                            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setView('preview')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Eye className="w-4 h-4" /> Preview
                                </button>
                                <button
                                    onClick={() => setView('code')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'code' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Code className="w-4 h-4" /> Code
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={openInNewTab}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Open in new tab"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={downloadCode}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Download HTML"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                                <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                                <button
                                    onClick={() => setIsSaveModalOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-600/20 hover:shadow-green-600/40 transition-all flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> Save Project
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden relative">
                            <div className={`absolute inset-0 transition-opacity duration-300 ${view === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                                <PreviewFrame code={typeof generatedCode === 'object' ? generatedCode.full : generatedCode} />
                            </div>
                            <div className={`absolute inset-0 transition-opacity duration-300 ${view === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                                <Editor
                                    code={typeof generatedCode === 'object' ? generatedCode.full : generatedCode}
                                    onChange={(newCode) => {
                                        // Update logic omitted for simplicity since this is view/generate
                                    }}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                        <div className="w-32 h-32 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 ring-4 ring-slate-800">
                            <LayoutTemplate className="w-16 h-16 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">Ready to Build?</h3>
                        <p className="max-w-md">Enter a prompt in the sidebar and hit generate. Your website preview will appear here instantly.</p>
                    </div>
                )}
            </div>

            {/* Save Modal */}
            <AnimatePresence>
                {isSaveModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSaveModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl"
                        >
                            <button
                                onClick={() => setIsSaveModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-xl font-bold text-white mb-6">Save Project</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Project Title</label>
                                    <input
                                        type="text"
                                        value={projectTitle}
                                        onChange={(e) => setProjectTitle(e.target.value)}
                                        className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        placeholder="My Awesome Website"
                                    />
                                </div>

                                <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPublic ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-700/50 text-gray-400'}`}>
                                            <Share2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Public Community</p>
                                            <p className="text-xs text-gray-500">Showcase your work to others</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsPublic(!isPublic)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-indigo-600' : 'bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setIsSaveModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProject}
                                    disabled={saveLoading}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Save Project
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper Icon for loading state
const BotIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

export default Builder;
