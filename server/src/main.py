from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from src.auth import auth_routes
from src.database import Base, engine
from dotenv import load_dotenv
from .auth.check_auth import get_current_user
from .schemas import PromptInput
from .llm import call_gemini_api,call_gemini_api_with_voice
from .utils import (
    extract_code_from_response, save_and_render_manim,
    upload_to_supabase, cleanup_temp, clean_llm_response
)
import json
import re
import httpx
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

# ,current_user: dict = Depends(get_current_user)

@app.post("/generate")
async def generate(input: PromptInput):
    try:
        # 1. Call Gemini
        if input.voice_over=="TRUE":
            llm_response = call_gemini_api_with_voice(input.prompt)
            llm_response = llm_response["response"]
            script = llm_response["script"]
        else:
            llm_response = call_gemini_api(input.prompt)
            llm_response = llm_response["response"]
        # 2. Extract Manim code

        manim_code = llm_response["code"]

        if input.voice_over == "TRUE":
            # 2. Send code to remote Manim server
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "http://127.0.0.1:8001/manim-worker/render",
                        json={"code": manim_code},
                        timeout=60
                    )
                response.raise_for_status()
                video_url = response.json()["video_url"]
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Render server error: {str(e)}")


            # 6. Return
            return {
                "llm_response": llm_response,
                "video_url": video_url,
            }
        
        else:
            # 2. Send code and script to remote Manim server
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "http://127.0.0.1:8001/manim-worker/render",
                        json={"code": manim_code,"script":script},
                        timeout=60
                    )
                response.raise_for_status()
                video_url = response.json()["video_url"]
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Render server error: {str(e)}")


            # 6. Return
            return {
                "llm_response": llm_response,
                "video_url": video_url,
            }





    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
