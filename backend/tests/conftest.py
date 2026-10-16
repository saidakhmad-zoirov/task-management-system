"""
Testlar alohida, xotiradagi SQLite bazada ishlaydi — PostgreSQL o'rnatilmagan bo'lsa ham `pytest` ishlaydi.
Har bir test toza bazadan boshlanadi.
"""
import os

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only-0123456789abcdef")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine, event  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.models  # noqa: E402,F401
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.main import app  # noqa: E402

PASSWORD = "Parol1234"


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite+pysqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)

    @event.listens_for(engine, "connect")
    def _fk_on(dbapi_conn, _):  # SQLite'da foreign key (CASCADE) yoqiladi
        dbapi_conn.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    session = TestingSession()
    yield session
    session.close()
    engine.dispose()


@pytest.fixture()
def client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def register(client, username="ali", email="ali@example.com", password=PASSWORD):
    res = client.post("/api/v1/auth/register", json={"username": username, "email": email, "password": password})
    assert res.status_code == 201, res.text
    return res.json()


@pytest.fixture()
def auth(client):
    token = register(client)["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def other_auth(client):
    token = register(client, "vali", "vali@example.com")["access_token"]
    return {"Authorization": f"Bearer {token}"}
