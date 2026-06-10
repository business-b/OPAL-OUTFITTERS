/**
 * ═══════════════════════════════════════════════════════════════
 *  OPAL OUTFITTERS — 3D ANIMATION ENGINE
 *  Drop this <script> tag just before </body> in your HTML,
 *  AFTER the existing <script> block.
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     UTILITY
  ───────────────────────────────────────── */
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const lerp = (a, b, t) => a + (b - a) * t;
  const raf = requestAnimationFrame;

  /* ─────────────────────────────────────────
     1. HEADER SCROLL ENHANCEMENT
  ───────────────────────────────────────── */
  function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastY = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
      lastY = window.scrollY;
      if (!ticking) {
        raf(() => {
          header.classList.toggle('scrolled', lastY > 60);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     2. MAGNETIC MOUSE-TILT ON PRODUCT CARDS
  ───────────────────────────────────────── */
  function initCardTilt() {
    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
      let animId = null;
      let currentRX = 0, currentRY = 0;
      let targetRX = 0, targetRY = 0;

      function animateCard() {
        currentRX = lerp(currentRX, targetRX, 0.12);
        currentRY = lerp(currentRY, targetRY, 0.12);

        if (Math.abs(currentRX - targetRX) > 0.01 || Math.abs(currentRY - targetRY) > 0.01) {
          card.style.transform = `
            perspective(800px)
            rotateX(${currentRX}deg)
            rotateY(${currentRY}deg)
            translateZ(16px)
            scale(1.02)
          `;
          animId = raf(animateCard);
        } else {
          card.style.transform = `
            perspective(800px)
            rotateX(${targetRX}deg)
            rotateY(${targetRY}deg)
            translateZ(16px)
            scale(1.02)
          `;
          animId = null;
        }
      }

      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);   // -1 to 1
        const dy = (e.clientY - cy) / (rect.height / 2);  // -1 to 1

        targetRY = clamp(dx * 8, -8, 8);
        targetRX = clamp(-dy * 5, -5, 5);

        if (!animId) animId = raf(animateCard);
      });

      card.addEventListener('mouseleave', () => {
        targetRX = 0;
        targetRY = 0;

        // spring back
        function springBack() {
          currentRX = lerp(currentRX, 0, 0.18);
          currentRY = lerp(currentRY, 0, 0.18);

          if (Math.abs(currentRX) > 0.05 || Math.abs(currentRY) > 0.05) {
            card.style.transform = `
              perspective(800px)
              rotateX(${currentRX}deg)
              rotateY(${currentRY}deg)
              translateZ(${Math.abs(currentRX) + Math.abs(currentRY)}px)
              scale(${1 + (Math.abs(currentRX) + Math.abs(currentRY)) * 0.002})
            `;
            animId = raf(springBack);
          } else {
            card.style.transform = '';
            animId = null;
          }
        }

        if (animId) cancelAnimationFrame(animId);
        animId = raf(springBack);
      });

      // 3D shadow follows mouse
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const dx = (e.clientX - rect.left) / rect.width - 0.5;
        const dy = (e.clientY - rect.top) / rect.height - 0.5;

        const shadowX = dx * 30;
        const shadowY = dy * 30 + 20;
        card.style.boxShadow = `
          ${shadowX}px ${shadowY}px 60px rgba(0,0,0,0.2),
          0 8px 30px rgba(212,175,55,0.15),
          0 0 0 1px rgba(212,175,55,0.1)
        `;
      });

      card.addEventListener('mouseleave', () => {
        card.style.boxShadow = '';
      });
    });
  }

  /* ─────────────────────────────────────────
     3. PARALLAX HERO BACKGROUND
  ───────────────────────────────────────── */
  function initHeroParallax() {
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero-bg');
    const particles = document.querySelectorAll('.particle');
    const heroContent = document.querySelector('.hero-content');
    if (!hero || !heroBg) return;

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    let animating = false;

    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      mouseY = (e.clientY - rect.top) / rect.height - 0.5;

      if (!animating) {
        animating = true;
        raf(updateParallax);
      }
    });

    hero.addEventListener('mouseleave', () => {
      mouseX = 0;
      mouseY = 0;
    });

    function updateParallax() {
      currentX = lerp(currentX, mouseX, 0.06);
      currentY = lerp(currentY, mouseY, 0.06);

      // Background layer — subtle
      heroBg.style.transform = `
        scale(1.08)
        translate(${currentX * -20}px, ${currentY * -15}px)
      `;

      // Particles — different depths
      particles.forEach((p, i) => {
        const depth = (i + 1) * 0.4;
        p.style.transform = `
          translate(${currentX * depth * 30}px, ${currentY * depth * 20}px)
        `;
      });

      // Hero content — slight counter-tilt
      if (heroContent) {
        heroContent.style.transform = `
          perspective(1200px)
          rotateX(${currentY * -3}deg)
          rotateY(${currentX * 4}deg)
          translateZ(20px)
        `;
      }

      if (Math.abs(currentX - mouseX) > 0.001 || Math.abs(currentY - mouseY) > 0.001) {
        raf(updateParallax);
      } else {
        animating = false;
      }
    }
  }

  /* ─────────────────────────────────────────
     4. MAGNETIC BUTTONS
  ───────────────────────────────────────── */
  function initMagneticButtons() {
    const btns = document.querySelectorAll('.hero-btn, .d-btn, .submit-btn, .continue-btn');

    btns.forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.25;
        const dy = (e.clientY - cy) * 0.25;

        btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ─────────────────────────────────────────
     5. ENHANCED SCROLL REVEAL
  ───────────────────────────────────────── */
  function initScrollReveal() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;

          // Stagger product grid children
          if (el.classList.contains('products-grid')) {
            el.classList.add('visible');
            const cards = el.querySelectorAll('.product-card');
            cards.forEach((card, ci) => {
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'none';
                card.classList.add('visible');
              }, ci * 80);
            });
          } else {
            // Small delay per element
            setTimeout(() => {
              el.classList.add('visible');
            }, 50);
          }

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .products-grid').forEach(el => observer.observe(el));
  }

  /* ─────────────────────────────────────────
     6. GOLD PARTICLE TRAIL ON CURSOR
  ───────────────────────────────────────── */
  function initCursorTrail() {
    // Only on desktop
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const trail = [];
    const NUM_PARTICLES = 8;

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const p = document.createElement('div');
      p.style.cssText = `
        position: fixed;
        width: ${6 - i * 0.5}px;
        height: ${6 - i * 0.5}px;
        border-radius: 50%;
        background: rgba(212,175,55,${0.8 - i * 0.09});
        pointer-events: none;
        z-index: 99999;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s;
        opacity: 0;
        box-shadow: 0 0 ${4 + i * 2}px rgba(212,175,55,0.5);
      `;
      document.body.appendChild(p);
      trail.push({ el: p, x: 0, y: 0 });
    }

    let mouseX = 0, mouseY = 0;
    let isInHero = false;

    hero.addEventListener('mouseenter', () => {
      isInHero = true;
      trail.forEach(t => t.el.style.opacity = '1');
    });

    hero.addEventListener('mouseleave', () => {
      isInHero = false;
      trail.forEach(t => t.el.style.opacity = '0');
    });

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateTrail() {
      if (isInHero) {
        trail[0].x = mouseX;
        trail[0].y = mouseY;

        for (let i = 1; i < trail.length; i++) {
          trail[i].x = lerp(trail[i].x, trail[i - 1].x, 0.4);
          trail[i].y = lerp(trail[i].y, trail[i - 1].y, 0.4);
        }

        trail.forEach(t => {
          t.el.style.left = t.x + 'px';
          t.el.style.top = t.y + 'px';
        });
      }

      raf(animateTrail);
    }

    raf(animateTrail);
  }

  /* ─────────────────────────────────────────
     7. 3D FLIP TRANSITION FOR DETAIL PAGE
  ───────────────────────────────────────── */
  function initDetailPageTransition() {
    // Intercept openDetail calls
    const originalOpenDetail = window.openDetail;
    if (!originalOpenDetail) return;

    window.openDetail = function (pid) {
      const detailPage = document.getElementById('detail-page');
      originalOpenDetail(pid);

      if (detailPage) {
        detailPage.style.opacity = '0';
        detailPage.style.transform = 'perspective(1200px) rotateX(-10deg) scale(0.95)';
        detailPage.style.transition = 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.175,0.885,0.32,1.275)';

        raf(() => {
          raf(() => {
            detailPage.style.opacity = '1';
            detailPage.style.transform = 'perspective(1200px) rotateX(0deg) scale(1)';
          });
        });
      }
    };

    // Intercept closeDetail
    const originalCloseDetail = window.closeDetail;
    if (originalCloseDetail) {
      window.closeDetail = function () {
        const detailPage = document.getElementById('detail-page');
        if (detailPage) {
          detailPage.style.transition = 'opacity 0.3s ease, transform 0.35s ease';
          detailPage.style.opacity = '0';
          detailPage.style.transform = 'perspective(1200px) rotateX(8deg) scale(0.96)';
          setTimeout(originalCloseDetail, 320);
        } else {
          originalCloseDetail();
        }
      };
    }
  }

  /* ─────────────────────────────────────────
     8. RIPPLE EFFECT ON BUTTONS
  ───────────────────────────────────────── */
  function initRipple() {
    const targets = document.querySelectorAll(
      '.btn, .hero-btn, .submit-btn, .abtn, .asave-btn, .d-btn, .cat-pill'
    );

    targets.forEach(el => {
      el.addEventListener('click', function (e) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height) * 2;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: rgba(212,175,55,0.3);
          width: ${size}px;
          height: ${size}px;
          left: ${x - size / 2}px;
          top: ${y - size / 2}px;
          transform: scale(0);
          animation: rippleAnim 0.6s ease-out forwards;
          pointer-events: none;
          z-index: 0;
        `;

        // Ensure parent has relative position
        const pos = getComputedStyle(el).position;
        if (pos === 'static') el.style.position = 'relative';
        el.style.overflow = 'hidden';

        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      });
    });

    // Inject ripple keyframes once
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `
        @keyframes rippleAnim {
          to { transform: scale(1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ─────────────────────────────────────────
     9. FLOATING RINGS IN HERO (extra depth)
  ───────────────────────────────────────── */
  function initHeroRings() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const rings = [
      { size: 300, delay: 0,  duration: 10, opacity: 0.06 },
      { size: 500, delay: -3, duration: 15, opacity: 0.04 },
      { size: 700, delay: -6, duration: 20, opacity: 0.025 },
    ];

    rings.forEach(cfg => {
      const ring = document.createElement('div');
      ring.style.cssText = `
        position: absolute;
        width: ${cfg.size}px;
        height: ${cfg.size}px;
        top: 50%;
        left: 50%;
        margin-top: -${cfg.size / 2}px;
        margin-left: -${cfg.size / 2}px;
        border: 1px solid rgba(212,175,55,${cfg.opacity});
        border-radius: 50%;
        transform: rotateX(72deg);
        animation: heroRingSpin ${cfg.duration}s linear ${cfg.delay}s infinite;
        pointer-events: none;
        z-index: 0;
      `;
      hero.appendChild(ring);
    });

    // Keyframes for ring spin
    if (!document.getElementById('ring-style')) {
      const style = document.createElement('style');
      style.id = 'ring-style';
      style.textContent = `
        @keyframes heroRingSpin {
          from { transform: rotateX(72deg) rotateZ(0deg); }
          to   { transform: rotateX(72deg) rotateZ(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ─────────────────────────────────────────
     10. ADMIN STATS — COUNT-UP ANIMATION
  ───────────────────────────────────────── */
  function initCountUp() {
    function countUp(el, target, duration) {
      if (!el) return;
      const start = 0;
      const startTime = performance.now();
      const isFloat = target !== Math.floor(target);

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (target - start) * eased;

        el.textContent = isFloat
          ? current.toFixed(1)
          : Math.round(current).toLocaleString();

        if (progress < 1) raf(update);
      }
      raf(update);
    }

    // Hook into admin tab open
    const originalATab = window.aTab;
    if (!originalATab) return;

    window.aTab = function (t) {
      originalATab(t);
      if (t === 'dash') {
        // Wait for renderDash to populate values, then animate them
        setTimeout(() => {
          const els = [
            { id: 'sd-orders', parse: parseInt },
            { id: 'sd-rev',    parse: v => parseInt(v.replace(/,/g, '')) },
            { id: 'sd-prods',  parse: parseInt },
            { id: 'sd-revs',   parse: parseInt },
            { id: 'cn-new',    parse: parseInt },
            { id: 'cn-proc',   parse: parseInt },
            { id: 'cn-ship',   parse: parseInt },
            { id: 'cn-deliv',  parse: parseInt },
          ];
          els.forEach(cfg => {
            const el = document.getElementById(cfg.id);
            if (el) {
              const val = cfg.parse(el.textContent) || 0;
              el.textContent = '0';
              countUp(el, val, 1000 + Math.random() * 400);
            }
          });
        }, 50);
      }
    };
  }

  /* ─────────────────────────────────────────
     11. INTERACTIVE 3D LOGO ORB
  ───────────────────────────────────────── */
  function initLogoOrb() {
    const orb = document.querySelector('.logo-orb');
    if (!orb) return;

    let angle = 0;

    // Continuous subtle rotation
    function spinOrb() {
      angle += 0.3;
      orb.style.transform = `
        perspective(100px)
        rotateY(${Math.sin(angle * Math.PI / 180) * 15}deg)
        rotateX(${Math.cos(angle * Math.PI / 180) * 8}deg)
      `;
      raf(spinOrb);
    }

    raf(spinOrb);
  }

  /* ─────────────────────────────────────────
     12. PRODUCT GRID — WAVE ENTRANCE
  ───────────────────────────────────────── */
  function initGridWave() {
    // Re-run tilt init when products are re-rendered
    const originalRenderProds = window.renderProds;
    if (!originalRenderProds) return;

    window.renderProds = function () {
      originalRenderProds();
      // Re-init tilt on newly rendered cards
      setTimeout(() => {
        initCardTilt();
        initRipple();
      }, 100);
    };
  }

  /* ─────────────────────────────────────────
     13. CATEGORY PILL — ACTIVE FLASH
  ───────────────────────────────────────── */
  function initCatPillEffects() {
    const originalFilterCat = window.filterCat;
    if (!originalFilterCat) return;

    window.filterCat = function (cat, el) {
      originalFilterCat(cat, el);

      // Flash active pill
      el.style.transform = 'perspective(300px) rotateX(-15deg) scale(1.1)';
      setTimeout(() => {
        el.style.transform = '';
      }, 300);

      // Animate cards out/in
      const cards = document.querySelectorAll('.product-card');
      cards.forEach((card, i) => {
        const show = !cat || card.dataset.cat === cat;
        if (show) {
          card.style.animation = 'none';
          card.style.opacity = '0';
          card.style.transform = 'perspective(600px) rotateX(15deg) translateY(30px) scale(0.95)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.175,0.885,0.32,1.275)';
            card.style.opacity = '1';
            card.style.transform = '';
          }, i * 60 + 50);
        }
      });
    };
  }

  /* ─────────────────────────────────────────
     14. TOAST — DISMISS ON CLICK
  ───────────────────────────────────────── */
  function initToastEnhance() {
    const originalToast = window.toast;
    if (!originalToast) return;

    window.toast = function (msg) {
      const n = document.createElement('div');
      n.className = 'toast';
      n.textContent = msg;
      n.style.cursor = 'pointer';
      n.title = 'Click to dismiss';
      document.body.appendChild(n);

      let removed = false;

      function remove() {
        if (removed) return;
        removed = true;
        n.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => n.remove(), 300);
      }

      n.addEventListener('click', remove);
      setTimeout(remove, 3500);
    };
  }

  /* ─────────────────────────────────────────
     15. DETAIL PAGE IMAGE — ZOOM ON CLICK
  ───────────────────────────────────────── */
  function initDetailImageZoom() {
    document.addEventListener('click', e => {
      const img = e.target.closest('#d-img');
      if (!img) return;

      // Toggle zoom
      if (img.dataset.zoomed === 'true') {
        img.dataset.zoomed = 'false';
        img.style.transform = '';
        img.style.cursor = 'zoom-in';
        img.style.zIndex = '';
      } else {
        img.dataset.zoomed = 'true';
        img.style.transform = 'scale(1.5) translateZ(50px)';
        img.style.cursor = 'zoom-out';
        img.style.zIndex = '5';
        img.style.transition = 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275)';
      }
    });
  }

  /* ─────────────────────────────────────────
     16. SEARCH BAR — 3D SLIDE DOWN
  ───────────────────────────────────────── */
  function initSearchBar3D() {
    const originalToggle = window.toggleSearch;
    if (!originalToggle) return;

    window.toggleSearch = function () {
      const bar = document.getElementById('search-bar');
      const isHidden = !bar.style.display || bar.style.display === 'none';

      if (isHidden) {
        bar.style.display = 'block';
        bar.style.transform = 'perspective(600px) rotateX(-20deg) translateY(-20px)';
        bar.style.opacity = '0';
        bar.style.transition = 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.3s ease';

        raf(() => {
          raf(() => {
            bar.style.transform = 'perspective(600px) rotateX(0deg) translateY(0)';
            bar.style.opacity = '1';
          });
        });

        setTimeout(() => document.getElementById('search-in').focus(), 100);
      } else {
        bar.style.transform = 'perspective(600px) rotateX(-10deg) translateY(-10px)';
        bar.style.opacity = '0';
        setTimeout(() => { bar.style.display = 'none'; }, 300);
      }
    };
  }

  /* ─────────────────────────────────────────
     INIT — fire all on DOM ready
  ───────────────────────────────────────── */
  function init() {
    initHeaderScroll();
    initCardTilt();
    initHeroParallax();
    initMagneticButtons();
    initScrollReveal();
    initCursorTrail();
    initDetailPageTransition();
    initRipple();
    initHeroRings();
    initCountUp();
    initLogoOrb();
    initGridWave();
    initCatPillEffects();
    initToastEnhance();
    initDetailImageZoom();
    initSearchBar3D();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already ready
    init();
  }

})();
