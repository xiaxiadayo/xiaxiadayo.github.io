# 夏夏的留言板

一个简洁的公共留言板，部署在 GitHub Pages 上。主题色为淡色天蓝色（light pastel sky blue）。

## 功能

- **公共留言**：填写署名和内容后发布，所有访客可见。
- **格式保留**：留言内容使用 `<pre>` + `white-space: pre-wrap` 渲染，换行、空格、缩进、代码块等格式完全保留。复制按钮使用 Clipboard API 复制原始文本。
- **折叠/展开**：超过一定高度的留言默认折叠，点击"展开"查看全部。
- **复制按钮**：每条留言附带"复制"按钮，点击后将完整原文（含格式）复制到剪贴板。
- **响应式布局**：
  - 手机端（≤768px）：两列网格显示。
  - 桌面端：每页 5 条留言，分页显示。
- **管理功能**：点击导航栏"管理"按钮，输入密码后可删除单条留言。
- **发布成功提示**：留言成功后弹出活泼文案的 Toast 提示。

## 留言存储方案

### 方案 A：本地模式（默认）

默认使用浏览器 `localStorage`，**仅当前设备/浏览器可见**。适用于演示或个人使用。

### 方案 B：Supabase（推荐，全网可见）

使用 [Supabase](https://supabase.com) 作为后端，实现"任何人发布、所有人可见"。

#### 配置步骤

1. 在 [supabase.com](https://supabase.com) 创建一个免费项目。
2. 在 SQL Editor 中执行以下 SQL 创建 `messages` 表：

   ```sql
   CREATE TABLE messages (
     id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     author     TEXT NOT NULL,
     content    TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT now()
   );

   -- 启用行级安全
   ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

   -- 允许所有人读取
   CREATE POLICY "Public read" ON messages FOR SELECT USING (true);

   -- 允许匿名插入
   CREATE POLICY "Anon insert" ON messages FOR INSERT WITH CHECK (true);

   -- 允许匿名删除（前端密码只做简单门槛）
   CREATE POLICY "Anon delete" ON messages FOR DELETE USING (true);
   ```

3. 在项目设置 → API 中复制 **Project URL** 和 **anon public key**。
4. 编辑 `config.js`，填入以上信息并将 `STORAGE_BACKEND` 改为 `"supabase"`：

   ```js
   const MESSAGE_BOARD_CONFIG = {
     STORAGE_BACKEND: "supabase",
     SUPABASE_URL: "https://你的项目.supabase.co",
     SUPABASE_ANON_KEY: "你的anon key",
     ADMIN_PASSWORD: "xiaxia"
   };
   ```

5. 提交并推送到 GitHub，GitHub Pages 部署后即可使用。

## 安全说明

> **⚠️ 前端密码不安全**
>
> 管理密码 (`xiaxia`) 仅在前端 JavaScript 中检查，**任何人查看源代码即可看到密码**。
> 这只是一个简单的门槛，防止误操作，不能提供真正的安全保护。
>
> Supabase 的 anon key 同样暴露在前端。请务必在 Supabase 中配置 Row Level Security (RLS) 策略来控制数据访问。

## 格式保留与复制

- 留言内容使用 `textContent` 赋值到 `<pre>` 元素，天然保留所有空白字符。
- CSS 设置 `white-space: pre-wrap; word-wrap: break-word;` 确保长行自动换行但不丢失原始格式。
- 复制功能优先使用 `navigator.clipboard.writeText()`（Clipboard API），不支持时降级为 `document.execCommand('copy')`。
- 复制的内容是原始纯文本，与发布者粘贴上去的格式和文字完全一致。

## 文件结构

```
├── index.html              # 主页（留言板）
├── 404.html                # 404 页面
├── config.js               # 存储后端配置
├── css/
│   └── style.css           # 样式
├── assets/
│   └── js/
│       └── messageboard.js # 留言板逻辑
└── README.md               # 本文件
```

## 许可证

© 2024 – 2026 xiaxiadayo
