import "server-only";
import { serverEnv } from "@/lib/env.server";

// Envío de correos con la API de Resend (https://resend.com/docs/api-reference/emails/send-email),
// con fetch: sin SDK y sin servicios exclusivos de Vercel.

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("Faltan RESEND_API_KEY o EMAIL_FROM.");
  }
}

export class EmailSendError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  attachments = [],
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: Uint8Array }[];
}) {
  const { RESEND_API_KEY, EMAIL_FROM } = serverEnv;
  if (!RESEND_API_KEY || !EMAIL_FROM) throw new EmailNotConfiguredError();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject,
      html,
      text,
      reply_to: replyTo || undefined,
      attachments: attachments.map(({ filename, content }) => ({
        filename,
        content: Buffer.from(content).toString("base64"),
      })),
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new EmailSendError(body?.message ?? `HTTP ${response.status}`, response.status);
  }
  const body = (await response.json()) as { id: string };
  return body.id;
}
