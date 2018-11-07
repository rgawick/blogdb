const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const Blogpost = require('./classes/blog_post')
const Comment = require('./classes/comment')
const app = express()
const pgp = require('pg-promise')()
const connectionString = "postgres://localhost:5432/blogdb"
const db = pgp(connectionString)

app.use(bodyParser.urlencoded({ extended: false }))
app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')

let posts = []

app.post('/delete-post',function(req,res){
  let postId = req.body.postId
  db.none('DELETE FROM posts WHERE postid = $1;',[postId])
  .then(function(){
    res.redirect('/')
  })
  .catch(function(error){
    console.log(error)
  })
})

app.post('/update-post',function(req,res){
  let title = req.body.title
  let body = req.body.body
  let postId = req.body.postId
  db.none('UPDATE posts SET title = $1, body = $2 WHERE postid = $3',[title,body,postId])
  .then(function(){
    res.redirect('/')
  })
  .catch(function(error){
    console.log(error)
  })
})

app.post('/',function(req,res){
  let title = req.body.title
  let body = req.body.body
  db.none('INSERT INTO posts(title,body) VALUES($1,$2)',[title,body])
  .then(function(){
    res.redirect('/')
  })
  .catch(function(error){
    console.log(error)
  })
})

app.get('/update-post/:postId',function(req,res){
  let postId = req.params.postId
  db.one('SELECT postid,title,body FROM posts WHERE postid = $1',[postId])
  .then(function(result){
    res.render('update-post',result)
  })
})

app.get('/api/dishes',function(req,res){
  res.json(posts)
})

app.get('/new',function(req,res){
  res.render('add-post')
})

app.get('/posts/all',function(req,res){
  db.any('SELECT posts.postid,title,body,comment,commentid FROM posts JOIN comments ON posts.postid = comments.postid;')
  .then(function(items){
    items.forEach(function(item) {
    let existingPost =  posts.find(function(post){
        return post.postId == item.postid
      })
    if(existingPost == null) {
      let post = new Blogpost(item.postid,item.title,item.body)
      let comment = new Comment(item.commentid,item.comment)
      post.comments.push(comment)
      posts.push(post)
    } else {
          let comment = new Comment(item.commentid,item.comment)
          existingPost.comments.push(comment)
    }
    })
    console.log(posts)
    res.render('all-posts-all-comments',{posts : posts})
  })
})

app.get('/posts/:postId',function(req,res){
   let postId = req.params.postId
   db.any('SELECT title,body FROM comments WHERE postid = $1;',[commentId])
   .then(function(results){
     console.log(results)
     res.render('post-comments',{comments : results})
   })
})


app.get('/',function(req,res){
db.any('SELECT postid,title,body from posts;')
  .then(function(result){
    res.render('index',{posts : result})
  })
})

app.listen(3000,function(req,res){
  console.log("Server has started...")
})
