import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Loader2, Trash2, Eye, Code, MapPin, Briefcase, Github, Twitter, Linkedin, Globe, Edit3, X, Save, Download, Activity, Link as LinkIcon, Key, Tag } from 'lucide-react';

const Profile = () => {
    const { user, logout, refreshUser } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('projects');
    const [newSkill, setNewSkill] = useState('');

    // Edit Form State
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        bio: '',
        title: '',
        location: '',
        github: '',
        twitter: '',
        linkedin: '',
        portfolio: '',
        skills: [],
        preferences: {
            theme: 'dark',
            framework: 'html-tailwind-js',
            palette: '',
            language: 'en'
        },
        visibility: {
            showProfile: true,
            showProjects: true
        }
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Refresh user data to get latest profile fields
                await refreshUser();
                const { data } = await api.get('/projects/my-projects');
                setProjects(data);
            } catch (error) {
                console.error("Failed to fetch data", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    // Load user data into form when modal opens
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                bio: user.bio || '',
                title: user.title || '',
                location: user.location || '',
                github: user.socials?.github || '',
                twitter: user.socials?.twitter || '',
                linkedin: user.socials?.linkedin || '',
                portfolio: user.socials?.portfolio || '',
                skills: user.skills || [],
                preferences: {
                    theme: user.preferences?.theme || 'dark',
                    framework: user.preferences?.framework || 'html-tailwind-js',
                    palette: user.preferences?.palette || '',
                    language: user.preferences?.language || 'en'
                },
                visibility: {
                    showProfile: user.visibility?.showProfile ?? true,
                    showProjects: user.visibility?.showProjects ?? true
                }
            });
        }
    }, [user]); // Removed isEditModalOpen dependency as we are phasing out the modal

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            await api.put('/auth/profile', {
                name: formData.name,
                username: formData.username,
                bio: formData.bio,
                title: formData.title,
                location: formData.location,
                skills: formData.skills,
                socials: {
                    github: formData.github,
                    twitter: formData.twitter,
                    linkedin: formData.linkedin,
                    portfolio: formData.portfolio
                },
                preferences: formData.preferences,
                visibility: formData.visibility
            });
            await refreshUser();
            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        setUpdateLoading(true);
        try {
            await api.put('/auth/profile', {
                password: passwordData.newPassword
            });
            setPasswordData({ newPassword: '', confirmPassword: '' });
            toast.success("Password updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update password");
        } finally {
            setUpdateLoading(false);
        }
    };

    const uploadAvatar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const form = new FormData();
        form.append("avatar", file);

        try {
            toast.loading("Uploading avatar...", { id: "avatar-up" });
            await api.put("/auth/avatar", form, { headers: { "Content-Type": "multipart/form-data" } });
            await refreshUser();
            toast.success("Avatar updated!", { id: "avatar-up" });
        } catch (error) {
            toast.error("Failed to upload avatar", { id: "avatar-up" });
        }
    };

    const uploadBanner = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const form = new FormData();
        form.append("banner", file);

        try {
            toast.loading("Uploading banner...", { id: "banner-up" });
            await api.put("/auth/banner", form, { headers: { "Content-Type": "multipart/form-data" } });
            await refreshUser();
            toast.success("Banner updated!", { id: "banner-up" });
        } catch (error) {
            toast.error("Failed to upload banner", { id: "banner-up" });
        }
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;
        try {
            await api.delete(`/projects/${id}`);
            setProjects(projects.filter(p => p._id !== id));
            toast.success("Project deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete project");
        }
    };

    const handleDownload = (project) => {
        const payload = project.fullSourceCode || project.generatedCode;
        if (!payload) return;
        const blob = new Blob([payload], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(project.title || 'website').replace(/\s+/g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleAddSkill = (e) => {
        e.preventDefault();
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
    };

    const handleOpenInNewTab = (project) => {
        const payload = project.fullSourceCode || project.generatedCode;
        if (!payload) return;
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(payload);
            newWindow.document.close();
        } else {
            toast.error("Please allow popups to view in a new tab.");
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-slate-900 pt-24 px-4 pb-20">
            <div className="max-w-6xl mx-auto">

                {/* Profile Header */}
                <div className="bg-slate-800 rounded-3xl border border-white/10 mb-12 relative overflow-hidden">
                    {/* Banner */}
                    <div className="h-48 w-full bg-slate-700 relative group">
                        {user?.banner ? (
                            <img src={user.banner} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-slate-800 to-indigo-900"></div>
                        )}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={() => setActiveTab('basic_info')}
                                className="px-4 py-2 bg-slate-900/60 backdrop-blur-md hover:bg-slate-800 rounded-lg text-white text-sm font-bold transition-all shadow-lg border border-white/10 flex items-center gap-2"
                            >
                                <Edit3 className="w-4 h-4" /> Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="p-8 pt-0 flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 text-center md:text-left">
                        {/* Avatar */}
                        <div className="w-32 h-32 md:w-40 md:h-40 -mt-16 md:-mt-20 lg:ml-8 bg-slate-800 rounded-full flex items-center justify-center text-5xl font-bold text-white ring-4 md:ring-8 ring-slate-800 shadow-xl shrink-0 relative overflow-hidden z-20">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 mt-4 md:mt-2 xl:pt-2">
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">{user?.name}</h1>
                            {user?.username && <p className="text-indigo-400 font-bold mb-2">@{user.username}</p>}
                            <p className="text-gray-300 font-medium text-sm md:text-base mb-4">{user?.title || "AI Creator"}</p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-5 text-sm text-gray-400 mb-5 relative top-0.5">
                                {user?.location && (
                                    <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-white/5"><MapPin className="w-4 h-4 text-gray-500" /> {user.location}</span>
                                )}
                                <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-white/5"><Briefcase className="w-4 h-4 text-gray-500" /> <strong className="text-white">{projects.length}</strong> Projects</span>
                                <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase border border-indigo-500/20 shadow-inner">
                                    {user?.plan === 'pro' ? 'PRO PLAN' : 'FREE PLAN'}
                                </span>
                            </div>

                            {user?.bio && <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto md:mx-0 border-l-2 border-indigo-500/30 pl-4">{user.bio}</p>}

                            {/* Social Links */}
                            <div className="flex justify-center md:justify-start gap-4 mt-6">
                                {user?.socials?.github && (
                                    <a href={user.socials.github} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-800 hover:bg-indigo-600 group rounded-xl border border-white/5 transition-all shadow-sm"><Github className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" /></a>
                                )}
                                {user?.socials?.twitter && (
                                    <a href={user.socials.twitter} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-800 hover:bg-sky-500 group rounded-xl border border-white/5 transition-all shadow-sm"><Twitter className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" /></a>
                                )}
                                {user?.socials?.linkedin && (
                                    <a href={user.socials.linkedin} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-800 hover:bg-blue-600 group rounded-xl border border-white/5 transition-all shadow-sm"><Linkedin className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" /></a>
                                )}
                                {user?.socials?.portfolio && (
                                    <a href={user.socials.portfolio} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-800 hover:bg-emerald-500 group rounded-xl border border-white/5 transition-all shadow-sm"><Globe className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" /></a>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[220px] pb-2 md:mt-2 xl:mt-0 xl:pt-2">
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl border border-white/10 text-center shadow-xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors"></div>
                                <div className="relative z-10">
                                    <p className="text-gray-400 text-[10px] md:text-xs uppercase font-black tracking-widest mb-2">Credits Remaining</p>
                                    <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-sm">{user?.credits}</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="w-full py-3 bg-slate-800/50 hover:bg-red-500 text-gray-400 hover:text-white rounded-xl text-sm font-bold transition-all border border-white/5 hover:border-red-500/50 shadow-sm hover:shadow-red-500/20"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto gap-2 mb-8 pb-2 border-b border-white/10 scrollbar-hide">
                    {[
                        { id: 'projects', label: 'My Projects', icon: Code },
                        { id: 'dashboard_analytics', label: 'Dashboard', icon: Activity },
                        { id: 'basic_info', label: 'Basic Info', icon: Edit3 },
                        { id: 'creator_details', label: 'Creator Details', icon: Briefcase },
                        { id: 'billing_stats', label: 'Billing & Metrics', icon: MapPin },
                        { id: 'security', label: 'Security & Privacy', icon: Key }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold text-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Contents */}
                {activeTab === 'projects' && (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">My Projects</h2>
                            <a href="/builder" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition-all text-sm">
                                Create New
                            </a>
                        </div>

                        {projects.length === 0 ? (
                            <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-white/5 border-dashed">
                                <p className="text-gray-400 mb-6">You haven't created any projects yet.</p>
                                <a href="/builder" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all inline-flex items-center gap-2">
                                    <Code className="w-4 h-4" /> Start Building
                                </a>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => (
                                    <div key={project._id} className="bg-slate-800 rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/50 transition-all group relative">
                                        <div className="h-48 bg-slate-900 relative">
                                            <iframe
                                                srcDoc={project.generatedCode}
                                                title={project.title}
                                                className="w-[200%] h-[200%] transform scale-50 origin-top-left pointer-events-none select-none grayscale group-hover:grayscale-0 transition-all"
                                                tabIndex="-1"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80" />
                                        </div>

                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-white line-clamp-1">{project.title || "Untitled"}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${project.isPublic ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                                                    {project.isPublic ? 'Public' : 'Private'}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 text-xs mb-4 line-clamp-2 h-8">{project.prompt}</p>

                                            <div className="flex items-center gap-2 mt-auto">
                                                <button
                                                    onClick={() => handleOpenInNewTab(project)}
                                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-bold text-center transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Eye className="w-3 h-3" /> View
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(project)}
                                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-bold text-center transition-colors flex items-center justify-center gap-2"
                                                    title="Download HTML"
                                                >
                                                    <Download className="w-3 h-3" /> Download
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProject(project._id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'basic_info' && (
                    <div className="bg-slate-800/50 rounded-3xl border border-white/10 p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="p-5 bg-slate-800/80 rounded-2xl border border-white/5 shadow-inner">
                                    <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Avatar Image</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600 shrink-0">
                                            {user?.avatar && <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />}
                                        </div>
                                        <input type="file" accept="image/*" onChange={uploadAvatar} className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer transition-colors" />
                                    </div>
                                </div>
                                <div className="p-5 bg-slate-800/80 rounded-2xl border border-white/5 shadow-inner">
                                    <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Banner Image</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-16 rounded-lg bg-slate-700 overflow-hidden border-2 border-slate-600 shrink-0">
                                            {user?.banner && <img src={user.banner} alt="Banner" className="w-full h-full object-cover" />}
                                        </div>
                                        <input type="file" accept="image/*" onChange={uploadBanner} className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Display Name</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-900 border border-slate-700/50 rounded-xl p-3.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all shadow-inner" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Username Handle</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
                                        <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} placeholder="johndoe" className="w-full pl-9 bg-slate-900 border border-slate-700/50 rounded-xl p-3.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all shadow-inner" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Only letters, numbers, and underscores.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Professional Headline / Title</label>
                                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Senior Frontend Engineer" className="w-full bg-slate-900 border border-slate-700/50 rounded-xl p-3.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all shadow-inner" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Short Bio</label>
                                <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows="4" placeholder="Tell the community about your expertise..." className="w-full bg-slate-900 border border-slate-700/50 rounded-xl p-3.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none transition-all shadow-inner" />
                            </div>

                            <div className="pt-6 border-t border-white/5 flex justify-end">
                                <button type="submit" disabled={updateLoading} className="py-3 px-8 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 min-w-[160px]">
                                    {updateLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'creator_details' && (
                    <div className="bg-slate-800/50 rounded-3xl border border-white/10 p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Creator Details</h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-6">

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Location (City, Country)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. San Francisco, CA" className="w-full pl-12 bg-slate-900 border border-slate-700/50 rounded-xl p-3.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all shadow-inner" />
                                </div>
                            </div>

                            <div className="pt-4">
                                <label className="block text-sm font-bold text-gray-400 mb-2">Tech Stack / Skills</label>
                                <div className="p-4 bg-slate-900 border border-slate-700/50 rounded-xl shadow-inner min-h-[100px]">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {formData.skills.map((skill, index) => (
                                            <span key={index} className="bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-lg text-sm font-bold border border-indigo-500/20 flex items-center gap-2">
                                                {skill}
                                                <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-400 transition-colors">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                        {formData.skills.length === 0 && <span className="text-gray-500 text-sm">No skills added yet.</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={e => setNewSkill(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && handleAddSkill(e)}
                                            placeholder="Add a skill (e.g. React) and press Enter"
                                            className="flex-1 bg-slate-800 border border-slate-700/50 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"
                                        />
                                        <button type="button" onClick={handleAddSkill} className="px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold text-sm transition-colors">Add</button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Public Social & Portfolio Links</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                        <input type="text" value={formData.portfolio} onChange={e => setFormData({ ...formData, portfolio: e.target.value })} placeholder="Portfolio Website URL" className="w-full pl-11 bg-slate-900 border border-slate-700/50 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all shadow-inner" />
                                    </div>
                                    <div className="relative">
                                        <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                        <input type="text" value={formData.github} onChange={e => setFormData({ ...formData, github: e.target.value })} placeholder="GitHub Profile URL" className="w-full pl-11 bg-slate-900 border border-slate-700/50 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all shadow-inner" />
                                    </div>
                                    <div className="relative">
                                        <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                        <input type="text" value={formData.twitter} onChange={e => setFormData({ ...formData, twitter: e.target.value })} placeholder="Twitter / X Profile URL" className="w-full pl-11 bg-slate-900 border border-slate-700/50 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all shadow-inner" />
                                    </div>
                                    <div className="relative">
                                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                        <input type="text" value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} placeholder="LinkedIn Profile URL" className="w-full pl-11 bg-slate-900 border border-slate-700/50 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all shadow-inner" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex justify-end">
                                <button type="submit" disabled={updateLoading} className="py-3 px-8 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 min-w-[160px]">
                                    {updateLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'billing_stats' && (
                    <div className="bg-slate-800/50 rounded-3xl border border-white/10 p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-white">Billing & Metrics</h2>
                            <span className="bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-500/20 uppercase tracking-widest">
                                {user?.plan === 'free' ? 'Free' : user?.plan === 'pro-monthly' ? 'Pro Monthly' : 'Pro Yearly'} Plan
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-center shadow-inner">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Credits Remaining</p>
                                <p className="text-4xl font-black text-indigo-400">{user?.credits || 0}</p>
                            </div>
                            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-center shadow-inner">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Used</p>
                                <p className="text-4xl font-black text-white">{user?.creditsUsed || 0}</p>
                            </div>
                            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-center shadow-inner">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Next Billing Date</p>
                                <p className="text-2xl font-bold text-white mt-2">
                                    {user?.nextBillingDate ? new Date(user.nextBillingDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 flex flex-col justify-center shadow-inner relative overflow-hidden group">
                                <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
                                <a href="/pricing" className="relative z-10 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg text-center">
                                    Manage Plan
                                </a>
                            </div>
                        </div>

                        {user?.stripeSubscriptionId && (
                            <div className="mt-6 p-4 bg-slate-900/50 border border-white/5 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-white font-bold">Active Subscription</p>
                                    <p className="text-sm text-gray-400">Your plan will automatically renew on the next billing date.</p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-lg border border-emerald-500/20">Active</span>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'dashboard_analytics' && (
                    <div className="bg-slate-800/50 rounded-3xl border border-white/10 p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">User Activity Insights <span className="text-sm font-normal text-gray-500 ml-2">(Aggregated Metrics)</span></h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute -right-6 -top-6 text-indigo-500/10"><Code className="w-32 h-32" /></div>
                                <div className="relative z-10">
                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Total Web Generations</p>
                                    <p className="text-4xl font-black text-white">{user?.stats?.websitesGenerated || projects.length}</p>
                                </div>
                            </div>
                            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute -right-6 -top-6 text-emerald-500/10"><Globe className="w-32 h-32" /></div>
                                <div className="relative z-10">
                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Public Templates</p>
                                    <p className="text-4xl font-black text-emerald-400">{projects.filter(p => p.isPublic).length}</p>
                                </div>
                            </div>
                            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute -right-6 -top-6 text-gray-500/10"><Globe className="w-32 h-32" /></div>
                                <div className="relative z-10">
                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Private Templates</p>
                                    <p className="text-4xl font-black text-gray-400">{projects.filter(p => !p.isPublic).length}</p>
                                </div>
                            </div>
                            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute -right-6 -top-6 text-amber-500/10"><Activity className="w-32 h-32" /></div>
                                <div className="relative z-10">
                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Days Active</p>
                                    <p className="text-4xl font-black text-white">
                                        {user?.createdAt ? Math.max(1, Math.ceil((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))) : 1}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-slate-900 border border-white/5 rounded-2xl text-center">
                            <p className="text-gray-500">More detailed analytical charts (time-series creation frequency, most popular tags, etc.) will be available in v2.0.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="bg-slate-800/50 rounded-3xl border border-white/10 p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Security & Privacy</h2>

                        <div className="space-y-8">
                            <form onSubmit={handleUpdateProfile} className="p-6 bg-slate-900 border border-white/5 rounded-2xl shadow-inner">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-indigo-400" /> Public Visibility</h3>
                                <p className="text-sm text-gray-400 mb-6">Control how your profile and projects are discovered on the Buildora Community page.</p>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-gray-200">Show Profile in Community Page</p>
                                            <p className="text-sm text-gray-500">Allow other users to see your basic info and stats.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={formData.visibility.showProfile} onChange={() => setFormData(s => ({ ...s, visibility: { ...s.visibility, showProfile: !s.visibility.showProfile } }))} />
                                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-gray-200">Show Created Websites Publicly</p>
                                            <p className="text-sm text-gray-500">Automatically list your new creations as public.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={formData.visibility.showProjects} onChange={() => setFormData(s => ({ ...s, visibility: { ...s.visibility, showProjects: !s.visibility.showProjects } }))} />
                                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                                        </label>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button type="submit" disabled={updateLoading} className="py-2.5 px-6 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-all text-sm">
                                        {updateLoading ? 'Saving...' : 'Save Privacy Settings'}
                                    </button>
                                </div>
                            </form>

                            <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl shadow-inner">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-indigo-400" /> Account Security</h3>
                                <p className="text-sm text-gray-400 mb-6">Manage your password and authentication methods.</p>

                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">New Password</label>
                                        <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} placeholder="••••••••" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Confirm New Password</label>
                                        <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} placeholder="••••••••" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 focus:outline-none" />
                                    </div>
                                    <button onClick={handleUpdatePassword} disabled={updateLoading || !passwordData.newPassword} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors mt-2">
                                        {updateLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-2xl">
                                <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
                                <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                                <button className="py-2.5 px-6 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 font-bold rounded-lg border border-red-500/20 transition-all text-sm tracking-wide">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default Profile;
