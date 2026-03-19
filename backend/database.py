import os
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Original Strong Backend uses SQLite for local simplicity on Render/VPS
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mozhisense.db")

# Detect if we should use SQLite or Postgres (for Render/Railway DBs)
is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ChallengeCache(Base):
    __tablename__ = "challenge_cache"

    id = Column(Integer, primary_key=True)
    word_tamil = Column(String, index=True)
    word_roman = Column(String)
    sense_id = Column(String)
    sense_label = Column(String)
    pos = Column(String)
    sentence_tamil = Column(Text)
    sentence_english = Column(Text)
    correct_answer = Column(String)
    distractor_1 = Column(String)
    distractor_2 = Column(String)
    distractor_3 = Column(String)
    morphological_note = Column(Text)
    validated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True)
    session_id = Column(String, unique=True, index=True)
    word_tamil = Column(String)
    total_questions = Column(Integer, default=0)
    correct = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserAttempt(Base):
    __tablename__ = "user_attempts"

    id = Column(Integer, primary_key=True)
    session_id = Column(String, index=True)
    challenge_id = Column(Integer)
    word_tamil = Column(String)
    sense_label = Column(String)
    player_answer = Column(String)
    correct_answer = Column(String)
    is_correct = Column(Boolean)
    response_time_ms = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)
