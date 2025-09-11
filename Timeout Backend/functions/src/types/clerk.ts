// Clerk webhook event types
export interface ClerkWebhookEvent {
  data: any;
  object: string;
  type: ClerkEventType;
}

export type ClerkEventType =
  | "user.created"
  | "user.updated" 
  | "user.deleted"
  | "session.created"
  | "session.ended"
  | "email.created"
  | "sms.created";

export interface ClerkUser {
  id: string;
  object: "user";
  username?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  birthday?: string;
  profile_image_url: string;
  primary_email_address_id?: string;
  primary_phone_number_id?: string;
  primary_web3_wallet_id?: string;
  password_enabled: boolean;
  two_factor_enabled: boolean;
  totp_enabled: boolean;
  backup_code_enabled: boolean;
  email_addresses: ClerkEmailAddress[];
  phone_numbers: ClerkPhoneNumber[];
  web3_wallets: ClerkWeb3Wallet[];
  external_accounts: ClerkExternalAccount[];
  public_metadata: Record<string, any>;
  private_metadata: Record<string, any>;
  unsafe_metadata: Record<string, any>;
  last_sign_in_at?: number;
  banned: boolean;
  locked: boolean;
  lockout_expires_in_seconds?: number;
  verification_attempts_remaining?: number;
  created_at: number;
  updated_at: number;
}

export interface ClerkEmailAddress {
  id: string;
  object: "email_address";
  email_address: string;
  verification?: ClerkVerification;
  linked_to: ClerkLinkedTo[];
}

export interface ClerkPhoneNumber {
  id: string;
  object: "phone_number";
  phone_number: string;
  reserved_for_second_factor: boolean;
  default_second_factor: boolean;
  verification?: ClerkVerification;
  linked_to: ClerkLinkedTo[];
}

export interface ClerkWeb3Wallet {
  id: string;
  object: "web3_wallet";
  web3_wallet: string;
  verification?: ClerkVerification;
}

export interface ClerkExternalAccount {
  id: string;
  object: "external_account";
  provider: string;
  identification_id: string;
  provider_user_id: string;
  approved_scopes: string;
  email_address: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  image_url: string;
  username?: string;
  public_metadata: Record<string, any>;
  label?: string;
  verification?: ClerkVerification;
}

export interface ClerkVerification {
  status: "verified" | "unverified" | "transferable" | "failed" | "expired";
  strategy: string;
  external_verification_redirect_url?: string;
  error?: ClerkError;
  expire_at?: number;
  nonce?: string;
}

export interface ClerkLinkedTo {
  type: string;
  id: string;
}

export interface ClerkError {
  code: string;
  message: string;
  long_message?: string;
  meta?: Record<string, any>;
}

// JWT token payload structure
export interface ClerkJWTPayload {
  azp?: string;
  exp: number;
  iat: number;
  iss: string;
  nbf?: number;
  sid: string;
  sub: string; // Clerk user ID
  [key: string]: any;
}
