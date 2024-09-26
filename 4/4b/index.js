const express = require("express");
const app = express();
const port = 5000;
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("cookie-session");
const flash = require("express-flash");
const { Sequelize, DataTypes, Op, QueryTypes } = require("sequelize");
const config = require("./config/config.json");
const sequelize = new Sequelize(config.development);

const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

require("dotenv").config();

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./views"));

app.use("/assets", express.static(path.join(__dirname, "./assets")));
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
app.use(express.urlencoded({ extended: false }));
const hbs = require("hbs");
app.use(
  session({
    name: "my-session",
    secret: "ewVsqWOyeb",
    saveUninitialized: true,
    rolling: true,
    resave: false,
    proxy: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: false,
      secure: false,
      sameSite: "None",
    },
  })
);
app.use(flash());

app.get("/", collection);
app.get("/add-collection", addCollectionView);
app.post("/add-collection", addCollection);
app.post("/add-task", addTask);
app.get("/delete-collection/:id", deleteCollection);
app.get("/edit-collection/:id", editCollectionView);
app.get(
  "/edit-task/:id/collection_id/:collection_id",
  editTask
);
app.post(
  "/edit-collection",
  editCollection
);
app.get("/collection-detail/:id", collectionDetail);

app.get("/login", loginView);
app.get("/register", registerView);

app.post("/register", register);
app.post("/login", login);
app.get("/logout", logout);
app.engine("html", require("hbs").__express);

hbs.registerHelper("includes", function (array, value, options) {
  if (array.includes(value)) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

hbs.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});

function loginView(req, res) {
  res.render("login");
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const query = `SELECT * FROM public.users_tb WHERE email = '${email}';`;

    const user = await sequelize.query(query, { type: QueryTypes.SELECT });

    if (!user) {
      req.flash("error", "Email / password salah!");
      return res.redirect("/login");
    }

    const isValidPassword = await bcrypt.compare(password, user[0].password);

    if (!isValidPassword) {
      req.flash("error", "Email / password salah!");
      return res.redirect("/login");
    }

    req.session.user = user;

    req.flash("success", "Login berhasil!");

    res.redirect("/");
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong!");
    res.redirect("/");
  }
}

function registerView(req, res) {
  res.render("register");
}

function logout(req, res) {
  req.session = null;
  res.redirect("/");
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `INSERT INTO public.users_tb(
	username, email, password)
	VALUES ('${name}', '${email}', '${hashedPassword}');`;
    const result = await sequelize.query(query, { type: QueryTypes.INSERT });

    req.flash("success", "Register berhasil!");
    res.redirect("/register");
  } catch (error) {
    req.flash("error", "Register gagal!");
    res.redirect("/register");
    console.log(error);
  }
}


async function collection(req, res) {
  const user = req.session.user;
  
  if(!user) {
    return res.redirect("/login");
  }

  
  
  const query = `SELECT * FROM public.collections_tb WHERE user_id = '${user[0]?.id}'`;
  const result = await sequelize.query(query, { type: QueryTypes.SELECT });

  // const queryTask = `SELECT * FROM public.task_tb WHERE collections_id = '${id}'`;

  // const resultTask = await sequelize.query(queryTask, { type: QueryTypes.SELECT });

  res.render("index", {
    data: result,
    user,
  });
}


async function deleteCollection(req, res) {
  const { id} = req.params;

 const query = `DELETE FROM public.collections_tb
	WHERE id = ${id};`;
  const result = await sequelize.query(query, { type: QueryTypes.DELETE });

  if (!result) return res.render("not-found");

  res.redirect("/");
}

async function addCollection(req, res) {
  const user = req.session.user;
  const { collectionName } = req.body;

  console.log(collectionName);

  if (!user) {
    return res.redirect("/login");
  }

  try {


    const query = `INSERT INTO public.collections_tb(name, user_id )
      VALUES ('${collectionName}', '${user[0].id}' );`;
    const result = await sequelize.query(query, { type: QueryTypes.INSERT });
    console.log("isi result", result);

    req.flash("success", "Input collection success");

    res.redirect("/");
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}

async function addTask(req, res) {
  const user = req.session.user;
  const { taskName, collections_id } = req.body;

  if (!user) {
    return res.redirect("/login");
  }

  try {

    const query = `INSERT INTO public.task_tb(name, is_done, collections_id )
      VALUES ('${taskName}', false, '${collections_id}' );`;
    const result = await sequelize.query(query, { type: QueryTypes.INSERT });

    req.flash("success", "Input task success");

    res.redirect("/collection-detail/" + collections_id);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}

async function editCollectionView(req, res) {
  const { id } = req.params;
  const user = req.session.user;

  const query = `SELECT * FROM public.collections_tb WHERE id = ${id}`;
  const result = await sequelize.query(query, { type: QueryTypes.SELECT });
  if (!user) {
    return res.redirect("/login");
  }

  if (!result) return res.render("not-found");
  res.render("edit-collection", {
    data: result[0],
    user,
  });

  if (!user) {
    return res.redirect("/login");
  }
}


function addCollectionView(req, res) {
  const user = req.session.user;
  res.render("collection", { user });
}


async function collectionDetail(req, res) {
  const user = req.session.user;
  const { id } = req.params;
  const queryCollection = `SELECT * FROM public.collections_tb WHERE id = '${id}'`;
  const result2 = await sequelize.query(queryCollection, { type: QueryTypes.SELECT });

  const query = `SELECT * FROM public.task_tb WHERE collections_id = '${id}'`;

  const result = await sequelize.query(query, { type: QueryTypes.SELECT });

  const queryIsDoneTrue = `SELECT * FROM public.task_tb WHERE is_done = true AND collections_id = '${id}'`;

  const resultIsDoneTrue = await sequelize.query(queryIsDoneTrue, { type: QueryTypes.SELECT });

  const queryIsDoneFalse = `SELECT * FROM public.task_tb WHERE is_done = false AND collections_id = '${id}'`;

  const resultIsDoneFalse = await sequelize.query(queryIsDoneFalse, { type: QueryTypes.SELECT });
  console.log(resultIsDoneTrue);

  if (!result) return res.render("not-found");
  res.render("collection-detail", {
    data: result,
    collection: result2[0],
    user: user[0],
    dataIsDoneTrue: resultIsDoneTrue,
    dataIsDoneFalse: resultIsDoneFalse,
  });
}

async function editTask(req, res) {
  const { id, collection_id } = req.params;

  const query = `UPDATE public.task_tb
	SET is_done=true
	WHERE id=${id};`

  const result = await sequelize.query(query, { type: QueryTypes.UPDATE });

  res.redirect("/collection-detail/" + collection_id);
}

async function editCollection(req, res) {
  const {id, collectionName } = req.body;
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  try {

    const query = `UPDATE public.collections_tb
    SET name='${collectionName}'
    WHERE id=${id};`
  
    const result = await sequelize.query(query, { type: QueryTypes.UPDATE });

    req.flash("success", "Edit collection success");

    res.redirect("/");
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}


app.listen(port, () => {
  console.log("Server is running on PORT :", port);
});
