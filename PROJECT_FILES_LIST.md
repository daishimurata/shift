# 新しいClaude プロジェクト用 - 必要ファイル一覧

## 📋 **Claude プロジェクトに追加すべき知識ファイル**

### **🎯 メイン知識ファイル（必須）**
```
OHISAMA_CLAUDE_PROJECT_GUIDE.md
```
**内容**: システム全体の使用方法、Vercel MCP必須事項、全API仕様

### **📚 補助ファイル（推奨）**
```
Claude_AI_実行コマンド集_Vercel_Pro版.md
CLAUDE_AI_CACHE_LIMITATION_GUIDE.md
```
**内容**: 詳細なコマンド集、キャッシュ問題の技術的詳細

---

## 🚀 **稼働中の重要APIファイル**

### **📱 メッセージ送信API（11個）**
```
api/send-murata.js          # 村田太志（管理者）
api/send-matsumoto.js       # 松本愛美（サブ管理者）
api/send-konishi.js         # 小西瞳（職業指導員）
api/send-nakai.js           # 中井理恵（職業指導員）
api/send-kawai.js           # 河相由梨奈（職業指導員）
api/send-yoshizawa.js       # 吉澤冬美（生活支援員）
api/send-kimura.js          # 木村菜々美（最重要）
api/send-honma.js           # 本間愛梨（生活支援員）
api/send-utsunomiya.js      # 宇都宮りえ（生活支援員）
api/send-to-nippo-room.js   # 日報ルーム送信
api/send-staff-account.js   # スタッフアカウント
```

### **💬 日報取得API（4個）**
```
api/claude-ultimate-refresh.js    # 🔥 メイン（Vercel MCP必須）
api/claude-force-refresh.js       # 代替1
api/claude-realtime-reports.js    # 代替2
api/claude-daily-reports.js       # 代替3
```

### **📅 カレンダーAPI（1個）**
```
api/all-members-individual-calendar.js  # 全スタッフカレンダー
```

### **🔧 システム管理API（4個）**
```
api/health.js                      # システム状態確認
api/lineworks-callback-redis-v2.js # Webhook受信
api/read-stored-messages-redis-v2.js # メッセージ読み取り
api/webhook-debug.js               # デバッグ情報
```

---

## 📊 **現在のデプロイメント状況**

### **最新URL（2025年9月13日）**
```
# 日報取得（Vercel MCP必須）
https://shift-lineworks-c92ewi08e-daishimuratas-projects.vercel.app/

# メッセージ送信
https://shift-lineworks-2u628r0cg-daishimuratas-projects.vercel.app/

# その他API
https://shift-lineworks-pq0bilqnv-daishimuratas-projects.vercel.app/
```

---

## 🎯 **新しいClaude プロジェクトでの使用方法**

### **1. 知識ファイルのアップロード**
```
1. OHISAMA_CLAUDE_PROJECT_GUIDE.md をアップロード
2. Claude_AI_実行コマンド集_Vercel_Pro版.md をアップロード（任意）
3. CLAUDE_AI_CACHE_LIMITATION_GUIDE.md をアップロード（任意）
```

### **2. 最初の確認コマンド**
```
Vercel:web_fetch_vercel_url({
  url: "https://shift-lineworks-c92ewi08e-daishimuratas-projects.vercel.app/api/claude-ultimate-refresh"
})
```

### **3. 重要な指示**
```
「LINE WORKSの日報データを取得する際は、必ずVercel MCPツールを使用してください。
通常のweb_fetchは古いキャッシュデータしか返しません。」
```

---

## ⚠️ **削除済みファイル（不要）**

### **削除されたAPIファイル（10個）**
- debug-api-access.js
- test-redis.js
- find-report-room.js
- get-staff-info.js
- list-bot-channels.js
- read-bot-messages.js
- read-stored-messages.js
- read-stored-messages-redis.js
- lineworks-callback.js
- lineworks-callback-redis.js
- admin-read-messages.js

### **削除されたドキュメント（6個）**
- CLAUDE_AI_ACCESS_GUIDE.md
- CLAUDE_CACHE_SOLUTION.md
- CLAUDE_NEW_CHAT_INSTRUCTIONS.md
- Claude_AI_完全テスト指示書_Vercel_Pro版.md
- production-options.md

---

## 🏆 **プロジェクト完成状況**

✅ **メイン機能**: 完全稼働中
- スタッフ個別メッセージ送信
- カレンダー予定取得
- 日報リアルタイム監視

✅ **技術的課題**: 完全解決
- Vercel MCPによるキャッシュ問題解決
- リアルタイムデータ取得実現

✅ **システム最適化**: 完了
- 不要ファイル削除
- 知識ファイル統合
- ドキュメント整理

**最終更新**: 2025年9月13日 14:25
**ステータス**: 🟢 新プロジェクト準備完了
