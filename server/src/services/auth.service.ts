import type { SupabaseClient, User, Session, AuthError } from '@supabase/supabase-js';
import { AppError } from '../errors/appError';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { SignedToken, TokenService } from '../utils/token';

interface AuthServiceDependencies {
  adminClient: SupabaseClient;
  authClient: SupabaseClient;
  tokenService: TokenService;
}

interface AuthTokens {
  api: SignedToken;
  supabase: {
    accessToken: string;
    refreshToken: string | null;
    expiresAt: number | null;
    tokenType: string;
  };
}

export interface AuthResponse {
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    createdAt: string | null;
    lastSignInAt: string | null;
  };
  tokens: AuthTokens;
}

const toAppError = (error: AuthError, fallbackStatus = 400) =>
  new AppError(error.message, 'status' in error && error.status ? error.status : fallbackStatus, {
    name: error.name,
  });

export class AuthService {
  private readonly adminClient: SupabaseClient;
  private readonly authClient: SupabaseClient;
  private readonly tokenService: TokenService;

  constructor(dependencies: AuthServiceDependencies) {
    this.adminClient = dependencies.adminClient;
    this.authClient = dependencies.authClient;
    this.tokenService = dependencies.tokenService;
  }

  async register(payload: RegisterInput): Promise<AuthResponse> {
    const { email, password, firstName, lastName } = payload;

    const { data, error } = await this.adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        firstName: firstName ?? null,
        lastName: lastName ?? null,
      },
    });

    if (error) {
      throw toAppError(error, error.status === 400 ? 409 : 400);
    }

    const createdUser = data?.user;

    if (!createdUser) {
      throw new AppError('Unable to complete registration', 500);
    }

    const authResult = await this.authenticateWithPassword(email, password, 500, {
      message: 'Unable to sign in newly created user',
    });

    return this.buildAuthResponse(authResult.user ?? createdUser, authResult.session);
  }

  async login(payload: LoginInput): Promise<AuthResponse> {
    const { email, password } = payload;

    const authResult = await this.authenticateWithPassword(email, password, 401, {
      message: 'Invalid email or password',
    });

    const user = authResult.user;

    if (!user) {
      throw new AppError('Authentication failed: missing user information', 500);
    }

    return this.buildAuthResponse(user, authResult.session);
  }

  private async authenticateWithPassword(
    email: string,
    password: string,
    fallbackStatus: number,
    defaultError: { message: string },
  ) {
    const { data, error } = await this.authClient.auth.signInWithPassword({ email, password });

    if (error) {
      throw toAppError(
        error,
        'status' in error && error.status ? error.status : fallbackStatus,
      );
    }

    const session = data.session;

    if (!session) {
      throw new AppError(defaultError.message, fallbackStatus);
    }

    return {
      user: data.user,
      session,
    };
  }

  private buildAuthResponse(user: User, session: Session): AuthResponse {
    const apiToken = this.tokenService.sign({
      sub: user.id,
      email: user.email ?? undefined,
    });

    const tokens: AuthTokens = {
      api: apiToken,
      supabase: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token ?? null,
        expiresAt: session.expires_at ?? null,
        tokenType: session.token_type ?? 'bearer',
      },
    };

    return {
      user: {
        id: user.id,
        email: user.email ?? null,
        firstName: (user.user_metadata as Record<string, string> | null | undefined)?.firstName ?? null,
        lastName: (user.user_metadata as Record<string, string> | null | undefined)?.lastName ?? null,
        createdAt: user.created_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
      },
      tokens,
    };
  }
}
