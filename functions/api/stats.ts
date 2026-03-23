interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // 1. 전체 순위 (Top 10)
    const allTimeStats = await context.env.DB.prepare(
      "SELECT country_code, country_name, click_count FROM stats ORDER BY click_count DESC LIMIT 10"
    ).all();

    // 2. 최근 5분간의 급상승 순위 (Top 10)
    // strftime('%Y-%m-%d %H:%M:%S', 'now', '-5 minutes') 를 사용하여 정확한 시점 비교
    const recentStats = await context.env.DB.prepare(`
      SELECT country_code, country_name, COUNT(*) as click_count 
      FROM click_log 
      WHERE created_at >= datetime('now', '-5 minutes')
      GROUP BY country_code, country_name
      ORDER BY click_count DESC 
      LIMIT 10
    `).all();
    
    return new Response(JSON.stringify({
      allTime: allTimeStats.results || [],
      recent: recentStats.results || []
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ allTime: [], recent: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  }
};
