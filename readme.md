# Houlihan Lawrence - North of NYC

## The short version
SASS, ES2015, Autoprefixer, Webpack and NPM.
Pull down the project, run `npm install` from the `[project-root]/wp-content/themes/north-of-ny` directory to install all needed packages.
`npm run build` to compile the application.js file for the project, with a `--watch` looking at your files for changes.
`npm run dev` to start the webpack dev server with Hot Module Replacement for livereload functionality. Might need to read into that functionality, but point the script tag loading the bundled application.js file to `localhost:8080/dist/application.js` instead of `.../wp-content/themes/north-of-ny/dist/application.js` to get HMR working. If that's gibberish to you, just use `npm run build`. No need to use Webpack Dev Server if you don't have the time to figure it out (but it's pretty nice so check it out!)

## Development
North of New York is built with a number of packages, organized with NPM. Most of these are standard in our toolset (SASS, Icomoon, ES2015), and should be familiar to you already. If not, seek out documentation or another team member for some guidance. North of NYC uses Webpack as its build tool. If you've used Gulp or Grunt before, Webpack shouldn't be difficult to get your head around.

Webpack's configuration is managed in the `webpack.config.js` file. You shouldn't need to modify this file, but feel free to poke around and tweak things as needed. As a broad summary, Webpack works just like Grunt/Gulp in that it takes a bunch of files and filetypes that standard browsers cannot work with, runs a series of tasks on those files, and ultimately spits out standard CSS and JavaScript that the client's browser can work with. Webpack differs in that it works as a **module loader** out of the box. This functionality, combined with the Babel ES2015 transpiler, allows you to use the module export/import patterns that have become fairly standard in large projects. Webpack takes this a step further, and allows you to `require` files beyond JavaScript, including images, fonts, CSS- anything, really. This gets you one bundled file (`dist/application.js` in our case) that handles most of the styling, JavaScript and content that you might be using.

In development, you'll probably want to use Webpack's dev server, which includes support for Hot Module Replacement, which is very similar to LiveReload, if you're familiar with that. Webpack will bundle up your application, and the dev server then serves the bundled file on a small server, accessible at `localhost:8080/dist/application.js` in our project. When webpack detects changes, it recompiles your bundle, and the dev server immediately applies the changes in your browser window- No refresh required. For changes that the dev server cannot handle with a simple update, it'll trigger a full page refresh, just like LiveReload.


**NOTE**
The below paragraph is inaccurate at the moment. The external stylesheet has not been configured, and must be done ASAP. The webpack config needs some tweaking so that it'll extract styles based on the detected environment. High priority for launch- Not an immediate priority for development.
**NOTE**

In the beta and production environments, we obviously don't need this functionality. Furthermore, the CSS-loader that Webpack uses to apply CSS via JavaScript isn't ideal for live environments, because of the brief flash of unstyled content that the user sees before the JavaScript file applies our styles. In a live environment, we want things to work like a typical website, with an external stylesheet that gets loaded in the `<head>` tag, so the user doesn't see the naked skeleton before the styling is applied. For this, we use a slightly different process in Webpack, using the ExtractTextPlugin to pull all of the CSS into its own file, separate from the `dist/application.js` file.

We're using SASS for our stylesheets, with Autoprefixer running as a PostCSS plugin (The original plugin has been deprecated in favor of this method. It works the same, ultimately. Write your styles without worrying about vendor prefixes- They'll be added in at compilation time). Our JavaScript is run through the Babel ES2015 transpiler, allowing you to use any ES2015 features you'd like. You'll see that most of the JS for this project is using ES2015's `class` syntax and `export` functionality. It should be easy to see how it works, but reach out to me (Kevin / @istateside) or your friend Google for more insight if necessary.

