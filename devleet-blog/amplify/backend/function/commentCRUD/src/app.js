/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')
const { v4: uuidv4 } = require('uuid');


const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

let tableName = "comments";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "id";
const partitionKeyType = "S";
const sortKeyName = "postId";
const sortKeyType = "S";
const hasSortKey = sortKeyName !== "";
const path = "/comments";
const UNAUTH = 'UNAUTH';
const hashKeyPath = '/:' + partitionKeyName;
const sortKeyPath = hasSortKey ? '/:' + sortKeyName : '';

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

app.options('*', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});


// Define the root route
app.get('/', (req, res) => {
  res.send('Welcome to the Comments API');
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
  switch(type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
}

/************************************
* HTTP Get method to list objects *
************************************/

app.get('/comments/:postId', async (req, res) => {
  const { postId } = req.params;

  const params = {
    TableName: tableName,
    IndexName: 'postId-index',
    KeyConditionExpression: 'postId = :postId',
    ExpressionAttributeValues: { ':postId': postId },
  };

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    console.log('Fetched Comments:', data.Items);
    // Build nested comment structure
    const nestedComments = buildNestedComments(data.Items);

    res.json(nestedComments);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch comments' });
  }
});

function buildNestedComments(comments) {
  const commentMap = {};
  const nestedComments = [];

  // Initialize each comment in the map
  comments.forEach(comment => {
    comment.children = [];
    comment.voteScore = (comment.upvotes || 0) - (comment.downvotes || 0); // Calculate vote score
    commentMap[comment.id] = comment;
  });

  // Build tree structure
  comments.forEach(comment => {
    if (comment.parentId) {
      commentMap[comment.parentId]?.children.push(comment);
    } else {
      nestedComments.push(comment); // Root-level comments
    }
  });

  return nestedComments;
}


/************************************
 * HTTP Get method to query objects *
 ************************************/
//not used since we dont need to query comments
app.get(path + hashKeyPath, async function(req, res) {
  const condition = {}
  condition[partitionKeyName] = {
    ComparisonOperator: 'EQ'
  }

  if (userIdPresent && req.apiGateway) {
    condition[partitionKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];
  } else {
    try {
      condition[partitionKeyName]['AttributeValueList'] = [ convertUrlType(req.params[partitionKeyName], partitionKeyType) ];
    } catch(err) {
      res.statusCode = 500;
      res.json({error: 'Wrong column type ' + err});
    }
  }

  let queryParams = {
    TableName: tableName,
    KeyConditions: condition
  }

  try {
    const data = await ddbDocClient.send(new QueryCommand(queryParams));
    res.json(data.Items);
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load items: ' + err.message});
  }
});

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/
//not used since we dont need to get single comment
app.get(path + '/object' + hashKeyPath + sortKeyPath, async function(req, res) {
  const params = {};
  if (userIdPresent && req.apiGateway) {
    params[partitionKeyName] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  } else {
    params[partitionKeyName] = req.params[partitionKeyName];
    try {
      params[partitionKeyName] = convertUrlType(req.params[partitionKeyName], partitionKeyType);
    } catch(err) {
      res.statusCode = 500;
      res.json({error: 'Wrong column type ' + err});
    }
  }
  if (hasSortKey) {
    try {
      params[sortKeyName] = convertUrlType(req.params[sortKeyName], sortKeyType);
    } catch(err) {
      res.statusCode = 500;
      res.json({error: 'Wrong column type ' + err});
    }
  }

  let getItemParams = {
    TableName: tableName,
    Key: params
  }

  try {
    const data = await ddbDocClient.send(new GetCommand(getItemParams));
    if (data.Item) {
      res.json(data.Item);
    } else {
      res.json(data) ;
    }
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load items: ' + err.message});
  }
});


/************************************
* HTTP put method for insert object *
*************************************/

app.put('/comments/:id', async (req, res) => {
  const { id } = req.params;
  const { content, userEmail } = req.body;
  const updatedAt = new Date().toISOString();

  // Fetch comment to verify ownership
  const getParams = { TableName: tableName, Key: { id } };

  try {
    const data = await ddbDocClient.send(new GetCommand(getParams));
    const comment = data.Item;

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userEmail !== userEmail) {
      return res.status(403).json({ error: 'Unauthorized to update this comment' });
    }

    // Proceed with update
    const updateParams = {
      TableName: tableName,
      Key: { id },
      UpdateExpression: 'set content = :content, updatedAt = :updatedAt',
      ExpressionAttributeValues: { ':content': content, ':updatedAt': updatedAt },
      ReturnValues: 'UPDATED_NEW',
    };

    const updatedData = await ddbDocClient.send(new UpdateCommand(updateParams));
    res.json(updatedData.Attributes);
  } catch (error) {
    res.status(500).json({ error: 'Could not update comment' });
  }
});


/************************************
* HTTP post method for insert object *
*************************************/

