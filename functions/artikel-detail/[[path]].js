import markdownit from 'markdown-it';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return errorPage(404, 'Artikel Tidak Ditemukan', 'Maaf, artikel yang Anda cari tidak tersedia.');
  }

  const GITHUB_USER = "rawmediwebsite-sudo";
  const GITHUB_REPO = "company_profile-rawmediacorporation";
  const GITHUB_BRANCH = "main";
  const SITE_URL = "https://rawmedia.id";

  try {
    const githubUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/content/artikel/${slug}.md`;
    const mdRes = await fetch(githubUrl);
    if (!mdRes.ok) {
      return errorPage(404, 'Artikel Tidak Ditemukan', 'Maaf, artikel yang Anda cari tidak tersedia.');
    }

    const mdText = await mdRes.text();

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

    const md = markdownit({ html: true, linkify: true, typographer: true });
    const bodyHtml = md.render(bodyMd);
    const title = meta.title || "Artikel RAW Media Indonesia";
    const dateObj = new Date(meta.date);
    const isValidDate = !isNaN(dateObj.getTime());
    const dateFormatted = isValidDate
      ? dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : "Tanggal tidak tersedia";
    const dateISO = isValidDate
      ? dateObj.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const rawImageUrl = meta.image || "";
    const imageUrl = rawImageUrl.startsWith('http')
      ? rawImageUrl
      : rawImageUrl
        ? `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${rawImageUrl.replace(/^\//, '')}`
        : '';
    const ogImage = imageUrl || `${SITE_URL}/img/og-image.jpg`;

    const currentUrl = `${SITE_URL}/artikel-detail?slug=${slug}`;

    const metaDesc = (meta.description || bodyMd
      .replace(/^#+\s+/gm, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[*_`~>#-]/g, '')
      .replace(/\n+/g, ' ')
      .trim()
      .substring(0, 155)).trim() + (meta.description ? '' : '...');

    const kategori = meta.kategori || 'Artikel';
    const penulis = meta.author || 'Tim Redaksi RAW Media';
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(title);

    const schemaBlogPosting = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": metaDesc,
      "image": ogImage,
      "datePublished": dateISO,
      "dateModified": dateISO,
      "author": {
        "@type": "Organization",
        "name": "RAW Media Indonesia",
        "url": SITE_URL
      },
      "publisher": {
        "@type": "Organization",
        "name": "RAW Media Indonesia",
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/raw-media.svg`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": currentUrl
      }
    };

    const schemaBreadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
        { "@type": "ListItem", "position": 2, "name": "Artikel", "item": `${SITE_URL}/artikel.html` },
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
    <meta name="theme-color" content="#BE1A1A">

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
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="shortcut icon" href="/favicon.ico">

    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://wa.me">

    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

    <script type="application/ld+json">${JSON.stringify(schemaBlogPosting)}</script>
    <script type="application/ld+json">${JSON.stringify(schemaBreadcrumb)}</script>

    <style>
        .detail-page-wrapper { max-width: 850px; margin: 120px auto 80px auto; background: #ffffff; padding: 50px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); font-family: 'Nunito', sans-serif; color: #333; }
        .breadcrumb-nav { font-size: 0.9rem; color: #666; margin-bottom: 25px; }
        .breadcrumb-nav a { color: #BE1A1A; text-decoration: none; }
        .breadcrumb-nav a:hover { text-decoration: underline; }
        .article-kategori-badge { display: inline-block; background: #fdf3f3; color: #BE1A1A; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px; }
        .article-title { font-size: 2.4rem; font-weight: 800; line-height: 1.3; margin: 0 0 15px 0; color: #1a1a1a; }
        .article-meta-data { display: flex; gap: 20px; color: #666; font-size: 0.95rem; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px dashed #eee; flex-wrap: wrap; }
        .article-meta-data span { display: inline-flex; align-items: center; gap: 6px; }
        .article-main-image { width: 100%; max-height: 500px; object-fit: cover; border-radius: 12px; margin-bottom: 35px; }
        .article-content { font-size: 1.15rem; line-height: 1.9; }
        .article-content p { margin-bottom: 25px; }
        .article-content h1, .article-content h2, .article-content h3 { font-weight: 800; color: #1a1a1a; margin-top: 40px; margin-bottom: 15px; line-height: 1.3; }
        .article-content h2 { font-size: 1.8rem; }
        .article-content h3 { font-size: 1.4rem; }
        .article-content ul, .article-content ol { margin-bottom: 25px; padding-left: 40px !important; display: block; }
        .article-content li { margin-bottom: 12px; display: list-item; line-height: 1.8; }
        .article-content blockquote { background: #f9f9f9; border-left: 5px solid #BE1A1A; padding: 20px 25px; margin: 30px 0; font-style: italic; color: #555; border-radius: 0 8px 8px 0; }
        .article-content a { color: #BE1A1A; font-weight: 600; text-decoration: underline; }
        .article-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0; }
        .article-cta { margin-top: 50px; padding: 30px; background: #fdf3f3; border-radius: 12px; border-left: 4px solid #BE1A1A; }
        .article-cta h3 { margin-top: 0; color: #BE1A1A; font-size: 1.4rem; }
        .article-cta p { margin-bottom: 15px; color: #444; }
        .article-cta ul { margin: 15px 0; padding-left: 20px; }
        .article-cta li { margin-bottom: 8px; }
        .article-cta li a { color: #BE1A1A; text-decoration: none; font-weight: 600; }
        .article-cta li a:hover { text-decoration: underline; }
        .article-cta .btn-wa { display: inline-block; background: #BE1A1A; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 15px; transition: background 0.3s; }
        .article-cta .btn-wa:hover { background: #8B0000; }
        .share-section { margin-top: 60px; padding-top: 30px; border-top: 2px dashed #eee; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .share-text { font-weight: 800; font-size: 1.1rem; color: #1a1a1a; }
        .share-buttons { display: flex; gap: 12px; }
        .btn-share { display: inline-flex; align-items: center; justify-content: center; width: 45px; height: 45px; border-radius: 50%; color: white; font-size: 1.2rem; text-decoration: none; border: none; cursor: pointer; transition: transform 0.2s; }
        .btn-share:hover { transform: translateY(-4px); }
        .bg-wa { background: #25D366; }
        .bg-fb { background: #1877F2; }
        .bg-tw { background: #000; }
        .bg-copy { background: #666; }
        @media (max-width: 768px) {
            .detail-page-wrapper { margin: 80px 15px 40px 15px; padding: 30px 20px; }
            .article-title { font-size: 1.8rem; }
            .article-meta-data { flex-direction: column; gap: 10px; }
            .article-content { font-size: 1.05rem; }
        }
    </style>
</head>
<body>

<nav class="navbar">
    <div class="logo">
        <a href="/index.html" aria-label="RAW Media Indonesia - Beranda">
            <img src="/raw-media.svg" alt="Logo RAW Media Indonesia" class="logo-img">
        </a>
    </div>
    <ul class="nav-links" id="navMenu">
        <li><a href="/index.html">HOME</a></li>
        <li><a href="/index.html#layanan">LAYANAN</a></li>
        <li><a href="/katalog.html">KATALOG</a></li>
        <li><a href="/pemesanan.html">PEMESANAN</a></li>
        <li><a href="/tentang.html">TENTANG KAMI</a></li>
        <li><a href="/reseller.html">RESELLER</a></li>
        <li><a href="/artikel" class="active">ARTIKEL</a></li>
    </ul>
    <div class="nav-right">
        <div class="hamburger" id="hamburger">
            <span class="hamburger-text">MENU</span>
            <i class="fa-solid fa-bars"></i>
        </div>
    </div>
</nav>

<div class="mobile-menu" id="mobileMenu">
    <div class="mobile-menu-header">
        <div class="mobile-logo">
            <img src="/raw-media.svg" alt="Logo RAW Media" class="mobile-logo-img">
            <span class="mobile-logo-text">RAW MEDIA</span>
        </div>
        <button class="close-btn" id="closeBtn" aria-label="Tutup">
            <i class="fa-solid fa-xmark"></i>
        </button>
    </div>
    <div class="mobile-menu-body">
        <ul class="mobile-nav-links">
            <li><a href="/index.html">HOME</a></li>
            <li><a href="/index.html#layanan">LAYANAN</a></li>
            <li><a href="/katalog.html">KATALOG</a></li>
            <li><a href="/reseller.html">RESELLER</a></li>
            <li><a href="/pemesanan.html">PEMESANAN</a></li>
            <li><a href="/tentang.html">TENTANG KAMI</a></li>
            <li><a href="/artikel" class="active">ARTIKEL</a></li>
        </ul>
        <div class="mobile-address">
            <p><i class="fa-solid fa-location-dot"></i> Sleman, Yogyakarta</p>
            <p><i class="fa-solid fa-phone"></i> 085231092020</p>
            <p><i class="fa-solid fa-envelope"></i> cv.rawmedia@gmail.com</p>
        </div>
    </div>
</div>

<main class="detail-page-wrapper">
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
        <a href="/index.html">Home</a> ›
        <a href="/artikel">Artikel</a> ›
        <span>${title}</span>
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
            ${bodyHtml}
        </div>

        <div class="article-cta">
            <h3>Butuh Jasa Cetak Buku?</h3>
            <p>Konsultasi gratis dengan tim RAW Media Indonesia. Lihat juga layanan kami:</p>
            <ul>
                <li><a href="/percetakan-sleman.html">Percetakan Buku di Sleman Yogyakarta</a></li>
                <li><a href="/layanan/cetak-buku.html">Layanan Cetak Buku</a></li>
                <li><a href="/layanan/buku-tahunan.html">Cetak Buku Tahunan Sekolah</a></li>
                <li><a href="/layanan/buku-pesantren.html">Cetak Kitab Pesantren</a></li>
            </ul>
            <a href="https://wa.me/6285231092020?text=Halo%20saya%20ingin%20konsultasi%20cetak%20buku" 
               target="_blank" rel="noopener" class="btn-wa">
                <i class="fa-brands fa-whatsapp"></i> Konsultasi via WhatsApp
            </a>
        </div>

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

<footer class="footer-modern">
    <div class="footer-accent"></div>
    <div class="footer-container">
        <div class="footer-col footer-brand">
            <div class="footer-logo">
                <img src="/raw-media.svg" alt="Logo RAW Media Indonesia" class="footer-logo-img" loading="lazy">
            </div>
            <p class="footer-desc">Solusi percetakan, penerbitan, dan finishing berkualitas tinggi untuk kebutuhan bisnis, sekolah, dan personal. Berpengalaman lebih dari 10 tahun.</p>
        </div>
        <div class="footer-col footer-menu">
            <h4 class="footer-heading">Perusahaan</h4>
            <ul class="footer-links">
                <li><a href="/tentang.html">Tentang Kami</a></li>
                <li><a href="/index.html#layanan">Layanan</a></li>
                <li><a href="/artikel">Artikel</a></li>
                <li><a href="/index.html#galeri">Galeri</a></li>
                <li><a href="/index.html#faq">FAQ</a></li>
            </ul>
        </div>
        <div class="footer-col footer-menu">
            <h4 class="footer-heading">Layanan Kami</h4>
            <ul class="footer-links">
                <li><a href="/layanan/cetak-buku.html">Cetak Buku</a></li>
                <li><a href="/layanan/buku-tahunan.html">Buku Tahunan</a></li>
                <li><a href="/layanan/buku-pesantren.html">Buku Pesantren</a></li>
                <li><a href="/layanan/finishing-premium.html">Finishing Premium</a></li>
                <li><a href="/layanan/b2b-korporat.html">B2B &amp; Korporat</a></li>
            </ul>
        </div>
        <div class="footer-col footer-contact">
            <h4 class="footer-heading">Alamat &amp; Kontak</h4>
            <ul class="footer-contact-list">
                <li><i class="fa-solid fa-location-dot"></i> Balangan, RT.02/RW.04, Sendangrejo, Kec. Minggir, Sleman, DIY 55562</li>
            </ul>
            <p class="contact-description">Hubungi Customer Service Kami</p>
            <ul class="footer-contact-list">
                <li><i class="fa-solid fa-phone"></i> <a href="https://wa.me/6282223191719" target="_blank" rel="noopener">082223191719</a></li>
                <li><i class="fa-solid fa-phone"></i> <a href="https://wa.me/6282342974320" target="_blank" rel="noopener">082342974320</a></li>
                <li><i class="fa-solid fa-phone"></i> <a href="https://wa.me/6285232232500" target="_blank" rel="noopener">085232232500</a></li>
                <li><i class="fa-solid fa-envelope"></i> <a href="mailto:cv.rawmedia@gmail.com">cv.rawmedia@gmail.com</a></li>
            </ul>
            <div class="footer-hours">
                <h5>Jam Operasional</h5>
                <p>Senin - Sabtu: 09.00 - 17.00</p>
            </div>
        </div>
    </div>
    <div class="footer-social-section">
        <h4 class="footer-social-title">Ikuti Kami</h4>
        <div class="footer-social-links">
            <a href="https://instagram.com/rawmedia.id" target="_blank" rel="noopener" class="social-icon" aria-label="Instagram RAW Media">
                <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="https://tiktok.com/@rawmedia.id" target="_blank" rel="noopener" class="social-icon" aria-label="TikTok RAW Media">
                <i class="fa-brands fa-tiktok"></i>
            </a>
            <a href="https://facebook.com/rawmedia.id" target="_blank" rel="noopener" class="social-icon" aria-label="Facebook RAW Media">
                <i class="fa-brands fa-facebook-f"></i>
            </a>
        </div>
    </div>
    <div class="footer-bottom">
        <p>&copy; 2026 RAW Media Indonesia. Semua Hak Dilindungi.</p>
    </div>
</footer>

<a href="https://wa.me/6285231092020" class="floating-wa" target="_blank" rel="noopener" aria-label="Chat WhatsApp RAW Media">
    <i class="fa-brands fa-whatsapp"></i>
    <span class="floating-wa-text">Hotline</span>
</a>

<script src="/script.js"></script>

</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400"
      }
    });

  } catch (error) {
    return errorPage(500, 'Terjadi Kesalahan', 'Maaf, terjadi kesalahan saat memuat artikel. Silakan coba lagi.');
  }
}

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
        .error-wrap { min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 20px; font-family: 'Nunito', sans-serif; }
        .error-code { font-size: 6rem; font-weight: 900; color: #BE1A1A; margin: 0; line-height: 1; }
        .error-title { font-size: 1.8rem; font-weight: 800; color: #1a1a1a; margin: 20px 0 10px; }
        .error-message { font-size: 1.05rem; color: #666; margin-bottom: 30px; max-width: 500px; }
        .error-btn { display: inline-block; background: #BE1A1A; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; transition: background 0.3s; margin: 5px; }
        .error-btn:hover { background: #8B0000; }
        .error-btn-secondary { background: transparent; color: #BE1A1A; border: 2px solid #BE1A1A; }
        .error-btn-secondary:hover { background: #BE1A1A; color: #fff; }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="logo">
            <a href="/index.html"><img src="/raw-media.svg" alt="Logo RAW Media Indonesia" class="logo-img"></a>
        </div>
        <ul class="nav-links">
            <li><a href="/index.html">HOME</a></li>
            <li><a href="/index.html#layanan">LAYANAN</a></li>
            <li><a href="/katalog.html">KATALOG</a></li>
            <li><a href="/pemesanan.html">PEMESANAN</a></li>
            <li><a href="/tentang.html">TENTANG KAMI</a></li>
            <li><a href="/artikel.html">ARTIKEL</a></li>
        </ul>
    </nav>
    <div class="error-wrap">
        <p class="error-code">${status}</p>
        <h1 class="error-title">${title}</h1>
        <p class="error-message">${message}</p>
        <div>
            <a href="/artikel.html" class="error-btn"><i class="fa-solid fa-arrow-left"></i> Daftar Artikel</a>
            <a href="/index.html" class="error-btn error-btn-secondary"><i class="fa-solid fa-home"></i> Beranda</a>
        </div>
    </div>
</body>
</html>`;

  return new Response(html, {
    status: status,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}