import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/paystack/initialize", async (req, res) => {
  const secretKey = process.env["PAYSTACK_SECRET_KEY"];
  if (!secretKey) {
    res.status(500).json({ error: "Payment service not configured." });
    return;
  }

  const { email, amount, reference } = req.body as {
    email?: string;
    amount?: number;
    reference?: string;
  };

  if (!email || !amount || !reference) {
    res.status(400).json({ error: "email, amount, and reference are required." });
    return;
  }

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        currency: "GHS",
        reference,
        callback_url: "https://agf.callback/success",
        channels: ["mobile_money", "card", "bank_transfer"],
        metadata: {
          custom_fields: [
            { display_name: "Store", variable_name: "store", value: "Agyakoahs Fabrics" },
          ],
        },
      }),
    });

    const data = (await response.json()) as any;

    if (!response.ok || !data?.status) {
      res.status(502).json({ error: data?.message ?? "Paystack error." });
      return;
    }

    res.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed to initialize payment." });
  }
});

router.post("/paystack/verify", async (req, res) => {
  const secretKey = process.env["PAYSTACK_SECRET_KEY"];
  if (!secretKey) {
    res.status(500).json({ error: "Payment service not configured." });
    return;
  }

  const { reference } = req.body as { reference?: string };
  if (!reference) {
    res.status(400).json({ error: "reference is required." });
    return;
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
      }
    );

    const data = (await response.json()) as any;

    if (!response.ok || !data?.status) {
      res.status(502).json({ error: data?.message ?? "Paystack verification error." });
      return;
    }

    const txStatus = data.data?.status;
    res.json({
      status: txStatus,
      paid: txStatus === "success",
      amount: data.data?.amount,
      reference: data.data?.reference,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed to verify payment." });
  }
});

export default router;
