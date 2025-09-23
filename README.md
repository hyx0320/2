# 交互式视频问答 Demo

本示例展示了如何在网页中播放视频，并在下方显示问题与选项。点击选项会将视频跳转到指定的时间点。

## 结构

```
index.html
video/
  movie.mp4
```

## 修改题目与时间

打开 `index.html`，在脚本中找到 `questions` 数组：

```js
const questions = [
  {
    id: 'q1',
    time: 0, // 问题出现的时间（秒）
    text: '你想从哪个部分开始观看？',
    pauseOnShow: false, // 出现时是否暂停视频
    options: [
      { label: '开场(0:00)', jumpTo: 0 },
      { label: '精彩片段(0:42)', jumpTo: 42 },
      { label: '结尾预览(2:00)', jumpTo: 120 }
    ]
  }
]
```

- `time`: 问题出现的时间（单位：秒）。当视频时间达到或超过该值时，问题会显示出来。
- `pauseOnShow`: 当问题出现时是否暂停视频。
- `options`: 每个选项包含 `label`（展示给用户的文本）和 `jumpTo`（点击后跳转的目标秒数）。

可以按需增加或删除问题对象，也可以为每个问题配置不同的选项。

## 运行

直接双击打开 `index.html` 即可在浏览器中查看效果。若视频无法加载，请确认：

- `video/movie.mp4` 文件存在且能被浏览器播放（H.264 编码兼容性最佳）。
- 路径区分大小写是否一致。

## 可选改进

- 在跳转后收起当前问题卡片或高亮已选择的选项。
- 将题目配置提取到单独的 JSON 文件并通过 `fetch` 加载。
- 结合考试/评分逻辑，记录用户选择与时间点。

## 部署：让别人通过网址访问

这是一个纯静态站点（HTML/CSS/JS + 本地 mp4），可以用多种免费或常见方式部署：

### 方案一：GitHub Pages（免费、适合公开项目）
1. 新建一个 GitHub 仓库，把以下文件与目录推送上去：
   - `index.html`
   - `css/`、`js/`、`video/`（包含 `movie.mp4`）
2. 在仓库 Settings -> Pages：
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `main` 分支和根目录（`/root`）
3. 保存后约 1 分钟，会得到一个形如 `https://<你的用户名>.github.io/<仓库名>/` 的网址。

Windows/cmd 常用命令（可选）：

```bat
:: 初始化并推送到 GitHub（在项目根目录执行）
git init
git add .
git commit -m "init: hospital self-visit demo"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

注意：GitHub Pages 为公共访问，视频体积太大时，首次加载较慢。建议压缩 mp4（H.264/AAC）。

### 方案二：Netlify（免费、快速、可私有）
1. 访问 https://www.netlify.com/ 并登录。
2. New site from Git -> 绑定你的 GitHub 仓库。
3. Build command 留空，Publish directory 选择项目根目录（包含 `index.html`）。
4. 部署完成后会分配一个 `https://<随机名>.netlify.app` 的域名。

也可用 Netlify CLI（可选）：

```bat
npm install -g netlify-cli
netlify deploy --prod --dir=.
```

### 方案三：自有服务器 / Nginx（可控性最高）
1. 将项目文件上传到服务器目录，例如 `/var/www/hospital-visit`（Windows 服务器亦可放到任意站点根目录）。
2. 配置 Nginx 站点（Linux 示例）：

```
server {
  listen 80;
  server_name your-domain.com;
  root /var/www/hospital-visit;
  index index.html;

  location / {
    try_files $uri $uri/ =404;
  }

  # 确保视频的 MIME 类型正确（mp4 默认应为 video/mp4）
  types {
    video/mp4 mp4;
  }
}
```

3. 重新加载 Nginx：

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Windows IIS 提示：确认 `video/mp4` MIME 类型已配置。

### 部署验证清单
- 通过最终网址访问是否能正常加载页面与视频？
- 浏览器 DevTools Network 中 `movie.mp4` 响应的 `Content-Type` 是否为 `video/mp4`？
- 跨域：如果未来把视频放到单独域名，需允许跨域访问（CORS）。
- 体积与带宽：建议将 mp4 控制在合理大小（< 20-50MB），或提供多码率版本。

### 自定义域名（可选）
- GitHub Pages/Netlify 都支持绑定自定义域名，配置 DNS 的 CNAME 记录指向平台给的域名即可。

---

选择建议：
- 想要最省事：GitHub Pages（公开）或 Netlify（可私有仓库）都很合适。
- 需要自定义缓存策略或访问控制：自有服务器 + Nginx 最灵活。
