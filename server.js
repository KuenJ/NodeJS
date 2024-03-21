const express = require("express");

const app = express();
const { MongoClient, ObjectId } = require("mongodb"); // 몽고db 서버와연결 코드

app.use(express.static(__dirname + "/public")); // 이렇게  코드를 작성하게되면 /public의 내용들을 자유자재로사용가능

app.set("view engine", "ejs"); // 템플릿 엔진을 쓰려면 view engine을  사용하겠다고 적어야함. 그래서 ejs를 사용해서 html 파일안에 데이터를 넣을수있다 ./

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

  응답.render("list.ejs", { title: result }); //그리고 render list,ejs 파일의  값들을 화면에 표현가능하게 보내줌
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

app.get("/write", (요청, 응답) => {
  응답.render("write.ejs");
});

//상세페이지 조회
app.get("/detail/:id", async (요청, 응답) => {
  try {
    let result = await db
      .collection("post")
      .findOne({ _id: new ObjectId(요청.params.id) });
    console.log("DB에서 가져온 결과:", result); // 결과를 로그에 출력
    응답.render("detail.ejs", { result: result });
  } catch (error) {
    console.error("DB 조회 중 오류:", error); // 오류가 있을 경우 로그에 출력
    // 오류 처리 로직 추가
  }
});
app.post("/add", async (요청, 응답) => {
  console.log(요청.body);
  try {
    if (요청.body.title == "" || 요청.body.content == "") {
      응답.send("빈칸이존재");
    } else {
      await db
        .collection("post")

        .insertOne({ title: 요청.body.title, content: 요청.body.content });

      응답.redirect("/list"); //를하게되면  위에코드가 실행뒤에 바로    /list페이지로 이동된다 .

      // console.log(요청.body); // 요청.body를 사용하려면 위에 app.use json과ㅏ urlencoded를 사용해야함 데이터를 꺼내쓰기가힘든데 요청 .body에 쉽게 넣어줌.
    }
  } catch (e) {
    console.log(e); //에러메시지 출력해줌
    응답.status(500).send("서버에서에러남"); //에러시 에러상태 코드를 적어주면좋다 .
  }
});
