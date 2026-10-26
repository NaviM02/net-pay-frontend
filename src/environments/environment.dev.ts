import packageInfo from '../../package.json';

export const environment = {
  production: false,
  baseUrl: 'http://localhost:8080/api',
  backendDomain: 'localhost:8080',
  version: packageInfo.version,
};
