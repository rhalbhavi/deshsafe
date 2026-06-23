# DeshSafe Backend

Express + MongoDB backend API for DeshSafe.

## Folder Structure

```
backend/
├── index.js              # Entry point
├── db.js                 # MongoDB connection
├── middleware/
│   └── auth.js           # Firebase token verification
├── models/
│   ├── Report.js         # Report schema + validation
│   └── Alert.js          # Alert schema + validation
├── routes/
│   ├── geocode.js        # /api/geocode, /api/reverse-geocode
│   ├── reports.js        # /api/reports
│   ├── alerts.js         # /api/alerts
│   └── users.js          # /api/users
└── services/
    ├── firebaseAdmin.js  # Firebase Admin SDK init
    ├── geocodeCache.js   # MongoDB geocode cache
    └── googleGeocode.js  # Google Maps geocoding
```

## Setup

```bash
npm install firebase-admin
cp .env.example .env
# Fill in your .env values
node backend/index.js
```

## API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /api/health | Public |
| GET | /api/reports | Public |
| POST | /api/reports | Token required |
| GET | /api/reports/my/submissions | Token required |
| GET | /api/reports/admin/all | Admin only |
| PATCH | /api/reports/:id/status | Admin only |
| DELETE | /api/reports/:id | Admin only |
| GET | /api/alerts | Public |
| POST | /api/alerts | Admin only |
| PATCH | /api/alerts/:id | Admin only |
| DELETE | /api/alerts/:id | Admin only |
| GET | /api/users/me | Token required |
| PATCH | /api/users/me | Token required |
| GET | /api/users | Admin only |
| PATCH | /api/users/:uid/role | Admin only |
| GET | /api/geocode?address= | Public |
| GET | /api/reverse-geocode?lat=&lng= | Public |
