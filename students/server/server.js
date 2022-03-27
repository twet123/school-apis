const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());

const url = process.env.MONGO_URL;
mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });

const Ucenik = require("./schemas/Ucenik");
const Nastavnik = require("./schemas/Nastavnik");
const Ocena = require("./schemas/Ocena");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

//
app.get("/ucenici", (req, res, next) => {
  let nastavnikUsername = req.query.username;
  let nastavnikPassword = req.query.password;

  Nastavnik.findOne({ username: nastavnikUsername, password: nastavnikPassword }, (error, nastavnik) => {
    if (error) next(error);
    else if (nastavnik) {
      Ucenik.find({}, (error, ucenici) => {
        if (error) next(error);
        res.status(200).json(ucenici);
      });
    } else {
      res.status(401).send("Nemate pristup.");
    }
  });
});

//
app.post("/ucenici", (req, res, next) => {
  const ucenik = new Ucenik(req.body);
  ucenik.save((error) => {
    if (error) next(error);
    else res.status(201).json(ucenik);
  });
});

//
app.put("/ucenici/:ucenikid", (req, res, next) => {
  let nastavnikUsername = req.query.username;
  let nastavnikPassword = req.query.password;
  let ucenikid = req.params.ucenikid;

  Nastavnik.findOne({ username: nastavnikUsername, password: nastavnikPassword }, (error, nastavnik) => {
    if (error) next(error);
    else if (nastavnik) {
      Ucenik.findById(ucenikid, (error, ucenik) => {
        if (error) next(error);
        ucenik.set(req.body);
        ucenik.save((error) => {
          if (error) next(error);
          else res.status(201).json(ucenik);
        });
      });
    } else {
      res.status(401).send("Nemate pristup.");
    }
  });
});

//
app.delete("/ucenici/:ucenikid", (req, res, next) => {
  let nastavnikUsername = req.query.username;
  let nastavnikPassword = req.query.password;
  let ucenikid = req.params.ucenikid;

  Nastavnik.findOne({ username: nastavnikUsername, password: nastavnikPassword }, (error, nastavnik) => {
    if (error) next(error);
    else if (nastavnik) {
      Ucenik.deleteOne({ _id: ucenikid }, (error) => {
        if (error) next(error);
        else res.status(200).send("Uspesno brisanje.");
      });
    } else {
      res.status(401).send("Nemate pristup.");
    }
  });
});

//
app.post("/login", (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;

  Nastavnik.findOne({ username: username, password: password }, (error, nastavnik) => {
    if (error) next(error);
    else if (nastavnik) res.status(200).json({ nastavnik: true, predmet: nastavnik.predmet, ime: nastavnik.ime, prezime: nastavnik.prezime });
    else {
      Ucenik.findOne({ username: username, password: password }, (error, ucenik) => {
        if (error) next(error);
        else if (ucenik) res.status(200).json({ nastavnik: false, ime: ucenik.ime, prezime: ucenik.prezime });
        else res.status(401).send("Netacni podaci.");
      });
    }
  });
});

//
app.post("/nastavnici", (req, res, next) => {
  let password = req.query.password;
  if (password == "d0d4jn4st4vn1k4") {
    const nastavnik = new Nastavnik(req.body);
    nastavnik.save((error) => {
      if (error) next(error);
      else res.status(201).json(nastavnik);
    });
  } else {
    res.status(401).send();
  }
});

//treba
app.get("/nastavnici", (req, res, next) => {
  let password = req.query.password;
  if (password == "n4st4vn1c1") {
    Nastavnik.find({}, (error, nastavnici) => {
      if (error) next(error);
      else res.status(200).json(nastavnici);
    });
  } else {
    res.status(401).send();
  }
});

//treba
app.delete("/nastavnik/:nastavnikid", (req, res, next) => {
  let password = req.query.password;
  let nastavnikid = req.params.nastavnikid;
  if (password == "0br1s1n4st4vn1k4") {
    Nastavnik.deleteOne({ _id: nastavnikid }, (error) => {
      if (error) next(error);
      else res.status(200).send("Uspesno obrisan.");
    });
  } else {
    res.status(401).send();
  }
});

//
app.put("/ocena/:ucenikid", (req, res, next) => {
  let nastavnikUsername = req.query.username;
  let nastavnikPassword = req.query.password;
  let ocena = req.body.ocena;
  let predmet = req.body.predmet;
  let ucenikid = req.params.ucenikid;

  const ocenaObj = new Ocena({
    ocena: ocena,
    predmet: predmet,
  });

  Nastavnik.findOne({ username: nastavnikUsername, password: nastavnikPassword }, (error, nastavnik) => {
    if (error) next(error);
    else if (nastavnik) {
      Ucenik.findById(ucenikid, (error, ucenik) => {
        if (error) next(error);
        else if (ucenik) {
          //console.log(ocenaObj);
          ucenik.ocene.push(ocenaObj);
          //console.log(ucenik.ocene);
          ucenik.markModified("ocene");
          ucenik.save((error) => {
            if (error) next(error);
            else res.status(200).json(ucenik);
          });
        } else res.status(500).send("Netacni podaci.");
      });
    } else {
      res.status(500).send("Netacni podaci.");
    }
  });
});

//
app.delete("/ocena/:ucenikid/:ocenaid", (req, res, next) => {
  let nastavnikUsername = req.query.username;
  let nastavnikPassword = req.query.password;
  let ucenikid = req.params.ucenikid;
  let ocenaid = req.params.ocenaid;

  Nastavnik.findOne({ username: nastavnikUsername, password: nastavnikPassword }, (error, nastavnik) => {
    if (error) next(error);
    else if (nastavnik) {
      Ucenik.findById(ucenikid, (error, ucenik) => {
        if (error) next(error);
        else if (ucenik) {
          //console.log(ocenaid);
          ucenik.ocene = ucenik.ocene.filter((ocena) => ocena._id != ocenaid);
          //console.log(ucenik.ocene);
          ucenik.markModified("ocene");
          ucenik.save((error) => {
            if (error) next(error);
            else res.status(200).json(ucenik);
          });
        } else res.status(500).send("Netacni podaci.");
      });
    } else {
      res.status(500).send("Netacni podaci.");
    }
  });
});

app.get("/ocena", (req, res, next) => {
  let ucenikUsername = req.query.username;
  let ucenikPassword = req.query.password;

  Ucenik.findOne({ username: ucenikUsername, password: ucenikPassword }, (error, ucenik) => {
    if (error) next(error);
    else if (ucenik) {
      res.status(200).json(ucenik.ocene);
    } else {
      res.status(500).send("Netacni podaci.");
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

app.listen(8080);
console.log("Server radi na portu " + 8080);
