# 素材说明 / Asset Guide

本目录包含网站所需的素材资源。

## 📁 目录结构

```
assets/
├── images/          # 图片资源
│   ├── cat-ears-deco.svg      # 猫耳装饰（原创抽象 SVG）
│   ├── neko-silhouette.svg    # 猫咪剪影（原创抽象 SVG）
│   └── starry-bg.svg          # 星空背景（原创抽象 SVG）
├── music/           # 音乐资源
│   ├── track1.mp3             # 占位音频 - 请替换
│   ├── track2.mp3             # 占位音频 - 请替换
│   └── track3.mp3             # 占位音频 - 请替换
├── js/              # JavaScript
│   ├── game.js                # 星之猫小游戏
│   └── player.js              # Lofi 音乐播放器
└── README.md        # 本文件
```

## 🎨 图片替换指引

当前图片均为 **原创抽象风格 SVG**（非任何版权角色的官方素材）。

如需替换为您自己的图片：
1. 将新图片放入 `/assets/images/` 目录
2. 在 `index.html` 中找到 `<img src="/assets/images/xxx.svg">`，修改 `src` 为新文件路径
3. 支持 SVG、PNG、JPG、WebP 格式
4. 建议图片尺寸：至少 400×400px，正方形或 4:3 比例

> ⚠️ 如使用猫羽雫等角色的官方/同人素材，请确保获得授权。

## 🎵 音乐替换指引

当前音频为 **占位文件**（5 秒简单音调），请替换为真正的 lofi 纯音乐。

### 推荐免费音乐来源（CC0 / 免费使用）：
- [Free Music Archive](https://freemusicarchive.org/) – 筛选 CC0 / CC-BY 许可
- [Pixabay Music](https://pixabay.com/music/) – 免费商用
- [Uppbeat](https://uppbeat.io/) – 免费 lofi 分类
- [Chosic](https://www.chosic.com/free-music/lofi/) – lofi 专区

### 替换步骤：
1. 下载 MP3 格式的 lofi 音乐文件
2. 命名为 `track1.mp3`、`track2.mp3`、`track3.mp3`（或自定义名称）
3. 放入 `/assets/music/` 目录
4. 如更改文件名，需同步修改 `/assets/js/player.js` 中的 `playlist` 数组：
   ```js
   const playlist = [
     { title: '你的曲名1', src: '/assets/music/你的文件1.mp3' },
     { title: '你的曲名2', src: '/assets/music/你的文件2.mp3' },
     { title: '你的曲名3', src: '/assets/music/你的文件3.mp3' }
   ];
   ```
5. 可添加更多曲目，只需往数组中追加即可

## 🎮 小游戏说明

「星之猫 ✦ Neko Star Catcher」是一个纯前端 Canvas 小游戏：
- 键盘 ← → ↑ ↓ 或 WASD 控制
- 触屏滑动控制（移动端）
- 收集 ⭐ 星星（+10 分）和 🎵 音符（+15 分）
- 避开 🌧️ 雨云（-20 分 & 失去一条命）
- 5 条命，全部用完游戏结束

## 🎧 音乐播放器说明

播放器位于屏幕右下角，竖向条形设计：
- 自动播放处理：先尝试静音自动播放，用户首次交互后解除静音
- 快捷键：`M` 播放/暂停、`N` 下一首、`B` 上一首
- Web Audio API 频谱可视化竖条动画

## 📜 许可证

- SVG 插画：原创作品，随项目使用
- 占位音频：FFmpeg 生成的简单音调，无版权
- 请确保替换的音乐素材符合其许可证要求
