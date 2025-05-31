from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from dotenv import load_dotenv
from .schema import ManimInput
from .utils import save_and_render_manim, upload_to_supabase, cleanup_temp
from fastapi import Request
import json
import re

load_dotenv()


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "JWT Auth API running"}


@app.post("/manim-worker/render")
async def generate(ManimInput: ManimInput):
    if ManimInput.script:
        try:
            print("Route called!")
            # body = await request.body()
            # print("RAW BODY:", body.decode("utf-8"))
            print("Received code:", ManimInput.code)
            #  1. Render video
            rendered = save_and_render_manim(ManimInput.code)
            video_path = rendered["video_path"]
            file_id = rendered["file_id"]

            #  2. Upload to Supabase
            video_url = upload_to_supabase(video_path, file_id)

            # 3. Clean up
            cleanup_temp()

            # 4. Return
            return {
                "video_url": video_url,
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        try:
            print("Route called!")
            # body = await request.body()
            # print("RAW BODY:", body.decode("utf-8"))
            print("Received code:", ManimInput.code)
            #  1. Render video
            rendered = save_and_render_manim(ManimInput.code)
            video_path = rendered["video_path"]
            file_id = rendered["file_id"]

            #  2. Upload to Supabase
            video_url = upload_to_supabase(video_path, file_id)

            # 3. Clean up
            cleanup_temp()

            # 4. Return
            return {
                "video_url": video_url,
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
