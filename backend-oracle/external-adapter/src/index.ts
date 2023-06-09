import express from "express";
//import { Builder, By, Capabilities, WebDriver } from 'selenium-webdriver';
//import chrome from "selenium-webdriver/chrome";

const app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
//let webDriver: WebDriver | null = null;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", async (req: express.Request, res: express.Response) => {
  const now = new Date();

  res.send(
    JSON.stringify({
      data: {
        jobRunID: req.body.id ?? 1,
        now: now.toISOString(),
        timestamp: Math.floor(now.getTime() / 1000),
      },
    })
  )

    /*
  //スクレイピングの処理
  const driver = await new Builder()
    .withCapabilities(Capabilities.chrome().set('chromeOptions', {
      args: ['--headless','--no-sandbox'],
      w3c: false
    }))
    .build();
  
  try {
    // 指定された URL にアクセスし、所定の要素を取得する
    await driver.get("https://kokushin-u.jp/");
    const title = await driver.getTitle();
    res.send(
      JSON.stringify({
        data: {
          jobRunID: req.body.id ?? 1,
          now: now.toISOString(),
          timestamp: Math.floor(now.getTime() / 1000),
          title: title,
        },
      })
    )
  } catch (err) {
    // エラーが発生した場合は、エラーメッセージを返す
    res.status(500).send({
        error: err 
    });
  } finally {
    await driver.quit();
  }
  */
});

const port = 8080;
app.listen(port, () => {
  console.log("Node.js is listening to PORT:" + port);
});