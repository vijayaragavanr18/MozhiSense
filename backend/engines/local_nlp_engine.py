import json
import os
import re
from typing import Optional

import httpx
import requests
from dotenv import load_dotenv

load_dotenv()


def _clean_json_text(text: str) -> str:
    cleaned = re.sub(r'^```json\s*', '', text.strip())
    cleaned = re.sub(r'\s*```$', '', cleaned)
    first_brace = cleaned.find('{')
    last_brace = cleaned.rfind('}')
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        cleaned = cleaned[first_brace:last_brace + 1]
    return cleaned


def _variants_text(variants: list) -> str:
    return '\n'.join(
        [f"- {variant['form']} ({variant['label']}: {variant['description']})" for variant in variants[:8]]
    )


def _validate_payload(payload: dict) -> bool:
    """Validate challenge payload structure."""
    required = {
        'sentence_tamil',
        'sentence_english',
        'correct_answer',
        'distractor_1',
        'distractor_2',
        'distractor_3',
        'morphological_note',
    }
    return isinstance(payload, dict) and required.issubset(set(payload.keys()))


def generate_with_ollama(word_tamil: str, word_roman: str, sense: dict, variants: list) -> Optional[dict]:
    """Generate challenge using local Ollama qwen2:1.5b model."""
    ollama_base = os.getenv('OLLAMA_BASE_URL', 'http://127.0.0.1:11434').strip().rstrip('/')
    ollama_model = os.getenv('OLLAMA_MODEL', 'qwen2:1.5b').strip()

    variants_text = "\n".join(
        [f"  - {variant['form']} ({variant['label']}: {variant['description']})" for variant in variants[:6]]
    )

    prompt = f"""You are a Tamil language expert. Create a fill-in-the-blank JSON challenge.

### EXAMPLE INPUT:
Word: படி (padi)
Sense: verb: to study
Variants: படித்தேன், படிக்கிறேன், படிப்பேன்

### EXAMPLE OUTPUT:
{{
  "sentence_tamil": "நான் நேற்று இரவு நன்றாக ___.",
  "sentence_english": "I studied well last night.",
  "correct_answer": "படித்தேன்",
  "distractor_1": "படிக்கிறேன்",
  "distractor_2": "படிப்பேன்",
  "distractor_3": "படிக்கு",
  "morphological_note": "The sentence is in past tense ('last night'), so 'படித்தேன்' is the correct past tense form."
}}

### YOUR TURN:
WORD: {word_tamil} ({word_roman})
SENSE: {sense['label']}
GLOSS: {sense['gloss']}
CONTEXT: {sense['example_context']}

VARIANTS:
{variants_text}

RULES:
1. Sentence must be natural Tamil.
2. Put ___ in the middle of the sentence.
3. correct_answer MUST be from the VARIANTS list.
4. Distractors must be other variants or wrong forms.
5. morphological_note explains WHY the answer fits.

Respond ONLY with valid JSON (no markdown):"""

    payload = {
        'model': ollama_model,
        'prompt': prompt,
        'stream': False,
        'options': {
            'temperature': 0.5,
            'top_p': 0.9,
            'num_predict': 400,
        },
    }

    try:
        response = requests.post(f'{ollama_base}/api/generate', json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        response_text = (data.get('response') or '').strip()
        if not response_text:
            return None
    except Exception:
        return None

    response_text = re.sub(r'^```json\\s*', '', response_text)
    response_text = re.sub(r'\\s*```$', '', response_text)

    try:
        result = json.loads(response_text)
    except json.JSONDecodeError:
        return None

    return result if _validate_payload(result) else None



def generate_with_qwen_llamacpp(word_tamil: str, word_roman: str, sense: dict, variants: list) -> Optional[dict]:
    endpoint = os.getenv('QWEN_LLAMA_CPP_ENDPOINT', '').strip()
    ollama_base = os.getenv('OLLAMA_BASE_URL', 'http://127.0.0.1:11434').strip()
    ollama_model = os.getenv('OLLAMA_MODEL', 'qwen2:1.5b').strip()

    prompt = f"""
You are generating Tamil language learning challenge JSON.
Word: {word_tamil} ({word_roman})
Sense: {sense['label']}
Gloss: {sense['gloss']}
Forms:\n{_variants_text(variants)}

Return strict JSON with keys:
sentence_tamil, sentence_english, correct_answer, distractor_1, distractor_2, distractor_3, morphological_note
Rules: blank must be ___ in the middle of sentence.
Do not include markdown.
"""

    try:
        if endpoint:
            payload = {
                'prompt': prompt,
                'n_predict': 300,
                'temperature': 0.3,
                'top_p': 0.9,
                'stop': ['\n\n'],
            }
            response = httpx.post(endpoint, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            text = data.get('content') or data.get('response') or ''
            if not text:
                return None
            return json.loads(_clean_json_text(text))

        ollama_payload = {
            'model': ollama_model,
            'prompt': prompt,
            'stream': False,
            'options': {
                'temperature': 0.3,
                'top_p': 0.9,
                'num_predict': 300,
            },
        }
        response = httpx.post(f"{ollama_base.rstrip('/')}/api/generate", json=ollama_payload, timeout=45.0)
        response.raise_for_status()
        data = response.json()
        text = data.get('response') or ''
        if not text:
            return None
        return json.loads(_clean_json_text(text))
    except Exception:
        return None


def generate_with_inltk_adapter(word_tamil: str, word_roman: str, sense: dict, variants: list) -> Optional[dict]:
    endpoint = os.getenv('INLTK_GENERATOR_ENDPOINT', '').strip()

    if endpoint:
        try:
            payload = {
                'word_tamil': word_tamil,
                'word_roman': word_roman,
                'sense': sense,
                'variants': variants,
            }
            response = httpx.post(endpoint, json=payload, timeout=30.0)
            response.raise_for_status()
            result = response.json()
            required = {
                'sentence_tamil',
                'sentence_english',
                'correct_answer',
                'distractor_1',
                'distractor_2',
                'distractor_3',
                'morphological_note',
            }
            if required.issubset(set(result.keys())):
                return result
        except Exception:
            return None

    if not variants:
        return None

    correct = variants[0]['form']
    distractors = [variant['form'] for variant in variants if variant['form'] != correct][:3]
    while len(distractors) < 3:
        distractors.append(f'{correct}ம்')

    sentence = f"இன்றைய உரையாடலில் {word_tamil} பற்றிப் பேசும்போது ___ மிகவும் பொருத்தமாக இருந்தது."

    return {
        'sentence_tamil': sentence,
        'sentence_english': f"In today's conversation about {word_tamil}, the highlighted form fit best.",
        'correct_answer': correct,
        'distractor_1': distractors[0],
        'distractor_2': distractors[1],
        'distractor_3': distractors[2],
        'morphological_note': f"{sense['label']} பொருளுக்கு பொருத்தமான உருபு/கால வடிவம் தேர்ந்தெடுக்கப்பட்டுள்ளது.",
    }


def score_perplexity_with_inltk_adapter(sentence_tamil: str) -> Optional[float]:
    endpoint = os.getenv('INLTK_PERPLEXITY_ENDPOINT', '').strip()
    if not endpoint:
        return None

    try:
        response = httpx.post(endpoint, json={'text': sentence_tamil}, timeout=15.0)
        response.raise_for_status()
        data = response.json()
        value = data.get('perplexity')
        if value is None:
            return None
        return float(value)
    except Exception:
        return None
