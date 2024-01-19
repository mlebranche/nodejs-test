import { UserRoleDB } from "types/databaseTypes";
import { handler } from "../index";
import { createTestDataInDB, inspectResource } from "./test.utils";

afterEach(() => {
  jest.resetAllMocks();
  jest.resetModules();
  jest.clearAllMocks();
});

describe("Disallow", () => {
  test("Don`t allow user with the 'guest' role to access 'PATCH' HTTP method and return status code 403", async () => {
    const { userId, resourceId } = await createTestDataInDB({ userRole: "guest" });

    const { statusCode } = await handler({
      pathParameters: { userId, resourceId },
      httpMethod: "PATCH",
    });

    expect(statusCode).toBe(403);
  });

  test("Don`t allow user with invalid 'group_id' to access resource and return status code 403", async () => {
    const { userId, resourceId } = await createTestDataInDB({ userGroupId: "2" });

    const { statusCode } = await handler({
      pathParameters: { userId, resourceId },
      httpMethod: "PATCH",
    });

    expect(statusCode).toBe(403);
  });

  test("Don`t allow the user with invalid 'group_id' to update the resource and return status code 403", async () => {
    const { userId, resourceId } = await createTestDataInDB({ userGroupId: "2" });

    const { statusCode } = await handler({
      pathParameters: { userId, resourceId },
      httpMethod: "PATCH",
    });

    expect(statusCode).toBe(403);
  });
});

describe("Allow", () => {
  test.each<UserRoleDB>(["admin", "guest"])(
    "Allow user with '%s' role to access the 'GET' HTTP method and return status code 200 and proper value",
    async (userRole) => {
      const { userId, resourceId, resourceValue } = await createTestDataInDB({ userRole });

      const { statusCode, body } = await handler({
        pathParameters: { userId, resourceId },
        httpMethod: "GET",
      });

      expect(statusCode).toBe(200);
      expect(body).toStrictEqual({ value: resourceValue });
    },
  );

  test("Return status code 404 for not existing resource", async () => {
    const { userId } = await createTestDataInDB();

    const { statusCode } = await handler({
      pathParameters: { userId, resourceId: "2" },
      httpMethod: "GET",
    });

    expect(statusCode).toBe(404);
  });

  test("Allow proper user to access 'PATCH' HTTP method, update the resource and return updated value", async () => {
    const { userId, resourceId, resourceValue } = await createTestDataInDB();

    const { statusCode, body } = await handler({
      pathParameters: { userId, resourceId },
      httpMethod: "PATCH",
    });

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ value: resourceValue + 1 });
  });

  test("Allow proper user to access 'PATCH' HTTP method and create a new resource with value:0, groupId: userGroupId", async () => {
    const { userId, userGroupId } = await createTestDataInDB({
      userGroupId: "23",
    });

    const resourceId = "100";

    const { statusCode, body } = await handler({
      pathParameters: { userId, resourceId },
      httpMethod: "PATCH",
    });

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ value: 0 });

    const inspectedResource = await inspectResource(resourceId);
    expect(inspectedResource.group_id).toBe(userGroupId);
  });

  test("Allow proper user to update the resource multiple times and return updated values", async () => {
    const { userId, resourceId } = await createTestDataInDB({ resourceValue: 0 });

    const invokeHandler = () =>
      handler({
        pathParameters: { userId, resourceId },
        httpMethod: "PATCH",
      });

    const responses = await Promise.all(
      Array(3)
        .fill(null)
        .map(() => invokeHandler()),
    );

    responses.forEach(({ statusCode, body }, index) => {
      expect(statusCode).toBe(200);
      expect(body).toStrictEqual({ value: index + 1 });
    });
  });
});
