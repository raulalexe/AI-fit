import type { AuthError, Session, User } from '@supabase/supabase-js';
import { AuthService } from '../src/services/auth.service';
import { TokenService } from '../src/utils/token';
import { AppError } from '../src/errors/appError';

const buildTokenService = () =>
  new TokenService({
    secret: 'unit-test-secret-with-minimum-length-32-characters',
    expiresInSeconds: 3600,
  });

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-123',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'test@example.com',
  email_confirmed_at: undefined,
  phone: undefined,
  confirmed_at: undefined,
  last_sign_in_at: undefined,
  app_metadata: {},
  user_metadata: { firstName: 'Test', lastName: 'User' },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  factors: [],
  ...overrides,
});

const buildSession = (user: User): Session => ({
  access_token: 'access-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'refresh-token',
  user,
});

const createSupabaseAdminMock = (implementation: {
  createUser: ReturnType<typeof jest.fn>;
}) =>
  ({
    auth: {
      admin: {
        createUser: implementation.createUser,
      },
    },
  } as unknown);

const createSupabaseAuthMock = (implementation: {
  signInWithPassword: ReturnType<typeof jest.fn>;
}) =>
  ({
    auth: {
      signInWithPassword: implementation.signInWithPassword,
    },
  } as unknown);

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a user and returns tokens', async () => {
    const user = buildUser();
    const session = buildSession(user);

    const createUserMock = jest.fn().mockResolvedValue({ data: { user }, error: null });
    const signInMock = jest.fn().mockResolvedValue({ data: { user, session }, error: null });

    const authService = new AuthService({
      adminClient: createSupabaseAdminMock({ createUser: createUserMock }) as any,
      authClient: createSupabaseAuthMock({ signInWithPassword: signInMock }) as any,
      tokenService: buildTokenService(),
    });

    const result = await authService.register({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(createUserMock).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: { firstName: 'Test', lastName: 'User' },
    });

    expect(signInMock).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.user.id).toBe(user.id);
    expect(result.tokens.api.token).toEqual(expect.any(String));
    expect(result.tokens.supabase.accessToken).toBe(session.access_token);
    expect(result.tokens.supabase.refreshToken).toBe(session.refresh_token);
  });

  it('throws an AppError when login credentials are invalid', async () => {
    const signInMock = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: {
        message: 'Invalid login credentials',
        status: 400,
        name: 'AuthApiError',
      } as AuthError,
    });

    const authService = new AuthService({
      adminClient: createSupabaseAdminMock({ createUser: jest.fn() }) as any,
      authClient: createSupabaseAuthMock({ signInWithPassword: signInMock }) as any,
      tokenService: buildTokenService(),
    });

    await expect(
      authService.login({
        email: 'bad@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toBeInstanceOf(AppError);

    expect(signInMock).toHaveBeenCalledWith({
      email: 'bad@example.com',
      password: 'wrongpassword',
    });
  });
});
