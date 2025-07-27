import mongodb from "@/utils/mongodb";

export async function GET(request: Request) {
  console.log("[REPORT] Starting incomplete posts report...");

  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (process.env.CRON_SECRET && authHeader !== expectedAuth) {
    console.log("[REPORT] Unauthorized: Invalid or missing CRON_SECRET");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await mongodb.connect();
    const postsCollection = db.collection("posts");

    // Buscar parâmetros da query string
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");

    console.log("[REPORT] Checking for incomplete posts...");

    // Buscar posts com campos faltando
    const incompleteQuery = {
      $or: [
        { entities: { $exists: false } },
        { entities: { $eq: [] } },
        { categories: { $exists: false } },
        { categories: { $eq: [] } },
        { html: { $exists: false } },
        { html: { $eq: "" } },
        { html: { $eq: null } },
        { text: { $exists: false } },
        { text: { $eq: "" } },
        { text: { $eq: null } },
        { number: { $exists: false } },
        { number: { $eq: "" } },
        { number: { $eq: null } },
        { date: { $exists: false } },
        { date: { $eq: "" } },
        { date: { $eq: null } },
      ],
    };

    const incompletePosts = await postsCollection
      .find(incompleteQuery)
      .sort({ date: -1 })
      .limit(limit)
      .toArray();

    // Analisar quais campos estão faltando em cada post
    const analyzedPosts = incompletePosts.map((post) => {
      const missingFields = [];

      if (!post.entities || post.entities.length === 0) {
        missingFields.push("entities");
      }
      if (!post.categories || post.categories.length === 0) {
        missingFields.push("categories");
      }
      if (!post.html || post.html === "") {
        missingFields.push("html");
      }
      if (!post.text || post.text === "") {
        missingFields.push("text");
      }
      if (!post.number || post.number === "") {
        missingFields.push("number");
      }
      if (!post.date || post.date === "") {
        missingFields.push("date");
      }

      return {
        _id: post._id,
        date: post.date || "N/A",
        number: post.number || "N/A",
        missingFields,
        title: post.text ? post.text.substring(0, 100) + "..." : "Sem texto",
      };
    });

    // Estatísticas por campo faltante
    const fieldStats = {
      missingEntities: 0,
      missingCategories: 0,
      missingHtml: 0,
      missingText: 0,
      missingNumber: 0,
      missingDate: 0,
    };

    analyzedPosts.forEach((post) => {
      if (post.missingFields.includes("entities")) fieldStats.missingEntities++;
      if (post.missingFields.includes("categories")) fieldStats.missingCategories++;
      if (post.missingFields.includes("html")) fieldStats.missingHtml++;
      if (post.missingFields.includes("text")) fieldStats.missingText++;
      if (post.missingFields.includes("number")) fieldStats.missingNumber++;
      if (post.missingFields.includes("date")) fieldStats.missingDate++;
    });

    // Contar total de posts para referência
    const totalPosts = await postsCollection.countDocuments();

    console.log(`[REPORT] Found ${analyzedPosts.length} incomplete posts`);

    return Response.json({
      success: true,
      stats: {
        totalPosts,
        totalIncomplete: analyzedPosts.length,
        percentageIncomplete: ((analyzedPosts.length / totalPosts) * 100).toFixed(2) + "%",
        fieldStats,
      },
      incompletePosts: analyzedPosts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[REPORT] Error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}