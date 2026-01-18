import os
from google import genai
import re

genai_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def call_gemini_api(user_prompt: str) -> str:
    prompt = f"""
You are an expert Manim animation generator. Your job is to return only clean JSON with no markdown formatting, no triple backticks, and no code fences.

Respond in this format exactly (don't add ```json or ```python):

{{
  "role": "AI",
  "response": {{
    "explanation": "A detailed explanation of the concept...",
    "code": "from manim import *\\n\\nclass MainScene(Scene):\\n    def construct(self):\\n        # Your code here",
  }}
}}

Rules:
- Generate Manim code using the Manim Community Edition (v0.19.0). Do not use self.camera.frame or any features from 3b1b`s Manim version
- Please Make sure that the explanation in your response before code is extensive and detailed 
- Make sure the scene class name is always MainScene, and it inherits from Scene.
- DO NOT wrap the response in Markdown (no ```json, no ```python, no triple backticks).
- DO NOT add any code fences.
- The value of the `response` key must contain a brief explanation followed by the Manim code.
- The code should start on a new line after `CODE:` and contain actual executable Python code using the Manim library.

User prompt: {user_prompt}
"""
    response = genai_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    # return response.text
    try:
        # Attempt to parse the response as JSON
        import json
        cleaned_text = re.sub(r"^```json|^```|```$", "", response.text.strip(), flags=re.MULTILINE).strip()
        return json.loads(cleaned_text)
    except Exception as e:
        raise ValueError(f"Invalid response from Gemini: {response.text}") from e






def call_gemini_api_with_voice(user_prompt: str) -> dict:
    prompt = f"""
You are an expert Manim animation generator.

Your task is to return a strict JSON response with three fields: explanation, code, and voice over script.

Respond ONLY with a raw JSON object. DO NOT include:
- Markdown formatting
- Triple backticks
- Code fences
- Any commentary or extra text outside the JSON

Respond strictly in this format:

{{
  "role": "AI",
  "response": {{
    "explanation": "A detailed explanation of the concept...",
    "code": "from manim import *\\n\\nclass MainScene(Scene):\\n    def construct(self):\\n        # Your code here",
    "script": "This is the voice-over narration matching the explanation and animation..."
  }}
}}

Rules:
- Use Manim Community Edition (v0.19.0) only.
- Do NOT use features from 3b1b's Manim version (like `self.camera.frame`).
- The scene class name must always be `MainScene`.
- Ensure the code is clean and executable.
- The `explanation` must clearly describe the concept in detail.
- The `voice over script` should match the explanation and animation.

User prompt: {user_prompt}
"""

    response = genai_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    try:
        # Attempt to parse the response as JSON
        import json
        cleaned_text = re.sub(r"^```json|^```|```$", "", response.text.strip(), flags=re.MULTILINE).strip()
        return json.loads(cleaned_text)
    except Exception as e:
        raise ValueError(f"Invalid response from Gemini: {response.text}") from e
