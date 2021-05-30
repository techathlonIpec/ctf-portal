# Cryptohunt Server
This server is the base for hosting a server, on your own hosting to organise events that involve questions along with their answers. 

 ## How to run?
To run this project you need to have `nodeJS` installed in your system, and to clone the repo properly you might as well need `git` installed.

 1. Use `git` to clone the repository, or fork in your own account.

 ```shell
 git clone git@github.com:Trinity-Developers-Club/cryptohunt-server.git
 ```
 2. After cloning the repository, change the directory to the project folder, and run the `npm install` command.

 ```shell
 cd cryptohunt-server
 npm install
 ```
 3. The project contains `two Scripts` for the npm. 
 First the script for the normal start (Without watching).
 ```shell 
 npm run start
 ```
 The other one to run the server in Development mode.
 ```shell
 npm run devStart
 ```

 4. Before running the server, create a `.env` file or declare your ennvironment variable in your hosting environment.
 ```env 
 PORT=3000
 MONGODB_URI=YOUR_MONGO_DB_URI_HERE
```
## Packages used so far
1. express
2. mongoose
3. dotenv