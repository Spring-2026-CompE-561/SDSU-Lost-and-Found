# Campus Lost and Found Website
# SDSU Lost and Found
## Overview

The Campus Lost and Found System is a web application that allows university students and staff to report, search for and recover lost items on campus.
This platform centralizes lost and found reports and provides a secure environment for campus members to communicate and recover belongings.

## Features:
- User registration and login (students and staff only)
- Post lost or found items with description, images, date and location
- Search and filter items by location and date
- Item status tracking (Lost, Found, Returned)
- Messaging system between users
- Email notifications for updates and reminders


# Backend Submission 

### Team
- Alan Alaniz
- Erik Gamez
- Diego Chavez
- Daniel Rico
- Buchard Joseph


### Requirements
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic

## Setup Instructions

### 1. Clone the repository
```
git clone <your-repo-url>
```

### 2. Navigate to the backend folder
```
cd backend
```

### 3. Create and activate virtual environment
```
python -m venv .venv
.venv\Scripts\activate
```

### 4. Install dependencies
```
pip install -r requirements.txt
```

## Running the Application

Navigate to the app folder:
```
cd src/app
fastapi dev main.py
```

The API will be available at:
- http://127.0.0.1:8000
- http://127.0.0.1:8000/docs (Swagger UI)

## API Endpoints

### Users
- POST /api/v1/user/signup
- POST /api/v1/user/login
- GET /api/v1/user/{id}
- PUT /api/v1/user/{id}
- DELETE /api/v1/user/{id}

### Conversations
- POST /api/v1/conversations/
- GET /api/v1/conversations/
- DELETE /api/v1/conversations/{id}
- GET | /api/v1/conversations/{conversation_id}/messages 
- POST | /api/v1/conversations/{conversation_id}/messages 

### Messages 
- DELETE | /api/v1/messages/{message_id} 

### Token
- POST | /api/v1/token/refresh 
- POST | /api/v1/token/logout 

### Items
- GET | /api/v1/home/ 
- POST | /api/v1/home/ 
- GET | /api/v1/home/{item_id} 
- PUT | /api/v1/home/{item_id} 
- DELETE | /api/v1/home/{item_id} 
