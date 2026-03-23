interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { countryCode, countryName } = (await context.request.json()) as { 
      countryCode: string; 
      countryName?: string 
    };

    if (!countryCode) {
      return new Response(JSON.stringify({ error: "Missing countryCode" }), { status: 400 });
    }

    const code = countryCode.toUpperCase();
    const name = countryName || code;

    // 1. 전체 통계 업데이트
    await context.env.DB.prepare(`
      INSERT INTO stats (country_code, country_name, click_count)
      VALUES (?, ?, 1)
      ON CONFLICT(country_code) DO UPDATE SET
        click_count = click_count + 1,
        country_name = excluded.country_name
    `).bind(code, name).run();

    // 2. 실시간 집계를 위한 로그 삽입
    await context.env.DB.prepare(`
      INSERT INTO click_log (country_code, country_name)
      VALUES (?, ?)
    `).bind(code, name).run();

    // 3. (옵션) 오래된 로그 삭제 (성능 관리 - 1시간 이상 된 로그 삭제)
    // 이 작업은 비용 절감을 위해 가끔씩 수행되도록 설계할 수 있습니다.
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
