require("dotenv").config();

const express = require("express");
const cors = require("cors");

const usersRoute = require("./routes/usersRoute");

const port = process.env.PORT ?? 8080;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/", usersRoute);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
