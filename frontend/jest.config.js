const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  modulePaths: [path.resolve(__dirname, "src")],
  moduleNameMapper: {
    "^@app/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/fileTransformer.js",
    "^.+\\.css$": "jest-transform-css",
  },
};
