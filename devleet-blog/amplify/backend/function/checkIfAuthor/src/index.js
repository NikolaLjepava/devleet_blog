/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

// Import the DynamoDB SDK
const { DynamoDB } = require('aws-sdk');
const dynamoDB = new DynamoDB.DocumentClient();

// Lambda handler
exports.handler = async (event) => {
  const postId = event.pathParameters.id;
  
  const params = {
    TableName: 'posts',
    Key: {
      id: postId,
    },
  };

  try {
    const result = await dynamoDB.get(params).promise();
    
    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Post not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error retrieving post', error }),
    };
  }
};

