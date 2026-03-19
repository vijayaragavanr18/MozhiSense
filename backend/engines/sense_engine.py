import json
from pathlib import Path

WORDNET_PATH = Path(__file__).parent.parent / "data" / "tamil_wordnet.json"


def load_wordnet() -> dict:
    with open(WORDNET_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def get_senses(word_tamil: str) -> dict:
    data = load_wordnet()
    for word in data["words"]:
        if word["tamil"] == word_tamil:
            return word
    raise ValueError(f"Word '{word_tamil}' not found in WordNet")


def get_all_words() -> list:
    data = load_wordnet()
    return [
        {
            "tamil": word["tamil"],
            "roman": word["roman"],
            "sense_count": len(word["senses"]),
            "pos_types": list(set(sense["pos"] for sense in word["senses"])),
            "senses": word["senses"],
        }
        for word in data["words"]
    ]
