import { HTTPError } from "error/httpError";
import { Resource } from "models/resource";
import { Role } from "models/role";
import { User } from "models/user";
import { AllowedHTTPMethod } from "types/allowedHTTPMethods";
import { AuthorizationContext } from "types/authorization";

const ROLES = {
  admin: Role.from("admin"),
  guest: Role.from("guest"),
};

function createAuthorizationContext(user: User): AuthorizationContext {
  return { user };
}

async function getResourceFromDB(id: string): Promise<Resource | undefined> {
  try {
    return await Resource.getById(id);
  } catch (error) {
    if (error instanceof Error && error.message === "Resource does not exist") {
      return undefined;
    }
    throw error;
  }
}

async function authorizeUserByRole(userId: string, allowedRoles: symbol[]): Promise<User> {
  const user = await User.getById(userId);
  if (!allowedRoles.includes(user.role)) {
    throw HTTPError.Forbidden;
  }
  return user;
}

async function authorizeGetRequest(
  userId: string,
  resourceId: string,
): Promise<AuthorizationContext> {
  const allowedRoles = [ROLES.admin, ROLES.guest];

  const user = await authorizeUserByRole(userId, allowedRoles);

  const resource = await getResourceFromDB(resourceId);

  if (!resource) {
    throw HTTPError.NotFound;
  }

  if (resource.groupId !== user.groupId) {
    throw HTTPError.Forbidden;
  }

  return createAuthorizationContext(user);
}

async function authorizePatchRequest(
  userId: string,
  resourceId: string,
): Promise<AuthorizationContext> {
  const allowedRoles = [ROLES.admin];

  const user = await authorizeUserByRole(userId, allowedRoles);

  const resource: Resource | undefined = await getResourceFromDB(resourceId);

  if (resource && resource.groupId !== user.groupId) {
    throw HTTPError.Forbidden;
  }

  return createAuthorizationContext(user);
}

export async function authorize(
  userId: string,
  resourceId: string,
  action: AllowedHTTPMethod,
): Promise<AuthorizationContext> {
  switch (action) {
    case "GET":
      return authorizeGetRequest(userId, resourceId);
    case "PATCH":
      return authorizePatchRequest(userId, resourceId);
  }
}
