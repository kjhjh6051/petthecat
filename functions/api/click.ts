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
      return new Response(JSON.stringify({ error: "Country code is required" }), { status: 400 });
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

    const updated = await context.env.DB.prepare(
      "SELECT * FROM stats WHERE country_code = ?"
    ).bind(code).first();

    return new Response(JSON.stringify(updated), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to record click" }), { status: 500 });
  }
};
