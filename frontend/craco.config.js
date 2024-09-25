const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

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
};
