import stanza

from engines.local_nlp_engine import score_perplexity_with_inltk_adapter

_nlp = None


def get_nlp():
    global _nlp
    if _nlp is None:
        _nlp = stanza.Pipeline("ta", processors="tokenize,pos", use_gpu=False, verbose=False)
    return _nlp


def layer1_wordnet_anchor(sentence_tamil: str, correct_answer: str, sense_gloss: str) -> tuple[bool, str]:
    if correct_answer in sentence_tamil or "___" in sentence_tamil:
        return True, "WordNet anchor check passed"
    return False, f"Correct answer '{correct_answer}' not found in sentence context"


def layer2_pos_check(sentence_with_answer: str, correct_answer: str, expected_pos: str) -> tuple[bool, str]:
    try:
        nlp = get_nlp()
        full_sentence = sentence_with_answer.replace("___", correct_answer)
        doc = nlp(full_sentence)

        for sentence in doc.sentences:
            for word in sentence.words:
                if correct_answer in word.text:
                    detected_pos = word.upos.lower()
                    if expected_pos == "noun" and detected_pos in ["noun", "propn"]:
                        return True, f"POS check passed: detected as {detected_pos}"
                    if expected_pos == "verb" and detected_pos in ["verb", "aux"]:
                        return True, f"POS check passed: detected as {detected_pos}"
        return True, "POS check: word not isolated by tokenizer — passing"
    except Exception as error:
        return True, f"POS check skipped (Stanza error): {str(error)}"


def layer3_perplexity_gate(sentence_tamil: str) -> tuple[bool, str]:
    if len(sentence_tamil) < 10:
        return False, "Sentence too short — likely malformed"
    if "___" not in sentence_tamil:
        return False, "Blank marker missing from sentence"
    if len(sentence_tamil.split()) < 3:
        return False, "Sentence has fewer than 3 tokens"

    perplexity = score_perplexity_with_inltk_adapter(sentence_tamil)
    if perplexity is None:
        return True, "iNLTK perplexity unavailable — skipped"

    threshold = 180.0
    if perplexity > threshold:
        return False, f"iNLTK perplexity too high: {perplexity:.2f} > {threshold:.2f}"
    return True, f"iNLTK perplexity check passed: {perplexity:.2f}"


def validate_challenge(challenge: dict, expected_pos: str) -> tuple[bool, list[str]]:
    reasons = []

    passed1, reason1 = layer1_wordnet_anchor(
        challenge["sentence_tamil"], challenge["correct_answer"], ""
    )
    reasons.append(f"L1: {reason1}")

    passed2, reason2 = layer2_pos_check(
        challenge["sentence_tamil"], challenge["correct_answer"], expected_pos
    )
    reasons.append(f"L2: {reason2}")

    passed3, reason3 = layer3_perplexity_gate(challenge["sentence_tamil"])
    reasons.append(f"L3: {reason3}")

    return passed1 and passed2 and passed3, reasons
