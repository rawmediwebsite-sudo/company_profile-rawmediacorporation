export async function onRequest(context){
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if(!code){
        return new Response("kode otorisasi tidak ditemukan", { status: 400});
    }
    const tokenRes = await fetch("https://github.com/login/oauth/access_token",{
        method: "POST",
        headers: {
            "context-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code: code,
        }),
    });

    const tokenData = await tokenRes.json();
    if(tokenData.error || !tokenData.access_token){
        return new Response(
            'gagal mendapatkan token: ${tokenData.error_description ||  tokenData.error}',
            { status: 400 }
        );
    }
      const token = tokenData.access_token;
  const provider = "github";

  // Kirim token kembali ke parent window (Decap CMS)
  const html = `<!DOCTYPE html>
<html>
<body>
<script>
  (function() {
    function receiveMessage(e) {
      window.opener.postMessage(
        'authorization:${provider}:success:${JSON.stringify({ token: token, provider: provider })}',
        e.origin
      );
      window.close();
    }
    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage("authorizing:${provider}", "*");
  })();
</script>
<p>Login berhasil, halaman ini akan menutup otomatis...</p>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html;charset=UTF-8" },
  });
}
    