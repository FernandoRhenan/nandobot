const up = (pgm) => {
  pgm.createTable("product_requests_coupons", {
    id: {
      type: "serial",
      primaryKey: true,
      notNull: true,
    },

    coupon_id: {
      type: "integer",
      notNull: true,
    },

    product_request_id: {
      type: "integer",
      notNull: true,
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
