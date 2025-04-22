import * as i18nModule from "i18n";
import * as path from "path";

const i18n = i18nModule.default || i18nModule;

i18n.configure({
  // setup some locales - other locales default to en silently
  locales: ["en", "de", "es"],

  // where to store json files - defaults to './locales'
  directory: path.join(__dirname, "../locales"),

  // default locale
  defaultLocale: "en",

  // query parameter to switch locale (ie. /home?lang=ch)
  queryParameter: "lang",

  // enable object notation
  objectNotation: true,

  // sync missing keys to other locales
  syncFiles: true,

  // use content-language header to set locale
  // if not specified use default locale
  header: "accept-language",

  register: global,
});

export default i18n;
