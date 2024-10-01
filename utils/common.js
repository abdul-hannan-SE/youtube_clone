const fs = require("fs");
const ObjectId = require("mongoose").Schema.Types.ObjectId;
exports.clearFile = (pathToFile) => {
  fs.unlinkSync(pathToFile, (err) => {
    if (err) {
      console.log("failed to delete file");
    }
  });
};

exports.verifyObjectID = (id) => {
  return id === ObjectId ? true : false;
};
