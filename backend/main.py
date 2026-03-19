import random
import uuid
from collections import defaultdict
import os
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from sqlalchemy.orm import Session

from database import ChallengeCache, SessionLocal, UserAttempt, UserSession
from engines.challenge_engine import generate_challenge
from engines.graph_engine import build_graph_data
from engines.morphology_engine import get_morphological_variants
from engines.sense_engine import get_all_words, get_senses
from engines.validation_engine import validate_challenge
from models import AttemptPayload

app = FastAPI(title='MozhiSense API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://localhost:3000'],
    allow_methods=['*'],
    allow_headers=['*'],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _query_cached_challenges(db: Session, word_tamil: str, sense_id: Optional[str] = None):
    query = db.query(ChallengeCache).filter(
        ChallengeCache.word_tamil == word_tamil,
        ChallengeCache.validated.is_(True),
    )
    if sense_id:
        query = query.filter(ChallengeCache.sense_id == sense_id)
    return query.all()


def _generate_and_cache_word(db: Session, word_tamil: str, force: bool = False):
    if force:
        db.query(ChallengeCache).filter(ChallengeCache.word_tamil == word_tamil).delete()
        db.commit()

    if not force:
        existing = _query_cached_challenges(db, word_tamil)
        if existing:
            return {
                'word_tamil': word_tamil,
                'cached': len(existing),
                'generated': 0,
                'validated': len(existing),
            }

    try:
        word_data = get_senses(word_tamil)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error

    generated = 0
    validated = 0

    for sense in word_data['senses']:
        variants = get_morphological_variants(word_tamil, sense['pos'])

        try:
            challenge_data = generate_challenge(word_tamil, word_data['roman'], sense, variants)
        except Exception:
            continue

        passed, _ = validate_challenge(challenge_data, sense['pos'])

        record = ChallengeCache(
            word_tamil=word_tamil,
            word_roman=word_data['roman'],
            sense_id=sense['id'],
            sense_label=sense['label'],
            pos=sense['pos'],
            sentence_tamil=challenge_data['sentence_tamil'],
            sentence_english=challenge_data['sentence_english'],
            correct_answer=challenge_data['correct_answer'],
            distractor_1=challenge_data['distractor_1'],
            distractor_2=challenge_data['distractor_2'],
            distractor_3=challenge_data['distractor_3'],
            morphological_note=challenge_data['morphological_note'],
            validated=passed,
        )
        db.add(record)
        db.commit()
        generated += 1
        if passed:
            validated += 1

    return {
        'word_tamil': word_tamil,
        'cached': 0,
        'generated': generated,
        'validated': validated,
    }


def _sense_error_counts(db: Session, word_tamil: str):
    rows = db.query(UserAttempt).filter(UserAttempt.word_tamil == word_tamil).all()
    counts = defaultdict(lambda: {'wrong': 0, 'total': 0})
    for row in rows:
        counts[row.sense_label]['total'] += 1
        if not row.is_correct:
            counts[row.sense_label]['wrong'] += 1
    return counts


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.on_event('startup')
def startup_checks():
    base_url = os.getenv('OLLAMA_BASE_URL', 'http://127.0.0.1:11434').strip().rstrip('/')
    model_name = os.getenv('OLLAMA_MODEL', 'qwen2:1.5b').strip()
    try:
        response = requests.get(f'{base_url}/api/tags', timeout=5)
        response.raise_for_status()
        models = response.json().get('models', [])
        names = {item.get('name', '') for item in models}
        if model_name not in names:
            print(f"[startup-warning] Ollama model '{model_name}' not found. Run: ollama pull {model_name}")
    except Exception as error:
        print(f"[startup-warning] Unable to reach Ollama at {base_url}: {error}")


@app.get('/words')
def list_words():
    return {'words': get_all_words()}


@app.get('/words/{word_tamil}/senses')
def word_senses(word_tamil: str):
    try:
        return get_senses(word_tamil)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.get('/challenges/{word_tamil}')
def get_challenges(
    word_tamil: str,
    sense_id: Optional[str] = None,
    weak_first: bool = False,
    db: Session = Depends(get_db),
):
    cached = _query_cached_challenges(db, word_tamil, sense_id)

    if not cached:
        raise HTTPException(
            status_code=503,
            detail='Challenges not pre-generated. Run POST /admin/pregenerate/all first.',
        )

    if weak_first:
        counts = _sense_error_counts(db, word_tamil)
        cached.sort(key=lambda item: counts[item.sense_label]['wrong'], reverse=True)

    return {
        'challenges': [row_to_dict(challenge) for challenge in cached],
        'requested_sense_id': sense_id,
    }


