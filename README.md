# TaskPulse — Task Management System

Vazifalarni boshqarish uchun to'liq web-ilova. Foydalanuvchi ro'yxatdan o'tadi, vazifa yaratadi, unga muddat va muhimlik
belgilaydi, holatini o'zgartiradi. Natijalar dashboard'dagi jonli statistikada ko'rinadi.
Har bir foydalanuvchi **faqat o'z vazifalarini** ko'radi: bu backend'da tekshiriladi.

> 📸 **Screenshotlar**: `docs/screenshots/` papkasiga rasmlarni joylang va shu yerga qo'shing:
>
> | Landing | Dashboard | Vazifalar |
> |---|---|---|
> | `![](docs/screenshots/landing.png)` | `![](docs/screenshots/dashboard.png)` | `![](docs/screenshots/tasks.png)` |

---

## Texnologiyalar

| Qatlam | Texnologiyalar |
|---|---|
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, JWT (PyJWT), Argon2 (argon2-cffi) |
| **Ma'lumotlar bazasi** | PostgreSQL (testlarda xotiradagi SQLite) |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Axios, React Router |
| **Testlar** | Pytest, HTTPX (FastAPI TestClient) |
| **Hujjatlar** | Swagger UI (`/docs`), ReDoc (`/redoc`) |
| **Ixtiyoriy** | Docker Compose: faqat PostgreSQL uchun |

## Arxitektura

```
task-management-system/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py          # get_current_user (JWT), DB sessiya
│   │   │   └── v1/              # auth, users, tasks, dashboard routerlari
│   │   ├── core/                # config (.env), security (Argon2 + JWT), xatolar
│   │   ├── db/                  # Base, engine, get_db
│   │   ├── models/              # User, Task (SQLAlchemy 2)
│   │   ├── schemas/             # Pydantic: kiruvchi/chiquvchi ma'lumotlar
│   │   ├── services/            # biznes-mantiq (router'lar faqat HTTP bilan ishlaydi)
│   │   └── main.py              # create_app(): CORS, xato handler, routerlar
│   ├── alembic/versions/        # 0001_initial — users, tasks, indekslar
│   ├── tests/                   # pytest: auth, users, tasks, dashboard
│   ├── main.py                  # uvicorn main:app
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/          # ui, tasks, charts, canvas (jonli fonlar)
│       ├── context/             # AuthProvider, ToastProvider
│       ├── hooks/               # useAuth, useAsync, useDebounce …
│       ├── layouts/             # PublicLayout, AppLayout (sidebar)
│       ├── pages/               # Landing, Login, Register, Dashboard, Tasks, TaskDetail, Profile, 404
│       ├── services/            # axios + har bir endpoint uchun funksiya
│       └── types/               # backend schemalariga mos TS tiplar
├── docker-compose.yml           # ixtiyoriy PostgreSQL
└── README.md
```

**So'rov oqimi:** `router` → `service` → `SQLAlchemy`.
- Router faqat kiruvchi ma'lumotni tekshiradi (Pydantic) va javob qaytaradi.
- Biznes-mantiq (egalik, saralash, statistika) `services/` papkasida turadi.
- Servis xatolari (`NotFoundError`, `ConflictError`...) bitta handler orqali to'g'ri HTTP kodiga aylanadi.

### Ma'lumotlar bazasi

| Jadval | Ustunlar |
|---|---|
| `users` | `id`, `username` (unique), `email` (unique), `password_hash`, `created_at` |
| `tasks` | `id`, `title`, `description`, `status`, `priority`, `deadline`, `created_at`, `updated_at`, `owner_id` → `users.id` (ON DELETE CASCADE) |

- **Indekslar:** `owner_id`, `(owner_id, status)`, `(owner_id, deadline)`.
- **CHECK cheklovlari:** `status IN (todo, in_progress, done)`, `priority IN (low, medium, high)`.

## API endpointlari

Asosiy manzil: `http://127.0.0.1:8000/api/v1`. Swagger: **<http://127.0.0.1:8000/docs>**. Swagger'dagi "Authorize" tugmasi login bilan ishlaydi.

| Metod | Endpoint | Tavsif |
|---|---|---|
| POST | `/auth/register` | Ro'yxatdan o'tish → `{access_token, user}` |
| POST | `/auth/login` | OAuth2 forma: `username` (yoki email) + `password` → token |
| GET | `/auth/me` | Joriy foydalanuvchi |
| GET | `/users/me` | Profil |
| PATCH | `/users/me` | Username/email; parol uchun `current_password` + `new_password` |
| GET | `/tasks/` | `?search=&status=&priority=&sort=&page=&size=` → `{items, total, page, size, pages}` |
| POST | `/tasks/` | Vazifa yaratish |
| GET | `/tasks/{id}` | Vazifa (boshqa foydalanuvchiniki → **404**) |
| PATCH | `/tasks/{id}` | Qisman yangilash (`deadline: null` muddatni olib tashlaydi) |
| DELETE | `/tasks/{id}` | O'chirish → 204 |
| GET | `/dashboard/stats` | Holatlar, kechikkanlar, 7 kunlik faollik, muhimlik, eng yaqin muddatlar |
| GET | `/health` | Server holati |

