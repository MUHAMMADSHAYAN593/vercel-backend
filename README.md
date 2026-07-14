# Vercel Backend

A serverless backend application designed to be deployed on Vercel. Provides API endpoints for frontend applications with support for database operations, authentication, and business logic.

## Features

- 🚀 **Serverless Architecture** - Deploy on Vercel without server management
- 📡 **RESTful API** - Well-structured API endpoints
- 🔐 **Authentication** - JWT-based user authentication
- 💾 **Database Integration** - MongoDB/PostgreSQL support
- 🔄 **API Rate Limiting** - Prevent abuse and manage traffic
- 📝 **API Documentation** - Comprehensive endpoint documentation
- ⚡ **Performance Optimized** - Fast serverless functions
- 🛡️ **Security** - Environment variable protection, CORS handling
- 📊 **Error Handling** - Consistent error responses
- 🔔 **Webhooks** - Support for incoming webhooks

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Vercel Functions** - Serverless deployment
- **MongoDB/PostgreSQL** - Database
- **JWT** - Authentication
- **Axios** - HTTP client

## Installation

1. Clone the repository
```bash
git clone https://github.com/MUHAMMADSHAYAN593/vercel-backend.git
cd vercel-backend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env.local` file
```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
API_PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

4. Start development server
```bash
vercel dev
```

Or with Node.js:
```bash
npm start
```

## Project Structure

```
vercel-backend/
├── api/
│   ├── auth/
│   │   ├── login.js
│   │   ├── register.js
│   │   └── verify.js
│   ├── users/
│   │   ├── [id].js
│   │   └── profile.js
│   ├── data/
│   │   ├── create.js
│   │   ├── get.js
│   │   └── delete.js
│   └── middleware/
│       ├── auth.js
│       └── errorHandler.js
├── lib/
│   ├── database.js
│   ├── jwt.js
│   └── validators.js
├── .env.local
├── vercel.json
└── package.json
```

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
```
Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```
POST /api/auth/login
```
Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Verify Token
```
GET /api/auth/verify
Headers: Authorization: Bearer jwt_token
```

### User Operations

#### Get User Profile
```
GET /api/users/profile
Headers: Authorization: Bearer jwt_token
```

#### Update User Profile
```
PUT /api/users/profile
Headers: Authorization: Bearer jwt_token
Body:
```json
{
  "name": "Updated Name",
  "bio": "User bio"
}
```

#### Get User by ID
```
GET /api/users/[id]
```

### Data Operations

#### Create Data
```
POST /api/data/create
Headers: Authorization: Bearer jwt_token
Body:
```json
{
  "title": "Data Title",
  "content": "Data Content"
}
```

#### Get Data
```
GET /api/data/get?id=data_id
```

#### Delete Data
```
DELETE /api/data/delete/[id]
Headers: Authorization: Bearer jwt_token
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
```bash
git push origin main
```

2. Connect repository to Vercel
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Configure environment variables

3. Deploy
```bash
vercel --prod
```

### Manual Deployment

```bash
vercel --prod
```

## Environment Variables

Create `.env.local` file with:

```env
# Database
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/dbname
POSTGRES_URL=postgresql://user:password@localhost/dbname

# Authentication
JWT_SECRET=your_secure_jwt_secret_key

# Server
API_PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN=https://yourdomain.com

# API Keys
STRIPE_KEY=your_stripe_key
SENDGRID_KEY=your_sendgrid_key
```

## Middleware

### Authentication Middleware
```javascript
// Protects routes that require authentication
const { verifyToken } = require('../lib/jwt');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Error Handler
```javascript
// Central error handling
const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
};
```

## Database Connection

### MongoDB
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Connection error:', err);
  }
};
```

### PostgreSQL
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});
```

## Rate Limiting

Enable rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

## Testing

### Using cURL

Test login endpoint:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Using Postman

1. Import API endpoints
2. Set up environment variables
3. Test endpoints with different methods

## Performance Tips

- Use database indexes
- Implement caching
- Optimize queries
- Use middleware efficiently
- Monitor function execution time

## Security Best Practices

- Never commit `.env.local` to git
- Use HTTPS in production
- Validate all inputs
- Sanitize user data
- Use strong JWT secrets
- Implement CORS properly
- Rate limit endpoints

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Improvements

- [ ] Add GraphQL support
- [ ] Implement caching layer
- [ ] Add API versioning
- [ ] Create webhook system
- [ ] Add batch operations
- [ ] Implement pagination

## Troubleshooting

### Connection Timeout
- Check DATABASE_URL is correct
- Verify database is running
- Check network connectivity

### JWT Errors
- Verify JWT_SECRET is set
- Check token expiration
- Validate token format

## License

This project is open source and available under the MIT License.

## Contact

For questions or support, please contact: [Your Email/Contact]
