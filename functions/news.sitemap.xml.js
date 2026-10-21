export async function onRequest(context) {
  const GITHUB_USER = "rawmediwebsite-sudo";
  const GITHUB_REPO = "company_profile-rawmediacorporation";
  const GITHUB_BRANCH = "main";
  const SITE_URL = "https://rawmedia.id";
  const PUBLICATION_NAME = "RAW Media Indonesia";
  const PUBLICATION_LANG = "id";

  try {
    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/content/artikel?ref=${GITHUB_BRANCH}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "RAW-Media-News-Sitemap-Bot",
        "Accept": "application/vnd.github.v3+json"
      }
    });

    if (!response.ok) {
      return generateEmptySitemap(`GitHub API Error: ${response.status}`);
    }

    const files = await response.json();
    
    if (!Array.isArray(files)) {
      return generateEmptySitemap("Format response GitHub tidak valid");
    }

    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));
    
    let sitemapUrls = "";
    let artikelValid = 0;

    for (const file of files) {
      if (!file.name.endsWith(".md")) continue;

      try {
        const fileRes = await fetch(file.download_url);
        if (!fileRes.ok) continue;
        
        const text = await fileRes.text();
        
        const dateMatch = text.match(/date:\s*["']?([^"'\n]+)["']?/);
        if (!dateMatch) continue;
        
        const rawDate = dateMatch[1].trim();
        const articleDate = new Date(rawDate);
        
        if (isNaN(articleDate.getTime())) continue;
        if (articleDate < twoDaysAgo) continue;

        const titleMatch = text.match(/title:\s*["']?([^"'\n]+)["']?/);
        let title = titleMatch ? titleMatch[1].trim() : "Artikel RAW Media";

        const safeTitle = title
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');

        const slug = file.name.replace('.md', '');
        const articleUrl = `${SITE_URL}/artikel-detail.html?slug=${slug}`;
        const pubDate = articleDate.toISOString();

        sitemapUrls += `
  <url>
    <loc>${articleUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>${PUBLICATION_NAME}</news:name>
        <news:language>${PUBLICATION_LANG}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${safeTitle}</news:title>
    </news:news>
  </url>`;
        
        artikelValid++;

      } catch (err) {
        continue;
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${sitemapUrls}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
        "X-Artikel-Valid": artikelValid.toString()
      }
    });

  } catch (error) {
    return generateEmptySitemap(error.message);
  }
}

function generateEmptySitemap(errorMessage) {
  const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;
        
  return new Response(fallbackXml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-cache"
    }
  });
}