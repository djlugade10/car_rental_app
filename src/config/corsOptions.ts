import type { CorsOptions } from "cors";

const allowedOrigins = [
  "http://localhost:3000",
];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const vercelPattern = /^https:\/\/multivendor-[a-z0-9-]+\.vercel\.app$/;

    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      vercelPattern.test(origin)
    ) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
