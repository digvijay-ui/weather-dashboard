# Weather Dashboard

## Environment Setup

Create the frontend `.env` file before running the project:

```bash
cd frontend
cp .env.example .env
```

The `.env` file should contain:

```env
VITE_API_BASE_URL=http://127.0.0.1:6688
```

## Run Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend runs at:

```text
http://127.0.0.1:6688
```

## Run Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Other Commands

```bash
cd frontend
npm run type-check
npm run test:unit:run
npm run build
npm run lint
```

## Why Backend Is Implemented

I added a small Flask backend so the Vue frontend does not directly call the provided weather APIs. The frontend sends a request to the backend, and the backend fetches the weather data, removes unnecessary metadata, handles errors, and sends a clean response back to the frontend.