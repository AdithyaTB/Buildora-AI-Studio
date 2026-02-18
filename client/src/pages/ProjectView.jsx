import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import PreviewFrame from '../components/PreviewFrame';
import Editor from '../components/Editor';
import { Loader2, ArrowLeft, Eye, Code, Download } from 'lucide-react';

const ProjectView = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('preview');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                // Determine layout based on where we might fetch. 
                // Since we need to fetch a specific project, let's assume we can GET /projects/:id
                // We likely need to ensure such an endpoint exists or use existing logic.
                const { data } = await api.get(`/projects/${id}`);
                // Assuming GET /projects/:id returns the project object
                setProject(data);
            } catch (error) {
                console.error("Failed to fetch project", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    const downloadCode = () => {
        if (!project?.generatedCode) return;
        const blob = new Blob([project.generatedCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title || 'website'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (!project) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Project not found</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-white/10 bg-slate-900 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <Link to="/profile" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg">{project.title}</h1>
                        <p className="text-xs text-gray-400">By {project.userId?.name || 'Unknown'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => setView('preview')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'preview' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Eye className="w-4 h-4" /> Preview
                        </button>
                        <button
                            onClick={() => setView('code')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'code' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Code className="w-4 h-4" /> Code
                        </button>
                    </div>
                    <button
                        onClick={downloadCode}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-white/10 transition-colors"
                        title="Download"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative overflow-hidden">
                {view === 'preview' ? (
                    <PreviewFrame code={project.generatedCode} />
                ) : (
                    <Editor code={project.generatedCode} onChange={() => { }} readOnly={true} />
                )}
            </div>
        </div>
    );
};

export default ProjectView;
