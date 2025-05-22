import { ArrowUp, ArrowUpRight} from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen relative flex items-center justify-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at top center, pink 5%, #5b579e 0.8%, #111 30%)",
          filter: "blur(100px)",
        }}
      ></div>

      {/* Hero section */}
      <div className="relative z-10 max-w-l text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Prompt to <span className="">Manim</span> Animation
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          Describe your animation in plain English and let AI + Manim turn it
          into a video. Perfect for math educators, students, and curious minds.
        </p>
<div className="group bg-[#111112] border border-gray-600 rounded-lg w-full min-h-[150px] p-2 relative ">
  <textarea
            className="w-full min-h-[100px] p-4 resize-none outline-none bg-transparent text-white placeholder:text-gray-500"
            placeholder="Make a traingle moving from right to left ..."
  />
  <button className="absolute right-4 bottom-4 size-8 flex items-center justify-center rounded-2xl transition
    bg-gray-600 text-gray-700 group-focus-within:bg-white group-focus-within:text-black">
    <ArrowUpRight /> 
  </button>
</div>

      </div>
    </main>
  );
}
