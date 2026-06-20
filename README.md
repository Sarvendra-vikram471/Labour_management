# Labour Management System

A full-stack web app for booking labour services. Customers can search and book workers, contractors can manage worker profiles, and payments are handled through Razorpay.

## Tech Stack

- Frontend: React, React Router, Axios
- Backend: Node.js, Express.js, MongoDB
- Auth: JWT
- Payments: Razorpay

## Main Features

- User registration and login
- Customer, contractor, and admin roles
- Worker search and filtering
- Worker profiles with ratings and reviews
- Booking management
- Razorpay payment integration


## Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/labour_management
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NODE_ENV=development
```

Backend runs at `http://localhost:5000`.

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Create `frontend/.env` if needed:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Frontend runs at `http://localhost:3000`.

## Build

```bash
cd frontend
npm run build
```

## License

MIT
