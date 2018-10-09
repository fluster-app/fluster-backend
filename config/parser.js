const bodyParser = require('body-parser'); //parses information from POST
const methodOverride = require('method-override'); //used to manipulate POST

module.exports = function (app) {
    
    // Cors instead of default app.use(cors());
    app.use(function (req, res, next) {

        // https://github.com/driftyco/cordova-plugin-wkwebview-engine/issues/111
        const allowedOrigins = ["https://mydomains.com"];

        const origin = req.headers.origin;
        if(allowedOrigins.indexOf(origin) > -1){
            res.setHeader('Access-Control-Allow-Origin', origin);
        } else {
            res.setHeader("Access-Control-Allow-Origin", "https://mydomains.com");
        }

        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Headers", "Origin, Authorization, Content-Type, Content-Range, Content-Disposition, Content-Description, X-Requested-With, X-ACCESS_TOKEN");
        res.header("Access-Control-Allow-Methods", "GET,PUT,POST");
        
        if ('OPTIONS' === req.method) {
            res.status(204).send();
        }
        else {
            next();
        }
    });

    app.use(bodyParser.json({limit: '10mb'}));
    app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

    app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            const method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));
};
