// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  APIURL: 'https://gommqp-api-dev.azure.chevron.com/',
  sasString: 'https://gommqpt32320190910dcvx.blob.core.windows.net/upload-pdf?sp=racwdl&st=2020-04-07T06:42:02Z&se=2020-12-08T05:42:00Z&sv=2019-02-02&sr=c&sig=4k0M0XcBE2cW6a177EHU1t7bJKDNUVnGvMUvH%2FV7F0g%3D',
  sas: '?sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2021-04-16T05:37:39Z&st=2020-04-15T21:37:39Z&spr=https,http&sig=ORi0KMqLIH7S%2Fn1iDc9q0cuM9aN1k8M4ZZ8wj9jwDoU%3D',
  account: 'gommqpt32320190910dcvx',
  accountKey: '2k4Zcqyk1dMi7gCxOXAkF/npERoIVZz3nkIL66ZKcFER8sLLv0p8Vly1HnD3Y6mh4E2OB2KEtzWkuc0Kv+Xvzw==',
  msal: {
    clientId: '723ee06d-058a-4a66-aab1-4b0810b3d1c6',
    authority: 'https://login.microsoftonline.com/chevron.onmicrosoft.com/',
    redirectUri: 'https://gommqp-dev.azure.chevron.com/',
    protectedResourceMap: [
      ['chevron.onmicrosoft.comv1.0/me', ['user.read']]
    ],
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
