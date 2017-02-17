const dotenv = require('dotenv');
dotenv.config({ silent: true });
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
let secret = 'mysecret';

//for user authentication
const jwt = require('jsonwebtoken');

const morgan = require('morgan');

mongoose.Promise = global.Promise;

const { PORT } = require('./config');

const BlogPost = require('./models').BlogPost;
const User = require('./models').User;
const bcrypt = require('bcrypt-nodejs');
const app = express();
/*app.use(morgan('common'));*/


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// verification for posts on login
app.post('/login', (req, res) => {

    User.findOne({ email: req.body.email }).select('email password').exec((err, user) => {

        if (err) {
            return res.status(404).json({ message: 'User not found' })
        };

        if (!user) {
            return res.status(500).json({ success: false, message: 'User not found' });
        }
        if (!user.comparePassword(req.body.password)) {
            res.json({ success: false, message: 'Wrong password' });
        } else {
            let myToken = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: "24h" });
            res.json({
                success: true,
                message: 'Enjoy your token ' + myToken,
                token: myToken
            });
            console.log(myToken);
        }

    });
});

//verification for posts on register
app.post('/register', (req, res) => {
    let user = new User();
    user.email = req.body.email;
    user.password = req.body.password;
    user.save((err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "User already exists" })
        }
        let myToken = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: "24h" });
        res.json({
            success: true,
            message: "User successfully registered!" + myToken,
            token: myToken
        });
    })

});



/// anything above is "NOT PROTECTED"



app.use((req, res, next) => {
    let token = req.body.token || req.query.token || req.params['token'] || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, secret, (error, decoded) => {
            if (error) {
                return res.json({ success: false, message: 'failed to authenticate token.' });
            } else {
                req.decoded = decoded;
                req.person = "Steve rocks!"
                next();
            }

        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided'
        });
    }
});


app.get('/users', (req, res) => {
    User.find()
        .then(users => {
            res.json(users);
        });
})


/// anything below is "PROTECTED"/// anything below is "PROTECTED"
app.get('/posts', (req, res) => {
    if (User) {

        User.findById(req.decoded.id, (err, user) => {
            console.log(err)
            res.json(
                user.blogPosts.sort((prev, next) => {
                    return new Date(next.created) - new Date(prev.created);

                })
            );

        });
    }

});


app.get('/posts/:id', (req, res) => {
    User.findById(req.decoded.id, (err, user) => {
        var blogPost = user.blogPosts.id(req.params.id);

        if (blogPost) {
            user.save((err) => {
                res.json(blogPost);
            });

        } else {
            res.status(404).json({ message: 'Post not found, cannot be updated' })
        }


    })

});


//New Blog Posts
app.post('/posts', (req, res) => {
    var name = new User({ user: req.body.email });

    const requiredFields = ['image', 'title', 'recordstore', 'artist', 'user'];
    // start for each func
    requiredFields.some(field => {
        if (!(field in req.body && req.body[field])) {
            return res.status(400).json({ message: `Must specify value for ${field}` });
        } else return true;
    });

    User.findById(req.decoded.id, (err, user) => {
        console.log('user', user);

        user.blogPosts.push({
            image: req.body.image,
            title: req.body.title,
            recordstore: req.body.recordstore,
            artist: req.body.artist
        });
        user.save((err) => {
            if (err) return res.json({});
            res.json(user);
        })
    })
});


//put/update
app.put('/posts/:id', (req, res) => {
    User.findById(req.decoded.id, (err, user) => {

        var blogPost = user.blogPosts.id(req.params.id);
        if (blogPost) {

            if (req.body.image) {
                blogPost.image = req.body.image
            }
            if (req.body.title) {

                blogPost.title = req.body.title
            }
            if (req.body.recordstore) {
                blogPost.recordstore = req.body.recordstore
            }
            if (req.body.artist) {
                blogPost.artist = req.body.artist
            }
            user.save((err) => {

                if (err) res.status(404).json({ message: 'Post did not update' });
                res.json({});
            });

        } else {
            res.status(404).json({ message: 'Post not found, cannot be updated' })
        }
    })
});

//delete posts
app.delete('/posts/:id', (req, res) => {
    User.findById(req.decoded.id, (err, user) => {
        var blogPost = user.blogPosts.id(req.params.id);
        if (blogPost) {
            blogPost.remove();
            user.save((err) => {
                if (err) return res.status(404).json({ message: 'Error, Could not delete' });
                res.json({});
            });
        } else {
            res.status(404).json({ message: 'Error, not located' });
        }


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

        mongoose.connect(process.env.DATABASE_URL, err => {
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