@app.post('/admin/pregenerate/all')
def pregenerate_all(force: bool = False, db: Session = Depends(get_db)):
    words = get_all_words()
    results = []
    for word in words:
        stats = _generate_and_cache_word(db, word['tamil'], force=force)
        results.append(stats)
    return {'ok': True, 'results': results}


@app.post('/admin/pregenerate/{word_tamil}')
def pregenerate_word(word_tamil: str, force: bool = False, db: Session = Depends(get_db)):
    stats = _generate_and_cache_word(db, word_tamil, force=force)
    return {'ok': True, 'stats': stats}


@app.post('/sessions/start')
def start_session(word_tamil: str, db: Session = Depends(get_db)):
    session_id = str(uuid.uuid4())
    session = UserSession(session_id=session_id, word_tamil=word_tamil)
    db.add(session)
    db.commit()
    return {'session_id': session_id}


@app.post('/sessions/attempt')
def record_attempt(payload: AttemptPayload, db: Session = Depends(get_db)):
    attempt = UserAttempt(**payload.model_dump())
    db.add(attempt)

    session = db.query(UserSession).filter(UserSession.session_id == payload.session_id).first()
    if session:
        session.total_questions += 1
        if payload.is_correct:
            session.correct += 1
            session.xp_earned += 15

    db.commit()
    return {'recorded': True}


@app.get('/sessions/{session_id}/summary')
def session_summary(session_id: str, db: Session = Depends(get_db)):
    session = db.query(UserSession).filter(UserSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail='Session not found')

    attempts = db.query(UserAttempt).filter(UserAttempt.session_id == session_id).all()

    accuracy = round((session.correct / session.total_questions * 100) if session.total_questions > 0 else 0)

    best_streak = 0
    current_streak = 0
    weak_tracker = defaultdict(lambda: {'wrong': 0, 'total': 0})

    for attempt in attempts:
        weak_tracker[attempt.sense_label]['total'] += 1
        if attempt.is_correct:
            current_streak += 1
            best_streak = max(best_streak, current_streak)
        else:
            current_streak = 0
            weak_tracker[attempt.sense_label]['wrong'] += 1

    if best_streak >= 5:
        session.xp_earned += 20
        db.commit()

    weak_senses = []
    for sense_label, data in weak_tracker.items():
        if data['total'] == 0:
            continue
        weak_senses.append(
            {
                'sense_label': sense_label,
                'wrong': data['wrong'],
                'total': data['total'],
                'accuracy': round(((data['total'] - data['wrong']) / data['total']) * 100),
            }
        )

    weak_senses.sort(key=lambda item: (item['wrong'], -item['accuracy']), reverse=True)

    return {
        'word_tamil': session.word_tamil,
        'total_questions': session.total_questions,
        'correct': session.correct,
        'accuracy': accuracy,
        'xp_earned': session.xp_earned,
        'best_streak': best_streak,
        'weak_senses': weak_senses,
        'attempts': [
            {
                'sense_label': attempt.sense_label,
                'player_answer': attempt.player_answer,
                'correct_answer': attempt.correct_answer,
                'is_correct': attempt.is_correct,
                'response_time_ms': attempt.response_time_ms,
            }
            for attempt in attempts
        ],
    }


@app.get('/graph/{word_tamil}')
def get_graph(word_tamil: str):
    try:
        word_data = get_senses(word_tamil)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error

    variants_by_sense = {}
    for sense in word_data['senses']:
        variants_by_sense[sense['id']] = get_morphological_variants(word_tamil, sense['pos'])

    return build_graph_data(word_data, variants_by_sense)


def row_to_dict(row: ChallengeCache) -> dict:
    return {
        'id': row.id,
        'word_tamil': row.word_tamil,
        'word_roman': row.word_roman,
        'sense_id': row.sense_id,
        'sense_label': row.sense_label,
        'pos': row.pos,
        'sentence_tamil': row.sentence_tamil,
        'sentence_english': row.sentence_english,
        'correct_answer': row.correct_answer,
        'options': shuffle_options(
            row.correct_answer,
            row.distractor_1,
            row.distractor_2,
            row.distractor_3,
        ),
        'morphological_note': row.morphological_note,
    }


def shuffle_options(correct, distractor_1, distractor_2, distractor_3):
    options = [
        {'text': correct, 'is_correct': True},
        {'text': distractor_1, 'is_correct': False},
        {'text': distractor_2, 'is_correct': False},
        {'text': distractor_3, 'is_correct': False},
    ]
    random.shuffle(options)
    return options


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host='0.0.0.0', port=8000, reload=True)
