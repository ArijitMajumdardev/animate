import os
import re
import subprocess
import uuid
from pathlib import Path
from supabase import create_client, Client
import json
import re
import shutil
import time

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# cleaning the LLM response
def clean_llm_response(llm_response: str) -> dict:
    # Remove ```json and ``` if present
    cleaned = re.sub(r"```json|```", "", llm_response).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError("Invalid JSON from LLM") from e

# extracting the code from the LLM response
def extract_code_from_response(text: str) -> str:
    match = re.search(r'CODE:\s*\n(.+)', text, re.DOTALL)
    if not match:
        raise ValueError("Manim code block not found.")
    return match.group(1).strip()

# rendering the code 
def save_and_render_manim(code: str) -> dict:
    file_id = str(uuid.uuid4())

    base_tmp = "tmp"
    file_name = f"{file_id}.py"
    file_path = os.path.join(base_tmp, file_name)

    media_dir = os.path.join("media","videos",file_id,"480p15","MainScene.mp4")

    os.makedirs(base_tmp, exist_ok=True)

    # Write Manim code to file
    with open(file_path, "w") as f:
        f.write(code)

    subprocess.run([
        "manim",
        "-ql",
        file_path,
        "MainScene"  
    ], check=True)
   
    return {"video_path":media_dir,"file_id" : file_id}

# uploading the video to supabase
def upload_to_supabase(video_path: str, file_id: str) -> str:
    print(video_path)
    with open(video_path, "rb") as f:
        res = supabase.storage.from_("videos").upload(path=f"{file_id}.mp4", file=f)
    public_url = supabase.storage.from_("videos").get_public_url(f"{file_id}.mp4")
    return public_url



# deleting the tmp and media folders
def cleanup_temp():
    for dir_name in ["media", "tmp"]:
        try:
            dir_path = os.path.join(os.getcwd(), dir_name)  # Absolute path in root
            if os.path.exists(dir_path) and os.path.isdir(dir_path):
                shutil.rmtree(dir_path)
                print(f"Deleted directory: {dir_path}")
            else:
                print(f"Directory not found, skipping: {dir_path}")
        except Exception as e:
            print(f"Failed to remove directory {dir_path}: {e}")