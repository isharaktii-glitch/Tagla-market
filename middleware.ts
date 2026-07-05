import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'si', 'ta'],
  defaultLocale: 'si'
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
