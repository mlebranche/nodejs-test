import { ResourceDB } from "types/databaseTypes";
import { dbClient, TableNames } from "../common/db";

export class Resource {
  id;
  value;
  groupId;

  constructor(input: { id: string; value: number; group_id: string }) {
    this.id = input.id;
    this.value = input.value;
    this.groupId = input.group_id;
  }

  static async getById(id: string) {
    const res = await dbClient.get({ TableName: TableNames.resources, Key: { id } }).promise();

    if (!res.Item) {
      throw new Error("Resource does not exist");
    }

    return new Resource(res.Item as ResourceDB);
  }
}
