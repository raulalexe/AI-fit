import { env } from './config/env';
import { AuthController } from './controllers/auth.controller';
import { createSupabaseAdminClient, createSupabaseClient } from './lib/supabaseClient';
import { AuthService } from './services/auth.service';
import { TokenService } from './utils/token';

const supabaseAdminClient = createSupabaseAdminClient(env.supabaseUrl, env.supabaseServiceRoleKey);
const supabaseAuthClient = createSupabaseClient(env.supabaseUrl, env.supabaseAnonKey);

const tokenService = new TokenService({
  secret: env.jwtSecret,
  expiresInSeconds: env.jwtExpiresInSeconds,
});

const authService = new AuthService({
  adminClient: supabaseAdminClient,
  authClient: supabaseAuthClient,
  tokenService,
});

export const authController = new AuthController(authService);
export { authService, supabaseAdminClient, supabaseAuthClient, tokenService };
