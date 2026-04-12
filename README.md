# 夏夏的小窝

一个简洁、淡色天蓝风格的个人主页，集成了基于 GitHub 的留言板系统。

## ✨ 功能

- **淡色天蓝主题** — 清爽简洁的视觉风格
- **留言板** — 基于 [giscus](https://giscus.app) 的评论系统，数据存储在 GitHub Discussions
- **Markdown 支持** — 留言支持 Markdown 语法、代码块，格式会被完整保留
- **折叠/展开** — 留言区默认折叠，点击展开查看全部
- **管理模式** — 前端密码门槛（`xiaxia`），跳转到 GitHub 进行实际管理操作
- **Toast 提示** — 留言操作时显示活泼文案提示

## 🔧 留言板配置

### 使用 Giscus（推荐）

1. **启用 GitHub Discussions**：
   - 前往仓库 Settings → General → Features → 勾选 **Discussions**

2. **安装 giscus app**：
   - 前往 [https://github.com/apps/giscus](https://github.com/apps/giscus) 安装并授权给本仓库

3. **获取配置参数**：
   - 前往 [https://giscus.app](https://giscus.app)
   - 输入仓库名 `xiaxiadayo/xiaxiadayo.github.io`
   - 选择 Discussion 分类（推荐 `General`）
   - 复制生成的 `data-repo-id` 和 `data-category-id`

4. **更新 `index.html`**：
   - 找到 giscus `<script>` 标签
   - 填入正确的 `data-repo-id` 和 `data-category-id` 值

```html
<script src="https://giscus.app/client.js"
  data-repo="xiaxiadayo/xiaxiadayo.github.io"
  data-repo-id="你的仓库ID"           <!-- 替换为实际值 -->
  data-category="General"
  data-category-id="你的分类ID"        <!-- 替换为实际值 -->
  data-mapping="pathname"
  data-strict="0"
  data-reactions-enabled="1"
  data-emit-metadata="0"
  data-input-position="top"
  data-theme="light"
  data-lang="zh-CN"
  data-loading="lazy"
  crossorigin="anonymous"
  async>
</script>
```

### 切换到 Utterances

如果你更喜欢 [utterances](https://utteranc.es)（基于 GitHub Issues 而非 Discussions）：

1. 前往 [https://utteranc.es](https://utteranc.es) 配置
2. 将 `index.html` 中 giscus 的 `<script>` 替换为：

```html
<script src="https://utteranc.es/client.js"
  repo="xiaxiadayo/xiaxiadayo.github.io"
  issue-term="pathname"
  theme="github-light"
  crossorigin="anonymous"
  async>
</script>
```

3. 安装 utterances app：[https://github.com/apps/utterances](https://github.com/apps/utterances)

## ⚠️ 已知限制

由于使用了第三方嵌入式评论系统（giscus/utterances），以下功能存在限制：

| 需求 | 实现情况 | 说明 |
|------|---------|------|
| 所有字符 & 格式保留 | ✅ 完整支持 | Markdown/代码块均可正常渲染和保留 |
| 留言折叠/展开 | ✅ 已实现 | 外层容器提供折叠/展开控制 |
| 手机两列/电脑分页 | ⚠️ 部分实现 | 评论列表布局由 giscus iframe 控制，无法自定义网格/分页；外层提供折叠以控制可视区域 |
| 每条留言独立复制 | ⚠️ 替代方案 | iframe 跨域限制无法为每条评论注入复制按钮；用户可在 GitHub Discussions 页面直接复制 |
| 管理密码 xiaxia | ✅ 已实现（UI 门槛） | 前端密码仅控制管理面板的显示/隐藏，**不是真正的权限控制**；实际删除/编辑留言需要仓库管理员在 GitHub 上操作 |
| 留言后弹窗 | ✅ 已实现 | 点击"前往留言"按钮时触发 Toast 提示 |

## 📁 项目结构

```
├── index.html          # 主页面
├── 404.html            # 404 页面
├── css/
│   └── style.css       # 样式文件
├── assets/
│   ├── images/         # 图片资源
│   └── README.md       # 素材说明
├── favicon.*           # 网站图标
└── README.md           # 本文件
```

## 📜 许可

© 2024 - 2026 xiaxiadayo
