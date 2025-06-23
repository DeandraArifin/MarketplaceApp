from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
import pymysql

DATABASE_URL = "mysql+pymysql://root:#Sh315c00L@localhost:3306/nexus_app"

engine = create_engine(DATABASE_URL, echo=True)

Base.metadata.create_all(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()