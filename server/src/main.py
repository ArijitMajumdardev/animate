from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from src.auth import auth_routes
from src.database import Base, engine
from dotenv import load_dotenv
from .auth.check_auth import get_current_user
from .schemas import PromptInput
from .llm import call_gemini_api
from .utils import (
    extract_code_from_response, save_and_render_manim,
    upload_to_supabase, cleanup_temp, clean_llm_response
)
import json
import re

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_routes.router, prefix="/auth", tags=["Authentication"])


@app.get("/")
def root():
    return {"message": "JWT Auth API running"}


@app.get("/valid_token")
async def protected_route(current_user: dict = Depends(get_current_user)):
    return {
        "user": {
            "email": current_user["email"],
            "username": current_user["username"],
        }
    }


@app.post("/generate")
def generate(input: PromptInput,current_user: dict = Depends(get_current_user)):
    try:
        # 1. Call Gemini
        llm_response = call_gemini_api(input.prompt)
        llm_response = clean_llm_response(llm_response)
        print("this is the llm response : \n", llm_response)
        # 2. Extract Manim code
        manim_code = extract_code_from_response(llm_response["response"])

        # # 3. Render video
        rendered = save_and_render_manim(manim_code)
        video_path = rendered["video_path"]
        file_id = rendered["file_id"]

        # # 4. Upload to Supabase
        video_url = upload_to_supabase(video_path, file_id)

        # # 5. Clean up
        cleanup_temp()

        # 6. Return
        return {
            "llm_response": llm_response,
            "video_url": video_url,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
