const knex = require("knex")(require("../knexfile"));
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, email, password, avatar } = req.body;

  const encrypted = bcrypt.hashSync(password);

  try {
    await knex("users").insert({
      username,
      email,
      password: encrypted,
      avatar,
    });
    res.status(201).json({ success: true });
  } catch (e) {
    console.log(e.code);
    switch (e.code) {
      case "ER_DUP_ENTRY":
        res.status(400).send("username or email already exists");
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
  const { email, password } = req.body;

  try {
    const user = await knex("users").where({ email }).first();

    if (!user) {
      return res.status(400).send("email or password incorrect");
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).send("email or password incorrect");
    }

    const token = jwt.sign({ email: user.email }, process.env.SECRET);
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
    const { email } = jwt.verify(token.process.env.SECRET);

    const user = await knex("users")
      .select("id", "username", "email", "avatar")
      .where({ email })
      .first();
    req.user = user;

    next();
  } catch (e) {
    res.status(400).json({ error: e });
  }
}

module.exports = router;
