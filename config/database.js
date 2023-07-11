//DB_URI = "mongodb://127.0.0.1/Ecommerce"
const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose.connect(process.env.DB_URI).then((data) => {
    console.log(`Mongodb connected with server ${data.connection.host}`);
  });
};

module.exports = connectDatabase;
