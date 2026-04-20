export const PAYSTACK_PUBLIC_KEY = "pk_live_6534eeae448585db1377764e1eadda7f414117a9";

export function toPesewas(amountGhc: number): number {
  return Math.round(amountGhc * 100);
}

export function generateReference(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AGF-${ts}-${rand}`;
}

export function buildPaystackHtml(email: string, amountGhc: number, reference: string): string {
  const amountPesewas = toPesewas(amountGhc);
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f5f5f5; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
    .loading { text-align: center; color: #555; }
    .spinner { width: 40px; height: 40px; border: 4px solid #e0e0e0; border-top-color: #1F8C6B; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <p>Opening Paystack checkout…</p>
  </div>
  <script src="https://js.paystack.co/v1/inline.js"></script>
  <script>
    window.onload = function() {
      try {
        var handler = PaystackPop.setup({
          key: '${PAYSTACK_PUBLIC_KEY}',
          email: '${email}',
          amount: ${amountPesewas},
          currency: 'GHS',
          ref: '${reference}',
          label: 'Agyakoahs Fabrics',
          callback: function(response) {
            window.location.href = 'https://agf.callback/success?reference=' + encodeURIComponent(response.reference) + '&trxref=' + encodeURIComponent(response.transaction || response.reference);
          },
          onClose: function() {
            window.location.href = 'https://agf.callback/cancelled';
          }
        });
        handler.openIframe();
      } catch(e) {
        window.location.href = 'https://agf.callback/error?msg=' + encodeURIComponent(e.message);
      }
    };
  </script>
</body>
</html>`;
}
