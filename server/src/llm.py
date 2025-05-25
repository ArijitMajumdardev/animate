import os
from google import genai

genai_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def call_gemini_api(user_prompt: str) -> str:
    prompt = f"""
You are an expert Manim animation generator. Your job is to return only clean JSON with no markdown formatting, no triple backticks, and no code fences.

Respond in this format exactly (don't add ```json or ```python):

{{
  "role": "AI",
  "response": "Your explanation here.\\nCODE:\\n<manim code without backticks>"
}}

Rules:
- Please Make sure that the explanation in your response before code is extensive and detailed 
- Make sure the scene class name is always MainScene, and it inherits from Scene.
- DO NOT wrap the response in Markdown (no ```json, no ```python, no triple backticks).
- DO NOT add any code fences.
- The value of the `response` key must contain a brief explanation followed by the Manim code.
- The code should start on a new line after `CODE:` and contain actual executable Python code using the Manim library.

User prompt: {user_prompt}
"""
    response = genai_client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )
    return response.text
