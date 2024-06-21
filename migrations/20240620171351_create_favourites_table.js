/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("favorites", (table) => {
    table.increments("id");
    table
      .integer("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .integer("recipe_id")
      .unsigned()
      .references("id")
      .inTable("recipes")
      .onDelete("CASCADE");
    table.unique(["user_id", "recipe_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("favorites");
};
