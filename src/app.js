import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import session from 'express-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import mongoose from 'mongoose';
import { User } from './models/User.model.js';

const app = express();


app.use(
    cors({
      origin: 'http://localhost:3000', 
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookies', 'Cookie'],
      exposedHeaders: ['Set-Cookie'],
      credentials: true,
    }),
  );

// Handle preflight requests
app.options('*', cors());

app.get('/', (req, res) => {
  return res.send('Welcome to taskmanagement service');
});

// Session configuration
// app.use(
//   session({
//     secret: process.env.SECRET_KEY ,
//     resave: false,
//     saveUninitialized: true,
//   }),
// );

// // Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());

// // Google OAuth Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.OAUTH_CLIENT_ID,
//       clientSecret: process.env.OAUTH_CLIENT_SECRET,
//       callbackURL: '/auth/google/callback',
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Checking if a user already exists with the same email from Google
//         let user = await User.findOne({ email: profile.emails[0].value });

//         if (user) {
//           // If user exists but doesn't have a googleId, adding it
//           if (!user.googleId) {
//             user.googleId = profile.id;
//             await user.save();
//           }
//         } else {
//           // If the user doesn't exist, creating a new one with googleId
//           user = await User.create({
//             googleId: profile.id,
//             name: profile.displayName,
//             email: profile.emails[0].value,
//           });
//         }
//         return done(null, user);
//       } catch (error) {
//         return done(error, null);
//       }
//     },
//   ),
// );

// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser(async (id, done) => {
//   const user = await User.findById(id);
//   done(null, user);
// });

app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(cookieParser());

import userRouter from './routes/User.route.js';
import boardRouter from './routes/Board.route.js';
import taskcardRouter from './routes/Taskcard.route.js';
import authRoutes from "./routes/Auth.route.js";

app.use('/api/user', userRouter);
app.use('/api/board', boardRouter);
app.use('/api/taskcard', taskcardRouter);
app.use('/auth',authRoutes)

export { app };
