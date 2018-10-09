let app = module.parent.exports.app;

const securityPolicy = require('../controllers/authentications/securityPolicy');
const securityAdminPolicy = require('../controllers/authentications/securityAdminPolicy');

const getUsersCtrl = require('../controllers/admin/get-users');
const editUserCtrl = require('../controllers/admin/edit-user');

const getItemsCtrl = require('../controllers/admin/get-admin-items');
const editItemsCtrl = require('../controllers/admin/edit-admin-items');

const getComplaintsCtrl = require('../controllers/admin/get-complaints');

const getApplicantsCtrl = require('../controllers/admin/get-admin-applicants');

const getAdminNotificationRoutes = require('../controllers/admin/get-admin-nofitications');

const getProductsCtrl = require('../controllers/admin/get-products');
const getSubscriptionsCtrl = require('../controllers/admin/get-subscriptions');
const editSubscriptionCtrl = require('../controllers/admin/edit-subscription');

const getDeviceCtrl = require('../controllers/admin/get-admin-device');

const getChatMessagesCtrl = require('../controllers/admin/get-admin-chat-messages');

const getUsersInterestsCtrl = require('../controllers/admin/get-admin-users-interests');

const getRewardsCtrl = require('../controllers/admin/get-admin-rewards');

app.get('/v1/admin/users/', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getUsersCtrl.getUsers);
app.put('/v1/admin/users/:id/block', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, editUserCtrl.blockUser);
app.get('/v1/admin/users/count/', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getUsersCtrl.countUsers);

app.get('/v1/admin/userinterests/', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getUsersInterestsCtrl.getUsersInterests);
app.get('/v1/admin/userinterests/:id', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getUsersInterestsCtrl.getUserInterests);

app.get('/v1/admin/items/', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getItemsCtrl.getItems);
app.get('/v1/admin/items/:id', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, editItemsCtrl.getPopulatedItem);
app.put('/v1/admin/items/:id/status', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, editItemsCtrl.setVoucherStatusNoUser);
app.put('/v1/admin/items/:id/highlight', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, editItemsCtrl.editHighlight);

app.get('/v1/admin/complaints/', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getComplaintsCtrl.getComplaints);

app.get('/v1/admin/applicants/', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getApplicantsCtrl.getApplicants);

app.get('/v1/admin/notifications/', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getAdminNotificationRoutes.getUnreadNotifications);

app.get('/v1/admin/products/', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getProductsCtrl.getProducts);
app.get('/v1/admin/subscriptions/', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getSubscriptionsCtrl.getSubscriptions);
app.get('/v1/admin/subscriptions/all/', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getSubscriptionsCtrl.getAllSubscriptions);
app.put('/v1/admin/subscriptions/:id/status', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, editSubscriptionCtrl.setSubscriptionStatus);

app.get('/v1/admin/devices/:id', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getDeviceCtrl.getDevicePlatform);
app.get('/v1/admin/devicescount/', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getDeviceCtrl.countDevices);

app.get('/v1/admin/chats/messages/', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getChatMessagesCtrl.getChatMessages);

app.get('/v1/admin/rewards/', securityPolicy.authorise, securityAdminPolicy.authoriseAdmin, getRewardsCtrl.getRewards);