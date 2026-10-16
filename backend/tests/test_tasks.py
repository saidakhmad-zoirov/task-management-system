from datetime import date, timedelta

URL = "/api/v1/tasks/"


def make(client, auth, **data):
    payload = {"title": "Vazifa", **data}
    res = client.post(URL, json=payload, headers=auth)
    assert res.status_code == 201, res.text
    return res.json()


def test_crud(client, auth):
    task = make(client, auth, title="  Hisobot tayyorlash ", description="Q3", priority="high", deadline="2030-01-15")
    assert task["title"] == "Hisobot tayyorlash"
    assert task["status"] == "todo" and task["priority"] == "high" and task["deadline"] == "2030-01-15"
    assert task["is_overdue"] is False

    tid = task["id"]
    assert client.get(f"{URL}{tid}", headers=auth).json()["description"] == "Q3"

    upd = client.patch(f"{URL}{tid}", json={"status": "in_progress", "deadline": None}, headers=auth).json()
    assert upd["status"] == "in_progress" and upd["deadline"] is None
    assert upd["title"] == "Hisobot tayyorlash"  # yuborilmagan maydon o'zgarmaydi

    assert client.delete(f"{URL}{tid}", headers=auth).status_code == 204
    assert client.get(f"{URL}{tid}", headers=auth).status_code == 404


def test_validation(client, auth):
    assert client.post(URL, json={"title": "   "}, headers=auth).status_code == 422
    assert client.post(URL, json={"title": "x", "status": "archived"}, headers=auth).status_code == 422
    assert client.post(URL, json={"title": "x", "priority": "urgent"}, headers=auth).status_code == 422
    assert client.post(URL, json={"title": "x", "deadline": "ertaga"}, headers=auth).status_code == 422
    tid = make(client, auth)["id"]
    assert client.patch(f"{URL}{tid}", json={"title": ""}, headers=auth).status_code == 422
    assert client.get(f"{URL}abc", headers=auth).status_code == 422
    assert client.get(f"{URL}?size=500", headers=auth).status_code == 422


def test_requires_auth(client):
    assert client.get(URL).status_code == 401
    assert client.post(URL, json={"title": "x"}).status_code == 401


def test_users_cannot_touch_each_others_tasks(client, auth, other_auth):
    tid = make(client, auth, title="Maxfiy")["id"]
    assert client.get(f"{URL}{tid}", headers=other_auth).status_code == 404
    assert client.patch(f"{URL}{tid}", json={"title": "buzildi"}, headers=other_auth).status_code == 404
    assert client.delete(f"{URL}{tid}", headers=other_auth).status_code == 404
    assert client.get(URL, headers=other_auth).json()["total"] == 0
    assert client.get(f"{URL}{tid}", headers=auth).json()["title"] == "Maxfiy"


def test_search_filters_sort_pagination(client, auth):
    today = date.today()
    make(client, auth, title="Dizayn maketi", priority="high", deadline=str(today + timedelta(days=5)))
    make(client, auth, title="API yozish", description="dizayn bo'yicha", status="in_progress", deadline=str(today + timedelta(days=1)))
    make(client, auth, title="Test", status="done", priority="low")
    for i in range(10):
        make(client, auth, title=f"Qo'shimcha {i}", priority="low")

    def get(**params):
        return client.get(URL, params=params, headers=auth).json()

    assert get(search="dizayn")["total"] == 2  # sarlavha va tavsif bo'yicha, harf katta-kichikligi farqsiz
    assert get(status="done")["total"] == 1
    assert get(priority="high")["total"] == 1
    assert [t["title"] for t in get(sort="deadline", size=2)["items"]] == ["API yozish", "Dizayn maketi"]
    assert get(sort="priority", size=1)["items"][0]["priority"] == "high"

    page1, page3 = get(size=5, page=1), get(size=5, page=3)
    assert page1["total"] == 13 and page1["pages"] == 3 and len(page1["items"]) == 5
    assert len(page3["items"]) == 3
    assert get(size=5, page=9)["items"] == []
