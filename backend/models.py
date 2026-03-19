from pydantic import BaseModel


class AttemptPayload(BaseModel):
    session_id: str
    challenge_id: int
    word_tamil: str
    sense_label: str
    player_answer: str
    correct_answer: str
    is_correct: bool
    response_time_ms: int
