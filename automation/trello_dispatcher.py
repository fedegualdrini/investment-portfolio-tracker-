#!/usr/bin/env python3
"""Trello-driven dispatcher for invportfolio.

Behavior:
- Scan lists: "Needs work" and "Features".
- For each card whose latest comment is NOT from OpenClaw agents, move it to "En proceso".
- Collect comments from 3 agents (product-strategist, backend-architect, ui-implementation-specialist)
  and post each as a signed Trello comment.
- When all 3 comments are posted, move card to "Pending".

Notes:
- Reads Trello credentials from ~/.openclaw/openclaw.json env.vars (TRELLO_API_KEY/TRELLO_TOKEN).
- This script does NOT spawn agents; it is intended to be called by the OpenClaw main agent,
  which handles sessions_spawn + sessions_history.
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

OPENCLAW_CFG = os.path.expanduser("~/.openclaw/openclaw.json")

SIGNATURE_RE = re.compile(r"^— OpenClaw \(agent: ([a-z0-9\-]+)\)\s*$", re.I | re.M)


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip()).lower()


def load_creds() -> tuple[str, str]:
    cfg = json.load(open(OPENCLAW_CFG, "r", encoding="utf-8"))
    env = (cfg.get("env", {}) or {}).get("vars", {}) or {}
    key = env.get("TRELLO_API_KEY")
    tok = env.get("TRELLO_TOKEN")
    if not key or not tok:
        raise SystemExit("Missing TRELLO_API_KEY/TRELLO_TOKEN in ~/.openclaw/openclaw.json")
    return key, tok


def trello_get(path: str, key: str, token: str, qs: dict | None = None):
    qs = dict(qs or {})
    qs.update({"key": key, "token": token})
    url = f"https://api.trello.com/1{path}?{urllib.parse.urlencode(qs)}"
    with urllib.request.urlopen(url, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def trello_put(path: str, key: str, token: str, data: dict):
    url = f"https://api.trello.com/1{path}"
    params = dict(data)
    params.update({"key": key, "token": token})
    body = urllib.parse.urlencode(params).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="PUT")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def trello_post(path: str, key: str, token: str, data: dict):
    url = f"https://api.trello.com/1{path}"
    params = dict(data)
    params.update({"key": key, "token": token})
    body = urllib.parse.urlencode(params).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def find_board_id(board_name: str, key: str, token: str) -> str:
    boards = trello_get("/members/me/boards", key, token, {"fields": "name,id"})
    target = norm(board_name)
    for b in boards:
        if norm(b.get("name", "")) == target:
            return b["id"]
    raise SystemExit(f"Board not found: {board_name}")


def list_map(board_id: str, key: str, token: str) -> dict[str, str]:
    lists = trello_get(f"/boards/{board_id}/lists", key, token, {"fields": "name,id"})
    return {norm(l["name"]): l["id"] for l in lists}


def latest_comment_text(card_id: str, key: str, token: str) -> str | None:
    actions = trello_get(f"/cards/{card_id}/actions", key, token, {"filter": "commentCard", "limit": 1})
    if not actions:
        return None
    return (((actions[0] or {}).get("data") or {}).get("text") or "")


def last_comment_from_openclaw(card_id: str, key: str, token: str) -> bool:
    txt = latest_comment_text(card_id, key, token)
    if not txt:
        return False
    return bool(SIGNATURE_RE.search(txt))


def get_cards(list_id: str, key: str, token: str):
    return trello_get(f"/lists/{list_id}/cards", key, token, {"fields": "name,id,desc,url"})


def move_card(card_id: str, list_id: str, key: str, token: str):
    trello_put(f"/cards/{card_id}", key, token, {"idList": list_id})


def add_comment(card_id: str, text: str, key: str, token: str):
    trello_post(f"/cards/{card_id}/actions/comments", key, token, {"text": text})


def main():
    # This script only prints work items; OpenClaw main agent should execute spawns.
    key, token = load_creds()
    board_id = find_board_id("invportfolio", key, token)
    lm = list_map(board_id, key, token)

    needed = {
        "needs work": None,
        "features": None,
        "en proceso": None,
        "pending": None,
    }
    for k in list(needed.keys()):
        for name_norm, lid in lm.items():
            if k in name_norm:
                needed[k] = lid
                break

    missing = [k for k, v in needed.items() if not v]
    if missing:
        raise SystemExit(f"Missing lists on board: {missing}")

    todo = []
    for src in (needed["needs work"], needed["features"]):
        for c in get_cards(src, key, token):
            cid = c["id"]
            if last_comment_from_openclaw(cid, key, token):
                continue
            todo.append({
                "cardId": cid,
                "name": c.get("name"),
                "url": c.get("url"),
                "desc": c.get("desc", ""),
                "srcListId": src,
                "moveToListId": needed["en proceso"],
                "finalListId": needed["pending"],
            })

    print(json.dumps({
        "boardId": board_id,
        "lists": needed,
        "cardsToProcess": todo,
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
