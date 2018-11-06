const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const app = express()
const pgp = require('pg-promise')()
const connectionString = "postgres://localhost:5432/blogdb"
const db = pgp(connectionString)

app.use(bodyParser.urlencoded({ extended: false }))
app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')

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

  db.none('UPDATE posts SET title = $1, body = $2 WHERE postid = $4',[title,body,postId])
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

app.get('/new',function(req,res){
  res.render('add-post')
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
