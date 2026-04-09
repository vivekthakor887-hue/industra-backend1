
const express = require("express");
const cookieParser = require('cookie-parser');
const session = require("express-session");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const path=require('path')

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 
app.set('view engine', 'ejs');
// Set views directory
app.set('views', path.join(__dirname, 'views')); 

// Serve static files (assets)
app.use(express.static(path.join(__dirname, 'assets')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- Simple Session Setup (no MongoStore) ---
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
  },
}));
// Routes
const userRoutes = require("./routes/dashboardroutes");
app.use('/api', require('./routes/authroutes'));
app.use("/", userRoutes);

// Start server
const port = process.env.PORT;
app.listen(port, () => console.log(`Server running on port http://localhost:${port}`));
 
