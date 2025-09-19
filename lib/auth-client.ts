import { createAuthClient } from "better-auth/client"
import { adminClient } from "better-auth/client/plugins"
import { usernameClient } from "better-auth/client/plugins"
export const authClient = createAuthClient({
    plugins: [
        usernameClient(),
        adminClient()
    ]
})