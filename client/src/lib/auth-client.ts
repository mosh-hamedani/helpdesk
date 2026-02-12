import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "../../../server/src/lib/auth";

export const { signIn, signOut, useSession } = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