`sort` qiymatlari: `-created_at` (standart), `created_at`, `deadline`, `-deadline`, `priority`, `title`. Muddati yo'q vazifalar har doim oxirida turadi.

Frontend aynan shu endpointlardan foydalanadi. Ularning hammasi `frontend/src/services/` ichida.

## Xavfsizlik

- Parollar **Argon2id** bilan xeshlanadi. Ochiq matn hech qayerda saqlanmaydi.
- JWT (HS256) muddati `.env` da belgilanadi. Imzo, `exp` va `type` tekshiriladi. `alg=none` va soxta imzo rad etiladi.
- Ruxsatlar **backend'da** tekshiriladi: har bir so'rov `owner_id` bo'yicha filtrlanadi. Boshqa odamning vazifasiga murojaat qilinsa 404 qaytadi, shu bilan vazifa mavjudligi ham oshkor qilinmaydi.
- Login xatosida "login yoki parol noto'g'ri" degan bir xil xabar chiqadi. Qaysi biri xato ekani aytilmaydi.
- CORS faqat `.env` dagi frontend manzillariga ruxsat beradi.
- Maxfiy kalitlar faqat `.env` da turadi. `.env` `.gitignore` orqali GitHub'ga tushmaydi.

---

## Ishga tushirish (Windows 11, PowerShell)

Kerak bo'ladi: **Python 3.11+**, **Node.js 20+**, **PostgreSQL 15+**.

Agar PostgreSQL o'rnatilmagan bo'lsa, uni bitta buyruq bilan o'rnatasiz. PowerShell'ni administrator sifatida oching:

```powershell
winget install --id PostgreSQL.PostgreSQL.17 -e --source winget --override "--mode unattended --superpassword postgres123 --serverport 5432"
```

### 1. Bazani yaratish

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE task_db;"
```

Docker o'rnatilgan bo'lsa, buning o'rniga `docker compose up -d` buyrug'ini ishlatsangiz ham bo'ladi.

### 2. Backend (1-terminal)

```powershell
cd task-management-system\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt

Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(48))"   # shu natijani .env dagi SECRET_KEY ga yozing
notepad .env                                                    # DATABASE_URL dagi parolni tekshiring

alembic upgrade head
uvicorn main:app --reload
```

- API: <http://127.0.0.1:8000/api/v1/health>
- Swagger: <http://127.0.0.1:8000/docs>

> `Activate.ps1` "running scripts is disabled" desa, bir marta `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` ni bajaring.

### 3. Frontend (2-terminal)

```powershell
cd task-management-system\frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Brauzerda <http://127.0.0.1:5173> ni oching.

### 4. Testlar

```powershell
# backend (venv yoqilgan, backend papkasida) — PostgreSQL shart emas, testlar xotiradagi SQLite'da
pytest -v

# frontend
npm run typecheck
npm run build
```

### 5. GitHub'ga joylash

<https://github.com/new> da `task-management-system` nomli **bo'sh** repo yarating. Keyin:

```powershell
cd task-management-system
git init
git add .
git status          # .env, .venv, node_modules ro'yxatda BO'LMASLIGI kerak
git commit -m "TaskPulse: FastAPI + React task management system"
git branch -M main
git remote add origin https://github.com/<username>/task-management-system.git
git push -u origin main
```

---

## Test natijalari va holat

| Nima | Holat |
|---|---|
| Backend pytest (`tests/`, 17 ta test) | ⏳ **Ishga tushirilmagan**: loyiha yozilgan muhitda `fastapi`/`sqlalchemy` o'rnatib bo'lmadi. `pytest -v` ni o'zingiz bajaring |
| Pydantic schemalari (validatsiya qoidalari) | ✅ Haqiqiy pydantic bilan 15 ta tekshiruv o'tdi |
| JWT (yaratish, muddat, soxta imzo, `alg=none`) | ✅ Haqiqiy PyJWT bilan 8 ta tekshiruv o'tdi |
| Alembic migratsiya ↔ modellar | ✅ Ustun, tur, uzunlik, nullable, FK, indeks va CHECK'lar avtomatik solishtirildi, mos |
| Python sintaksisi va importlar | ✅ |
| Frontend TypeScript (strict) | ✅ Xatosiz. Tekshiruv soddalashtirilgan React tiplari bilan qilingan, `npm run typecheck` ni o'zingiz ham bajaring |
| Frontend brauzer testi (Playwright, 18 qadam) | ✅ Ro'yxatdan o'tish, login, dashboard, radar, CRUD, qidiruv, filtr, sahifalash, holat, profil va chiqish. Backend o'rnida unga mos demo-API ishlatilgan |
| `npm run build` | ⏳ O'zingiz bajaring |

## Ishlab chiqarishga chiqarishdan oldin

- `SECRET_KEY` ni yangi, uzun kalitga almashtiring.
- `CORS_ORIGINS` ga haqiqiy domenni yozing.
- `uvicorn` ni `--reload` siz, bir nechta worker bilan ishga tushiring.
- Token `localStorage` da saqlanadi. Portfolio uchun bu sodda yechim. Production'da httpOnly cookie va refresh token xavfsizroq.
- "Bajarildi" kuni `updated_at` bo'yicha hisoblanadi. Agar bajarilgan vazifa keyin tahrirlansa, faollik grafigida u tahrirlangan kunga o'tadi.
