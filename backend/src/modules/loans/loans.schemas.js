const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "ObjectId invalido");

const createLoanSchema = z.object({
  userId: objectIdSchema,
  items: z.array(
    z.object({
      bookId: objectIdSchema,
      qty: z.number().int().positive().default(1),
    })
  ).min(1, "Debes enviar al menos 1 libro"),
});

module.exports = { createLoanSchema, objectIdSchema };
