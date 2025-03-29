module.exports = {
    require: [
      'ts-node/register',
      'dotenv/config'
    ],
    extension: ['ts'],
    spec: 'test/**/*.test.ts',
    timeout: 5000
  };