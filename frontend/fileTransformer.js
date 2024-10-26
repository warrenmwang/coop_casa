const path = require("path");

module.exports = {
  process(src, filename, config, options) {
    return {
      code: `module.exports = {
        __esModule: true,
        default: ${JSON.stringify(path.basename(filename))},
        metadata: {
          src: ${JSON.stringify(path.basename(filename))}
        }
      };`,
    };
  },
};
