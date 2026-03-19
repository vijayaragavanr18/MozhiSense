from database import SessionLocal
from engines.sense_engine import get_all_words
from main import _generate_and_cache_word


def run(force: bool = False):
    db = SessionLocal()
    try:
        words = get_all_words()
        print(f'Pre-generating for {len(words)} words...')
        for word in words:
            stats = _generate_and_cache_word(db, word['tamil'], force=force)
            print(f"{stats['word_tamil']}: generated={stats['generated']} validated={stats['validated']} cached={stats['cached']}")
        print('Done.')
    finally:
        db.close()


if __name__ == '__main__':
    run(force=False)
