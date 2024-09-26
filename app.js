require("dotenv").config();
const express = require("express");
const path = require('path');
const cors = require("cors");
const dbConnect = require('./config/mongo')
const cookieParser = require('cookie-parser')
const morgan = require("morgan");

const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//Esto es para el html


app.use(express.static(path.join(__dirname, 'public')));


app.use('/media', express.static(path.join(__dirname, 'media')));

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

// Invocar rutas
app.use("/api", require("./routes"));
const indexRoutes = require('./routes/pdf');
app.use (indexRoutes)

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

module.exports = app;
dbConnect();