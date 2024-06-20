const knex = require("knex")(require("../knexfile"));
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const encripted = bcrypt.hashSync(password);

  try {
    await knex("users").insert({ username, password: encripted });
    res.status(201).json({ success: true });
  } catch (e) {
    console.log(e.code);
    switch (e.code) {
      case "ER_DUP_ENTRY":
        res.status(400).send("username exists");
        break;
      case "ER_DATA_TOO_LONG":
        res.status(400).send("username too long (max 20 characters)");
        break;
      default:
        res.status(500).send("unable to create user");
    }
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await knex("users").where({ username }).first();

    if (!user) {
      return res.status(400).send("user or password incorrect");
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).send("user or password incorrect");
    }

    const token = jwt.sign({ username: user.username }, process.env.SECRET);
    res.json({ token });
  } catch (e) {
    res.status(401).send("login failed");
  }
});

router.get("/profile", authorize, (req, res) => {
  res.json(req.user);
});

async function authorize(req, res, next) {
  const { authorization } = req.headers;

  const token = authorization.split(" ")[1];

  try {
    const { username } = jwt.verify(token.process.env.SECRET);

    const user = await knex("users")
      .select("id", "username", "email", "avatar")
      .where({ username })
      .first();
    req.user = user;

    next();
  } catch (e) {
    res.status(400).json({ error: e });
  }
}

module.exports = router;
