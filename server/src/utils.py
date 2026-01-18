import os
import re
import subprocess
import uuid
import json
import shutil
from pathlib import Path
from supabase import create_client, Client

# -----------------------------
# Supabase (lazy initialization)
# -----------------------------

_supabase: Client | None = None


def get_supabase() -> Client:
    global _supabase

    if _supabase is not None:
        return _supabase

    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError(
            "Missing SUPABASE_URL or SUPABASE_KEY in environment variables"
        )

    _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase


# -----------------------------
# LLM response utilities
# -----------------------------

def clean_llm_response(llm_response: str) -> dict:
    # """Cleans ```json blocks and parses JSON safely"""
    cleaned = re.sub(r"```json|```", "", llm_response).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError("Invalid JSON from LLM") from e


def extract_code_from_response(text: str) -> str:
    # """Extracts Manim code after 'CODE:' marker"""
    match = re.search(r"CODE:\s*\n(.+)", text, re.DOTALL)

    if not match:
        raise ValueError("Manim code block not found in LLM response")

    return match.group(1).strip()


# -----------------------------
# Manim rendering
# -----------------------------

def save_and_render_manim(code: str) -> dict:
    # """
    # Saves code to a temp file, runs Manim, returns video path + file_id
    # Each job runs in its own isolated directory.
    # """
    file_id = str(uuid.uuid4())

    base_dir = Path("jobs") / file_id
    tmp_dir = base_dir / "tmp"
    media_dir = base_dir / "media"

    tmp_dir.mkdir(parents=True, exist_ok=True)
    media_dir.mkdir(parents=True, exist_ok=True)

    file_path = tmp_dir / "scene.py"

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(code)

    # Run manim safely
    try:
        subprocess.run(
            [
                "manim",
                "-ql",
                str(file_path),
                "MainScene",
                "--media_dir",
                str(media_dir)
            ],
            check=True,
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError as e:
        raise RuntimeError(
            f"Manim failed:\nSTDOUT:\n{e.stdout}\n\nSTDERR:\n{e.stderr}"
        )

    video_path = media_dir / "videos" / "scene" / "480p15" / "MainScene.mp4"

    if not video_path.exists():
        raise FileNotFoundError("Rendered video not found")

    return {
        "file_id": file_id,
        "video_path": str(video_path)
    }


# -----------------------------
# Supabase upload
# -----------------------------

def upload_to_supabase(video_path: str, file_id: str) -> str:
    supabase = get_supabase()

    with open(video_path, "rb") as f:
        supabase.storage.from_("videos").upload(
            path=f"{file_id}.mp4",
            file=f
        )

    public_url = supabase.storage.from_("videos").get_public_url(f"{file_id}.mp4")
    return public_url


# -----------------------------
# Cleanup job folder
# -----------------------------

def cleanup_temp(file_id: str):
    # """Deletes only the job folder instead of global folders"""
    job_path = Path("jobs") / file_id

    try:
        if job_path.exists():
            shutil.rmtree(job_path)
    except Exception as e:
        print(f"Cleanup failed for {job_path}: {e}")
