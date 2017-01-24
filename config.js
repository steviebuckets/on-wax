exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/on-wax';
exports.PORT = process.env.PORT || 8000;

server.listen(port, function() {
    console.log("App is running on port " + port);
});
