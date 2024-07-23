const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

// All Books Route
router.get("/", (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishAfter != null && req.query.publishAfter != "") {
    query = query.gte("publishDate", req.query.publishAfter);
  }
  if (req.query.publishBefore != null && req.query.publishBefore != "") {
    query = query.lte("publishDate", req.query.publishBefore);
  }
  query
    .exec()
    .then((books) => {
      res.render("books/index", {
        books: books,
        searchOptions: req.query,
      });
    })
    .catch((err) => {
      res.redirect("/");
    });
});

// New Book Route
router.get("/new", (req, res) => {
  renderNewPage(res, new Book());
});

// Create Book Route
router.post("/", (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });
  saveCover(book, req.body.cover);
  book
    .save()
    .then((newBook) => {
      // res.redirect(`books/${newBook.id}`)
      res.redirect("books");
    })
    .catch((err) => {
      renderNewPage(res, book, true);
    });
});

function renderNewPage(res, book, hasError = false) {
  Author.find({})
    .then((authors) => {
      const params = {
        authors: authors,
        book: book,
      };
      if (hasError) {
        params.errorMessage = "Error creating a book...";
      }
      res.render("books/new", params);
    })
    .catch((err) => {
      res.redirect("/books");
    });
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;

  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
