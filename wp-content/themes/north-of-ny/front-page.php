<?php get_header(); ?>
<div id="primary" class="content-area">
	<main id="main" class="site-main" role="main">

    <?php
    $args = array(
      'post_type' => 'homepage',
      'post_status' => 'publish',
    );
    $query = new WP_Query( $args );
    if ($query->have_posts() ) {
      while ($query->have_posts() ) { 
        $query->the_post();
        ?><div class="home__block"><?php
        get_template_part('partials/home/home', get_field('post_type'));
        ?></div><?php
      }
    }?>
  </main>
</div>

<?php get_footer(); ?>
