var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var AWS = require('aws-sdk');

app.post('/v1/api/images', securityPolicy.authorise, function (req, res) {

    var s3 = new AWS.S3({useDualstack: true});

    var imgName = req.body.imgName;
    var contentType = req.body.contentType;

    // TODO: StorageClass : 'REDUCED_REDUNDANCY'?
    // See costs https://aws.amazon.com/s3/reduced-redundancy/

    // Expires in seconds
    var params = {
        Bucket: 'peterparker-photos-eu',
        Key: imgName, Expires: 600,
        ContentType: contentType,
        ACL: 'public-read'};
    s3.getSignedUrl('putObject', params, function (err, url) {
        if (err) {
            res.status(500).json({
                error: "Signed S3 url for putObject can't be created. " + JSON.stringify(err)
            });
        } else {
            res.json({url: url});
        }
    });

});