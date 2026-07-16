import { readFile } from "node:fs/promises";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function emailHtml() {
  return `
<!doctype html>
<html lang="tr">
  <body style="margin:0;padding:0;background:#f3f4f8;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f4f8;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
                 style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;
                        box-shadow:0 8px 30px rgba(18,24,45,.10);">

            <tr>
              <td align="center" style="background:#0b1024;padding:28px 24px 20px;">
                <div style="font-size:28px;line-height:1.2;font-weight:800;letter-spacing:1px;color:#ffffff;">
                  TECHNARTS
                </div>
                <div style="margin-top:6px;font-size:18px;line-height:1.3;font-weight:700;
                            letter-spacing:1px;color:#5be7ff;">
                  PIXEL BIRTHDAY
                </div>
              </td>
            </tr>

            <tr>
              <td align="center" style="background:#0b1024;padding:0 16px 22px;">
                <img src="cid:birthday-animation"
                     width="568"
                     alt="Seda için doğum günü animasyonu"
                     style="display:block;width:100%;max-width:568px;height:auto;border:0;border-radius:14px;">
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:34px 34px 8px;">
                <div style="font-size:25px;line-height:1.35;font-weight:800;color:#171a2f;">
                  İyi ki doğdun, Seda! 🎉
                </div>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:8px 38px 6px;">
                <div style="font-size:16px;line-height:1.75;color:#4d5268;">
                  Yeni yaşının sana sağlık, mutluluk, başarı ve bol kahkaha getirmesini diliyoruz.
                  Technarts ailesi olarak bu özel günün için küçük bir doğum günü görevi hazırladık.
                </div>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:25px 24px 34px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center" bgcolor="#7b5cff" style="border-radius:12px;">
                      <a href="https://technarts-birthday-game.vercel.app"
                         target="_blank"
                         style="display:inline-block;padding:17px 28px;font-size:16px;line-height:1;
                                font-weight:800;color:#ffffff;text-decoration:none;border-radius:12px;">
                        🎮 OYUNU BAŞLAT
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="background:#f7f7fb;padding:18px 24px;color:#7a7f94;
                                        font-size:12px;line-height:1.5;">
                Made with 💜 by Technarts
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const suppliedSecret = url.searchParams.get("secret");
    const expectedSecret = process.env.SEND_SECRET;

    if (!expectedSecret || suppliedSecret !== expectedSecret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      return Response.json(
        { error: "RESEND_API_KEY is missing in Vercel environment variables." },
        { status: 500 }
      );
    }

    try {
      const gifPath = new URL("../assets/birthday.gif", import.meta.url);
      const gifBuffer = await readFile(gifPath);

      const { data, error } = await resend.emails.send({
        from: "Technarts Birthday <onboarding@resend.dev>",
        to: ["sedasude.dmr@gmail.com"],
        subject: "🎉 Seda, doğum günü görevin hazır!",
        html: emailHtml(),
        attachments: [
          {
            filename: "birthday.gif",
            content: gifBuffer,
            contentId: "birthday-animation"
          }
        ]
      });

      if (error) {
        console.error("Resend error:", error);
        return Response.json({ error }, { status: 400 });
      }

      return Response.json({
        success: true,
        message: "Test maili gönderildi.",
        emailId: data?.id
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 }
      );
    }
  }
};