app.post('/comments', async (req, res) => {
  const { postId, content, userEmail, parentId } = req.body;
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  const params = {
    TableName: tableName,
    Item: {
      id,
      postId,
      content,
      userEmail,
      parentId: parentId || null,
      createdAt,
      updatedAt,
      upvotes: 0,
      downvotes: 0,
      hasReplies: false, // Default value
    },
  };

  try {
    await ddbDocClient.send(new PutCommand(params));

    // If this is a reply, update parent comment to `hasReplies: true`
    if (parentId) {
      let currentParentId = parentId;

      // Recursively update `hasReplies` for all ancestor comments
      while (currentParentId) {
        const updateParentParams = {
          TableName: tableName,
          Key: { id: currentParentId, postId: postId },
          UpdateExpression: 'SET hasReplies = :true',
          ExpressionAttributeValues: { ':true': true },
          ReturnValues: 'UPDATED_NEW',
        };
        await ddbDocClient.send(new UpdateCommand(updateParentParams));

        // Get the next parent to continue the recursion
        const getParentParams = {
          TableName: tableName,
          Key: { id: currentParentId, postId: postId },
        };
        const parentData = await ddbDocClient.send(new GetCommand(getParentParams));
        const parentComment = parentData.Item;

        currentParentId = parentComment ? parentComment.parentId : null;
      }
    }

    res.json(params.Item);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Could not create comment', details: error.message });
  }  
});

app.post('/comments/:id/vote', async (req, res) => {
  const { id } = req.params; // commentId
  const { voteType, postId, userId } = req.body; // userId

  if (!['upvote', 'downvote'].includes(voteType)) {
    return res.status(400).json({ error: 'Invalid vote type' });
  }

  // convert voteType to a numeric value: 1 for upvote, -1 for downvote
  const newVoteValue = voteType === 'upvote' ? 1 : -1;

  try {
    // check if the user has already voted on this comment
    const getVoteParams = {
      TableName: 'votes',
      Key: { commentId: id, userId: userId },
    };

    let existingVote;
    try {
      const voteData = await ddbDocClient.send(new GetCommand(getVoteParams));
      existingVote = voteData.Item;
    } catch (e) {
      // not found is treated as no vote
      existingVote = null;
    }

    let voteAdjustment = 0;
    if (existingVote) {
      if (existingVote.voteValue === newVoteValue) {
        // User clicked the same vote again to undo it
        voteAdjustment = -newVoteValue;  // reverse the previous vote
        const deleteVoteParams = {
          TableName: 'votes',
          Key: { commentId: id, userId: userId },
        };
        await ddbDocClient.send(new DeleteCommand(deleteVoteParams));
      } else {
        // user is switching vote from 1 to -1 or vice versa:
        // from +1 to -1 => -2 or from -1 to +1 => +2 
        // because we are reversing the previous vote and adding the new vote
        voteAdjustment = newVoteValue - existingVote.voteValue;
        // Update the vote record
        const updateVoteParams = {
          TableName: 'votes',
          Key: { commentId: id, userId: userId },
          UpdateExpression: 'SET voteValue = :newVal',
          ExpressionAttributeValues: { ':newVal': newVoteValue },
          ReturnValues: 'ALL_NEW',
        };
        await ddbDocClient.send(new UpdateCommand(updateVoteParams));
      }
    } else {
      // if there is no existing vote create one
      voteAdjustment = newVoteValue;
      const putVoteParams = {
        TableName: 'votes',
        Item: { commentId: id, userId: userId, voteValue: newVoteValue }
      };
      await ddbDocClient.send(new PutCommand(putVoteParams));
    }
    // if voteAdjustment is positive, it means an upvote change; if negative, a downvote change.
    let updateExpression;
    let expressionAttributeValues;
    if (voteAdjustment > 0) {
      updateExpression = 'SET upvotes = upvotes + :inc';
      expressionAttributeValues = { ':inc': voteAdjustment };
    } else {
      updateExpression = 'SET downvotes = downvotes + :inc';
      expressionAttributeValues = { ':inc': -voteAdjustment };
    }
    const updateCommentParams = {
      TableName: tableName,
      Key: { id, postId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };
    const updatedCommentData = await ddbDocClient.send(new UpdateCommand(updateCommentParams));
    // recalc voteScore here:
    const updatedComment = updatedCommentData.Attributes;
    updatedComment.voteScore = (updatedComment.upvotes || 0) - (updatedComment.downvotes || 0);
    res.json(updatedComment);
  } catch (error) {
    console.error('Error voting on comment:', error);
    res.status(500).json({ error: 'Could not vote on comment', details: error.message });
  }
});


/**************************************
* HTTP remove method to delete object *
***************************************/

app.delete('/comments/:id', async (req, res) => {
  const { id } = req.params;
  const { userEmail, postId } = req.query; // Now including postId

  if (!userEmail || !postId) {
    return res.status(400).json({ error: 'Missing userEmail or postId' });
  }

  // Get the comment to check permissions & replies
  const getCommentParams = { 
    TableName: tableName, 
    Key: { id, postId } // Use both keys
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(getCommentParams));
    const comment = data.Item;

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Prevent deletion if it has replies
    if (comment.hasReplies) {
      return res.status(400).json({ error: 'Cannot delete a comment with replies' });
    }

    // Ensure only author or blog owner can delete
    if (comment.userEmail !== userEmail) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    // Proceed with deletion
    const deleteParams = { 
      TableName: tableName, 
      Key: { id, postId }  // Use both keys
    };
    await ddbDocClient.send(new DeleteCommand(deleteParams));

    res.json({ message: 'Comment deleted successfully', id });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Could not delete comment', details: error.message });
  }
});

app.listen(3000, function() {
  console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app