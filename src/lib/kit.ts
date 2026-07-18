/**
 * Kit (formerly ConvertKit) v4 — optional marketing list.
 * Set KIT_API_KEY + KIT_FORM_ID in .env. If missing, signup still works locally.
 */

type KitSubscribeInput = {
  email: string;
  firstName?: string | null;
};

export async function subscribeToKit(
  input: KitSubscribeInput,
): Promise<{ ok: boolean; subscriberId?: string; skipped?: boolean; error?: string }> {
  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;

  if (!apiKey || !formId) {
    return { ok: true, skipped: true };
  }

  try {
    const createRes = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": apiKey,
      },
      body: JSON.stringify({
        email_address: input.email,
        first_name: input.firstName || undefined,
      }),
    });

    if (!createRes.ok) {
      const body = await createRes.text();
      return { ok: false, error: `Kit create failed: ${createRes.status} ${body}` };
    }

    const created = (await createRes.json()) as {
      subscriber?: { id?: number | string };
    };
    const subscriberId = created.subscriber?.id
      ? String(created.subscriber.id)
      : undefined;

    const formRes = await fetch(
      `https://api.kit.com/v4/forms/${formId}/subscribers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": apiKey,
        },
        body: JSON.stringify({ email_address: input.email }),
      },
    );

    if (!formRes.ok) {
      const body = await formRes.text();
      return {
        ok: false,
        subscriberId,
        error: `Kit form add failed: ${formRes.status} ${body}`,
      };
    }

    return { ok: true, subscriberId };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kit request failed",
    };
  }
}
