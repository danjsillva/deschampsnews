import * as cheerio from "cheerio";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

import dayjs from "@/utils/dayjs";
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

export async function GET() {
  const messagesIds: number[] = [];
  let totalPosts = 0;

  try {
    const db = await mongodb.connect();
    const clientProcess = new ImapFlow(imapConfig);

    await clientProcess.connect();
    await clientProcess.mailboxOpen("NewsLetter", { readOnly: false });

    const messages = clientProcess.fetch(
      { seen: false, from: "newsletter@filipedeschamps.com.br" },
      { envelope: true, source: true },
    );

    for await (const message of messages) {
      const emailDate = message.envelope.date;
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

        const html = $.html(paragraph).replace(/\s+/g, " ").trim();
        const text = $(paragraph).text().replace(/\s+/g, " ").trim();
        const number =
          dayjs(emailDate).format("YYYYMMDD") +
          String(index + 1).padStart(2, "0");

        const post = {
          date: emailDate,
          number,
          text,
          html,
          categories: [],
          entities: [],
          sponsored: false,
          likes: 0,
        };

        await db.collection("posts").updateOne(
          { number: post.number },
          {
            $set: {
              date: post.date,
              number: post.number,
              text: post.text,
              html: post.html,
              categories: post.categories,
              entities: post.entities,
              sponsored: post.sponsored,
            },
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

    return Response.json({ success: true, posts: totalPosts });
  } catch (error) {
    console.error(error);

    return Response.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
