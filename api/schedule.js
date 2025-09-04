// api/schedule.js
// LINE WORKSからスケジュールを取得するAPI

export default async function handler(req, res) {
  // CORS設定（Claudeからアクセスできるように）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // OPTIONSリクエスト対応
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // TODO: LINE WORKS認証処理
    // const token = await getLineWorksToken();
    
    // TODO: カレンダーデータ取得
    // const schedules = await fetchSchedules(token);
    
    // 今はテストデータを返す
    const testData = {
      success: true,
      date: new Date().toISOString(),
      message: "LINE WORKS接続前のテストデータです",
      schedules: {
        "2025-01-15": {
          staff: [
            { name: "スタッフA", status: "出勤", time: "9:00-18:00" },
            { name: "スタッフB", status: "休み" },
            { name: "スタッフC", status: "出勤", time: "10:00-19:00" }
          ]
        }
      }
    };
    
    res.status(200).json(testData);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
