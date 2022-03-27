const express = require("express");
const bodyParser = require("body-parser");
const basicAuth = require("express-basic-auth");

const app = express();
const users = [
  {
    id: 0,
    username: "admin",
    password: "admin",
    email: "admin@admin.com",
    isAdmin: true,
  },
  {
    id: 1,
    username: "guest",
    password: "guest",
    email: "guest@guest.com",
    isAdmin: false,
  },
];
const products = [
  { id: 0, name: "Pavlaka", price: 120 },
  { id: 1, name: "Lenor", price: 500 },
  { id: 2, name: "Plazma", price: 200 },
];

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function checkLogin(username, password) {
  let check = false;
  users.forEach((element) => {
    if (basicAuth.safeCompare(username, element.username) && basicAuth.safeCompare(password, element.password)) {
      check = true;
      return;
    }
  });

  return check;
}

function checkAdminLogin(username, password) {
  let check = false;
  users.forEach((element) => {
    if (basicAuth.safeCompare(username, element.username) && basicAuth.safeCompare(password, element.password)) {
      check = element.isAdmin;
      return;
    }
  });

  return check;
}

function nextId() {
  let id = 0;
  users.forEach((element) => {
    id = element.id + 1;
  });

  return id;
}

function getUnauthorizedResponse(req) {
  return req.auth ? { message: "Auth failed." } : { message: "Bad parameters." };
}

app.use(bodyParser.json());

app.post("/register", (req, res, next) => {
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;

  if (!validateEmail(email) || !username || !password) {
    res.status(400).json({
      err: "Bad parameters",
    });
  } else {
    let id = nextId();
    users.push({
      id: id,
      username: username,
      password: password,
      email: email,
      isAdmin: false,
    });

    res.status(200).json({
      id: id,
      message: "Successful registration!",
    });
  }
});

app.post("/login", basicAuth({ authorizer: checkLogin, unauthorizedResponse: getUnauthorizedResponse }), (req, res, next) => {
  res.status(200).json({
    message: "Login successful!",
  });
});

app.get("/users", basicAuth({ authorizer: checkAdminLogin, unauthorizedResponse: getUnauthorizedResponse }), (req, res, next) => {
  res.status(200).json(users);
});

app.put("/users", basicAuth({ authorizer: checkLogin, unauthorizedResponse: getUnauthorizedResponse }), (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  let newPassword = req.body.newPassword;
  let newEmail = req.body.newEmail;
  let newUsername = req.body.newUsername;

  if (!checkLogin(username, password)) {
    res.status(401).json({
      err: "Unauthorized",
    });
  } else {
    users.forEach((part, index, array) => {
      if (array[index].username == username && array[index].password == password) {
        if (newPassword) array[index].password = newPassword;
        if (newEmail && validateEmail(newEmail)) array[index].email = newEmail;
        if (newUsername) array[index].username = newUsername;
      }
    });
  }
  res.status(200).json({
    message: "User updated!",
  });
});

app.delete("/users/:userid", basicAuth({ authorizer: checkAdminLogin, unauthorizedResponse: getUnauthorizedResponse }), (req, res, next) => {
  let userid = req.params.userid;
  let found = false;

  users.forEach((part, index, array) => {
    if (array[index].id == userid) {
      array.splice(index, 1);
      found = true;
      return;
    }
  });
  if (found) {
    res.status(200).json({
      message: "User successfully deleted",
    });
  } else {
    res.status(400).json({
      err: "User with id " + userid + " does not exist.",
    });
  }
});

app.get("/products", basicAuth({ authorizer: checkLogin, unauthorizedResponse: getUnauthorizedResponse }), (req, res, next) => {
  let maxPrice = req.query.maxPrice;
  let result = [];

  if (!maxPrice) maxPrice = 100000;

  products.forEach((element) => {
    if (element.price <= maxPrice) result.push(element);
  });

  res.status(200).json(result);
});

app.get("/image/:fileName/download", basicAuth({ authorizer: checkLogin, unauthorizedResponse: getUnauthorizedResponse }), (req, res, next) => {
  let fileName = req.params.fileName;

  res.download("../img/" + fileName, (error) => {
    if (error) {
      res.status(400).json(error);
    }
  });
});

app.use("/image", basicAuth({ authorizer: checkLogin, unauthorizedResponse: getUnauthorizedResponse }), express.static("../img"));

app.listen(8017, () => {
  console.log("Listening on port 8017.");
});
