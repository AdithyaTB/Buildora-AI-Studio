import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, onChange }) => {
    return (
        <div className="h-full w-full bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <div className="bg-[#1e1e1e] border-b border-white/5 px-4 py-2 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">index.html</span>
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
            </div>
            <Editor
                height="100%"
                defaultLanguage="html"
                theme="vs-dark"
                value={code}
                onChange={onChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    fontFamily: 'JetBrains Mono, monospace',
                }}
            />
        </div>
    );
};

export default CodeEditor;
