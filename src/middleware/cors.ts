import cors from "cors";

export const createCors = () => {
  const allowedOrigins = process.env.TRUSTED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return cors({
    origin: (origin, callback) => {
      if (!origin || !allowedOrigins || allowedOrigins.length === 0) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  });
};
