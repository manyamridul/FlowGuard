"""
FlowGuard API smoke test — full CRUD across main resources.
Run: .venv-win\\Scripts\\python.exe crud_smoke_test.py
"""
import json
import sys
import time
import uuid

import requests

BASE = "http://127.0.0.1:8001/api"
RUN_ID = uuid.uuid4().hex[:8]
EMAIL = f"crudtest_{RUN_ID}@flowguard.test"
PASSWORD = "TestPass123!"
USERNAME = f"crudtest_{RUN_ID}"

results = []


def record(name, ok, detail=""):
    status = "PASS" if ok else "FAIL"
    results.append((status, name, detail))
    mark = "+" if ok else "X"
    print(f"[{mark}] {name}" + (f" — {detail}" if detail else ""))


def auth_headers(token):
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


def main():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})

    # --- Register ---
    reg = session.post(
        f"{BASE}/auth/register/",
        json={
            "username": USERNAME,
            "email": EMAIL,
            "password": PASSWORD,
            "password_confirm": PASSWORD,
            "first_name": "CRUD",
            "last_name": "Tester",
            "role": "DEVELOPER",
        },
        timeout=30,
    )
    record("Register user", reg.status_code in (200, 201), f"HTTP {reg.status_code}")

    # --- Login ---
    login = session.post(
        f"{BASE}/auth/login/",
        json={"email": EMAIL, "password": PASSWORD},
        timeout=30,
    )
    if login.status_code != 200:
        record("Login", False, login.text[:200])
        print_summary()
        sys.exit(1)

    data = login.json()
    token = data.get("access")
    user = data.get("user", {})
    user_id = user.get("id")
    record("Login", bool(token), f"user_id={user_id}")
    headers = auth_headers(token)

    # --- Me ---
    me = session.get(f"{BASE}/auth/me/", headers=headers, timeout=30)
    record("GET /auth/me/", me.status_code == 200, f"HTTP {me.status_code}")

    # --- Dashboard ---
    dash = session.get(f"{BASE}/dashboard/summary/", headers=headers, timeout=30)
    record("GET /dashboard/summary/", dash.status_code == 200, f"HTTP {dash.status_code}")

    # --- Settings ---
    settings_get = session.get(f"{BASE}/users/settings/", headers=headers, timeout=30)
    record("GET /users/settings/", settings_get.status_code == 200, f"HTTP {settings_get.status_code}")

    settings_patch = session.patch(
        f"{BASE}/users/settings/",
        headers=headers,
        json={"theme": "dark"},
        timeout=30,
    )
    record("PATCH /users/settings/", settings_patch.status_code == 200, f"HTTP {settings_patch.status_code}")

    # --- Users list ---
    users = session.get(f"{BASE}/users/", headers=headers, timeout=30)
    record("GET /users/", users.status_code == 200, f"HTTP {users.status_code}")

    # --- PROJECT CRUD ---
    project_payload = {
        "name": f"CRUD Test Project {RUN_ID}",
        "description": "Automated smoke test project",
        "status": "ACTIVE",
        "priority": "HIGH",
    }
    proj_create = session.post(
        f"{BASE}/projects/", headers=headers, json=project_payload, timeout=30
    )
    if proj_create.status_code not in (200, 201):
        record("CREATE project", False, proj_create.text[:300])
        print_summary()
        sys.exit(1)

    project = proj_create.json()
    project_id = project["id"]
    record("CREATE project", True, f"id={project_id}")

    proj_read = session.get(f"{BASE}/projects/{project_id}/", headers=headers, timeout=30)
    record("READ project", proj_read.status_code == 200, f"HTTP {proj_read.status_code}")

    proj_update = session.patch(
        f"{BASE}/projects/{project_id}/",
        headers=headers,
        json={"description": "Updated by CRUD test"},
        timeout=30,
    )
    record("UPDATE project", proj_update.status_code == 200, f"HTTP {proj_update.status_code}")

    # Add self as project member (required for bugs/knowledge queryset)
    member_create = session.post(
        f"{BASE}/projects/{project_id}/members/",
        headers=headers,
        json={"user_id": user_id, "role": "DEVELOPER"},
        timeout=30,
    )
    # Creator is auto-added as OWNER; second member add may 400 if duplicate
    member_ok = member_create.status_code in (200, 201, 400)
    record(
        "ADD project member (self)",
        member_ok,
        f"HTTP {member_create.status_code} {member_create.text[:120]}",
    )

    # --- WORKFLOW CRUD ---
    wf_payload = {
        "project": project_id,
        "title": f"CRUD Workflow {RUN_ID}",
        "description": "Workflow for smoke test",
        "status": "TODO",
        "priority": "MEDIUM",
        "tags": ["test", "crud"],
    }
    wf_create = session.post(f"{BASE}/workflows/", headers=headers, json=wf_payload, timeout=30)
    if wf_create.status_code not in (200, 201):
        record("CREATE workflow", False, wf_create.text[:300])
        workflow_id = None
    else:
        workflow = wf_create.json()
        workflow_id = workflow["id"]
        record("CREATE workflow", True, f"id={workflow_id}")

        wf_update = session.patch(
            f"{BASE}/workflows/{workflow_id}/",
            headers=headers,
            json={"description": "Updated workflow"},
            timeout=30,
        )
        record("UPDATE workflow", wf_update.status_code == 200, f"HTTP {wf_update.status_code}")

    # --- TASK CRUD ---
    task_id = None
    if workflow_id:
        task_payload = {
            "project": project_id,
            "workflow": workflow_id,
            "title": f"CRUD Task {RUN_ID}",
            "description": "Task smoke test",
            "status": "TODO",
            "priority": "MEDIUM",
        }
        task_create = session.post(f"{BASE}/tasks/", headers=headers, json=task_payload, timeout=30)
        if task_create.status_code not in (200, 201):
            record("CREATE task", False, task_create.text[:300])
        else:
            task = task_create.json()
            task_id = task["id"]
            record("CREATE task", True, f"id={task_id}")

            task_update = session.patch(
                f"{BASE}/tasks/{task_id}/",
                headers=headers,
                json={"status": "IN_PROGRESS"},
                timeout=30,
            )
            record("UPDATE task", task_update.status_code == 200, f"HTTP {task_update.status_code}")

    tasks_list = session.get(f"{BASE}/tasks/", headers=headers, timeout=30)
    record("LIST tasks", tasks_list.status_code == 200, f"HTTP {tasks_list.status_code}")

    # --- BUG CRUD ---
    bug_id = None
    if workflow_id:
        bug_payload = {
            "project": project_id,
            "workflow": workflow_id,
            "title": f"CRUD Bug {RUN_ID}",
            "description": "Bug smoke test",
            "status": "OPEN",
            "severity": "HIGH",
            "priority": "HIGH",
        }
        bug_create = session.post(f"{BASE}/bugs/", headers=headers, json=bug_payload, timeout=30)
        if bug_create.status_code not in (200, 201):
            record("CREATE bug", False, bug_create.text[:300])
        else:
            bug = bug_create.json()
            bug_id = bug["id"]
            record("CREATE bug", True, f"id={bug_id}")

            bug_update = session.patch(
                f"{BASE}/bugs/{bug_id}/",
                headers=headers,
                json={"status": "IN_PROGRESS"},
                timeout=30,
            )
            record("UPDATE bug", bug_update.status_code == 200, f"HTTP {bug_update.status_code}")

    bugs_list = session.get(f"{BASE}/bugs/", headers=headers, timeout=30)
    record("LIST bugs", bugs_list.status_code == 200, f"HTTP {bugs_list.status_code}")

    # --- KNOWLEDGE BASE CRUD ---
    kb_id = None
    kb_payload = {
        "project": project_id,
        "title": f"CRUD Article {RUN_ID}",
        "content": "Knowledge base smoke test content.",
        "category": "GENERAL",
        "status": "PUBLISHED",
    }
    kb_create = session.post(f"{BASE}/knowledge/", headers=headers, json=kb_payload, timeout=30)
    if kb_create.status_code not in (200, 201):
        record("CREATE knowledge article", False, kb_create.text[:300])
    else:
        kb = kb_create.json()
        kb_id = kb["id"]
        record("CREATE knowledge article", True, f"id={kb_id}")

        kb_update = session.patch(
            f"{BASE}/knowledge/{kb_id}/",
            headers=headers,
            json={"content": "Updated article content."},
            timeout=30,
        )
        record("UPDATE knowledge article", kb_update.status_code == 200, f"HTTP {kb_update.status_code}")

    kb_list = session.get(f"{BASE}/knowledge/", headers=headers, timeout=30)
    record("LIST knowledge articles", kb_list.status_code == 200, f"HTTP {kb_list.status_code}")

    # --- Activity logs ---
    logs = session.get(f"{BASE}/activity-logs/", headers=headers, timeout=30)
    record("GET /activity-logs/", logs.status_code == 200, f"HTTP {logs.status_code}")

    # --- Workflows list ---
    wfs = session.get(f"{BASE}/workflows/", headers=headers, timeout=30)
    record("LIST workflows", wfs.status_code == 200, f"HTTP {wfs.status_code}")

    # --- Projects list ---
    projs = session.get(f"{BASE}/projects/", headers=headers, timeout=30)
    record("LIST projects", projs.status_code == 200, f"HTTP {projs.status_code}")

    # --- DELETE (reverse order) ---
    if kb_id:
        kb_del = session.delete(f"{BASE}/knowledge/{kb_id}/", headers=headers, timeout=30)
        record("DELETE knowledge article", kb_del.status_code in (200, 204), f"HTTP {kb_del.status_code}")

    if bug_id:
        bug_del = session.delete(f"{BASE}/bugs/{bug_id}/", headers=headers, timeout=30)
        record("DELETE bug", bug_del.status_code in (200, 204), f"HTTP {bug_del.status_code}")

    if task_id:
        task_del = session.delete(f"{BASE}/tasks/{task_id}/", headers=headers, timeout=30)
        record("DELETE task", task_del.status_code in (200, 204), f"HTTP {task_del.status_code}")

    if workflow_id:
        wf_del = session.delete(f"{BASE}/workflows/{workflow_id}/", headers=headers, timeout=30)
        record("DELETE workflow", wf_del.status_code in (200, 204), f"HTTP {wf_del.status_code}")

    proj_del = session.delete(f"{BASE}/projects/{project_id}/", headers=headers, timeout=30)
    record("DELETE project", proj_del.status_code in (200, 204), f"HTTP {proj_del.status_code}")

    # Verify project gone
    proj_gone = session.get(f"{BASE}/projects/{project_id}/", headers=headers, timeout=30)
    record("VERIFY project deleted", proj_gone.status_code == 404, f"HTTP {proj_gone.status_code}")

    print_summary()
    failed = sum(1 for s, _, _ in results if s == "FAIL")
    sys.exit(1 if failed else 0)


def print_summary():
    print("\n" + "=" * 60)
    passed = sum(1 for s, _, _ in results if s == "PASS")
    failed = sum(1 for s, _, _ in results if s == "FAIL")
    print(f"SUMMARY: {passed} passed, {failed} failed, {len(results)} total")
    if failed:
        print("\nFailures:")
        for status, name, detail in results:
            if status == "FAIL":
                print(f"  - {name}: {detail}")
    print("=" * 60)


if __name__ == "__main__":
    main()
