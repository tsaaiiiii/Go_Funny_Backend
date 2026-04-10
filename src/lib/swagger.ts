import swaggerJsdoc from "swagger-jsdoc";

const port = process.env.PORT || 3000;
const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Go Funny API",
      version: "1.0.0",
      description: "Go Funny 旅遊分帳 API 文件",
    },
    servers: [
      { url: serverUrl },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description: "better-auth session cookie（登入後自動帶入）",
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ["./docs/*.yaml"],
};

export const swaggerSpec = swaggerJsdoc(options);
