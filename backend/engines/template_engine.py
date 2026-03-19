import random

# Rule-based Template Library for MozhiSense
# This allows "new" challenge generation without any LLM or External API.

TEMPLATES = {
    ("ஆறு", "noun: river"): [
        "அந்த ___ நீர் மிகவும் தெளிவாக இருந்தது.",
        "நாங்கள் ___ குளிக்கச் சென்றோம்.",
        "இந்த ___ கடலில் கலக்கிறது.",
        "மலையிலிருந்து வரும் ___ வற்றாதது."
    ],
    ("ஆறு", "number: six"): [
        "எனக்கு ___ வயது ஆகும் போது பள்ளிக்குச் சென்றேன்.",
        "இந்தக் கூடையில் மொத்தம் ___ பழங்கள் உள்ளன.",
        "வாரத்திற்கு ___ நாட்கள் வேலை செய்கிறேன்.",
        "அவர் ___ கிலோ அரிசி வாங்கினார்."
    ],
    ("படி", "verb: to read"): [
        "அவன் நன்றாகப் ___ தேர்வினை எழுதினான்.",
        "நாள்தோறும் செய்தித்தாள் ___ நல்லது.",
        "நீ இந்தப் புத்தகத்தை ___ பார்த்தாயா?",
        "பாடத்தைப் ___ போது கவனமாக இருக்க வேண்டும்."
    ],
    ("படி", "noun: step"): [
        "வீட்டின் வாசல் ___ உயரமாக இருக்கிறது.",
        "அவர் மாடி ___ ஏறிச் சென்றார்.",
        "ஒவ்வொரு ___ ஏறும்போதும் மூச்சு வாங்கியது.",
        "கோவில் ___ அழகாக செதுக்கப்பட்டிருந்தது."
    ],
    ("கல்", "noun: stone"): [
        "சாலையில் ஒரு பெரிய ___ கிடந்தது.",
        "சிற்பி அந்தக் ___ அழகிய சிலையைச் செதுக்கினார்.",
        "குழந்தை தண்ணீரில் ___ எறிந்து விளையாடியது.",
        "இந்த மாளிகை கருப்பு ___ கட்டப்பட்டது."
    ],
    ("திங்கள்", "noun: Monday"): [
        "வாரத்தின் முதல் நாள் ___ ஆகும்.",
        "அடுத்த ___ நான் ஊருக்குச் செல்கிறேன்.",
        "கடந்த ___ விடுமுறை அளிக்கப்பட்டது.",
        "வழக்கமாக ___ கிழமை கூட்டம் நடைபெறும்."
    ]
}

GENERIC_TEMPLATES = [
    "இந்த ___ பற்றி நீங்கள் கேள்விப்பட்டிருக்கிறீர்களா?",
    "அவர் ___ குறித்து விரிவாகப் பேசினார்.",
    "நமது பாடத்தில் ___ ஒரு முக்கியமான பகுதி.",
    "அன்றாட வாழ்வில் ___ பயன்பாடு அதிகம்."
]

def generate_template_challenge(word_tamil: str, sense: dict, variants: list) -> dict:
    sense_label = sense.get("label", "")
    key = (word_tamil, sense_label)
    
    # Select a template
    if key in TEMPLATES:
        sentence_tamil = random.choice(TEMPLATES[key])
    else:
        sentence_tamil = random.choice(GENERIC_TEMPLATES)

    # Determine the correct form (usually the first variant or root)
    # In a more advanced version, we could map templates to specific case markers.
    # For now, we use the preferred form for the sense.
    correct_answer = word_tamil # Default
    if variants:
        # Simple heuristic: matches if the sense description mentions a specific case/tense
        correct_answer = variants[0]["form"]

    # Select 3 unique distractors from variants
    distractors = [v["form"] for v in variants if v["form"] != correct_answer]
    random.shuffle(distractors)
    distractors = distractors[:3]

    # Fill in dummy distractors if not enough variants
    while len(distractors) < 3:
        distractors.append(correct_answer + "ம்") # Add -um as a dummy suffix

    return {
        "sentence_tamil": sentence_tamil.replace(word_tamil, "___"),
        "sentence_english": f"Challenge for {word_tamil} ({sense_label})",
        "correct_answer": correct_answer,
        "distractor_1": distractors[0],
        "distractor_2": distractors[1],
        "distractor_3": distractors[2],
        "morphological_note": f"This sentence uses {word_tamil} in its '{sense_label}' sense."
    }
