require('dotenv').config()

const express = require('express')
const cloudinary = require("cloudinary").v2
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')

const app = express()
const port = process.env.PORT || 8000

// Example everything in server.js for brevity, please observe MVC and good practices to organize your project

// Initialize cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Initialize cloudinary compatible storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        // see https://cloudinary.com/documentation/image_upload_api_reference#upload_optional_parameters for all possible options to configure,
        // some useful ones include: allowed_formats, use_filename, unique_filename, etc...
        folder: 'project3-example',
    },
});

// Create a middleware that is able to handle file data format from file uploads,
// similar to what we did for json and urlencoded data format
const fileParser = multer({ storage: storage });

// A normal route applied with the fileParser 'single' middleware, 'single' means that it is expecting only 1 file,
// uploaded under the field name 'media_file' in our case
app.post('/api/media/upload', fileParser.single('media_file'), (req, res) => {

    // In the logic here, you can do various things, including validating the file, eg:
    // file dimension limit, file size limit, etc. Find out how to apply these validation yourself

    // Other thing is to store a reference of the media to DB, typically the URL of the uploaded image to Cloudinary.
    // It is possible to convert a file into string by applying base64 encode, but there this is generally discouraged because:
    // - bloats up db size, and the increase in document size decrease performance (more data to transfer when querying db)
    // - if the image is sufficiently huge enough, it could exceed the 256mb document size limit of mongo db
    // Thus instead of storing image as string to DB, it is better to upload file else where, and store the resultant image URL.

    // Other thing is that why not just upload to app server that is running Express. Answer to that is that it is not scalable,
    // especially when you have a multiple servers behind a load-balancer, file upload will make file available to a single server


    if (!req.file) {
        res.statusCode = 500
        return res.json({
            msg: 'failed to upload file'
        })
    }

    // for us, we will just return the details of the uploaded file, which is in req.file
    res.json(req.file)

})

app.listen(port, () => {
    console.log(`Example file upload app listening on port ${port}`)
})