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

const { PORT, DATABASE_URL } = require('./config');
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
    /*   return res.status(404);*/
    User.findOne({ email: req.body.email }).select('email password').exec((err, user) => {

     
        if (err) {
            return res.status(404).json({ message: 'bad login' })
        };

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        if (!user.comparePassword(req.body.password)) {
            res.json({ success: false, message: 'Wrong password' });
        } else {
            let myToken = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: "24h" });
            /*console.log(user, err);*/
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
    // add blogposts to user on register?
    /*user.blopgposts = req.body.blogposts;*/

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



/*API Design
URL design
/users -> all users
/users/:id -> gets me a specif user e.g. /users/2142412ljljsaf
/users/:id/posts --> gets all the posts of the that user
/users/:id/posts/:post_id -> gets a specific post of a specific user

Dilema

- /posts
** loop through every user and get back the blogposts


*/

/// anything below is "PROTECTED"/// anything below is "PROTECTED"
app.get('/posts', (req, res) => {
    let token = req.body.token || req.query.token || req.params['token'] || req.headers['x-access-token'];



    if (token) {
        jwt.verify(token, secret, (error, decoded) => {
            if (error) {
                return res.json({ success: false, message: 'failed to authenticate token.' });
            } else {

                User.findById(decoded.id, (err, user) => {


                    req.decoded = decoded;
               
                    res.json(
                        user.blogPosts
                    );

                })

            }

        });
    } else {


    }



});

//users/:id/posts/:post_id -> gets a specific post of a specific user

app.get('/posts/:id', (req, res) => {
    User.findById(req.decoded.id, (err, user) => {
        var blogPost = user.blogPosts.id(req.params.id);

        if (blogPost) {
            user.save((err) => {
                res.json(blogPost);
            });
            //update method here 

        } else {
            /* res.status(404).json({ message: 'Post not found, cannot be updated' })*/
        }


    })

    /*BlogPost
        .findById(req.params.id)
        .exec()
        .then(post => {
            //get user email based on
            res.json(post.apiRepr())
                //add email to response

        })

    .catch(
        err => {
            console.error(err);
            res.json({ message: 'Internal sever error' });
        });*/
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
            // find user; 
            // var blogoPost = user.blogPosts.id(req.params.id)
            // blogpost.delete();

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
        // user = decoded;

    // BlogPost
    //     .create({
    //         image: req.body.image,
    //         title: req.body.title,
    //         recordstore: req.body.recordstore,
    //         artist: req.body.artist,
    //         user: user.id
    //     })
    //     .then(
    //         blogPost => res.status(201).json(blogPost.apiRepr()))
    //     .catch(err => {
    //         console.error(err);
    //         res.status(500).json({ message: 'Internal server error' });


    //create blogpost if required fields are met

});


//put/update
app.put('/posts/:id', (req, res) => {
    User.findById(req.decoded.id, (err, user) => {
            var blogPost = user.blogPosts.id(req.params.id);
            if (blogPost) {

            
                blogPost.title = req.body.title;
                blogPost.recordstore = req.body.recordstore;
                blogPost.artist = req.body.artist;
                user.save((err) => {
                    if (err) res.status(404).json({ message: 'Post did not update' });
                    res.json({});
                });
                //update method here 

            } else {
                res.status(404).json({ message: 'Post not found, cannot be updated' })
            }
        })
        /* if (!(req.params.id && req.body.id === req.body.id)) {

             const message = (
                 `Request path id (${req.params.id}) and request body id ` +
                 `(${req.body.id}) must match`);
             console.error(message);
             res.status(400).json({ message: 'message' });
         }

         let toUpdate = {
             image: req.body.image,
             title: req.body.title,
             recordstore: req.body.recordstore,
             artist: req.body.artist,
             user: req.body.user
         };
         const updateableFields = ['image', 'title', 'recordstore', 'artist', 'user'];

         updateableFields.forEach(field => {
             if (field in req.body) {
                 toUpdate[field] = req.body[field];
             }
         });

         BlogPost
             .findByIdAndUpdate(req.params.id, { $set: toUpdate })
             .exec()
             .then(updatedPost => res.status(204).end())
             .catch(err => res.status(500).json({ message: 'Internal server error' }));*/
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

    // Get a single user 
    // get the blog post using the id method (sub document has an id) [ object]
    // delet the object by calling the delete() method on it.
    // console.log(req);

    // BlogPost
    //     .findByIdAndRemove(req.params.id)
    //     .exec()
    //     .then(blogPost => res.json({ message: "Steve rocks!!" })) //res.status(204).end())
    //     .catch(err => res.status(500).json({ message: 'Internal server error' }));
    // console.log(BlogPost)

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
