// api/all-members-individual-calendar.js
// 全メンバーの個人カレンダーを個別に取得するAPI（木村さんの予定取得問題対応）

import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: '認証に失敗しました'
      });
    }

    const action = req.query.action || 'getAllMembersCalendar';
    
    switch (action) {
      case 'getAllMembersCalendar':
        return await getAllMembersCalendar(req, res, accessToken);
      case 'getSpecificMember':
        const memberEmail = req.query.email;
        if (!memberEmail) {
          return res.status(400).json({
            success: false,
            error: 'メンバーのemailパラメータが必要です'
          });
        }
        return await getSpecificMemberCalendar(req, res, accessToken, memberEmail);
      default:
        return res.status(400).json({
          success: false,
          error: '無効なアクション',
          availableActions: ['getAllMembersCalendar', 'getSpecificMember']
        });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      date: new Date().toISOString()
    });
  }
}

// 全メンバーの個人カレンダーを取得
async function getAllMembersCalendar(req, res, accessToken) {
  // おひさま農園のスタッフメンバー一覧（実際のLINE WORKSアドレス）
  const members = [
    { name: '村田太志', email: 'pr.12187@ohisamafarm', role: '職業指導員（サービス管理責任者）' },
    { name: '松本愛美', email: 'oh.47553@ohisamafarm', role: 'サービス管理責任者（サブ）' },
    { name: '小西瞳', email: 'oh.19136@ohisamafarm', role: '職業指導員' },
    { name: '中井理恵', email: 'oh.88782@ohisamafarm', role: '職業指導員' },
    { name: '河相由梨奈', email: 'oh.34317@ohisamafarm', role: '職業指導員' },
    { name: '吉澤冬美', email: 'oh.88054@ohisamafarm', role: '生活支援員' },
    { name: '木村捺々恵', email: 'oh.59001@ohisamafarm', role: '生活支援員' },
    { name: '本間愛梨', email: 'oh.96030@ohisamafarm', role: '生活支援員' },
    { name: '宇都宮りえ', email: 'oh.81528@ohisamafarm', role: '生活支援員' },
    { name: 'おひさま農園', email: 'staff@ohisamafarm', role: '事務' }
  ];

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const fromDateTime = startOfMonth.toISOString().replace('Z', '+09:00');
  const untilDateTime = endOfMonth.toISOString().replace('Z', '+09:00');

  const results = [];
  let successCount = 0;
  let totalEvents = 0;

  // 各メンバーの予定を個別に取得
  for (const member of members) {
    try {
      const memberResult = await getMemberCalendarEvents(
        accessToken, 
        member.email, 
        fromDateTime, 
        untilDateTime,
        member.name,
        member.role
      );
      
      results.push(memberResult);
      
      if (memberResult.success) {
        successCount++;
        totalEvents += memberResult.eventCount;
      }
      
    } catch (error) {
      results.push({
        name: member.name,
        email: member.email,
        role: member.role,
        success: false,
        error: error.message,
        eventCount: 0,
        events: []
      });
    }
  }

  return res.status(200).json({
    success: true,
    message: "🎉 全メンバーの個人カレンダー取得完了！",
    summary: {
      totalMembers: members.length,
      successfulMembers: successCount,
      failedMembers: members.length - successCount,
      totalEvents: totalEvents,
      period: `${startOfMonth.getFullYear()}年${startOfMonth.getMonth() + 1}月`
    },
    members: results,
    date: new Date().toISOString(),
    specialNote: "木村捺々恵さんの予定取得問題に対応済み"
  });
}

// 特定メンバーのカレンダーを取得
async function getSpecificMemberCalendar(req, res, accessToken, memberEmail) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const fromDateTime = startOfMonth.toISOString().replace('Z', '+09:00');
  const untilDateTime = endOfMonth.toISOString().replace('Z', '+09:00');

  try {
    const result = await getMemberCalendarEvents(
      accessToken, 
      memberEmail, 
      fromDateTime, 
      untilDateTime,
      memberEmail.split('@')[0], // 名前として使用
      '指定メンバー'
    );

    return res.status(200).json({
      success: true,
      message: `${memberEmail} のカレンダー取得完了`,
      member: result,
      date: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      memberEmail: memberEmail,
      date: new Date().toISOString()
    });
  }
}

// 個別メンバーのカレンダーイベント取得
async function getMemberCalendarEvents(accessToken, userEmail, fromDateTime, untilDateTime, memberName, memberRole) {
  // まず個人カレンダーを取得
  const eventsUrl = `https://www.worksapis.com/v1.0/users/${userEmail}/calendar/events`;
  const fullUrl = `${eventsUrl}?fromDateTime=${encodeURIComponent(fromDateTime)}&untilDateTime=${encodeURIComponent(untilDateTime)}`;
  
  try {
    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const responseText = await response.text();
    let eventsData;
    
    try {
      eventsData = JSON.parse(responseText);
    } catch (parseError) {
      eventsData = { raw: responseText, parseError: parseError.message };
    }

    const events = eventsData?.events || [];
    const eventCount = events.length;

    return {
      name: memberName,
      email: userEmail,
      role: memberRole,
      success: response.status === 200,
      status: response.status,
      eventCount: eventCount,
      events: events,
      endpoint: fullUrl,
      rawResponse: response.status !== 200 ? responseText : undefined
    };

  } catch (error) {
    return {
      name: memberName,
      email: userEmail,
      role: memberRole,
      success: false,
      error: error.message,
      eventCount: 0,
      events: [],
      endpoint: fullUrl
    };
  }
}

// 認証トークン取得
async function getAccessToken() {
  const clientId = process.env.LINEWORKS_CLIENT_ID;
  const clientSecret = process.env.LINEWORKS_CLIENT_SECRET;
  const serviceAccount = process.env.LINEWORKS_SERVICE_ACCOUNT_ID;
  const privateKey = process.env.LINEWORKS_PRIVATE_KEY;

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientId,
    sub: serviceAccount,
    iat: now,
    exp: now + 3600
  };

  const assertion = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

  const response = await fetch('https://auth.worksmobile.com/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'calendar,user.read,bot',
      assertion: assertion
    })
  });

  const responseData = await response.json();
  return response.status === 200 ? responseData.access_token : null;
}