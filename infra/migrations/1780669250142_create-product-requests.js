const up = (pgm) => {
  pgm.createTable("product_requests", {
    id: {
      type: "serial",
      primaryKey: true,
      notNull: true,
    },

    url: {
      type: "text",
      notNull: true,
    },

    status: {
      type: "varchar(10)",
      notNull: true,
      default: "pending",
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },

    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });
};

const down = false;

export { up, down };
