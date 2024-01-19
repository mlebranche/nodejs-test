import type { APIGatewayEvent } from "aws-lambda";

import { AllowedHTTPMethod } from "types/allowedHTTPMethods";
import { authorize } from "./src/authorized";
import { updateResource, getResourceValue } from "./src/manageResource";
import { HandlerResponse } from "types/handlerResponse";
import { PathParameters } from "types/pathParameters";
import { AuthorizationContext } from "types/authorization";
import { HTTPError } from "error/httpError";

function handleHTTPError(error: unknown): HandlerResponse {
  if (error instanceof HTTPError) {
    return error.toHTTPResponse();
  }
  return { statusCode: 500, body: JSON.stringify({ error }) };
}

async function handleGetRequest(resourceId: string): Promise<HandlerResponse> {
  const value = await getResourceValue(resourceId);
  return { statusCode: 200, body: { value } };
}

async function handlePatchRequest(
  resourceId: string,
  context: AuthorizationContext,
): Promise<HandlerResponse> {
  const resourceValue = await updateResource(resourceId, context);
  return { statusCode: 200, body: { value: resourceValue } };
}

export const handler = async function (event: Partial<APIGatewayEvent>): Promise<HandlerResponse> {
  try {
    const { userId, resourceId } = event.pathParameters as PathParameters;
    const action = event.httpMethod as AllowedHTTPMethod; // Assume the value is either GET or PATCH

    const context = await authorize(userId, resourceId, action);

    switch (action) {
      case "GET":
        return handleGetRequest(resourceId);
      case "PATCH":
        return handlePatchRequest(resourceId, context);
    }
  } catch (error: unknown) {
    return handleHTTPError(error);
  }
};
