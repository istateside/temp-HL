import $ from 'jquery';

export default class Header {
  constructor() {
    this.el = document.getElementById('main-header');

    this.setListeners();
  }

  setListeners() {
    $(document).on("click", '.js-header-toggle', this.toggleMobileHeader.bind(this));
  }

  toggleMobileHeader() {
    if (window.innerWidth < 1100) {
      this.el.classList.toggle('-mobile-nav-visible');
    }
  }
}