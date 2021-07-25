const express = require('express')
const app = express()
const port = 3000

var fs = require('fs');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
var bodyParser = require('body-parser');
var compression = require('compression');

app.use(bodyParser.urlencoded({ extended: false })); // Middleware - body parser
app.use(compression()); // Middleware - compression
app.get('*', function(request, response, next) { // get방식의 요청에 대해서만 파일 목록을 가져오도록 함
  fs.readdir('./data', function(error, filelist) {
    request.list = filelist;
    next();
  });
});
app.use(express.static('public')); // public 디렉토리 안에서 static파일을 찾음

// get : route, routing
app.get('/', function(request, response) { // WEB
  var title = 'Welcome';
  var description = 'Hello, Node.js';
  var list = template.list(request.list);
  var html = template.HTML(title, list,
    `
    <h2>${title}</h2>${description}
    <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px">
    `,
    `<a href="/create">create</a>`
  );
  response.send(html);
});

app.get('/page/:pageId', function(request, response, next) { // HTML, ...
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
    if (err) {
      next(err);
    }
    else {
      var title = request.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {allowedTags:['h1']});
      var list = template.list(request.list);
      var html = template.HTML(sanitizedTitle, list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/create">create</a>
          <a href="/update/${sanitizedTitle}">update</a>
          <form action="/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>
        `
      );
      response.send(html);
    }
  });
});

app.get('/create', function(request, response) {
  var title = 'WEB - create';
  var list = template.list(request.list);
  var html = template.HTML(title, list,
    `
    <form action="/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
        <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
        <input type="submit">
      </p>
    </form>
    `,
    ''
  );
  response.send(html);
});
app.post('/create_process', function(request, response) {
  var post = request.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
    response.writeHead(302, {Location: `/page/${title}`});
    response.end();
  });
});

app.get('/update/:pageId', function(request, response) {
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
    var title = request.params.pageId;
    var list = template.list(request.list);
    var html = template.HTML(title, list,
      `
      <form action="/update_process" method="post">
        <input type="hidden" name="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
        <p>
          <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `,
      `<a href="/create">create</a> <a href="/update/${title}">update</a>`
    );
    response.send(html);
  });
});
app.post('/update_process', function(request, response) {
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function(error) {
    fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
      response.redirect(`/page/${title}`);
    });
  });
});

app.post('/delete_process', function(request, response) {
  var post = request.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function(error) {
    response.redirect('/');
  });
});

// 에러 처리
app.use(function(req, res, next) {
  res.status(404).send('Sorry, can not find that!');
});
app.use(function(err, req, res, next) {
  console.log(err.stack);
  res.status(500).send('Something broken!');
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
