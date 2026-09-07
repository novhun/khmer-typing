/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // `next build` and `next dev` share `.next` by default, so building while the
  // dev server is running overwrites the chunks it is serving and the running app
  // dies with "Cannot find module './<id>.js'". `npm run build:check` sets this
  // env var to build into a throwaway directory instead.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
