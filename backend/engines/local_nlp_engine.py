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

    prompt = f"""You are a Tamil language expert creating one fill-in-the-blank game challenge.

WORD: {word_tamil} ({word_roman})
SENSE TO TEST: {sense['label']}
GLOSS: {sense['gloss']}
EXAMPLE CONTEXT: {sense['example_context']}

AVAILABLE WORD FORMS (morphological variants of {word_tamil}):
{variants_text}

YOUR TASK:
1. Write ONE Tamil sentence where {word_tamil} is used in the sense: \"{sense['label']}\"
2. Remove the target word from the sentence and replace it with ___
3. Choose the CORRECT FORM from the variants list that fits the blank
4. Generate 3 DISTRACTOR options that:
   - Are grammatically valid Tamil
   - Come from the variants list OR are forms of {word_tamil} with wrong case/tense
   - Are SEMANTICALLY WRONG in this specific sentence context
   - Look plausible enough to fool a learner
5. Write the English translation of the full sentence (with the word filled in)
6. Write a SHORT morphological explanation (1-2 sentences) explaining why the correct answer is right

RULES:
- The sentence must be natural, colloquial Tamil
- The blank MUST appear mid-sentence (not at the start or end)
- All 4 options (1 correct + 3 distractors) must be different from each other
- The explanation must mention the grammatical concept

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{{
  \"sentence_tamil\": \"the Tamil sentence with ___ as the blank\",
  \"sentence_english\": \"full English sentence with the answer filled in\",
  \"correct_answer\": \"the correct Tamil form\",
  \"distractor_1\": \"wrong option 1\",
  \"distractor_2\": \"wrong option 2\",
  \"distractor_3\": \"wrong option 3\",
  \"morphological_note\": \"short explanation of why the correct answer is right\"
}}"""

    payload = {
        'model': ollama_model,
        'prompt': prompt,
        'stream': False,
        'options': {
            'temperature': 0.3,
            'top_p': 0.9,
            'num_predict': 420,
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
