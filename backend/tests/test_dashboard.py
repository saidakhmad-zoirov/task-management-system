from datetime import date, timedelta

URL = "/api/v1/dashboard/stats"


def test_empty_stats(client, auth):
    data = client.get(URL, headers=auth).json()
    assert data["total"] == 0 and data["completion_rate"] == 0
    assert len(data["activity"]) == 7 and data["upcoming"] == []


def test_stats_from_real_data(client, auth, other_auth):
    today = date.today()
    post = lambda **d: client.post("/api/v1/tasks/", json={"title": "t", **d}, headers=auth)  # noqa: E731
    post(status="todo", priority="high", deadline=str(today - timedelta(days=2)))  # muddati o'tgan
    post(status="in_progress", deadline=str(today + timedelta(days=3)))  # yaqin muddat
    post(status="done", priority="low", deadline=str(today - timedelta(days=1)))  # bajarilgan — overdue emas
    post(status="todo", priority="low", deadline=str(today + timedelta(days=30)))
    client.post("/api/v1/tasks/", json={"title": "begona"}, headers=other_auth)  # boshqa foydalanuvchi

    data = client.get(URL, headers=auth).json()
    assert (data["total"], data["todo"], data["in_progress"], data["done"]) == (4, 2, 1, 1)
    assert data["overdue"] == 1
    assert data["due_soon"] == 1
    assert data["completion_rate"] == 25
    assert data["by_priority"] == {"low": 2, "medium": 1, "high": 1}
    assert len(data["upcoming"]) == 3  # done kirmaydi; eng yaqin muddat birinchi
    assert data["upcoming"][0]["is_overdue"] is True
    assert sum(d["created"] for d in data["activity"]) == 4
    assert sum(d["completed"] for d in data["activity"]) == 1


def test_stats_require_auth(client):
    assert client.get(URL).status_code == 401
