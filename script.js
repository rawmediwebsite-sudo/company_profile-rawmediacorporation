/* =========================================
   RAW MEDIA INDONESIA - SCRIPT.JS
   Versi Bersih — Tanpa Modal Produk
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
       5. KEYBOARD SUPPORT (ESC — LIGHTBOX)
    ========================================= */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });

    /* =========================================
       6. COVERFLOW GALERI
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

        document.addEventListener('visibilitychange', () => {
            isDocumentHidden = document.hidden;
            if (isDocumentHidden) {
                stopAutoPlay();
            } else {
                restartAutoPlay();
            }
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

        const resetIdle = () => {
            isIdle = false;
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => { isIdle = true; }, 8000);
        };

        ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach(evt => {
            document.addEventListener(evt, resetIdle, { passive: true });
        });
        resetIdle();

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

        updateCoverflow(true);
        startAutoPlay();
        preloadImages();
    })();

    /* =========================================
       7. FORM PEMESANAN (WHATSAPP)
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