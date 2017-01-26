const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
//this is the structure for a new user on register
const userSchema = new mongoose.Schema({
    "email": { type: String, required: true },
    "password": { type: String, required: true }

});


userSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
});


// compare password
userSchema.methods.comparePassword = function(password) {
    var user = this;
    return bcrypt.compareSync(password, user.password);
}

//this is the structure for my blog posts
const blogPostsSchema = mongoose.Schema({
    "title": { type: String, required: true },
    "recordstore": { type: String, required: true },
    "description": { type: String, required: true },
    "user": { type: String, required: true },
    // buffer cloudinary/s3 -> store this stuff for -> they give you a URL "s3.amazong.slj.png"
    "image": { type: String, required: true },
    "image_id": { type: String },
    "created": { type: Date, default: Date.now, required: true }
});



blogPostsSchema.methods.apiRepr = function() {
    return {
        id: this._id,
        title: this.title,
        recordstore: this.recordstore,
        description: this.description,
        user: this.user,
        image: this.image,
        created: this.created
    };
}

const User = mongoose.model('User', userSchema);

const BlogPost = mongoose.model('BlogPost', blogPostsSchema);

/*module.exports = { User };
module.exports = { BlogPost };
*/
module.exports = {
    User: User,
    BlogPost: BlogPost
}
