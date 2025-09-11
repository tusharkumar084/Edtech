// Clerk configuration
export const clerkConfig = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_YWRvcmVkLWZpc2gtNTQuY2xlcmsuYWNjb3VudHMuZGV2JA",
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",
  afterSignInUrl: "/dashboard",
  afterSignUpUrl: "/role-selection",
};
