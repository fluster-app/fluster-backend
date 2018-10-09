var i18n = require("i18n");

i18n.configure({
    locales:['en', 'de', 'fr', 'it'],
    directory: __dirname + '/locales',
    defaultLocale: 'en',
    objectNotation: true
});
