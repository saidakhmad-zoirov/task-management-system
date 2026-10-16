from app.core.security import create_access_token
from tests.conftest import PASSWORD, register


def test_register_returns_token_and_hides_password(client):
    data = register(client)
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "ali"
    assert "password" not in str(data["user"]) and "password_hash" not in data["user"]


def test_password_is_hashed(client, db_session):
    from app.models import User

    register(client)
    user = db_session.query(User).one()
    assert user.password_hash != PASSWORD
    assert user.password_hash.startswith("$argon2")


def test_register_validation_and_duplicates(client):
    register(client)
    weak = client.post("/api/v1/auth/register", json={"username": "x1", "email": "x@y.uz", "password": "12345678"})
    assert weak.status_code == 422
    dup_name = client.post("/api/v1/auth/register", json={"username": "ALI", "email": "b@b.uz", "password": PASSWORD})
    assert dup_name.status_code == 409
    dup_email = client.post("/api/v1/auth/register", json={"username": "bobur", "email": "ALI@example.com", "password": PASSWORD})
    assert dup_email.status_code == 409


def test_login_with_username_or_email(client):
    register(client)
    for login in ("ali", "ALI@example.com"):
        res = client.post("/api/v1/auth/login", data={"username": login, "password": PASSWORD})
        assert res.status_code == 200, res.text
        assert res.json()["access_token"]
    wrong = client.post("/api/v1/auth/login", data={"username": "ali", "password": "Notogri123"})
    assert wrong.status_code == 401


def test_me_requires_valid_token(client, auth):
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.get("/api/v1/auth/me", headers={"Authorization": "Bearer buzuq.token"}).status_code == 401
    expired = create_access_token(1, expires_minutes=-1)
    assert client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired}"}).status_code == 401
    me = client.get("/api/v1/auth/me", headers=auth)
    assert me.status_code == 200 and me.json()["email"] == "ali@example.com"


def test_token_of_deleted_user_is_rejected(client):
    token = create_access_token(999)
    assert client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}).status_code == 401
