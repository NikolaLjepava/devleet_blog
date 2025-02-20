const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    const body = JSON.parse(event.body);
    const imageData = body.imageData; // Base64 encoded image data
    const fileExtension = body.fileExtension; // e.g., 'jpg', 'png'

    const buffer = Buffer.from(imageData, 'base64');
    const key = `${uuidv4()}.${fileExtension}`;

    const params = {
        Bucket: 'images-for-blog',
        Key: key,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: `image/${fileExtension}`,
        ACL: 'public-read' // Ensure the object is publicly readable
    };

    try {
        await s3.putObject(params).promise();
        const imageUrl = `https://${params.Bucket}.s3.amazonaws.com/${key}`;
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ imageUrl })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};