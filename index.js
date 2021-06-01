const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;
const router = express.Router();

// application-level middleware
const requestTime = function (req, res, next) {
  console.log("La fonction requestTime s'exécute partout");
  req.requestTime = new Date();
  next();
};

// router-level middleware
const amIInRouter = function (req, res, next) {
  console.log(
    "La fonction amIInRouter s'exécute seulement dans les requêtes du router"
  );
  next();
};

// custom middleware to create a cookie for the example
const createCookie = async (req, res, next) => {
  // check if client sent cookie
  const cookie = req.cookies.cookieName;
  if (cookie === undefined) {
    // no: set a new cookie
    let randomNumber = Math.random().toString();
    randomNumber = randomNumber.substring(2, randomNumber.length);
    await res.cookie("cookieName", randomNumber, {
      maxAge: 900000,
      httpOnly: true,
    });
    console.log("Cookie created successfully");
    console.log(req.cookies);
  } else {
    // yes, cookie was already present
    console.log("Cookie exists, with name: ", cookie);
  }
  await next();
};

app.use(cookieParser());
app.use(requestTime);
app.use("/admin", router);
router.use(amIInRouter);

/* URL http://localhost:3000 */
app.get("/", createCookie, function (req, res) {
  let responseText = `Hi ! You've reached the challenge part of the quest <strong>Middleware in Express</strong><br><small> at: ${req.requestTime} </small>`;
  res.send(responseText);
});

/* URL http://localhost:3000/admin because of app.use("/admin", router) */
router.get("/", function (req, res, next) {
  let responseText = `Nice ! You are now in the admin page since: ${req.requestTime}`;
  res.send(responseText);
});

/* URL http://localhost:3000/cookie */
app.get("/cookie", function (req, res) {
  let responseText = `This time, you are in the cookies page with cookie ${req.cookies.cookieName}!`;
  res.send(responseText);
  console.log("Cookies: ", req.cookies);
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
