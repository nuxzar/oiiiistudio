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

## 开发 / 预览 / 部署

```bash
npm install
npm run dev                 # 本地开发 http://localhost:3000
npm run build && npm start  # 本地生产模式（非静态导出）
npm run preview             # 模拟 GitHub Pages 静态站 http://localhost:4173
```

推送 `main` 后 Actions 会静态导出并发布到 https://oiiii.studio/  
本地默认不用静态导出，所以 `dev` / `start` 与线上部署可以同时用。

## 结构

- `/` 首页作品无限滚动 + 四个 I + 工作室
- `/work/[slug]` 案例详情模板
