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

    await context.env.DB.prepare(`
      INSERT INTO stats (country_code, country_name, click_count)
      VALUES (?, ?, 1)
      ON CONFLICT(country_code) DO UPDATE SET
        click_count = click_count + 1,
        country_name = excluded.country_name
    `).bind(code, name).run();

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
