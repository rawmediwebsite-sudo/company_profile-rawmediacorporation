export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const kategoriFilter = url.searchParams.get("kategori");
  const SITE_URL = "https://rawmedia.id";
  
  const GITHUB_USER = "rawmediwebsite-sudo";
  const GITHUB_REPO = "company_profile-rawmediacorporation";
  const GITHUB_BRANCH = "main";

  try {
    // 1. Ambil daftar file dari GitHub
    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/content/artikel?ref=${GITHUB_BRANCH}`;
    const response = await fetch(apiUrl, {
      headers: { "User-Agent": "RAW-Media-List-Article" }
    });
    
    if (!response.ok) throw new Error("Gagal mengambil daftar dari GitHub");
    const files = await response.json();
    
    if (!Array.isArray(files)) throw new Error("Format response GitHub tidak valid");

    // Urutkan dari yang terbaru
    files.sort((a, b) => b.name.localeCompare(a.name));

    let artikelCardsHtml = "";
    let kategoriCount = {};

    // 2. Looping file (Paralel)
    const promises = files
      .filter(file => file.name.endsWith('.md'))
      .map(async (file) => {
        const res = await fetch(file.download_url);
        const text = await res.text();
        
        const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        let meta = {};
        if (match) {
          match[1].split('\n').forEach(line => {
            const [key, ...value] = line.split(':');
            if (key && value.length > 0) {
              meta[key.trim()] = value.join(':').trim().replace(/^"|"$/g, '');
            }
          });
        }

        const slug = file.name.replace('.md', '');
        const title = meta.title || "Tanpa Judul";
        const rawDate = meta.date || new Date().toISOString();
        const dateObj = new Date(rawDate);
        const dateFormatted = isNaN(dateObj.getTime()) ? "Tanggal tidak valid" : dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const kategori = meta.categories || meta.category || "Umum";
        
        // Hitung kategori
        if (!kategoriCount[kategori]) kategoriCount[kategori] = 0;
        kategoriCount[kategori]++;

        // Filter Kategori
        if (kategoriFilter && kategori.toLowerCase() !== kategoriFilter.toLowerCase()) {
            return null;
        }

        const rawImage = meta.image || "";
        const imageUrl = rawImage.startsWith('http') 
            ? rawImage 
            : `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${rawImage.replace(/^\//, '')}`;

        return `
          <article class="berita-card">
              <a href="/artikel-detail?slug=${slug}" class="berita-link">
                  <div class="berita-image">
                      <img src="${imageUrl || 'https://via.placeholder.com/400x250?text=RAW+Media'}" alt="${title}" loading="lazy">
                  </div>
                  <div class="berita-content">
                      <span class="berita-kategori">${kategori}</span>
                      <h2 class="berita-title">${title}</h2>
                      <div class="berita-date"><i class="fa-regular fa-clock"></i> ${dateFormatted}</div>
                  </div>
              </a>
          </article>
        `;
      });

    const results = await Promise.all(promises);
    artikelCardsHtml = results.filter(html => html !== null).join("");

    // 3. Sidebar Kategori
    let sidebarKategoriHtml = "";
    const sortedCategories = Object.entries(kategoriCount).sort((a, b) => b[1] - a[1]);
    sortedCategories.forEach(([namaKat, jumlah]) => {
        sidebarKategoriHtml += `
            <li>
                <a href="/artikel?kategori=${namaKat.toLowerCase()}" class="${kategoriFilter === namaKat.toLowerCase() ? 'active' : ''}">
                    ${namaKat} <span class="badge">${jumlah}</span>
                </a>
            </li>
        `;
    });

    // 4. Bangun HTML Utama
    const htmlResponse = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Artikel & Tips ${kategoriFilter ? '- ' + kategoriFilter : ''} - RAW Media Indonesia</title>
    <meta name="description" content="Kumpulan artikel, tips, dan panduan seputar percetakan buku, self publishing, dan industri cetak.">
    <link rel="canonical" href="${SITE_URL}/artikel${kategoriFilter ? '?kategori=' + kategoriFilter : ''}">
    
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <style>
        /* CSS KHUSUS DAFTAR ARTIKEL (PORTAL BERITA) */
        body { background-color: #f2f4f7; margin: 0; font-family: 'Nunito', sans-serif; }
        .portal-main { max-width: 1200px; margin: 120px auto 60px auto; padding: 0 20px; display: grid; grid-template-columns: 1fr 320px; gap: 40px; align-items: start; }
        
        .portal-header { margin-bottom: 40px; border-bottom: 3px solid #BE1A1A; padding-bottom: 20px; }
        .portal-title { font-size: 2.5rem; font-weight: 800; color: #1a1a1a; margin: 0 0 10px 0; text-shadow: none; }
        .portal-desc { color: #666; font-size: 1.1rem; margin: 0; line-height: 1.6; }

        /* Grid Berita */
        .berita-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; }
        .berita-card { background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: transform 0.3s, box-shadow 0.3s; }
        .berita-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
        .berita-link { text-decoration: none; display: flex; flex-direction: column; height: 100%; }
        .berita-image { height: 180px; overflow: hidden; }
        .berita-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .berita-card:hover .berita-image img { transform: scale(1.05); }
        
        .berita-content { padding: 20px; display: flex; flex-direction: column; flex: 1; }
        .berita-kategori { color: #BE1A1A; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 10px; }
        .berita-title { margin: 0 0 15px 0; font-size: 1.2rem; font-weight: 700; color: #1a1a1a; line-height: 1.4; text-shadow: none; }
        .berita-date { margin-top: auto; color: #888; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; }

        /* Sidebar */
        .sidebar-widget { background: #fff; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 30px; }
        .widget-title { font-size: 1.2rem; font-weight: 800; color: #1a1a1a; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 2px solid #eee; }
        .kategori-list { list-style: none; padding: 0; margin: 0; }
        .kategori-list li { border-bottom: 1px dashed #eee; }
        .kategori-list li:last-child { border-bottom: none; }
        .kategori-list a { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; text-decoration: none; color: #444; font-weight: 600; transition: color 0.3s; }
        .kategori-list a:hover, .kategori-list a.active { color: #BE1A1A; }
        .badge { background: #f0f0f0; color: #666; font-size: 0.75rem; padding: 4px 10px; border-radius: 20px; }
        
        .cta-box { background: linear-gradient(135deg, #BE1A1A 0%, #8a1212 100%); padding: 30px; border-radius: 8px; color: #fff; text-align: center; }
        .cta-box h3 { margin-top: 0; font-size: 1.3rem; }
        .cta-box a { display: inline-block; margin-top: 15px; padding: 12px 24px; background: #fff; color: #BE1A1A; font-weight: 800; border-radius: 6px; text-decoration: none; transition: background 0.3s; }
        .cta-box a:hover { background: #f0f0f0; }

        @media (max-width: 900px) { .portal-main { grid-template-columns: 1fr; } }
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

    <!-- KONTEN UTAMA -->
    <main class="portal-main">
        <div class="portal-content">
            <div class="portal-header">
                <h1 class="portal-title">Artikel & Tips ${kategoriFilter ? `- ${kategoriFilter}` : ''}</h1>
                <p class="portal-desc">Kumpulan tulisan menarik seputar dunia percetakan, self publishing, tips praktis, dan insight industri cetak.</p>
            </div>
            
            <div class="berita-grid">
                ${artikelCardsHtml || "<p>Belum ada artikel di kategori ini.</p>"}
            </div>
        </div>

        <aside class="portal-sidebar">
            <div class="sidebar-widget">
                <h3 class="widget-title">Kategori</h3>
                <ul class="kategori-list">
                    <li><a href="/artikel" class="${!kategoriFilter ? 'active' : ''}">Semua Artikel</a></li>
                    ${sidebarKategoriHtml}
                </ul>
            </div>

            <div class="cta-box">
                <h3>Butuh Jasa Cetak Buku?</h3>
                <p>Konsultasi gratis dengan tim kami.</p>
                <a href="https://wa.me/6285231092020">Hubungi Kami</a>
            </div>
        </aside>
    </main>

</body>
</html>`;

    return new Response(htmlResponse, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" }
    });

  } catch (error) {
    return new Response(`<h1>Error</h1><p>${error.message}</p>`, { status: 500, headers: { "Content-Type": "text/html" } });
  }
}