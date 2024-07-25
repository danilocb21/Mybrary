if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");

const indexRouter = require("./routes/index");
const authorRouter = require("./routes/authors");
const bookRouter = require("./routes/books");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(express.json({ limit: "5mb" }));

const PORT = process.env.PORT || 3000;
if (PORT === 3000) {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongoose"));

app.use("/", indexRouter);
app.use("/authors", authorRouter);
app.use("/books", bookRouter);

app.listen(PORT, function () {
  console.log(
    `Express server listening on port ${this.address().port} in ${
      app.settings.env
    } mode`
  );
});
