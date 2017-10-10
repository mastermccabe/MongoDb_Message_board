var express = require('express');

var app = express();
var path = require('path');

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
app.set('views', path.join(__dirname + '/views'));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
mongoose.connect('mongodb://localhost/messageboard');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
// define Post Schema
var PostSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  text: {
    type: String,
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
});
// define Comment Schema
var CommentSchema = new mongoose.Schema({
  _post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  name: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});
// set our models by passing them their respective Schemas
mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);
// store our models in variables
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
// route for getting a particular post and comments

app.get('/', function(req, res) {
  Post.find({}).sort({
    'created_at': -1
  }).populate('comments').exec(function(err, posts) {
    res.render('index', {
      posts: posts
    })

  })
});

app.post('/postmessage', function(req, res) {
  console.log("POST DATA", req.body);
  // create a new User with the name and age corresponding to those from req.body
  var message = new Post({
    name: req.body.name,
    text: req.body.message,

  });
  //   // Try to save that new user to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
  message.save(function(err) {
    // if there is an error console.log that something went wrong!
    if (err) {
      console.log('something went wrong');
      console.log(err);
      res.redirect('/');
    } else { // else console.log that we did well and then redirect to the root route
      console.log('successfully added post!');
      console.log(message);
      res.redirect('/');
    }
  });
});

app.post('/posts/:id', function(req, res) {
  Post.findOne({
      _id: req.params.id
    },
    function(err, post) {
      var comment = new Comment({
        name: req.body.name,
        text: req.body.text,
      });
      console.log(post);
      comment._post = post._id;
      post.comments.push(comment);
      // console.log(post.messages);
      comment.save(function(err) {
        console.log(err);
        post.save(function(err) {
          if (err) {
            console.log(err);
            console.log('Error');
          } else {
            console.log("success");
            res.redirect('/');
          }
        });
      });
    });
});
app.listen(8000, function() {
  console.log("listening on port 8000");
});
