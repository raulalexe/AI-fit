import jwt from 'jsonwebtoken';

export interface TokenPayload {
  sub: string;
  email?: string;
}

export interface TokenServiceOptions {
  secret: string;
  expiresInSeconds: number;
}

export interface SignedToken {
  token: string;
  expiresAt: number;
}

export class TokenService {
  private readonly secret: string;
  private readonly expiresInSeconds: number;

  constructor(options: TokenServiceOptions) {
    this.secret = options.secret;
    this.expiresInSeconds = options.expiresInSeconds;
  }

  sign(payload: TokenPayload): SignedToken {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + this.expiresInSeconds;

    const token = jwt.sign(payload, this.secret, {
      expiresIn: this.expiresInSeconds,
    });

    return { token, expiresAt };
  }
}
