export async function onRequest(context) {
  try {
    const { env } = context;
    const clientId = env.GITHUB_CLIENT_ID;

    if (!clientId) {
      return new Response("GITHUB_CLIENT_ID tidak ditemukan", { status: 500 });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      scope: "repo,user",
      redirect_uri: "https://rawmedia.id/api/callback",
    });

    return Response.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`,
      302
    );
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}