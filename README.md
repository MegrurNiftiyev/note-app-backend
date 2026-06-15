# Note-Taking API

This API is built to test backend development concepts across different programming languages.
It uses JWT Authentication and a layered Clean Architecture with custom exception handling.
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
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive JWT token | No |

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

## Project Structure

```text
note-app-backend
|-- server.js
|-- src
|   |-- app.js
|   |-- config
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
|   |   `-- errorMiddleware.js
|   |-- models
|   |   |-- Note.js
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
|       `-- getBaseUrl.js
```

## Environment Variables

Before running the app, create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/note-app-db
JWT_SECRET=your_jwt_secret_here
API_BASE_URL=https://your-app-name.onrender.com
```

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

