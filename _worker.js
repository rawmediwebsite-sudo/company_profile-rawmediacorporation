// _worker.js - Simple passthrough that handles /api/auth
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle /api/auth request
    if (url.pathname === "/api/auth") {
      const clientId = env.GITHUB_CLIENT_ID;
      const redirectUri = "https://rawmedia.id/api/callback";
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
      return Response.redirect(githubAuthUrl, 302);
    }
    
    // Untuk rute lain, kembalikan 404 (atau arahkan ke halaman statis)
    return new Response("Not Found", { status: 404 });
  }
};