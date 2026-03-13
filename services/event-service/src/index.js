const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDb = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");

dotenv.config();

const app = express();
const port = Number(process.env.EVENT_SERVICE_PORT || 4002);

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ service: "event-service", status: "ok" });
});

app.use("/api/events", eventRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: error.message || "Unexpected server error" });
});

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Event service running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Event service failed to start", error);
    process.exit(1);
  });
