import os
import json
import time
import secrets
from pathlib import Path
from typing import Optional

import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr


APP = FastAPI(title="BootyBot Licence Server", version="1.0.0")
APP.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DATA_DIR = Path(os.getenv("BOOTYBOT_LICENSE_DATA", "license_server_data"))
try:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    pass
STORE_PATH = DATA_DIR / "licenses.json"  # fallback JSON (si pas de DB)


def _db_conn():
    url = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")
    if not url:
        return None
    try:
        conn = psycopg2.connect(url, cursor_factory=RealDictCursor)
        return conn
    except Exception:
        return None


def _init_db():
    conn = _db_conn()
    if not conn:
        return
    with conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS licenses (
                    id SERIAL PRIMARY KEY,
                    email TEXT NOT NULL,
                    key TEXT NOT NULL,
                    plan TEXT NOT NULL,
                    token TEXT,
                    expires_at BIGINT,
                    created_at BIGINT
                );
                CREATE INDEX IF NOT EXISTS idx_licenses_email_key ON licenses(email, key);
                """
            )
    conn.close()

# Initialise la base si DATABASE_URL est configuré
_init_db()


def _read_store() -> dict:
    # If DB available, read from DB; else fallback JSON
    conn = _db_conn()
    if conn:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT email, key, plan, token, expires_at, created_at FROM licenses")
                rows = cur.fetchall()
        conn.close()
        return {"licenses": rows}
    if not STORE_PATH.exists():
        return {"licenses": []}
    try:
        return json.loads(STORE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {"licenses": []}


def _write_store(data: dict) -> None:
    # Only for JSON fallback
    STORE_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _now_ts() -> int:
    return int(time.time())


def _months_to_seconds(months: int) -> int:
    # Approx 30 days per month
    return months * 30 * 24 * 60 * 60


def _days_remaining(expires_at: Optional[int]) -> Optional[int]:
    if not expires_at:
        return None
    delta = expires_at - _now_ts()
    return max(0, delta // 86400)


class VerifyRequest(BaseModel):
    email: EmailStr
    key: str
    device_id: Optional[str] = None


class VerifyResponse(BaseModel):
    ok: bool
    plan: Optional[str] = None
    token: Optional[str] = None
    expires_at: Optional[int] = None
    message: Optional[str] = None


def _find_license(email: str, key: str) -> Optional[dict]:
    conn = _db_conn()
    if conn:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT email, key, plan, token, expires_at, created_at FROM licenses WHERE email=%s AND key=%s", (email, key))
                row = cur.fetchone()
        conn.close()
        return row
    store = _read_store()
    for lic in store.get("licenses", []):
        if lic.get("email") == email and lic.get("key") == key:
            return lic
    return None


@APP.post("/api/verify", response_model=VerifyResponse)
def verify(req: VerifyRequest):
    lic = _find_license(req.email, req.key)
    if not lic:
        return VerifyResponse(ok=False, message="Licence introuvable")

    if lic.get("plan") not in {"pro", "team"}:
        return VerifyResponse(ok=False, message="Plan invalide")

    expires_at = int(lic.get("expires_at") or 0)
    if expires_at and expires_at < _now_ts():
        return VerifyResponse(ok=False, message="Licence expirée")

    token = lic.get("token")
    if not token:
        # Générer token si manquant
        token = secrets.token_urlsafe(32)
        lic["token"] = token
        store = _read_store()
        for i, l in enumerate(store.get("licenses", [])):
            if l.get("email") == lic.get("email") and l.get("key") == lic.get("key"):
                store["licenses"][i] = lic
                break
        _write_store(store)

    # Liaison optionnelle à l'appareil (JSON fallback uniquement pour éviter de casser le schéma DB)
    if not _db_conn():
        try:
            changed = False
            devices = lic.get("devices")
            if not isinstance(devices, list):
                devices = []
            if req.device_id:
                if req.device_id not in devices:
                    # Limite par plan
                    plan = lic.get("plan")
                    limit = 1
                    if plan == "pro":
                        limit = 2
                    elif plan == "team":
                        limit = 5
                    if len(devices) >= limit:
                        return VerifyResponse(ok=False, message="Limite d'appareils atteinte")
                    devices.append(req.device_id)
                    lic["devices"] = devices
                    changed = True
                lic["last_device_id"] = req.device_id
                changed = True or changed
            if changed:
                store = _read_store()
                for i, l in enumerate(store.get("licenses", [])):
                    if l.get("email") == lic.get("email") and l.get("key") == lic.get("key"):
                        store["licenses"][i] = lic
                        break
                _write_store(store)
        except Exception:
            # Ne pas bloquer en cas d'erreur d'écriture; laisser passer la vérification
            pass

    return VerifyResponse(
        ok=True,
        plan=lic["plan"],
        token=token,
        expires_at=expires_at or None,
        message="OK",
    )


class CheckRequest(BaseModel):
    token: str
    device_id: Optional[str] = None


class CheckResponse(BaseModel):
    ok: bool
    plan: Optional[str] = None
    expires_at: Optional[int] = None
    message: Optional[str] = None


@APP.post("/api/check", response_model=CheckResponse)
def check(req: CheckRequest):
    # Cherche la licence par token
    conn = _db_conn()
    lic = None
    if conn:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT email, key, plan, token, expires_at FROM licenses WHERE token=%s", (req.token,))
                lic = cur.fetchone()
        conn.close()
    else:
        store = _read_store()
        for l in store.get("licenses", []):
            if l.get("token") == req.token:
                lic = l
                break
    if not lic:
        return CheckResponse(ok=False, message="Token inconnu")
    expires_at = int(lic.get("expires_at") or 0)
    if expires_at and expires_at < _now_ts():
        return CheckResponse(ok=False, message="Licence expirée")
    # Si JSON fallback avec binding devices, vérifier device_id si présent
    if not _db_conn():
        devices = lic.get("devices") if isinstance(lic, dict) else None
        if isinstance(devices, list) and devices:
            if not req.device_id or req.device_id not in devices:
                return CheckResponse(ok=False, message="Appareil non autorisé")
    return CheckResponse(ok=True, plan=lic.get("plan"), expires_at=expires_at or None, message="OK")


# --------------------------- Admin API ----------------------------------

class AdminCreateRequest(BaseModel):
    email: EmailStr
    plan: str  # "pro" | "team"
    months: int = 1


def require_admin(token: Optional[str] = None):
    admin_token = os.getenv("ADMIN_TOKEN", "")
    if not admin_token:
        raise HTTPException(status_code=403, detail="ADMIN_TOKEN non configuré")
    if token != admin_token:
        raise HTTPException(status_code=401, detail="Token admin invalide")


@APP.post("/admin/create")
def admin_create(req: AdminCreateRequest, token: Optional[str] = None):
    require_admin(token)
    if req.plan not in {"pro", "team"}:
        raise HTTPException(status_code=400, detail="Plan invalide")

    key = secrets.token_urlsafe(16)
    expires_at = _now_ts() + _months_to_seconds(max(1, req.months))

    conn = _db_conn()
    if conn:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO licenses(email, key, plan, token, expires_at, created_at) VALUES(%s,%s,%s,%s,%s,%s)",
                    (req.email, key, req.plan, None, expires_at, _now_ts())
                )
        conn.close()
    else:
        store = _read_store()
        lic = {
            "email": req.email,
            "key": key,
            "plan": req.plan,
            "expires_at": expires_at,
            "token": None,
            "created_at": _now_ts(),
        }
        store.setdefault("licenses", []).append(lic)
        _write_store(store)

    return {
        "ok": True,
        "email": req.email,
        "key": key,
        "plan": req.plan,
        "expires_at": expires_at,
    }


@APP.get("/")
def root():
    return {"name": "BootyBot Licence Server", "status": "ok"}


# --------------------------- Admin Listing --------------------------------

@APP.get("/admin/list")
def admin_list(token: Optional[str] = None):
    require_admin(token)
    store = _read_store()
    rows = []
    for lic in store.get("licenses", []):
        days = _days_remaining(lic.get("expires_at"))
        status = "actif" if (lic.get("expires_at") and lic.get("expires_at") > _now_ts()) else "expiré"
        rows.append({
            "email": lic.get("email"),
            "plan": lic.get("plan"),
            "key": lic.get("key"),
            "expires_at": lic.get("expires_at"),
            "days_remaining": days,
            "status": status,
        })
    return {"ok": True, "licenses": rows}


@APP.get("/admin/dashboard")
def admin_dashboard(token: Optional[str] = None):
    require_admin(token)
    store = _read_store()
    # Simple HTML table
    def fmt_date(ts: Optional[int]) -> str:
        if not ts:
            return "-"
        try:
            return time.strftime('%Y-%m-%d', time.localtime(ts))
        except Exception:
            return str(ts)

    rows_html = []
    for lic in store.get("licenses", []):
        days = _days_remaining(lic.get("expires_at"))
        status = "actif" if (lic.get("expires_at") and lic.get("expires_at") > _now_ts()) else "expiré"
        rows_html.append(
            f"<tr>"
            f"<td>{lic.get('email')}</td>"
            f"<td>{lic.get('plan')}</td>"
            f"<td><code>{lic.get('key')}</code></td>"
            f"<td>{fmt_date(lic.get('expires_at'))}</td>"
            f"<td>{days if days is not None else '-'}</td>"
            f"<td>{status}</td>"
            f"</tr>"
        )

    html = (
        "<html><head><meta charset='utf-8'><title>BootyBot Admin</title>"
        "<style>body{font-family:Segoe UI,Arial; margin:20px;} table{border-collapse:collapse;width:100%;}"
        "th,td{border:1px solid #ddd;padding:8px;} th{background:#f3f3f3;text-align:left;} code{font-family:Consolas,monospace;}</style>"
        "</head><body>"
        "<h2>Licences</h2>"
        "<table><thead><tr><th>Email</th><th>Plan</th><th>Clé</th><th>Expire le</th><th>Jours restants</th><th>Status</th></tr></thead><tbody>"
        + "".join(rows_html) +
        "</tbody></table>"
        "</body></html>"
    )
    return html


class AdminUpdateRequest(BaseModel):
    email: EmailStr
    key: str
    plan: Optional[str] = None  # pro|team
    months: Optional[int] = None  # prolonge à partir de maintenant
    expires_at: Optional[int] = None  # timestamp unix (si fourni, prioritaire)


@APP.post("/admin/update")
def admin_update(req: AdminUpdateRequest, token: Optional[str] = None):
    require_admin(token)
    conn = _db_conn()
    if conn:
        with conn:
            with conn.cursor() as cur:
                # Fetch
                cur.execute("SELECT email, key, plan, token, expires_at, created_at FROM licenses WHERE email=%s AND key=%s", (req.email, req.key))
                row = cur.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="Licence introuvable")
                plan = row["plan"]
                expires_at = row["expires_at"]
                if req.plan:
                    if req.plan not in {"pro", "team"}:
                        raise HTTPException(status_code=400, detail="Plan invalide")
                    plan = req.plan
                if req.expires_at:
                    expires_at = int(req.expires_at)
                elif req.months:
                    expires_at = _now_ts() + _months_to_seconds(max(1, req.months))
                cur.execute("UPDATE licenses SET plan=%s, expires_at=%s WHERE email=%s AND key=%s", (plan, expires_at, req.email, req.key))
                return {"ok": True, "license": {"email": req.email, "key": req.key, "plan": plan, "expires_at": expires_at}}
        conn.close()
    # JSON fallback
    store = _read_store()
    for i, lic in enumerate(store.get("licenses", [])):
        if lic.get("email") == req.email and lic.get("key") == req.key:
            if req.plan:
                if req.plan not in {"pro", "team"}:
                    raise HTTPException(status_code=400, detail="Plan invalide")
                lic["plan"] = req.plan
            if req.expires_at:
                lic["expires_at"] = int(req.expires_at)
            elif req.months:
                lic["expires_at"] = _now_ts() + _months_to_seconds(max(1, req.months))
            store["licenses"][i] = lic
            _write_store(store)
            return {"ok": True, "license": lic}
    raise HTTPException(status_code=404, detail="Licence introuvable")


class AdminRevokeRequest(BaseModel):
    email: EmailStr
    key: str


@APP.post("/admin/revoke")
def admin_revoke(req: AdminRevokeRequest, token: Optional[str] = None):
    require_admin(token)
    conn = _db_conn()
    if conn:
        with conn:
            with conn.cursor() as cur:
                cur.execute("UPDATE licenses SET expires_at=%s WHERE email=%s AND key=%s", (_now_ts() - 1, req.email, req.key))
                if cur.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Licence introuvable")
                return {"ok": True}
        conn.close()
    # JSON fallback
    store = _read_store()
    for i, lic in enumerate(store.get("licenses", [])):
        if lic.get("email") == req.email and lic.get("key") == req.key:
            lic["expires_at"] = _now_ts() - 1
            store["licenses"][i] = lic
            _write_store(store)
            return {"ok": True}
    raise HTTPException(status_code=404, detail="Licence introuvable")


