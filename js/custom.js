// Custom Portfolio JavaScript
(function() {
    'use strict';

    // ============================================
    // Text Rotator Animation
    // ============================================
    const TxtRotate = function(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
    };

    TxtRotate.prototype.tick = function() {
        const i = this.loopNum % this.toRotate.length;
        const fullTxt = this.toRotate[i];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

        let that = this;
        let delta = 200 - Math.random() * 100;

        if (this.isDeleting) {
            delta /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.loopNum++;
            delta = 500;
        }

        setTimeout(function() {
            that.tick();
        }, delta);
    };

    // Initialize text rotator
    window.onload = function() {
        const elements = document.getElementsByClassName('txt-rotate');
        for (let i = 0; i < elements.length; i++) {
            const toRotate = elements[i].getAttribute('data-rotate');
            const period = elements[i].getAttribute('data-period');
            if (toRotate) {
                new TxtRotate(elements[i], JSON.parse(toRotate.replace(/'/g, '"')), period);
            }
        }
    };

    // ============================================
    // Navbar Scroll Effect
    // ============================================
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('mainNav');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active nav link (only for main navigation, not tab buttons)
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`#mainNav .nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                // Only remove active from main navbar links, not tab buttons
                document.querySelectorAll('#mainNav .nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    });

    // ============================================
    // Smooth Scroll for Navigation Links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ============================================
    // Counter Animation
    // ============================================
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        const counterElement = element;

        function updateCounter() {
            start += increment;
            if (start < target) {
                counterElement.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                counterElement.textContent = target;
            }
        }

        updateCounter();
    }

    // Intersection Observer for counter animation
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
            }
        });
    }, observerOptions);

    // Observe all counter elements
    document.querySelectorAll('.stat-number').forEach(el => {
        observer.observe(el);
    });

    // ============================================
    // Skill Progress Animation
    // ============================================
    function animateSkillProgress() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        const skillObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    entry.target.classList.add('animated');
                    const value = parseInt(entry.target.getAttribute('data-value'));
                    const percentage = (value / 100) * 360;
                    entry.target.style.background = `conic-gradient(var(--primary-color) ${percentage}deg, var(--bg-light) ${percentage}deg)`;
                }
            });
        }, { threshold: 0.5 });

        skillBars.forEach(bar => {
            skillObserver.observe(bar);
        });
    }

    // Initialize skill progress animation
    animateSkillProgress();

    // ============================================
    // Scroll Animations with Intersection Observer
    // ============================================
    const fadeInObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    // Apply fade-in animation to elements
    document.querySelectorAll('.service-card, .project-card, .contact-card, .skill-category-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeInObserver.observe(el);
    });

    // ============================================
    // Navbar Toggle for Mobile
    // ============================================
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            }
        });
    });

    // ============================================
    // Professional Journey Tab Switching
    // ============================================
    const resumeTabButtons = document.querySelectorAll('#resumeTabs button[data-bs-toggle="tab"]');
    const resumeTabPanes = document.querySelectorAll('#resumeTabsContent .tab-pane');

    function switchResumeTab(clickedButton) {
        // Get the target tab pane ID
        const targetId = clickedButton.getAttribute('data-bs-target');
        
        // Remove active class and aria-selected from all nav buttons
        resumeTabButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        // Remove active and show classes from all tab panes
        resumeTabPanes.forEach(pane => {
            pane.classList.remove('active', 'show');
        });
        
        // Add active class and aria-selected to clicked button
        clickedButton.classList.add('active');
        clickedButton.setAttribute('aria-selected', 'true');
        
        // Show the target tab pane
        const targetPane = document.querySelector(targetId);
        if (targetPane) {
            targetPane.classList.add('active', 'show');
        }
    }

    // Add click event listeners to all tab buttons
    resumeTabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            switchResumeTab(this);
        });
    });

    // Initialize Skills tab as active on page load
    window.addEventListener('DOMContentLoaded', function() {
        const skillsButton = document.getElementById('skills-tab');
        const skillsPane = document.getElementById('skills-tab-content');
        
        // Ensure Skills tab is active
        if (skillsButton && skillsPane) {
            // Remove active from all buttons
            resumeTabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            // Remove active/show from all panes
            resumeTabPanes.forEach(pane => {
                pane.classList.remove('active', 'show');
            });
            
            // Set Skills as active
            skillsButton.classList.add('active');
            skillsButton.setAttribute('aria-selected', 'true');
            skillsPane.classList.add('active', 'show');
        }
    });

})();
