# Tutor

## 專案畫面

![image](https://github.com/alan890729/C4-final-capstone-tutor/blob/main/public/images/screenshot.png)

## Features - 產品功能

1. 使用者可以註冊帳號，初始身分為學生
2. 使用者可以登入、登出已註冊的帳號
3. 使用者可以用google快速登入
4. 學生可以填選成為老師表單，獲得老師身份。成為老師身份無法再使用學生身份的權限例如預約課程。
5. 使用者可以在主頁看到老師清單以及學生學習時數排行前十名。
6. 使用者可以在主頁透過搜尋框搜尋老師的名字以及課程介紹。
7. 使用者可以點進老師頁面，學生更可以看到上課時間選項並能夠預約。
8. 學生可以在個人頁面看到未來預約、歷史課程（有無評論）、學習時數排行及時數；老師可以在個人頁面看到未來預約、課程介紹、教學風格、最近評論。
9. 學生可以在個人頁面評價給未評價的歷史課程。
10. 管理者帳號可以使用後台
11. 管理者可以查看全部使用者清單
12. 管理者無法使用前台

## Getting Started - 啟動專案

以下為**Getting Started - 啟動專案**的各段落的摘要：
1. **Prerequisites - 環境建置與需求**：使用什麼框架、模組，以及各種工具的版本。
2. **Installing - 專案安裝流程**：如何從github下載這個專案，並在自己的本地環境啟動此專案。


### Prerequisites - 環境建置與需求
- Node.js(RTE) - v20.14.0
- MySQL - v8.0.16
- [Express.js](https://expressjs.com)
- [Nodemon](https://www.npmjs.com/package/nodemon)
- [Bootstrap](https://getbootstrap.com/docs/5.2/getting-started/introduction/)
- [font-awesome](https://fontawesome.com/)
- [Express-handlebars](https://www.npmjs.com/package/express-handlebars)
- [mysql2](https://www.npmjs.com/package/mysql2)
- [sequelize](https://www.npmjs.com/package/sequelize)
- [sequelize-cli](https://www.npmjs.com/package/sequelize-cli)
- [method-override](https://www.npmjs.com/package/method-override)
- [express-session](https://www.npmjs.com/package/express-session)
- [connect-flash](https://www.npmjs.com/package/connect-flash)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [passport](https://www.npmjs.com/package/passport)
- [passport-local](https://www.npmjs.com/package/passport-local)
- [passport-google-oauth20](https://www.npmjs.com/package/passport-google-oauth20)

### Installing - 專案安裝流程

1. 打開terminal，輸入
    ```
    git clone https://github.com/alan890729/C4-final-capstone-tutor.git
    ```

2. 開啟終端機(Terminal)，進入存放此專案的資料夾
    ```
    cd C4-final-capstone-tutor
    ```

3. 安裝 npm 套件
    ```
    npm install
    ```

4. 在MySQL WorkBench建立一個名為tutor的資料庫

    以下提供兩個方案，一是資料庫中沒有存在與tutor同名的資料庫，二是資料庫已存在tutor資料庫，所以建立另一個資料庫，用途是來執行此專案

    - 資料庫沒有與tutor同名的資料庫

      打開MySQL WorkBench，輸入以下指令建立資料庫：
      ```
      CREATE DATABASE `tutor`;
      ```

      進到./config/config.json把"development"之下的"username", "password"的值改成你自己MySQL WorkBench使用的username和password

    - 資料庫有與tutor同名的資料庫，所以另外建立一個執行此專案用的資料庫

      打開MySQL WorkBench，輸入以下指令建立資料庫：
      ```
      CREATE DATABASE `test-database`;
      ```

      進到./config/config.json把"development"之下的"username", "password"的值改成你自己MySQL WorkBench使用的username和password，"database"的值則改成"test-database"

5. 執行db migrate和db seed

    資料庫建立好後，打開終端機並移動到此專案目錄之下，輸入以下指令：
    ```
    npm run migrate
    npm run seed
    ```
    上面的指令會執行migration以及植入種子資料

6. 參考.env.example的模板建立自己的.env

7. 在專案資料夾下，建立temp/及upload/兩個資料夾
    ```
    C4-final-capstone-tutor
    |_temp/
    |_upload/
    ```

8. 是否已經安裝nodemon
  
    - 已有nodemon，直接根據作業系統是windows或是unix-like，去各自輸入以下指令啟動專案

        windows:
        ```
        npm run dev:windows
        ```

        unix:
        ```
        npm run dev:unix
        ```
        server會在 <http://localhost:3000> 執行

    - 還沒有安裝nodemon，先退回前一個路徑，在global安裝nodemon。輸入：
        ```
        npm install -g nodemon
        ```

        接著再回到 **expense-tracker** 資料夾內，輸入：

        windows:
        ```
        npm run dev:windows
        ```

        unix:
        ```
        npm run dev:unix
        ```

## Authors

  - [**Alpha Camp**](https://tw.alphacamp.co/) - provide project template.
  - [**Alan Huang**](https://github.com/alan890729) - build this project with express.js based on provided project template.

