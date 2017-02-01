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
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) throw err;

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        if (!user.comparePassword(req.body.password)) {
            res.json({ success: false, message: 'Wrong password' });
        } else {
            let myToken = jwt.sign({ email: user.email }, secret, { expiresIn: "24h" });
            res.json({
                success: true,
                message: 'Enjoy your token ' + myToken,
                token: myToken
            });
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
        let myToken = jwt.sign({ email: user.email }, secret, { expiresIn: "24h" });
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




/// anything below is "PROTECTED"/// anything below is "PROTECTED"
app.get('/posts', (req, res) => {
    BlogPost
        .find()
        .sort({ created: -1 })
        .limit()
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
        .then(post => { 
            res.json(post.apiRepr())
        
})

        .catch(
            err => {
            console.error(err);
             res.json({ message: 'Internal sever error' });
        });
});


//New Blog Posts
app.post('/posts', (req, res) => {

    const requiredFields = ['image', 'title', 'recordstore', 'description', 'user'];
    // start for each func
    requiredFields.some(field => {
        if (!(field in req.body && req.body[field])) {
            return res.status(400).json({ message: `Must specify value for ${field}` });
        } else return true;
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
    if (!(req.params.id && req.body.id === req.body.id)) {
   /*url: '/posts/' + this.id + '?token=' + myToken,*/
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
            description: req.body.description,
            user: req.body.user
        }; // you change it later, const means no change - removed.
    const updateableFields = ['image', 'title', 'recordstore', 'description', 'user'];

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
