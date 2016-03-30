<!doctype html>
<html class="no-js">
  <head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <title><?php bloginfo('name'); ?></title>

    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <meta name="description" content="<?php bloginfo('description'); ?>">
    
    <?php wp_head(); ?>

  </head>
  <body>
    <?php $headerClass = is_front_page() || is_home() ? 'header--home' : NULL; ?>
    <header class="header header--main js-header <?php echo $headerClass ?>" id='main-header'>
      <button class='header__hamburger hamburger js-header-toggle -max-size-tablet' type='button' aria-label='Menu' aria-controls='navigation'>
        <span class='hamburger__inner'></span>
      </button>
      <div class="header__inner-wrap">
        <div class='header__nav header__nav--left header__nav--logo'>
          <a href="/">NORTH OF NY</a>
        </div>
        
        <nav class='header__nav header__nav--center header__nav--main mobile-nav'>
          <ul class="nav__list nav__list--horizontal">
            <li class="nav__li">
              <a class="nav__link">The Equestrian</a>
            </li>
            <li class="nav__li">
              <a href="/villagers/the-villager" class="nav__link">The Villager</a>
            </li>
            <li class="nav__li">
              <a class="nav__link">The Trailblazer</a>
            </li>
            <li class="nav__li">
              <a class="nav__link">The Waterfronter</a>
            </li>
            <li class="nav__li">
              <a class="nav__link">The Locavore</a>
            </li>
            <li class="nav__li">
              <a class="nav__link">The Cosmopolitan</a>
            </li>
          </ul>
          <ul class="-max-size-tablet nav__list nav__list--secondary">
            <li class="nav__li nav__li--secondary"><a class="nav__link nav__link--secondary" href="/">MAP</a></li>
            <li class="nav__li nav__li--secondary"><a class="nav__link nav__link--secondary" href="/">PHOTOS</a></li>
          </ul>
        </nav>
        
        <div class='header__nav header__nav--right'>
          <a href="/">MAP</a><a href="/">PHOTOS</a>
        </div>
      </div>
      <div class="header__underlay -max-size-tablet js-header-toggle"></div>
    </header>
    
    <?php get_template_part('partial', 'contact'); ?>