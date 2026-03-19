import json
import os
from dotenv import load_dotenv

from engines.local_nlp_engine import generate_with_ollama

load_dotenv()


def _fallback_challenge(word_tamil: str, sense: dict, variants: list) -> dict:
    default_correct = variants[0]["form"] if variants else word_tamil
    distractors = [variant["form"] for variant in variants if variant["form"] != default_correct][:3]
    while len(distractors) < 3:
        distractors.append(default_correct + "ம்")

    return {
        "sentence_tamil": f"அவர் {word_tamil} பற்றி பேசியபோது ___ முக்கியமாக இருந்தது.",
        "sentence_english": f"When they spoke about {word_tamil}, the highlighted form was important.",
        "correct_answer": default_correct,
        "distractor_1": distractors[0],
        "distractor_2": distractors[1],
        "distractor_3": distractors[2],
        "morphological_note": "இந்த இடத்தில் பொருள் மற்றும் உருபு பொருந்தும் வடிவமே சரியானது.",
    }


def generate_challenge(word_tamil: str, word_roman: str, sense: dict, variants: list) -> dict:
    generated = generate_with_ollama(word_tamil, word_roman, sense, variants)
    if generated:
        return generated

    return _fallback_challenge(word_tamil, sense, variants)


def generate_distractors_only(word_tamil: str, sense: dict, correct_answer: str, variants: list) -> list:
    distractors = [variant["form"] for variant in variants if variant["form"] != correct_answer]
    return distractors[:3]
