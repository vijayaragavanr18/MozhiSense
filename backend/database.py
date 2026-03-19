import os
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Configure Database URL
# Vercel provides POSTGRES_URL. Locally we use SQLite.
DATABASE_URL = os.getenv("POSTGRES_URL", "sqlite:///./mozhisense.db")

# Fix for Vercel Postgres URL protocol and driver (using pg8000 for zero-binary compatibility)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+pg8000://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)

# SQLite technically needs different connect_args than Postgres
is_sqlite = DATABASE_URL.startswith("sqlite")
engine_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(DATABASE_URL, connect_args=engine_args)
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

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)
