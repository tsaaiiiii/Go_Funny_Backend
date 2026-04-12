import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import type { ZodType } from "zod";

import {
  badRequestErrorResponseSchema,
  contributionSchema,
  createContributionBodySchema,
  createExpenseBodySchema,
  createTripBodySchema,
  errorResponseSchema,
  expenseSchema,
  invitationSchema,
  invitationWithTripSchema,
  settlementSchema,
  tokenParamsSchema,
  tripDetailSchema,
  tripIdExpenseIdParamsSchema,
  tripIdMemberIdParamsSchema,
  tripIdParamsSchema,
  tripMembershipSchema,
  tripMembershipWithUserSchema,
  tripSchema,
  unauthorizedErrorResponseSchema,
  updateTripBodySchema,
} from "@/openapi/schemas";

const port = process.env.PORT || 3000;
const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "better-auth.session_token",
  description: "better-auth session cookie（登入後自動帶入）",
});

const jsonContent = (schema: ZodType) => ({
  "application/json": {
    schema,
  },
});

const jsonResponse = (schema: ZodType, description: string) => ({
  description,
  content: jsonContent(schema),
});

const unauthorizedResponse = jsonResponse(
  unauthorizedErrorResponseSchema,
  "未登入",
);

registry.registerPath({
  method: "post",
  path: "/trips",
  tags: ["Trips"],
  operationId: "createTrip",
  summary: "建立旅程",
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      required: true,
      content: jsonContent(createTripBodySchema),
    },
  },
  responses: {
    201: jsonResponse(tripSchema, "建立成功"),
    400: jsonResponse(badRequestErrorResponseSchema, "請求格式錯誤或建立失敗"),
    401: unauthorizedResponse,
  },
});

registry.registerPath({
  method: "get",
  path: "/trips",
  tags: ["Trips"],
  operationId: "getTrips",
  summary: "取得所有旅程",
  security: [{ cookieAuth: [] }],
  responses: {
    200: jsonResponse(zArray(tripDetailSchema), "旅程列表"),
    401: unauthorizedResponse,
  },
});

registry.registerPath({
  method: "get",
  path: "/trips/{tripId}",
  tags: ["Trips"],
  operationId: "getTripById",
  summary: "取得單一旅程",
  security: [{ cookieAuth: [] }],
  request: {
    params: tripIdParamsSchema,
  },
  responses: {
    200: jsonResponse(tripDetailSchema, "旅程資料"),
    401: unauthorizedResponse,
    404: jsonResponse(errorResponseSchema, "旅程不存在"),
  },
});

registry.registerPath({
  method: "patch",
  path: "/trips/{tripId}",
  tags: ["Trips"],
  operationId: "updateTrip",
  summary: "編輯旅程",
  security: [{ cookieAuth: [] }],
  request: {
    params: tripIdParamsSchema,
    body: {
      required: true,
      content: jsonContent(updateTripBodySchema),
    },
  },
  responses: {
    200: jsonResponse(tripSchema, "更新成功"),
    400: jsonResponse(badRequestErrorResponseSchema, "請求格式錯誤或更新失敗"),
    401: unauthorizedResponse,
    404: jsonResponse(errorResponseSchema, "旅程不存在"),
  },
});

registry.registerPath({
  method: "delete",
  path: "/trips/{tripId}",
  tags: ["Trips"],
  operationId: "deleteTrip",
  summary: "刪除旅程",
  security: [{ cookieAuth: [] }],
  request: {
    params: tripIdParamsSchema,
  },
  responses: {
    204: { description: "刪除成功" },
    400: jsonResponse(badRequestErrorResponseSchema, "請求格式錯誤或刪除失敗"),
    403: jsonResponse(errorResponseSchema, "只有旅程建立者可以刪除旅程"),
    401: unauthorizedResponse,
    404: jsonResponse(errorResponseSchema, "旅程不存在"),
  },
});

registry.registerPath({
  method: "post",
  path: "/expenses/{tripId}",
  tags: ["Expenses"],
  operationId: "createTripExpense",
  summary: "新增費用",
  security: [{ cookieAuth: [] }],
  request: {
    params: tripIdParamsSchema,
    body: {
      required: true,
      content: jsonContent(createExpenseBodySchema),
    },
  },
  responses: {
    201: jsonResponse(expenseSchema, "新增成功"),
    400: jsonResponse(badRequestErrorResponseSchema, "請求格式錯誤或新增失敗"),
    401: unauthorizedResponse,
    404: jsonResponse(errorResponseSchema, "旅程不存在"),
  },
});

registry.registerPath({
  method: "get",
  path: "/expenses/{tripId}",
  tags: ["Expenses"],
  operationId: "getTripExpenses",
  summary: "取得費用列表",
  security: [{ cookieAuth: [] }],
  request: {
    params: tripIdParamsSchema,
  },
  responses: {
    200: jsonResponse(zArray(expenseSchema), "費用列表"),
    401: unauthorizedResponse,
    404: jsonResponse(errorResponseSchema, "旅程不存在"),
  },
});

registry.registerPath({
  method: "delete",
  path: "/expenses/{tripId}/{expenseId}",
  tags: ["Expenses"],
  operationId: "deleteTripExpense",
  summary: "刪除費用",
  security: [{ cookieAuth: [] }],
  request: {
    params: tripIdExpenseIdParamsSchema,
  },
  responses: {
    204: { description: "刪除成功" },
    400: jsonResponse(badRequestErrorResponseSchema, "請求格式錯誤或刪除失敗"),
    401: unauthorizedResponse,
    404: jsonResponse(errorResponseSchema, "費用不存在"),
  },
});

