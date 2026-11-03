# KAWAN PRASEJARAH — 给老师的中文使用说明

这个项目是**全新的史前人类互动角色网站**，与你之前的 `ice-age-virtual-library` 无关。

## 先在 GitHub 建立新仓库

1. 打开 GitHub，点右上角 **+ → New repository**。
2. Repository name 写 `kawan-prasejarah`，选择 Public 或 Private（如需公开 GitHub Pages，检查当前账户的 Pages 限制）。
3. 建立仓库后，选择 **uploading an existing file**，上传这个项目文件夹内的全部内容，**不是只上传 ZIP 文件**。请保留 `.github/workflows/deploy.yml` 的文件夹层级。
4. 进入仓库 **Settings → Pages → Build and deployment → GitHub Actions**。
5. 进入 **Actions**，找到 Deploy to GitHub Pages，查看部署是否成功。
6. 网址通常是 `https://你的用户名.github.io/kawan-prasejarah/`。

**注意：仅 Export JSON 不会发布网站。** JSON 只是知识库备份。

## 学生怎么使用

打开网站 → 点击史前人类的头、脸、手、肚子或脚，会触发动画和反应。学生可以在提问框打马来文问题、按麦克风讲话（支持的浏览器）或点下面的建议问题。回答只来自老师准备的问题库，不会凭空生成答案。

## 老师如何即时修改答案

1. 点击右上角 **Mod Guru**。
2. 首次在本地使用时设置专属 PIN，以后用同一 PIN 进入。
3. 在 **Bank Soalan** 点编辑，修改题目、替代问法、关键词和马来文答案。
4. 点击 **Simpan Perubahan**。回到主页面，学生提问时立即使用新答案，不必更改 GitHub 代码。
5. 在 **Makmal Uji Soalan** 测试匹配结果。在 **Avatar** 修改人类角色、颜色、大小、位置、语音速度、背景等。
6. 进入 **Data & Sandaran**，定期下载 JSON 备份。

## 两台手机或电脑怎么同步？

本地模式：资料只保存在当前浏览器。另一台设备不会自动变化。你可以 Export JSON，再到另一台设备 Import JSON。

在线模式：需要额外设置免费的 Supabase 项目、数据库策略、老师账号和 GitHub Actions 变量（详细方法在 README.md 和 supabase/schema.sql）。老师登录在线账号，点 **Terbitkan** 后，其他设备会通过 Supabase Realtime 接收发布的内容；如果在线实时订阅没有连上，刷新页面也可以读取最新发布版。

## 关于语音和动画

- 浏览器必须支持 `ms-MY` 马来文语音与麦克风功能才能完整听和说；不支持时仍可使用**文字问答**。
- 默认的史前人类是分层 SVG，眼睛、头、手臂、嘴巴等可独立动画。上传一张照片只能整体移动，并不等于真正的分层人物口型动画。
- 网站不需要 OpenAI / Gemini 付费 API，但浏览器语音识别有时依赖浏览器供应商的网络语音服务。

## 本地开发（有 Node.js 时）

```bash
npm install
npm run dev
npm test
npm run build
```

项目包含 40 道基础史前历史问答（每个时代 10 道）、12 道选择题和完整 Guru Mode。
