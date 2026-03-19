import sys
import os
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from engines.challenge_engine import generate_challenge
from engines.sense_engine import get_senses
from engines.morphology_engine import get_morphological_variants
from engines.validation_engine import validate_challenge

def test_word_generation(word_tamil):
    print(f"\n--- Testing Word: {word_tamil} ---")
    try:
        word_data = get_senses(word_tamil)
        senses = word_data['senses']
        roman = word_data['roman']
        
        results = []
        for i in range(5):
            # Rotate through senses to ensure variety
            sense = senses[i % len(senses)]
            variants = get_morphological_variants(word_tamil, sense['pos'])
            
            print(f"Generating Challenge {i+1} for sense: {sense['label']}...")
            challenge = generate_challenge(word_tamil, roman, sense, variants)
            
            # Validate
            passed, reasons = validate_challenge(challenge, sense['pos'])
            
            results.append({
                "index": i+1,
                "sense": sense['label'],
                "passed": passed,
                "reasons": reasons,
                "sentence": challenge['sentence_tamil'],
                "correct": challenge['correct_answer']
            })
            
        return results
    except Exception as e:
        print(f"Error during test: {e}")
        return []

if __name__ == "__main__":
    test_results = test_word_generation("ஆறு")
    
    print("\n--- Final Test Audit ---")
    passed_count = sum(1 for r in test_results if r['passed'])
    print(f"Total Generated: {len(test_results)}")
    print(f"Validation Passed: {passed_count}/{len(test_results)}")
    
    for r in test_results:
        status = "✅ PASS" if r['passed'] else "❌ FAIL"
        print(f"\n[{r['index']}] {status} | Sense: {r['sense']}")
        print(f"Sentence: {r['sentence']}")
        print(f"Correct: {r['correct']}")
        if not r['passed']:
            print(f"Reasons: {r['reasons']}")

    if passed_count >= 1:
        print("\nSUCCESS: LLM and Validation engines are operational.")
    else:
        print("\nFAILURE: Engines failed to produce validated output.")
