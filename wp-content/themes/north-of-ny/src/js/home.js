import $ from 'jquery';
import throttle from 'lodash.throttle';

export default class Home {
  
  constructor() {
    this.isAnimating = true;
    this.titleEl = document.getElementById('js-home-title');
    
    $(document).on('scroll', throttle(this.onScroll.bind(this), 100));
    
    setTimeout(() => {
      this.titleEl.style.opacity = "";
      this.titleEl.classList.add("-is-visible");
      
      setTimeout(() => {
        this.titleEl.classList.add("-is-done-fading");
        this.isAnimating = false;
      }, 2000);
      
    }, 1000);
  }
  
  onScroll(e) {
    const distFromTop = this.titleEl.offsetTop - $(window).scrollTop();
    const scrolledHalfway = distFromTop <= 0 
    document.body.classList.toggle("-is-scrolled", scrolledHalfway);
    if (this.isAnimating) return false;
    
    let newOpacity = scrolledHalfway ? 0 : (distFromTop / this.titleEl.offsetTop);
    newOpacity = Math.ceil(newOpacity * 100) / 100;
    this.titleEl.style.opacity = newOpacity;
  }
}