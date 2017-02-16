exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                       'mongodb://sbuckets33:eagleone@ds153699.mlab.com:53699/on-rotation';
                      /*'mongodb://localhost/on-wax';*/
exports.PORT = process.env.PORT || 8080;


