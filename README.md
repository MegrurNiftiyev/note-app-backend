# Note-Taking API

This API is built to test backend development concepts across different programming languages.
It uses short-lived JWT access tokens, hybrid refresh-token delivery for web and mobile clients, and a layered Clean Architecture with custom exception handling.
Technologies used in this project include Node.js, Express.js, and MongoDB.

## Tech Stack

<p>
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white">
</p>

## Packages

<p>
  <a href="https://www.npmjs.com/package/express"><img alt="express" src="https://img.shields.io/badge/express-v4.22.2-000000?style=for-the-badge&logo=express&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/mongoose"><img alt="mongoose" src="https://img.shields.io/badge/mongoose-v8.24.0-880000?style=for-the-badge&logo=mongodb&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/jsonwebtoken"><img alt="jsonwebtoken" src="https://img.shields.io/badge/jsonwebtoken-v9.0.3-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/bcrypt"><img alt="bcrypt" src="https://img.shields.io/badge/bcrypt-v6.0.0-338?style=for-the-badge&logo=npm&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/dotenv"><img alt="dotenv" src="https://img.shields.io/badge/dotenv-v16.6.1-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black"></a>
  <a href="https://www.npmjs.com/package/helmet"><img alt="helmet" src="https://img.shields.io/badge/helmet-v8.2.0-000000?style=for-the-badge&logo=npm&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/cors"><img alt="cors" src="https://img.shields.io/badge/cors-v2.8.6-000000?style=for-the-badge&logo=npm&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/cookie-parser"><img alt="cookie-parser" src="https://img.shields.io/badge/cookie--parser-v1.4.7-000000?style=for-the-badge&logo=npm&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/hpp"><img alt="hpp" src="https://img.shields.io/badge/hpp-v0.2.3-000000?style=for-the-badge&logo=npm&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/express-rate-limit"><img alt="express-rate-limit" src="https://img.shields.io/badge/express--rate--limit-v8.5.2-000000?style=for-the-badge&logo=npm&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/zod"><img alt="zod" src="https://img.shields.io/badge/zod-v4.4.3-3068B7?style=for-the-badge&logo=npm&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/swagger-jsdoc"><img alt="swagger-jsdoc" src="https://img.shields.io/badge/swagger--jsdoc-v6.3.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black"></a>
  <a href="https://www.npmjs.com/package/swagger-ui-express"><img alt="swagger-ui-express" src="https://img.shields.io/badge/swagger--ui--express-v5.0.1-85EA2D?style=for-the-badge&logo=swagger&logoColor=black"></a>
</p>

## API Documentation

Deployed Swagger docs are available at:

```text
https://note-app-backend-ktxk.onrender.com/api-docs
```

<p align="center">
  <img src="./screenshots/01_swagger_overview.png" alt="Swagger Overview" width="100%" />
</p>

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user and receive tokens using web or mobile delivery | No |
| POST | `/api/auth/login` | Login and receive tokens using web or mobile delivery | No |
| POST | `/api/auth/refresh` | Rotate the refresh token and receive a new access token | Refresh token |
| POST | `/api/auth/logout` | Revoke the current refresh token | Refresh token |

`POST /api/auth/logout-all` has been removed. Refresh-token replay detection still revokes all active refresh tokens for the affected user internally.

Auth requests are rate limited to 5 attempts per 15 minutes for each endpoint. All `/api` routes also have a general rate limit.

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me` | Get your profile | Yes |
| PATCH | `/api/users/me` | Update your name or email | Yes |
| DELETE | `/api/users/me` | Delete your account and all related notes | Yes |

### Notes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/notes` | Create a new note | Yes |
| GET | `/api/notes` | Get all your notes | Yes |
| GET | `/api/notes/:id` | Get one note by ID | Yes |
| PATCH | `/api/notes/:id` | Update a note | Yes |
| DELETE | `/api/notes/:id` | Delete a specific note | Yes |
| DELETE | `/api/notes` | Delete all your notes | Yes |

Authorization header format:

```text
Authorization: Bearer <your_token>
```

## Auth Token Delivery

The API supports separate token delivery for web and mobile clients:

- Web clients omit `X-Client-Type`. Responses include `accessToken` in the JSON body and set `refreshToken` as an `httpOnly`, `secure`, `sameSite=strict` cookie.
- Mobile clients send `X-Client-Type: mobile`. Responses include both `accessToken` and `refreshToken` in the JSON body, and no cookie is set or cleared.

`X-Client-Type` only changes how refresh tokens are delivered at the API response level. Web responses use the web shape (`accessToken` + `user` in JSON, refresh token in cookie). Mobile responses use the mobile shape (`accessToken` + `refreshToken` + `user` in JSON). In Swagger UI, choose `mobile` in the `X-Client-Type` header field to test the mobile body flow; choose `web` or leave it unset for the cookie-based web flow.

Web response body:

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "665f2a797a6ef0cb8d3a7d1a",
      "name": "Ada Lovelace",
      "email": "ada@example.com",
      "createdAt": "2026-06-24T11:19:08.377Z"
    }
  }
}
```

Mobile response body:

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a3f1c2e4b5d6...",
    "user": {
      "_id": "665f2a797a6ef0cb8d3a7d1a",
      "name": "Ada Lovelace",
      "email": "ada@example.com",
      "createdAt": "2026-06-24T11:19:08.377Z"
    }
  }
}
```

