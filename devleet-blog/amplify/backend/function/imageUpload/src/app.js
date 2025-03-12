const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS SDK
const s3 = new AWS.S3();

// Create Express app
const app = express();
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// Image upload endpoint
app.post('/upload', async (req, res) => {
  try {
    const { imageData, fileExtension } = req.body;

    if (!imageData || !fileExtension) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const buffer = Buffer.from(imageData, 'base64');
    const key = `${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: 'images-for-blog',
      Key: key,
      Body: buffer,
      ContentEncoding: 'base64',
      ContentType: `image/${fileExtension}`,
      ACL: 'public-read'
    };

    await s3.putObject(params).promise();
    const imageUrl = `https://${params.Bucket}.s3.amazonaws.com/${key}`;
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

module.exports = app;