# Scripts folder explanation

1. build.ps1

- A powershell script that automating the process of building and deploying a Docker image based on information in a package.json file.
- Usage: run `.\scripts\build.ps1`

2. build.sh

- A bash script that automating the process of building and deploying a Docker image based on information in a package.json file.
- Usage: run `/scripts/build.sh`

3. compose.yaml

- Docker compose file
- Usage:

4. default.conf

- This Nginx configuration file sets up a basic web server to listen on port 80 and serve content from a specified directory.
- Usage: used in Dockerfile

5. nginx.conf

- The main configuration for an Nginx web server.
- Usage: used in Dockerfile

6. robots.txt

- The provided robots.txt file is very simple and grants broad access to search engine crawlers.
- Usage: used in Dockerfile

7. update-version.js

- This script is used to update the dev version in the UI (variable: devVersion in changelog.service.ts).
- The source version is coming from package.json
- Usage: used in build.ps1 or build.sh

8. versioning.build.js
