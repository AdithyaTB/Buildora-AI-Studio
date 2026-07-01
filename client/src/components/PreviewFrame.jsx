import { useEffect, useRef } from 'react';

const PreviewFrame = ({ code }) => {
    const iframeRef = useRef(null);

    // Simplified to use srcDoc directly as per user request for consistency
    // useEffect is not strictly needed if we just use srcDoc, but keeping it simple.

    return (
        <div className="h-full w-full bg-white rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
            <div className="bg-slate-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                </div>
                <div className="bg-gray-200 px-3 py-0.5 rounded text-[10px] text-gray-500 font-mono w-48 text-center">
                    localhost:3000
                </div>
                <div></div>
            </div>
            <iframe
                title="Preview"
                srcDoc={code}
                className="w-full h-[calc(100%-32px)] bg-white"
                sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin allow-top-navigation"
            />
        </div>
    );
};

export default PreviewFrame;
