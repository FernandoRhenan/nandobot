const up = (pgm) => {
  pgm.createTable("coupons", {
    id: {
      type: "serial",
      primaryKey: true,
      notNull: true,
    },

    name: {
      type: "varchar(96)",
      notNull: true,
    },

    discount: {
      type: "integer",
      notNull: true,
    },

    discount_type: {
      type: "varchar(24)",
      notNull: true,
    },

    discount_limit: {
      type: "integer",
      notNull: false,
    },

    min_purchase: {
      type: "integer",
      notNull: false,
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
