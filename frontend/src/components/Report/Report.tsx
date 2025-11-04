"use client";

import useStateStore from "@/Zustand_Store/StateStore";
import { useThemeStore } from "@/Zustand_Store/ThemeStore";
import Image from "next/image";

const Report = () => {
    const { analysisReport, analysisType } = useStateStore();
    const { primaryAccentColor } = useThemeStore();

    console.log(analysisReport)

    return (
        <>
            {analysisReport &&

                <div className="flex flex-col mt-[50px] mx-[100px]">
                    <h2
                        className="font-black text-2xl"
                        style={{ color: primaryAccentColor }}
                    >
                        Analyzed Report for {analysisType}
                    </h2>

                    <div className="flex justify-around mt-[50px]">
                        {(() => {
                            const get = (...keys: string[]) =>
                                keys.reduce((acc, k) => acc ?? (analysisReport as any)?.[k], undefined) ?? 0;

                            const stats = [
                                { label: "Total Messages", value: get("tot_msgs", "messages") },
                                { label: "Total Words", value: get("tot_words", "words", "wordCount") },
                                { label: "Total Links Shared", value: get("totalLinksShared", "linksShared", "tot_urls", "links") },
                                { label: "Total Media Shared", value: get("totalMediaShared", "mediaShared", "tot_media", "media") },
                            ];

                            return stats.map((s) => (
                                <div
                                    key={s.label}
                                    className="bg-white/5 rounded-lg p-4 w-44 mx-2 flex flex-col items-center"
                                >
                                    <span className="text-sm text-gray-400">{s.label}</span>
                                    <span
                                        className="font-extrabold text-2xl"
                                        style={{ color: primaryAccentColor }}
                                    >
                                        {Number(s.value).toLocaleString()}
                                    </span>
                                </div>
                            ));
                        })()}

                    </div>

                    {
                        analysisReport.chart_png &&
                        <div className="flex gap-[100px] items-center mt-[100px]">
                            <img src={analysisReport.chart_png} width="600px" alt="busy users bar graph" />
                            <div className="w-full ">
                                <h3 className="font-bold mb-3" style={{ color: primaryAccentColor }}>
                                    Messages Percentage
                                </h3>

                                <div className="max-h-72 overflow-y-auto border border-white/5 rounded-lg">
                                    <table className="min-w-full text-left">
                                        <thead className="sticky top-0 bg-black/40">
                                            <tr>
                                                <th className="px-4 py-2 text-sm text-gray-400">#</th>
                                                <th className="px-4 py-2 text-sm text-gray-400">Name</th>
                                                <th className="px-4 py-2 text-sm text-gray-400">Percentage</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {(analysisReport?.msg_perc ?? []).map((row: any, idx: number) => (
                                                <tr key={row.name ?? idx} className="border-t border-white/5">
                                                    <td className="px-4 py-3 text-sm text-gray-300">{idx + 1}</td>

                                                    <td className="px-4 py-3 text-sm text-gray-200 break-words">
                                                        {row.name}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-sm font-semibold" style={{ color: primaryAccentColor }}>
                                                                {Number(row.percentage).toFixed(2)}%
                                                            </div>

                                                            <div className="flex-1 bg-white/5 h-3 rounded overflow-hidden">
                                                                <div
                                                                    style={{
                                                                        width: `${Math.min(Math.max(Number(row.percentage) || 0, 0), 100)}%`,
                                                                        background: primaryAccentColor,
                                                                        height: "100%",
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    }

                    <div className="flex justify-between mt-[100px]">
                        {analysisReport.word_png &&
                            <>
                                <div className="">
                                    <h3 className="font-bold text-4xl mb-[50px]" style={{ color: primaryAccentColor }}>Wordcloud</h3>
                                    <img src={analysisReport.word_png} width="600px" />
                                </div>
                            </>
                        }
                        {
                            analysisReport.com_word_png &&
                            <div>
                                <h3 className="font-bold text-4xl mb-[50px]" style={{ color: primaryAccentColor }}>Most Common Words</h3>
                                <img src={analysisReport.com_word_png} />
                            </div>
                        }
                    </div>

                    {
                        analysisReport.emoji_com &&

                        <div className="mt-[80px]">
                            <h3 className="font-bold mb-3 text-3xl mb-[50px]" style={{ color: primaryAccentColor }}>
                                Most Used Emojis
                            </h3>

                            <div className="max-h-72 overflow-y-auto border border-white/5 rounded-lg w-96">
                                <table className="min-w-full text-left">
                                    <thead className="sticky top-0 bg-black/40">
                                        <tr>
                                            <th className="px-4 py-2 text-sm text-gray-400">#</th>
                                            <th className="px-4 py-2 text-sm text-gray-400">Emoji</th>
                                            <th className="px-4 py-2 text-sm text-gray-400">Percentage</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {(analysisReport?.emoji_com ?? []).map((row: any, idx: number) => (
                                            <tr key={row.name ?? idx} className="border-t border-white/5">
                                                <td className="px-4 py-3 text-sm text-gray-300">{idx + 1}</td>

                                                <td className="px-4 py-3 text-2xl">
                                                    {row.name}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-sm font-semibold" style={{ color: primaryAccentColor }}>
                                                            {Number(row.percentage).toFixed(2)}%
                                                        </div>

                                                        <div className="flex-1 bg-white/5 h-3 rounded overflow-hidden">
                                                            <div
                                                                style={{
                                                                    width: `${Math.min(Math.max(Number(row.percentage) || 0, 0), 100)}%`,
                                                                    background: primaryAccentColor,
                                                                    height: "100%",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    }


                    {
                        analysisReport.month_png && analysisReport.daily_png &&
                        <>
                            <h3 className="text-4xl font-bold mb-[50px] mt-[70px]" style={{ color: primaryAccentColor }}>Timeline</h3>
                            <div className="flex justify-between">
                                <img src={analysisReport.month_png} width="500px" />
                                <img src={analysisReport.daily_png} width="900px" />
                            </div>
                        </>
                    }

                    {
                        analysisReport.week_act_png && analysisReport.month_act_png &&
                        <>
                            <h3 className="text-4xl font-bold mb-[50px] mt-[70px]" style={{ color: primaryAccentColor }}>Activity</h3>
                            <div className="flex justify-between">
                                <img src={analysisReport.week_act_png} width="500px" />
                                <img src={analysisReport.month_act_png} width="500px" />
                                <img src={analysisReport.day_act_png} width="500px" />
                                
                            </div>
                        </>
                    }


                </div>
            }
        </>
    )
}

export default Report;