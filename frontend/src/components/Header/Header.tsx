"use client";

import { useThemeStore } from "@/Zustand_Store/ThemeStore";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header =()=>{
    const {primaryAccentColor}=useThemeStore();
    const pathname=usePathname();
    console.log(primaryAccentColor)

    return(
        <nav className="bg-[#111921] h-20 flex justify-between px-[200px]">
            <div className="flex items-center gap-4">
                <div 
                className="rounded-full h-10 w-10"
                style={{backgroundColor:primaryAccentColor}}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="white" className="p-2"><path d="M64 416L64 192C64 139 107 96 160 96L480 96C533 96 576 139 576 192L576 416C576 469 533 512 480 512L360 512C354.8 512 349.8 513.7 345.6 516.8L230.4 603.2C226.2 606.3 221.2 608 216 608C202.7 608 192 597.3 192 584L192 512L160 512C107 512 64 469 64 416z"/></svg>
                </div>
                <h3 
                className="font-bold"
                // style={{color: primaryAccentColor}}
                >Whatsapp Chat Analyzer</h3>
            </div>
            <div className="flex items-center">
                <Link 
                href={"/"} 
                className={`px-8 font-bold `}
                style={{color: pathname=="/"?primaryAccentColor:"#fff"}}
                >Home</Link>
                <Link 
                href={"/about"} 
                className="px-8 font-bold"
                style={{color: pathname=="/about"?primaryAccentColor:"#fff"}}
                >About</Link>
            </div>
        </nav>
    )
}

export default Header;