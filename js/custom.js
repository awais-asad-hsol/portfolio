// Portfolio JavaScript — dark minimal rebuild
(function () {
    'use strict';

    // ============================================
    // Text rotator (typing effect)
    // ============================================
    function TxtRotate(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.isDeleting = false;
        this.tick();
    }

    TxtRotate.prototype.tick = function () {
        const i = this.loopNum % this.toRotate.length;
        const fullTxt = this.toRotate[i];

        this.txt = this.isDeleting
            ? fullTxt.substring(0, this.txt.length - 1)
            : fullTxt.substring(0, this.txt.length + 1);

        this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

        let delta = 180 - Math.random() * 80;
        if (this.isDeleting) delta /= 2;

        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.loopNum++;
            delta = 400;
        }

        setTimeout(() => this.tick(), delta);
    };

    function initRotator() {
        document.querySelectorAll('.txt-rotate').forEach(function (el) {
            const toRotate = el.getAttribute('data-rotate');
            const period = el.getAttribute('data-period');
            if (toRotate) new TxtRotate(el, JSON.parse(toRotate), period);
        });
    }

    // ============================================
    // Navbar: scrolled state + mobile menu
    // ============================================
    function initNav() {
        const nav = document.getElementById('mainNav');
        const toggle = document.getElementById('navToggle');
        const links = document.getElementById('navLinks');

        window.addEventListener('scroll', function () {
            nav.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });

        if (toggle && links) {
            toggle.addEventListener('click', function () {
                const open = links.classList.toggle('open');
                toggle.classList.toggle('open', open);
                toggle.setAttribute('aria-expanded', open);
            });
            links.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () {
                    links.classList.remove('open');
                    toggle.classList.remove('open');
                    toggle.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    // ============================================
    // Scroll reveal + animated counters
    // ============================================
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const duration = 1200;
        const start = performance.now();

        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            el.textContent = Math.floor(progress * target);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    function initObservers() {
        const revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        document.querySelectorAll('.reveal').forEach(function (el) {
            revealObserver.observe(el);
        });

        const counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-number').forEach(function (el) {
            counterObserver.observe(el);
        });
    }

    // ============================================
    // Scrollspy — highlight nav link for visible section
    // ============================================
    function initScrollspy() {
        const links = Array.prototype.slice.call(
            document.querySelectorAll('.nav-links a[href^="#"]')
        );
        const sections = links
            .map(function (link) { return document.querySelector(link.getAttribute('href')); })
            .filter(Boolean);

        function setActive(id) {
            links.forEach(function (link) {
                link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
        }

        const spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

        sections.forEach(function (section) { spy.observe(section); });

        // Clear highlight when back at the hero
        window.addEventListener('scroll', function () {
            if (window.scrollY < 200) setActive('');
        }, { passive: true });
    }

    // ============================================
    // Project screenshot galleries + lightbox
    // ============================================
    let lightbox, lightboxImg, lightboxCounter;
    let lbSources = [];
    let lbIndex = 0;

    function buildLightbox() {
        lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML =
            '<button class="lightbox-close" aria-label="Close">&times;</button>' +
            '<button class="gallery-btn prev" aria-label="Previous"><i class="bi bi-chevron-left"></i></button>' +
            '<img alt="Screenshot enlarged">' +
            '<button class="gallery-btn next" aria-label="Next"><i class="bi bi-chevron-right"></i></button>' +
            '<div class="lightbox-counter"></div>';
        document.body.appendChild(lightbox);

        lightboxImg = lightbox.querySelector('img');
        lightboxCounter = lightbox.querySelector('.lightbox-counter');

        lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        lightbox.querySelector('.gallery-btn.prev').addEventListener('click', function (e) { e.stopPropagation(); lbShow(lbIndex - 1); });
        lightbox.querySelector('.gallery-btn.next').addEventListener('click', function (e) { e.stopPropagation(); lbShow(lbIndex + 1); });
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
            if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
        });
    }

    function lbShow(i) {
        lbIndex = (i + lbSources.length) % lbSources.length;
        lightboxImg.src = lbSources[lbIndex];
        lightboxCounter.textContent = (lbIndex + 1) + ' / ' + lbSources.length;
    }

    function openLightbox(sources, startIndex) {
        lbSources = sources;
        lbShow(startIndex);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function initGalleries() {
        buildLightbox();

        document.querySelectorAll('.project-gallery').forEach(function (gallery) {
            const images = Array.prototype.slice.call(gallery.querySelectorAll('img'));
            const dotsWrap = gallery.querySelector('.gallery-dots');
            const sources = images.map(function (img) { return img.getAttribute('src'); });
            let index = 0;

            // Click active image to expand
            images.forEach(function (img) {
                img.addEventListener('click', function () {
                    openLightbox(sources, index);
                });
            });

            if (images.length < 2) return;

            const dots = images.map(function (_, i) {
                const dot = document.createElement('button');
                dot.setAttribute('aria-label', 'Screenshot ' + (i + 1));
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', function () { show(i); });
                dotsWrap.appendChild(dot);
                return dot;
            });

            function show(i) {
                images[index].classList.remove('active');
                dots[index].classList.remove('active');
                index = (i + images.length) % images.length;
                images[index].classList.add('active');
                dots[index].classList.add('active');
            }

            gallery.querySelector('.gallery-btn.prev').addEventListener('click', function () { show(index - 1); });
            gallery.querySelector('.gallery-btn.next').addEventListener('click', function () { show(index + 1); });
        });
    }

    // ============================================
    // Footer year
    // ============================================
    function initYear() {
        const year = document.getElementById('year');
        if (year) year.textContent = new Date().getFullYear();
    }

    function init() {
        initRotator();
        initNav();
        initScrollspy();
        initObservers();
        initGalleries();
        initYear();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
