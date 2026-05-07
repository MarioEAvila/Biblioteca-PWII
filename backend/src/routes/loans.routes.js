const express = require("express");
const { adminRequired } = require("../middlewares/auth.middleware");
const router = express.Router();

const {
  listLoans,
  getLoan,
  createLoan,
  returnLoan,
  deleteLoan,
} = require("../modules/loans/loans.controller");

router.get("/", listLoans);
router.get("/:id", getLoan);
router.post("/", createLoan);
router.put("/:id/return", returnLoan);
router.delete("/:id", adminRequired, deleteLoan);

module.exports = router;
