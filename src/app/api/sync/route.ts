import * as cheerio from "cheerio";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

import { IPost } from "@/types/post";
import dayjs from "@/utils/dayjs";
import { getGroqCategory } from "@/utils/groq";
import mongodb from "@/utils/mongodb";

const imapConfig = {
  host: "imap.zoho.com",
  port: 993,
  secure: true,
  auth: {
    user: process.env.IMAP_USER!,
    pass: process.env.IMAP_PASS!,
  },
  logger: undefined,
};

export async function GET(request: Request) {
  console.log("[SYNC] Cron job triggered at:", new Date().toISOString());

  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (process.env.CRON_SECRET && authHeader !== expectedAuth) {
    console.log("[SYNC] Unauthorized: Invalid or missing CRON_SECRET");

    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let totalPosts = 0;
  const messagesIds: number[] = [];
  const startTime = Date.now();

  try {
    console.log("[SYNC] Starting email sync process...");

    const db = await mongodb.connect();
    const clientProcess = new ImapFlow(imapConfig);

    console.log("[SYNC] Connecting to IMAP server...");

    await clientProcess.connect();

    console.log("[SYNC] Opening NewsLetter mailbox...");

    await clientProcess.mailboxOpen("NewsLetter", { readOnly: false });

    const messages = clientProcess.fetch(
      { seen: false, from: "newsletter@filipedeschamps.com.br" },
      { envelope: true, source: true },
    );

    let messageCount = 0;

    for await (const message of messages) {
      messageCount++;

      console.log(`[SYNC] Processing message ${messageCount}...`);

      if (!message.envelope || !message.source) continue;
      
      const emailDate = message.envelope.date || new Date();
      const emailParsed = await simpleParser(message.source);

      if (!emailParsed.html) continue;

      const $ = cheerio.load(emailParsed.html);
      const paragraphs = $("tbody tr td p").toArray();

      if (!paragraphs.length) continue;

      for (const [index, paragraph] of paragraphs.entries()) {
        $(paragraph).removeAttr("id class style");

        $(paragraph)
          .find("*")
          .each((_i, el) => {
            $(el).removeAttr("id class style url-id");
          });

        const date = dayjs(emailDate).format("YYYY-MM-DD");
        const number = String(index + 1).padStart(2, "0");
        const text = $(paragraph).text().replace(/\s+/g, " ").trim();
        const html = $.html(paragraph).replace(/\s+/g, " ").trim();

        if (!text) continue;

        const { categories, entities, sponsored } = await getGroqCategory({
          text,
        });

        const post: IPost = {
          date,
          number,
          text,
          html,
          categories,
          entities,
          sponsored,
          likes: 0,
          createdAt: emailDate,
          updatedAt: emailDate,
        };

        await db.collection("posts").updateOne(
          {
            date: post.date,
            number: post.number,
          },
          {
            $set: post,
          },
          { upsert: true },
        );

        totalPosts++;
      }

      messagesIds.push(message.uid);
    }

    await clientProcess.mailboxClose();
    await clientProcess.logout();

    const clientAddFlags = new ImapFlow(imapConfig);
    await clientAddFlags.connect();
    await clientAddFlags.mailboxOpen("NewsLetter", { readOnly: false });
    await clientAddFlags.messageFlagsAdd(messagesIds, ["\\Seen"], {
      uid: true,
    });
    await clientAddFlags.mailboxClose();
    await clientAddFlags.logout();

    const duration = Date.now() - startTime;

    console.log(
      `[SYNC] Success! Processed ${totalPosts} posts in ${duration}ms`,
    );

    return Response.json({
      success: true,
      posts: totalPosts,
      duration: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error("[SYNC] Error after", duration, "ms:", error);

    return Response.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
