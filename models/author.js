const mongoose = require("mongoose");
const Book = require("./book");

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

authorSchema.pre("deleteOne", function (next) {
  const query = this.getFilter();
  Book.exists({ author: query._id })
    .then((hasBook) => {
      if (hasBook) {
        next(new Error("This author still has books"));
      } else {
        next();
      }
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = mongoose.model("Author", authorSchema);
