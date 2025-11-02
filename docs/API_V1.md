# AI Storyline Generator API v1.0

## Base URL

```
Production: https://api.ai-storyline.com/api
Development: http://localhost:3001/api
```

## Authentication

All protected endpoints require authentication using JWT tokens in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "tier": "free",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "tier": "pro"
  },
  "token": "jwt_token_here"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "tier": "pro"
  }
}
```

---

### Presentations

#### Create Presentation
```http
POST /presentations
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Presentation",
  "description": "Presentation description",
  "brandKit": {
    "primaryColor": "#14b8a6",
    "secondaryColor": "#6366f1",
    "font": "Arial"
  },
  "model": "standard",
  "aiProvider": "gemini"
}
```

**Response:**
```json
{
  "presentation": {
    "id": "uuid",
    "title": "My Presentation",
    "userId": "uuid",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

#### List Presentations
```http
GET /presentations?limit=50&offset=0&sortBy=updated_at&sortOrder=DESC
Authorization: Bearer <token>
```

**Response:**
```json
{
  "presentations": [
    {
      "id": "uuid",
      "title": "My Presentation",
      "slideCount": 8,
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Presentation
```http
GET /presentations/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "presentation": {
    "id": "uuid",
    "title": "My Presentation",
    "slides": [
      {
        "id": "uuid",
        "position": 0,
        "title": "Slide Title",
        "content": "Slide content",
        "imageUrl": "https://example.com/image.jpg"
      }
    ]
  }
}
```

#### Update Presentation
```http
PUT /presentations/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "isPublic": true
}
```

#### Delete Presentation
```http
DELETE /presentations/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Presentation deleted"
}
```

#### Save Slides
```http
POST /presentations/:id/slides
Authorization: Bearer <token>
Content-Type: application/json

{
  "slides": [
    {
      "title": "Slide 1",
      "content": "Content here",
      "layout": "TITLE_CONTENT",
      "imageUrl": "https://example.com/image.jpg"
    }
  ]
}
```

---

### AI Generation

#### Generate Storyline
```http
POST /generate-storyline
Content-Type: application/json

{
  "baseText": "Your content here",
  "audience": "Executives",
  "goal": "Inform",
  "brandKit": {},
  "presentationModel": "standard",
  "aiProvider": "gemini"
}
```

**Response:**
```json
{
  "storyline": [
    {
      "id": "slide-1",
      "title": "Slide Title",
      "content": "Slide content",
      "imagePrompt": "Professional image description"
    }
  ]
}
```

---

### Analytics

#### Track Event
```http
POST /analytics
Content-Type: application/json

{
  "event": "presentation_created",
  "properties": {
    "model": "mcclaus-kinski",
    "slideCount": 8
  }
}
```

---

### Usage

#### Get Usage Stats
```http
GET /usage
Authorization: Bearer <token>
```

**Response:**
```json
{
  "tier": "free",
  "presentationsThisMonth": 3,
  "monthlyLimit": 5,
  "features": {
    "collaboration": false,
    "analytics": true,
    "exportFormats": ["pptx", "pdf"]
  }
}
```

---

## Error Responses

All endpoints may return errors in the following format:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Rate Limiting

API requests are rate-limited to:
- **Free tier:** 60 requests/minute
- **Pro tier:** 200 requests/minute
- **Business tier:** 500 requests/minute
- **Enterprise:** Unlimited

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1609459200
```

---

## WebSocket Events (Collaboration)

### Connection
```javascript
const socket = io('http://localhost:3001');

socket.emit('join-room', {
  presentationId: 'uuid',
  userId: 'uuid',
  userName: 'John Doe'
});
```

### Events

**Client → Server:**
- `join-room` - Join presentation room
- `leave-room` - Leave presentation room
- `update-slide` - Update slide content
- `cursor-update` - Update cursor position

**Server → Client:**
- `user-joined` - User joined room
- `user-left` - User left room
- `room-presence` - Current room presence
- `slide-updated` - Slide was updated by another user
- `cursor-position` - Cursor position from another user

---

## Examples

### Full Flow: Create and Save Presentation

```javascript
// 1. Register user
const registerRes = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    fullName: 'John Doe'
  })
});

// 2. Login
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await loginRes.json();

// 3. Create presentation
const createRes = await fetch('/api/presentations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My First Presentation'
  })
});
const { presentation } = await createRes.json();

// 4. Generate storyline
const generateRes = await fetch('/api/generate-storyline', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    baseText: 'Your content here',
    audience: 'Executives',
    goal: 'Inform',
    presentationModel: 'standard',
    aiProvider: 'gemini'
  })
});
const { storyline } = await generateRes.json();

// 5. Save slides
await fetch(`/api/presentations/${presentation.id}/slides`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ slides: storyline })
});
```

---

## SDKs

Coming soon:
- TypeScript/JavaScript SDK
- Python SDK
- React hooks

---

## Support

For API support, contact: api-support@ai-storyline.com

**Version:** 1.0  
**Last Updated:** January 2025

