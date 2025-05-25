"use client";

import { Copy, Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Highlight, themes, Language } from "prism-react-renderer";

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt");
  const [loading, setLoading] = useState(true);
  const [explanationText, setExplanationText] = useState("");
  const [manimCode, setManimCode] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  // Animation states for buttons
  const [copyClicked, setCopyClicked] = useState(false);
  const [downloadClicked, setDownloadClicked] = useState(false);

  const token = localStorage.getItem('token')



  useEffect(() => {
    const generate = async () => {
      if (!prompt) {
        setLoading(false);
        setError("No prompt provided. Please go back and enter a prompt.");
        return;
      }

      setLoading(true);
      setError("");
      setExplanationText("");
      setManimCode("");
      setVideoUrl("");

      try {
        const res = await fetch("http://localhost:8000/generate", {
          method: "POST",
          body: JSON.stringify({ prompt }),
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Something went wrong on the server."
          );
        }

        const data = await res.json();

        if (
          data.llm_response &&
          typeof data.llm_response.response === "string"
        ) {
          const fullResponseContent = data.llm_response.response;
          const parts = fullResponseContent.split("\nCODE:\n");
          setExplanationText(parts[0] || "No explanation provided.");
          setManimCode(parts[1] || "No Manim code generated.");
        } else {
          setExplanationText("AI response format was unexpected.");
          setManimCode("Could not extract Manim code.");
        }

        setVideoUrl(data.video_url || "");
      } catch (error) {
        console.error("Error generating animation:", error);
        setError(
          `Failed to generate animation: ${error || "Please check the server."}`
        );
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [prompt]);

  // Handle copy animation
  const handleCopyClick = () => {
    if (!manimCode) return;
    navigator.clipboard.writeText(manimCode);
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 1000); // 1s animation
  };

  // Handle download animation
  const handleDownloadClick = () => {
    setDownloadClicked(true);
    setTimeout(() => setDownloadClicked(false), 1000);
  };

  return (
    <main className="min-h-[88vh] p-6 bg-[#0f0f10] text-white grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
      {loading ? (
        <div className="col-span-2 flex flex-col justify-center items-center text-xl text-gray-400">
          <svg
            className="animate-spin h-8 w-8 text-pink-500 mb-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Generating animation... This might take a moment.
        </div>
      ) : error ? (
        <div className="col-span-2 text-red-500 text-center text-lg p-4 rounded-lg ">
          {error}
        </div>
      ) : (
        <>
          {/* Left Column: AI Explanation and Generated Code */}
          <div className="p-4 border rounded-lg bg-black/30 flex flex-col relative">
            <p className="whitespace-pre-wrap break-words text-sm text-gray-300 mb-6 flex-grow">
              {explanationText}
            </p>

            <h2 className="text-xl font-semibold mb-4 text-gray-400">Code</h2>
            <div className="codeContainer relative bg-[#282a2c] rounded-md overflow-hidden ">
              <Highlight
                theme={themes.dracula}
                code={manimCode}
                language={"python" as Language}
              >
                {({
                  className,
                  style,
                  tokens,
                  getLineProps,
                  getTokenProps,
                }) => (
                  <pre
                    className={`${className} whitespace-pre-wrap break-words text-sm text-gray-300 p-4 max-h-96 overflow-auto`}
                    style={style}
                  >
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line, key: i })}>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token, key })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>

              {/* Copy Code Button */}
              {manimCode && (
                <button
                  onClick={handleCopyClick}
                  className={`absolute top-2 right-2 flex items-center gap-2 p-2 bg-gray-950 text-gray-300 rounded-md focus:bg-gray-900 transition-transform duration-150 
      ${copyClicked ? "scale-90 bg-pink-500 text-white" : ""}
    `}
                  title="Copy code to clipboard"
                  aria-label="Copy code to clipboard"
                >
                  <Copy size={14} />
                  {copyClicked && (
                    <span className="text-xs font-semibold select-none">
                      Copied
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Video Player and Download Link */}
          <div className="flex flex-col items-center justify-center p-4 rounded-lg ">
            {videoUrl ? (
              <>
                <video
                  controls
                  className="rounded-lg shadow-lg w-full max-w-lg bg-gray-900"
                  preload="metadata"
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <a
                  // href={videoUrl}
                  download={`manim_animation_${new Date().getTime()}.mp4`}
                  onClick={handleDownloadClick}
                  className={`mt-4 px-4 py-2  text-white font-medium rounded-md hover:bg-gray-900 transition-colors duration-10 flex items-center justify-center
                    ${downloadClicked ? "scale-85 bg-gray-600" : "bg-gray-800"}
                  `}
                  aria-label="Download video"
                >
                  <Download />
                </a>
              </>
            ) : (
              <div className="text-gray-400 text-center">
                No video URL available.
                {(explanationText.toLowerCase().includes("error") ||
                  manimCode.toLowerCase().includes("error")) && (
                  <p className="mt-2 text-sm text-red-300">
                    Check the AI explanation/code for potential issues.
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
