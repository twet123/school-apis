const express = require("express");
const app = express();
const basicauth = require("express-basic-auth");

app.use(express.json());

var users = [
  {
    id: 0,
    username: "admin",
    password: "admin",
    stanje: 3000,
  },
  {
    id: 1,
    username: "gost",
    password: "gost",
    stanje: 5000,
  },
];

app.get("/user/:userid", basicauth({ users: { admin: "admin", gost: "gost" } }), (req, res) => {
  var userid = req.params.userid;
  var user = null;

  for (var i = 0; i < users.length; i++) {
    if (users[i].id == userid) {
      user = users[i];
    }
  }

  if (user) res.status(200).json(user);
  else res.status(400).send("Korisnik nije pronadjen.");
});

app.get("/user", basicauth({ users: { admin: "admin", gost: "gost" } }), (req, res) => {
  res.send(req.query.userID);
});

app.post("/login", basicauth({ users: { admin: "admin", gost: "gost" } }), (req, res) => {
  res.status(200).send("Uspesno ste se prijavili!");
});

app.post("/register", (req, res) => {
  if (!req.body.username || !req.body.password) res.status(400).send("Podaci nisu uneseni.");

  res.status(201).send("Uspesno ste se registrovali!");
});

app.get("/users", basicauth({ users: { admin: "admin" } }), (req, res) => {
  res.status(200).send(users);
});

app.put("/updateUser", basicauth({ users: { admin: "admin", gost: "gost" } }), (req, res) => {
  if (!req.body.username || !req.body.password) res.status(400).send("Podaci nisu uneseni.");

  var username = req.body.username;
  var password = req.body.password;
  var usao = false;

  for (var i = 0; i < users.length; i++) {
    if (users[i].username === username && users[i].password === password) users[i].stanje += 1000;
    usao = true;
  }

  if (usao) res.status(200).send("Korisnik je azuriran!");
  else res.status(400).send("Korisnik nije pronadjen.");
});

app.delete("/user/:userid", basicauth({ users: { admin: "admin" } }), (req, res) => {
  var userid = req.params.userid;
  var deleted = false;

  for (var i = 0; i < users.length; i++) {
    if (users[i].id == userid) {
      users.splice(i, 1);
      deleted = true;
    }
  }

  if (deleted) res.status(200).send("Korisnik je uspesno obrisan.");
  else res.status(400).send("Korisnik nije pronadjen.");
});

app.get("/getImage", basicauth({ users: { admin: "admin", gost: "gost" } }), (req, res) => {
  res.sendFile("");
});
app.get("/download", basicauth({ users: { admin: "admin", gost: "gost" } }), (req, res) => {
  res.download("");
});

app.listen(8004, () => {
  console.log("Listening on port 8004");
});
