/** @type {import('next').NextConfig} */

const rewrites = () => {
    const dev = process.env.NODE_ENV !== 'production'
    // const des_url = dev ? 'http://106.14.249.226:8002/' : '/'
    // const des_url_2 = dev ? 'http://106.14.249.226:8003/' : '/'
    const des_url = 'http://47.88.77.217:8002/'
    const des_url_2 = 'http://47.88.77.217:8003/'
    // const des_spex_url = 'https://calibration.app.spex.website/api/v1/spex'
    return [
      {
        source: "/api/:path*",
        destination: `${des_url}/:path*`,
      },
      {
        source: "/api2/:path*",
        destination: `${des_url_2}/:path*`,
      },
    ]
  };
  
const nextConfig = {
    i18n: {
        locales: ['fil', 'fit'],
        defaultLocale: 'fil',
        localeDetection: false,
    },
    async redirects() {
      return [
        {
          source: '/',
          destination: '/staking',
          permanent: false,
        },
      ]
    },
    rewrites
}

module.exports = nextConfig
