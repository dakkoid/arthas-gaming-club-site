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

// Инициализация после загрузки DOM
function init() {
  setupSmoothScroll();
  setupBurger();
  setupForm();
  setupModal();
  setupAnimations();
}

document.addEventListener('DOMContentLoaded', init);
