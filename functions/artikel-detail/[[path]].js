import markdownit from 'markdown-it';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response("Artikel tidak ditemukan", { status: 404 });
  }

  const GITHUB_USER = "rawmediwebsite-sudo";
  const GITHUB_REPO = "company_profile-rawmediacorporation";
  const GITHUB_BRANCH = "main";
  const SITE_URL = "https://rawmedia.id";

  try {
    // 1. Ambil file Markdown
    const githubUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/content/artikel/${slug}.md`;
    const mdRes = await fetch(githubUrl);
    if (!mdRes.ok) throw new Error("Artikel tidak ditemukan");
    
    const mdText = await mdRes.text();
    
    // 2. Parse Frontmatter
    const match = mdText.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    let meta = {};
    let bodyMd = mdText;
    if (match) {
      match[1].split('\n').forEach(line => {
        const [key, ...value] = line.split(':');
        if (key && value.length > 0) {
          meta[key.trim()] = value.join(':').trim().replace(/^"|"$/g, '');
        }
      });
      bodyMd = match[2];
    }

    // 3. Konversi Markdown ke HTML (Menggunakan markdown-it)
    const md = markdownit();
    const bodyHtml = md.render(bodyMd);

    // 4. Data Tampilan
    const title = meta.title || "Artikel RAW Media";
    const dateObj = new Date(meta.date);
    const dateFormatted = isNaN(dateObj.getTime()) ? "Tanggal tidak valid" : dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const rawImageUrl = meta.image || "";
    const imageUrl = rawImageUrl.startsWith('http') ? rawImageUrl : `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${rawImageUrl.replace(/^\//, '')}`;
      
    const currentUrl = `${SITE_URL}/artikel-detail?slug=${slug}`;
    const metaDesc = bodyMd.substring(0, 150).replace(/\n/g, ' ') + "...";
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(title);

    // 5. Bangun HTML
    const htmlResponse = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - RAW Media Indonesia</title>
    <meta name="description" content="${metaDesc}">
    <link rel="canonical" href="${currentUrl}">
    
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="RAW Media Indonesia">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${metaDesc}">
    <meta property="og:url" content="${currentUrl}">
    ${imageUrl ? `<meta property="og:image" content="${imageUrl}">` : ''}

    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

    <style>
        .detail-page-wrapper { max-width: 850px; margin: 120px auto 80px auto; background: #ffffff; padding: 50px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); font-family: 'Nunito', sans-serif; color: #333; }
        .back-link { display: inline-block; margin-bottom: 30px; color: #666; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
        .back-link:hover { color: #BE1A1A; }
        .article-title { font-size: 2.4rem; font-weight: 800; line-height: 1.3; margin: 0 0 15px 0; color: #1a1a1a; }
        .article-meta-data { display: flex; gap: 20px; color: #666; font-size: 0.95rem; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px dashed #eee; }
        .article-main-image { width: 100%; max-height: 500px; object-fit: cover; border-radius: 12px; margin-bottom: 35px; }
        
        .article-content { font-size: 1.15rem; line-height: 1.9; }
        .article-content p { margin-bottom: 25px; }
        .article-content h1, .article-content h2, .article-content h3 { font-weight: 800; color: #1a1a1a; margin-top: 40px; margin-bottom: 15px; line-height: 1.3; }
        .article-content h2 { font-size: 1.8rem; }
        .article-content h3 { font-size: 1.4rem; }
        
        /* List dibuat rapi menjorok ke dalam */
        .article-content ul, .article-content ol { margin-bottom: 25px; padding-left: 40px !important; display: block; }
        .article-content li { margin-bottom: 12px; display: list-item; line-height: 1.8; }
        
        .article-content blockquote { background: #f9f9f9; border-left: 5px solid #BE1A1A; padding: 20px 25px; margin: 30px 0; font-style: italic; color: #555; border-radius: 0 8px 8px 0; }
        .article-content a { color: #BE1A1A; font-weight: 600; text-decoration: underline; }
        .article-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0; }

        .share-section { margin-top: 60px; padding-top: 30px; border-top: 2px dashed #eee; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .share-text { font-weight: 800; font-size: 1.1rem; color: #1a1a1a; }
        .share-buttons { display: flex; gap: 12px; }
        .btn-share { display: inline-flex; align-items: center; justify-content: center; width: 45px; height: 45px; border-radius: 50%; color: white; font-size: 1.2rem; text-decoration: none; border: none; cursor: pointer; transition: transform 0.2s; }
        .btn-share:hover { transform: translateY(-4px); }
        .bg-wa { background: #25D366; }
        .bg-fb { background: #1877F2; }
        .bg-copy { background: #666; }

        @media (max-width: 768px) { .detail-page-wrapper { margin: 80px 15px 40px 15px; padding: 30px 20px; } .article-title { font-size: 1.8rem; } .article-meta-data { flex-direction: column; gap: 10px; } }
    </style>
</head>
<body style="background-color: #f8f6f1; margin: 0;">
    <nav class="navbar" style="position: fixed; top: 0; width: 100%; background: #1a0a1a; padding: 15px 20px; z-index: 1000; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box;">
        <a href="/index.html" style="color: white; font-weight: bold; text-decoration: none;">RAW MEDIA</a>
        <ul style="display: flex; gap: 20px; list-style: none; margin: 0; padding: 0;">
            <li><a href="/index.html" style="color: white; text-decoration: none; font-weight: 600;">HOME</a></li>
            <li><a href="/artikel.html" style="color: #e67ce3; text-decoration: none; font-weight: 600;">ARTIKEL</a></li>
        </ul>
    </nav>

    <div class="detail-page-wrapper">
        <a href="/artikel.html" class="back-link"><i class="fa-solid fa-arrow-left"></i> Kembali ke Daftar Artikel</a>
        
        <h1 class="article-title">${title}</h1>
        
        <div class="article-meta-data">
            <span><i class="fa-regular fa-calendar"></i> ${dateFormatted}</span>
            <span><i class="fa-regular fa-user"></i> Tim Redaksi RAW Media</span>
        </div>

        ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="article-main-image">` : ''}
        
        <div class="article-content">
            ${bodyHtml}
        </div>

        <div class="share-section">
            <span class="share-text"><i class="fa-solid fa-share-nodes"></i> Bagikan Artikel:</span>
            <div class="share-buttons">
                <a href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}" target="_blank" class="btn-share bg-wa" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" class="btn-share bg-fb" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                <button onclick="navigator.clipboard.writeText('${currentUrl}').then(() => { alert('Link artikel berhasil disalin!'); })" class="btn-share bg-copy" title="Salin Link"><i class="fa-solid fa-link"></i></button>
            </div>
        </div>
    </div>
</body>
</html>`;

    return new Response(htmlResponse, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });

  } catch (error) {
    return new Response(`<h1>Error</h1><p>${error.message}</p>`, { status: 500, headers: { "Content-Type": "text/html" } });
  }
}