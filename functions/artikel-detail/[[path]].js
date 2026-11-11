import markdownit from 'markdown-it';

// ==========================================
// FUNGSI HALAMAN ERROR
// ==========================================
function errorPage(status, title, message) {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - RAW Media Indonesia</title>
    <meta name="robots" content="noindex, follow">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        .error-wrap { min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 20px; font-family: 'Nunito', sans-serif; background: #f2f4f7; }
        .error-code { font-size: 6rem; font-weight: 900; color: #1E3A8A; margin: 0; line-height: 1; }
        .error-title { font-size: 1.8rem; font-weight: 800; color: #1a1a1a; margin: 20px 0 10px; text-shadow: none; }
        .error-message { font-size: 1.05rem; color: #666; margin-bottom: 30px; max-width: 500px; }
        .error-btn { display: inline-block; background: #1E3A8A; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; transition: background 0.3s; margin: 5px; }
        .error-btn:hover { background: #152a66; }
        .error-btn.secondary { background: #fff; color: #1E3A8A; border: 2px solid #1E3A8A; }
        .error-btn.secondary:hover { background: #e8edf9; }
    </style>
</head>
<body>
    <nav class="navbar" style="position: fixed; top: 0; width: 100%; background: #1E3A8A; padding: 15px 20px; z-index: 1000; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box;">
        <div class="logo"><a href="/index.html"><img src="/raw-media.svg" alt="Logo RAW Media Indonesia" class="logo-img"></a></div>
        <ul class="nav-links" style="display: flex; gap: 20px; list-style: none; margin: 0; padding: 0;">
            <li><a href="/index.html" style="color: white; text-decoration: none; font-weight: 600;">HOME</a></li>
            <li><a href="/artikel" style="color: #fff; text-decoration: none; font-weight: 600;">ARTIKEL</a></li>
        </ul>
    </nav>
    <div class="error-wrap">
        <p class="error-code">${status}</p>
        <h1 class="error-title">${title}</h1>
        <p class="error-message">${message}</p>
        <div>
            <a href="/artikel" class="error-btn"><i class="fa-solid fa-arrow-left"></i> Kembali ke Artikel</a>
            <a href="/index.html" class="error-btn secondary"><i class="fa-solid fa-home"></i> Beranda</a>
        </div>
    </div>
</body>
</html>`;

  return new Response(html, {
    status: status,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

// ==========================================
// FUNGSI UTAMA SSR
// ==========================================
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return errorPage(404, 'Artikel Tidak Ditemukan', 'Maaf, parameter artikel tidak valid atau tidak disertakan.');
  }

  const GITHUB_USER = "rawmediwebsite-sudo";
  const GITHUB_REPO = "company_profile-rawmediacorporation";
  const GITHUB_BRANCH = "main";
  const SITE_URL = "https://rawmedia.id";

  try {
    const githubUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/content/artikel/${slug}.md`;
    const mdRes = await fetch(githubUrl);

    if (!mdRes.ok) {
      return errorPage(404, 'Artikel Tidak Ditemukan', 'Artikel yang Anda cari tidak tersedia atau telah dihapus.');
    }

    const mdText = await mdRes.text();

    // Parse Frontmatter
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

    // Konversi Markdown
    const md = markdownit({ html: true, linkify: true, typographer: true });
    const bodyHtml = md.render(bodyMd);

    // ====== SISIPKAN SLOT IKLAN DI DALAM ARTIKEL (setelah paragraf ke-3) ======
    const inArticleAd = `
      <div class="ad-slot ad-in-article" aria-label="Iklan">
        <span class="ad-label">Iklan</span>
        <div class="ad-placeholder">
          <i class="fa-solid fa-rectangle-ad"></i>
          <p>Slot Iklan In-Article</p>
          <small>Pasang script iklan Anda di sini</small>
        </div>
      </div>
    `;
    // Sisipkan setelah paragraf ke-3 (atau setelah paragraf terakhir jika kurang)
    let bodyHtmlWithAd = bodyHtml;
    let count = 0;
    bodyHtmlWithAd = bodyHtml.replace(/<\/p>/g, (matchP) => {
      count++;
      if (count === 3) return matchP + inArticleAd;
      return matchP;
    });

    // SEO & Tampilan
    const title = meta.title || "Artikel RAW Media Indonesia";
    const dateObj = new Date(meta.date);
    const isValidDate = !isNaN(dateObj.getTime());
    const dateFormatted = isValidDate ? dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Tanggal tidak tersedia";
    const dateISO = isValidDate ? dateObj.toISOString() : new Date().toISOString();

    const rawImageUrl = meta.image || "";
    const imageUrl = rawImageUrl.startsWith('http') ? rawImageUrl : rawImageUrl ? `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${rawImageUrl.replace(/^\//, '')}` : '';
    const ogImage = imageUrl || `${SITE_URL}/img/og-image.jpg`;

    const currentUrl = `${SITE_URL}/artikel-detail?slug=${slug}`;
    const metaDesc = (meta.description || bodyMd.replace(/^#+\s+/gm, '').replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/[*_`~>#-]/g, '').replace(/\n+/g, ' ').trim().substring(0, 155)).trim() + (meta.description ? '' : '...');
    const kategori = meta.kategori || meta.categories || 'Artikel';
    const penulis = meta.author || 'Tim Redaksi RAW Media';
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(title);

    // Schema Markup
    const schemaBlogPosting = {
      "@context": "https://schema.org", "@type": "BlogPosting", "headline": title, "description": metaDesc, "image": ogImage, "datePublished": dateISO, "dateModified": dateISO,
      "author": { "@type": "Organization", "name": "RAW Media Indonesia", "url": SITE_URL },
      "publisher": { "@type": "Organization", "name": "RAW Media Indonesia", "logo": { "@type": "ImageObject", "url": `${SITE_URL}/raw-media.svg` } },
      "mainEntityOfPage": { "@type": "WebPage", "@id": currentUrl }
    };

    const schemaBreadcrumb = {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
        { "@type": "ListItem", "position": 2, "name": "Artikel", "item": `${SITE_URL}/artikel` },
        { "@type": "ListItem", "position": 3, "name": title, "item": currentUrl }
      ]
    };

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - RAW Media Indonesia</title>
    <meta name="description" content="${metaDesc}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <link rel="canonical" href="${currentUrl}">

    <meta name="author" content="${penulis}">
    <meta name="publisher" content="RAW Media Indonesia">
    <meta name="theme-color" content="#1E3A8A">

    <meta property="og:type" content="article">
    <meta property="og:site_name" content="RAW Media Indonesia">
    <meta property="og:locale" content="id_ID">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${metaDesc}">
    <meta property="og:url" content="${currentUrl}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${title}">
    <meta property="article:published_time" content="${dateISO}">
    <meta property="article:modified_time" content="${dateISO}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${metaDesc}">
    <meta name="twitter:image" content="${ogImage}">

    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

    <script type="application/ld+json">${JSON.stringify(schemaBlogPosting)}</script>
    <script type="application/ld+json">${JSON.stringify(schemaBreadcrumb)}</script>

    <style>
        :root {
            --primary: #1E3A8A;
            --primary-dark: #152a66;
            --primary-light: #e8edf9;
            --text-dark: #1a1a1a;
            --text-mid: #555;
            --text-light: #888;
            --bg-light: #f2f4f7;
            --border: #e5e7eb;
        }
        * { box-sizing: border-box; }
        body { background-color: var(--bg-light); margin: 0; font-family: 'Nunito', sans-serif; color: #333; }

        /* ====== LAYOUT: KONTEN + SIDEBAR IKLAN ====== */
        .artikel-layout {
            max-width: 1200px;
            margin: 120px auto 80px auto;
            padding: 0 20px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) 300px;
            gap: 32px;
            align-items: start;
        }
        .artikel-wrapper {
            background: #ffffff;
            padding: 50px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            min-width: 0;
        }

        /* ====== SIDEBAR IKLAN ====== */
        .artikel-sidebar {
            position: sticky;
            top: 100px;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        .ad-slot {
            background: #fff;
            border: 2px dashed var(--border);
            border-radius: 10px;
            padding: 16px;
            text-align: center;
            position: relative;
        }
        .ad-label {
            position: absolute;
            top: -10px;
            left: 12px;
            background: var(--primary);
            color: #fff;
            font-size: 0.65rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 2px 10px;
            border-radius: 4px;
        }
        .ad-placeholder {
            min-height: 220px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--text-light);
            gap: 8px;
        }
        .ad-placeholder i { font-size: 2.4rem; color: var(--primary); opacity: 0.5; }
        .ad-placeholder p { margin: 0; font-weight: 800; font-size: 0.95rem; color: var(--text-mid); }
        .ad-placeholder small { font-size: 0.75rem; }
        .ad-placeholder.tall { min-height: 520px; }
        .ad-placeholder.square { min-height: 250px; }
        .ad-placeholder.in-article { min-height: 180px; }

        /* Iklan in-article (di dalam artikel) */
        .ad-in-article {
            margin: 35px 0;
            border-style: solid;
            border-color: var(--primary-light);
            background: #f8faff;
        }

        /* ====== BREADCRUMB ====== */
        .breadcrumb-nav { font-size: 0.9rem; color: #666; margin-bottom: 25px; }
        .breadcrumb-nav a { color: var(--primary); text-decoration: none; font-weight: 600; }
        .breadcrumb-nav a:hover { text-decoration: underline; }

        .article-kategori-badge { display: inline-block; background: var(--primary); color: #fff; padding: 6px 14px; border-radius: 4px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px; }

        .article-title { font-size: 2.4rem; font-weight: 800; line-height: 1.3; margin: 0 0 15px 0; color: var(--text-dark); text-shadow: none; }

        .article-meta-data { display: flex; gap: 20px; color: #666; font-size: 0.95rem; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
        .article-meta-data span { display: inline-flex; align-items: center; gap: 6px; }

        .article-main-image { width: 100%; max-height: 500px; object-fit: cover; border-radius: 8px; margin-bottom: 35px; }

        /* ====== KONTEN ARTIKEL ====== */
        .article-content { font-size: 1.15rem; line-height: 1.9; color: #333; }
        .article-content p { margin-bottom: 25px; }
        .article-content h1, .article-content h2, .article-content h3 { font-weight: 800; color: var(--text-dark); margin-top: 40px; margin-bottom: 15px; line-height: 1.3; text-shadow: none; }
        .article-content h2 { font-size: 1.8rem; }
        .article-content h3 { font-size: 1.4rem; }
        .article-content ul, .article-content ol { margin-bottom: 25px; padding-left: 40px; display: block; }
        .article-content li { margin-bottom: 12px; display: list-item; line-height: 1.8; }
        .article-content blockquote { background: #f9f9f9; border-left: 4px solid var(--primary); padding: 20px 25px; margin: 30px 0; font-style: italic; color: #555; border-radius: 0 4px 4px 0; }
        .article-content a { color: var(--primary); font-weight: 600; text-decoration: underline; }
        .article-content img { max-width: 100%; height: auto; border-radius: 6px; margin: 20px 0; }
        .article-content table { width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 1rem; }
        .article-content th, .article-content td { border: 1px solid var(--border); padding: 10px 14px; text-align: left; }
        .article-content th { background: var(--primary-light); color: var(--primary-dark); font-weight: 800; }

        /* ====== BACA SELENGKAPNYA / CTA BAWAH ARTIKEL ====== */
        .read-more-box {
            margin-top: 50px;
            padding: 32px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            border-radius: 12px;
            color: #fff;
            text-align: center;
        }
        .read-more-box h3 { margin: 0 0 10px; font-size: 1.4rem; font-weight: 800; color: #fff; text-shadow: none; }
        .read-more-box p { margin: 0 0 20px; font-size: 0.98rem; opacity: 0.92; line-height: 1.6; }
        .read-more-btn {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: #fff;
            color: var(--primary);
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 800;
            font-size: 1rem;
            transition: all 0.25s ease;
        }
        .read-more-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.25); background: #f5f7ff; }

        /* ====== SHARE ====== */
        .share-section { margin-top: 50px; padding-top: 30px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .share-text { font-weight: 800; font-size: 1.1rem; color: var(--text-dark); }
        .share-buttons { display: flex; gap: 12px; }
        .btn-share { display: inline-flex; align-items: center; justify-content: center; width: 45px; height: 45px; border-radius: 50%; color: white; font-size: 1.2rem; text-decoration: none; border: none; cursor: pointer; transition: transform 0.2s; }
        .btn-share:hover { transform: translateY(-4px); }
        .bg-wa { background: #25D366; }
        .bg-fb { background: #1877F2; }
        .bg-tw { background: #000; }
        .bg-copy { background: var(--primary); }

        /* ====== RESPONSIVE ====== */
        @media (max-width: 1024px) {
            .artikel-layout { grid-template-columns: 1fr; gap: 24px; }
            .artikel-sidebar { position: static; flex-direction: row; flex-wrap: wrap; }
            .artikel-sidebar .ad-slot { flex: 1 1 260px; }
            .ad-placeholder.tall { min-height: 220px; }
        }
        @media (max-width: 768px) {
            .artikel-layout { margin: 80px 15px 40px 15px; padding: 0; }
            .artikel-wrapper { padding: 30px 20px; }
            .article-title { font-size: 1.8rem; }
            .article-meta-data { flex-direction: column; gap: 10px; }
            .article-content { font-size: 1.05rem; }
            .artikel-sidebar { flex-direction: column; }
            .read-more-box { padding: 24px 20px; }
            .read-more-box h3 { font-size: 1.2rem; }
        }
    </style>
</head>
<body>

    <!-- NAVBAR -->
    <nav class="navbar">
        <div class="logo">
            <a href="/index.html">
                <img src="/raw-media.svg" alt="Logo RAW Media Indonesia" class="logo-img">
            </a>
        </div>
        <ul class="nav-links" id="navMenu">
            <li><a href="/index.html">HOME</a></li>
            <li><a href="/index.html#layanan">LAYANAN</a></li>
            <li><a href="/pemesanan.html">PEMESANAN</a></li>
            <li><a href="/tentang.html">TENTANG KAMI</a></li>
            <li><a href="/artikel" class="active">ARTIKEL</a></li>
        </ul>
        <div class="nav-right">
            <div class="hamburger" id="hamburger">
                <span class="hamburger-text">MENU</span>
                <i class="fa-solid fa-bars"></i>
            </div>
        </div>
    </nav>

    <!-- ====== LAYOUT: ARTIKEL + SIDEBAR IKLAN ====== -->
    <div class="artikel-layout">

        <!-- KONTEN UTAMA -->
        <main class="artikel-wrapper">
            <nav class="breadcrumb-nav" aria-label="Breadcrumb">
                <a href="/index.html">Home</a> › <a href="/artikel">Artikel</a> › <span>${title}</span>
            </nav>

            <article>
                <header>
                    <span class="article-kategori-badge">${kategori}</span>
                    <h1 class="article-title">${title}</h1>
                    <div class="article-meta-data">
                        <span><i class="fa-regular fa-calendar"></i> ${dateFormatted}</span>
                        <span><i class="fa-regular fa-user"></i> ${penulis}</span>
                    </div>
                    ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="article-main-image" loading="eager">` : ''}
                </header>

                <div class="article-content">
                    ${bodyHtmlWithAd}
                </div>

                <!-- ====== BACA SELENGKAPNYA / CTA ====== -->
                <div class="read-more-box">
                    <h3>Baca Selengkapnya</h3>
                    <p>Temukan lebih banyak artikel, tips percetakan, dan panduan self publishing lainnya di portal artikel RAW Media Indonesia.</p>
                    <a href="/artikel" class="read-more-btn">
                        <i class="fa-solid fa-newspaper"></i> Lihat Semua Artikel
                    </a>
                </div>

                <!-- ====== SHARE ====== -->
                <div class="share-section">
                    <span class="share-text"><i class="fa-solid fa-share-nodes"></i> Bagikan Artikel:</span>
                    <div class="share-buttons">
                        <a href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}" target="_blank" rel="noopener" class="btn-share bg-wa" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener" class="btn-share bg-fb" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}" target="_blank" rel="noopener" class="btn-share bg-tw" title="Twitter/X"><i class="fa-brands fa-x-twitter"></i></a>
                        <button onclick="navigator.clipboard.writeText('${currentUrl}').then(() => { alert('Link artikel berhasil disalin!'); })" class="btn-share bg-copy" title="Salin Link"><i class="fa-solid fa-link"></i></button>
                    </div>
                </div>
            </article>
        </main>

        <!-- ====== SIDEBAR IKLAN (DI PINGGIR) ====== -->
        <aside class="artikel-sidebar" aria-label="Slot iklan">

            <!-- Iklan Atas: 300x250 -->
            <div class="ad-slot">
                <span class="ad-label">Iklan</span>
                <div class="ad-placeholder square">
                    <i class="fa-solid fa-rectangle-ad"></i>
                    <p>Slot Iklan 300×250</p>
                    <small>Pasang script iklan di sini</small>
                </div>
            </div>

            <!-- Iklan Tengah: 300x600 (sticky) -->
            <div class="ad-slot">
                <span class="ad-label">Iklan</span>
                <div class="ad-placeholder tall">
                    <i class="fa-solid fa-rectangle-ad"></i>
                    <p>Slot Iklan 300×600</p>
                    <small>Pasang script iklan di sini</small>
                </div>
            </div>

            <!-- Iklan Bawah: 300x250 -->
            <div class="ad-slot">
                <span class="ad-label">Iklan</span>
                <div class="ad-placeholder square">
                    <i class="fa-solid fa-rectangle-ad"></i>
                    <p>Slot Iklan 300×250</p>
                    <small>Pasang script iklan di sini</small>
                </div>
            </div>

        </aside>
    </div>

</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400"
      }
    });

  } catch (error) {
    return errorPage(500, 'Terjadi Kesalahan Server', 'Maaf, terjadi kesalahan teknis saat memuat artikel ini. Silakan coba beberapa saat lagi.');
  }
}