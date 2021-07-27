const express = require('express')
const app = express()
const port = 3000

var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');

app.use(bodyParser.urlencoded({ extended: false })); // Middleware - body parser
app.use(compression()); // Middleware - compression
app.get('*', function(request, response, next) { // get방식의 요청에 대해서만 파일 목록을 가져오도록 함
  fs.readdir('./data', function(error, filelist) {
    request.list = filelist;
    next();
  });
});
app.use(express.static('public')); // public 디렉토리 안에서 static파일을 찾음

app.use('/', indexRouter); // 라우터를 파일로 분리 (WEB)
app.use('/topic', topicRouter); // 라우터를 파일로 분리 (CSS, Express, HTML, JS)

app.use(function(req, res, next) {
  res.status(404).send('Sorry, can not find that!');
});
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broken!')
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
