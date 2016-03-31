import 'scss/base';
import $ from 'jquery';
import Header from 'js/header';
import Home from 'js/home';

window.App = {
  header: new Header(),
}

$(document).on('ready', function() {
  App.Home = new Home();
});