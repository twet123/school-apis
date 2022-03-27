const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 8002;

app.use(express.json());
app.use("/static", express.static("public"));

const url = process.env.MONGO_URL;
mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

const User = require("./schemas/User");
const Reservation = require("./schemas/Reservation");
const Aranzman = require("./schemas/Aranzman");

function Login(user, password) {
  if (user.password == password) return true;
  return false;
}

function CheckAdmin(user) {
  return user.isAdmin;
}

app.get("/getAllUsers", (req, res) => {
  var username = req.query["username"];
  var password = req.query["password"];

  User.findOne({ username: username }, (error, user) => {
    if (error) res.status(500).send(error);
    else {
      if (user == null) res.status(401).send("Neovlasceni pristup.");
      else if (Login(user, password) && CheckAdmin(user)) {
        User.find({}, (error, users) => {
          if (error) res.status(500).send(error);
          else {
            res.status(200).json(users);
          }
        });
      } else res.status(401).send("Neovlasceni pristup.");
    }
  });
});

app.post("/login", (req, res) => {
  var username = req.body["username"];
  var password = req.body["password"];

  console.log(username, password);

  User.findOne({ username: username }, (error, user) => {
    if (error) res.status(500).send(error);
    else {
      if (Login(user, password))
        res.status(200).json({
          isAdmin: user.isAdmin,
        });
      else res.status(401).send("Neuspesna prijava.");
    }
  });
});

//Implementirati minimalno1 rutu koja prima parametar unutar tela URL-a
app.post("/register", (req, res) => {
  //console.log("usao");
  var username = req.body["username"];
  var password = req.body["password"];
  var age = req.body["age"];
  var isAdmin = req.body["isAdmin"];

  //console.log(username, password, age);

  let user;

  if (isAdmin) {
    user = new User({
      _id: new mongoose.Types.ObjectId(),
      username: username,
      password: password,
      age: age,
      isAdmin: isAdmin,
    });
  } else {
    user = new User({
      _id: new mongoose.Types.ObjectId(),
      username: username,
      password: password,
      age: age,
    });
  }

  user.save((error) => {
    if (error) res.status(500).send(error);
    else res.status(201).send("Uspesna registracija.");
  });
});

//Implementirati minimalno1  rutu  koja  prima  parametar  unutar  URL-a
app.put("/update", (req, res) => {
  var username = req.query["username"];
  var password = req.query["password"];
  var id = req.query.id;
  var age = req.body.age;

  User.findOne({ username: username }, (error, user) => {
    if (error) res.status(500).send(error);
    else {
      if (user == null) res.status(401).send("Neovlasceni pristup.");
      else if (Login(user, password) && CheckAdmin(user)) {
        User.updateOne({ _id: id }, { age: age }, (error) => {
          if (error) res.status(500).send(error);
          else {
            res.status(200).send("Uspesna izmena.");
          }
        });
      } else {
        res.status(401).send("Neovlasceni pristup.");
      }
    }
  });
});

//Implementirati minimalno1 rutu koja prima definisani parametar
app.delete("/user/:userid", (req, res) => {
  var username = req.query["username"];
  var password = req.query["password"];
  let idToDelete = req.params.userid;

  User.findOne({ username: username }, (error, user) => {
    if (error) res.status(500).send(error);
    else {
      if (user == null) res.status(401).send("Neovlasceni pristup.");
      else if (Login(user, password) && CheckAdmin(user)) {
        User.deleteOne({ _id: idToDelete }, (error) => {
          if (error) res.status(500).send(error);
          else {
            res.status(200).send("Uspesno obrisan.");
          }
        });
      } else res.status(401).send("Neovlasceni pristup.");
    }
  });
});

//Implementirati minimalno 1 rutu za preuzimanje slike
app.get("/download/:slika", function (req, res) {
  var slika = req.params.slika;
  res.download("./" + slika + ".jpg");
});

app.get("/getImage", function (req, res) {
  res.sendFile("./static/img.jpg");
});

app.get("/reservations", function (req, res) {
  var username = req.query["username"];
  var password = req.query["password"];

  User.findOne({ username: username }, (error, user) => {
    if (error) res.status(500).send(error);
    else {
      if (user == null) res.status(401).send("Neovlasceni pristup.");
      else if (Login(user, password) && CheckAdmin(user)) {
        Reservation.find({}, (error, reservations) => {
          if (error) res.status(500).send(error);
          else {
            res.status(200).json(reservations);
          }
        });
      } else res.status(401).send("Neovlasceni pristup.");
    }
  });
});

app.post("/reservations", (req, res) => {
  var username = req.query["username"];
  var aranzman = req.body["aranzman"];
  var date = req.body["date"];

  Aranzman.findOne({ name: aranzman }, (error, aranzmanObj) => {
    if (error) res.status(500).send(error);
    else if (aranzmanObj == null) res.status(500).send("Nepostojeci aranzman");
    else {
      let reservation = new Reservation({
        _id: new mongoose.Types.ObjectId(),
        username: username,
        aranzman: aranzman,
        date: date,
      });

      reservation.save((error) => {
        if (error) res.status(500).send(error);
        else res.status(201).send("Uspesna rezervacija");
      });
    }
  });
});

