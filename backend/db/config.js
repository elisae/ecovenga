// TODO: make secure, i.e. add user auth, edit .gitignore
module.exports = function(param) {
  switch(param) {
    case "local":
      return "mongodb://localhost:27017/ecovenga";
    case "docker":
      return "mongodb://mongodb:27017/ecovenga";
    default:
      return "mongodb://localhost:27017/ecovenga";
  }
}
