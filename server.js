const express = require("express");

const app = express();

app.use(express.static(__dirname + "/public")); // 이렇게  코드를 작성하게되면 /public의 내용들을 자유자재로사용가능

const { MongoClient } = require("mongodb");

let db;
const url =
  "mongodb+srv://admin:qwer1234@mydb.wc4ebps.mongodb.net/?retryWrites=true&w=majority&appName=MyDB";
new MongoClient(url)
  .connect()
  .then((client) => {
    console.log("DB연결성공");
    db = client.db("forum");

    app.listen(8080, () => {
      console.log("http://localhost:8080 에서 서버 실행중");
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (요청, 응답) => {
  응답.sendFile(__dirname + "/index.html"); // 현재 프로젝트의 절대경로 dirname   html 파일을 전송할수있음 .
});

app.get("/news", (요청, 응답) => {
  응답.send("news를 보여주는페이지입니다.");
});

app.get("/shop", (요청, 응답) => {
  응답.send("쇼핑페이지입니다.");
});

app.get("/about", (요청, 응답) => {
  응답.sendFile(__dirname + "/mypage.html");
});
