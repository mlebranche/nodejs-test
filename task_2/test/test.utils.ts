import { DynamoDB } from "aws-sdk";
import { ResourceDB, UserRoleDB } from "types/databaseTypes";

export type CreateTestDataInDBInput = {
  userGroupId?: string;
  userRole?: UserRoleDB;
  resourceId?: string;
  resourceValue?: number;
  resourceGroupId?: string;
  groupId?: string;
};

export type CreateTestDataInDBResponse = {
  userId: string;
  resourceId: string;
  resourceValue: number;
  userGroupId: string;
};

const dbClient = new DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "eu-west-1",
  ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: "local",
  }),
});

export async function createTestDataInDB(
  input?: CreateTestDataInDBInput,
): Promise<CreateTestDataInDBResponse> {
  const userId = "1";
  const groupId = input?.groupId || "1";
  const resourceId = input?.resourceId || "1";

  const resourceGroupId = input?.resourceGroupId || "1";
  const resourceValue = input?.resourceValue ?? 1;

  const userRole: UserRoleDB = input?.userRole || "admin";
  const userGroupId = input?.userGroupId || "1";

  await dbClient
    .put({
      TableName: "groups",
      Item: {
        id: groupId,
      },
    })
    .promise();

  await dbClient
    .put({
      TableName: "users",
      Item: {
        id: userId,
        group_id: userGroupId,
        role: userRole,
      },
    })
    .promise();

  await dbClient
    .put({
      TableName: "resources",
      Item: {
        id: resourceId,
        group_id: resourceGroupId,
        value: resourceValue,
      },
    })
    .promise();

  return { userId, resourceId, resourceValue, userGroupId };
}

export async function inspectResource(id: string): Promise<ResourceDB> {
  const response = await dbClient
    .get({
      TableName: "resources",
      Key: { id },
    })
    .promise();

  return response.Item as ResourceDB;
}
