const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS SDK
const s3 = new AWS.S3({
    region: 'eu-north-1', // Must match bucket region
    maxRetries: 3,
    httpOptions: { timeout: 5000 }
  });
  
// Create Express app
const app = express();
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS
app.options('/upload-image', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).send();
  });

// Image upload endpoint
app.post('/upload-image', async (req, res) => {
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
      ContentType: getMimeType(fileExtension),
      ACL: 'public-read'
    };

    await s3.putObject(params).promise();
    const imageUrl = `https://${params.Bucket}.s3.amazonaws.com/${key}`;
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('FULL ERROR:', {
      message: error.message,
      stack: error.stack,
      raw: error
    });
    
    res.header('Access-Control-Allow-Origin', '*')
       .status(500)
       .json({ 
         error: 'Image upload failed',
         details: error.message 
       });
  }
});

function getMimeType(extension) {
    const types = {
      jpg: 'jpeg',
      jpeg: 'jpeg',
      png: 'png',
      gif: 'gif',
      webp: 'webp'
    };
    return `image/${types[extension.toLowerCase()] || 'jpeg'}`;
  }

module.exports = app;