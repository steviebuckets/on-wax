/*var dotenv = require('dotenv');
dotenv.load();*/
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');


mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { BlogPost } = require('./models');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());




//get posts
app.get('/posts', (req, res) => {
    BlogPost
        .find()
        .sort({ created: -1 })
        .limit(9)
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

//New Blog Posts
app.post('/posts', (req, res) => {
    /* console.log(req);*/
   /*var image = cloudinary.uploader.unsigned_image_upload_tag('image', 'k9gdegt1', { cloud_name: 'dbkrpg9qe', tags: 'test_upload' });*/
  /* const requiredFields = ['image', 'title', 'recordstore', 'description', 'user'];

    
    requiredFields.some(function(element, index, field) {
        if (!(field in req.body && req.body[field])) {
            return res.status(400).json({ message: `Must specify value for ${field}` });
        }

        else return true;
        
        });*/
        console.log('hi');
        console.log(req.body);
    const requiredFields = ['image', 'title', 'recordstore', 'description', 'user'];
   // start for each func
    requiredFields.some(field => {
        if (!(field in req.body && req.body[field])) {
            return res.status(400).json({ message: `Must specify value for ${field}` });
        }
        else return true;
    });
    //create blogpost if required fields are met
    BlogPost
        .create({
            image: req.body.image,
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




//put/update
app.put('/posts/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`);
        console.error(message);
        res.status(400).json({ message: message });
    }

    const toUpdate = {};
    const updateableFields = ['title', 'description'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    BlogPost
        .findByIdAndUpdate(req.params.id, { $set: toUpdate })
        .exec()
        .then(updatedPost => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

//delete posts

app.delete('/posts/:id', (req, res) => {
    BlogPost
        .findByIdAndRemove(req.params.id)
        .exec()
        .then(blogPost => res.json({ message: "Steve rocks!!" })) //res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal server error' }));
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
