const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const path = require("path");

module.exports = {
  webpack: {
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: "server",
        generateStatsFile: true,
        statsOptions: { source: false },
      }),
    ],
  },
  jest: {
    configure: {
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "\\.(css|less|scss|sass)$": path.resolve(__dirname, "styleMock.js"),
      },
      transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
      },
      transformIgnorePatterns: [
        "/node_modules/(?!(.*.mjs|@myorg/mypackage|axios|react-native|react-native-reanimated|@react-native|@react-navigation))",
      ],
      testEnvironment: "jsdom",
      setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
      moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
      collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",
        "!src/**/*.d.ts",
        "!src/index.js",
        "!src/serviceWorker.js",
      ],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
};
