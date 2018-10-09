var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var postAppointmentRoutes = require('../controllers/appointments/post-appointment');
var editAppointmentsRoutes = require('../controllers/appointments/edit-appointment');

var getApplicantsRoutes = require('../controllers/appointments/get-appplicants');
var postApplicantRoutes = require('../controllers/appointments/post-applicant');
var editApplicantRoutes = require('../controllers/appointments/edit-applicant');
var getMyApplicantsRoutes = require('../controllers/appointments/get-my-applicants');

// Appointments

app.post('/v1/appointments/', securityPolicy.authorise, postAppointmentRoutes.createAppointment);

app.get('/v1/appointments/:id', securityPolicy.authorise, editAppointmentsRoutes.getAppointment);

app.put('/v1/appointments/:id', securityPolicy.authorise, editAppointmentsRoutes.updateAppointment);

// Applicants

app.get('/v1/applicants/', securityPolicy.authorise, getApplicantsRoutes.getApplicants);

app.post('/v1/applicants/', securityPolicy.authorise, postApplicantRoutes.createApplicant);

app.put('/v1/applicants/:id', securityPolicy.authorise, editApplicantRoutes.updateApplicant);

app.get('/v1/deeplinkapplicant/', securityPolicy.authorise, getApplicantsRoutes.getDeeplinkApplicant);

app.post('/v1/statusapplicants/', securityPolicy.authorise, editApplicantRoutes.statusApplicants);

app.get('/v1/myapplicants/', securityPolicy.authorise, getMyApplicantsRoutes.getMyApplications);

// No delete