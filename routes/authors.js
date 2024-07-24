const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");

// All Authors Route
router.get("/", (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  Author.find(searchOptions)
    .then((authors) => {
      res.render("authors/index", {
        authors: authors,
        searchOptions: req.query,
      });
    })
    .catch(() => {
      res.redirect("/");
    });
});

// New Author Route
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

// Create Author Route
router.post("/", (req, res) => {
  const author = new Author({
    name: req.body.name,
  });
  author
    .save()
    .then((newAuthor) => {
      res.redirect(`/authors/${newAuthor.id}`);
    })
    .catch(() => {
      res.render("authors/new", {
        author: author,
        errorMessage: "Error creating Author...",
      });
    });
});

router.get("/:id", (req, res) => {
  Author.findById(req.params.id)
    .then((author) => {
      Book.find({ author: author.id })
        .limit(6)
        .exec()
        .then((books) => {
          res.render("authors/show", { author: author, booksByAuthor: books });
        });
    })
    .catch(() => {
      res.redirect("/authors");
    });
});

router.get("/:id/edit", (req, res) => {
  Author.findById(req.params.id)
    .then((author) => {
      res.render("authors/edit", { author: author });
    })
    .catch(() => {
      res.redirect("/authors");
    });
});

router.put("/:id", (req, res) => {
  let author;
  Author.findById(req.params.id)
    .then((foundAuthor) => {
      author = foundAuthor;
      author.name = req.body.name;
      return author.save();
    })
    .then(() => {
      res.redirect(`/authors/${author.id}`);
    })
    .catch(() => {
      if (author == null) {
        res.redirect("/");
      } else {
        res.render("authors/edit", {
          author: author,
          errorMessage: "Error updating Author...",
        });
      }
    });
});

router.delete("/:id", (req, res) => {
  let author;
  Author.findById(req.params.id)
    .then((foundAuthor) => {
      author = foundAuthor;
      return author.deleteOne();
    })
    .then(() => {
      res.redirect(`/authors`);
    })
    .catch(() => {
      if (author == null) {
        res.redirect("/");
      } else {
        res.redirect(`/authors/${author.id}`);
      }
    });
});

module.exports = router;
