export const config = {
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  api: {
    port: parseInt(process.env.PORT || '3000', 10),
    prefix: 'api',
  },
} as const;
