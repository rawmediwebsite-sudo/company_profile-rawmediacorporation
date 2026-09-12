/* =========================================
   RAW MEDIA INDONESIA - SCRIPT.JS
   Versi Ringan & Optimized
========================================= */

(function () {
    'use strict';

    /* =========================================
       1. HAMBURGER MENU
    ========================================= */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeBtn = document.getElementById('closeBtn');

    if (hamburger && mobileMenu && closeBtn) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.add('show');
            document.body.classList.add('menu-open');
            document.body.style.overflow = 'hidden';
        });

        closeBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('show');
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
        });

        document.querySelectorAll('.mobile-nav-links li a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    mobileMenu.classList.remove('show');
                    document.body.classList.remove('menu-open');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    /* =========================================
       2. SMOOTH SCROLL NAVBAR
    ========================================= */
    document.querySelectorAll('.nav-links li a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    /* =========================================
       3. NAVBAR ACTIVE LINK ON SCROLL
    ========================================= */
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (sections.length > 0 && navLinks.length > 0) {
        let ticking = false;

        window.addEventListener('scroll', function () {
            if (ticking) return;

            ticking = true;
            window.requestAnimationFrame(() => {
                const scrollPos = window.pageYOffset + 120;
                let current = '';

                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                        current = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + current) {
                        link.classList.add('active');
                    }
                });

                ticking = false;
            });
        }, { passive: true });
    }

    /* =========================================
       4. LIGHTBOX
    ========================================= */
    window.openLightbox = function (imageSrc) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightboxImage');
        if (lightbox && lightboxImage) {
            lightboxImage.src = imageSrc;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeLightbox = function () {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.remove('show');
            document.body.style.overflow = '';
        }
    };

    /* =========================================
       5. GENERATOR PLACEHOLDER
    ========================================= */
    function generatePlaceholder(text, index) {
        const nomor = (parseInt(index) + 1) || 1;
        const warna = ['#2a2520', '#1e3a5f', '#4a2c2a', '#2a4a3a', '#4a3a2a', '#3a2a4a'];
        const bg = warna[(parseInt(index) || 0) % warna.length];

        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="530" viewBox="0 0 400 530">' +
            '<rect width="400" height="530" fill="' + bg + '"/>' +
            '<text x="200" y="250" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">' + text + '</text>' +
            '<text x="200" y="290" font-family="Arial, sans-serif" font-size="16" fill="#e60000" text-anchor="middle" dominant-baseline="middle">Gambar ' + nomor + '</text>' +
            '</svg>';
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    /* =========================================
       6. DATA PRODUK PERCETAKAN
    ========================================= */
    const produkData = {
        buku: {
            title: 'Cetak Buku',
            bahan: ['HVS 60gsm', 'HVS 70gsm', 'HVS 80gsm', 'Bookpaper 57gsm', 'Bookpaper 72gsm', 'Artpaper 120gsm', 'Artpaper 150gsm'],
            ukuran: ['A5', 'Unesco', 'B5', 'A4', 'A4+', 'Custom'],
            finishing: ['Softcover', 'Hardcover', 'Spiral', 'Perfect Binding', 'Jahit Benang', 'Laminasi Doff', 'Laminasi Glossy', 'Spot UV'],
            deskripsi: 'Layanan cetak buku profesional untuk kebutuhan sekolah, kampus, penerbit, dan penulis independen. Kami menggunakan mesin cetak modern dengan hasil tajam dan warna akurat. Cocok untuk novel, buku ajar, modul, buku akademik, dan self publishing.',
            info: { minOrder: '50 buku', pengerjaan: '7-14 hari kerja', garansi: 'Garansi hasil cetak', pengiriman: 'Seluruh Indonesia' },
            images: ['img/produk/buku-1.jpg', 'img/produk/buku-2.jpg', 'img/produk/buku-3.jpg', 'img/produk/buku-4.jpg']
        },
        tahunan: {
            title: 'Buku Tahunan',
            bahan: ['Artpaper 150gsm', 'Artpaper 200gsm', 'Matte Paper', 'Glossy Paper', 'Concorde', 'Linen'],
            ukuran: ['A4', 'B5', '20×25 cm', 'Custom'],
            finishing: ['Hardcover', 'Hardcover + Box', 'Laminasi Doff', 'Laminasi Glossy', 'Spot UV', 'Emboss', 'Deboss', 'Hot Print Emas/Silver'],
            deskripsi: 'Paket lengkap buku tahunan sekolah dengan layanan fotografi profesional, desain layout kreatif, dan cetak full color berkualitas tinggi. Membuat kenangan siswa lebih berkesan dan memorable. Termasuk sesi foto siswa, guru, dan kelas.',
            info: { minOrder: '100 buku', pengerjaan: '21-45 hari kerja', garansi: 'Garansi hasil cetak', pengiriman: 'Seluruh Indonesia' },
            images: ['img/produk/tahunan-1.jpg', 'img/produk/tahunan-2.jpg', 'img/produk/tahunan-3.jpg', 'img/produk/tahunan-4.jpg']
        },
        pesantren: {
            title: 'Buku Pesantren',
            bahan: ['HVS 60gsm', 'HVS 70gsm', 'Bookpaper 57gsm', 'Bookpaper 72gsm', 'Kertas Kuning Khusus', 'Artpaper 120gsm'],
            ukuran: ['A5', 'Unesco', 'B5', 'Custom'],
            finishing: ['Softcover', 'Hardcover', 'Jilid Jahit', 'Jilid Lem', 'Laminasi Doff', 'Laminasi Glossy', 'Punggung Kain'],
            deskripsi: 'Kami memahami kebutuhan pesantren dengan format yang familiar dan pengerjaan teliti. Melayani cetak kitab kuning, terjemahan, buku doa, buku hafalan, juz amma, dan buku administrasi pesantren dalam jumlah besar.',
            info: { minOrder: '100 buku', pengerjaan: '14-30 hari kerja', garansi: 'Harga khusus pesantren', pengiriman: 'Seluruh Indonesia' },
            images: ['img/produk/pesantren-1.jpg', 'img/produk/pesantren-2.jpg', 'img/produk/pesantren-3.jpg', 'img/produk/pesantren-4.jpg']
        },
        finishing: {
            title: 'Finishing Premium',
            bahan: ['Kertas Cover AC', 'Kertas Cover BW', 'Linen', 'Concorde', 'Rexin', 'Kulit Sintetis', 'Kayu Cover'],
            ukuran: ['A5', 'Unesco', 'B5', 'A4', 'Custom'],
            finishing: ['Jilid Soft Cover', 'Jilid Hard Cover', 'Jilid Spiral', 'Perfect Binding', 'Jahit Benang', 'Laminasi Glossy', 'Laminasi Doff', 'Spot UV', 'Emboss', 'Deboss', 'Hot Print'],
            deskripsi: 'Layanan finishing dengan presisi tinggi untuk menghasilkan produk cetak yang tahan lama dan berkelas. Cocok untuk buku, katalog, company profile, skripsi, tesis, dan dokumen penting lainnya.',
            info: { minOrder: '1 buku', pengerjaan: '1-3 hari kerja', garansi: 'Garansi hasil finishing', pengiriman: 'Seluruh Indonesia' },
            images: ['img/produk/finishing-1.jpg', 'img/produk/finishing-2.jpg', 'img/produk/finishing-3.jpg', 'img/produk/finishing-4.jpg']
        },
        desain: {
            title: 'Desain Grafis',
            bahan: ['Konsultasi Konsep', 'Moodboard & Referensi', 'Sketsa Awal', 'File Siap Cetak', 'File Master (AI/PSD)'],
            ukuran: ['Cover Buku', 'Layout Isi', 'Logo', 'Brosur', 'Katalog', 'Banner'],
            finishing: ['Desain Cover Buku', 'Layout Isi Buku', 'Desain Logo & Branding', 'Desain Brosur & Pamflet', 'Desain Katalog Produk', 'Desain Banner & Spanduk', 'Social Media Kit', 'Revisi Hingga Puas'],
            deskripsi: 'Tim desainer berpengalaman siap menciptakan identitas visual yang kuat dan profesional untuk brand Anda. Kami menyediakan layanan desain dari konsep hingga siap cetak, dengan revisi hingga Anda puas.',
            info: { minOrder: '1 desain', pengerjaan: '3-14 hari kerja', garansi: 'Revisi hingga puas', pengiriman: 'File via email/WA' },
            images: ['img/produk/desain-1.jpg', 'img/produk/desain-2.jpg', 'img/produk/desain-3.jpg', 'img/produk/desain-4.jpg']
        },
        b2b: {
            title: 'B2B & Korporat',
            bahan: ['Kertas HVS', 'Artpaper', 'Bookpaper', 'Kertas Khusus Instansi', 'Bahan Premium'],
            ukuran: ['Sesuai Kebutuhan', 'Custom'],
            finishing: ['Pengadaan Buku Instansi', 'Cetak Laporan & Dokumen', 'Brosur & Katalog Produk', 'Company Profile', 'Banner & Spanduk', 'Kartu Nama & Kop Surat', 'Invoice & Nota', 'Kontrak Kerja Sama'],
            deskripsi: 'Dukungan penuh untuk kebutuhan korporat dengan pengadaan jumlah besar dan tepat waktu. Kami melayani instansi pemerintah, perusahaan swasta, dan lembaga pendidikan dengan sistem kontrak dan invoice resmi.',
            info: { minOrder: 'Sesuai kontrak', pengerjaan: 'Sesuai kesepakatan', garansi: 'Garansi sesuai kontrak', pengiriman: 'Seluruh Indonesia' },
            images: ['img/produk/b2b-1.jpg', 'img/produk/b2b-2.jpg', 'img/produk/b2b-3.jpg', 'img/produk/b2b-4.jpg']
        }
    };

    /* =========================================
       7. BUKA MODAL PRODUK
    ========================================= */
    window.openProdukModal = function (kategori) {
        const data = produkData[kategori];
        if (!data) return;

        const titleEl = document.getElementById('produkTitle');
        const descEl = document.getElementById('produkDeskripsi');
        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.deskripsi;

        // Main image
        const mainImage = document.getElementById('produkMainImage');
        if (mainImage) {
            mainImage.src = data.images[0];
            mainImage.onerror = function () {
                this.onerror = null;
                this.src = generatePlaceholder(data.title, 0);
            };
        }

        // Thumbnails
        const thumbsContainer = document.getElementById('produkThumbnails');
        if (thumbsContainer) {
            thumbsContainer.innerHTML = '';
            data.images.forEach((src, index) => {
                const thumb = document.createElement('div');
                thumb.className = 'produk-thumb' + (index === 0 ? ' active' : '');

                const img = document.createElement('img');
                img.src = src;
                img.alt = data.title + ' ' + (index + 1);
                img.loading = 'lazy';
                img.onerror = function () {
                    this.onerror = null;
                    this.src = generatePlaceholder(data.title, index);
                };

                thumb.appendChild(img);

                thumb.addEventListener('click', () => {
                    const mainImg = document.getElementById('produkMainImage');
                    if (mainImg) mainImg.src = img.src;
                    thumbsContainer.querySelectorAll('.produk-thumb').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });

                thumbsContainer.appendChild(thumb);
            });
        }

        // Chips: Bahan
        const bahanContainer = document.getElementById('produkBahan');
        if (bahanContainer) {
            bahanContainer.innerHTML = '';
            data.bahan.forEach(item => {
                const chip = document.createElement('span');
                chip.className = 'chip';
                chip.textContent = item;
                bahanContainer.appendChild(chip);
            });
        }

        // Chips: Ukuran
        const ukuranContainer = document.getElementById('produkUkuran');
        if (ukuranContainer) {
            ukuranContainer.innerHTML = '';
            data.ukuran.forEach(item => {
                const chip = document.createElement('span');
                chip.className = 'chip';
                chip.textContent = item;
                ukuranContainer.appendChild(chip);
            });
        }

        // Chips: Finishing
        const finishingContainer = document.getElementById('produkFinishing');
        if (finishingContainer) {
            finishingContainer.innerHTML = '';
            data.finishing.forEach(item => {
                const chip = document.createElement('span');
                chip.className = 'chip';
                chip.textContent = item;
                finishingContainer.appendChild(chip);
            });
        }

        // Info extra
        const infoExtra = document.getElementById('produkInfoExtra');
        if (infoExtra) {
            infoExtra.innerHTML =
                '<div class="info-item"><span class="info-label">Minimal Order</span><span class="info-value">' + data.info.minOrder + '</span></div>' +
                '<div class="info-item"><span class="info-label">Pengerjaan</span><span class="info-value">' + data.info.pengerjaan + '</span></div>' +
                '<div class="info-item"><span class="info-label">Garansi</span><span class="info-value">' + data.info.garansi + '</span></div>' +
                '<div class="info-item"><span class="info-label">Pengiriman</span><span class="info-value">' + data.info.pengiriman + '</span></div>';
        }

        // WA dinamis
        const waBtn = document.getElementById('produkWA');
        if (waBtn) {
            const waMessage = 'Halo RAW Media Indonesia, saya ingin konsultasi tentang layanan *' + data.title + '*. Mohon info lebih lanjut.';
            waBtn.href = 'https://wa.me/6285231092020?text=' + encodeURIComponent(waMessage);
        }

        // Show modal
        const modal = document.getElementById('produkModal');
        if (modal) {
            modal.classList.add('show');
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeProdukModal = function () {
        const modal = document.getElementById('produkModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
        }
    };

    /* =========================================
       8. KEYBOARD SUPPORT (ESC)
    ========================================= */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeProdukModal();
            closeLightbox();
        }
    });

    /* =========================================
       9. AKSESIBILITAS CARD (Enter / Space)
    ========================================= */
    document.querySelectorAll('.produk-card').forEach(card => {
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const kategori = this.dataset.produk;
                if (kategori) openProdukModal(kategori);
            }
        });
    });

    /* =========================================
       10. COVERFLOW GALERI - VERSI RINGAN
    ========================================= */
    (function initCoverflow() {
        const items = document.querySelectorAll('.coverflow-item');
        const dots = document.querySelectorAll('.coverflow-dot');
        const total = items.length;

        if (total === 0) return;

        const AUTO_PLAY_INTERVAL = 4000;
        let currentIndex = 0;
        let autoPlayTimer = null;
        let isHovering = false;
        let isDocumentHidden = false;
        let isOutOfView = false;
        let isIdle = false;
        let idleTimer = null;
        let lastRenderedIndex = -1;

        const coverflowWrap = document.querySelector('.coverflow-wrap');

        function updateCoverflow(force) {
            if (!force && lastRenderedIndex === currentIndex) return;

            const half = Math.floor(total / 2);

            items.forEach((item, i) => {
                let diff = i - currentIndex;
                if (diff > half) diff -= total;
                if (diff < -half) diff += total;

                item.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');

                if (diff === 0) item.classList.add('is-active');
                else if (diff === -1) item.classList.add('is-prev');
                else if (diff === 1) item.classList.add('is-next');
                else item.classList.add('is-hidden');
            });

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });

            lastRenderedIndex = currentIndex;
        }

        function shouldAutoPlay() {
            if (isHovering) return false;
            if (isDocumentHidden) return false;
            if (isOutOfView) return false;
            return true;
        }

        function scheduleNext() {
            clearTimeout(autoPlayTimer);

            let interval = AUTO_PLAY_INTERVAL;
            if (isIdle) interval *= 1.5;

            autoPlayTimer = setTimeout(() => {
                if (shouldAutoPlay()) {
                    currentIndex = (currentIndex + 1) % total;
                    updateCoverflow();
                    scheduleNext();
                }
            }, interval);
        }

        function startAutoPlay() {
            clearTimeout(autoPlayTimer);
            scheduleNext();
        }

        function stopAutoPlay() {
            clearTimeout(autoPlayTimer);
            autoPlayTimer = null;
        }

        function restartAutoPlay() {
            stopAutoPlay();
            if (shouldAutoPlay()) startAutoPlay();
        }

        // IntersectionObserver - pause saat tidak terlihat
        if (coverflowWrap && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isOutOfView = !entry.isIntersecting;
                    if (isOutOfView) {
                        stopAutoPlay();
                    } else {
                        restartAutoPlay();
                    }
                });
            }, { rootMargin: '100px', threshold: 0.1 });

            observer.observe(coverflowWrap);
        }

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            isDocumentHidden = document.hidden;
            if (isDocumentHidden) {
                stopAutoPlay();
            } else {
                restartAutoPlay();
            }
        });

        // Hover pause
        if (coverflowWrap) {
            coverflowWrap.addEventListener('mouseenter', () => {
                isHovering = true;
                stopAutoPlay();
            });

            coverflowWrap.addEventListener('mouseleave', () => {
                isHovering = false;
                restartAutoPlay();
            });

            coverflowWrap.addEventListener('touchstart', () => {
                isHovering = true;
                stopAutoPlay();
            }, { passive: true });

            coverflowWrap.addEventListener('touchend', () => {
                setTimeout(() => {
                    isHovering = false;
                    restartAutoPlay();
                }, 3000);
            }, { passive: true });
        }

        // Idle detection
        const resetIdle = () => {
            isIdle = false;
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => { isIdle = true; }, 8000);
        };

        ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach(evt => {
            document.addEventListener(evt, resetIdle, { passive: true });
        });
        resetIdle();

        // Klik item
        items.forEach((item, i) => {
            item.addEventListener('click', function () {
                if (this.classList.contains('is-active')) {
                    const img = this.querySelector('img');
                    if (img && typeof openLightbox === 'function') {
                        openLightbox(img.src);
                    }
                } else {
                    currentIndex = i;
                    updateCoverflow();
                    restartAutoPlay();
                }
            });
        });

        // Klik dots
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateCoverflow();
                restartAutoPlay();
            });
        });

        // Prev/Next global
        window.coverflowPrev = function () {
            currentIndex = (currentIndex - 1 + total) % total;
            updateCoverflow();
            restartAutoPlay();
        };

        window.coverflowNext = function () {
            currentIndex = (currentIndex + 1) % total;
            updateCoverflow();
            restartAutoPlay();
        };

        // Preload gambar bertahap
        function preloadImages() {
            const images = [];
            items.forEach(item => {
                const img = item.querySelector('img');
                if (img && img.src) images.push(img.src);
            });

            images.forEach((src, index) => {
                setTimeout(() => {
                    const img = new Image();
                    img.src = src;
                }, index * 300);
            });
        }

        // Init
        updateCoverflow(true);
        startAutoPlay();
        preloadImages();
    })();

    /* =========================================
       11. FORM PEMESANAN (WHATSAPP)
    ========================================= */
    const orderForm = document.getElementById('orderForm');
    const waNumber = '6285231092020';

    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const getVal = (id) => {
                const el = document.getElementById(id);
                return el ? el.value : '';
            };

            const nama = getVal('nama');
            const telepon = getVal('telepon');
            const alamat = getVal('alamat');
            const jenis_layanan = getVal('jenis_layanan') || getVal('produk_pilihan');
            const jumlah_cetak = getVal('jumlah_cetak');
            const ukuran = getVal('ukuran');
            const jenis_kertas = getVal('jenis_kertas') || getVal('jenis_bahan');
            const jenis_cover = getVal('jenis_cover');
            const jenis_finishing = getVal('jenis_finishing') || getVal('jenis_cetak');
            const catatan = getVal('catatan');

            let message = 'Halo RAW Media Indonesia,\n\nSaya ingin memesan:\n\n';
            message += 'Nama: ' + nama + '\n';
            message += 'No. WhatsApp: ' + telepon + '\n';
            message += 'Alamat Pengiriman: ' + alamat + '\n';
            if (jenis_layanan) message += 'Jenis Layanan: ' + jenis_layanan + '\n';
            if (jumlah_cetak) message += 'Jumlah Cetak: ' + jumlah_cetak + '\n';
            if (ukuran) message += 'Ukuran: ' + ukuran + '\n';
            if (jenis_kertas) message += 'Jenis Kertas: ' + jenis_kertas + '\n';
            if (jenis_cover) message += 'Jenis Cover: ' + jenis_cover + '\n';
            if (jenis_finishing) message += 'Jenis Finishing: ' + jenis_finishing + '\n';
            if (catatan) message += 'Catatan: ' + catatan + '\n';
            message += '\nMohon info ketersediaan dan estimasi harganya. Terima kasih!';

            const waLink = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(message);
            window.open(waLink, '_blank');
        });
    }

})();
/* =========================================
   COVERFLOW GALERI
========================================= */
(function initCoverflow() {
    const items = document.querySelectorAll('.coverflow-item');
    const dots = document.querySelectorAll('.coverflow-dot');
    const total = items.length;

    if (total === 0) return;

    const AUTO_PLAY_INTERVAL = 4000;
    let currentIndex = 0;
    let autoPlayTimer = null;
    let isHovering = false;
    let isDocumentHidden = false;
    let isOutOfView = false;
    let lastRenderedIndex = -1;

    const coverflowWrap = document.querySelector('.coverflow-wrap');

    function updateCoverflow(force) {
        if (!force && lastRenderedIndex === currentIndex) return;

        const half = Math.floor(total / 2);

        items.forEach((item, i) => {
            let diff = i - currentIndex;
            if (diff > half) diff -= total;
            if (diff < -half) diff += total;

            item.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');

            if (diff === 0) item.classList.add('is-active');
            else if (diff === -1) item.classList.add('is-prev');
            else if (diff === 1) item.classList.add('is-next');
            else item.classList.add('is-hidden');
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });

        lastRenderedIndex = currentIndex;
    }

    function shouldAutoPlay() {
        if (isHovering) return false;
        if (isDocumentHidden) return false;
        if (isOutOfView) return false;
        return true;
    }

    function scheduleNext() {
        clearTimeout(autoPlayTimer);
        autoPlayTimer = setTimeout(() => {
            if (shouldAutoPlay()) {
                currentIndex = (currentIndex + 1) % total;
                updateCoverflow();
                scheduleNext();
            }
        }, AUTO_PLAY_INTERVAL);
    }

    function startAutoPlay() {
        clearTimeout(autoPlayTimer);
        scheduleNext();
    }

    function stopAutoPlay() {
        clearTimeout(autoPlayTimer);
        autoPlayTimer = null;
    }

    function restartAutoPlay() {
        stopAutoPlay();
        if (shouldAutoPlay()) startAutoPlay();
    }

    if (coverflowWrap && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isOutOfView = !entry.isIntersecting;
                if (isOutOfView) stopAutoPlay();
                else restartAutoPlay();
            });
        }, { rootMargin: '100px', threshold: 0.1 });
        observer.observe(coverflowWrap);
    }

    document.addEventListener('visibilitychange', () => {
        isDocumentHidden = document.hidden;
        if (isDocumentHidden) stopAutoPlay();
        else restartAutoPlay();
    });

    if (coverflowWrap) {
        coverflowWrap.addEventListener('mouseenter', () => {
            isHovering = true;
            stopAutoPlay();
        });
        coverflowWrap.addEventListener('mouseleave', () => {
            isHovering = false;
            restartAutoPlay();
        });
        coverflowWrap.addEventListener('touchstart', () => {
            isHovering = true;
            stopAutoPlay();
        }, { passive: true });
        coverflowWrap.addEventListener('touchend', () => {
            setTimeout(() => {
                isHovering = false;
                restartAutoPlay();
            }, 3000);
        }, { passive: true });
    }

    items.forEach((item, i) => {
        item.addEventListener('click', function () {
            if (this.classList.contains('is-active')) {
                const img = this.querySelector('img');
                if (img && typeof openLightbox === 'function') {
                    openLightbox(img.src);
                }
            } else {
                currentIndex = i;
                updateCoverflow();
                restartAutoPlay();
            }
        });
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            currentIndex = i;
            updateCoverflow();
            restartAutoPlay();
        });
    });

    window.coverflowPrev = function () {
        currentIndex = (currentIndex - 1 + total) % total;
        updateCoverflow();
        restartAutoPlay();
    };

    window.coverflowNext = function () {
        currentIndex = (currentIndex + 1) % total;
        updateCoverflow();
        restartAutoPlay();
    };

    updateCoverflow(true);
    startAutoPlay();
})();   