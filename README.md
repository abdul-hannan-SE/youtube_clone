# YouTube Clone Backend
This is the backend for a YouTube Clone application. It provides essential functionality for user authentication and video handling, allowing users to register, log in, and manage their profiles. The backend is built using Node.js, Express, and MongoDB.

## Installation
To set up the project locally, follow these steps:

### 1. Clone the repository:

### 2. Install the dependencies:
`npm install`
Usage
To run the project, use the following command:

`npm run dev`

This will start the application in development mode. By default, the server runs on http://localhost:5000.

# API endpoints
## Authentication APIs
1. User Sign Up
``Endpoint``: `POST /auth/signUp`
```json
{
  "username": "string",
  "avatar": imageFile,         //  user's avatar
  "fullName": "string",
  "email": "string",
  "password": "string",
  "coverImage": imageFile     // Optional   user's cover image
}
```
2. User Login
``Endpoint``: `POST /auth/login`
```json
{
  "email": "string",
  "password": "string"
}
```
this will set cookies and refresh and accessToken (jwt)

3. User Logout
``Endpoint``: `POST /auth/logout`
this will logout from application and remove cookies
