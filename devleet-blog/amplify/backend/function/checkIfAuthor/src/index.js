/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const app = require('./app');

exports.handler = async (event) => {
  try {
    // Extracting postId from the URL parameters
    const postId = event.pathParameters.id;

    // Get the user ID from the JWT token (sent by Cognito)
    const userId = event.requestContext.authorizer.claims.sub;

    if (!postId || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing postId or userId" }),
      };
    }

    // Forward the event data to app.js for processing
    const result = await app.checkIfAuthor(postId, userId);

    // Return the result (True or False if the user is the author)
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error checking author', error }),
    };
  }
};
