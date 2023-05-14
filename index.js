const express = require('express')
const cors = require('cors')
const multer = require('multer')
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} = require('@aws-sdk/client-s3')
const sharp = require('sharp')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.BUCKET_REGION,
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.post('/upload', (req, res) => {
    upload.array('uploads')(req, res, async (err) => {
        if (err) {
            console.log(err)
            return res.json({ error: err.message })
        }
        req.files = req.files.map((file) => ({
            ...file,
            originalname: Date.now() + file.originalname,
        }))
        console.log('req.body', req.body)
        console.log('req.files', req.files)

        // resize one image image if you want

        /*const buffer = await sharp(req.file.buffer)
      .resize({ height: 1600, width: 840, fit: "contain" })
      .toBuffer();
      */
        req.files.map((file) => Date.now() + file.originalName)
        const imageLinks = []

        for (const file of req.files) {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: file.originalname,
                Body: file.buffer,
                ContentType: file.mimetype,
            }

            const commandToCreate = new PutObjectCommand(params)
            await s3.send(commandToCreate)

            const getObjectParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: file.originalname,
            }
            const commandToGet = new GetObjectCommand(getObjectParams)

            const imageLink = await getSignedUrl(s3, commandToGet, {
                expiresIn: 99999,
            })

            imageLinks.push(imageLink)
        }



        res.json({
            data: { imageLinks, ...req.body },
        })
    })
})

app.listen(8001, () => {
    console.log(`Server is listening on port ${8001}`)
})
