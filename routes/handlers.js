const app = module.parent.exports.app;

const authenticationHandler = require('../controllers/authentications/authenticationHandler');
const facebookHandler = require('../controllers/authentications/facebookAuth');
const googleHandler = require('../controllers/authentications/googleAuth');

const securityPolicy = require('../controllers/authentications/securityPolicy');

app.post('/v1/api/auth/facebook/mobile', facebookHandler.handleFacebookMobileLoginRequest);
app.post('/v1/api/auth/facebook/admin', facebookHandler.handleFacebookAdminLoginRequest);
app.post('/v1/api/auth/facebook/pwa', facebookHandler.handleFacebookPWALoginRequest);

app.post('/v1/api/auth/google/mobile', googleHandler.handleGoogleMobileLoginRequest);
app.post('/v1/api/auth/google/pwa', googleHandler.handleGooglePWALoginRequest);

app.post('/v1/api/auth/login', authenticationHandler.handleLoginRequest);
app.post('/v1/api/auth/logout', securityPolicy.authorise, authenticationHandler.handleLogoutRequest);