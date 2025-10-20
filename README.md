# Healthy Admin API

A **RESTful API** for the Healthy Admin. Focused on authentication, clean CRUD endpoints, pagination, and predictable JSON responses.

## ✨ Features

- JWT-based auth (session alternative possible)
- Modular structure: routes, controllers, services, models
- CORS/Helmet/rate-limit ready
- Consistent response shape (data/meta/error)
- Works with SQL databases (MySQL) via ORM

## 🧱 Tech Stack

- Node.js 18+
- Express.js
- ORM: Sequelize

## ✅ Requirements

- **Node.js 18+**
- **MySQL** up and running
- **npm / yarn / pnpm**

## 🔐 Environment Variables

Create your `.env` from the example:

```BASH
PORT=4000

NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=healthy
DB_USER=root
DB_PASS=secret

# Nodemailer configuration
USER_EMAIL = "yourEmailGoesHere"
USER_PASSWORD = "yourEmailPasswordGoesHere"

# JWT configuration
JWT_EXPIRATION= "3d"
JWT_SECRET= "yourJWTSecretGoesHere"

# Environment configuration
NODE_ENV="yourEnvironmentGoesHere"
```

## 🚀 Quickstart

```bash
git clone https://github.com/aurelioo29/Healthy-Api
cd Healthy-Api

# Install
npm install

# Env
cp .env.example .env
# Configure DB + JWT

# Run dev
npm run dev

# Production
npm run build && npm start
```

## 🔧 Scripts

```bash
npm run dev       # dev with nodemon
npm run start     # production start
npm run build     # compile (if TypeScript/bundler is used)
```

## 🗂️ Suggested Project Structure

```bash
src/
  index.js            # server bootstrap
  routes/             # route definitions
  controllers/        # request handlers
  services/           # business logic
  models/             # ORM models & relations
  middlewares/        # auth, error handling, rate-limit
  utils/              # helpers (logger, response)
```

## 🤝 Contributing

PRs are welcome. Please keep commits scoped and ensure lint passes.
