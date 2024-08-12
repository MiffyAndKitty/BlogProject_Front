module.exports = {
    apps: [
      {
        name: 'react-dev',
        script: 'npm',
        args: 'start',
        env: {
          NODE_ENV: 'development',
        },
      },
      {
        name: 'react-prod',
        script: 'server.js',
        env: {
          NODE_ENV: 'production',
        },
      },
    ],
  };
  