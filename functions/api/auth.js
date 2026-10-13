export async function onRequest(context){
    const { env } = context;
    const clientId = env.GITHUB_CLIENT_ID;

    if(!clientId) {
        return new Respinse("GITHUB_CLIENT_ID tidak ditemukan", { status: 500});
    }
    const params = new URLSearchParams({
        clientId: clientId,
        scope: "repo, user",
        redirect_url: "https://rawmedia.id/api/callback",
    });

    return Response.redirect(
        'https:://github.com/login/oauth/authorize?${params.toString()}',302
    );
}