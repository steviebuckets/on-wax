const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//const Upload = require('s3-uploader');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {BlogPost} = require('./models');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

//get posts
app.get('/posts', (req, res) => {
    BlogPost
        .find()
        .limit(12)
        .exec()
        .then(posts => {
            res.json({
                posts: posts.map(
                    (post) => post.apiRepr())
            });
            console.log("working");
        })
        .catch(
            err => {
                console.error(err);
                res.status(500).json({ message: 'Internal sever error' });
            });
});

app.get('/posts/:id', (req, res) => {
    BlogPost
        .findById(req.params.id)
        .exec()
        .then(post => res.json(post.apiRepr()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went horribly awry' });
        });
});

//posts
app.post('/posts', (req, res) => {
    const requiredFields = ['title', 'recordstore', 'description', 'user'];
    requiredFields.forEach(field => {
        if (!(field in req.body && req.body[field])) {
            return res.status(400).json({ message: `Must specify value for ${field}` });
        }
    });
    BlogPost
        .create({
            title: req.body.title,
            recordstore: req.body.recordstore,
            description: req.body.description,
            user: req.body.user
        })
        .then(
            blogPost => res.status(201).json(blogPost.apiRepr()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
});




//catch-all endpoint if client makes request to non existent endpoint
app.use('*', function(req, res) {
    res.status(404).json({ message: 'Not Found' });
});

//close server access object, only created when we runServer
let server;

//this function connects to our databse, then starts server
function runServer() {
    return new Promise((resolve, reject) => {
        mongoose.connect(DATABASE_URL, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(PORT, () => {
                    console.log(`Your app is listening on port ${PORT}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

//this function closes server, and returns a promise
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });

}



if (require.main === module) {
    runServer().catch(err => console.error(err));
};

module.exports = { app, runServer, closeServer };