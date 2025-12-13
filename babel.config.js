module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      plugins: [
        [
          "module-resolver",
          {
            root: ["./"],
            alias: {
              "@assets": "./assets",
              "@components": "./src/components",
              "@hooks": "./src/hooks",
              "@models": "./src/models",
              "@utils": "./src/utils",
              "@stores": "./src/stores",
              "@services": "./src/services",
              "@configs": "./src/configs",
              "@constants": "./src/constants",
              "@routes": "./src/routes",

              "react-native-worklets": "react-native-worklets-core",
              "react-native-worklets/plugin": "react-native-worklets-core/plugin",
            },
            extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".lottie"],
          },
        ],
        "react-native-reanimated/plugin",
      ],
    };
  };