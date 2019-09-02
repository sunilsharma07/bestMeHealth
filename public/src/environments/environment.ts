// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  base_url: "http://192.168.2.162:3000/v1/",
  customer_image_url: "http://192.168.2.162:3000/uploads/customer/",
  placeHolderImage: "http://192.168.2.162:3000/uploads/logo/logo.jpg"
};
