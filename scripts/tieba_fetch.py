"""用 aiotieba 读取贴吧帖子与楼中楼，输出 JSON（stdout）。

配置通过环境变量 TIEBA_CONFIG 传入：
  {"forum":"deepseek","threads":10,"posts":20,"comments":10,"gapMs":1600,"minLikes":0,"minFloors":0}

只读公开内容；不登录、不写入。任何依赖缺失或接口失败都会以 {"ok":false,...} 返回。
"""
from __future__ import annotations

import asyncio
import html
import json
import os
import re
import sys

try:
    from aiotieba import Client
except Exception as exc:  # noqa: BLE001
    print(json.dumps({"ok": False, "error": "aiotieba_missing", "message": str(exc)[:300]}))
    sys.exit(0)


def clean(value: str, limit: int) -> str:
    text = re.sub(r"<br\s*/?>", "\n", str(value or ""))
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text[:limit]


def user_name(user) -> str:
    for attr in ("show_name", "nick_name_new", "nick_name", "user_name"):
        value = getattr(user, attr, "")
        if value:
            return clean(value, 60)
    return ""


async def main() -> int:
    try:
        cfg = json.loads(os.environ.get("TIEBA_CONFIG", "{}"))
    except Exception:
        print(json.dumps({"ok": False, "error": "bad_config"}))
        return 0
    forum = str(cfg.get("forum") or "").strip()
    if not forum:
        print(json.dumps({"ok": False, "error": "missing_forum"}))
        return 0
    max_threads = max(1, int(cfg.get("threads") or 10))
    posts_limit = max(2, min(50, int(cfg.get("posts") or 20)))
    comments_limit = max(1, min(30, int(cfg.get("comments") or 10)))
    min_likes = max(0, int(cfg.get("minLikes") or 0))
    min_floors = max(0, int(cfg.get("minFloors") or 0))
    gap = max(0.0, min(60.0, float(cfg.get("gapMs") or 1600) / 1000.0))
    page_cap = max(0, int(cfg.get("pageCap") or 0))  # 0 = 不限；仅用于调试/测试
    errors = []
    rows = []
    async with Client() as client:
        qualified = []
        pn = 1
        while True:
            try:
                page = await client.get_threads(forum, pn=pn, rn=30)
            except Exception as exc:  # noqa: BLE001
                errors.append(f"threads p{pn}: {type(exc).__name__}: {exc}"[:300])
                break
            if not page:
                break
            for thread in page:
                if (getattr(thread, "agree", 0) or 0) >= min_likes and (getattr(thread, "reply_num", 0) or 0) >= min_floors:
                    qualified.append(thread)
            if len(qualified) >= max_threads:
                break
            pn += 1
            if page_cap and pn > page_cap:
                break
            await asyncio.sleep(gap)
        qualified.sort(key=lambda item: getattr(item, "reply_num", 0) or 0, reverse=True)
        selected = qualified[:max_threads]
        for thread in selected:
            try:
                posts = await client.get_posts(
                    thread.tid,
                    pn=1,
                    rn=posts_limit,
                    with_comments=True,
                    comment_rn=comments_limit,
                )
            except Exception as exc:  # noqa: BLE001
                errors.append(f"posts {thread.tid}: {type(exc).__name__}: {exc}"[:300])
                continue
            op_text = clean(getattr(thread, "text", "") or "", 6000)
            floor_count = sum(1 for post in posts if (getattr(post, "floor", 0) or 0) > 1)
            floors = []
            for post in posts:
                if (getattr(post, "floor", 0) or 0) <= 1:
                    if not op_text:
                        op_text = clean(getattr(post, "text", "") or "", 6000)
                    continue
                comments = []
                for comment in getattr(post, "comments", []) or []:
                    comments.append({
                        "pid": int(getattr(comment, "pid", 0) or 0),
                        "text": clean(getattr(comment, "text", "") or "", 500),
                        "agree": int(getattr(comment, "agree", 0) or 0),
                        "user": user_name(getattr(comment, "user", None)),
                    })
                floors.append({
                    "floor": int(getattr(post, "floor", 0) or 0),
                    "pid": int(getattr(post, "pid", 0) or 0),
                    "text": clean(getattr(post, "text", "") or "", 1500),
                    "agree": int(getattr(post, "agree", 0) or 0),
                    "user": user_name(getattr(post, "user", None)),
                    "comments": comments,
                })
            rows.append({
                "tid": int(thread.tid),
                "title": clean(getattr(thread, "title", "") or "", 200),
                "text": op_text,
                "user": user_name(getattr(thread, "user", None)),
                "replyNum": int(getattr(thread, "reply_num", 0) or 0),
                "floorCount": floor_count,
                "agree": int(getattr(thread, "agree", 0) or 0),
                "viewNum": int(getattr(thread, "view_num", 0) or 0),
                "createTime": int(getattr(thread, "create_time", 0) or 0),
                "posts": floors,
            })
            await asyncio.sleep(gap)
    print(json.dumps({
        "ok": True,
        "forum": forum,
        "threads": rows,
        "errors": errors,
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
