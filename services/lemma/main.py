from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import spacy
from typing import Optional
from dotenv import load_dotenv
import os
from functools import lru_cache
from word_forms.word_forms import get_word_forms

load_dotenv()
EXPECTED_API_KEY = os.getenv("API_KEY")

app = FastAPI()
nlp = spacy.load("en_core_web_sm")

class LemmaRequest(BaseModel):
    text: str


def is_clean_word(word: str):
    return word.isalpha() and word.isascii() and len(word) > 1


@lru_cache(maxsize=10000)
def get_related_noun_verb_bases(word: str):
    try:
        forms = get_word_forms(word)
    except Exception:
        return []

    related = set()

    for pos in ("n", "v"):
        for form in forms.get(pos, set()):
            normalized = form.lower().strip().replace("_", " ")
            if " " not in normalized and is_clean_word(normalized):
                related.add(normalized)

    related.discard(word)
    return sorted(related)

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

    candidates_by_word = {}

    for token in doc:
        if (
            token.is_alpha
            and token.is_ascii
            and not token.is_punct
            and not token.is_stop
            and not token.is_space
            and not token.like_num
            and token.pos_ not in {"PRON", "PROPN", "SYM", "X"}
        ):
            lemma = token.lemma_.lower().strip()

            if not is_clean_word(lemma):
                continue

            base_forms = []
            if token.pos_ in {"ADJ", "ADV"}:
                base_forms = get_related_noun_verb_bases(lemma)

            existing_candidate = candidates_by_word.get(lemma)

            if existing_candidate:
                existing_candidate["baseForms"] = sorted(
                    set(existing_candidate["baseForms"] + base_forms)
                )
            else:
                candidates_by_word[lemma] = {
                    "word": lemma,
                    "pos": token.pos_,
                    "baseForms": base_forms,
                }

    candidates = sorted(candidates_by_word.values(), key=lambda item: item["word"])

    return {
        "filtered-lemmas": [candidate["word"] for candidate in candidates],
        "candidates": candidates,
    }
