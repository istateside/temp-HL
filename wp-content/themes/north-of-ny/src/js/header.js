import $ from 'jquery';

export default class Header {
  constructor() {
    this.el = document.getElementById('main-header');

    this.setListeners();
  }

  setListeners() {
    $(document).on("click", '.js-header-toggle', this.toggleMobileHeader.bind(this));
    $(document).on("click", '.js-contact-toggle', this.toggleContact.bind(this));
    $(document).on("click", this.hideContact);
  }

  toggleMobileHeader() {
    if (window.innerWidth < 1100) {
      this.el.classList.toggle('-mobile-nav-visible');
    }
  }

  toggleContact(e) {
    e.preventDefault();
    document.getElementById('contact').classList.toggle('-is-visible');
  }

  hideContact(e) {
    const $target = $(e.target);
    if ($target.closest('#contact').length === 0 && !$target.is("#contact")) {
      document.getElementById('contact').classList.remove('-is-visible');
    }
  }
}