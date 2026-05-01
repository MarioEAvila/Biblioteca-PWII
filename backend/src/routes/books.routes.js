const express = require("express");

const {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} = require("../modules/books/books.controller");

const router = express.Router();

router.get("/", listBooks);
router.get("/:id", getBook);
router.post("/", createBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

module.exports = router;
