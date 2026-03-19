import json
import os
from dotenv import load_dotenv

from engines.local_nlp_engine import generate_with_ollama
from engines.template_engine import generate_template_challenge

load_dotenv()


def _fallback_challenge(word_tamil: str, sense: dict, variants: list) -> dict:
    # Use the new high-variety Template Engine instead of the old hardcoded fallback
    return generate_template_challenge(word_tamil, sense, variants)


def generate_challenge(word_tamil: str, word_roman: str, sense: dict, variants: list) -> dict:
    # Try Ollama (Local) first
    generated = generate_with_ollama(word_tamil, word_roman, sense, variants)
    if generated:
        return generated

    # Fallback to Template Engine (Vercel/Production)
    return generate_template_challenge(word_tamil, sense, variants)


def generate_distractors_only(word_tamil: str, sense: dict, correct_answer: str, variants: list) -> list:
    distractors = [variant["form"] for variant in variants if variant["form"] != correct_answer]
    return distractors[:3]
