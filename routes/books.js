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
    .catch(() => {
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
      res.redirect(`/books/${newBook.id}`);
    })
    .catch(() => {
      renderNewPage(res, book, true);
    });
});

router.get("/:id", (req, res) => {
  Book.findById(req.params.id)
    .populate("author")
    .exec()
    .then((book) => {
      res.render("books/show", { book: book });
    })
    .catch(() => {
      res.redirect("/");
    });
});

// Edit Book Route
router.get("/:id/edit", (req, res) => {
  Book.findById(req.params.id)
    .then((book) => {
      renderEditPage(res, book);
    })
    .catch(() => {
      res.redirect("/books");
    });
});

// Update Book Route
router.put("/:id", (req, res) => {
  let book;
  Book.findById(req.params.id)
    .then((foundBook) => {
      book = foundBook;
      book.title = req.body.title;
      book.author = req.body.author;
      book.publishDate = new Date(req.body.publishDate);
      book.pageCount = req.body.pageCount;
      book.description = req.body.description;
      if (req.body.cover != null && req.body.cover !== "") {
        saveCover(book, req.body.cover);
      }
      return book.save();
    })
    .then(() => {
      res.redirect(`/books/${book.id}`);
    })
    .catch(() => {
      if (book != null) {
        renderEditPage(res, book, true);
      } else {
        res.redirect("/");
      }
    });
});

// Delete Book Route
router.delete("/:id", (req, res) => {
  Book.findByIdAndDelete(req.params.id)
    .then(() => {
      res.redirect("/books");
    })
    .catch(() => {
      res.redirect("/");
    });
});

function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "new", hasError);
}

function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, "edit", hasError);
}

function renderFormPage(res, book, form, hasError = false) {
  Author.find({})
    .then((authors) => {
      const params = {
        authors: authors,
        book: book,
      };
      if (hasError) {
        if (form == "new") {
          params.errorMessage = "Error Creating a book...";
        } else {
          params.errorMessage = "Error Updating a book...";
        }
      }
      res.render(`books/${form}`, params);
    })
    .catch(() => {
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
