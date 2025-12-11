// Основной JS без сборщиков и модулей. Все функции независимы и переиспользуемые.
(function() {
  // Кэш для таймеров и прочих интервалов, чтобы чистить при смене страниц в роутере.
  var intervals = [];

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

  // -------- Прелоадер ---------
  function initPreloader() {
    var preloader = qs('#preloader');
    if (!preloader) return;

    // Добавляем небольшую искусственную задержку, чтобы анимация была заметна.
    window.addEventListener('load', function() {
      setTimeout(function() {
        preloader.classList.add('is-hidden');
        setTimeout(function() {
          preloader.style.display = 'none';
        }, 400);
      }, 500);
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
      if (link.href === window.location.href || link.getAttribute('href') === window.location.pathname.split('/').pop()) {
        link.classList.add('is-active');
      }
    });

    var currentTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(currentTheme);

    if (themeToggle) {
      themeToggle.addEventListener('click', function() {
        var next = document.body.classList.contains('theme-light') ? 'dark' : 'light';
        applyTheme(next);
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

  // Общие модалки: закрытие по клику на фон или кнопку
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

  // -------- Страница турниров ---------
  function initTournamentsPage() {
    var container = qs('#tournamentsContainer');
    if (!container || !window.TOURNAMENTS) return;

    container.innerHTML = TOURNAMENTS.map(function(item) {
      return '<article class="card tournament js-animate" data-id="' + item.id + '">' +
        '<div class="card-header">' +
        '<span class="badge">' + item.tag + '</span>' +
        '<span class="game">' + item.game + '</span>' +
        '</div>' +
        '<h3>' + item.title + '</h3>' +
        '<p class="meta">' + new Date(item.date).toLocaleString('ru-RU', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }) + '</p>' +
        '<p class="description">' + item.description + '</p>' +
        '<p class="prize">' + item.prize + '</p>' +
        '<p class="format">' + item.format + '</p>' +
        '<button class="btn btn-ghost register-btn" data-id="' + item.id + '">Зарегистрироваться</button>' +
        '</article>';
    }).join('');

    initCountdown();
    initRegisterModal();
  }

  function initCountdown() {
    var timerEl = qs('#countdown');
    if (!timerEl) return;

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
      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var minutes = Math.floor((diff / (1000 * 60)) % 60);
      var seconds = Math.floor((diff / 1000) % 60);
      timerEl.textContent = days + 'д ' + hours + 'ч ' + minutes + 'м ' + seconds + 'с';
    }

    updateTimer();
    intervals.push(setInterval(updateTimer, 1000));
  }

  function initRegisterModal() {
    var modal = qs('#modal');
    var form = qs('#registrationForm');
    if (!modal || !form) return;

    qsa('.register-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        modal.classList.add('is-open');
        form.querySelector('[name="tournament"]').value = btn.getAttribute('data-id');
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

  // -------- Кафе ---------
  function initCafePage() {
    var menuContainer = qs('#menuItems');
    var filterContainer = qs('#menuFilters');
    var orderList = qs('#orderList');
    var orderTotal = qs('#orderTotal');
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
            items.push({ category: cat.category, icon: cat.icon, title: item.title, price: item.price, tag: item.tag });
          });
        }
      });
      menuContainer.innerHTML = items.map(function(item) {
        return '<article class="card food js-animate">' +
          '<div class="card-image" aria-hidden="true"></div>' +
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
        return;
      }
      orderList.innerHTML = cart.map(function(item) {
        return '<li>' + item.title + ' — ' + item.price + ' ₽</li>';
      }).join('');
      var sum = cart.reduce(function(acc, item) { return acc + item.price; }, 0);
      orderTotal.textContent = sum + ' ₽';
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

  // -------- Страница клуба ---------
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
        setTimeout(function() {
          if (modal) modal.classList.remove('is-open');
        }, 1400);
        form.reset();
      });
    }
  }

  // -------- Контакты ---------
  function initContactsPage() {
    var form = qs('#feedbackForm');
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
        form.querySelector('.form-message').textContent = 'Сообщение отправлено (фиктивно).';
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

  // -------- Общий init для каждой загрузки/смены контента ---------
  function initPageFeatures() {
    initHeader();
    initScrollAnimations();
    initBackToTop();
    initParallax();
    initModalClose();
    initTournamentsPage();
    initCafePage();
    initClubPage();
    initContactsPage();
  }

  // -------- Запуск ---------
  document.addEventListener('DOMContentLoaded', function() {
    initPreloader();
    initRouter();
    initPageFeatures();
  });
})();
