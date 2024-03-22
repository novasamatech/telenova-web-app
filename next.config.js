/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:any*',
        destination: '/',
      },
    ];
  },
};

nextConfig.webpack = (config, context) => {
  config.module.rules.push({
    test: /\.svg$/,
    use: '@svgr/webpack',
  });
  return config;
};

nextConfig.env = {
  NEXT_PUBLIC_BOT_API_URL: process.env.NEXT_PUBLIC_BOT_API_URL,
  NEXT_PUBLIC_BOT_ADDRESS: process.env.NEXT_PUBLIC_BOT_ADDRESS,
  NEXT_PUBLIC_WEB_APP_ADDRESS: process.env.NEXT_PUBLIC_WEB_APP_ADDRESS,
  NEXT_PUBLIC_WEB_APP_URL: process.env.NEXT_PUBLIC_WEB_APP_URL,
};

module.exports = nextConfig;
