import Hero from "@/components/Hero/Hero";
import Report from "@/components/Report/Report";

export default function Home() {
  return (
    <>
      <div className="px-[300px] py-[60px]">
        <Hero />
      </div>
      <Report />
    </>
  );
}
