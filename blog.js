const GITHUB_USER = "rawmediwebsite-sudo";
const GITHUB_REPO = "company_profile-rawmediacorporation";
const GITHUB_BRANCH = "main";

function getImageUrl(imagePath) {
    if (!imagePath) return 'https://via.placeholder.com/400x250?text=No+Image'; 
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) {
        return `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}${imagePath}`;
    }
    return imagePath;
}

async function renderDaftarArtikel() {
    const container = document.getElementById("daftar-artikel");
    if (!container) return;

    // SUNTIKKAN CSS GRID KE DALAM CONTAINER AGAR PASTI RAPI
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fill, minmax(300px, 1fr))";
    container.style.gap = "25px";

    const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/content/artikel?ref=${GITHUB_BRANCH}`;
    
    try {
        const response = await fetch(url);
        const files = await response.json();
        
        if (!Array.isArray(files) || files.length === 0) {
            container.innerHTML = "<p>Belum ada artikel.</p>";
            return;
        }

        files.sort((a, b) => b.name.localeCompare(a.name));
        container.innerHTML = ""; 

        for (const file of files) {
            if (!file.name.endsWith('.md')) continue;

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
            const tanggal = new Date(meta.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const imageUrl = getImageUrl(meta.image);
            const articleUrl = `${window.location.origin}/artikel-detail?slug=${slug}`;

            // KARTU ARTIKEL DENGAN CSS INLINE (DIJAMIN RAPI)
            const card = document.createElement("article");
            card.style.background = "#fff";
            card.style.borderRadius = "12px";
            card.style.overflow = "hidden";
            card.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
            card.style.border = "1px solid #eee";
            card.style.display = "flex";
            card.style.flexDirection = "column";
            card.style.transition = "transform 0.3s";

            card.innerHTML = `
                <a href="/artikel-detail?slug=${slug}" style="display: block; height: 200px; overflow: hidden;">
                    <img src="${imageUrl}" alt="${meta.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                </a>
                <div style="padding: 20px; display: flex; flex-direction: column; flex: 1;">
                    <span style="color: #BE1A1A; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 8px; display: block;">Artikel</span>
                    <a href="/artikel-detail?slug=${slug}" style="text-decoration: none; color: #1a1a1a; margin-bottom: 15px; display: block;">
                        <h3 style="margin: 0; font-size: 1.2rem; line-height: 1.4; font-weight: 800;">${meta.title || 'Tanpa Judul'}</h3>
                    </a>
                    
                    <div style="margin-top: auto; border-top: 1px dashed #eee; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #888; font-size: 0.85rem;"><i class="fa-regular fa-calendar"></i> ${tanggal}</span>
                        <div style="display: flex; gap: 10px;">
                            <a href="https://wa.me/?text=${encodeURIComponent(meta.title)}%20${encodeURIComponent(articleUrl)}" target="_blank" style="color: #25D366; font-size: 1.1rem;"><i class="fa-brands fa-whatsapp"></i></a>
                            <button onclick="navigator.clipboard.writeText('${articleUrl}').then(() => alert('Link disalin!'))" style="background: none; border: none; color: #666; font-size: 1.1rem; cursor: pointer; padding: 0;"><i class="fa-solid fa-link"></i></button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        }
    } catch (error) {
        container.innerHTML = "<p>Gagal memuat artikel.</p>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("daftar-artikel")) {
        renderDaftarArtikel();
    }
});