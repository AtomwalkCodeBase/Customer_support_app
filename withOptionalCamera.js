// plugins/withOptionalCamera.js

const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withOptionalCamera(config) {
    return withAndroidManifest(config, (config) => {
        const manifest = config.modResults.manifest;

        manifest["uses-feature"] = manifest["uses-feature"] || [];

        const existingCameraFeature = manifest["uses-feature"].find(
            (feature) =>
                feature.$?.["android:name"] === "android.hardware.camera"
        );

        if (existingCameraFeature) {
            existingCameraFeature.$["android:required"] = "false";
        } else {
            manifest["uses-feature"].push({
                $: {
                    "android:name": "android.hardware.camera",
                    "android:required": "false",
                },
            });
        }

        return config;
    });
};