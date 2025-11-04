"use client";
import useStateStore from "@/Zustand_Store/StateStore";
import { useThemeStore } from "@/Zustand_Store/ThemeStore";
import { log } from "console";
import { useState, ChangeEvent, useEffect, useRef } from "react";

const Hero = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { fetchUsers } = useStateStore();
    const [users, setUsers] = useState<string[] | null>();
    const { analysisType, setAnalysisType, fetchAnalysis, setAnalysisReport } = useStateStore();

    const { primaryAccentColor } = useThemeStore();

    const handleFile = async (f: File) => {
        setFile(f);

        const fetchedUsers = await fetchUsers(f);
        console.log(fetchedUsers);
        setUsers(fetchedUsers);

        const fileURL = URL.createObjectURL(f);
        setPreview(fileURL);
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await handleFile(e.target.files[0]);
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleFile(e.dataTransfer.files[0]);
        }
    };

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleShowAnalysis = async () => {
        setIsAnalyzing(true);
        const stored = localStorage.getItem('whatsapp-chat-analyzer');
        if (!stored) {
            console.error('No stored whatsapp-chat-analyzer found in localStorage');
            setIsAnalyzing(false);
            return;
        }
        let parsed: any;
        try {
            parsed = JSON.parse(stored);
        } catch (err) {
            console.error('Failed to parse stored whatsapp-chat-analyzer', err);
            setIsAnalyzing(false);
            return;
        }
        const session = parsed?.state?.sessionId;
        if (!session) {
            console.error('No sessionId found in stored state');
            setIsAnalyzing(false);
            return;
        }
        try {
            const analysis = await fetchAnalysis(analysisType, session);
            setAnalysisReport(analysis);
        } catch (err) {
            console.error('Failed to fetch analysis', err);
        } finally {
            setIsAnalyzing(false);
        }
        
    }

    return (
        <div className="flex justify-center flex-col">
            <div className="flex flex-col gap-3 pb-[50px]">
                <h3 className="font-black text-4xl">Uncover Insights from Your Whatsapp Chats.</h3>
                <p className="opacity-70">Upload your exported chat file, select an analysis type, and generate a detailed report.</p>
            </div>

            <div className="w-[60vw] bg-[#111921] px-10 py-4 rounded-2xl">
                <h4 className="font-bold text-xl pb-6">1. Upload Your Chat File</h4>
                {!file ?
                    <div
                        className={`border-dashed border flex flex-col rounded items-center py-6 ${isDragging ? 'bg-white/5' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                        onDrop={handleDrop}
                    >
                        {/* hidden input always in DOM so change/replace file works */}
                        <input ref={inputRef} type="file" id="upload-file" accept=".txt" style={{ display: "none" }} onChange={handleFileChange} />
                    
                    
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                    
                        <div className="rounded-full bg-white h-10 w-10 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill={primaryAccentColor}><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM337 327C327.6 317.6 312.4 317.6 303.1 327L239.1 391C229.7 400.4 229.7 415.6 239.1 424.9C248.5 434.2 263.7 434.3 273 424.9L296 401.9L296 488C296 501.3 306.7 512 320 512C333.3 512 344 501.3 344 488L344 401.9L367 424.9C376.4 434.3 391.6 434.3 400.9 424.9C410.2 415.5 410.3 400.3 400.9 391L336.9 327z" /></svg>
                        </div>
                        <p className="text-lg font-bold">Drag and drop your file here</p>
                        <p className="opacity-60">or browse to upload your exported .txt chat file</p>
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="mt-6 inline-block px-4 py-2 rounded-lg"
                            style={{ backgroundColor: primaryAccentColor }}
                        >
                            Browse Files
                        </button>
                    </div>
                    :
                    preview ?

                        <div className="border-dashed border flex flex-col rounded items-center py-6">
                            <>
                                <p className="font-semibold">{file?.name}</p>

                                <div className="w-full mt-4 mb-4">
                                    <iframe
                                        src={preview as string}
                                        title="text-preview"
                                        className="w-full h-48 bg-black/10 rounded p-2"
                                        sandbox=""
                                    />
                                </div>

                                <div className="flex gap-3">
                                    

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (preview) URL.revokeObjectURL(preview);
                                            setFile(null);
                                            setPreview(null);
                                            setAnalysisReport(null);
                                        }}
                                        className="px-4 py-2 rounded-lg bg-gray-700"
                                    >
                                        Remove File
                                    </button>
                                </div>
                            </>
                        </div>
                        :
                        <div className="border-dashed border flex flex-col rounded items-center py-6">
                            <p>File Attached! No preview available.</p>
                        </div>

                }
                {
                    file &&
                    <>
                        <h4 className="font-bold text-xl mt-6">2. Choose Your Analysis</h4>
                        <div className="mt-4">
                            <label htmlFor="analysis-select" className="block mb-2 font-medium">Select Analysis</label>
                            <select
                                id="analysis-select"
                                defaultValue="overall analysis"
                                onChange={(e) => setAnalysisType(e.target.value)}
                                className="w-full p-2 rounded-lg bg-[#0b1620] border"
                                style={{ borderColor: primaryAccentColor }}
                            >
                                <option value="Overall Analysis">Overall Analysis</option>
                                {users && users.length > 0 && users.map((u, i) => (
                                    <option key={`${u}-${i}`} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={handleShowAnalysis}
                                className="px-6 py-2 rounded-lg font-semibold flex items-center gap-3"
                                style={{ backgroundColor: primaryAccentColor }}
                                disabled={isAnalyzing}
                                aria-busy={isAnalyzing}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <span className="inline-block h-4 w-4 border-2 border-white rounded-full animate-spin" />
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <span>Show Analysis</span>
                                )}
                            </button>
                        </div>
                    </>
                }

            </div>
                {isAnalyzing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-[#0b1620] border rounded-lg p-6 flex flex-col items-center gap-4" style={{ borderColor: primaryAccentColor }}>
                            <div className="inline-block h-12 w-12 border-4 border-t-transparent border-white rounded-full animate-spin" />
                            <div className="text-lg font-semibold">Analyzing chat — this may take a moment</div>
                        </div>
                    </div>
                )}
        </div>
    )
}

export default Hero;