const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/upload", (req, res) => {
  upload.single("upload")(req, res, async (err) => {
    if (err) {
      console.log(err);
      return res.json({ error: err.message });
    }
    console.log("req.body", req.body);
    console.log("req.file", req.file);

    res.json({
      data: { fileName: req.file.filename, ...req.body },
    });
  });
});

app.listen(8001, () => {
  console.log(`Server is listening on port ${8001}`);
});
