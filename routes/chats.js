var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var postChatRoutes = require('../controllers/chats/post-chat');
var getChatsRoutes = require('../controllers/chats/get-chats');

var postMessageRoutes = require('../controllers/chats/post-chat-message');
var editMessageRoutes = require('../controllers/chats/edit-chat-message');
var getMessagesRoutes = require('../controllers/chats/get-chat-messages');

// Chat

app.get('/v1/chats/', securityPolicy.authorise, getChatsRoutes.getChats);
app.post('/v1/chats/', securityPolicy.authorise, postChatRoutes.postChat);

// Messages

app.get('/v1/chats/messages/', securityPolicy.authorise, getMessagesRoutes.getChatMessages);
app.post('/v1/chats/messages/', securityPolicy.authorise, postMessageRoutes.postChatMessage);
app.put('/v1/chats/messages/:id', securityPolicy.authorise, editMessageRoutes.updateChatMessage);
app.get('/v1/chats/messages/unread/', securityPolicy.authorise, getMessagesRoutes.getUnreadChatMessages);