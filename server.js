const express = require("express");

const app = express();
const { MongoClient, ObjectId } = require("mongodb"); // 몽고db 서버와연결 코드

const methodOverride = require("method-override"); //method-override를 사용해서 put,delete를 form에서 사용하기위해 2줄   추가
app.use(methodOverride("_method"));

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

app.get("/edit/:id", async (요청, 응답) => {
  //페이지 조회때 :id 해당하는게있으면 그걸통해서 가져온다 .
  let result = await db
    .collection("post")
    .findOne({ _id: new ObjectId(요청.params.id) });
  // console.log(result);
  응답.render("edit.ejs", { result: result });
});

//상세페이지 조회
app.get("/detail/:id", async (요청, 응답) => {
  // try {
  let result = await db
    .collection("post")
    .findOne({ _id: new ObjectId(요청.params.id) }); // 뒤에 .id는 위에 detail:id의 id이다 . 맞춰줘야한다 .
  // ; console.log("DB에서 가져온 결과:", result);// 결과를 로그에 출력

  // if (result == null) {
  //   응답.status(400).send("url을 잘못입력하셨습니다.");
  // }
  응답.render("detail.ejs", { result: result });
  // } catch (e) {
  //   console.log(e);
  //   응답.status(400).send("URL을 올바르게 입력해주세요"); // 오류가 있을 경우 로그에 출력
  //   // 오류 처리 로직 추가 강의에선 간결하게  강의를위해 지웠지만  에러처리해야함 .
  // }
});

app.put("/edit", async (요청, 응답) => {
  // await db.collection("post").updateOne({ _id: 1 }, { $inc: { like: 10 } });  like  예제 시험해봄,
  //수정코드,
  await db.collection("post").updateOne(
    { _id: new ObjectId(요청.body.id) },
    {
      $set: { title: 요청.body.title, content: 요청.body.content },
    }
  );
  console.log(요청.body);
  응답.redirect("/list/:id");
});

app.delete("/delete", async (요청, 응답) => {
  //삭제기능
  console.log(요청.query);
  await db
    .collection("post")
    .deleteOne({ _id: new ObjectId(요청.query.docid) });
  응답.send("삭제완료");
});

app.post("/add", async (요청, 응답) => {
  //등록하는코드
  console.log(요청.body);
  try {
    if (요청.body.title == "" || 요청.body.content == "") {
      응답.send("빈칸이존재");
    } else {
      await db
        .collection("post")

        .insertOne({ title: 요청.body.title, content: 요청.body.content });

      응답.redirect("/list/:id"); //를하게되면  위에코드가 실행뒤에 바로    /list페이지로 이동된다 .

      // console.log(요청.body); // 요청.body를 사용하려면 위에 app.use json과ㅏ urlencoded를 사용해야함 데이터를 꺼내쓰기가힘든데 요청 .body에 쉽게 넣어줌.
    }
  } catch (e) {
    console.log(e); //에러메시지 출력해줌
    응답.status(500).send("서버에서에러남"); //에러시 에러상태 코드를 적어주면좋다 .
  }
});

// app.get("/list/:page", async (요청, 응답) => {
//   let result = await db
//     .collection("post")
//     .find()
//     .skip((요청.params.id - 1) * 5)
//     .limit(5)
//     .toArray();

//   console.log(요청.params.id);

//   응답.render("list.ejs", { title: result });
// });

app.get("/list/:id", async (요청, 응답) => {
  //페이지네이션 코드
  const page = parseInt(요청.params.id) || 1; // 페이지 번호를 정수로 변환
  const limit = 5;
  const totalPosts = await db.collection("post").countDocuments(); // 총 게시물 수 계산
  const totalPages = Math.ceil(totalPosts / limit); // 총 페이지 수 계산
  const skip = (page - 1) * limit;
  let result = await db
    .collection("post")
    .find()
    .skip(skip)
    .limit(limit)
    .toArray();
  console.log(totalPages);

  응답.render("list.ejs", {
    title: result, // 게시물 목록
    currentPage: page, // 현재 페이지 번호
    totalPages: totalPages, // 총 페이지 수
  });
});
