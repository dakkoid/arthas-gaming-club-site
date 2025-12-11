// Плавная прокрутка до секции
function setupSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          closeMenu();
        }
      }
    });
  });
}

// Бургер-меню
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav');

function toggleMenu() {
  const isOpen = nav.classList.toggle('nav--open');
  burger.setAttribute('aria-expanded', String(isOpen));
}

function closeMenu() {
  nav.classList.remove('nav--open');
  burger.setAttribute('aria-expanded', 'false');
}

function setupBurger() {
  if (!burger || !nav) return;
  burger.addEventListener('click', toggleMenu);
  nav.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

// Валидация формы и модальное окно
const form = document.getElementById('booking-form');
const modal = document.getElementById('success-modal');
const modalOverlay = modal?.querySelector('.modal__overlay');
const modalClose = modal?.querySelector('.modal__close');

function showError(input, message) {
  const errorEl = input.parentElement.querySelector('.form__error');
  input.classList.add('input--error');
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function clearError(input) {
  const errorEl = input.parentElement.querySelector('.form__error');
  input.classList.remove('input--error');
  if (errorEl) {
    errorEl.textContent = '';
  }
}

function validateForm() {
  let isValid = true;
  if (!form) return false;

  const requiredFields = ['name', 'phone', 'date', 'time', 'tariff'];
  requiredFields.forEach((field) => {
    const input = form.elements.namedItem(field);
    if (!(input instanceof HTMLInputElement || input instanceof HTMLSelectElement)) return;
    if (!input.value.trim()) {
      showError(input, 'Поле обязательно');
      isValid = false;
    } else {
      clearError(input);
    }
  });

  const phone = form.elements.namedItem('phone');
  if (phone instanceof HTMLInputElement && phone.value.trim().length < 10) {
    showError(phone, 'Телефон должен содержать не менее 10 символов');
    isValid = false;
  }

  return isValid;
}

function resetForm() {
  form?.reset();
  form?.querySelectorAll('.form__error').forEach((el) => (el.textContent = ''));
  form?.querySelectorAll('.input--error').forEach((input) => input.classList.remove('input--error'));
}

function openModal() {
  if (!modal) return;
  modal.classList.add('modal--active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('modal--active');
  modal.setAttribute('aria-hidden', 'true');
}

function setupModal() {
  modalClose?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}

function handleFormSubmit(event) {
  event.preventDefault();
  if (!form) return;

  if (validateForm()) {
    openModal();
    resetForm();
  }
}

function setupForm() {
  if (!form) return;
  form.addEventListener('submit', handleFormSubmit);

  form.querySelectorAll('input, select, textarea').forEach((input) => {
    input.addEventListener('input', () => clearError(input));
  });
}

// Анимации появления
function setupAnimations() {
  const animatedBlocks = document.querySelectorAll('.animate');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  animatedBlocks.forEach((block) => observer.observe(block));
}

// Подсветка активного пункта меню
function setupActiveNav() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  if (!sections.length || !navLinks.length) return;

  const map = new Map();
  navLinks.forEach((link) => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) map.set(id, link);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('id');
        if (!id) return;

        const link = map.get(id);
        if (!link) return;

        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('nav__link--active'));
          link.classList.add('nav__link--active');
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((section) => observer.observe(section));
}

// Кнопка наверх
function setupBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  function onScroll() {
    if (window.scrollY > 400) {
      btn.classList.add('back-to-top--visible');
    } else {
      btn.classList.remove('back-to-top--visible');
    }
  }

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', onScroll);
  onScroll();
}

// Инициализация после загрузки DOM
function init() {
  setupSmoothScroll();
  setupBurger();
  setupForm();
  setupModal();
  setupAnimations();
  setupActiveNav();
  setupBackToTop();
}

document.addEventListener('DOMContentLoaded', init);
