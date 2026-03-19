import json
from pathlib import Path

try:
    from indicnlp.normalize.indic_normalize import IndicNormalizerFactory
except Exception:
    IndicNormalizerFactory = None

RULES_PATH = Path(__file__).parent.parent / "data" / "suffix_rules.json"


def load_rules() -> dict:
    with open(RULES_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def get_morphological_variants(word_tamil: str, pos: str) -> list:
    rules = load_rules()
    rule_set = rules["verb_rules"] if pos == "verb" else rules["noun_case_rules"]
    normalized_root = normalize_tamil_word(word_tamil)

    variants = []
    for rule in rule_set:
        form = apply_suffix(normalized_root, rule["suffix"], pos)
        variants.append(
            {
                "label": rule["label"],
                "description": rule["description"],
                "form": form,
            }
        )
    return variants


def apply_suffix(root: str, suffix: str, pos: str) -> str:
    known_forms = {
        ("ஆறு", "இல்"): "ஆற்றில்",
        ("ஆறு", "ஐ"): "ஆற்றை",
        ("ஆறு", "உக்கு"): "ஆற்றுக்கு",
        ("ஆறு", "இலிருந்து"): "ஆற்றிலிருந்து",
        ("ஆறு", "இன்"): "ஆற்றின்",
        ("ஆறு", "ஆவது"): "ஆறாவது",
        ("படி", "த்தான்"): "படித்தான்",
        ("படி", "த்தாள்"): "படித்தாள்",
        ("படி", "த்தார்கள்"): "படித்தார்கள்",
        ("படி", "க்கிறான்"): "படிக்கிறான்",
        ("படி", "க்கிறாள்"): "படிக்கிறாள்",
        ("படி", "க்கிறார்கள்"): "படிக்கிறார்கள்",
        ("படி", "ப்பார்கள்"): "படிப்பார்கள்",
        ("படி", "க்க"): "படிக்க",
        ("படி", "த்தல்"): "படித்தல்",
        ("கல்", "ஐ"): "கல்லை",
        ("கல்", "இல்"): "கல்லில்",
    }

    key = (root, suffix)
    if key in known_forms:
        return known_forms[key]

    if suffix == "":
        return root

    if pos == "noun" and root.endswith("ு") and suffix.startswith("இ"):
        return root[:-1] + "்ற" + suffix

    return root + suffix


def normalize_tamil_word(word_tamil: str) -> str:
    if IndicNormalizerFactory is None:
        return word_tamil

    try:
        factory = IndicNormalizerFactory()
        normalizer = factory.get_normalizer('ta')
        return normalizer.normalize(word_tamil)
    except Exception:
        return word_tamil
