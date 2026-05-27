# Smart Parking Spot Rental Platform

A full-stack web application that enables apartment owners to rent unused parking spaces to other users.

## Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with role-based access (Owner, Renter, Admin)
- **Parking Spot Listing**: Owners can list their parking spots with detailed information
- **Advanced Search & Filters**: Renters can search by city, spot type, and price range
- **Booking Management**: Users can book parking spots with flexible duration options (hourly, daily, monthly)
- **Availability Tracking**: Real-time availability status for each parking spot
- **Review & Rating System**: Users can rate and review parking spots
- **User Profiles**: Manage personal information and booking history

### Technical Features
- **REST API**: Comprehensive API with proper error handling
- **MongoDB Database**: Scalable NoSQL database for data persistence
- **JWT Authentication**: Secure token-based authentication
- **React Frontend**: Modern, responsive user interface
- **Node.js/Express Backend**: Scalable backend architecture

## Project Structure

```
smart-parking-platform/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── ParkingSpot.js
│   │   │   └── Booking.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── parkingSpotRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── parkingSpotController.js
│   │   │   └── bookingController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── config/
│   │       └── database.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navigation.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── ParkingSpots.js
│   │   │   ├── MyBookings.js
│   │   │   └── Profile.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── .env
│   └── package.json
└── README.md
```

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd smart-parking-platform/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://lokesh:sree2218@urbanspotcluster.1pnivut.mongodb.net/?appName=UrbanSpotCluster
JWT_SECRET=lokesh_super_secure_parking_app_2026
JWT_EXPIRE=7d
```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd smart-parking-platform/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure API URL in `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Parking Spots
- `GET /api/parking-spots` - Get all parking spots
- `GET /api/parking-spots/:id` - Get parking spot details
- `POST /api/parking-spots` - Create new parking spot (Owner only)
- `PUT /api/parking-spots/:id` - Update parking spot (Owner only)
- `DELETE /api/parking-spots/:id` - Delete parking spot (Owner only)
- `POST /api/parking-spots/:id/review` - Add review to parking spot

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `POST /api/bookings/:id/cancel` - Cancel booking

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: enum ['owner', 'renter', 'admin'],
  profileImage: String,
  isActive: Boolean,
  timestamps: true
}
```

### ParkingSpot Model
```javascript
{
  ownerId: ObjectId (ref: User),
  location: {
    address: String,
    city: String,
    zipCode: String,
    coordinates: { latitude, longitude }
  },
  spotType: enum ['covered', 'open', 'garage'],
  pricePerHour: Number,
  pricePerDay: Number,
  pricePerMonth: Number,
  isAvailable: Boolean,
  amenities: [String],
  rating: Number,
  reviews: [{ userId, rating, comment, createdAt }],
  timestamps: true
}
```

### Booking Model
```javascript
{
  userId: ObjectId (ref: User),
  spotId: ObjectId (ref: ParkingSpot),
  startTime: Date,
  endTime: Date,
  duration: Number,
  totalPrice: Number,
  status: enum ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
  vehicleInfo: { licensePlate, vehicleType, color },
  timestamps: true
}
```

## Security Features

- **Password Hashing**: Using bcryptjs for secure password storage
- **JWT Tokens**: Token-based authentication with expiration
- **CORS**: Cross-Origin Resource Sharing configuration
- **Input Validation**: Request validation on both client and server
- **Authorization Middleware**: Role-based access control

## Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Real-time availability updates using WebSockets
- [ ] Google Maps integration
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Advanced analytics and reporting
- [ ] Dispute resolution system
- [ ] Insurance integration

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM
- JWT (jsonwebtoken)
- bcryptjs
- dotenv
- CORS

### Frontend
- React
- React Router
- Axios
- Google Map React

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://lokesh:sree2218@urbanspotcluster.1pnivut.mongodb.net/?appName=UrbanSpotCluster
JWT_SECRET=lokesh_super_secure_parking_app_2026
JWT_EXPIRE=7d
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Testing

### Testing Backend API
You can test the API using Postman or cURL. Import the API endpoints listed above and test with sample data.

Example cURL request:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MONGO_URI in .env file
   - Ensure MongoDB Atlas cluster is accessible
   - Check firewall/network settings

2. **CORS Error**
   - Verify CORS configuration in backend
   - Check that frontend and backend URLs match

3. **Token Not Persisting**
   - Clear browser localStorage
   - Verify token is being saved after login

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue on GitHub.

## Author

Developed as a full-stack project to solve real-world urban parking challenges.

---

**⚠️ SECURITY WARNING**: 
- Never commit `.env` files with real credentials
- Rotate MongoDB URI and JWT Secret regularly
- Use environment variables for sensitive data in production
- Enable network restrictions on MongoDB Atlas

