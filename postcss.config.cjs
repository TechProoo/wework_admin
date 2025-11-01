module.exports = {
  plugins: [
    // Use explicit requires so PostCSS resolves the wrapper plugin correctly.
    require("@tailwindcss/postcss"),
    require("autoprefixer"),
  ],
};
