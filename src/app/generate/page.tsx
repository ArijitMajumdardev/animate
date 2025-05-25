"use client";

export const dynamic = "force-dynamic";

import { Copy, Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Highlight, themes, Language } from "prism-react-renderer";

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt");

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [explanationText, setExplanationText] = useState("");
  const [manimCode, setManimCode] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  const [copyClicked, setCopyClicked] = useState(false);
  const [downloadClicked, setDownloadClicked] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/generate`,
          {
            method: "POST",
            body: JSON.stringify({ prompt }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Something went wrong on the server."
          );
        }

        const data = await res.json();

        if (typeof data?.llm_response?.response === "string") {
          const [explanation, code] =
            data.llm_response.response.split("\nCODE:\n");
          setExplanationText(explanation || "No explanation provided.");
          setManimCode(code || "No Manim code generated.");
        } else {
          setExplanationText("AI response format was unexpected.");
          setManimCode("Could not extract Manim code.");
        }

        setVideoUrl(data.video_url || "");
      } catch (err: any) {
        console.error("Error generating animation:", err);
        setError(
          `Failed to generate animation: ${
            err.message || "Please check the server."
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [prompt, token]);

  const handleCopyClick = () => {
    if (!manimCode) return;
    navigator.clipboard.writeText(manimCode);
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 1000);
  };

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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Generating animation... This might take a moment.
        </div>
      ) : error ? (
        <div className="col-span-2 text-red-500 text-center text-lg p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          {/* Explanation & Code */}
          <div className="p-4 border rounded-lg bg-black/30 flex flex-col relative">
            <p className="whitespace-pre-wrap break-words text-sm text-gray-300 mb-6 flex-grow">
              {explanationText}
            </p>

            <h2 className="text-xl font-semibold mb-4 text-gray-400">Code</h2>
            <div className="codeContainer relative bg-[#282a2c] rounded-md overflow-hidden">
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
                    {tokens.map((line, i) => {
                      const lineProps = getLineProps({ line, key: i });
                      const { key: lineKey, ...restLineProps } = lineProps;
                      return (
                        <div key={i} {...restLineProps}>
                          {line.map((token, index) => {
                            const tokenProps = getTokenProps({
                              token,
                              key: index,
                            });
                            const { key: tokenKey, ...restTokenProps } =
                              tokenProps;
                            return <span key={index} {...restTokenProps} />;
                          })}
                        </div>
                      );
                    })}
                  </pre>
                )}
              </Highlight>

              {/* Copy Button */}
              {manimCode && (
                <button
                  onClick={handleCopyClick}
                  className={`absolute top-2 right-2 flex items-center gap-2 p-2 bg-gray-950 text-gray-300 rounded-md focus:bg-gray-900 transition-transform duration-150 ${
                    copyClicked ? "scale-90 bg-pink-500 text-white" : ""
                  }`}
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

          {/* Video Player */}
          <div className="flex flex-col items-center justify-center p-4 rounded-lg">
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
                  download={`manim_animation_${Date.now()}.mp4`}
                  onClick={handleDownloadClick}
                  className={`mt-4 px-4 py-2 text-white font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center justify-center ${
                    downloadClicked ? "scale-85 bg-gray-600" : "bg-gray-800"
                  }`}
                  aria-label="Download video"
                  href={videoUrl}
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
