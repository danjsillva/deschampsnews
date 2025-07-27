import dayjs from "@/utils/dayjs";
import mongodb from "@/utils/mongodb";

export async function GET(request: Request) {
  console.log("[REPORT] Starting missing posts report...");

  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (process.env.CRON_SECRET && authHeader !== expectedAuth) {
    console.log("[REPORT] Unauthorized: Invalid or missing CRON_SECRET");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await mongodb.connect();
    
    // Buscar parâmetros da query string
    const url = new URL(request.url);
    const daysBack = parseInt(url.searchParams.get("days") || "30");
    const startDate = url.searchParams.get("startDate") || dayjs().subtract(daysBack, "days").format("YYYY-MM-DD");
    const endDate = url.searchParams.get("endDate") || dayjs().format("YYYY-MM-DD");

    console.log(`[REPORT] Checking posts from ${startDate} to ${endDate}`);

    // Buscar todas as datas que têm posts no período
    const postsCollection = db.collection("posts");
    const postsWithDates = await postsCollection
      .aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: "$date",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    // Criar um Set com as datas que têm posts
    const datesWithPosts = new Set(postsWithDates.map((p) => p._id));

    // Gerar todas as datas no período e filtrar dias úteis sem posts
    const missingDates = [];
    let currentDate = dayjs(startDate);
    const endDateObj = dayjs(endDate);

    while (currentDate.isSameOrBefore(endDateObj)) {
      const dateStr = currentDate.format("YYYY-MM-DD");
      const dayOfWeek = currentDate.day();
      
      // Verificar se é dia útil (segunda=1 a sexta=5)
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      
      // Verificar se é feriado brasileiro comum (você pode expandir esta lista)
      const holidays = [
        "2025-01-01", // Ano Novo
        "2025-04-21", // Tiradentes
        "2025-05-01", // Dia do Trabalho
        "2025-09-07", // Independência
        "2025-10-12", // Nossa Senhora
        "2025-11-02", // Finados
        "2025-11-15", // Proclamação República
        "2025-12-25", // Natal
      ];
      
      const isHoliday = holidays.includes(dateStr);
      
      if (isWeekday && !isHoliday && !datesWithPosts.has(dateStr)) {
        missingDates.push({
          date: dateStr,
          dayOfWeek: currentDate.format("dddd"),
          daysSince: dayjs().diff(currentDate, "days"),
        });
      }
      
      currentDate = currentDate.add(1, "day");
    }

    // Estatísticas
    const stats = {
      totalDaysChecked: dayjs(endDate).diff(dayjs(startDate), "days") + 1,
      totalWeekdays: 0,
      totalPostDays: datesWithPosts.size,
      totalMissingDays: missingDates.length,
    };

    // Contar dias úteis totais
    currentDate = dayjs(startDate);
    while (currentDate.isSameOrBefore(endDateObj)) {
      if (currentDate.day() >= 1 && currentDate.day() <= 5) {
        stats.totalWeekdays++;
      }
      currentDate = currentDate.add(1, "day");
    }

    console.log(`[REPORT] Found ${missingDates.length} missing weekdays`);

    return Response.json({
      success: true,
      period: {
        startDate,
        endDate,
      },
      stats,
      missingDates,
      postsPerDay: postsWithDates,
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