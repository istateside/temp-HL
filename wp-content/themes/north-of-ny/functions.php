<?php
add_filter('show_admin_bar', '__return_false');
$labels = array(
  'name'               => _x( 'Homepage Posts', 'post type general name' ),
  'singular_name'      => _x( 'Homepage Post', 'post type singular name' ),
  'add_new'            => _x( 'Add New', 'post' ),
  'add_new_item'       => __( 'Add New Post' ),
  'edit_item'          => __( 'Edit Post' ),
  'new_item'           => __( 'New Post' ),
  'all_items'          => __( 'All Homepage Posts' ),
  'parent_item_colon'  => '',
  'menu_name'          => 'Homepage'
);
$args = array(
  'labels'        => $labels,
  'description'   => 'Posts which will display on the front page of the site',
  'public'        => true,
  'menu_position' => 5,
  'supports'      => array( 'title', 'editor',),
  'taxonomies'    => array( /*'category', */ 'post_tag'),
  'has_archive'   => true,
  'rewrite'       => array('slug' => 'travel')
);
register_post_type( 'homepage', $args );
?>