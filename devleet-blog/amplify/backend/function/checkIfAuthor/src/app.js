const { DynamoDB } = require('aws-sdk');
const dynamoDB = new DynamoDB.DocumentClient();
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  console.log('Handler invoked');
  const postId = event.pathParameters.id;  // Get post ID from the URL parameter

  // Extract userId from the authentication token
  const token = event.headers.Authorization.split(' ')[1];
  const decodedToken = jwt.decode(token);
  const userId = decodedToken.sub;

  console.log(`postId: ${postId}, userId: ${userId}`);

  const params = {
    TableName: 'posts',
    Key: {
      id: postId,
    },
  };

  try {
    const result = await dynamoDB.get(params).promise();
    console.log(`DynamoDB get result: ${JSON.stringify(result)}`);

    if (!result.Item) {
      console.log('Post not found');
      return {
        statusCode: 404,
        body: JSON.stringify({ isOwner: false, message: 'Post not found' }),
      };
    }

    const isOwner = result.Item.userId === userId;
    console.log(`isOwner: ${isOwner}`);  // Log the isOwner value

    return {
      statusCode: 200,
      body: JSON.stringify({
        isOwner: isOwner,
        post: result.Item,
      }),
    };
  } catch (error) {
    console.log(`Error retrieving post: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        isOwner: false,
        message: 'Error retrieving post',
        error: error.message,
      }),
    };
  }
};