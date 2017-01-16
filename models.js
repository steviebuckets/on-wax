const mongoose = require('mongoose');


//this is the structure for my blog posts
const blogPostsSchema = mongoose.Schema({
    "title": { type: String, required: true },
    "recordstore": { type: String, required: true },
    "description": { type: String, required: true },
    "user": { type: String, required: true },
    // buffer cloudinary/s3 -> store this stuff for -> they give you a URL "s3.amazong.slj.png"
    "image": {type: String, required: true},
    "image_id": {type: String},
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

const BlogPost = mongoose.model('BlogPost', blogPostsSchema);

module.exports = { BlogPost };
