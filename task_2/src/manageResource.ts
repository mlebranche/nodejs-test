import { TableNames, dbClient } from "common/db";
import { Resource } from "models/resource";
import { AuthorizationContext } from "types/authorization";
import { ResourceDB } from "types/databaseTypes";

export async function getResourceValue(resourceId: string): Promise<number> {
  const resource = await Resource.getById(resourceId);
  return resource.value;
}

export async function updateResource(
  resourceId: string,
  context: AuthorizationContext,
): Promise<number> {
  const updateOperation = await dbClient
    .update({
      Key: { id: resourceId },
      TableName: TableNames.resources,
      ExpressionAttributeValues: {
        ":increment": 1,
        ":negativeOne": -1,
        ":groupId": context.user.groupId,
      },
      ExpressionAttributeNames: {
        "#value": "value",
        "#groupId": "group_id",
      },
      UpdateExpression:
        "SET #value = if_not_exists(#value, :negativeOne) + :increment, #groupId = if_not_exists(#groupId, :groupId)",
      ReturnValues: "ALL_NEW",
    })
    .promise();

  const value: number | undefined = updateOperation.Attributes?.value;

  if (value === undefined) {
    throw new Error("Can not update the resource");
  }

  return value;
}
