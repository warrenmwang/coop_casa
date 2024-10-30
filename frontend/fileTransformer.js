import path from "path";

export default {
  process(_, filename) {
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
