/*
This script is used to update the app version in the UI (variable: devVersion in auth.service.ts).
The source version is coming from package.json
*/

const fs = require("fs");
const path = require("path");

// Handle dev version
const packageJsonPath = path.resolve(__dirname, "../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const devVersion = process.argv[2] ?? packageJson.version;

const devEnvironment = path.resolve(
  __dirname,
  "../src/environments/environment.development.ts",
);
const devEnvironmentContent = fs.readFileSync(devEnvironment, "utf8");

const updatedDevEnvironmentContent = devEnvironmentContent.replace(
  /version: '[\d.]+'/,
  `version: '${devVersion}'`,
);

fs.writeFileSync(devEnvironment, updatedDevEnvironmentContent, "utf8");

// Handle prod version
const prodEnvironment = path.resolve(
  __dirname,
  "../src/environments/environment.ts",
);
const prodEnvironmentContent = fs.readFileSync(prodEnvironment, "utf8");

const prodVersion = process.argv[3] ?? packageJson.version;
const updatedProdEnvironmentContent = prodEnvironmentContent.replace(
  /version: '[\d.]+'/,
  `version: '${prodVersion}'`,
);

fs.writeFileSync(prodEnvironment, updatedProdEnvironmentContent, "utf8");
