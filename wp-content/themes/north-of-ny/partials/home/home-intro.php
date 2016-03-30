<div class="video-wrapper">
  <video class="video video--fullwidth" autoplay loop muted poster="<?php echo get_field('video_poster_image'); ?>">
    <source src="<?php echo get_field('homepage_video'); ?>"></source>
  </video>
  <div class="video__title">
    <h3 class="video__h3 video__h3--italic"><?php echo get_field('title'); ?></h3>
    <h1 class="video__h1 main-title">North <span class="main-title__span">of</span> NYC</h1>
  </div>
  <button aria-role='navigation' class="js-scroll-down video__scroll-trigger"></button>
</div>