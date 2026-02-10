import type { auth } from "../lib/auth";

declare global {
  namespace Express {
    interface Request {
      user: typeof auth.$Infer.Session.user;
      session: typeof auth.$Infer.Session.session;
    }
  }
}
