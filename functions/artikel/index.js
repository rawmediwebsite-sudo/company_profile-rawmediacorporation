export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const kategoriFilter = url.searchParams.get("kategori");
  const pageParam = url.searchParams.get("page");
  const currentPage = Math.max(1, parseInt(pageParam) || 1);
  const ITEMS_PER_PAGE = 9; // 9 artikel per halaman (3x3 grid)
  
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

    // 2. Fetch semua metadata secara paralel
    const metaPromises = files
      .filter(file => file.name.endsWith('.md'))
      .map(async (file) => {
        try {
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

          return {
            slug: file.name.replace('.md', ''),
            title: meta.title || "Tanpa Judul",
            rawDate: meta.date || new Date().toISOString(),
            kategori: meta.categories || meta.category || "Umum",
            rawImage: meta.image || "",
            excerpt: meta.description || meta.excerpt || "",
            author: meta.author || "Tim RAW Media"
          };
        } catch (e) {
          return null;
        }
      });

    const allArticles = (await Promise.all(metaPromises)).filter(a => a !== null);

    // Hitung kategori (dari SEMUA artikel, bukan yang terfilter)
    let kategoriCount = {};
    allArticles.forEach(a => {
      kategoriCount[a.kategori] = (kategoriCount[a.kategori] || 0) + 1;
    });

    // Filter berdasarkan kategori
    let filteredArticles = allArticles;
    if (kategoriFilter) {
      filteredArticles = allArticles.filter(
        a => a.kategori.toLowerCase() === kategoriFilter.toLowerCase()
      );
    }

    // 3. Pagination
    const totalArticles = filteredArticles.length;
    const totalPages = Math.max(1, Math.ceil(totalArticles / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    const paginatedArticles = filteredArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // 4. Render kartu artikel
    let artikelCardsHtml = "";
    if (paginatedArticles.length === 0) {
      artikelCardsHtml = `<div class="empty-state"><i class="fa-regular fa-newspaper"></i><p>Belum ada artikel di kategori ini.</p></div>`;
    } else {
      artikelCardsHtml = paginatedArticles.map((artikel, idx) => {
        const dateObj = new Date(artikel.rawDate);
        const dateFormatted = isNaN(dateObj.getTime()) 
          ? "Tanggal tidak valid" 
          : dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        
        const imageUrl = artikel.rawImage.startsWith('http') 
            ? artikel.rawImage 
            : `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${artikel.rawImage.replace(/^\//, '')}`;

        // Kartu pertama lebih besar (featured) jika halaman 1 dan tidak ada filter
        const isFeatured = safePage === 1 && !kategoriFilter && idx === 0;
        const excerptHtml = artikel.excerpt 
          ? `<p class="berita-excerpt">${artikel.excerpt.substring(0, 120)}${artikel.excerpt.length > 120 ? '...' : ''}</p>` 
          : '';

        if (isFeatured) {
          return `
            <article class="berita-card berita-featured">
                <a href="/artikel-detail?slug=${artikel.slug}" class="berita-link">
                    <div class="berita-image">
                        <img src="${imageUrl || 'https://via.placeholder.com/800x450?text=RAW+Media'}" alt="${artikel.title}" loading="lazy">
                    </div>
                    <div class="berita-content">
                        <span class="berita-kategori">${artikel.kategori}</span>
                        <h2 class="berita-title">${artikel.title}</h2>
                        ${excerptHtml}
                        <div class="berita-meta">
                            <span class="berita-date"><i class="fa-regular fa-clock"></i> ${dateFormatted}</span>
                            <span class="berita-author"><i class="fa-regular fa-user"></i> ${artikel.author}</span>
                        </div>
                    </div>
                </a>
            </article>
          `;
        }

        return `
          <article class="berita-card">
              <a href="/artikel-detail?slug=${artikel.slug}" class="berita-link">
                  <div class="berita-image">
                      <img src="${imageUrl || 'https://via.placeholder.com/400x250?text=RAW+Media'}" alt="${artikel.title}" loading="lazy">
                  </div>
                  <div class="berita-content">
                      <span class="berita-kategori">${artikel.kategori}</span>
                      <h2 class="berita-title">${artikel.title}</h2>
                      ${excerptHtml}
                      <div class="berita-meta">
                          <span class="berita-date"><i class="fa-regular fa-clock"></i> ${dateFormatted}</span>
                      </div>
                  </div>
              </a>
          </article>
        `;
      }).join("");
    }

    // 5. Sidebar Kategori
    let sidebarKategoriHtml = "";
    const sortedCategories = Object.entries(kategoriCount).sort((a, b) => b[1] - a[1]);
    sortedCategories.forEach(([namaKat, jumlah]) => {
        sidebarKategoriHtml += `
            <li>
                <a href="/artikel?kategori=${encodeURIComponent(namaKat.toLowerCase())}" class="${kategoriFilter && kategoriFilter.toLowerCase() === namaKat.toLowerCase() ? 'active' : ''}">
                    <span>${namaKat}</span> <span class="badge">${jumlah}</span>
                </a>
            </li>
        `;
    });

    // 6. Pagination HTML
    let paginationHtml = "";
    if (totalPages > 1) {
      const buildUrl = (p) => {
        const params = new URLSearchParams();
        if (kategoriFilter) params.set('kategori', kategoriFilter);
        if (p > 1) params.set('page', p);
        const qs = params.toString();
        return `/artikel${qs ? '?' + qs : ''}`;
      };

      let pageLinks = "";
      // Tampilkan max 5 nomor halaman
      let startPage = Math.max(1, safePage - 2);
      let endPage = Math.min(totalPages, startPage + 4);
      if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

      if (startPage > 1) {
        pageLinks += `<a href="${buildUrl(1)}" class="page-num">1</a>`;
        if (startPage > 2) pageLinks += `<span class="page-dots">...</span>`;
      }

      for (let p = startPage; p <= endPage; p++) {
        pageLinks += `<a href="${buildUrl(p)}" class="page-num ${p === safePage ? 'active' : ''}">${p}</a>`;
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageLinks += `<span class="page-dots">...</span>`;
        pageLinks += `<a href="${buildUrl(totalPages)}" class="page-num">${totalPages}</a>`;
      }

      paginationHtml = `
        <nav class="pagination" aria-label="Navigasi halaman">
          ${safePage > 1 ? `<a href="${buildUrl(safePage - 1)}" class="page-btn page-prev"><i class="fa-solid fa-chevron-left"></i> Sebelumnya</a>` : `<span class="page-btn page-prev disabled"><i class="fa-solid fa-chevron-left"></i> Sebelumnya</span>`}
          <div class="page-numbers">${pageLinks}</div>
          ${safePage < totalPages ? `<a href="${buildUrl(safePage + 1)}" class="page-btn page-next">Berikutnya <i class="fa-solid fa-chevron-right"></i></a>` : `<span class="page-btn page-next disabled">Berikutnya <i class="fa-solid fa-chevron-right"></i></span>`}
        </nav>
      `;
    }

    // 7. Info hasil
    const showingFrom = totalArticles === 0 ? 0 : startIndex + 1;
    const showingTo = Math.min(startIndex + ITEMS_PER_PAGE, totalArticles);

    // 8. Bangun HTML Utama
    const htmlResponse = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Artikel & Tips ${kategoriFilter ? '- ' + kategoriFilter : ''}${safePage > 1 ? ' - Halaman ' + safePage : ''} - RAW Media Indonesia</title>
    <meta name="description" content="Kumpulan artikel, tips, dan panduan seputar percetakan buku, self publishing, dan industri cetak.">
    <link rel="canonical" href="${SITE_URL}/artikel${kategoriFilter ? '?kategori=' + kategoriFilter : ''}">
    
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <style>
        /* ===== PORTAL BERITA STYLES ===== */
        :root {
            --primary: #2373F4;
            --primary-dark: #1a5bd0;
            --primary-light: #e8f1fe;
            --text-dark: #1a1a1a;
            --text-mid: #555;
            --text-light: #888;
            --bg-light: #f2f4f7;
            --border: #e5e7eb;
        }
        
        * { box-sizing: border-box; }
        body { 
            background-color: var(--bg-light); 
            margin: 0; 
            font-family: 'Nunito', sans-serif;
            color: var(--text-dark);
        }
        
        .portal-main { 
            max-width: 1240px; 
            margin: 120px auto 60px auto; 
            padding: 0 20px; 
            display: grid; 
            grid-template-columns: 1fr 320px; 
            gap: 40px; 
            align-items: start; 
        }
        
        .portal-header { 
            margin-bottom: 30px; 
            border-bottom: 3px solid var(--primary); 
            padding-bottom: 20px; 
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            flex-wrap: wrap;
            gap: 15px;
        }
        .portal-title { 
            font-size: 2.4rem; 
            font-weight: 800; 
            color: var(--text-dark); 
            margin: 0 0 8px 0; 
            line-height: 1.2;
        }
        .portal-title .accent { color: var(--primary); }
        .portal-desc { 
            color: var(--text-mid); 
            font-size: 1rem; 
            margin: 0; 
            line-height: 1.6; 
            max-width: 600px;
        }
        .portal-count {
            font-size: 0.9rem;
            color: var(--text-light);
            font-weight: 600;
            white-space: nowrap;
        }

        /* ===== BERITA GRID ===== */
        .berita-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr);
            gap: 24px; 
        }
        
        .berita-card { 
            background: #fff; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.06); 
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            display: flex;
        }
        .berita-card:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 12px 28px rgba(35, 115, 244, 0.15); 
        }
        
        /* Featured card (span 2 kolom) */
        .berita-featured {
            grid-column: span 3;
            flex-direction: row;
        }
        .berita-featured .berita-link {
            flex-direction: row;
        }
        .berita-featured .berita-image {
            width: 55%;
            height: auto;
            min-height: 320px;
        }
        .berita-featured .berita-content {
            width: 45%;
            justify-content: center;
            padding: 35px;
        }
        .berita-featured .berita-title {
            font-size: 1.7rem;
            margin-bottom: 15px;
        }
        
        .berita-link { 
            text-decoration: none; 
            display: flex; 
            flex-direction: column; 
            height: 100%; 
            width: 100%;
            color: inherit;
        }
        .berita-image { 
            height: 190px; 
            overflow: hidden; 
            background: #eaeaea;
            position: relative;
        }
        .berita-image img { 
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            transition: transform 0.5s ease;
            display: block;
        }
        .berita-card:hover .berita-image img { transform: scale(1.06); }
        
        .berita-content { 
            padding: 20px; 
            display: flex; 
            flex-direction: column; 
            flex: 1; 
        }
        .berita-kategori { 
            color: var(--primary); 
            font-weight: 800; 
            font-size: 0.7rem; 
            text-transform: uppercase; 
            margin-bottom: 10px; 
            letter-spacing: 0.5px;
        }
        .berita-title { 
            margin: 0 0 12px 0; 
            font-size: 1.15rem; 
            font-weight: 700; 
            color: var(--text-dark); 
            line-height: 1.4; 
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            transition: color 0.2s;
        }
        .berita-card:hover .berita-title {
            color: var(--primary);
        }
        .berita-excerpt {
            color: var(--text-mid);
            font-size: 0.88rem;
            line-height: 1.6;
            margin: 0 0 15px 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .berita-meta { 
            margin-top: auto; 
            display: flex;
            flex-wrap: wrap;
            gap: 14px;
            color: var(--text-light); 
            font-size: 0.8rem; 
        }
        .berita-date, .berita-author {
            display: flex; 
            align-items: center; 
            gap: 6px;
        }
        .berita-date i, .berita-author i { font-size: 0.75rem; }

        /* ===== EMPTY STATE ===== */
        .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 60px 20px;
            color: var(--text-light);
            background: #fff;
            border-radius: 10px;
        }
        .empty-state i {
            font-size: 3rem;
            margin-bottom: 15px;
            opacity: 0.4;
            color: var(--primary);
        }
        .empty-state p { font-size: 1.1rem; margin: 0; }

        /* ===== PAGINATION ===== */
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin-top: 40px;
            padding: 20px 0;
            flex-wrap: wrap;
        }
        .page-numbers {
            display: flex;
            gap: 6px;
            align-items: center;
        }
        .page-btn, .page-num {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 16px;
            border-radius: 8px;
            background: #fff;
            color: var(--text-mid);
            text-decoration: none;
            font-weight: 700;
            font-size: 0.9rem;
            border: 1px solid var(--border);
            transition: all 0.2s ease;
            min-width: 42px;
            justify-content: center;
        }
        .page-num { padding: 10px 14px; }
        .page-btn:hover, .page-num:hover {
            background: var(--primary);
            color: #fff;
            border-color: var(--primary);
        }
        .page-num.active {
            background: var(--primary);
            color: #fff;
            border-color: var(--primary);
        }
        .page-btn.disabled {
            opacity: 0.4;
            cursor: not-allowed;
            pointer-events: none;
        }
        .page-dots {
            color: var(--text-light);
            padding: 0 4px;
            font-weight: 700;
        }

        /* ===== SIDEBAR ===== */
        .portal-sidebar { position: sticky; top: 100px; }
        .sidebar-widget { 
            background: #fff; 
            border-radius: 10px; 
            padding: 25px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.06); 
            margin-bottom: 25px; 
        }
        .widget-title { 
            font-size: 1.15rem; 
            font-weight: 800; 
            color: var(--text-dark); 
            margin: 0 0 18px 0; 
            padding-bottom: 12px; 
            border-bottom: 2px solid var(--border); 
        }
        .kategori-list { list-style: none; padding: 0; margin: 0; }
        .kategori-list li { border-bottom: 1px dashed var(--border); }
        .kategori-list li:last-child { border-bottom: none; }
        .kategori-list a { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 12px 0; 
            text-decoration: none; 
            color: #444; 
            font-weight: 600; 
            font-size: 0.95rem;
            transition: color 0.2s; 
        }
        .kategori-list a:hover, .kategori-list a.active { color: var(--primary); }
        .badge { 
            background: #f0f0f0; 
            color: #666; 
            font-size: 0.72rem; 
            padding: 3px 10px; 
            border-radius: 20px; 
            font-weight: 700;
            min-width: 26px;
            text-align: center;
            transition: all 0.2s;
        }
        .kategori-list a:hover .badge {
            background: var(--primary-light);
            color: var(--primary);
        }
        .kategori-list a.active .badge {
            background: var(--primary);
            color: #fff;
        }
        
        .cta-box { 
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); 
            padding: 28px; 
            border-radius: 10px; 
            color: #fff; 
            text-align: center; 
        }
        .cta-box h3 { margin: 0 0 8px 0; font-size: 1.2rem; font-weight: 800; }
        .cta-box p { margin: 0; font-size: 0.88rem; opacity: 0.9; line-height: 1.5; }
        .cta-box a { 
            display: inline-block; 
            margin-top: 16px; 
            padding: 11px 24px; 
            background: #fff; 
            color: var(--primary); 
            font-weight: 800; 
            border-radius: 6px; 
            text-decoration: none; 
            transition: all 0.2s; 
            font-size: 0.9rem;
        }
        .cta-box a:hover { background: #f5f5f5; transform: translateY(-2px); }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
            .berita-grid { grid-template-columns: repeat(2, 1fr); }
            .berita-featured { grid-column: span 2; flex-direction: column; }
            .berita-featured .berita-link { flex-direction: column; }
            .berita-featured .berita-image { width: 100%; min-height: 220px; height: 220px; }
            .berita-featured .berita-content { width: 100%; padding: 22px; }
            .berita-featured .berita-title { font-size: 1.4rem; }
        }
        @media (max-width: 900px) {
            .portal-main { grid-template-columns: 1fr; gap: 30px; margin-top: 100px; }
            .portal-sidebar { position: static; }
            .portal-title { font-size: 1.9rem; }
        }
        @media (max-width: 600px) {
            .berita-grid { grid-template-columns: 1fr; }
            .berita-featured { grid-column: span 1; }
            .portal-main { padding: 0 15px; margin-top: 90px; }
            .portal-title { font-size: 1.6rem; }
            .pagination { gap: 6px; }
            .page-btn { padding: 8px 12px; font-size: 0.82rem; }
            .page-btn .page-text { display: none; }
            .page-num { padding: 8px 11px; font-size: 0.85rem; min-width: 36px; }
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

    <!-- KONTEN UTAMA -->
    <main class="portal-main">
        <div class="portal-content">
            <div class="portal-header">
                <div>
                    <h1 class="portal-title">Artikel & Tips ${kategoriFilter ? `<span class="accent">${kategoriFilter}</span>` : ''}</h1>
                    <p class="portal-desc">Kumpulan tulisan menarik seputar dunia percetakan, self publishing, tips praktis, dan insight industri cetak.</p>
                </div>
                <div class="portal-count">
                    ${totalArticles > 0 ? `Menampilkan ${showingFrom}–${showingTo} dari ${totalArticles} artikel` : 'Tidak ada artikel'}
                </div>
            </div>
            
            <div class="berita-grid">
                ${artikelCardsHtml}
            </div>

            ${paginationHtml}
        </div>

        <aside class="portal-sidebar">
            <div class="sidebar-widget">
                <h3 class="widget-title">Kategori</h3>
                <ul class="kategori-list">
                    <li><a href="/artikel" class="${!kategoriFilter ? 'active' : ''}"><span>Semua Artikel</span> <span class="badge">${allArticles.length}</span></a></li>
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