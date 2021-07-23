const express = require('express')
const app = express()
const port = 3000
var fs = require('fs');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');

// get : route, routing
// app.get('/', (req, res) => res.send('Hello World!'))
app.get('/', function(requset, response) { // WEB
  fs.readdir('./data', function(error, filelist) {
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(filelist);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    response.send(html);
  });
});

app.get('/page/:pageId', function(request, response) { // HTML
  fs.readdir('./data', function(error, filelist) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
      var title = request.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {allowedTags:['h1']});
      var list = template.list(filelist);
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
    });
  });
});

app.get('/create', function(request, response) {
  fs.readdir('./data', function(error, filelist) {
    var title = 'WEB - create';
    var list = template.list(filelist);
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
});
app.post('/create_process', function(request, response) {
  var body = '';
  request.on('data', function(data) {
      body = body + data;
  });
  request.on('end', function() {
    var post = qs.parse(body);
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
      response.writeHead(302, {Location: `/page/${title}`});
      response.end();
    });
  });
});

app.get('/update/:pageId', function(request, response) {
  fs.readdir('./data', function(error, filelist) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
      var title = request.params.pageId;
      var list = template.list(filelist);
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
});
app.post('/update_process', function(request, response) {
  var body = '';
  request.on('data', function(data) {
      body = body + data;
  });
  request.on('end', function() {
    var post = qs.parse(body);
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error) {
      fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
        response.redirect(`/page/${title}`);
      });
    });
  });
});

app.post('/delete_process', function(request, response) {
  var body = '';
  request.on('data', function(data) {
      body = body + data;
  });
  request.on('end', function() {
    var post = qs.parse(body);
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(error) {
      response.redirect('/');
    });
  });
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

/*
// 이전 코드 : 완료된 부분은 삭제
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request,response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  // if문 : route, routing
  if (pathname === '/') {
    if (queryData.id === undefined) { DONE }
    else { DONE }
  }
  else if (pathname === '/create') { DONE }
  else if (pathname === '/create_process') { DONE }
  else if (pathname === '/update') { DONE }
  else if (pathname === '/update_process') { DONE }
  else if (pathname === '/delete_process') { DONE }
  else {
    response.writeHead(404);
    response.end('Not found');
  }
});
app.listen(3000);
*/
