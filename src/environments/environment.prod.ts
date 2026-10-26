import packageInfo from '../../package.json';

export const environment = {
  production: true,
  // Public production endpoint; never put credentials in the browser bundle.
  baseUrl: 'https://18.226.182.232/api',
  backendDomain: '18.226.182.232',
  version: packageInfo.version,
};
