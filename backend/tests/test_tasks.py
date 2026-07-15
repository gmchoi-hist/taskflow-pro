def test_create_task_201(client):
    res = client.post("/api/tasks", json={"title": "테스트 태스크"})
    assert res.status_code == 201
    body = res.json()
    assert body["title"] == "테스트 태스크"
    assert body["status"] == "todo"
    assert "description" in body


def test_create_task_missing_title_returns_400(client):
    res = client.post("/api/tasks", json={"title": ""})
    assert res.status_code == 400


def test_create_task_invalid_status_returns_400(client):
    res = client.post("/api/tasks", json={"title": "x", "status": "invalid"})
    assert res.status_code == 400


def test_create_task_invalid_due_at_returns_400(client):
    res = client.post("/api/tasks", json={"title": "x", "due_at": "not-a-date"})
    assert res.status_code == 400


def test_create_task_title_too_long_returns_400(client):
    res = client.post("/api/tasks", json={"title": "x" * 201})
    assert res.status_code == 400


def test_list_tasks_excludes_description(client):
    client.post("/api/tasks", json={"title": "a", "description": "secret"})
    res = client.get("/api/tasks")
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 1
    assert "description" not in items[0]


def test_get_task_includes_description(client):
    created = client.post("/api/tasks", json={"title": "a", "description": "secret"}).json()
    res = client.get(f"/api/tasks/{created['id']}")
    assert res.status_code == 200
    assert res.json()["description"] == "secret"


def test_get_task_not_found_returns_404(client):
    res = client.get("/api/tasks/does-not-exist")
    assert res.status_code == 404


def test_update_task_partial_200(client):
    created = client.post("/api/tasks", json={"title": "a"}).json()
    res = client.put(f"/api/tasks/{created['id']}", json={"status": "done"})
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "done"
    assert body["title"] == "a"


def test_update_task_not_found_returns_404(client):
    res = client.put("/api/tasks/does-not-exist", json={"status": "done"})
    assert res.status_code == 404


def test_delete_task_204(client):
    created = client.post("/api/tasks", json={"title": "a"}).json()
    res = client.delete(f"/api/tasks/{created['id']}")
    assert res.status_code == 204
    assert client.get(f"/api/tasks/{created['id']}").status_code == 404


def test_delete_task_not_found_returns_404(client):
    res = client.delete("/api/tasks/does-not-exist")
    assert res.status_code == 404
