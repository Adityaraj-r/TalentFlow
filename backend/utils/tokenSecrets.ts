const weakProductionSecrets = new Set([
  'secret',
  'fallback_secret',
  'password',
  'changeme',
  'change-me',
]);

const resolveSecret = (names: string[], label: string): string => {
  const configured = names.map((name) => process.env[name]?.trim()).find(Boolean);
  const isProduction = process.env.NODE_ENV === 'production';

  if (!configured) {
    if (isProduction) {
      throw new Error(`Missing required ${label} secret. Configure one of: ${names.join(', ')}.`);
    }
    // Preserve the prior local middleware fallback; production never accepts this path.
    return 'secret';
  }

  const isPlaceholder = /^(replace[-_ ]with|your[-_ ]|example|placeholder)/i.test(configured);
  if (isProduction && (
    Buffer.byteLength(configured, 'utf8') < 32 ||
    weakProductionSecrets.has(configured.toLowerCase()) ||
    isPlaceholder
  )) {
    throw new Error(`The configured ${label} secret is insecure. Use at least 32 random bytes.`);
  }

  return configured;
};

export const getAccessTokenSecret = (): string =>
  resolveSecret(['ACCESS_TOKEN_SECRET', 'JWT_SECRET'], 'access-token');

export const getRefreshTokenSecret = (): string =>
  resolveSecret(['REFRESH_TOKEN_SECRET', 'JWT_SECRET'], 'refresh-token');

export const validateProductionTokenSecrets = (): void => {
  if (process.env.NODE_ENV === 'production') {
    getAccessTokenSecret();
    getRefreshTokenSecret();
  }
};