app.put("/reservations/:resid", (req, res) => {
  var username = req.query["username"];
  var password = req.query["password"];
  var resid = req.params.resid;

  var aranzman = req.body["aranzman"];
  var date = req.body["date"];

  User.findOne({ username: username }, (error, user) => {
    if (error) res.status(500).send(error);
    else {
      if (user == null) res.status(401).send("Neovlasceni pristup.");
      else if (Login(user, password) && CheckAdmin(user)) {
        Reservation.findById(resid, (error, reservation) => {
          if (error) res.status(500).send(error);
          else if (reservation == null) res.status(500).send("Rezervacija nije pronadjena.");
          else {
            reservation.set({
              aranzman: aranzman,
              date: date,
            });
            reservation.save((error) => {
              if (error) res.status(500).send(error);
              else res.status(200).send("Uspesna izmena.");
            });
          }
        });
      } else {
        res.status(401).send("Neovlasceni pristup.");
      }
    }
  });
});

app.delete("/reservations/:resid", (req, res) => {
  var username = req.query["username"];
  var password = req.query["password"];
  var idToDelete = req.params.resid;

  User.findOne({ username: username }, (error, user) => {
    if (error) res.status(500).send(error);
    else {
      if (user == null) res.status(401).send("Neovlasceni pristup.");
      else if (Login(user, password) && CheckAdmin(user)) {
        Reservation.deleteOne({ _id: idToDelete }, (error) => {
          if (error) res.status(500).send(error);
          else {
            res.status(200).send("Uspesno obrisan.");
          }
        });
      } else res.status(401).send("Neovlasceni pristup.");
    }
  });
});

app.get("/aranzmani", function (req, res) {
  var username = req.query["username"];
  var password = req.query["password"];

  User.findOne({ username: username }, (error, user) => {
    if (error) res.status(500).send(error);
    else {
      if (user == null) res.status(401).send("Neovlasceni pristup.");
      else if (Login(user, password)) {
        Aranzman.find({}, (error, aranzmans) => {
          if (error) res.status(500).send(error);
          else {
            res.status(200).json(aranzmans);
          }
        });
      } else res.status(401).send("Neovlasceni pristup.");
    }
  });
});

app.post("/aranzmani", (req, res) => {
  var username = req.query["username"];
  var password = req.query["password"];
  var name = req.body["name"];
  var price = req.body["price"];

  User.findOne({ username: username }, (error, user) => {
    if (error) res.status(500).send(error);
    else {
      if (user == null) res.status(401).send("Neovlasceni pristup.");
      else if (Login(user, password) && CheckAdmin(user)) {
        let aranzman = new Aranzman({
          _id: new mongoose.Types.ObjectId(),
          name: name,
          price: price,
        });

        console.log("usao");

        aranzman.save((error) => {
          if (error) res.status(500).send(error);
          else res.status(201).send("Uspesan unos.");
        });
      } else res.status(401).send("Neovlasceni pristup.");
    }
  });
});

app.put("/aranzmani/:araid", (req, res) => {
  var username = req.query["username"];
  var password = req.query["password"];
  var araid = req.params.araid;

  var name = req.body["name"];
  var price = req.body["price"];

  User.findOne({ username: username }, (error, user) => {
    if (error) res.status(500).send(error);
    else {
      if (user == null) res.status(401).send("Neovlasceni pristup.");
      else if (Login(user, password) && CheckAdmin(user)) {
        Aranzman.findById(araid, (error, aranzman) => {
          if (error) res.status(500).send(error);
          else if (aranzman == null) res.status(500).send("Aranzman nije pronadjen.");
          else {
            aranzman.set({
              name: name,
              price: price,
            });
            aranzman.save((error) => {
              if (error) res.status(500).send(error);
              else res.status(200).send("Uspesna izmena.");
            });
          }
        });
      } else {
        res.status(401).send("Neovlasceni pristup.");
      }
    }
  });
});

app.delete("/aranzmani/:araid", (req, res) => {
  var username = req.query["username"];
  var password = req.query["password"];
  let idToDelete = req.params.araid;

  User.findOne({ username: username }, (error, user) => {
    if (error) res.status(500).send(error);
    else {
      if (user == null) res.status(401).send("Neovlasceni pristup.");
      else if (Login(user, password) && CheckAdmin(user)) {
        console.log("usao");
        Aranzman.deleteOne({ _id: idToDelete }, (error) => {
          if (error) res.status(500).send(error);
          else {
            res.status(200).send("Uspesno obrisan.");
          }
        });
      } else res.status(401).send("Neovlasceni pristup.");
    }
  });
});

app.use(function (err, req, res, next) {
  var message = err.message;
  var error = err.error || err;
  var status = err.status || 500;

  res.status(status).json({
    message: message,
    error: error,
  });
});

app.listen(port);
console.log("Server radi na portu " + port);
