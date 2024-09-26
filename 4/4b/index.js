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
// app.get("/", collection);
app.get("/add-collection", addCollectionView);
app.post("/add-collection", addCollection);
app.post("/add-task", addTask);
app.get("/delete-project/:id/imageId/:imageId", deleteProject);
app.get("/edit-project/:id", editProjectView);
app.post(
  "/edit-project/:id/imageId/:imageId",
  upload.single("image"),
  editProject
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

async function home(req, res) {
  const user = req.session.user;
  // const result = await projectModel.findAll();

  res.render("index", {
    user,
  });
}

async function collection(req, res) {
  const user = req.session.user;
  const query = `SELECT * FROM public.collections_tb WHERE user_id = '${user[0].id}';`;
  const result = await sequelize.query(query, { type: QueryTypes.SELECT });

  console.log(result);
  console.log(user);

  res.render("index", {
    data: result,
    user,
  });
}

async function test(req, res) {
  res.render("test");
}

async function deleteProject(req, res) {
  const { id, imageId } = req.params;

  let result = await projectModel.findOne({
    where: {
      id: id,
    },
  });

  if (!result) return res.render("not-found");

  await projectModel.destroy({
    where: {
      id: id,
    },
  });

  res.redirect("/");
}

async function addCollection(req, res) {
  const user = req.session.user;
  const { collectionName } = req.body;

  if (!user) {
    return res.redirect("/login");
  }

  try {

    console.log(req.body);

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
  console.log(req.body);

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

async function editProjectView(req, res) {
  const { id } = req.params;
  const user = req.session.user;

  const result = await projectModel.findOne({
    where: {
      id: id,
    },
  });

  if (!user) {
    return res.redirect("/login");
  }

  if (!result) return res.render("not-found");

  res.render("edit-project", {
    data: result,
    startDate: convertDate(result.startDate),
    endDate: convertDate(result.endDate),
    typescript: result.technologies.indexOf("typescript") !== -1,
    nodejs: result.technologies.indexOf("nodejs") !== -1,
    nextjs: result.technologies.indexOf("nextjs") !== -1,
    reactjs: result.technologies.indexOf("reactjs") !== -1,
  });

  if (!user) {
    return res.redirect("/login");
  }
}

async function editProject(req, res) {
  const { id, imageId } = req.params;
  const file = req.file;

  const {
    projectName,
    description,
    startDate,
    endDate,
    nodejs,
    typescript,
    reactjs,
    nextjs,
  } = req.body;

  try {
    const project = await projectModel.findOne({
      where: {
        id: id,
      },
    });
    const duration = calculateDuration(startDate, endDate);

    if (!project) return res.render("not-found");

    project.projectName = projectName;
    project.description = description;
    project.startDate = startDate;
    project.endDate = endDate;
    project.image = url;
    project.imageId = file.originalname;
    project.duration = duration.months + "months";

    project.technologies = [nodejs, typescript, reactjs, nextjs];

    await project.save();

    res.redirect("/");
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}

function addCollectionView(req, res) {
  const user = req.session.user;
  res.render("collection", { user });
}

function contact(req, res) {
  res.render("contact");
}

async function collectionDetail(req, res) {
  const user = req.session.user;
  const { id } = req.params;
  const query2 = `SELECT * FROM public.collections_tb WHERE id = '${id}'`;
  const result2 = await sequelize.query(query2, { type: QueryTypes.SELECT });

  const query = `
  SELECT public.task_tb.*, public.collections_tb.user_id AS user FROM public.task_tb INNER JOIN public.collections_tb
	ON ${id} = public.collections_tb.id`;

  const result = await sequelize.query(query, { type: QueryTypes.SELECT });
  // console.log(result);
  console.log(result2);

  if (!result) return res.render("not-found");
  res.render("collection-detail", {
    data: result,
    collection: result2[0],
    user,
  });
}

app.listen(port, () => {
  console.log("Server is running on PORT :", port);
});
