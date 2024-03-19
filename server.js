const express = require("express");

const app = express();

app.use(express.static(__dirname + "/public")); // 이렇게  코드를 작성하게되면 /public의 내용들을 자유자재로사용가능

app.set("view engine", "ejs"); // 템플릿 엔진을 쓰려면 view engine을  사용하겠다고 적어야함. 그래서 ejs를 사용해서 html 파일안에 데이터를 넣을수있다 ./

const { MongoClient } = require("mongodb"); // 몽고db 서버와연결 코드

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

app.get("/list", async (요청, 응답) => {
  //db의 저장되있는 모든값들을 요청해옴
  let result = await db.collection("post").find().toArray();
  // 응답.send(result);

  응답.render("list.ejs", { title: result }); //그리고 list.ejs로 값들을 화면에 표현가능하게 보내줌
});
app.get("/shop", (요청, 응답) => {
  응답.send("쇼핑페이지입니다.");
});

app.get("/about", (요청, 응답) => {
  응답.sendFile(__dirname + "/mypage.html");
});

app.get("/time", (요청, 응답) => {
  응답.render("time.ejs", { 시간: new Date() }); //render를 써야지  ejs로 서버에서 요청해온값을 html 화면상에보여줄수있다.
});
