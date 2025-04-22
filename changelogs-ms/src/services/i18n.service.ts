import * as i18nModule from "i18n";
import * as path from "path";

const i18n = i18nModule.default || i18nModule;

i18n.configure({
  locales: ["en", "de", "es"],
  directory: path.join(__dirname, "../locales"),
  header: "accept-language",
  register: global,
});

export default i18n;
