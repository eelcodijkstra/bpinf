<?php
/*
Plugin Name: Betapartners
Plugin URI: 
Description: Extra functions for Betapartners website; assumes Pods plugin.
Version: 0.1
Author: EJD
Author URI: 
License: 
License URI: 
*/

/**
 * Register the JS script(s)
 */
function bpinf_register_scripts() {
	wp_register_script(
		'bpinf-test-script',                      // Unique name
		plugin_dir_url( __FILE__ ) . 'public/js/bpinf-test.js',   // URL to the file
		array(),                                  // Dependencies
		'0.1.0',                                  // Version
		true                                      // Output in Footer
	);
	wp_register_script(
		'bpinf-presentie-script',                      // Unique name
		plugin_dir_url( __FILE__ ) . 'public/js/bpinf-presentie.js',   // URL to the file
		array(),                                  // Dependencies
		'0.1.0',                                  // Version
		true                                      // Output in Footer
	);
	wp_register_script(
		'bpinf-contact-script',                      // Unique name
		plugin_dir_url( __FILE__ ) . 'public/js/bpinf-contact.js',   // URL to the file
		array(),                                  // Dependencies
		'0.1.0',                                  // Version
		true                                      // Output in Footer
	);
	
}

add_action( 'init', 'bpinf_register_scripts' );

/**
 * add inline JS for site-dependent data
 */
function bpinf_add_inline_js() {
	$inline = 'var bpinf_json_url = "' . site_url() . '/wp-json/wp/v2' . '"; ';
	$inline = $inline . 'var bpinf_user_id = '. get_current_user_id() . ';'; 
	wp_add_inline_script( 'bpinf-test-script' , $inline, 'before' );
}

/**
 * Enqueue the JS script(s)
 */
function bpinf_enqueue_scripts() {
    if (is_page ( 'Presentielijst' )) {
		wp_enqueue_script( 'bpinf-presentie-script' );
    } else if (is_page( 'Test' )) {
		$bpinf_nonce = wp_create_nonce( 'bpinf_nonce' );
        wp_localize_script( 
        	'bpinf-contact-script',
        	'bpinf_data',
        	array( 
        		'ajaxurl' => admin_url( 'admin-ajax.php' ),
        		'nonce' => $bpinf_nonce
        	)
        );
		wp_enqueue_script( 'bpinf-test-script' );
		wp_enqueue_script( 'bpinf-contact-script' );
	}
//	bpinf_add_inline_js();
}

add_action( 'wp_enqueue_scripts', 'bpinf_enqueue_scripts' );

add_action( 'wp_ajax_bpinf_action', 'bpinf_ajax_handler' );
function bpinf_ajax_handler() {
	
	check_ajax_referer( 'bpinf_nonce' );
// sanitize the following components!	
	$pod = $_POST[ 'pod' ];
	$field = $_POST[ 'field' ];
	$value = $_POST[ 'value' ];
	
	$params = array(
	    // Be sure to sanitize ANY strings going here
	    'where'=> $field . ' = "' . $value . '"'
    ); 
    
    $mypod = pods( $pod );
    $mypod->find( $params );
    
    $ids = array();
    while ( $mypod->fetch() ) {
    	$ids[] = $mypod->field( 'id' );
	}    	
    
	wp_send_json( array(
	  'echopod' => $pod . '!?!',
	  'ids' => $ids
	));
}

