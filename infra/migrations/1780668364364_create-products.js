const up = (pgm) => {
  pgm.createTable("products", {
    id: {
      type: "serial",
      primaryKey: true,
      notNull: true,
    },

    name: {
      type: "text",
      notNull: true,
    },

    image_url: {
      type: "text",
      notNull: true,
    },

    current_price: {
      type: "integer",
      notNull: true,
    },

    old_price: {
      type: "integer",
      notNull: false,
    },

    product_request_id: {
      type: "integer",
      notNull: true,
      unique: true,
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
