import fullConfig from '../../config.json';

const isProd = process.env.production;
const config = isProd ? fullConfig.prod : fullConfig.dev;

export default config;
