const multer = require("multer");

exports.setFile = ({
  maxSize,
  path,
  mimetypes = ["image/jpeg", "image/png", "image/jpg"],
}) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix =
        new Date().toISOString().replace(/:/g, "_") + file.originalname;
      cb(null, uniqueSuffix);
    },
  });

  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      if (mimetypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid image type (allowed types : jpeg, jpg, png)"));
      }
    },
    limits: { fileSize: maxSize },
  });

  return upload;
};
