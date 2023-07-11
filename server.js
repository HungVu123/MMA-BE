const app = require("./app");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const connectDatabase = require("./config/database");
const socket = require("socket.io");

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.error(`Error:${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

//Config
dotenv.config({ path: "./config/config.env" });

//Connect to database
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("add-user", (userId) => {
    socket.join(userId);
  });

  socket.on("send-msg", (data) => {
    socket.to(data.to).emit("msg-recieve", data.msg);
  });
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandle Promise Rejection`);
  server.close(() => {
    process.exit(1);
  });
});
