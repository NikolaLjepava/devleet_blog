const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    // Log the HTTP method received
    console.log(`HTTP Method: ${event.httpMethod}`);
    
    if (event.httpMethod !== 'POST') {
        console.log('Invalid HTTP method');
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        console.log('Parsed body:', body);
        const imageData = body.imageData;
        const fileExtension = body.fileExtension;

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

        console.log('Uploading image to S3 with params:', params);
        await s3.putObject(params).promise();
        const imageUrl = `https://${params.Bucket}.s3.amazonaws.com/${key}`;
        console.log('Image uploaded successfully:', imageUrl);
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ imageUrl })
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ error: 'Failed to upload image' })
        };
    }
};