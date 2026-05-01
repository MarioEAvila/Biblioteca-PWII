const mongoose = require("mongoose");

async function connectDb() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI no esta configurada en .env");
  }

  mongoose.connection.on("connected", () => {
    console.log("MongoDB conectado");
  });

  mongoose.connection.on("error", (err) => {
    console.error("Error de conexion MongoDB:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB desconectado");
  });

  await mongoose.connect(uri);
}

module.exports = { connectDb };
