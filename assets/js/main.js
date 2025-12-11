// Основной JS без сборщиков и модулей. Файл отвечает за общие эффекты, полу-SPA роутер и
// интерактив на страницах (галерея, слайдер, табы, меню кафе, турниры).
(function() {
  var intervals = [];
  var resizeHandlers = [];

  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }
  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }
  function clearIntervals() {
    intervals.forEach(clearInterval);
    intervals = [];
  }
  function clearResizeHandlers() {
    resizeHandlers.forEach(function(handler) { window.removeEventListener('resize', handler); });
    resizeHandlers = [];
  }

  // -------- Прелоадер ---------
  function initPreloader() {
    var preloader = qs('#preloader');
    if (!preloader) return;
    window.addEventListener('load', function() {
      setTimeout(function() {
        preloader.classList.add('is-hidden');
        setTimeout(function() { preloader.style.display = 'none'; }, 450);
      }, 520);
    });
  }

  // -------- Header: бургер, активные ссылки, тема ---------
  function initHeader() {
    var burger = qs('#burger');
    var nav = qs('.nav');
    var themeToggle = qs('#themeToggle');

    if (burger && nav) {
      burger.addEventListener('click', function() {
        nav.classList.toggle('nav-open');
        burger.classList.toggle('is-active');
      });
    }

    qsa('.nav a').forEach(function(link) {
      var isActive = link.pathname === window.location.pathname || link.getAttribute('href') === window.location.pathname.split('/').pop();
      link.classList.toggle('is-active', isActive);
    });

    var currentTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(currentTheme);

    if (themeToggle) {
      themeToggle.textContent = document.body.classList.contains('theme-light') ? '☀' : '☾';
      themeToggle.addEventListener('click', function() {
        var next = document.body.classList.contains('theme-light') ? 'dark' : 'light';
        applyTheme(next);
        themeToggle.textContent = next === 'light' ? '☀' : '☾';
        localStorage.setItem('theme', next);
      });
    }
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }

  // -------- Общие модалки ---------
  function initModalClose() {
    var modal = qs('#modal');
    if (!modal) return;
    modal.addEventListener('click', function(e) {
      if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
        modal.classList.remove('is-open');
      }
    });
  }

  // -------- IntersectionObserver для анимаций появления ---------
  function initScrollAnimations() {
    var targets = qsa('.js-animate');
    if (!('IntersectionObserver' in window) || !targets.length) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    targets.forEach(function(el) { observer.observe(el); });
  }

  // -------- Кнопка наверх ---------
  function initBackToTop() {
    var btn = qs('#backToTop');
    if (!btn) return;

    window.addEventListener('scroll', function() {
      if (window.scrollY > 600) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // -------- Параллакс на главной ---------
  function initParallax() {
    var layerContainer = qs('.parallax');
    if (!layerContainer) return;
    var layers = qsa('[data-depth]', layerContainer);

    function moveLayers(x, y) {
      layers.forEach(function(layer) {
        var depth = parseFloat(layer.getAttribute('data-depth')) || 0;
        var translateX = x * depth;
        var translateY = y * depth;
        layer.style.transform = 'translate3d(' + translateX + 'px, ' + translateY + 'px, 0)';
      });
    }

    document.addEventListener('mousemove', function(e) {
      var x = (window.innerWidth / 2 - e.clientX) / 60;
      var y = (window.innerHeight / 2 - e.clientY) / 60;
      moveLayers(x, y);
    });

    document.addEventListener('scroll', function() {
      var scrollY = window.scrollY / 30;
      moveLayers(0, scrollY);
    });
  }

  // -------- Лайтбокс для галерей ---------
  function initGalleryLightbox() {
    var items = qsa('.gallery-item');
    if (!items.length) return;
    var overlay = qs('#lightbox');
    if (!overlay) return;
    var imageEl = qs('#lightboxImage');
    var counterEl = qs('#lightboxCounter');
    var currentIndex = 0;
    var currentGroup = '';

    function getGroupItems(group) {
      return qsa('.gallery-item[data-gallery="' + group + '"]');
    }

    function open(index, group) {
      currentGroup = group;
      var groupItems = getGroupItems(group);
      if (!groupItems.length) return;
      currentIndex = index;
      var src = groupItems[currentIndex].getAttribute('data-src');
      imageEl.setAttribute('src', src);
      counterEl.textContent = (currentIndex + 1) + ' / ' + groupItems.length;
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function next() {
      var groupItems = getGroupItems(currentGroup);
      currentIndex = (currentIndex + 1) % groupItems.length;
      open(currentIndex, currentGroup);
    }

    function prev() {
      var groupItems = getGroupItems(currentGroup);
      currentIndex = (currentIndex - 1 + groupItems.length) % groupItems.length;
      open(currentIndex, currentGroup);
    }

    items.forEach(function(item, index) {
      item.addEventListener('click', function() {
        var group = item.getAttribute('data-gallery');
        var groupItems = getGroupItems(group);
        var idx = groupItems.indexOf(item);
        open(idx, group);
      });
    });

    overlay.addEventListener('click', function(e) {
      if (e.target.classList.contains('lightbox') || e.target.classList.contains('lightbox__close')) {
        close();
      }
    });

    qs('#lightboxNext').addEventListener('click', function(e) { e.stopPropagation(); next(); });
    qs('#lightboxPrev').addEventListener('click', function(e) { e.stopPropagation(); prev(); });
    document.addEventListener('keydown', function(e) {
      if (!overlay.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });
  }

  // -------- Слайдер на странице клуба ---------
  function initClubSlider() {
    var slider = qs('.club-slider');
    var track = qs('.club-slider__track');
    var slides = qsa('.club-slider__slide');
    var prevBtn = qs('[data-slider-prev]');
    var nextBtn = qs('[data-slider-next]');
    if (!slider || !track || !slides.length) return;

    var index = 0;
    function getVisible() {
      if (window.innerWidth >= 1100) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function setWidths() {
      var visible = getVisible();
      var slideWidth = (slider.clientWidth - 20 * (visible - 1)) / visible;
      slides.forEach(function(slide) {
        slide.style.width = slideWidth + 'px';
      });
      move();
    }

    function move() {
      var visible = getVisible();
      var maxIndex = Math.max(0, slides.length - visible);
      index = Math.min(index, maxIndex);
      var offset = index * (slides[0].clientWidth + 20);
      track.style.transform = 'translateX(-' + offset + 'px)';
    }

    var resizeHandler = function() {
      setWidths();
    };
    window.addEventListener('resize', resizeHandler);
    resizeHandlers.push(resizeHandler);

    setWidths();

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', function() {
        index = Math.max(0, index - 1);
        move();
      });
      nextBtn.addEventListener('click', function() {
        index = Math.min(slides.length - getVisible(), index + 1);
        move();
      });
    }
  }

  // -------- Табы тарифов на клубной странице ---------
  function initTariffTabs() {
    var tabButtons = qsa('[data-tab-target]');
    var panes = qsa('.tariff-pane');
    if (!tabButtons.length || !panes.length) return;

    tabButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var target = btn.getAttribute('data-tab-target');
        tabButtons.forEach(function(b) { b.classList.remove('is-active'); });
        panes.forEach(function(pane) { pane.classList.toggle('is-active', pane.getAttribute('data-tab') === target); });
        btn.classList.add('is-active');
      });
    });
  }

  // -------- Страница турниров: карточки, таймер, модалка ---------
  function initTournamentsPage() {
    var container = qs('#tournamentsContainer');
    if (!container || !window.TOURNAMENTS) return;

    container.innerHTML = TOURNAMENTS.map(function(item) {
      return '<article class="card card--accent tournament js-animate" data-id="' + item.id + '">' +
        '<div class="tournament__image" style="background-image:url(' + item.cover + ')"></div>' +
        '<div class="card-header">' +
        '<span class="badge">' + item.tag + '</span>' +
        '<span class="game">' + item.game + '</span>' +
        '</div>' +
        '<h3>' + item.title + '</h3>' +
        '<p class="meta">' + new Date(item.date).toLocaleString('ru-RU', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }) + '</p>' +
        '<p class="description">' + item.description + '</p>' +
        '<p class="prize">' + item.prize + '</p>' +
        '<p class="format">' + item.format + '</p>' +
        '<button class="btn btn-ghost register-btn" data-id="' + item.id + '" data-title="' + item.title + '">Зарегистрироваться</button>' +
        '</article>';
    }).join('');

    initCountdown();
    initTournamentImagesAndModal();
  }

  function initCountdown() {
    var timerEl = qs('#countdown');
    if (!timerEl || !window.TOURNAMENTS) return;

    function render(diff) {
      var parts = ['дней', 'часов', 'минут', 'секунд'];
      var labels = ['D', 'H', 'M', 'S'];
      var values = [
        Math.floor(diff / (1000 * 60 * 60 * 24)),
        Math.floor((diff / (1000 * 60 * 60)) % 24),
        Math.floor((diff / (1000 * 60)) % 60),
        Math.floor((diff / 1000) % 60)
      ];
      timerEl.innerHTML = values.map(function(val, idx) {
        return '<div class="countdown__tile"><span class="countdown__value">' + String(val).padStart(2, '0') + '</span><span class="countdown__label">' + parts[idx] + '</span></div>';
      }).join('');
      timerEl.classList.remove('pulse');
      void timerEl.offsetWidth;
      timerEl.classList.add('pulse');
    }

    function updateTimer() {
      var upcoming = TOURNAMENTS.map(function(t) { return new Date(t.date); })
        .filter(function(date) { return date > new Date(); })
        .sort(function(a, b) { return a - b; })[0];
      if (!upcoming) {
        timerEl.textContent = 'Новые турниры скоро появятся';
        return;
      }

      var diff = upcoming - new Date();
      if (diff <= 0) {
        timerEl.textContent = 'Турнир уже начался';
        return;
      }
      render(diff);
    }

    updateTimer();
    intervals.push(setInterval(updateTimer, 1000));
  }

  function initTournamentImagesAndModal() {
    var modal = qs('#modal');
    var form = qs('#registrationForm');
    var modalTitle = modal ? qs('.modal-title', modal) : null;
    if (!modal || !form) return;

    qsa('.register-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = Number(btn.getAttribute('data-id'));
        var tournament = TOURNAMENTS.find(function(t) { return t.id === id; });
        modal.classList.add('is-open');
        if (modalTitle && tournament) {
          modalTitle.textContent = 'Заявка на ' + tournament.title;
          modal.querySelector('.modal-description').textContent = tournament.game + ' • ' + tournament.format;
        }
        form.querySelector('[name="tournament"]').value = tournament ? tournament.title : '';
      });
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]').value.trim();
      var nick = form.querySelector('[name="nick"]').value.trim();
      var contacts = form.querySelector('[name="contacts"]').value.trim();
      if (!name || !nick || contacts.length < 5) {
        form.querySelector('.form-message').textContent = 'Пожалуйста, заполните все поля корректно.';
        return;
      }
      form.querySelector('.form-message').textContent = 'Заявка отправлена (фиктивно).';
      setTimeout(function() { modal.classList.remove('is-open'); }, 1200);
      form.reset();
    });
  }

  // -------- Кафе: фильтры, картинки, мини-калькулятор ---------
  function initCafeMenuImagesAndCart() {
    var menuContainer = qs('#menuItems');
    var filterContainer = qs('#menuFilters');
    var orderList = qs('#orderList');
    var orderTotal = qs('#orderTotal');
    var orderCount = qs('#orderCount');
    var clearBtn = qs('#clearOrder');
    if (!menuContainer || !filterContainer || !window.CAFE_MENU) return;

    var currentCategory = 'Все';
    var cart = [];

    function renderFilters() {
      var categories = ['Все'].concat(CAFE_MENU.map(function(c) { return c.category; }));
      filterContainer.innerHTML = categories.map(function(cat) {
        return '<button class="chip" data-category="' + cat + '">' + cat + '</button>';
      }).join('');
      filterContainer.querySelector('[data-category="' + currentCategory + '"]').classList.add('is-active');
      qsa('.chip', filterContainer).forEach(function(btn) {
        btn.addEventListener('click', function() {
          currentCategory = btn.getAttribute('data-category');
          qsa('.chip', filterContainer).forEach(function(b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          renderMenu();
        });
      });
    }

    function renderMenu() {
      var items = [];
      CAFE_MENU.forEach(function(cat) {
        if (currentCategory === 'Все' || currentCategory === cat.category) {
          cat.items.forEach(function(item) {
            items.push({ category: cat.category, icon: cat.icon, title: item.title, price: item.price, tag: item.tag, image: cat.image });
          });
        }
      });
      menuContainer.innerHTML = items.map(function(item, idx) {
        return '<article class="card card--ghost food js-animate" data-item="' + item.title + '">' +
          '<div class="card-image card-image--cover" style="background-image:url(' + item.image + ')"></div>' +
          '<div class="card-content">' +
          '<div class="card-header">' + item.icon + ' ' + item.category + '</div>' +
          '<h3>' + item.title + '</h3>' +
          '<p class="tag">' + item.tag + '</p>' +
          '<div class="price-row">' +
          '<span class="price">' + item.price + ' ₽</span>' +
          '<button class="btn btn-ghost add-to-order" data-title="' + item.title + '" data-price="' + item.price + '">Добавить</button>' +
          '</div>' +
          '</div>' +
          '</article>';
      }).join('');

      qsa('.add-to-order').forEach(function(btn) {
        btn.addEventListener('click', function() {
          cart.push({ title: btn.getAttribute('data-title'), price: Number(btn.getAttribute('data-price')) });
          renderOrder();
        });
      });
      initScrollAnimations();
    }

    function renderOrder() {
      if (!orderList || !orderTotal) return;
      if (!cart.length) {
        orderList.innerHTML = '<li class="muted">Ещё ничего не выбрано</li>';
        orderTotal.textContent = '0 ₽';
        if (orderCount) orderCount.textContent = '0 позиций';
        return;
      }
      orderList.innerHTML = cart.map(function(item, idx) {
        return '<li data-item-ref="' + item.title + '">' + item.title + ' — ' + item.price + ' ₽</li>';
      }).join('');
      var sum = cart.reduce(function(acc, item) { return acc + item.price; }, 0);
      orderTotal.textContent = sum + ' ₽';
      if (orderCount) orderCount.textContent = cart.length + ' позиций';

      qsa('[data-item-ref]').forEach(function(li) {
        li.addEventListener('mouseenter', function() {
          var ref = li.getAttribute('data-item-ref');
          var card = qs('[data-item="' + ref + '"]');
          if (card) card.classList.add('is-highlighted');
        });
        li.addEventListener('mouseleave', function() {
          qsa('.is-highlighted').forEach(function(card) { card.classList.remove('is-highlighted'); });
        });
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        cart = [];
        renderOrder();
      });
    }

    renderFilters();
    renderMenu();
    renderOrder();
  }

  // -------- Страница клуба: FAQ + форма ---------
  function initClubPage() {
    var faqContainer = qs('#faq');
    if (faqContainer && window.FAQ_ITEMS) {
      faqContainer.innerHTML = FAQ_ITEMS.map(function(item) {
        return '<div class="accordion-item js-animate">' +
          '<button class="accordion-trigger" aria-expanded="false">' + item.question + '</button>' +
          '<div class="accordion-panel">' + item.answer + '</div>' +
          '</div>';
      }).join('');

      qsa('.accordion-trigger', faqContainer).forEach(function(btn) {
        btn.addEventListener('click', function() {
          var expanded = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', String(!expanded));
          btn.parentElement.classList.toggle('is-open');
        });
      });
    }

    var form = qs('#bookingForm');
    var modal = qs('#modal');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var name = form.querySelector('[name="name"]').value.trim();
        var phone = form.querySelector('[name="phone"]').value.trim();
        var date = form.querySelector('[name="date"]').value;
        var time = form.querySelector('[name="time"]').value;
        if (!name || phone.length < 7 || !date || !time) {
          form.querySelector('.form-message').textContent = 'Проверьте обязательные поля: имя, телефон, дата, время';
          return;
        }
        form.querySelector('.form-message').textContent = '';
        if (modal) {
          modal.classList.add('is-open');
          modal.querySelector('.modal-title').textContent = 'Бронь отправлена';
          modal.querySelector('.modal-description').textContent = 'Мы свяжемся с вами для подтверждения брони.';
        }
        setTimeout(function() { if (modal) modal.classList.remove('is-open'); }, 1400);
        form.reset();
      });
    }
  }

  // -------- Контакты ---------
  function initContactsPage() {
    var form = qs('#feedbackForm');
    var modal = qs('#modal');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var subject = form.querySelector('[name="subject"]').value.trim();
      var message = form.querySelector('[name="message"]').value.trim();
      var error = '';
      if (!name || !email || !subject || !message) {
        error = 'Все поля обязательны.';
      } else if (!email.includes('@') || !email.includes('.')) {
        error = 'Некорректный email.';
      }
      form.querySelector('.form-message').textContent = error;
      if (!error) {
        form.querySelector('.form-message').textContent = '';
        if (modal) {
          modal.classList.add('is-open');
          modal.querySelector('.modal-title').textContent = 'Сообщение отправлено';
          modal.querySelector('.modal-description').textContent = 'Мы ответим вам на указанную почту.';
          setTimeout(function() { modal.classList.remove('is-open'); }, 1400);
        }
        form.reset();
      }
    });
  }

  // -------- Полу-SPA роутер ---------
  function initRouter() {
    if (!window.history || !window.fetch) return;
    var main = qs('main');
    if (!main) return;

    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href');
      var isInternal = href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:');
      var sameHost = link.host === window.location.host;
      if (isInternal && sameHost && link.target !== '_blank') {
        e.preventDefault();
        navigate(href);
      }
    });

    window.addEventListener('popstate', function() {
      navigate(window.location.pathname, true);
    });
  }

  function navigate(url, isPop) {
    fetch(url)
      .then(function(res) { return res.text(); })
      .then(function(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var newMain = doc.querySelector('main');
        if (!newMain) return;
        clearIntervals();
        clearResizeHandlers();
        document.title = doc.title;
        qs('main').replaceWith(newMain);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (!isPop) history.pushState({}, '', url);
        resetActiveLinks();
        initPageFeatures();
      })
      .catch(function() {
        window.location.href = url;
      });
  }

  function resetActiveLinks() {
    qsa('.nav a').forEach(function(link) {
      link.classList.toggle('is-active', link.pathname === window.location.pathname);
    });
  }

  // -------- Общий init ---------
  function initPageFeatures() {
    initHeader();
    initScrollAnimations();
    initBackToTop();
    initParallax();
    initModalClose();
    initTournamentsPage();
    initCafeMenuImagesAndCart();
    initClubPage();
    initContactsPage();
    initGalleryLightbox();
    initClubSlider();
    initTariffTabs();
  }

  document.addEventListener('DOMContentLoaded', function() {
    initPreloader();
    initRouter();
    initPageFeatures();
  });
})();
