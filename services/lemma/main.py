from fastapi import FastAPI, HTTPException, Request, Header
from pydantic import BaseModel
import spacy
from typing import Optional
from dotenv import load_dotenv
import os

load_dotenv()
EXPECTED_API_KEY = os.getenv("API_KEY")

app = FastAPI()
nlp = spacy.load("en_core_web_sm")

class LemmaRequest(BaseModel):
    text: str

@app.post("/filter-lemmas")
async def lemmatize_text(
    request: LemmaRequest,
    authorization: Optional[str] = Header(None)
):

    print(f"[DEBUG] Expected API key from .env: {EXPECTED_API_KEY}")
    print(f"[DEBUG] Received Authorization header: {authorization}")

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split("Bearer ")[-1]

    if token != EXPECTED_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid token")

    doc = nlp(request.text)

    lemmas = set()

    for token in doc:
        if (
            not token.is_punct
            and not token.is_stop
            and not token.is_space
            and not token.like_num
            and token.pos_ not in {"PRON", "PROPN", "SYM", "X"}
        ):
            lemmas.add(token.lemma_)

    return {"filtered-lemmas": sorted(lemmas)}
