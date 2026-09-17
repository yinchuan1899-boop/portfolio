# 作品内容维护

浏览结构：主页 / 作品分类 → 板块内项目选择 → 项目效果图 → 单图放大。

当前三个板块与素材根目录一一对应：`界面`、`游戏UI`、`公司活动`。
板块下每个文件夹是一个项目；项目里的子文件夹保留为效果图分组。
纯数字项目文件夹以“公司活动 01 / 02”显示，未虚构项目名称或说明。

## 导入

```powershell
pnpm exec node scripts/import-portfolio.mjs "素材根目录"
pnpm exec node scripts/verify-portfolio.mjs "素材根目录"
```

- 源目录只读，不覆盖、裁切或修改原图。
- `app/data/portfolio.json` 是自动生成的目录；`app/data/portfolio.ts` 定义类型与统计。
- `public/portfolio` 存储网页副本：960 像素内的缩略图、5120 像素内的高清图，均不放大源图片。
- 图片完整保留比例，输出 WebP；页面按需加载缩略图，只在单图浏览时加载高清图。
- “打开高清图”打开网页高清副本，不是原始源文件。
- 文件名与源目录的相对路径、SHA-256 校验保留在目录中，没有机器绝对路径。
- 导入复用未改变素材的网页副本，不新增依赖；使用 Next.js 已安装的图片处理器。
- 导入脚本不自动删除旧图片。删除项目时先核对引用，再单独清理，避免误删素材。

## 检查

```powershell
pnpm lint
pnpm exec tsc --noEmit
pnpm exec next build
pnpm exec node scripts/verify-portfolio.mjs
```

Windows 的包管理器若无法解析 `tsc` / `next` 命令，可用相同工具入口：
`pnpm exec node node_modules/typescript/bin/tsc --noEmit` 与
`pnpm exec node node_modules/next/dist/bin/next build`。

Vercel 继续使用现有的标准 Next.js 构建，不需要在部署机器上重新读取原始素材目录。
