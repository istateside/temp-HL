<div class="video-wrapper" id='js-home-video'>
  <video class="-is-active video video--fullwidth" autoplay loop muted poster="<?php echo get_field('video_poster_image'); ?>">
    <source src="<?php echo get_field('homepage_video'); ?>"></source>
  </video>
  <div class="video__title" id='js-home-title' style='opacity:0;'>
    <h3 class="video__h3 video__h3--italic"><?php echo get_field('title'); ?></h3>
    <img class="img--has-retina main-title video__logo" src="<?php echo get_bloginfo('template_url'); ?>/src/img/north-logo-white.png" />
  </div>
  <button aria-role='navigation' class="js-scroll-down video__scroll-trigger"></button>
</div>

