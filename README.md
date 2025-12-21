# Tours REST API

A full-featured RESTful backend API for managing tours and users, built with Node.js, Express, and MongoDB.

This project was built as part of an advanced full-stack course and extended with real-world backend best practices.
NOTE : Built for practicing and learning reasons.

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (admin / guide / user)
- Secure password hashing
- Password reset & forgot-password flow using tokens

### Tours API
- Create, read, update, delete tours
- Advanced filtering, sorting, and pagination
- MongoDB aggregation and query middleware
- Relations between tours and users (guides)

### Users API
- User signup & login
- Update own profile (`/updateMe`)
- Update password
- Admin-only user management (get all users, delete users)

### Architecture & Best Practices
- Express middleware for auth, authorization, and error handling
- Mongoose schemas, models, and query middleware
- Centralized error handling
- Clean project structure

## Tech Stack
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

