const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.BUCKET_REGION,
});

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

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
    } 

    const command = new PutObjectCommand(params)

    await s3.send(command)
    res.json({
      body: req.file,
    });
  });
});

app.listen(8001, () => {
  console.log(`Server is listening on port ${8001}`);
});
