const mongoose = require('mongoose');
//const Upload = require('s3-uploader');

//this is the structure for my blog posts
const blogPostsSchema = mongoose.Schema({
	"title": {type: String, required: true},
	"recordstore": {type: String, required: true},
	"description": {type: String, required: true},
	"user": {type: String, required: true},
	"created": {type: Date, default: Date.now}
	//"photo": {type: img, required: true}

});

blogPostsSchema.methods.apiRepr = function() {
	return {
		id: this._id,
		title: this.title,
		recordstore: this.recordstore,
		description: this.description,
		user: this.user,
		created: this.created
    	//photo

	};
}

const BlogPost = mongoose.model('BlogPost', blogPostsSchema);

module.exports = {BlogPost};