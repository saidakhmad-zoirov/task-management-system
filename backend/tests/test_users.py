from tests.conftest import PASSWORD


def test_get_and_update_profile(client, auth):
    assert client.get("/api/v1/users/me", headers=auth).json()["username"] == "ali"
    res = client.patch("/api/v1/users/me", json={"username": "ali_new"}, headers=auth)
    assert res.status_code == 200 and res.json()["username"] == "ali_new"


def test_email_conflict(client, auth, other_auth):
    res = client.patch("/api/v1/users/me", json={"email": "vali@example.com"}, headers=auth)
    assert res.status_code == 409


def test_change_password(client, auth):
    no_current = client.patch("/api/v1/users/me", json={"new_password": "Yangi12345"}, headers=auth)
    assert no_current.status_code == 422
    wrong = client.patch("/api/v1/users/me", json={"current_password": "Xato1234", "new_password": "Yangi12345"}, headers=auth)
    assert wrong.status_code == 400  # 401 emas — sessiya saqlanib qoladi
    ok = client.patch("/api/v1/users/me", json={"current_password": PASSWORD, "new_password": "Yangi12345"}, headers=auth)
    assert ok.status_code == 200
    assert client.post("/api/v1/auth/login", data={"username": "ali", "password": PASSWORD}).status_code == 401
    assert client.post("/api/v1/auth/login", data={"username": "ali", "password": "Yangi12345"}).status_code == 200