registry.registerPath({
  method: "post",
  path: "/contributions/{tripId}",
  tags: ["Contributions"],
  operationId: "createTripContribution",
  summary: "新增公費",
  security: [{ cookieAuth: [] }],
  request: {
    params: tripIdParamsSchema,
    body: {
      required: true,
      content: jsonContent(createContributionBodySchema),
    },
  },
  responses: {
    201: jsonResponse(contributionSchema, "新增成功"),
    400: jsonResponse(badRequestErrorResponseSchema, "請求格式錯誤或新增失敗"),
    401: unauthorizedResponse,
    404: jsonResponse(errorResponseSchema, "旅程不存在"),
  },
});

registry.registerPath({
  method: "get",
  path: "/contributions/{tripId}",
  tags: ["Contributions"],
  operationId: "getTripContributions",
  summary: "取得公費列表",
  security: [{ cookieAuth: [] }],
  request: {
    params: tripIdParamsSchema,
  },
  responses: {
    200: jsonResponse(zArray(contributionSchema), "公費列表"),
    401: unauthorizedResponse,
    404: jsonResponse(errorResponseSchema, "旅程不存在"),
  },
});

registry.registerPath({
  method: "get",
  path: "/members/{tripId}",
  tags: ["Members"],
  operationId: "getTripMembers",
  summary: "取得旅程成員列表",
  security: [{ cookieAuth: [] }],
  request: {
    params: tripIdParamsSchema,
  },
  responses: {
    200: jsonResponse(zArray(tripMembershipWithUserSchema), "成員列表"),
    401: unauthorizedResponse,
    404: jsonResponse(errorResponseSchema, "旅程不存在"),
  },
});

registry.registerPath({
  method: "delete",
  path: "/members/{tripId}/{memberId}",
  tags: ["Members"],
  operationId: "deleteTripMember",
  summary: "刪除旅程成員",
  security: [{ cookieAuth: [] }],
  request: {
    params: tripIdMemberIdParamsSchema,
  },
  responses: {
    204: { description: "刪除成功" },
    400: jsonResponse(badRequestErrorResponseSchema, "請求格式錯誤或刪除失敗"),
    403: jsonResponse(errorResponseSchema, "只有旅程建立者可以刪除成員"),
    401: unauthorizedResponse,
    404: jsonResponse(errorResponseSchema, "成員不存在"),
  },
});

registry.registerPath({
  method: "get",
  path: "/settlement/{tripId}",
  tags: ["Settlements"],
  operationId: "getTripSettlement",
  summary: "取得結算結果",
  security: [{ cookieAuth: [] }],
  request: {
    params: tripIdParamsSchema,
  },
  responses: {
    200: jsonResponse(settlementSchema, "結算結果"),
    401: unauthorizedResponse,
    404: jsonResponse(errorResponseSchema, "旅程不存在"),
  },
});

registry.registerPath({
  method: "post",
  path: "/invitations/{tripId}",
  tags: ["Invitations"],
  operationId: "createTripInvitation",
  summary: "建立邀請連結",
  security: [{ cookieAuth: [] }],
  request: {
    params: tripIdParamsSchema,
  },
  responses: {
    201: jsonResponse(invitationSchema, "建立成功"),
    400: jsonResponse(badRequestErrorResponseSchema, "請求格式錯誤或建立失敗"),
    401: unauthorizedResponse,
    404: jsonResponse(errorResponseSchema, "旅程不存在"),
  },
});

registry.registerPath({
  method: "get",
  path: "/invitations/{token}",
  tags: ["Invitations"],
  operationId: "getInvitationByToken",
  summary: "透過 token 取得邀請資訊",
  security: [],
  request: {
    params: tokenParamsSchema,
  },
  responses: {
    200: jsonResponse(invitationWithTripSchema, "邀請資訊"),
    404: jsonResponse(errorResponseSchema, "邀請不存在"),
  },
});

registry.registerPath({
  method: "post",
  path: "/invitations/{token}/accept",
  tags: ["Invitations"],
  operationId: "acceptTripInvitation",
  summary: "接受邀請",
  security: [{ cookieAuth: [] }],
  request: {
    params: tokenParamsSchema,
  },
  responses: {
    201: jsonResponse(tripMembershipSchema, "接受成功"),
    400: jsonResponse(badRequestErrorResponseSchema, "請求格式錯誤或接受失敗"),
    401: unauthorizedResponse,
    404: jsonResponse(errorResponseSchema, "邀請不存在"),
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Go Funny API",
    version: "1.0.0",
    description: "Go Funny 旅遊分帳 API 文件",
  },
  servers: [{ url: serverUrl }],
  tags: [
    { name: "Trips", description: "旅程相關 API" },
    { name: "Expenses", description: "費用相關 API" },
    { name: "Contributions", description: "公費相關 API" },
    { name: "Members", description: "成員相關 API" },
    { name: "Settlements", description: "結算相關 API" },
    { name: "Invitations", description: "邀請相關 API" },
  ],
  security: [{ cookieAuth: [] }],
});

function zArray(schema: ZodType) {
  return schema.array();
}