Refresh tokens are opaque random values; only their SHA-256 hashes are stored in MongoDB. Refresh tokens rotate on every `/api/auth/refresh` call and are revoked on `/api/auth/logout`.

### Mobile Client Guidance

- Send `X-Client-Type: mobile` on every auth request that creates, refreshes, or revokes tokens.
- Store the mobile `refreshToken` in EncryptedSharedPreferences on Android or Keychain on iOS. Never store it in plain SharedPreferences, local logs, or crash reports.
- Send `refreshToken` in the JSON request body for `POST /api/auth/refresh` and `POST /api/auth/logout`.
- Keep the access token in memory, such as ViewModel or app state, and do not persist it.

Example mobile refresh request:

```json
{
  "refreshToken": "a3f1c2e4b5d6..."
}
```

### Swagger UI Notes

- Use `bearerAuth` to paste an access token from `/api/auth/register`, `/api/auth/login`, or `/api/auth/refresh` when testing protected endpoints.
- Swagger UI cannot directly test the cookie-based web refresh/logout flow because of browser cross-origin cookie limitations.
- To test refresh or logout in Swagger UI, send `X-Client-Type: mobile` and provide `refreshToken` in the request body.

## Project Structure

```text
note-app-backend
|-- server.js
|-- src
|   |-- app.js
|   |-- config
|   |   |-- env.js
|   |   |-- db.js
|   |   `-- swagger.js
|   |-- controllers
|   |   |-- authController.js
|   |   |-- noteController.js
|   |   `-- userController.js
|   |-- errors
|   |   `-- customErrors.js
|   |-- middlewares
|   |   |-- authMiddleware.js
|   |   |-- errorMiddleware.js
|   |   |-- validateRequest.js
|   |   `-- validateAuth.js
|   |-- models
|   |   |-- Note.js
|   |   |-- RefreshToken.js
|   |   `-- User.js
|   |-- routes
|   |   |-- authRoutes.js
|   |   |-- noteRoutes.js
|   |   `-- userRoutes.js
|   |-- services
|   |   |-- authService.js
|   |   |-- noteService.js
|   |   `-- userService.js
|   `-- utils
|       |-- catchAsync.js
|       |-- clientType.js
|       `-- getBaseUrl.js
```

## Environment Variables

Before running the app, create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/note-app-db
MONGO_DB_NAME=note-app-db
JWT_ACCESS_SECRET=replace_with_a_strong_access_token_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
COOKIE_SECURE=true
CORS_ALLOWED_ORIGINS=https://yourfrontend.com,http://localhost:3000
BCRYPT_SALT_ROUNDS=12
API_BASE_URL=https://your-app-name.onrender.com
```

`MONGO_DB_NAME` selects the database inside your MongoDB cluster. A cluster is the server infrastructure; a database is the logical app database on that cluster; collections are table-like groups inside that database. This app stores `users`, `notes`, and `refreshtokens` in `note-app-db` by default.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/MegrurNiftiyev/note-app-backend.git
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Run the application:

```bash
npm run dev
```

## Security

- Helmet is enabled with an explicit JSON API CSP choice.
- CORS uses an environment-driven origin allow-list with `credentials: true`.
- Cookies are parsed with `cookie-parser`, JSON bodies are limited to `10kb`, and HTTP parameter pollution is blocked with `hpp`.
- Auth endpoints use rate limiting: 5 register, login, refresh, or logout attempts per 15 minutes.
- All `/api` endpoints have a general application rate limit.
- Zod validates auth, note, user-update, and note-id inputs before they reach the service layer.
- Notes are limited to 10,000 characters in both Zod and the Mongoose schema.
- Auth services also enforce string-only `name`, `email`, and `password` values to reduce NoSQL injection risk.
- Passwords require at least 8 characters with uppercase, lowercase, and digit characters.
- Passwords are hashed with bcrypt before storage; the cost factor is configurable with `BCRYPT_SALT_ROUNDS`.
- Failed logins are tracked per account and temporarily lock the account after repeated failures.
- Protected routes require a Bearer access token signed with `JWT_ACCESS_SECRET` using HS256.
- Refresh tokens rotate on every refresh, are revoked on logout, and replay of a revoked refresh token revokes every active refresh token for that user.

## Error Responses

All errors return a consistent JSON format:

```json
{
  "status": "fail",
  "message": "Descriptive error message here"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized, missing or invalid token |
| 403 | Forbidden, not your resource |
| 404 | Not found |
| 409 | Conflict, for example email already exists |
| 429 | Too many attempts, try again later |
| 500 | Internal server error |

### Error Classes

The API uses a custom operational error hierarchy:

| Class | Status |
|-------|--------|
| `BadRequestError` | 400 |
| `UnauthorizedError` | 401 |
| `ForbiddenError` | 403 |
| `NotFoundError` | 404 |
| `ConflictError` | 409 |

The global error middleware also handles Mongoose validation errors, duplicate key errors, and invalid ObjectId cast errors.

## License

This project is licensed under the MIT License.

