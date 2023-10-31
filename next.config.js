/** @type {import('next').NextConfig} */

const rewrites = () => {
    const dev = process.env.NODE_ENV !== 'production'
    // const des_url = dev ? 'http://106.14.249.226:8002/' : '/'
    // const des_url_2 = dev ? 'http://106.14.249.226:8003/' : '/'
    const des_url = 'http://106.14.249.226:8002/'
    const des_url_2 = 'http://106.14.249.226:8003/'
    const des_spex_url = 'https://calibration.app.spex.website/api/v1/spex'
    return [
      {
        source: "/api/getdata",
        destination: `${des_url}/getdata`,
      },
      {
        source: "/api/getFamilyCount",
        destination: `${des_url_2}/getFamilyCount`,
      },
      // {
      //   source: "/api/v1/spex/:path*",
      //   destination: `${des_spex_url}/:path*`
      // }
    ]
    // return [
    //   {
    //     source: "/api/:path*",
    //     destination: `${des_url}/:path*`,
    //   },
    // ];
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
