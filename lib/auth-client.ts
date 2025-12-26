import { createAuthClient } from "better-auth/client";
import { usernameClient, adminClient } from "better-auth/client/plugins";

const getBaseURL = () => {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
    baseURL: getBaseURL(),
    plugins: [usernameClient(), adminClient()],
});

// Helper functions
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const useSession = authClient.useSession;
