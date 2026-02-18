import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { User, Package, Clock, Shield, Globe, Lock, Search, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user, logout } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const { data } = await axios.get('/projects/my-projects');
                setProjects(data);
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchProjects();
    }, [user]);

    const filteredProjects = projects.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prompt?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                    {/* User Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full md:w-1/3 bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{user?.name}</h2>
                                <p className="text-gray-400 text-sm">{user?.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Package className="w-4 h-4" /> Credits
                                </div>
                                <span className="font-bold text-indigo-400">{user?.credits}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Shield className="w-4 h-4" /> Plan
                                </div>
                                <span className="font-bold text-white uppercase text-xs bg-indigo-600 px-2 py-1 rounded">
                                    {user?.plan === 'free' ? 'Starter' : user?.plan}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="w-full mt-6 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
                        >
                            Sign Out
                        </button>
                    </motion.div>

                    {/* Stats & Projects Header */}
                    <div className="flex-1 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <h1 className="text-3xl font-bold mb-2">My Projects</h1>
                            <p className="text-gray-400">Manage and view your generated websites.</p>
                        </motion.div>

                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>

                        {/* Projects Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : filteredProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredProjects.map((project, index) => (
                                    <motion.div
                                        key={project._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-slate-900 border border-white/10 rounded-xl p-5 hover:border-indigo-500/30 transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-lg truncate pr-4">{project.title || 'Untitled Project'}</h3>
                                            {project.isPublic ? (
                                                <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Globe className="w-3 h-3" /> Public
                                                </span>
                                            ) : (
                                                <span className="bg-slate-800 text-gray-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Lock className="w-3 h-3" /> Private
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">
                                            {project.prompt}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-4">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(project.createdAt)}
                                            </div>
                                            {/* Future: Add 'Edit' or 'View' buttons here */}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-white/5 border-dashed">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-8 h-8 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-300">No projects found</h3>
                                <p className="text-gray-500 mt-2">Start building to see your projects here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
