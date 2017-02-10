const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');


//this is the structure for my blog posts
const blogPostsSchema = mongoose.Schema({
    "title": { type: String, required: true },
    "recordstore": { type: String, required: true },
    "artist": { type: String, required: true },
    // "user": { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // buffer cloudinary/s3 -> store this stuff for -> they give you a URL "s3.amazong.slj.png"
    "image": { type: String, required: true },
    "image_id": { type: String },
    "created": { type: Date, default: Date.now, required: true }
});

//this is the structure for a new user on register
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, select: false, required: true },
    blogPosts: [blogPostsSchema]
});


userSchema.pre('save', function(next) {
    var user = this;


    if (!user.isModified('password')) return next();



    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        console.log(user)
        next();

    });


});


// compare password
userSchema.methods.comparePassword = function(password) {

    var user = this;
    console.log(password, user.password);
    console.dir(user);

    return bcrypt.compareSync(password, user.password);

}




/*blogPostsSchema.methods.apiRepr = function() {
    // find User by ID
    var self = this; // this refers to the blogpost
    // console.log(self, 'this'); 
    User.findById(self.user, function(err, user) {
        console.log(err, user, self.user);
        return {};
         // this is that idiot; this refers to the "User function"

        return {
            id: self._id,
             title: self.title,
             recordstore: self.recordstore,
             artist: self.artist,
             user: user.email, // id
             image: self.image,
             created: self.created
         };
    });
}*/

const User = mongoose.model('User', userSchema);

const BlogPost = mongoose.model('BlogPost', blogPostsSchema);

/*module.exports = { User };
module.exports = { BlogPost };
*/
module.exports = {
    User: User,
    BlogPost: BlogPost
}
