import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import axios, { AxiosError } from 'axios';

// const BackendUrl="http://127.0.0.1:5000"
const BackendUrl="https://whatsapp-chat-analyzer-f8dh.onrender.com"

const api = axios.create({
  baseURL: BackendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface analysisReport {
        status: string,
        tot_urls: number,
        tot_media: number,
        tot_words: number,
        tot_msgs: number,
        chart_png: string,
        msg_perc: [],
        word_png: string,
        com_word_png: string,
        emoji_com: [],
        month_png: string,
        daily_png: string,
        week_act_png: string,
        month_act_png: string,
        day_act_png: string
};

interface StateStore {
    analysisType: string;
    setAnalysisType: (type: string) => void;
    analysisReport: analysisReport | null;
    setAnalysisReport: (report: analysisReport | null)=>void;
    sessionId: string | null;
    fetchAnalysis: (type: string,session_id:string)=>Promise<analysisReport>;
    fetchUsers: (file: File) => Promise<string[]>;
}

const useStateStore = create<StateStore>()(
    persist(
        (set) => ({
            analysisType: 'Overall Analysis',
            setAnalysisType: (type) => set({ analysisType: type }),

            analysisReport: null,
            setAnalysisReport: (report: analysisReport|null) => set({analysisReport: report}),

            sessionId: null,

            fetchAnalysis: async(type,session_id)=>{{
                const response=await api.post("/show-analysis",{type,session_id})

                return response.data;
            }},

            fetchUsers: async(file)=>{
                const formData=new FormData();
                formData.append('chatFile',file);
                
                const response= await api.post('/preprocess',formData,{
                    headers:{
                        'Content-Type': 'multipart/form-data'
                    }
                });
                set({ sessionId: response.data?.session_id ?? null });

                return response.data.users;
            },
        }),
        {
            name: 'whatsapp-chat-analyzer',
            storage: createJSONStorage(()=> localStorage),
            partialize: (state)=>({
                sessionId: state.sessionId
            })
        }
    )
)

export default useStateStore;