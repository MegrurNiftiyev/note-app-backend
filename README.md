# 📝 Note-Taking API

This API is built to test backend development concepts across different programming languages.  
It uses **JWT Authentication** and a **layered Clean Architecture** with custom exception handling.  
Technologies used in this project include **Node.js**, **Express.js**, and **MongoDB**.

## Tech Stack

<p>
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white">
</p>

## Packages

<p>
  <a href="https://www.npmjs.com/package/express"><img alt="express" src="https://img.shields.io/badge/express-v4.18.2-000000?style=for-the-badge&logo=express&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/mongoose"><img alt="mongoose" src="https://img.shields.io/badge/mongoose-v8.0.0-880000?style=for-the-badge&logo=mongodb&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/jsonwebtoken"><img alt="jsonwebtoken" src="https://img.shields.io/badge/jsonwebtoken-v9.0.2-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/bcryptjs"><img alt="bcryptjs" src="https://img.shields.io/badge/bcryptjs-v2.4.3-338?style=for-the-badge&logo=npm&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/dotenv"><img alt="dotenv" src="https://img.shields.io/badge/dotenv-v16.3.1-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black"></a>
  <a href="https://www.npmjs.com/package/swagger-jsdoc"><img alt="swagger-jsdoc" src="https://img.shields.io/badge/swagger--jsdoc-v6.2.8-85EA2D?style=for-the-badge&logo=swagger&logoColor=black"></a>
  <a href="https://www.npmjs.com/package/swagger-ui-express"><img alt="swagger-ui-express" src="https://img.shields.io/badge/swagger--ui--express-v5.0.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black"></a>
  <a href="https://www.npmjs.com/package/nodemon"><img alt="nodemon" src="https://img.shields.io/badge/nodemon-v3.0.2-76D04B?style=for-the-badge&logo=nodemon&logoColor=white"></a>
</p>

## API Documentation (Swagger)

Interactive API docs are available at `http://localhost:5000/api-docs` after running the server.

<p align="center">
  <img src="./screenshots/01_swagger_overview.png" alt="Swagger Overview" width="100%" />
</p>

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | ❌ |
| POST | `/api/auth/login` | Login and receive JWT token | ❌ |

### Notes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/notes` | Create a new note | ✅ |
| GET | `/api/notes` | Get all your notes | ✅ |
| DELETE | `/api/notes/:id` | Delete a specific note | ✅ |
| DELETE | `/api/notes` | Delete all your notes | ✅ |

**Authorization header format:**
```
Authorization: Bearer <your_token>
```

## Project Structure

```text
note-app-backend
│   server.js
│
└───src
    ├───config
    │       db.js
    │       swagger.js
    │
    ├───errors
    │       customErrors.js
    │
    ├───middlewares
    │       authMiddleware.js
    │       errorMiddleware.js
    │
    ├───models
    │       User.js
    │       Note.js
    │
    ├───services
    │       authService.js
    │       noteService.js
    │
    ├───controllers
    │       authController.js
    │       noteController.js
    │
    ├───routes
    │       authRoutes.js
    │       noteRoutes.js
    │
    ├───utils
    │       catchAsync.js
    │
    └───app.js
```

## Environment Variables

Before running the app, create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/noteapp
JWT_SECRET=your_jwt_secret_here
```

## Installation

1. Clone the repository:  
   `git clone https://github.com/MegrurNiftiyev/note-app-backend.git`

2. Install dependencies:  
   `npm install`

3. Set up environment variables:  
   `cp .env.example .env`

4. Run the application:  
   `npm run dev`

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
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (not your resource) |
| 404 | Not found |
| 409 | Conflict (e.g. email already exists) |
| 500 | Internal server error |

## License

MIT
