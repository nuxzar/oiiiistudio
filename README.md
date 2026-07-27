# Oiiii 创意工作室官网

可玩的作品展示空间：横向无限循环作品墙、案例详情、四个 I 品牌动效。

## 技术栈

- Next.js (App Router)
- Tailwind CSS
- Framer Motion
- GSAP + ScrollTrigger
- Lenis

## 线上

- 站点：https://oiiii.studio/
- 仓库：https://github.com/nuxzar/oiiiistudio
- 部署：推送 `main` 后由 GitHub Actions 发布到 GitHub Pages

## 开发

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

## 结构

- `/` 首页作品无限滚动 + 四个 I + 工作室
- `/work/[slug]` 案例详情模板
