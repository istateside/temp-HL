/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(74);
	module.exports = __webpack_require__(75);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__resourceQuery) {var url = __webpack_require__(2);
	var SockJS = __webpack_require__(8);
	var stripAnsi = __webpack_require__(72);
	var scriptElements = document.getElementsByTagName("script");
	var scriptHost = scriptElements[scriptElements.length-1].getAttribute("src").replace(/\/[^\/]+$/, "");

	// If this bundle is inlined, use the resource query to get the correct url.
	// Else, get the url from the <script> this file was called with.
	var urlParts = url.parse( true ?
		__resourceQuery.substr(1) :
		(scriptHost ? scriptHost : "/")
	);

	var sock = null;
	var hot = false;
	var initial = true;
	var currentHash = "";

	var onSocketMsg = {
		hot: function() {
			hot = true;
			console.log("[WDS] Hot Module Replacement enabled.");
		},
		invalid: function() {
			console.log("[WDS] App updated. Recompiling...");
		},
		hash: function(hash) {
			currentHash = hash;
		},
		"still-ok": function() {
			console.log("[WDS] Nothing changed.")
		},
		ok: function() {
			if(initial) return initial = false;
			reloadApp();
		},
		warnings: function(warnings) {
			console.log("[WDS] Warnings while compiling.");
			for(var i = 0; i < warnings.length; i++)
				console.warn(stripAnsi(warnings[i]));
			if(initial) return initial = false;
			reloadApp();
		},
		errors: function(errors) {
			console.log("[WDS] Errors while compiling.");
			for(var i = 0; i < errors.length; i++)
				console.error(stripAnsi(errors[i]));
			if(initial) return initial = false;
			reloadApp();
		},
		"proxy-error": function(errors) {
			console.log("[WDS] Proxy error.");
			for(var i = 0; i < errors.length; i++)
				console.error(stripAnsi(errors[i]));
			if(initial) return initial = false;
			reloadApp();
		}
	};

	var newConnection = function() {
		sock = new SockJS(url.format({
			protocol: urlParts.protocol,
			auth: urlParts.auth,
			hostname: (urlParts.hostname === '0.0.0.0') ? window.location.hostname : urlParts.hostname,
			port: urlParts.port,
			pathname: urlParts.path === '/' ? "/sockjs-node" : urlParts.path
		}));

		sock.onclose = function() {
			console.error("[WDS] Disconnected!");

			// Try to reconnect.
			sock = null;
			setTimeout(function () {
				newConnection();
			}, 2000);
		};

		sock.onmessage = function(e) {
			// This assumes that all data sent via the websocket is JSON.
			var msg = JSON.parse(e.data);
			onSocketMsg[msg.type](msg.data);
		};
	};

	newConnection();

	function reloadApp() {
		if(hot) {
			console.log("[WDS] App hot update...");
			window.postMessage("webpackHotUpdate" + currentHash, "*");
		} else {
			console.log("[WDS] App updated. Reloading...");
			window.location.reload();
		}
	}

	/* WEBPACK VAR INJECTION */}.call(exports, "?http://localhost:8080"))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var punycode = __webpack_require__(3);

	exports.parse = urlParse;
	exports.resolve = urlResolve;
	exports.resolveObject = urlResolveObject;
	exports.format = urlFormat;

	exports.Url = Url;

	function Url() {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.host = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.query = null;
	  this.pathname = null;
	  this.path = null;
	  this.href = null;
	}

	// Reference: RFC 3986, RFC 1808, RFC 2396

	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i,
	    portPattern = /:[0-9]*$/,

	    // RFC 2396: characters reserved for delimiting URLs.
	    // We actually just auto-escape these.
	    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

	    // RFC 2396: characters not allowed for various reasons.
	    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

	    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	    autoEscape = ['\''].concat(unwise),
	    // Characters that are never ever allowed in a hostname.
	    // Note that any invalid chars are also handled, but these
	    // are the ones that are *expected* to be seen, so we fast-path
	    // them.
	    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
	    hostEndingChars = ['/', '?', '#'],
	    hostnameMaxLen = 255,
	    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
	    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
	    // protocols that can allow "unsafe" and "unwise" chars.
	    unsafeProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that never have a hostname.
	    hostlessProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that always contain a // bit.
	    slashedProtocol = {
	      'http': true,
	      'https': true,
	      'ftp': true,
	      'gopher': true,
	      'file': true,
	      'http:': true,
	      'https:': true,
	      'ftp:': true,
	      'gopher:': true,
	      'file:': true
	    },
	    querystring = __webpack_require__(5);

	function urlParse(url, parseQueryString, slashesDenoteHost) {
	  if (url && isObject(url) && url instanceof Url) return url;

	  var u = new Url;
	  u.parse(url, parseQueryString, slashesDenoteHost);
	  return u;
	}

	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
	  if (!isString(url)) {
	    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
	  }

	  var rest = url;

	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();

	  var proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    var lowerProto = proto.toLowerCase();
	    this.protocol = lowerProto;
	    rest = rest.substr(proto.length);
	  }

	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    var slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      this.slashes = true;
	    }
	  }

	  if (!hostlessProtocol[proto] &&
	      (slashes || (proto && !slashedProtocol[proto]))) {

	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c

	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.

	    // find the first instance of any hostEndingChars
	    var hostEnd = -1;
	    for (var i = 0; i < hostEndingChars.length; i++) {
	      var hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }

	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    var auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }

	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      this.auth = decodeURIComponent(auth);
	    }

	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (var i = 0; i < nonHostChars.length; i++) {
	      var hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1)
	      hostEnd = rest.length;

	    this.host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);

	    // pull out port.
	    this.parseHost();

	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    this.hostname = this.hostname || '';

	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    var ipv6Hostname = this.hostname[0] === '[' &&
	        this.hostname[this.hostname.length - 1] === ']';

	    // validate a little.
	    if (!ipv6Hostname) {
	      var hostparts = this.hostname.split(/\./);
	      for (var i = 0, l = hostparts.length; i < l; i++) {
	        var part = hostparts[i];
	        if (!part) continue;
	        if (!part.match(hostnamePartPattern)) {
	          var newpart = '';
	          for (var j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            var validParts = hostparts.slice(0, i);
	            var notHost = hostparts.slice(i + 1);
	            var bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = '/' + notHost.join('.') + rest;
	            }
	            this.hostname = validParts.join('.');
	            break;
	          }
	        }
	      }
	    }

	    if (this.hostname.length > hostnameMaxLen) {
	      this.hostname = '';
	    } else {
	      // hostnames are always lower case.
	      this.hostname = this.hostname.toLowerCase();
	    }

	    if (!ipv6Hostname) {
	      // IDNA Support: Returns a puny coded representation of "domain".
	      // It only converts the part of the domain name that
	      // has non ASCII characters. I.e. it dosent matter if
	      // you call it with a domain that already is in ASCII.
	      var domainArray = this.hostname.split('.');
	      var newOut = [];
	      for (var i = 0; i < domainArray.length; ++i) {
	        var s = domainArray[i];
	        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
	            'xn--' + punycode.encode(s) : s);
	      }
	      this.hostname = newOut.join('.');
	    }

	    var p = this.port ? ':' + this.port : '';
	    var h = this.hostname || '';
	    this.host = h + p;
	    this.href += this.host;

	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
	      if (rest[0] !== '/') {
	        rest = '/' + rest;
	      }
	    }
	  }

	  // now rest is set to the post-host stuff.
	  // chop off any delim chars.
	  if (!unsafeProtocol[lowerProto]) {

	    // First, make 100% sure that any "autoEscape" chars get
	    // escaped, even if encodeURIComponent doesn't think they
	    // need to be.
	    for (var i = 0, l = autoEscape.length; i < l; i++) {
	      var ae = autoEscape[i];
	      var esc = encodeURIComponent(ae);
	      if (esc === ae) {
	        esc = escape(ae);
	      }
	      rest = rest.split(ae).join(esc);
	    }
	  }


	  // chop off from the tail first.
	  var hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    this.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  var qm = rest.indexOf('?');
	  if (qm !== -1) {
	    this.search = rest.substr(qm);
	    this.query = rest.substr(qm + 1);
	    if (parseQueryString) {
	      this.query = querystring.parse(this.query);
	    }
	    rest = rest.slice(0, qm);
	  } else if (parseQueryString) {
	    // no query string, but parseQueryString still requested
	    this.search = '';
	    this.query = {};
	  }
	  if (rest) this.pathname = rest;
	  if (slashedProtocol[lowerProto] &&
	      this.hostname && !this.pathname) {
	    this.pathname = '/';
	  }

	  //to support http.request
	  if (this.pathname || this.search) {
	    var p = this.pathname || '';
	    var s = this.search || '';
	    this.path = p + s;
	  }

	  // finally, reconstruct the href based on what has been validated.
	  this.href = this.format();
	  return this;
	};

	// format a parsed object into a url string
	function urlFormat(obj) {
	  // ensure it's an object, and not a string url.
	  // If it's an obj, this is a no-op.
	  // this way, you can call url_format() on strings
	  // to clean up potentially wonky urls.
	  if (isString(obj)) obj = urlParse(obj);
	  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
	  return obj.format();
	}

	Url.prototype.format = function() {
	  var auth = this.auth || '';
	  if (auth) {
	    auth = encodeURIComponent(auth);
	    auth = auth.replace(/%3A/i, ':');
	    auth += '@';
	  }

	  var protocol = this.protocol || '',
	      pathname = this.pathname || '',
	      hash = this.hash || '',
	      host = false,
	      query = '';

	  if (this.host) {
	    host = auth + this.host;
	  } else if (this.hostname) {
	    host = auth + (this.hostname.indexOf(':') === -1 ?
	        this.hostname :
	        '[' + this.hostname + ']');
	    if (this.port) {
	      host += ':' + this.port;
	    }
	  }

	  if (this.query &&
	      isObject(this.query) &&
	      Object.keys(this.query).length) {
	    query = querystring.stringify(this.query);
	  }

	  var search = this.search || (query && ('?' + query)) || '';

	  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

	  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
	  // unless they had them to begin with.
	  if (this.slashes ||
	      (!protocol || slashedProtocol[protocol]) && host !== false) {
	    host = '//' + (host || '');
	    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
	  } else if (!host) {
	    host = '';
	  }

	  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
	  if (search && search.charAt(0) !== '?') search = '?' + search;

	  pathname = pathname.replace(/[?#]/g, function(match) {
	    return encodeURIComponent(match);
	  });
	  search = search.replace('#', '%23');

	  return protocol + host + pathname + search + hash;
	};

	function urlResolve(source, relative) {
	  return urlParse(source, false, true).resolve(relative);
	}

	Url.prototype.resolve = function(relative) {
	  return this.resolveObject(urlParse(relative, false, true)).format();
	};

	function urlResolveObject(source, relative) {
	  if (!source) return relative;
	  return urlParse(source, false, true).resolveObject(relative);
	}

	Url.prototype.resolveObject = function(relative) {
	  if (isString(relative)) {
	    var rel = new Url();
	    rel.parse(relative, false, true);
	    relative = rel;
	  }

	  var result = new Url();
	  Object.keys(this).forEach(function(k) {
	    result[k] = this[k];
	  }, this);

	  // hash is always overridden, no matter what.
	  // even href="" will remove it.
	  result.hash = relative.hash;

	  // if the relative url is empty, then there's nothing left to do here.
	  if (relative.href === '') {
	    result.href = result.format();
	    return result;
	  }

	  // hrefs like //foo/bar always cut to the protocol.
	  if (relative.slashes && !relative.protocol) {
	    // take everything except the protocol from relative
	    Object.keys(relative).forEach(function(k) {
	      if (k !== 'protocol')
	        result[k] = relative[k];
	    });

	    //urlParse appends trailing / to urls like http://www.example.com
	    if (slashedProtocol[result.protocol] &&
	        result.hostname && !result.pathname) {
	      result.path = result.pathname = '/';
	    }

	    result.href = result.format();
	    return result;
	  }

	  if (relative.protocol && relative.protocol !== result.protocol) {
	    // if it's a known url protocol, then changing
	    // the protocol does weird things
	    // first, if it's not file:, then we MUST have a host,
	    // and if there was a path
	    // to begin with, then we MUST have a path.
	    // if it is file:, then the host is dropped,
	    // because that's known to be hostless.
	    // anything else is assumed to be absolute.
	    if (!slashedProtocol[relative.protocol]) {
	      Object.keys(relative).forEach(function(k) {
	        result[k] = relative[k];
	      });
	      result.href = result.format();
	      return result;
	    }

	    result.protocol = relative.protocol;
	    if (!relative.host && !hostlessProtocol[relative.protocol]) {
	      var relPath = (relative.pathname || '').split('/');
	      while (relPath.length && !(relative.host = relPath.shift()));
	      if (!relative.host) relative.host = '';
	      if (!relative.hostname) relative.hostname = '';
	      if (relPath[0] !== '') relPath.unshift('');
	      if (relPath.length < 2) relPath.unshift('');
	      result.pathname = relPath.join('/');
	    } else {
	      result.pathname = relative.pathname;
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    result.host = relative.host || '';
	    result.auth = relative.auth;
	    result.hostname = relative.hostname || relative.host;
	    result.port = relative.port;
	    // to support http.request
	    if (result.pathname || result.search) {
	      var p = result.pathname || '';
	      var s = result.search || '';
	      result.path = p + s;
	    }
	    result.slashes = result.slashes || relative.slashes;
	    result.href = result.format();
	    return result;
	  }

	  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
	      isRelAbs = (
	          relative.host ||
	          relative.pathname && relative.pathname.charAt(0) === '/'
	      ),
	      mustEndAbs = (isRelAbs || isSourceAbs ||
	                    (result.host && relative.pathname)),
	      removeAllDots = mustEndAbs,
	      srcPath = result.pathname && result.pathname.split('/') || [],
	      relPath = relative.pathname && relative.pathname.split('/') || [],
	      psychotic = result.protocol && !slashedProtocol[result.protocol];

	  // if the url is a non-slashed url, then relative
	  // links like ../.. should be able
	  // to crawl up to the hostname, as well.  This is strange.
	  // result.protocol has already been set by now.
	  // Later on, put the first path part into the host field.
	  if (psychotic) {
	    result.hostname = '';
	    result.port = null;
	    if (result.host) {
	      if (srcPath[0] === '') srcPath[0] = result.host;
	      else srcPath.unshift(result.host);
	    }
	    result.host = '';
	    if (relative.protocol) {
	      relative.hostname = null;
	      relative.port = null;
	      if (relative.host) {
	        if (relPath[0] === '') relPath[0] = relative.host;
	        else relPath.unshift(relative.host);
	      }
	      relative.host = null;
	    }
	    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
	  }

	  if (isRelAbs) {
	    // it's absolute.
	    result.host = (relative.host || relative.host === '') ?
	                  relative.host : result.host;
	    result.hostname = (relative.hostname || relative.hostname === '') ?
	                      relative.hostname : result.hostname;
	    result.search = relative.search;
	    result.query = relative.query;
	    srcPath = relPath;
	    // fall through to the dot-handling below.
	  } else if (relPath.length) {
	    // it's relative
	    // throw away the existing file, and take the new path instead.
	    if (!srcPath) srcPath = [];
	    srcPath.pop();
	    srcPath = srcPath.concat(relPath);
	    result.search = relative.search;
	    result.query = relative.query;
	  } else if (!isNullOrUndefined(relative.search)) {
	    // just pull out the search.
	    // like href='?foo'.
	    // Put this after the other two cases because it simplifies the booleans
	    if (psychotic) {
	      result.hostname = result.host = srcPath.shift();
	      //occationaly the auth can get stuck only in host
	      //this especialy happens in cases like
	      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	      var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                       result.host.split('@') : false;
	      if (authInHost) {
	        result.auth = authInHost.shift();
	        result.host = result.hostname = authInHost.shift();
	      }
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    //to support http.request
	    if (!isNull(result.pathname) || !isNull(result.search)) {
	      result.path = (result.pathname ? result.pathname : '') +
	                    (result.search ? result.search : '');
	    }
	    result.href = result.format();
	    return result;
	  }

	  if (!srcPath.length) {
	    // no path at all.  easy.
	    // we've already handled the other stuff above.
	    result.pathname = null;
	    //to support http.request
	    if (result.search) {
	      result.path = '/' + result.search;
	    } else {
	      result.path = null;
	    }
	    result.href = result.format();
	    return result;
	  }

	  // if a url ENDs in . or .., then it must get a trailing slash.
	  // however, if it ends in anything else non-slashy,
	  // then it must NOT get a trailing slash.
	  var last = srcPath.slice(-1)[0];
	  var hasTrailingSlash = (
	      (result.host || relative.host) && (last === '.' || last === '..') ||
	      last === '');

	  // strip single dots, resolve double dots to parent dir
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = srcPath.length; i >= 0; i--) {
	    last = srcPath[i];
	    if (last == '.') {
	      srcPath.splice(i, 1);
	    } else if (last === '..') {
	      srcPath.splice(i, 1);
	      up++;
	    } else if (up) {
	      srcPath.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (!mustEndAbs && !removeAllDots) {
	    for (; up--; up) {
	      srcPath.unshift('..');
	    }
	  }

	  if (mustEndAbs && srcPath[0] !== '' &&
	      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
	    srcPath.unshift('');
	  }

	  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
	    srcPath.push('');
	  }

	  var isAbsolute = srcPath[0] === '' ||
	      (srcPath[0] && srcPath[0].charAt(0) === '/');

	  // put the host back
	  if (psychotic) {
	    result.hostname = result.host = isAbsolute ? '' :
	                                    srcPath.length ? srcPath.shift() : '';
	    //occationaly the auth can get stuck only in host
	    //this especialy happens in cases like
	    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	    var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                     result.host.split('@') : false;
	    if (authInHost) {
	      result.auth = authInHost.shift();
	      result.host = result.hostname = authInHost.shift();
	    }
	  }

	  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

	  if (mustEndAbs && !isAbsolute) {
	    srcPath.unshift('');
	  }

	  if (!srcPath.length) {
	    result.pathname = null;
	    result.path = null;
	  } else {
	    result.pathname = srcPath.join('/');
	  }

	  //to support request.http
	  if (!isNull(result.pathname) || !isNull(result.search)) {
	    result.path = (result.pathname ? result.pathname : '') +
	                  (result.search ? result.search : '');
	  }
	  result.auth = relative.auth || result.auth;
	  result.slashes = result.slashes || relative.slashes;
	  result.href = result.format();
	  return result;
	};

	Url.prototype.parseHost = function() {
	  var host = this.host;
	  var port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      this.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) this.hostname = host;
	};

	function isString(arg) {
	  return typeof arg === "string";
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isNull(arg) {
	  return arg === null;
	}
	function isNullOrUndefined(arg) {
	  return  arg == null;
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! https://mths.be/punycode v1.3.2 by @mathias */
	;(function(root) {

		/** Detect free variables */
		var freeExports = typeof exports == 'object' && exports &&
			!exports.nodeType && exports;
		var freeModule = typeof module == 'object' && module &&
			!module.nodeType && module;
		var freeGlobal = typeof global == 'object' && global;
		if (
			freeGlobal.global === freeGlobal ||
			freeGlobal.window === freeGlobal ||
			freeGlobal.self === freeGlobal
		) {
			root = freeGlobal;
		}

		/**
		 * The `punycode` object.
		 * @name punycode
		 * @type Object
		 */
		var punycode,

		/** Highest positive signed 32-bit float value */
		maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

		/** Bootstring parameters */
		base = 36,
		tMin = 1,
		tMax = 26,
		skew = 38,
		damp = 700,
		initialBias = 72,
		initialN = 128, // 0x80
		delimiter = '-', // '\x2D'

		/** Regular expressions */
		regexPunycode = /^xn--/,
		regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
		regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

		/** Error messages */
		errors = {
			'overflow': 'Overflow: input needs wider integers to process',
			'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
			'invalid-input': 'Invalid input'
		},

		/** Convenience shortcuts */
		baseMinusTMin = base - tMin,
		floor = Math.floor,
		stringFromCharCode = String.fromCharCode,

		/** Temporary variable */
		key;

		/*--------------------------------------------------------------------------*/

		/**
		 * A generic error utility function.
		 * @private
		 * @param {String} type The error type.
		 * @returns {Error} Throws a `RangeError` with the applicable error message.
		 */
		function error(type) {
			throw RangeError(errors[type]);
		}

		/**
		 * A generic `Array#map` utility function.
		 * @private
		 * @param {Array} array The array to iterate over.
		 * @param {Function} callback The function that gets called for every array
		 * item.
		 * @returns {Array} A new array of values returned by the callback function.
		 */
		function map(array, fn) {
			var length = array.length;
			var result = [];
			while (length--) {
				result[length] = fn(array[length]);
			}
			return result;
		}

		/**
		 * A simple `Array#map`-like wrapper to work with domain name strings or email
		 * addresses.
		 * @private
		 * @param {String} domain The domain name or email address.
		 * @param {Function} callback The function that gets called for every
		 * character.
		 * @returns {Array} A new string of characters returned by the callback
		 * function.
		 */
		function mapDomain(string, fn) {
			var parts = string.split('@');
			var result = '';
			if (parts.length > 1) {
				// In email addresses, only the domain name should be punycoded. Leave
				// the local part (i.e. everything up to `@`) intact.
				result = parts[0] + '@';
				string = parts[1];
			}
			// Avoid `split(regex)` for IE8 compatibility. See #17.
			string = string.replace(regexSeparators, '\x2E');
			var labels = string.split('.');
			var encoded = map(labels, fn).join('.');
			return result + encoded;
		}

		/**
		 * Creates an array containing the numeric code points of each Unicode
		 * character in the string. While JavaScript uses UCS-2 internally,
		 * this function will convert a pair of surrogate halves (each of which
		 * UCS-2 exposes as separate characters) into a single code point,
		 * matching UTF-16.
		 * @see `punycode.ucs2.encode`
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode.ucs2
		 * @name decode
		 * @param {String} string The Unicode input string (UCS-2).
		 * @returns {Array} The new array of code points.
		 */
		function ucs2decode(string) {
			var output = [],
			    counter = 0,
			    length = string.length,
			    value,
			    extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}

		/**
		 * Creates a string based on an array of numeric code points.
		 * @see `punycode.ucs2.decode`
		 * @memberOf punycode.ucs2
		 * @name encode
		 * @param {Array} codePoints The array of numeric code points.
		 * @returns {String} The new Unicode string (UCS-2).
		 */
		function ucs2encode(array) {
			return map(array, function(value) {
				var output = '';
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
				return output;
			}).join('');
		}

		/**
		 * Converts a basic code point into a digit/integer.
		 * @see `digitToBasic()`
		 * @private
		 * @param {Number} codePoint The basic numeric code point value.
		 * @returns {Number} The numeric value of a basic code point (for use in
		 * representing integers) in the range `0` to `base - 1`, or `base` if
		 * the code point does not represent a value.
		 */
		function basicToDigit(codePoint) {
			if (codePoint - 48 < 10) {
				return codePoint - 22;
			}
			if (codePoint - 65 < 26) {
				return codePoint - 65;
			}
			if (codePoint - 97 < 26) {
				return codePoint - 97;
			}
			return base;
		}

		/**
		 * Converts a digit/integer into a basic code point.
		 * @see `basicToDigit()`
		 * @private
		 * @param {Number} digit The numeric value of a basic code point.
		 * @returns {Number} The basic code point whose value (when used for
		 * representing integers) is `digit`, which needs to be in the range
		 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
		 * used; else, the lowercase form is used. The behavior is undefined
		 * if `flag` is non-zero and `digit` has no uppercase form.
		 */
		function digitToBasic(digit, flag) {
			//  0..25 map to ASCII a..z or A..Z
			// 26..35 map to ASCII 0..9
			return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
		}

		/**
		 * Bias adaptation function as per section 3.4 of RFC 3492.
		 * http://tools.ietf.org/html/rfc3492#section-3.4
		 * @private
		 */
		function adapt(delta, numPoints, firstTime) {
			var k = 0;
			delta = firstTime ? floor(delta / damp) : delta >> 1;
			delta += floor(delta / numPoints);
			for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
				delta = floor(delta / baseMinusTMin);
			}
			return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
		}

		/**
		 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
		 * symbols.
		 * @memberOf punycode
		 * @param {String} input The Punycode string of ASCII-only symbols.
		 * @returns {String} The resulting string of Unicode symbols.
		 */
		function decode(input) {
			// Don't use UCS-2
			var output = [],
			    inputLength = input.length,
			    out,
			    i = 0,
			    n = initialN,
			    bias = initialBias,
			    basic,
			    j,
			    index,
			    oldi,
			    w,
			    k,
			    digit,
			    t,
			    /** Cached calculation results */
			    baseMinusT;

			// Handle the basic code points: let `basic` be the number of input code
			// points before the last delimiter, or `0` if there is none, then copy
			// the first basic code points to the output.

			basic = input.lastIndexOf(delimiter);
			if (basic < 0) {
				basic = 0;
			}

			for (j = 0; j < basic; ++j) {
				// if it's not a basic code point
				if (input.charCodeAt(j) >= 0x80) {
					error('not-basic');
				}
				output.push(input.charCodeAt(j));
			}

			// Main decoding loop: start just after the last delimiter if any basic code
			// points were copied; start at the beginning otherwise.

			for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

				// `index` is the index of the next character to be consumed.
				// Decode a generalized variable-length integer into `delta`,
				// which gets added to `i`. The overflow checking is easier
				// if we increase `i` as we go, then subtract off its starting
				// value at the end to obtain `delta`.
				for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

					if (index >= inputLength) {
						error('invalid-input');
					}

					digit = basicToDigit(input.charCodeAt(index++));

					if (digit >= base || digit > floor((maxInt - i) / w)) {
						error('overflow');
					}

					i += digit * w;
					t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

					if (digit < t) {
						break;
					}

					baseMinusT = base - t;
					if (w > floor(maxInt / baseMinusT)) {
						error('overflow');
					}

					w *= baseMinusT;

				}

				out = output.length + 1;
				bias = adapt(i - oldi, out, oldi == 0);

				// `i` was supposed to wrap around from `out` to `0`,
				// incrementing `n` each time, so we'll fix that now:
				if (floor(i / out) > maxInt - n) {
					error('overflow');
				}

				n += floor(i / out);
				i %= out;

				// Insert `n` at position `i` of the output
				output.splice(i++, 0, n);

			}

			return ucs2encode(output);
		}

		/**
		 * Converts a string of Unicode symbols (e.g. a domain name label) to a
		 * Punycode string of ASCII-only symbols.
		 * @memberOf punycode
		 * @param {String} input The string of Unicode symbols.
		 * @returns {String} The resulting Punycode string of ASCII-only symbols.
		 */
		function encode(input) {
			var n,
			    delta,
			    handledCPCount,
			    basicLength,
			    bias,
			    j,
			    m,
			    q,
			    k,
			    t,
			    currentValue,
			    output = [],
			    /** `inputLength` will hold the number of code points in `input`. */
			    inputLength,
			    /** Cached calculation results */
			    handledCPCountPlusOne,
			    baseMinusT,
			    qMinusT;

			// Convert the input in UCS-2 to Unicode
			input = ucs2decode(input);

			// Cache the length
			inputLength = input.length;

			// Initialize the state
			n = initialN;
			delta = 0;
			bias = initialBias;

			// Handle the basic code points
			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue < 0x80) {
					output.push(stringFromCharCode(currentValue));
				}
			}

			handledCPCount = basicLength = output.length;

			// `handledCPCount` is the number of code points that have been handled;
			// `basicLength` is the number of basic code points.

			// Finish the basic string - if it is not empty - with a delimiter
			if (basicLength) {
				output.push(delimiter);
			}

			// Main encoding loop:
			while (handledCPCount < inputLength) {

				// All non-basic code points < n have been handled already. Find the next
				// larger one:
				for (m = maxInt, j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue >= n && currentValue < m) {
						m = currentValue;
					}
				}

				// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
				// but guard against overflow
				handledCPCountPlusOne = handledCPCount + 1;
				if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
					error('overflow');
				}

				delta += (m - n) * handledCPCountPlusOne;
				n = m;

				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];

					if (currentValue < n && ++delta > maxInt) {
						error('overflow');
					}

					if (currentValue == n) {
						// Represent delta as a generalized variable-length integer
						for (q = delta, k = base; /* no condition */; k += base) {
							t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
							if (q < t) {
								break;
							}
							qMinusT = q - t;
							baseMinusT = base - t;
							output.push(
								stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
							);
							q = floor(qMinusT / baseMinusT);
						}

						output.push(stringFromCharCode(digitToBasic(q, 0)));
						bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
						delta = 0;
						++handledCPCount;
					}
				}

				++delta;
				++n;

			}
			return output.join('');
		}

		/**
		 * Converts a Punycode string representing a domain name or an email address
		 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
		 * it doesn't matter if you call it on a string that has already been
		 * converted to Unicode.
		 * @memberOf punycode
		 * @param {String} input The Punycoded domain name or email address to
		 * convert to Unicode.
		 * @returns {String} The Unicode representation of the given Punycode
		 * string.
		 */
		function toUnicode(input) {
			return mapDomain(input, function(string) {
				return regexPunycode.test(string)
					? decode(string.slice(4).toLowerCase())
					: string;
			});
		}

		/**
		 * Converts a Unicode string representing a domain name or an email address to
		 * Punycode. Only the non-ASCII parts of the domain name will be converted,
		 * i.e. it doesn't matter if you call it with a domain that's already in
		 * ASCII.
		 * @memberOf punycode
		 * @param {String} input The domain name or email address to convert, as a
		 * Unicode string.
		 * @returns {String} The Punycode representation of the given domain name or
		 * email address.
		 */
		function toASCII(input) {
			return mapDomain(input, function(string) {
				return regexNonASCII.test(string)
					? 'xn--' + encode(string)
					: string;
			});
		}

		/*--------------------------------------------------------------------------*/

		/** Define the public API */
		punycode = {
			/**
			 * A string representing the current Punycode.js version number.
			 * @memberOf punycode
			 * @type String
			 */
			'version': '1.3.2',
			/**
			 * An object of methods to convert from JavaScript's internal character
			 * representation (UCS-2) to Unicode code points, and back.
			 * @see <https://mathiasbynens.be/notes/javascript-encoding>
			 * @memberOf punycode
			 * @type Object
			 */
			'ucs2': {
				'decode': ucs2decode,
				'encode': ucs2encode
			},
			'decode': decode,
			'encode': encode,
			'toASCII': toASCII,
			'toUnicode': toUnicode
		};

		/** Expose `punycode` */
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return punycode;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (freeExports && freeModule) {
			if (module.exports == freeExports) { // in Node.js or RingoJS v0.8.0+
				freeModule.exports = punycode;
			} else { // in Narwhal or RingoJS v0.7.0-
				for (key in punycode) {
					punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.punycode = punycode;
		}

	}(this));

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)(module), (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.decode = exports.parse = __webpack_require__(6);
	exports.encode = exports.stringify = __webpack_require__(7);


/***/ },
/* 6 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';

	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	module.exports = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};

	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }

	  var regexp = /\+/g;
	  qs = qs.split(sep);

	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }

	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }

	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;

	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }

	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);

	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (Array.isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }

	  return obj;
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';

	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;

	    case 'boolean':
	      return v ? 'true' : 'false';

	    case 'number':
	      return isFinite(v) ? v : '';

	    default:
	      return '';
	  }
	};

	module.exports = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }

	  if (typeof obj === 'object') {
	    return Object.keys(obj).map(function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (Array.isArray(obj[k])) {
	        return obj[k].map(function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);

	  }

	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var transportList = __webpack_require__(9);

	module.exports = __webpack_require__(56)(transportList);

	// TODO can't get rid of this until all servers do
	if ('_sockjs_onload' in global) {
	  setTimeout(global._sockjs_onload, 1);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = [
	  // streaming transports
	  __webpack_require__(10)
	, __webpack_require__(27)
	, __webpack_require__(37)
	, __webpack_require__(39)
	, __webpack_require__(42)(__webpack_require__(39))

	  // polling transports
	, __webpack_require__(49)
	, __webpack_require__(42)(__webpack_require__(49))
	, __webpack_require__(51)
	, __webpack_require__(52)
	, __webpack_require__(42)(__webpack_require__(51))
	, __webpack_require__(53)
	];


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var utils = __webpack_require__(12)
	  , urlUtils = __webpack_require__(15)
	  , inherits = __webpack_require__(23)
	  , EventEmitter = __webpack_require__(24).EventEmitter
	  , WebsocketDriver = __webpack_require__(26)
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:websocket');
	}

	function WebSocketTransport(transUrl) {
	  if (!WebSocketTransport.enabled()) {
	    throw new Error('Transport created when disabled');
	  }

	  EventEmitter.call(this);
	  debug('constructor', transUrl);

	  var self = this;
	  var url = urlUtils.addPath(transUrl, '/websocket');
	  if (url.slice(0, 5) === 'https') {
	    url = 'wss' + url.slice(5);
	  } else {
	    url = 'ws' + url.slice(4);
	  }
	  this.url = url;

	  this.ws = new WebsocketDriver(this.url);
	  this.ws.onmessage = function(e) {
	    debug('message event', e.data);
	    self.emit('message', e.data);
	  };
	  // Firefox has an interesting bug. If a websocket connection is
	  // created after onunload, it stays alive even when user
	  // navigates away from the page. In such situation let's lie -
	  // let's not open the ws connection at all. See:
	  // https://github.com/sockjs/sockjs-client/issues/28
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=696085
	  this.unloadRef = utils.unloadAdd(function() {
	    debug('unload');
	    self.ws.close();
	  });
	  this.ws.onclose = function(e) {
	    debug('close event', e.code, e.reason);
	    self.emit('close', e.code, e.reason);
	    self._cleanup();
	  };
	  this.ws.onerror = function(e) {
	    debug('error event', e);
	    self.emit('close', 1006, 'WebSocket connection broken');
	    self._cleanup();
	  };
	}

	inherits(WebSocketTransport, EventEmitter);

	WebSocketTransport.prototype.send = function(data) {
	  var msg = '[' + data + ']';
	  debug('send', msg);
	  this.ws.send(msg);
	};

	WebSocketTransport.prototype.close = function() {
	  debug('close');
	  if (this.ws) {
	    this.ws.close();
	  }
	  this._cleanup();
	};

	WebSocketTransport.prototype._cleanup = function() {
	  debug('_cleanup');
	  var ws = this.ws;
	  if (ws) {
	    ws.onmessage = ws.onclose = ws.onerror = null;
	  }
	  utils.unloadDel(this.unloadRef);
	  this.unloadRef = this.ws = null;
	  this.removeAllListeners();
	};

	WebSocketTransport.enabled = function() {
	  debug('enabled');
	  return !!WebsocketDriver;
	};
	WebSocketTransport.transportName = 'websocket';

	// In theory, ws should require 1 round trip. But in chrome, this is
	// not very stable over SSL. Most likely a ws connection requires a
	// separate SSL connection, in which case 2 round trips are an
	// absolute minumum.
	WebSocketTransport.roundTrips = 2;

	module.exports = WebSocketTransport;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 11 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var random = __webpack_require__(13);

	var onUnload = {}
	  , afterUnload = false
	    // detect google chrome packaged apps because they don't allow the 'unload' event
	  , isChromePackagedApp = global.chrome && global.chrome.app && global.chrome.app.runtime
	  ;

	module.exports = {
	  attachEvent: function(event, listener) {
	    if (typeof global.addEventListener !== 'undefined') {
	      global.addEventListener(event, listener, false);
	    } else if (global.document && global.attachEvent) {
	      // IE quirks.
	      // According to: http://stevesouders.com/misc/test-postmessage.php
	      // the message gets delivered only to 'document', not 'window'.
	      global.document.attachEvent('on' + event, listener);
	      // I get 'window' for ie8.
	      global.attachEvent('on' + event, listener);
	    }
	  }

	, detachEvent: function(event, listener) {
	    if (typeof global.addEventListener !== 'undefined') {
	      global.removeEventListener(event, listener, false);
	    } else if (global.document && global.detachEvent) {
	      global.document.detachEvent('on' + event, listener);
	      global.detachEvent('on' + event, listener);
	    }
	  }

	, unloadAdd: function(listener) {
	    if (isChromePackagedApp) {
	      return null;
	    }

	    var ref = random.string(8);
	    onUnload[ref] = listener;
	    if (afterUnload) {
	      setTimeout(this.triggerUnloadCallbacks, 0);
	    }
	    return ref;
	  }

	, unloadDel: function(ref) {
	    if (ref in onUnload) {
	      delete onUnload[ref];
	    }
	  }

	, triggerUnloadCallbacks: function() {
	    for (var ref in onUnload) {
	      onUnload[ref]();
	      delete onUnload[ref];
	    }
	  }
	};

	var unloadTriggered = function() {
	  if (afterUnload) {
	    return;
	  }
	  afterUnload = true;
	  module.exports.triggerUnloadCallbacks();
	};

	// 'unload' alone is not reliable in opera within an iframe, but we
	// can't use `beforeunload` as IE fires it on javascript: links.
	if (!isChromePackagedApp) {
	  module.exports.attachEvent('unload', unloadTriggered);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/* global crypto:true */
	var crypto = __webpack_require__(14);

	// This string has length 32, a power of 2, so the modulus doesn't introduce a
	// bias.
	var _randomStringChars = 'abcdefghijklmnopqrstuvwxyz012345';
	module.exports = {
	  string: function(length) {
	    var max = _randomStringChars.length;
	    var bytes = crypto.randomBytes(length);
	    var ret = [];
	    for (var i = 0; i < length; i++) {
	      ret.push(_randomStringChars.substr(bytes[i] % max, 1));
	    }
	    return ret.join('');
	  }

	, number: function(max) {
	    return Math.floor(Math.random() * max);
	  }

	, numberString: function(max) {
	    var t = ('' + (max - 1)).length;
	    var p = new Array(t + 1).join('0');
	    return (p + this.number(max)).slice(-t);
	  }
	};


/***/ },
/* 14 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	if (global.crypto && global.crypto.getRandomValues) {
	  module.exports.randomBytes = function(length) {
	    var bytes = new Uint8Array(length);
	    global.crypto.getRandomValues(bytes);
	    return bytes;
	  };
	} else {
	  module.exports.randomBytes = function(length) {
	    var bytes = new Array(length);
	    for (var i = 0; i < length; i++) {
	      bytes[i] = Math.floor(Math.random() * 256);
	    }
	    return bytes;
	  };
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var URL = __webpack_require__(16);

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:utils:url');
	}

	module.exports = {
	  getOrigin: function(url) {
	    if (!url) {
	      return null;
	    }

	    var p = new URL(url);
	    if (p.protocol === 'file:') {
	      return null;
	    }

	    var port = p.port;
	    if (!port) {
	      port = (p.protocol === 'https:') ? '443' : '80';
	    }

	    return p.protocol + '//' + p.hostname + ':' + port;
	  }

	, isOriginEqual: function(a, b) {
	    var res = this.getOrigin(a) === this.getOrigin(b);
	    debug('same', a, b, res);
	    return res;
	  }

	, isSchemeEqual: function(a, b) {
	    return (a.split(':')[0] === b.split(':')[0]);
	  }

	, addPath: function (url, path) {
	    var qs = url.split('?');
	    return qs[0] + path + (qs[1] ? '?' + qs[1] : '');
	  }

	, addQuery: function (url, q) {
	    return url + (url.indexOf('?') === -1 ? ('?' + q) : ('&' + q));
	  }
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var required = __webpack_require__(17)
	  , lolcation = __webpack_require__(18)
	  , qs = __webpack_require__(19)
	  , relativere = /^\/(?!\/)/
	  , protocolre = /^([a-z0-9.+-]+:)?(\/\/)?(.*)$/i; // actual protocol is first match

	/**
	 * These are the parse instructions for the URL parsers, it informs the parser
	 * about:
	 *
	 * 0. The char it Needs to parse, if it's a string it should be done using
	 *    indexOf, RegExp using exec and NaN means set as current value.
	 * 1. The property we should set when parsing this value.
	 * 2. Indication if it's backwards or forward parsing, when set as number it's
	 *    the value of extra chars that should be split off.
	 * 3. Inherit from location if non existing in the parser.
	 * 4. `toLowerCase` the resulting value.
	 */
	var instructions = [
	  ['#', 'hash'],                        // Extract from the back.
	  ['?', 'query'],                       // Extract from the back.
	  ['/', 'pathname'],                    // Extract from the back.
	  ['@', 'auth', 1],                     // Extract from the front.
	  [NaN, 'host', undefined, 1, 1],       // Set left over value.
	  [/\:(\d+)$/, 'port'],                 // RegExp the back.
	  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
	];

	 /**
	 * @typedef ProtocolExtract
	 * @type Object
	 * @property {String} protocol Protocol matched in the URL, in lowercase
	 * @property {Boolean} slashes Indicates whether the protocol is followed by double slash ("//")
	 * @property {String} rest     Rest of the URL that is not part of the protocol
	 */

	 /**
	  * Extract protocol information from a URL with/without double slash ("//")
	  *
	  * @param  {String} address   URL we want to extract from.
	  * @return {ProtocolExtract}  Extracted information
	  * @private
	  */
	function extractProtocol(address) {
	  var match = protocolre.exec(address);
	  return {
	    protocol: match[1] ? match[1].toLowerCase() : '',
	    slashes: !!match[2],
	    rest: match[3] ? match[3] : ''
	  };
	}

	/**
	 * The actual URL instance. Instead of returning an object we've opted-in to
	 * create an actual constructor as it's much more memory efficient and
	 * faster and it pleases my CDO.
	 *
	 * @constructor
	 * @param {String} address URL we want to parse.
	 * @param {Object|String} location Location defaults for relative paths.
	 * @param {Boolean|Function} parser Parser for the query string.
	 * @api public
	 */
	function URL(address, location, parser) {
	  if (!(this instanceof URL)) {
	    return new URL(address, location, parser);
	  }

	  var relative = relativere.test(address)
	    , parse, instruction, index, key
	    , type = typeof location
	    , url = this
	    , i = 0;

	  //
	  // The following if statements allows this module two have compatibility with
	  // 2 different API:
	  //
	  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
	  //    where the boolean indicates that the query string should also be parsed.
	  //
	  // 2. The `URL` interface of the browser which accepts a URL, object as
	  //    arguments. The supplied object will be used as default values / fall-back
	  //    for relative paths.
	  //
	  if ('object' !== type && 'string' !== type) {
	    parser = location;
	    location = null;
	  }

	  if (parser && 'function' !== typeof parser) {
	    parser = qs.parse;
	  }

	  location = lolcation(location);

	  // extract protocol information before running the instructions
	  var extracted = extractProtocol(address);
	  url.protocol = extracted.protocol || location.protocol || '';
	  url.slashes = extracted.slashes || location.slashes;
	  address = extracted.rest;

	  for (; i < instructions.length; i++) {
	    instruction = instructions[i];
	    parse = instruction[0];
	    key = instruction[1];

	    if (parse !== parse) {
	      url[key] = address;
	    } else if ('string' === typeof parse) {
	      if (~(index = address.indexOf(parse))) {
	        if ('number' === typeof instruction[2]) {
	          url[key] = address.slice(0, index);
	          address = address.slice(index + instruction[2]);
	        } else {
	          url[key] = address.slice(index);
	          address = address.slice(0, index);
	        }
	      }
	    } else if (index = parse.exec(address)) {
	      url[key] = index[1];
	      address = address.slice(0, address.length - index[0].length);
	    }

	    url[key] = url[key] || (instruction[3] || ('port' === key && relative) ? location[key] || '' : '');

	    //
	    // Hostname, host and protocol should be lowercased so they can be used to
	    // create a proper `origin`.
	    //
	    if (instruction[4]) {
	      url[key] = url[key].toLowerCase();
	    }
	  }

	  //
	  // Also parse the supplied query string in to an object. If we're supplied
	  // with a custom parser as function use that instead of the default build-in
	  // parser.
	  //
	  if (parser) url.query = parser(url.query);

	  //
	  // We should not add port numbers if they are already the default port number
	  // for a given protocol. As the host also contains the port number we're going
	  // override it with the hostname which contains no port number.
	  //
	  if (!required(url.port, url.protocol)) {
	    url.host = url.hostname;
	    url.port = '';
	  }

	  //
	  // Parse down the `auth` for the username and password.
	  //
	  url.username = url.password = '';
	  if (url.auth) {
	    instruction = url.auth.split(':');
	    url.username = instruction[0] || '';
	    url.password = instruction[1] || '';
	  }

	  //
	  // The href is just the compiled result.
	  //
	  url.href = url.toString();
	}

	/**
	 * This is convenience method for changing properties in the URL instance to
	 * insure that they all propagate correctly.
	 *
	 * @param {String} prop          Property we need to adjust.
	 * @param {Mixed} value          The newly assigned value.
	 * @param {Boolean|Function} fn  When setting the query, it will be the function used to parse
	 *                               the query.
	 *                               When setting the protocol, double slash will be removed from
	 *                               the final url if it is true.
	 * @returns {URL}
	 * @api public
	 */
	URL.prototype.set = function set(part, value, fn) {
	  var url = this;

	  if ('query' === part) {
	    if ('string' === typeof value && value.length) {
	      value = (fn || qs.parse)(value);
	    }

	    url[part] = value;
	  } else if ('port' === part) {
	    url[part] = value;

	    if (!required(value, url.protocol)) {
	      url.host = url.hostname;
	      url[part] = '';
	    } else if (value) {
	      url.host = url.hostname +':'+ value;
	    }
	  } else if ('hostname' === part) {
	    url[part] = value;

	    if (url.port) value += ':'+ url.port;
	    url.host = value;
	  } else if ('host' === part) {
	    url[part] = value;

	    if (/\:\d+/.test(value)) {
	      value = value.split(':');
	      url.hostname = value[0];
	      url.port = value[1];
	    }
	  } else if ('protocol' === part) {
	    url.protocol = value;
	    url.slashes = !fn;
	  } else {
	    url[part] = value;
	  }

	  url.href = url.toString();
	  return url;
	};

	/**
	 * Transform the properties back in to a valid and full URL string.
	 *
	 * @param {Function} stringify Optional query stringify function.
	 * @returns {String}
	 * @api public
	 */
	URL.prototype.toString = function toString(stringify) {
	  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

	  var query
	    , url = this
	    , protocol = url.protocol;

	  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

	  var result = protocol + (url.slashes ? '//' : '');

	  if (url.username) {
	    result += url.username;
	    if (url.password) result += ':'+ url.password;
	    result += '@';
	  }

	  result += url.hostname;
	  if (url.port) result += ':'+ url.port;

	  result += url.pathname;

	  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
	  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

	  if (url.hash) result += url.hash;

	  return result;
	};

	//
	// Expose the URL parser and some additional properties that might be useful for
	// others.
	//
	URL.qs = qs;
	URL.location = lolcation;
	module.exports = URL;


/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Check if we're required to add a port number.
	 *
	 * @see https://url.spec.whatwg.org/#default-port
	 * @param {Number|String} port Port number we need to check
	 * @param {String} protocol Protocol we need to check against.
	 * @returns {Boolean} Is it a default port for the given protocol
	 * @api private
	 */
	module.exports = function required(port, protocol) {
	  protocol = protocol.split(':')[0];
	  port = +port;

	  if (!port) return false;

	  switch (protocol) {
	    case 'http':
	    case 'ws':
	    return port !== 80;

	    case 'https':
	    case 'wss':
	    return port !== 443;

	    case 'ftp':
	    return port !== 21;

	    case 'gopher':
	    return port !== 70;

	    case 'file':
	    return false;
	  }

	  return port !== 0;
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	/**
	 * These properties should not be copied or inherited from. This is only needed
	 * for all non blob URL's as the a blob URL does not include a hash, only the
	 * origin.
	 *
	 * @type {Object}
	 * @private
	 */
	var ignore = { hash: 1, query: 1 }
	  , URL;

	/**
	 * The location object differs when your code is loaded through a normal page,
	 * Worker or through a worker using a blob. And with the blobble begins the
	 * trouble as the location object will contain the URL of the blob, not the
	 * location of the page where our code is loaded in. The actual origin is
	 * encoded in the `pathname` so we can thankfully generate a good "default"
	 * location from it so we can generate proper relative URL's again.
	 *
	 * @param {Object|String} loc Optional default location object.
	 * @returns {Object} lolcation object.
	 * @api public
	 */
	module.exports = function lolcation(loc) {
	  loc = loc || global.location || {};
	  URL = URL || __webpack_require__(16);

	  var finaldestination = {}
	    , type = typeof loc
	    , key;

	  if ('blob:' === loc.protocol) {
	    finaldestination = new URL(unescape(loc.pathname), {});
	  } else if ('string' === type) {
	    finaldestination = new URL(loc, {});
	    for (key in ignore) delete finaldestination[key];
	  } else if ('object' === type) for (key in loc) {
	    if (key in ignore) continue;
	    finaldestination[key] = loc[key];
	  }

	  return finaldestination;
	};

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';

	var has = Object.prototype.hasOwnProperty;

	/**
	 * Simple query string parser.
	 *
	 * @param {String} query The query string that needs to be parsed.
	 * @returns {Object}
	 * @api public
	 */
	function querystring(query) {
	  var parser = /([^=?&]+)=([^&]*)/g
	    , result = {}
	    , part;

	  //
	  // Little nifty parsing hack, leverage the fact that RegExp.exec increments
	  // the lastIndex property so we can continue executing this loop until we've
	  // parsed all results.
	  //
	  for (;
	    part = parser.exec(query);
	    result[decodeURIComponent(part[1])] = decodeURIComponent(part[2])
	  );

	  return result;
	}

	/**
	 * Transform a query string to an object.
	 *
	 * @param {Object} obj Object that should be transformed.
	 * @param {String} prefix Optional prefix.
	 * @returns {String}
	 * @api public
	 */
	function querystringify(obj, prefix) {
	  prefix = prefix || '';

	  var pairs = [];

	  //
	  // Optionally prefix with a '?' if needed
	  //
	  if ('string' !== typeof prefix) prefix = '?';

	  for (var key in obj) {
	    if (has.call(obj, key)) {
	      pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
	    }
	  }

	  return pairs.length ? prefix + pairs.join('&') : '';
	}

	//
	// Expose the module.
	//
	exports.stringify = querystringify;
	exports.parse = querystring;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(21);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
	               && 'undefined' != typeof chrome.storage
	                  ? chrome.storage.local
	                  : localstorage();

	/**
	 * Colors.
	 */

	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};


	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;

	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);

	  if (!useColors) return args;

	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });

	  args.splice(lastC, 0, c);
	  return args;
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */

	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      exports.storage.removeItem('debug');
	    } else {
	      exports.storage.debug = namespaces;
	    }
	  } catch(e) {}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  var r;
	  try {
	    r = exports.storage.debug;
	  } catch(e) {}
	  return r;
	}

	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */

	exports.enable(load());

	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */

	function localstorage(){
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(22);

	/**
	 * The currently active debug mode names, and names to skip.
	 */

	exports.names = [];
	exports.skips = [];

	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */

	exports.formatters = {};

	/**
	 * Previously assigned color.
	 */

	var prevColor = 0;

	/**
	 * Previous log timestamp.
	 */

	var prevTime;

	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */

	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}

	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */

	function debug(namespace) {

	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;

	  // define the `enabled` version
	  function enabled() {

	    var self = enabled;

	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;

	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();

	    var args = Array.prototype.slice.call(arguments);

	    args[0] = exports.coerce(args[0]);

	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }

	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);

	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });

	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;

	  var fn = exports.enabled(namespace) ? enabled : disabled;

	  fn.namespace = namespace;

	  return fn;
	}

	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */

	function enable(namespaces) {
	  exports.save(namespaces);

	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;

	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	function disable() {
	  exports.enable('');
	}

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 22 */
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */

	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = '' + str;
	  if (str.length > 10000) return;
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 23 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(23)
	  , EventTarget = __webpack_require__(25)
	  ;

	function EventEmitter() {
	  EventTarget.call(this);
	}

	inherits(EventEmitter, EventTarget);

	EventEmitter.prototype.removeAllListeners = function(type) {
	  if (type) {
	    delete this._listeners[type];
	  } else {
	    this._listeners = {};
	  }
	};

	EventEmitter.prototype.once = function(type, listener) {
	  var self = this
	    , fired = false;

	  function g() {
	    self.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  this.on(type, g);
	};

	EventEmitter.prototype.emit = function(type) {
	  var listeners = this._listeners[type];
	  if (!listeners) {
	    return;
	  }
	  var args = Array.prototype.slice.call(arguments, 1);
	  for (var i = 0; i < listeners.length; i++) {
	    listeners[i].apply(this, args);
	  }
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener = EventTarget.prototype.addEventListener;
	EventEmitter.prototype.removeListener = EventTarget.prototype.removeEventListener;

	module.exports.EventEmitter = EventEmitter;


/***/ },
/* 25 */
/***/ function(module, exports) {

	'use strict';

	/* Simplified implementation of DOM2 EventTarget.
	 *   http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
	 */

	function EventTarget() {
	  this._listeners = {};
	}

	EventTarget.prototype.addEventListener = function(eventType, listener) {
	  if (!(eventType in this._listeners)) {
	    this._listeners[eventType] = [];
	  }
	  var arr = this._listeners[eventType];
	  // #4
	  if (arr.indexOf(listener) === -1) {
	    // Make a copy so as not to interfere with a current dispatchEvent.
	    arr = arr.concat([listener]);
	  }
	  this._listeners[eventType] = arr;
	};

	EventTarget.prototype.removeEventListener = function(eventType, listener) {
	  var arr = this._listeners[eventType];
	  if (!arr) {
	    return;
	  }
	  var idx = arr.indexOf(listener);
	  if (idx !== -1) {
	    if (arr.length > 1) {
	      // Make a copy so as not to interfere with a current dispatchEvent.
	      this._listeners[eventType] = arr.slice(0, idx).concat(arr.slice(idx + 1));
	    } else {
	      delete this._listeners[eventType];
	    }
	    return;
	  }
	};

	EventTarget.prototype.dispatchEvent = function(event) {
	  var t = event.type;
	  var args = Array.prototype.slice.call(arguments, 0);
	  // TODO: This doesn't match the real behavior; per spec, onfoo get
	  // their place in line from the /first/ time they're set from
	  // non-null. Although WebKit bumps it to the end every time it's
	  // set.
	  if (this['on' + t]) {
	    this['on' + t].apply(this, args);
	  }
	  if (t in this._listeners) {
	    // Grab a reference to the listeners list. removeEventListener may alter the list.
	    var listeners = this._listeners[t];
	    for (var i = 0; i < listeners.length; i++) {
	      listeners[i].apply(this, args);
	    }
	  }
	};

	module.exports = EventTarget;


/***/ },
/* 26 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global.WebSocket || global.MozWebSocket;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var inherits = __webpack_require__(23)
	  , AjaxBasedTransport = __webpack_require__(28)
	  , XhrReceiver = __webpack_require__(32)
	  , XHRCorsObject = __webpack_require__(33)
	  , XHRLocalObject = __webpack_require__(35)
	  , browser = __webpack_require__(36)
	  ;

	function XhrStreamingTransport(transUrl) {
	  if (!XHRLocalObject.enabled && !XHRCorsObject.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/xhr_streaming', XhrReceiver, XHRCorsObject);
	}

	inherits(XhrStreamingTransport, AjaxBasedTransport);

	XhrStreamingTransport.enabled = function(info) {
	  if (info.nullOrigin) {
	    return false;
	  }
	  // Opera doesn't support xhr-streaming #60
	  // But it might be able to #92
	  if (browser.isOpera()) {
	    return false;
	  }

	  return XHRCorsObject.enabled;
	};

	XhrStreamingTransport.transportName = 'xhr-streaming';
	XhrStreamingTransport.roundTrips = 2; // preflight, ajax

	// Safari gets confused when a streaming ajax request is started
	// before onload. This causes the load indicator to spin indefinetely.
	// Only require body when used in a browser
	XhrStreamingTransport.needBody = !!global.document;

	module.exports = XhrStreamingTransport;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var inherits = __webpack_require__(23)
	  , urlUtils = __webpack_require__(15)
	  , SenderReceiver = __webpack_require__(29)
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:ajax-based');
	}

	function createAjaxSender(AjaxObject) {
	  return function(url, payload, callback) {
	    debug('create ajax sender', url, payload);
	    var opt = {};
	    if (typeof payload === 'string') {
	      opt.headers = {'Content-type':'text/plain'};
	    }
	    var ajaxUrl = urlUtils.addPath(url, '/xhr_send');
	    var xo = new AjaxObject('POST', ajaxUrl, payload, opt);
	    xo.once('finish', function(status) {
	      debug('finish', status);
	      xo = null;

	      if (status !== 200 && status !== 204) {
	        return callback(new Error('http status ' + status));
	      }
	      callback();
	    });
	    return function() {
	      debug('abort');
	      xo.close();
	      xo = null;

	      var err = new Error('Aborted');
	      err.code = 1000;
	      callback(err);
	    };
	  };
	}

	function AjaxBasedTransport(transUrl, urlSuffix, Receiver, AjaxObject) {
	  SenderReceiver.call(this, transUrl, urlSuffix, createAjaxSender(AjaxObject), Receiver, AjaxObject);
	}

	inherits(AjaxBasedTransport, SenderReceiver);

	module.exports = AjaxBasedTransport;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var inherits = __webpack_require__(23)
	  , urlUtils = __webpack_require__(15)
	  , BufferedSender = __webpack_require__(30)
	  , Polling = __webpack_require__(31)
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:sender-receiver');
	}

	function SenderReceiver(transUrl, urlSuffix, senderFunc, Receiver, AjaxObject) {
	  var pollUrl = urlUtils.addPath(transUrl, urlSuffix);
	  debug(pollUrl);
	  var self = this;
	  BufferedSender.call(this, transUrl, senderFunc);

	  this.poll = new Polling(Receiver, pollUrl, AjaxObject);
	  this.poll.on('message', function(msg) {
	    debug('poll message', msg);
	    self.emit('message', msg);
	  });
	  this.poll.once('close', function(code, reason) {
	    debug('poll close', code, reason);
	    self.poll = null;
	    self.emit('close', code, reason);
	    self.close();
	  });
	}

	inherits(SenderReceiver, BufferedSender);

	SenderReceiver.prototype.close = function() {
	  debug('close');
	  this.removeAllListeners();
	  if (this.poll) {
	    this.poll.abort();
	    this.poll = null;
	  }
	  this.stop();
	};

	module.exports = SenderReceiver;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var inherits = __webpack_require__(23)
	  , EventEmitter = __webpack_require__(24).EventEmitter
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:buffered-sender');
	}

	function BufferedSender(url, sender) {
	  debug(url);
	  EventEmitter.call(this);
	  this.sendBuffer = [];
	  this.sender = sender;
	  this.url = url;
	}

	inherits(BufferedSender, EventEmitter);

	BufferedSender.prototype.send = function(message) {
	  debug('send', message);
	  this.sendBuffer.push(message);
	  if (!this.sendStop) {
	    this.sendSchedule();
	  }
	};

	// For polling transports in a situation when in the message callback,
	// new message is being send. If the sending connection was started
	// before receiving one, it is possible to saturate the network and
	// timeout due to the lack of receiving socket. To avoid that we delay
	// sending messages by some small time, in order to let receiving
	// connection be started beforehand. This is only a halfmeasure and
	// does not fix the big problem, but it does make the tests go more
	// stable on slow networks.
	BufferedSender.prototype.sendScheduleWait = function() {
	  debug('sendScheduleWait');
	  var self = this;
	  var tref;
	  this.sendStop = function() {
	    debug('sendStop');
	    self.sendStop = null;
	    clearTimeout(tref);
	  };
	  tref = setTimeout(function() {
	    debug('timeout');
	    self.sendStop = null;
	    self.sendSchedule();
	  }, 25);
	};

	BufferedSender.prototype.sendSchedule = function() {
	  debug('sendSchedule', this.sendBuffer.length);
	  var self = this;
	  if (this.sendBuffer.length > 0) {
	    var payload = '[' + this.sendBuffer.join(',') + ']';
	    this.sendStop = this.sender(this.url, payload, function(err) {
	      self.sendStop = null;
	      if (err) {
	        debug('error', err);
	        self.emit('close', err.code || 1006, 'Sending error: ' + err);
	        self._cleanup();
	      } else {
	        self.sendScheduleWait();
	      }
	    });
	    this.sendBuffer = [];
	  }
	};

	BufferedSender.prototype._cleanup = function() {
	  debug('_cleanup');
	  this.removeAllListeners();
	};

	BufferedSender.prototype.stop = function() {
	  debug('stop');
	  this._cleanup();
	  if (this.sendStop) {
	    this.sendStop();
	    this.sendStop = null;
	  }
	};

	module.exports = BufferedSender;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var inherits = __webpack_require__(23)
	  , EventEmitter = __webpack_require__(24).EventEmitter
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:polling');
	}

	function Polling(Receiver, receiveUrl, AjaxObject) {
	  debug(receiveUrl);
	  EventEmitter.call(this);
	  this.Receiver = Receiver;
	  this.receiveUrl = receiveUrl;
	  this.AjaxObject = AjaxObject;
	  this._scheduleReceiver();
	}

	inherits(Polling, EventEmitter);

	Polling.prototype._scheduleReceiver = function() {
	  debug('_scheduleReceiver');
	  var self = this;
	  var poll = this.poll = new this.Receiver(this.receiveUrl, this.AjaxObject);

	  poll.on('message', function(msg) {
	    debug('message', msg);
	    self.emit('message', msg);
	  });

	  poll.once('close', function(code, reason) {
	    debug('close', code, reason, self.pollIsClosing);
	    self.poll = poll = null;

	    if (!self.pollIsClosing) {
	      if (reason === 'network') {
	        self._scheduleReceiver();
	      } else {
	        self.emit('close', code || 1006, reason);
	        self.removeAllListeners();
	      }
	    }
	  });
	};

	Polling.prototype.abort = function() {
	  debug('abort');
	  this.removeAllListeners();
	  this.pollIsClosing = true;
	  if (this.poll) {
	    this.poll.abort();
	  }
	};

	module.exports = Polling;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var inherits = __webpack_require__(23)
	  , EventEmitter = __webpack_require__(24).EventEmitter
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:receiver:xhr');
	}

	function XhrReceiver(url, AjaxObject) {
	  debug(url);
	  EventEmitter.call(this);
	  var self = this;

	  this.bufferPosition = 0;

	  this.xo = new AjaxObject('POST', url, null);
	  this.xo.on('chunk', this._chunkHandler.bind(this));
	  this.xo.once('finish', function(status, text) {
	    debug('finish', status, text);
	    self._chunkHandler(status, text);
	    self.xo = null;
	    var reason = status === 200 ? 'network' : 'permanent';
	    debug('close', reason);
	    self.emit('close', null, reason);
	    self._cleanup();
	  });
	}

	inherits(XhrReceiver, EventEmitter);

	XhrReceiver.prototype._chunkHandler = function(status, text) {
	  debug('_chunkHandler', status);
	  if (status !== 200 || !text) {
	    return;
	  }

	  for (var idx = -1; ; this.bufferPosition += idx + 1) {
	    var buf = text.slice(this.bufferPosition);
	    idx = buf.indexOf('\n');
	    if (idx === -1) {
	      break;
	    }
	    var msg = buf.slice(0, idx);
	    if (msg) {
	      debug('message', msg);
	      this.emit('message', msg);
	    }
	  }
	};

	XhrReceiver.prototype._cleanup = function() {
	  debug('_cleanup');
	  this.removeAllListeners();
	};

	XhrReceiver.prototype.abort = function() {
	  debug('abort');
	  if (this.xo) {
	    this.xo.close();
	    debug('close');
	    this.emit('close', null, 'user');
	    this.xo = null;
	  }
	  this._cleanup();
	};

	module.exports = XhrReceiver;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(23)
	  , XhrDriver = __webpack_require__(34)
	  ;

	function XHRCorsObject(method, url, payload, opts) {
	  XhrDriver.call(this, method, url, payload, opts);
	}

	inherits(XHRCorsObject, XhrDriver);

	XHRCorsObject.enabled = XhrDriver.enabled && XhrDriver.supportsCORS;

	module.exports = XHRCorsObject;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {'use strict';

	var EventEmitter = __webpack_require__(24).EventEmitter
	  , inherits = __webpack_require__(23)
	  , utils = __webpack_require__(12)
	  , urlUtils = __webpack_require__(15)
	  , XHR = global.XMLHttpRequest
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:browser:xhr');
	}

	function AbstractXHRObject(method, url, payload, opts) {
	  debug(method, url);
	  var self = this;
	  EventEmitter.call(this);

	  setTimeout(function () {
	    self._start(method, url, payload, opts);
	  }, 0);
	}

	inherits(AbstractXHRObject, EventEmitter);

	AbstractXHRObject.prototype._start = function(method, url, payload, opts) {
	  var self = this;

	  try {
	    this.xhr = new XHR();
	  } catch (x) {}

	  if (!this.xhr) {
	    debug('no xhr');
	    this.emit('finish', 0, 'no xhr support');
	    this._cleanup();
	    return;
	  }

	  // several browsers cache POSTs
	  url = urlUtils.addQuery(url, 't=' + (+new Date()));

	  // Explorer tends to keep connection open, even after the
	  // tab gets closed: http://bugs.jquery.com/ticket/5280
	  this.unloadRef = utils.unloadAdd(function() {
	    debug('unload cleanup');
	    self._cleanup(true);
	  });
	  try {
	    this.xhr.open(method, url, true);
	    if (this.timeout && 'timeout' in this.xhr) {
	      this.xhr.timeout = this.timeout;
	      this.xhr.ontimeout = function() {
	        debug('xhr timeout');
	        self.emit('finish', 0, '');
	        self._cleanup(false);
	      };
	    }
	  } catch (e) {
	    debug('exception', e);
	    // IE raises an exception on wrong port.
	    this.emit('finish', 0, '');
	    this._cleanup(false);
	    return;
	  }

	  if ((!opts || !opts.noCredentials) && AbstractXHRObject.supportsCORS) {
	    debug('withCredentials');
	    // Mozilla docs says https://developer.mozilla.org/en/XMLHttpRequest :
	    // "This never affects same-site requests."

	    this.xhr.withCredentials = 'true';
	  }
	  if (opts && opts.headers) {
	    for (var key in opts.headers) {
	      this.xhr.setRequestHeader(key, opts.headers[key]);
	    }
	  }

	  this.xhr.onreadystatechange = function() {
	    if (self.xhr) {
	      var x = self.xhr;
	      var text, status;
	      debug('readyState', x.readyState);
	      switch (x.readyState) {
	      case 3:
	        // IE doesn't like peeking into responseText or status
	        // on Microsoft.XMLHTTP and readystate=3
	        try {
	          status = x.status;
	          text = x.responseText;
	        } catch (e) {}
	        debug('status', status);
	        // IE returns 1223 for 204: http://bugs.jquery.com/ticket/1450
	        if (status === 1223) {
	          status = 204;
	        }

	        // IE does return readystate == 3 for 404 answers.
	        if (status === 200 && text && text.length > 0) {
	          debug('chunk');
	          self.emit('chunk', status, text);
	        }
	        break;
	      case 4:
	        status = x.status;
	        debug('status', status);
	        // IE returns 1223 for 204: http://bugs.jquery.com/ticket/1450
	        if (status === 1223) {
	          status = 204;
	        }
	        // IE returns this for a bad port
	        // http://msdn.microsoft.com/en-us/library/windows/desktop/aa383770(v=vs.85).aspx
	        if (status === 12005 || status === 12029) {
	          status = 0;
	        }

	        debug('finish', status, x.responseText);
	        self.emit('finish', status, x.responseText);
	        self._cleanup(false);
	        break;
	      }
	    }
	  };

	  try {
	    self.xhr.send(payload);
	  } catch (e) {
	    self.emit('finish', 0, '');
	    self._cleanup(false);
	  }
	};

	AbstractXHRObject.prototype._cleanup = function(abort) {
	  debug('cleanup');
	  if (!this.xhr) {
	    return;
	  }
	  this.removeAllListeners();
	  utils.unloadDel(this.unloadRef);

	  // IE needs this field to be a function
	  this.xhr.onreadystatechange = function() {};
	  if (this.xhr.ontimeout) {
	    this.xhr.ontimeout = null;
	  }

	  if (abort) {
	    try {
	      this.xhr.abort();
	    } catch (x) {}
	  }
	  this.unloadRef = this.xhr = null;
	};

	AbstractXHRObject.prototype.close = function() {
	  debug('close');
	  this._cleanup(true);
	};

	AbstractXHRObject.enabled = !!XHR;
	// override XMLHttpRequest for IE6/7
	// obfuscate to avoid firewalls
	var axo = ['Active'].concat('Object').join('X');
	if (!AbstractXHRObject.enabled && (axo in global)) {
	  debug('overriding xmlhttprequest');
	  XHR = function() {
	    try {
	      return new global[axo]('Microsoft.XMLHTTP');
	    } catch (e) {
	      return null;
	    }
	  };
	  AbstractXHRObject.enabled = !!new XHR();
	}

	var cors = false;
	try {
	  cors = 'withCredentials' in new XHR();
	} catch (ignored) {}

	AbstractXHRObject.supportsCORS = cors;

	module.exports = AbstractXHRObject;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(11)))

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(23)
	  , XhrDriver = __webpack_require__(34)
	  ;

	function XHRLocalObject(method, url, payload /*, opts */) {
	  XhrDriver.call(this, method, url, payload, {
	    noCredentials: true
	  });
	}

	inherits(XHRLocalObject, XhrDriver);

	XHRLocalObject.enabled = XhrDriver.enabled;

	module.exports = XHRLocalObject;


/***/ },
/* 36 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	module.exports = {
	  isOpera: function() {
	    return global.navigator &&
	      /opera/i.test(global.navigator.userAgent);
	  }

	, isKonqueror: function() {
	    return global.navigator &&
	      /konqueror/i.test(global.navigator.userAgent);
	  }

	  // #187 wrap document.domain in try/catch because of WP8 from file:///
	, hasDomain: function () {
	    // non-browser client always has a domain
	    if (!global.document) {
	      return true;
	    }

	    try {
	      return !!global.document.domain;
	    } catch (e) {
	      return false;
	    }
	  }
	};

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(23)
	  , AjaxBasedTransport = __webpack_require__(28)
	  , XhrReceiver = __webpack_require__(32)
	  , XDRObject = __webpack_require__(38)
	  ;

	// According to:
	//   http://stackoverflow.com/questions/1641507/detect-browser-support-for-cross-domain-xmlhttprequests
	//   http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/

	function XdrStreamingTransport(transUrl) {
	  if (!XDRObject.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/xhr_streaming', XhrReceiver, XDRObject);
	}

	inherits(XdrStreamingTransport, AjaxBasedTransport);

	XdrStreamingTransport.enabled = function(info) {
	  if (info.cookie_needed || info.nullOrigin) {
	    return false;
	  }
	  return XDRObject.enabled && info.sameScheme;
	};

	XdrStreamingTransport.transportName = 'xdr-streaming';
	XdrStreamingTransport.roundTrips = 2; // preflight, ajax

	module.exports = XdrStreamingTransport;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, global) {'use strict';

	var EventEmitter = __webpack_require__(24).EventEmitter
	  , inherits = __webpack_require__(23)
	  , eventUtils = __webpack_require__(12)
	  , browser = __webpack_require__(36)
	  , urlUtils = __webpack_require__(15)
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:sender:xdr');
	}

	// References:
	//   http://ajaxian.com/archives/100-line-ajax-wrapper
	//   http://msdn.microsoft.com/en-us/library/cc288060(v=VS.85).aspx

	function XDRObject(method, url, payload) {
	  debug(method, url);
	  var self = this;
	  EventEmitter.call(this);

	  setTimeout(function() {
	    self._start(method, url, payload);
	  }, 0);
	}

	inherits(XDRObject, EventEmitter);

	XDRObject.prototype._start = function(method, url, payload) {
	  debug('_start');
	  var self = this;
	  var xdr = new global.XDomainRequest();
	  // IE caches even POSTs
	  url = urlUtils.addQuery(url, 't=' + (+new Date()));

	  xdr.onerror = function() {
	    debug('onerror');
	    self._error();
	  };
	  xdr.ontimeout = function() {
	    debug('ontimeout');
	    self._error();
	  };
	  xdr.onprogress = function() {
	    debug('progress', xdr.responseText);
	    self.emit('chunk', 200, xdr.responseText);
	  };
	  xdr.onload = function() {
	    debug('load');
	    self.emit('finish', 200, xdr.responseText);
	    self._cleanup(false);
	  };
	  this.xdr = xdr;
	  this.unloadRef = eventUtils.unloadAdd(function() {
	    self._cleanup(true);
	  });
	  try {
	    // Fails with AccessDenied if port number is bogus
	    this.xdr.open(method, url);
	    if (this.timeout) {
	      this.xdr.timeout = this.timeout;
	    }
	    this.xdr.send(payload);
	  } catch (x) {
	    this._error();
	  }
	};

	XDRObject.prototype._error = function() {
	  this.emit('finish', 0, '');
	  this._cleanup(false);
	};

	XDRObject.prototype._cleanup = function(abort) {
	  debug('cleanup', abort);
	  if (!this.xdr) {
	    return;
	  }
	  this.removeAllListeners();
	  eventUtils.unloadDel(this.unloadRef);

	  this.xdr.ontimeout = this.xdr.onerror = this.xdr.onprogress = this.xdr.onload = null;
	  if (abort) {
	    try {
	      this.xdr.abort();
	    } catch (x) {}
	  }
	  this.unloadRef = this.xdr = null;
	};

	XDRObject.prototype.close = function() {
	  debug('close');
	  this._cleanup(true);
	};

	// IE 8/9 if the request target uses the same scheme - #79
	XDRObject.enabled = !!(global.XDomainRequest && browser.hasDomain());

	module.exports = XDRObject;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11), (function() { return this; }())))

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(23)
	  , AjaxBasedTransport = __webpack_require__(28)
	  , EventSourceReceiver = __webpack_require__(40)
	  , XHRCorsObject = __webpack_require__(33)
	  , EventSourceDriver = __webpack_require__(41)
	  ;

	function EventSourceTransport(transUrl) {
	  if (!EventSourceTransport.enabled()) {
	    throw new Error('Transport created when disabled');
	  }

	  AjaxBasedTransport.call(this, transUrl, '/eventsource', EventSourceReceiver, XHRCorsObject);
	}

	inherits(EventSourceTransport, AjaxBasedTransport);

	EventSourceTransport.enabled = function() {
	  return !!EventSourceDriver;
	};

	EventSourceTransport.transportName = 'eventsource';
	EventSourceTransport.roundTrips = 2;

	module.exports = EventSourceTransport;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var inherits = __webpack_require__(23)
	  , EventEmitter = __webpack_require__(24).EventEmitter
	  , EventSourceDriver = __webpack_require__(41)
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:receiver:eventsource');
	}

	function EventSourceReceiver(url) {
	  debug(url);
	  EventEmitter.call(this);

	  var self = this;
	  var es = this.es = new EventSourceDriver(url);
	  es.onmessage = function(e) {
	    debug('message', e.data);
	    self.emit('message', decodeURI(e.data));
	  };
	  es.onerror = function(e) {
	    debug('error', es.readyState, e);
	    // ES on reconnection has readyState = 0 or 1.
	    // on network error it's CLOSED = 2
	    var reason = (es.readyState !== 2 ? 'network' : 'permanent');
	    self._cleanup();
	    self._close(reason);
	  };
	}

	inherits(EventSourceReceiver, EventEmitter);

	EventSourceReceiver.prototype.abort = function() {
	  debug('abort');
	  this._cleanup();
	  this._close('user');
	};

	EventSourceReceiver.prototype._cleanup = function() {
	  debug('cleanup');
	  var es = this.es;
	  if (es) {
	    es.onmessage = es.onerror = null;
	    es.close();
	    this.es = null;
	  }
	};

	EventSourceReceiver.prototype._close = function(reason) {
	  debug('close', reason);
	  var self = this;
	  // Safari and chrome < 15 crash if we close window before
	  // waiting for ES cleanup. See:
	  // https://code.google.com/p/chromium/issues/detail?id=89155
	  setTimeout(function() {
	    self.emit('close', null, reason);
	    self.removeAllListeners();
	  }, 200);
	};

	module.exports = EventSourceReceiver;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 41 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global.EventSource;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var inherits = __webpack_require__(23)
	  , IframeTransport = __webpack_require__(43)
	  , objectUtils = __webpack_require__(48)
	  ;

	module.exports = function(transport) {

	  function IframeWrapTransport(transUrl, baseUrl) {
	    IframeTransport.call(this, transport.transportName, transUrl, baseUrl);
	  }

	  inherits(IframeWrapTransport, IframeTransport);

	  IframeWrapTransport.enabled = function(url, info) {
	    if (!global.document) {
	      return false;
	    }

	    var iframeInfo = objectUtils.extend({}, info);
	    iframeInfo.sameOrigin = true;
	    return transport.enabled(iframeInfo) && IframeTransport.enabled();
	  };

	  IframeWrapTransport.transportName = 'iframe-' + transport.transportName;
	  IframeWrapTransport.needBody = true;
	  IframeWrapTransport.roundTrips = IframeTransport.roundTrips + transport.roundTrips - 1; // html, javascript (2) + transport - no CORS (1)

	  IframeWrapTransport.facadeTransport = transport;

	  return IframeWrapTransport;
	};

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	// Few cool transports do work only for same-origin. In order to make
	// them work cross-domain we shall use iframe, served from the
	// remote domain. New browsers have capabilities to communicate with
	// cross domain iframe using postMessage(). In IE it was implemented
	// from IE 8+, but of course, IE got some details wrong:
	//    http://msdn.microsoft.com/en-us/library/cc197015(v=VS.85).aspx
	//    http://stevesouders.com/misc/test-postmessage.php

	var inherits = __webpack_require__(23)
	  , JSON3 = __webpack_require__(44)
	  , EventEmitter = __webpack_require__(24).EventEmitter
	  , version = __webpack_require__(46)
	  , urlUtils = __webpack_require__(15)
	  , iframeUtils = __webpack_require__(47)
	  , eventUtils = __webpack_require__(12)
	  , random = __webpack_require__(13)
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:transport:iframe');
	}

	function IframeTransport(transport, transUrl, baseUrl) {
	  if (!IframeTransport.enabled()) {
	    throw new Error('Transport created when disabled');
	  }
	  EventEmitter.call(this);

	  var self = this;
	  this.origin = urlUtils.getOrigin(baseUrl);
	  this.baseUrl = baseUrl;
	  this.transUrl = transUrl;
	  this.transport = transport;
	  this.windowId = random.string(8);

	  var iframeUrl = urlUtils.addPath(baseUrl, '/iframe.html') + '#' + this.windowId;
	  debug(transport, transUrl, iframeUrl);

	  this.iframeObj = iframeUtils.createIframe(iframeUrl, function(r) {
	    debug('err callback');
	    self.emit('close', 1006, 'Unable to load an iframe (' + r + ')');
	    self.close();
	  });

	  this.onmessageCallback = this._message.bind(this);
	  eventUtils.attachEvent('message', this.onmessageCallback);
	}

	inherits(IframeTransport, EventEmitter);

	IframeTransport.prototype.close = function() {
	  debug('close');
	  this.removeAllListeners();
	  if (this.iframeObj) {
	    eventUtils.detachEvent('message', this.onmessageCallback);
	    try {
	      // When the iframe is not loaded, IE raises an exception
	      // on 'contentWindow'.
	      this.postMessage('c');
	    } catch (x) {}
	    this.iframeObj.cleanup();
	    this.iframeObj = null;
	    this.onmessageCallback = this.iframeObj = null;
	  }
	};

	IframeTransport.prototype._message = function(e) {
	  debug('message', e.data);
	  if (!urlUtils.isOriginEqual(e.origin, this.origin)) {
	    debug('not same origin', e.origin, this.origin);
	    return;
	  }

	  var iframeMessage;
	  try {
	    iframeMessage = JSON3.parse(e.data);
	  } catch (ignored) {
	    debug('bad json', e.data);
	    return;
	  }

	  if (iframeMessage.windowId !== this.windowId) {
	    debug('mismatched window id', iframeMessage.windowId, this.windowId);
	    return;
	  }

	  switch (iframeMessage.type) {
	  case 's':
	    this.iframeObj.loaded();
	    // window global dependency
	    this.postMessage('s', JSON3.stringify([
	      version
	    , this.transport
	    , this.transUrl
	    , this.baseUrl
	    ]));
	    break;
	  case 't':
	    this.emit('message', iframeMessage.data);
	    break;
	  case 'c':
	    var cdata;
	    try {
	      cdata = JSON3.parse(iframeMessage.data);
	    } catch (ignored) {
	      debug('bad json', iframeMessage.data);
	      return;
	    }
	    this.emit('close', cdata[0], cdata[1]);
	    this.close();
	    break;
	  }
	};

	IframeTransport.prototype.postMessage = function(type, data) {
	  debug('postMessage', type, data);
	  this.iframeObj.post(JSON3.stringify({
	    windowId: this.windowId
	  , type: type
	  , data: data || ''
	  }), this.origin);
	};

	IframeTransport.prototype.send = function(message) {
	  debug('send', message);
	  this.postMessage('m', message);
	};

	IframeTransport.enabled = function() {
	  return iframeUtils.iframeEnabled;
	};

	IframeTransport.transportName = 'iframe';
	IframeTransport.roundTrips = 2;

	module.exports = IframeTransport;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
	;(function () {
	  // Detect the `define` function exposed by asynchronous module loaders. The
	  // strict `define` check is necessary for compatibility with `r.js`.
	  var isLoader = "function" === "function" && __webpack_require__(45);

	  // A set of types used to distinguish objects from primitives.
	  var objectTypes = {
	    "function": true,
	    "object": true
	  };

	  // Detect the `exports` object exposed by CommonJS implementations.
	  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

	  // Use the `global` object exposed by Node (including Browserify via
	  // `insert-module-globals`), Narwhal, and Ringo as the default context,
	  // and the `window` object in browsers. Rhino exports a `global` function
	  // instead.
	  var root = objectTypes[typeof window] && window || this,
	      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

	  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
	    root = freeGlobal;
	  }

	  // Public: Initializes JSON 3 using the given `context` object, attaching the
	  // `stringify` and `parse` functions to the specified `exports` object.
	  function runInContext(context, exports) {
	    context || (context = root["Object"]());
	    exports || (exports = root["Object"]());

	    // Native constructor aliases.
	    var Number = context["Number"] || root["Number"],
	        String = context["String"] || root["String"],
	        Object = context["Object"] || root["Object"],
	        Date = context["Date"] || root["Date"],
	        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
	        TypeError = context["TypeError"] || root["TypeError"],
	        Math = context["Math"] || root["Math"],
	        nativeJSON = context["JSON"] || root["JSON"];

	    // Delegate to the native `stringify` and `parse` implementations.
	    if (typeof nativeJSON == "object" && nativeJSON) {
	      exports.stringify = nativeJSON.stringify;
	      exports.parse = nativeJSON.parse;
	    }

	    // Convenience aliases.
	    var objectProto = Object.prototype,
	        getClass = objectProto.toString,
	        isProperty, forEach, undef;

	    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
	    var isExtended = new Date(-3509827334573292);
	    try {
	      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
	      // results for certain dates in Opera >= 10.53.
	      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
	        // Safari < 2.0.2 stores the internal millisecond time value correctly,
	        // but clips the values returned by the date methods to the range of
	        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
	        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
	    } catch (exception) {}

	    // Internal: Determines whether the native `JSON.stringify` and `parse`
	    // implementations are spec-compliant. Based on work by Ken Snyder.
	    function has(name) {
	      if (has[name] !== undef) {
	        // Return cached feature test result.
	        return has[name];
	      }
	      var isSupported;
	      if (name == "bug-string-char-index") {
	        // IE <= 7 doesn't support accessing string characters using square
	        // bracket notation. IE 8 only supports this for primitives.
	        isSupported = "a"[0] != "a";
	      } else if (name == "json") {
	        // Indicates whether both `JSON.stringify` and `JSON.parse` are
	        // supported.
	        isSupported = has("json-stringify") && has("json-parse");
	      } else {
	        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
	        // Test `JSON.stringify`.
	        if (name == "json-stringify") {
	          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
	          if (stringifySupported) {
	            // A test function object with a custom `toJSON` method.
	            (value = function () {
	              return 1;
	            }).toJSON = value;
	            try {
	              stringifySupported =
	                // Firefox 3.1b1 and b2 serialize string, number, and boolean
	                // primitives as object literals.
	                stringify(0) === "0" &&
	                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
	                // literals.
	                stringify(new Number()) === "0" &&
	                stringify(new String()) == '""' &&
	                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
	                // does not define a canonical JSON representation (this applies to
	                // objects with `toJSON` properties as well, *unless* they are nested
	                // within an object or array).
	                stringify(getClass) === undef &&
	                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
	                // FF 3.1b3 pass this test.
	                stringify(undef) === undef &&
	                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
	                // respectively, if the value is omitted entirely.
	                stringify() === undef &&
	                // FF 3.1b1, 2 throw an error if the given value is not a number,
	                // string, array, object, Boolean, or `null` literal. This applies to
	                // objects with custom `toJSON` methods as well, unless they are nested
	                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
	                // methods entirely.
	                stringify(value) === "1" &&
	                stringify([value]) == "[1]" &&
	                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
	                // `"[null]"`.
	                stringify([undef]) == "[null]" &&
	                // YUI 3.0.0b1 fails to serialize `null` literals.
	                stringify(null) == "null" &&
	                // FF 3.1b1, 2 halts serialization if an array contains a function:
	                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
	                // elides non-JSON values from objects and arrays, unless they
	                // define custom `toJSON` methods.
	                stringify([undef, getClass, null]) == "[null,null,null]" &&
	                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
	                // where character escape codes are expected (e.g., `\b` => `\u0008`).
	                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
	                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
	                stringify(null, value) === "1" &&
	                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
	                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
	                // serialize extended years.
	                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
	                // The milliseconds are optional in ES 5, but required in 5.1.
	                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
	                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
	                // four-digit years instead of six-digit years. Credits: @Yaffle.
	                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
	                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
	                // values less than 1000. Credits: @Yaffle.
	                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
	            } catch (exception) {
	              stringifySupported = false;
	            }
	          }
	          isSupported = stringifySupported;
	        }
	        // Test `JSON.parse`.
	        if (name == "json-parse") {
	          var parse = exports.parse;
	          if (typeof parse == "function") {
	            try {
	              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
	              // Conforming implementations should also coerce the initial argument to
	              // a string prior to parsing.
	              if (parse("0") === 0 && !parse(false)) {
	                // Simple parsing test.
	                value = parse(serialized);
	                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
	                if (parseSupported) {
	                  try {
	                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
	                    parseSupported = !parse('"\t"');
	                  } catch (exception) {}
	                  if (parseSupported) {
	                    try {
	                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
	                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
	                      // certain octal literals.
	                      parseSupported = parse("01") !== 1;
	                    } catch (exception) {}
	                  }
	                  if (parseSupported) {
	                    try {
	                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
	                      // points. These environments, along with FF 3.1b1 and 2,
	                      // also allow trailing commas in JSON objects and arrays.
	                      parseSupported = parse("1.") !== 1;
	                    } catch (exception) {}
	                  }
	                }
	              }
	            } catch (exception) {
	              parseSupported = false;
	            }
	          }
	          isSupported = parseSupported;
	        }
	      }
	      return has[name] = !!isSupported;
	    }

	    if (!has("json")) {
	      // Common `[[Class]]` name aliases.
	      var functionClass = "[object Function]",
	          dateClass = "[object Date]",
	          numberClass = "[object Number]",
	          stringClass = "[object String]",
	          arrayClass = "[object Array]",
	          booleanClass = "[object Boolean]";

	      // Detect incomplete support for accessing string characters by index.
	      var charIndexBuggy = has("bug-string-char-index");

	      // Define additional utility methods if the `Date` methods are buggy.
	      if (!isExtended) {
	        var floor = Math.floor;
	        // A mapping between the months of the year and the number of days between
	        // January 1st and the first of the respective month.
	        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	        // Internal: Calculates the number of days between the Unix epoch and the
	        // first day of the given month.
	        var getDay = function (year, month) {
	          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
	        };
	      }

	      // Internal: Determines if a property is a direct property of the given
	      // object. Delegates to the native `Object#hasOwnProperty` method.
	      if (!(isProperty = objectProto.hasOwnProperty)) {
	        isProperty = function (property) {
	          var members = {}, constructor;
	          if ((members.__proto__ = null, members.__proto__ = {
	            // The *proto* property cannot be set multiple times in recent
	            // versions of Firefox and SeaMonkey.
	            "toString": 1
	          }, members).toString != getClass) {
	            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
	            // supports the mutable *proto* property.
	            isProperty = function (property) {
	              // Capture and break the object's prototype chain (see section 8.6.2
	              // of the ES 5.1 spec). The parenthesized expression prevents an
	              // unsafe transformation by the Closure Compiler.
	              var original = this.__proto__, result = property in (this.__proto__ = null, this);
	              // Restore the original prototype chain.
	              this.__proto__ = original;
	              return result;
	            };
	          } else {
	            // Capture a reference to the top-level `Object` constructor.
	            constructor = members.constructor;
	            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
	            // other environments.
	            isProperty = function (property) {
	              var parent = (this.constructor || constructor).prototype;
	              return property in this && !(property in parent && this[property] === parent[property]);
	            };
	          }
	          members = null;
	          return isProperty.call(this, property);
	        };
	      }

	      // Internal: Normalizes the `for...in` iteration algorithm across
	      // environments. Each enumerated key is yielded to a `callback` function.
	      forEach = function (object, callback) {
	        var size = 0, Properties, members, property;

	        // Tests for bugs in the current environment's `for...in` algorithm. The
	        // `valueOf` property inherits the non-enumerable flag from
	        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
	        (Properties = function () {
	          this.valueOf = 0;
	        }).prototype.valueOf = 0;

	        // Iterate over a new instance of the `Properties` class.
	        members = new Properties();
	        for (property in members) {
	          // Ignore all properties inherited from `Object.prototype`.
	          if (isProperty.call(members, property)) {
	            size++;
	          }
	        }
	        Properties = members = null;

	        // Normalize the iteration algorithm.
	        if (!size) {
	          // A list of non-enumerable properties inherited from `Object.prototype`.
	          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
	          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
	          // properties.
	          forEach = function (object, callback) {
	            var isFunction = getClass.call(object) == functionClass, property, length;
	            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
	            for (property in object) {
	              // Gecko <= 1.0 enumerates the `prototype` property of functions under
	              // certain conditions; IE does not.
	              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
	                callback(property);
	              }
	            }
	            // Manually invoke the callback for each non-enumerable property.
	            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
	          };
	        } else if (size == 2) {
	          // Safari <= 2.0.4 enumerates shadowed properties twice.
	          forEach = function (object, callback) {
	            // Create a set of iterated properties.
	            var members = {}, isFunction = getClass.call(object) == functionClass, property;
	            for (property in object) {
	              // Store each property name to prevent double enumeration. The
	              // `prototype` property of functions is not enumerated due to cross-
	              // environment inconsistencies.
	              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
	                callback(property);
	              }
	            }
	          };
	        } else {
	          // No bugs detected; use the standard `for...in` algorithm.
	          forEach = function (object, callback) {
	            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
	            for (property in object) {
	              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
	                callback(property);
	              }
	            }
	            // Manually invoke the callback for the `constructor` property due to
	            // cross-environment inconsistencies.
	            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
	              callback(property);
	            }
	          };
	        }
	        return forEach(object, callback);
	      };

	      // Public: Serializes a JavaScript `value` as a JSON string. The optional
	      // `filter` argument may specify either a function that alters how object and
	      // array members are serialized, or an array of strings and numbers that
	      // indicates which properties should be serialized. The optional `width`
	      // argument may be either a string or number that specifies the indentation
	      // level of the output.
	      if (!has("json-stringify")) {
	        // Internal: A map of control characters and their escaped equivalents.
	        var Escapes = {
	          92: "\\\\",
	          34: '\\"',
	          8: "\\b",
	          12: "\\f",
	          10: "\\n",
	          13: "\\r",
	          9: "\\t"
	        };

	        // Internal: Converts `value` into a zero-padded string such that its
	        // length is at least equal to `width`. The `width` must be <= 6.
	        var leadingZeroes = "000000";
	        var toPaddedString = function (width, value) {
	          // The `|| 0` expression is necessary to work around a bug in
	          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
	          return (leadingZeroes + (value || 0)).slice(-width);
	        };

	        // Internal: Double-quotes a string `value`, replacing all ASCII control
	        // characters (characters with code unit values between 0 and 31) with
	        // their escaped equivalents. This is an implementation of the
	        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
	        var unicodePrefix = "\\u00";
	        var quote = function (value) {
	          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
	          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
	          for (; index < length; index++) {
	            var charCode = value.charCodeAt(index);
	            // If the character is a control character, append its Unicode or
	            // shorthand escape sequence; otherwise, append the character as-is.
	            switch (charCode) {
	              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
	                result += Escapes[charCode];
	                break;
	              default:
	                if (charCode < 32) {
	                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
	                  break;
	                }
	                result += useCharIndex ? symbols[index] : value.charAt(index);
	            }
	          }
	          return result + '"';
	        };

	        // Internal: Recursively serializes an object. Implements the
	        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
	        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
	          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
	          try {
	            // Necessary for host object support.
	            value = object[property];
	          } catch (exception) {}
	          if (typeof value == "object" && value) {
	            className = getClass.call(value);
	            if (className == dateClass && !isProperty.call(value, "toJSON")) {
	              if (value > -1 / 0 && value < 1 / 0) {
	                // Dates are serialized according to the `Date#toJSON` method
	                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
	                // for the ISO 8601 date time string format.
	                if (getDay) {
	                  // Manually compute the year, month, date, hours, minutes,
	                  // seconds, and milliseconds if the `getUTC*` methods are
	                  // buggy. Adapted from @Yaffle's `date-shim` project.
	                  date = floor(value / 864e5);
	                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
	                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
	                  date = 1 + date - getDay(year, month);
	                  // The `time` value specifies the time within the day (see ES
	                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
	                  // to compute `A modulo B`, as the `%` operator does not
	                  // correspond to the `modulo` operation for negative numbers.
	                  time = (value % 864e5 + 864e5) % 864e5;
	                  // The hours, minutes, seconds, and milliseconds are obtained by
	                  // decomposing the time within the day. See section 15.9.1.10.
	                  hours = floor(time / 36e5) % 24;
	                  minutes = floor(time / 6e4) % 60;
	                  seconds = floor(time / 1e3) % 60;
	                  milliseconds = time % 1e3;
	                } else {
	                  year = value.getUTCFullYear();
	                  month = value.getUTCMonth();
	                  date = value.getUTCDate();
	                  hours = value.getUTCHours();
	                  minutes = value.getUTCMinutes();
	                  seconds = value.getUTCSeconds();
	                  milliseconds = value.getUTCMilliseconds();
	                }
	                // Serialize extended years correctly.
	                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
	                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
	                  // Months, dates, hours, minutes, and seconds should have two
	                  // digits; milliseconds should have three.
	                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
	                  // Milliseconds are optional in ES 5.0, but required in 5.1.
	                  "." + toPaddedString(3, milliseconds) + "Z";
	              } else {
	                value = null;
	              }
	            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
	              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
	              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
	              // ignores all `toJSON` methods on these objects unless they are
	              // defined directly on an instance.
	              value = value.toJSON(property);
	            }
	          }
	          if (callback) {
	            // If a replacement function was provided, call it to obtain the value
	            // for serialization.
	            value = callback.call(object, property, value);
	          }
	          if (value === null) {
	            return "null";
	          }
	          className = getClass.call(value);
	          if (className == booleanClass) {
	            // Booleans are represented literally.
	            return "" + value;
	          } else if (className == numberClass) {
	            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
	            // `"null"`.
	            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
	          } else if (className == stringClass) {
	            // Strings are double-quoted and escaped.
	            return quote("" + value);
	          }
	          // Recursively serialize objects and arrays.
	          if (typeof value == "object") {
	            // Check for cyclic structures. This is a linear search; performance
	            // is inversely proportional to the number of unique nested objects.
	            for (length = stack.length; length--;) {
	              if (stack[length] === value) {
	                // Cyclic structures cannot be serialized by `JSON.stringify`.
	                throw TypeError();
	              }
	            }
	            // Add the object to the stack of traversed objects.
	            stack.push(value);
	            results = [];
	            // Save the current indentation level and indent one additional level.
	            prefix = indentation;
	            indentation += whitespace;
	            if (className == arrayClass) {
	              // Recursively serialize array elements.
	              for (index = 0, length = value.length; index < length; index++) {
	                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
	                results.push(element === undef ? "null" : element);
	              }
	              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
	            } else {
	              // Recursively serialize object members. Members are selected from
	              // either a user-specified list of property names, or the object
	              // itself.
	              forEach(properties || value, function (property) {
	                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
	                if (element !== undef) {
	                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
	                  // is not the empty string, let `member` {quote(property) + ":"}
	                  // be the concatenation of `member` and the `space` character."
	                  // The "`space` character" refers to the literal space
	                  // character, not the `space` {width} argument provided to
	                  // `JSON.stringify`.
	                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
	                }
	              });
	              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
	            }
	            // Remove the object from the traversed object stack.
	            stack.pop();
	            return result;
	          }
	        };

	        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
	        exports.stringify = function (source, filter, width) {
	          var whitespace, callback, properties, className;
	          if (objectTypes[typeof filter] && filter) {
	            if ((className = getClass.call(filter)) == functionClass) {
	              callback = filter;
	            } else if (className == arrayClass) {
	              // Convert the property names array into a makeshift set.
	              properties = {};
	              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
	            }
	          }
	          if (width) {
	            if ((className = getClass.call(width)) == numberClass) {
	              // Convert the `width` to an integer and create a string containing
	              // `width` number of space characters.
	              if ((width -= width % 1) > 0) {
	                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
	              }
	            } else if (className == stringClass) {
	              whitespace = width.length <= 10 ? width : width.slice(0, 10);
	            }
	          }
	          // Opera <= 7.54u2 discards the values associated with empty string keys
	          // (`""`) only if they are used directly within an object member list
	          // (e.g., `!("" in { "": 1})`).
	          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
	        };
	      }

	      // Public: Parses a JSON source string.
	      if (!has("json-parse")) {
	        var fromCharCode = String.fromCharCode;

	        // Internal: A map of escaped control characters and their unescaped
	        // equivalents.
	        var Unescapes = {
	          92: "\\",
	          34: '"',
	          47: "/",
	          98: "\b",
	          116: "\t",
	          110: "\n",
	          102: "\f",
	          114: "\r"
	        };

	        // Internal: Stores the parser state.
	        var Index, Source;

	        // Internal: Resets the parser state and throws a `SyntaxError`.
	        var abort = function () {
	          Index = Source = null;
	          throw SyntaxError();
	        };

	        // Internal: Returns the next token, or `"$"` if the parser has reached
	        // the end of the source string. A token may be a string, number, `null`
	        // literal, or Boolean literal.
	        var lex = function () {
	          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
	          while (Index < length) {
	            charCode = source.charCodeAt(Index);
	            switch (charCode) {
	              case 9: case 10: case 13: case 32:
	                // Skip whitespace tokens, including tabs, carriage returns, line
	                // feeds, and space characters.
	                Index++;
	                break;
	              case 123: case 125: case 91: case 93: case 58: case 44:
	                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
	                // the current position.
	                value = charIndexBuggy ? source.charAt(Index) : source[Index];
	                Index++;
	                return value;
	              case 34:
	                // `"` delimits a JSON string; advance to the next character and
	                // begin parsing the string. String tokens are prefixed with the
	                // sentinel `@` character to distinguish them from punctuators and
	                // end-of-string tokens.
	                for (value = "@", Index++; Index < length;) {
	                  charCode = source.charCodeAt(Index);
	                  if (charCode < 32) {
	                    // Unescaped ASCII control characters (those with a code unit
	                    // less than the space character) are not permitted.
	                    abort();
	                  } else if (charCode == 92) {
	                    // A reverse solidus (`\`) marks the beginning of an escaped
	                    // control character (including `"`, `\`, and `/`) or Unicode
	                    // escape sequence.
	                    charCode = source.charCodeAt(++Index);
	                    switch (charCode) {
	                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
	                        // Revive escaped control characters.
	                        value += Unescapes[charCode];
	                        Index++;
	                        break;
	                      case 117:
	                        // `\u` marks the beginning of a Unicode escape sequence.
	                        // Advance to the first character and validate the
	                        // four-digit code point.
	                        begin = ++Index;
	                        for (position = Index + 4; Index < position; Index++) {
	                          charCode = source.charCodeAt(Index);
	                          // A valid sequence comprises four hexdigits (case-
	                          // insensitive) that form a single hexadecimal value.
	                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
	                            // Invalid Unicode escape sequence.
	                            abort();
	                          }
	                        }
	                        // Revive the escaped character.
	                        value += fromCharCode("0x" + source.slice(begin, Index));
	                        break;
	                      default:
	                        // Invalid escape sequence.
	                        abort();
	                    }
	                  } else {
	                    if (charCode == 34) {
	                      // An unescaped double-quote character marks the end of the
	                      // string.
	                      break;
	                    }
	                    charCode = source.charCodeAt(Index);
	                    begin = Index;
	                    // Optimize for the common case where a string is valid.
	                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
	                      charCode = source.charCodeAt(++Index);
	                    }
	                    // Append the string as-is.
	                    value += source.slice(begin, Index);
	                  }
	                }
	                if (source.charCodeAt(Index) == 34) {
	                  // Advance to the next character and return the revived string.
	                  Index++;
	                  return value;
	                }
	                // Unterminated string.
	                abort();
	              default:
	                // Parse numbers and literals.
	                begin = Index;
	                // Advance past the negative sign, if one is specified.
	                if (charCode == 45) {
	                  isSigned = true;
	                  charCode = source.charCodeAt(++Index);
	                }
	                // Parse an integer or floating-point value.
	                if (charCode >= 48 && charCode <= 57) {
	                  // Leading zeroes are interpreted as octal literals.
	                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
	                    // Illegal octal literal.
	                    abort();
	                  }
	                  isSigned = false;
	                  // Parse the integer component.
	                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
	                  // Floats cannot contain a leading decimal point; however, this
	                  // case is already accounted for by the parser.
	                  if (source.charCodeAt(Index) == 46) {
	                    position = ++Index;
	                    // Parse the decimal component.
	                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
	                    if (position == Index) {
	                      // Illegal trailing decimal.
	                      abort();
	                    }
	                    Index = position;
	                  }
	                  // Parse exponents. The `e` denoting the exponent is
	                  // case-insensitive.
	                  charCode = source.charCodeAt(Index);
	                  if (charCode == 101 || charCode == 69) {
	                    charCode = source.charCodeAt(++Index);
	                    // Skip past the sign following the exponent, if one is
	                    // specified.
	                    if (charCode == 43 || charCode == 45) {
	                      Index++;
	                    }
	                    // Parse the exponential component.
	                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
	                    if (position == Index) {
	                      // Illegal empty exponent.
	                      abort();
	                    }
	                    Index = position;
	                  }
	                  // Coerce the parsed value to a JavaScript number.
	                  return +source.slice(begin, Index);
	                }
	                // A negative sign may only precede numbers.
	                if (isSigned) {
	                  abort();
	                }
	                // `true`, `false`, and `null` literals.
	                if (source.slice(Index, Index + 4) == "true") {
	                  Index += 4;
	                  return true;
	                } else if (source.slice(Index, Index + 5) == "false") {
	                  Index += 5;
	                  return false;
	                } else if (source.slice(Index, Index + 4) == "null") {
	                  Index += 4;
	                  return null;
	                }
	                // Unrecognized token.
	                abort();
	            }
	          }
	          // Return the sentinel `$` character if the parser has reached the end
	          // of the source string.
	          return "$";
	        };

	        // Internal: Parses a JSON `value` token.
	        var get = function (value) {
	          var results, hasMembers;
	          if (value == "$") {
	            // Unexpected end of input.
	            abort();
	          }
	          if (typeof value == "string") {
	            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
	              // Remove the sentinel `@` character.
	              return value.slice(1);
	            }
	            // Parse object and array literals.
	            if (value == "[") {
	              // Parses a JSON array, returning a new JavaScript array.
	              results = [];
	              for (;; hasMembers || (hasMembers = true)) {
	                value = lex();
	                // A closing square bracket marks the end of the array literal.
	                if (value == "]") {
	                  break;
	                }
	                // If the array literal contains elements, the current token
	                // should be a comma separating the previous element from the
	                // next.
	                if (hasMembers) {
	                  if (value == ",") {
	                    value = lex();
	                    if (value == "]") {
	                      // Unexpected trailing `,` in array literal.
	                      abort();
	                    }
	                  } else {
	                    // A `,` must separate each array element.
	                    abort();
	                  }
	                }
	                // Elisions and leading commas are not permitted.
	                if (value == ",") {
	                  abort();
	                }
	                results.push(get(value));
	              }
	              return results;
	            } else if (value == "{") {
	              // Parses a JSON object, returning a new JavaScript object.
	              results = {};
	              for (;; hasMembers || (hasMembers = true)) {
	                value = lex();
	                // A closing curly brace marks the end of the object literal.
	                if (value == "}") {
	                  break;
	                }
	                // If the object literal contains members, the current token
	                // should be a comma separator.
	                if (hasMembers) {
	                  if (value == ",") {
	                    value = lex();
	                    if (value == "}") {
	                      // Unexpected trailing `,` in object literal.
	                      abort();
	                    }
	                  } else {
	                    // A `,` must separate each object member.
	                    abort();
	                  }
	                }
	                // Leading commas are not permitted, object property names must be
	                // double-quoted strings, and a `:` must separate each property
	                // name and value.
	                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
	                  abort();
	                }
	                results[value.slice(1)] = get(lex());
	              }
	              return results;
	            }
	            // Unexpected token encountered.
	            abort();
	          }
	          return value;
	        };

	        // Internal: Updates a traversed object member.
	        var update = function (source, property, callback) {
	          var element = walk(source, property, callback);
	          if (element === undef) {
	            delete source[property];
	          } else {
	            source[property] = element;
	          }
	        };

	        // Internal: Recursively traverses a parsed JSON object, invoking the
	        // `callback` function for each value. This is an implementation of the
	        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
	        var walk = function (source, property, callback) {
	          var value = source[property], length;
	          if (typeof value == "object" && value) {
	            // `forEach` can't be used to traverse an array in Opera <= 8.54
	            // because its `Object#hasOwnProperty` implementation returns `false`
	            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
	            if (getClass.call(value) == arrayClass) {
	              for (length = value.length; length--;) {
	                update(value, length, callback);
	              }
	            } else {
	              forEach(value, function (property) {
	                update(value, property, callback);
	              });
	            }
	          }
	          return callback.call(source, property, value);
	        };

	        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
	        exports.parse = function (source, callback) {
	          var result, value;
	          Index = 0;
	          Source = "" + source;
	          result = get(lex());
	          // If a JSON string contains multiple tokens, it is invalid.
	          if (lex() != "$") {
	            abort();
	          }
	          // Reset the parser state.
	          Index = Source = null;
	          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
	        };
	      }
	    }

	    exports["runInContext"] = runInContext;
	    return exports;
	  }

	  if (freeExports && !isLoader) {
	    // Export for CommonJS environments.
	    runInContext(root, freeExports);
	  } else {
	    // Export for web browsers and JavaScript engines.
	    var nativeJSON = root.JSON,
	        previousJSON = root["JSON3"],
	        isRestored = false;

	    var JSON3 = runInContext(root, (root["JSON3"] = {
	      // Public: Restores the original value of the global `JSON` object and
	      // returns a reference to the `JSON3` object.
	      "noConflict": function () {
	        if (!isRestored) {
	          isRestored = true;
	          root.JSON = nativeJSON;
	          root["JSON3"] = previousJSON;
	          nativeJSON = previousJSON = null;
	        }
	        return JSON3;
	      }
	    }));

	    root.JSON = {
	      "parse": JSON3.parse,
	      "stringify": JSON3.stringify
	    };
	  }

	  // Export for asynchronous module loaders.
	  if (isLoader) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return JSON3;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}).call(this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)(module), (function() { return this; }())))

/***/ },
/* 45 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 46 */
/***/ function(module, exports) {

	module.exports = '1.0.3';

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, global) {'use strict';

	var eventUtils = __webpack_require__(12)
	  , JSON3 = __webpack_require__(44)
	  , browser = __webpack_require__(36)
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:utils:iframe');
	}

	module.exports = {
	  WPrefix: '_jp'
	, currentWindowId: null

	, polluteGlobalNamespace: function() {
	    if (!(module.exports.WPrefix in global)) {
	      global[module.exports.WPrefix] = {};
	    }
	  }

	, postMessage: function(type, data) {
	    if (global.parent !== global) {
	      global.parent.postMessage(JSON3.stringify({
	        windowId: module.exports.currentWindowId
	      , type: type
	      , data: data || ''
	      }), '*');
	    } else {
	      debug('Cannot postMessage, no parent window.', type, data);
	    }
	  }

	, createIframe: function(iframeUrl, errorCallback) {
	    var iframe = global.document.createElement('iframe');
	    var tref, unloadRef;
	    var unattach = function() {
	      debug('unattach');
	      clearTimeout(tref);
	      // Explorer had problems with that.
	      try {
	        iframe.onload = null;
	      } catch (x) {}
	      iframe.onerror = null;
	    };
	    var cleanup = function() {
	      debug('cleanup');
	      if (iframe) {
	        unattach();
	        // This timeout makes chrome fire onbeforeunload event
	        // within iframe. Without the timeout it goes straight to
	        // onunload.
	        setTimeout(function() {
	          if (iframe) {
	            iframe.parentNode.removeChild(iframe);
	          }
	          iframe = null;
	        }, 0);
	        eventUtils.unloadDel(unloadRef);
	      }
	    };
	    var onerror = function(err) {
	      debug('onerror', err);
	      if (iframe) {
	        cleanup();
	        errorCallback(err);
	      }
	    };
	    var post = function(msg, origin) {
	      debug('post', msg, origin);
	      try {
	        // When the iframe is not loaded, IE raises an exception
	        // on 'contentWindow'.
	        setTimeout(function() {
	          if (iframe && iframe.contentWindow) {
	            iframe.contentWindow.postMessage(msg, origin);
	          }
	        }, 0);
	      } catch (x) {}
	    };

	    iframe.src = iframeUrl;
	    iframe.style.display = 'none';
	    iframe.style.position = 'absolute';
	    iframe.onerror = function() {
	      onerror('onerror');
	    };
	    iframe.onload = function() {
	      debug('onload');
	      // `onload` is triggered before scripts on the iframe are
	      // executed. Give it few seconds to actually load stuff.
	      clearTimeout(tref);
	      tref = setTimeout(function() {
	        onerror('onload timeout');
	      }, 2000);
	    };
	    global.document.body.appendChild(iframe);
	    tref = setTimeout(function() {
	      onerror('timeout');
	    }, 15000);
	    unloadRef = eventUtils.unloadAdd(cleanup);
	    return {
	      post: post
	    , cleanup: cleanup
	    , loaded: unattach
	    };
	  }

	/* jshint undef: false, newcap: false */
	/* eslint no-undef: 0, new-cap: 0 */
	, createHtmlfile: function(iframeUrl, errorCallback) {
	    var axo = ['Active'].concat('Object').join('X');
	    var doc = new global[axo]('htmlfile');
	    var tref, unloadRef;
	    var iframe;
	    var unattach = function() {
	      clearTimeout(tref);
	      iframe.onerror = null;
	    };
	    var cleanup = function() {
	      if (doc) {
	        unattach();
	        eventUtils.unloadDel(unloadRef);
	        iframe.parentNode.removeChild(iframe);
	        iframe = doc = null;
	        CollectGarbage();
	      }
	    };
	    var onerror = function(r)  {
	      debug('onerror', r);
	      if (doc) {
	        cleanup();
	        errorCallback(r);
	      }
	    };
	    var post = function(msg, origin) {
	      try {
	        // When the iframe is not loaded, IE raises an exception
	        // on 'contentWindow'.
	        setTimeout(function() {
	          if (iframe && iframe.contentWindow) {
	              iframe.contentWindow.postMessage(msg, origin);
	          }
	        }, 0);
	      } catch (x) {}
	    };

	    doc.open();
	    doc.write('<html><s' + 'cript>' +
	              'document.domain="' + global.document.domain + '";' +
	              '</s' + 'cript></html>');
	    doc.close();
	    doc.parentWindow[module.exports.WPrefix] = global[module.exports.WPrefix];
	    var c = doc.createElement('div');
	    doc.body.appendChild(c);
	    iframe = doc.createElement('iframe');
	    c.appendChild(iframe);
	    iframe.src = iframeUrl;
	    iframe.onerror = function() {
	      onerror('onerror');
	    };
	    tref = setTimeout(function() {
	      onerror('timeout');
	    }, 15000);
	    unloadRef = eventUtils.unloadAdd(cleanup);
	    return {
	      post: post
	    , cleanup: cleanup
	    , loaded: unattach
	    };
	  }
	};

	module.exports.iframeEnabled = false;
	if (global.document) {
	  // postMessage misbehaves in konqueror 4.6.5 - the messages are delivered with
	  // huge delay, or not at all.
	  module.exports.iframeEnabled = (typeof global.postMessage === 'function' ||
	    typeof global.postMessage === 'object') && (!browser.isKonqueror());
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11), (function() { return this; }())))

/***/ },
/* 48 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	  isObject: function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  }

	, extend: function(obj) {
	    if (!this.isObject(obj)) {
	      return obj;
	    }
	    var source, prop;
	    for (var i = 1, length = arguments.length; i < length; i++) {
	      source = arguments[i];
	      for (prop in source) {
	        if (Object.prototype.hasOwnProperty.call(source, prop)) {
	          obj[prop] = source[prop];
	        }
	      }
	    }
	    return obj;
	  }
	};


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(23)
	  , HtmlfileReceiver = __webpack_require__(50)
	  , XHRLocalObject = __webpack_require__(35)
	  , AjaxBasedTransport = __webpack_require__(28)
	  ;

	function HtmlFileTransport(transUrl) {
	  if (!HtmlfileReceiver.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/htmlfile', HtmlfileReceiver, XHRLocalObject);
	}

	inherits(HtmlFileTransport, AjaxBasedTransport);

	HtmlFileTransport.enabled = function(info) {
	  return HtmlfileReceiver.enabled && info.sameOrigin;
	};

	HtmlFileTransport.transportName = 'htmlfile';
	HtmlFileTransport.roundTrips = 2;

	module.exports = HtmlFileTransport;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, global) {'use strict';

	var inherits = __webpack_require__(23)
	  , iframeUtils = __webpack_require__(47)
	  , urlUtils = __webpack_require__(15)
	  , EventEmitter = __webpack_require__(24).EventEmitter
	  , random = __webpack_require__(13)
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:receiver:htmlfile');
	}

	function HtmlfileReceiver(url) {
	  debug(url);
	  EventEmitter.call(this);
	  var self = this;
	  iframeUtils.polluteGlobalNamespace();

	  this.id = 'a' + random.string(6);
	  url = urlUtils.addQuery(url, 'c=' + decodeURIComponent(iframeUtils.WPrefix + '.' + this.id));

	  debug('using htmlfile', HtmlfileReceiver.htmlfileEnabled);
	  var constructFunc = HtmlfileReceiver.htmlfileEnabled ?
	      iframeUtils.createHtmlfile : iframeUtils.createIframe;

	  global[iframeUtils.WPrefix][this.id] = {
	    start: function() {
	      debug('start');
	      self.iframeObj.loaded();
	    }
	  , message: function(data) {
	      debug('message', data);
	      self.emit('message', data);
	    }
	  , stop: function() {
	      debug('stop');
	      self._cleanup();
	      self._close('network');
	    }
	  };
	  this.iframeObj = constructFunc(url, function() {
	    debug('callback');
	    self._cleanup();
	    self._close('permanent');
	  });
	}

	inherits(HtmlfileReceiver, EventEmitter);

	HtmlfileReceiver.prototype.abort = function() {
	  debug('abort');
	  this._cleanup();
	  this._close('user');
	};

	HtmlfileReceiver.prototype._cleanup = function() {
	  debug('_cleanup');
	  if (this.iframeObj) {
	    this.iframeObj.cleanup();
	    this.iframeObj = null;
	  }
	  delete global[iframeUtils.WPrefix][this.id];
	};

	HtmlfileReceiver.prototype._close = function(reason) {
	  debug('_close', reason);
	  this.emit('close', null, reason);
	  this.removeAllListeners();
	};

	HtmlfileReceiver.htmlfileEnabled = false;

	// obfuscate to avoid firewalls
	var axo = ['Active'].concat('Object').join('X');
	if (axo in global) {
	  try {
	    HtmlfileReceiver.htmlfileEnabled = !!new global[axo]('htmlfile');
	  } catch (x) {}
	}

	HtmlfileReceiver.enabled = HtmlfileReceiver.htmlfileEnabled || iframeUtils.iframeEnabled;

	module.exports = HtmlfileReceiver;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11), (function() { return this; }())))

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(23)
	  , AjaxBasedTransport = __webpack_require__(28)
	  , XhrReceiver = __webpack_require__(32)
	  , XHRCorsObject = __webpack_require__(33)
	  , XHRLocalObject = __webpack_require__(35)
	  ;

	function XhrPollingTransport(transUrl) {
	  if (!XHRLocalObject.enabled && !XHRCorsObject.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/xhr', XhrReceiver, XHRCorsObject);
	}

	inherits(XhrPollingTransport, AjaxBasedTransport);

	XhrPollingTransport.enabled = function(info) {
	  if (info.nullOrigin) {
	    return false;
	  }

	  if (XHRLocalObject.enabled && info.sameOrigin) {
	    return true;
	  }
	  return XHRCorsObject.enabled;
	};

	XhrPollingTransport.transportName = 'xhr-polling';
	XhrPollingTransport.roundTrips = 2; // preflight, ajax

	module.exports = XhrPollingTransport;


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(23)
	  , AjaxBasedTransport = __webpack_require__(28)
	  , XdrStreamingTransport = __webpack_require__(37)
	  , XhrReceiver = __webpack_require__(32)
	  , XDRObject = __webpack_require__(38)
	  ;

	function XdrPollingTransport(transUrl) {
	  if (!XDRObject.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/xhr', XhrReceiver, XDRObject);
	}

	inherits(XdrPollingTransport, AjaxBasedTransport);

	XdrPollingTransport.enabled = XdrStreamingTransport.enabled;
	XdrPollingTransport.transportName = 'xdr-polling';
	XdrPollingTransport.roundTrips = 2; // preflight, ajax

	module.exports = XdrPollingTransport;


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	// The simplest and most robust transport, using the well-know cross
	// domain hack - JSONP. This transport is quite inefficient - one
	// message could use up to one http request. But at least it works almost
	// everywhere.
	// Known limitations:
	//   o you will get a spinning cursor
	//   o for Konqueror a dumb timer is needed to detect errors

	var inherits = __webpack_require__(23)
	  , SenderReceiver = __webpack_require__(29)
	  , JsonpReceiver = __webpack_require__(54)
	  , jsonpSender = __webpack_require__(55)
	  ;

	function JsonPTransport(transUrl) {
	  if (!JsonPTransport.enabled()) {
	    throw new Error('Transport created when disabled');
	  }
	  SenderReceiver.call(this, transUrl, '/jsonp', jsonpSender, JsonpReceiver);
	}

	inherits(JsonPTransport, SenderReceiver);

	JsonPTransport.enabled = function() {
	  return !!global.document;
	};

	JsonPTransport.transportName = 'jsonp-polling';
	JsonPTransport.roundTrips = 1;
	JsonPTransport.needBody = true;

	module.exports = JsonPTransport;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, global) {'use strict';

	var utils = __webpack_require__(47)
	  , random = __webpack_require__(13)
	  , browser = __webpack_require__(36)
	  , urlUtils = __webpack_require__(15)
	  , inherits = __webpack_require__(23)
	  , EventEmitter = __webpack_require__(24).EventEmitter
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:receiver:jsonp');
	}

	function JsonpReceiver(url) {
	  debug(url);
	  var self = this;
	  EventEmitter.call(this);

	  utils.polluteGlobalNamespace();

	  this.id = 'a' + random.string(6);
	  var urlWithId = urlUtils.addQuery(url, 'c=' + encodeURIComponent(utils.WPrefix + '.' + this.id));

	  global[utils.WPrefix][this.id] = this._callback.bind(this);
	  this._createScript(urlWithId);

	  // Fallback mostly for Konqueror - stupid timer, 35 seconds shall be plenty.
	  this.timeoutId = setTimeout(function() {
	    debug('timeout');
	    self._abort(new Error('JSONP script loaded abnormally (timeout)'));
	  }, JsonpReceiver.timeout);
	}

	inherits(JsonpReceiver, EventEmitter);

	JsonpReceiver.prototype.abort = function() {
	  debug('abort');
	  if (global[utils.WPrefix][this.id]) {
	    var err = new Error('JSONP user aborted read');
	    err.code = 1000;
	    this._abort(err);
	  }
	};

	JsonpReceiver.timeout = 35000;
	JsonpReceiver.scriptErrorTimeout = 1000;

	JsonpReceiver.prototype._callback = function(data) {
	  debug('_callback', data);
	  this._cleanup();

	  if (this.aborting) {
	    return;
	  }

	  if (data) {
	    debug('message', data);
	    this.emit('message', data);
	  }
	  this.emit('close', null, 'network');
	  this.removeAllListeners();
	};

	JsonpReceiver.prototype._abort = function(err) {
	  debug('_abort', err);
	  this._cleanup();
	  this.aborting = true;
	  this.emit('close', err.code, err.message);
	  this.removeAllListeners();
	};

	JsonpReceiver.prototype._cleanup = function() {
	  debug('_cleanup');
	  clearTimeout(this.timeoutId);
	  if (this.script2) {
	    this.script2.parentNode.removeChild(this.script2);
	    this.script2 = null;
	  }
	  if (this.script) {
	    var script = this.script;
	    // Unfortunately, you can't really abort script loading of
	    // the script.
	    script.parentNode.removeChild(script);
	    script.onreadystatechange = script.onerror =
	        script.onload = script.onclick = null;
	    this.script = null;
	  }
	  delete global[utils.WPrefix][this.id];
	};

	JsonpReceiver.prototype._scriptError = function() {
	  debug('_scriptError');
	  var self = this;
	  if (this.errorTimer) {
	    return;
	  }

	  this.errorTimer = setTimeout(function() {
	    if (!self.loadedOkay) {
	      self._abort(new Error('JSONP script loaded abnormally (onerror)'));
	    }
	  }, JsonpReceiver.scriptErrorTimeout);
	};

	JsonpReceiver.prototype._createScript = function(url) {
	  debug('_createScript', url);
	  var self = this;
	  var script = this.script = global.document.createElement('script');
	  var script2;  // Opera synchronous load trick.

	  script.id = 'a' + random.string(8);
	  script.src = url;
	  script.type = 'text/javascript';
	  script.charset = 'UTF-8';
	  script.onerror = this._scriptError.bind(this);
	  script.onload = function() {
	    debug('onload');
	    self._abort(new Error('JSONP script loaded abnormally (onload)'));
	  };

	  // IE9 fires 'error' event after onreadystatechange or before, in random order.
	  // Use loadedOkay to determine if actually errored
	  script.onreadystatechange = function() {
	    debug('onreadystatechange', script.readyState);
	    if (/loaded|closed/.test(script.readyState)) {
	      if (script && script.htmlFor && script.onclick) {
	        self.loadedOkay = true;
	        try {
	          // In IE, actually execute the script.
	          script.onclick();
	        } catch (x) {}
	      }
	      if (script) {
	        self._abort(new Error('JSONP script loaded abnormally (onreadystatechange)'));
	      }
	    }
	  };
	  // IE: event/htmlFor/onclick trick.
	  // One can't rely on proper order for onreadystatechange. In order to
	  // make sure, set a 'htmlFor' and 'event' properties, so that
	  // script code will be installed as 'onclick' handler for the
	  // script object. Later, onreadystatechange, manually execute this
	  // code. FF and Chrome doesn't work with 'event' and 'htmlFor'
	  // set. For reference see:
	  //   http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
	  // Also, read on that about script ordering:
	  //   http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
	  if (typeof script.async === 'undefined' && global.document.attachEvent) {
	    // According to mozilla docs, in recent browsers script.async defaults
	    // to 'true', so we may use it to detect a good browser:
	    // https://developer.mozilla.org/en/HTML/Element/script
	    if (!browser.isOpera()) {
	      // Naively assume we're in IE
	      try {
	        script.htmlFor = script.id;
	        script.event = 'onclick';
	      } catch (x) {}
	      script.async = true;
	    } else {
	      // Opera, second sync script hack
	      script2 = this.script2 = global.document.createElement('script');
	      script2.text = "try{var a = document.getElementById('" + script.id + "'); if(a)a.onerror();}catch(x){};";
	      script.async = script2.async = false;
	    }
	  }
	  if (typeof script.async !== 'undefined') {
	    script.async = true;
	  }

	  var head = global.document.getElementsByTagName('head')[0];
	  head.insertBefore(script, head.firstChild);
	  if (script2) {
	    head.insertBefore(script2, head.firstChild);
	  }
	};

	module.exports = JsonpReceiver;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11), (function() { return this; }())))

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, global) {'use strict';

	var random = __webpack_require__(13)
	  , urlUtils = __webpack_require__(15)
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:sender:jsonp');
	}

	var form, area;

	function createIframe(id) {
	  debug('createIframe', id);
	  try {
	    // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
	    return global.document.createElement('<iframe name="' + id + '">');
	  } catch (x) {
	    var iframe = global.document.createElement('iframe');
	    iframe.name = id;
	    return iframe;
	  }
	}

	function createForm() {
	  debug('createForm');
	  form = global.document.createElement('form');
	  form.style.display = 'none';
	  form.style.position = 'absolute';
	  form.method = 'POST';
	  form.enctype = 'application/x-www-form-urlencoded';
	  form.acceptCharset = 'UTF-8';

	  area = global.document.createElement('textarea');
	  area.name = 'd';
	  form.appendChild(area);

	  global.document.body.appendChild(form);
	}

	module.exports = function(url, payload, callback) {
	  debug(url, payload);
	  if (!form) {
	    createForm();
	  }
	  var id = 'a' + random.string(8);
	  form.target = id;
	  form.action = urlUtils.addQuery(urlUtils.addPath(url, '/jsonp_send'), 'i=' + id);

	  var iframe = createIframe(id);
	  iframe.id = id;
	  iframe.style.display = 'none';
	  form.appendChild(iframe);

	  try {
	    area.value = payload;
	  } catch (e) {
	    // seriously broken browsers get here
	  }
	  form.submit();

	  var completed = function(err) {
	    debug('completed', id, err);
	    if (!iframe.onerror) {
	      return;
	    }
	    iframe.onreadystatechange = iframe.onerror = iframe.onload = null;
	    // Opera mini doesn't like if we GC iframe
	    // immediately, thus this timeout.
	    setTimeout(function() {
	      debug('cleaning up', id);
	      iframe.parentNode.removeChild(iframe);
	      iframe = null;
	    }, 500);
	    area.value = '';
	    // It is not possible to detect if the iframe succeeded or
	    // failed to submit our form.
	    callback(err);
	  };
	  iframe.onerror = function() {
	    debug('onerror', id);
	    completed();
	  };
	  iframe.onload = function() {
	    debug('onload', id);
	    completed();
	  };
	  iframe.onreadystatechange = function(e) {
	    debug('onreadystatechange', id, iframe.readyState, e);
	    if (iframe.readyState === 'complete') {
	      completed();
	    }
	  };
	  return function() {
	    debug('aborted', id);
	    completed(new Error('Aborted'));
	  };
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11), (function() { return this; }())))

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, global) {'use strict';

	__webpack_require__(57);

	var URL = __webpack_require__(16)
	  , inherits = __webpack_require__(23)
	  , JSON3 = __webpack_require__(44)
	  , random = __webpack_require__(13)
	  , escape = __webpack_require__(58)
	  , urlUtils = __webpack_require__(15)
	  , eventUtils = __webpack_require__(12)
	  , transport = __webpack_require__(59)
	  , objectUtils = __webpack_require__(48)
	  , browser = __webpack_require__(36)
	  , log = __webpack_require__(60)
	  , Event = __webpack_require__(61)
	  , EventTarget = __webpack_require__(25)
	  , loc = __webpack_require__(62)
	  , CloseEvent = __webpack_require__(63)
	  , TransportMessageEvent = __webpack_require__(64)
	  , InfoReceiver = __webpack_require__(65)
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  // Make debug module available globally so you can enable via the console easily
	  global.dbg = __webpack_require__(20);
	  debug = global.dbg('sockjs-client:main');
	}

	var transports;

	// follow constructor steps defined at http://dev.w3.org/html5/websockets/#the-websocket-interface
	function SockJS(url, protocols, options) {
	  if (!(this instanceof SockJS)) {
	    return new SockJS(url, protocols, options);
	  }
	  if (arguments.length < 1) {
	    throw new TypeError("Failed to construct 'SockJS: 1 argument required, but only 0 present");
	  }
	  EventTarget.call(this);

	  this.readyState = SockJS.CONNECTING;
	  this.extensions = '';
	  this.protocol = '';

	  // non-standard extension
	  options = options || {};
	  if (options.protocols_whitelist) {
	    log.warn("'protocols_whitelist' is DEPRECATED. Use 'transports' instead.");
	  }
	  this._transportsWhitelist = options.transports;

	  var sessionId = options.sessionId || 8;
	  if (typeof sessionId === 'function') {
	    this._generateSessionId = sessionId;
	  } else if (typeof sessionId === 'number') {
	    this._generateSessionId = function() {
	      return random.string(sessionId);
	    };
	  } else {
	    throw new TypeError("If sessionId is used in the options, it needs to be a number or a function.");
	  }

	  this._server = options.server || random.numberString(1000);

	  // Step 1 of WS spec - parse and validate the url. Issue #8
	  var parsedUrl = new URL(url);
	  if (!parsedUrl.host || !parsedUrl.protocol) {
	    throw new SyntaxError("The URL '" + url + "' is invalid");
	  } else if (parsedUrl.hash) {
	    throw new SyntaxError('The URL must not contain a fragment');
	  } else if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
	    throw new SyntaxError("The URL's scheme must be either 'http:' or 'https:'. '" + parsedUrl.protocol + "' is not allowed.");
	  }

	  var secure = parsedUrl.protocol === 'https:';
	  // Step 2 - don't allow secure origin with an insecure protocol
	  if (loc.protocol === 'https' && !secure) {
	    throw new Error('SecurityError: An insecure SockJS connection may not be initiated from a page loaded over HTTPS');
	  }

	  // Step 3 - check port access - no need here
	  // Step 4 - parse protocols argument
	  if (!protocols) {
	    protocols = [];
	  } else if (!Array.isArray(protocols)) {
	    protocols = [protocols];
	  }

	  // Step 5 - check protocols argument
	  var sortedProtocols = protocols.sort();
	  sortedProtocols.forEach(function(proto, i) {
	    if (!proto) {
	      throw new SyntaxError("The protocols entry '" + proto + "' is invalid.");
	    }
	    if (i < (sortedProtocols.length - 1) && proto === sortedProtocols[i + 1]) {
	      throw new SyntaxError("The protocols entry '" + proto + "' is duplicated.");
	    }
	  });

	  // Step 6 - convert origin
	  var o = urlUtils.getOrigin(loc.href);
	  this._origin = o ? o.toLowerCase() : null;

	  // remove the trailing slash
	  parsedUrl.set('pathname', parsedUrl.pathname.replace(/\/+$/, ''));

	  // store the sanitized url
	  this.url = parsedUrl.href;
	  debug('using url', this.url);

	  // Step 7 - start connection in background
	  // obtain server info
	  // http://sockjs.github.io/sockjs-protocol/sockjs-protocol-0.3.3.html#section-26
	  this._urlInfo = {
	    nullOrigin: !browser.hasDomain()
	  , sameOrigin: urlUtils.isOriginEqual(this.url, loc.href)
	  , sameScheme: urlUtils.isSchemeEqual(this.url, loc.href)
	  };

	  this._ir = new InfoReceiver(this.url, this._urlInfo);
	  this._ir.once('finish', this._receiveInfo.bind(this));
	}

	inherits(SockJS, EventTarget);

	function userSetCode(code) {
	  return code === 1000 || (code >= 3000 && code <= 4999);
	}

	SockJS.prototype.close = function(code, reason) {
	  // Step 1
	  if (code && !userSetCode(code)) {
	    throw new Error('InvalidAccessError: Invalid code');
	  }
	  // Step 2.4 states the max is 123 bytes, but we are just checking length
	  if (reason && reason.length > 123) {
	    throw new SyntaxError('reason argument has an invalid length');
	  }

	  // Step 3.1
	  if (this.readyState === SockJS.CLOSING || this.readyState === SockJS.CLOSED) {
	    return;
	  }

	  // TODO look at docs to determine how to set this
	  var wasClean = true;
	  this._close(code || 1000, reason || 'Normal closure', wasClean);
	};

	SockJS.prototype.send = function(data) {
	  // #13 - convert anything non-string to string
	  // TODO this currently turns objects into [object Object]
	  if (typeof data !== 'string') {
	    data = '' + data;
	  }
	  if (this.readyState === SockJS.CONNECTING) {
	    throw new Error('InvalidStateError: The connection has not been established yet');
	  }
	  if (this.readyState !== SockJS.OPEN) {
	    return;
	  }
	  this._transport.send(escape.quote(data));
	};

	SockJS.version = __webpack_require__(46);

	SockJS.CONNECTING = 0;
	SockJS.OPEN = 1;
	SockJS.CLOSING = 2;
	SockJS.CLOSED = 3;

	SockJS.prototype._receiveInfo = function(info, rtt) {
	  debug('_receiveInfo', rtt);
	  this._ir = null;
	  if (!info) {
	    this._close(1002, 'Cannot connect to server');
	    return;
	  }

	  // establish a round-trip timeout (RTO) based on the
	  // round-trip time (RTT)
	  this._rto = this.countRTO(rtt);
	  // allow server to override url used for the actual transport
	  this._transUrl = info.base_url ? info.base_url : this.url;
	  info = objectUtils.extend(info, this._urlInfo);
	  debug('info', info);
	  // determine list of desired and supported transports
	  var enabledTransports = transports.filterToEnabled(this._transportsWhitelist, info);
	  this._transports = enabledTransports.main;
	  debug(this._transports.length + ' enabled transports');

	  this._connect();
	};

	SockJS.prototype._connect = function() {
	  for (var Transport = this._transports.shift(); Transport; Transport = this._transports.shift()) {
	    debug('attempt', Transport.transportName);
	    if (Transport.needBody) {
	      if (!global.document.body ||
	          (typeof global.document.readyState !== 'undefined' &&
	            global.document.readyState !== 'complete' &&
	            global.document.readyState !== 'interactive')) {
	        debug('waiting for body');
	        this._transports.unshift(Transport);
	        eventUtils.attachEvent('load', this._connect.bind(this));
	        return;
	      }
	    }

	    // calculate timeout based on RTO and round trips. Default to 5s
	    var timeoutMs = (this._rto * Transport.roundTrips) || 5000;
	    this._transportTimeoutId = setTimeout(this._transportTimeout.bind(this), timeoutMs);
	    debug('using timeout', timeoutMs);

	    var transportUrl = urlUtils.addPath(this._transUrl, '/' + this._server + '/' + this._generateSessionId());
	    debug('transport url', transportUrl);
	    var transportObj = new Transport(transportUrl, this._transUrl);
	    transportObj.on('message', this._transportMessage.bind(this));
	    transportObj.once('close', this._transportClose.bind(this));
	    transportObj.transportName = Transport.transportName;
	    this._transport = transportObj;

	    return;
	  }
	  this._close(2000, 'All transports failed', false);
	};

	SockJS.prototype._transportTimeout = function() {
	  debug('_transportTimeout');
	  if (this.readyState === SockJS.CONNECTING) {
	    this._transportClose(2007, 'Transport timed out');
	  }
	};

	SockJS.prototype._transportMessage = function(msg) {
	  debug('_transportMessage', msg);
	  var self = this
	    , type = msg.slice(0, 1)
	    , content = msg.slice(1)
	    , payload
	    ;

	  // first check for messages that don't need a payload
	  switch (type) {
	    case 'o':
	      this._open();
	      return;
	    case 'h':
	      this.dispatchEvent(new Event('heartbeat'));
	      debug('heartbeat', this.transport);
	      return;
	  }

	  if (content) {
	    try {
	      payload = JSON3.parse(content);
	    } catch (e) {
	      debug('bad json', content);
	    }
	  }

	  if (typeof payload === 'undefined') {
	    debug('empty payload', content);
	    return;
	  }

	  switch (type) {
	    case 'a':
	      if (Array.isArray(payload)) {
	        payload.forEach(function(p) {
	          debug('message', self.transport, p);
	          self.dispatchEvent(new TransportMessageEvent(p));
	        });
	      }
	      break;
	    case 'm':
	      debug('message', this.transport, payload);
	      this.dispatchEvent(new TransportMessageEvent(payload));
	      break;
	    case 'c':
	      if (Array.isArray(payload) && payload.length === 2) {
	        this._close(payload[0], payload[1], true);
	      }
	      break;
	  }
	};

	SockJS.prototype._transportClose = function(code, reason) {
	  debug('_transportClose', this.transport, code, reason);
	  if (this._transport) {
	    this._transport.removeAllListeners();
	    this._transport = null;
	    this.transport = null;
	  }

	  if (!userSetCode(code) && code !== 2000 && this.readyState === SockJS.CONNECTING) {
	    this._connect();
	    return;
	  }

	  this._close(code, reason);
	};

	SockJS.prototype._open = function() {
	  debug('_open', this._transport.transportName, this.readyState);
	  if (this.readyState === SockJS.CONNECTING) {
	    if (this._transportTimeoutId) {
	      clearTimeout(this._transportTimeoutId);
	      this._transportTimeoutId = null;
	    }
	    this.readyState = SockJS.OPEN;
	    this.transport = this._transport.transportName;
	    this.dispatchEvent(new Event('open'));
	    debug('connected', this.transport);
	  } else {
	    // The server might have been restarted, and lost track of our
	    // connection.
	    this._close(1006, 'Server lost session');
	  }
	};

	SockJS.prototype._close = function(code, reason, wasClean) {
	  debug('_close', this.transport, code, reason, wasClean, this.readyState);
	  var forceFail = false;

	  if (this._ir) {
	    forceFail = true;
	    this._ir.close();
	    this._ir = null;
	  }
	  if (this._transport) {
	    this._transport.close();
	    this._transport = null;
	    this.transport = null;
	  }

	  if (this.readyState === SockJS.CLOSED) {
	    throw new Error('InvalidStateError: SockJS has already been closed');
	  }

	  this.readyState = SockJS.CLOSING;
	  setTimeout(function() {
	    this.readyState = SockJS.CLOSED;

	    if (forceFail) {
	      this.dispatchEvent(new Event('error'));
	    }

	    var e = new CloseEvent('close');
	    e.wasClean = wasClean || false;
	    e.code = code || 1000;
	    e.reason = reason;

	    this.dispatchEvent(e);
	    this.onmessage = this.onclose = this.onerror = null;
	    debug('disconnected');
	  }.bind(this), 0);
	};

	// See: http://www.erg.abdn.ac.uk/~gerrit/dccp/notes/ccid2/rto_estimator/
	// and RFC 2988.
	SockJS.prototype.countRTO = function(rtt) {
	  // In a local environment, when using IE8/9 and the `jsonp-polling`
	  // transport the time needed to establish a connection (the time that pass
	  // from the opening of the transport to the call of `_dispatchOpen`) is
	  // around 200msec (the lower bound used in the article above) and this
	  // causes spurious timeouts. For this reason we calculate a value slightly
	  // larger than that used in the article.
	  if (rtt > 100) {
	    return 4 * rtt; // rto > 400msec
	  }
	  return 300 + rtt; // 300msec < rto <= 400msec
	};

	module.exports = function(availableTransports) {
	  transports = transport(availableTransports);
	  __webpack_require__(70)(SockJS, availableTransports);
	  return SockJS;
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11), (function() { return this; }())))

/***/ },
/* 57 */
/***/ function(module, exports) {

	/* eslint-disable */
	/* jscs: disable */
	'use strict';

	// pulled specific shims from https://github.com/es-shims/es5-shim

	var ArrayPrototype = Array.prototype;
	var ObjectPrototype = Object.prototype;
	var FunctionPrototype = Function.prototype;
	var StringPrototype = String.prototype;
	var array_slice = ArrayPrototype.slice;

	var _toString = ObjectPrototype.toString;
	var isFunction = function (val) {
	    return ObjectPrototype.toString.call(val) === '[object Function]';
	};
	var isArray = function isArray(obj) {
	    return _toString.call(obj) === '[object Array]';
	};
	var isString = function isString(obj) {
	    return _toString.call(obj) === '[object String]';
	};

	var supportsDescriptors = Object.defineProperty && (function () {
	    try {
	        Object.defineProperty({}, 'x', {});
	        return true;
	    } catch (e) { /* this is ES3 */
	        return false;
	    }
	}());

	// Define configurable, writable and non-enumerable props
	// if they don't exist.
	var defineProperty;
	if (supportsDescriptors) {
	    defineProperty = function (object, name, method, forceAssign) {
	        if (!forceAssign && (name in object)) { return; }
	        Object.defineProperty(object, name, {
	            configurable: true,
	            enumerable: false,
	            writable: true,
	            value: method
	        });
	    };
	} else {
	    defineProperty = function (object, name, method, forceAssign) {
	        if (!forceAssign && (name in object)) { return; }
	        object[name] = method;
	    };
	}
	var defineProperties = function (object, map, forceAssign) {
	    for (var name in map) {
	        if (ObjectPrototype.hasOwnProperty.call(map, name)) {
	          defineProperty(object, name, map[name], forceAssign);
	        }
	    }
	};

	var toObject = function (o) {
	    if (o == null) { // this matches both null and undefined
	        throw new TypeError("can't convert " + o + ' to object');
	    }
	    return Object(o);
	};

	//
	// Util
	// ======
	//

	// ES5 9.4
	// http://es5.github.com/#x9.4
	// http://jsperf.com/to-integer

	function toInteger(num) {
	    var n = +num;
	    if (n !== n) { // isNaN
	        n = 0;
	    } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
	        n = (n > 0 || -1) * Math.floor(Math.abs(n));
	    }
	    return n;
	}

	function ToUint32(x) {
	    return x >>> 0;
	}

	//
	// Function
	// ========
	//

	// ES-5 15.3.4.5
	// http://es5.github.com/#x15.3.4.5

	function Empty() {}

	defineProperties(FunctionPrototype, {
	    bind: function bind(that) { // .length is 1
	        // 1. Let Target be the this value.
	        var target = this;
	        // 2. If IsCallable(Target) is false, throw a TypeError exception.
	        if (!isFunction(target)) {
	            throw new TypeError('Function.prototype.bind called on incompatible ' + target);
	        }
	        // 3. Let A be a new (possibly empty) internal list of all of the
	        //   argument values provided after thisArg (arg1, arg2 etc), in order.
	        // XXX slicedArgs will stand in for "A" if used
	        var args = array_slice.call(arguments, 1); // for normal call
	        // 4. Let F be a new native ECMAScript object.
	        // 11. Set the [[Prototype]] internal property of F to the standard
	        //   built-in Function prototype object as specified in 15.3.3.1.
	        // 12. Set the [[Call]] internal property of F as described in
	        //   15.3.4.5.1.
	        // 13. Set the [[Construct]] internal property of F as described in
	        //   15.3.4.5.2.
	        // 14. Set the [[HasInstance]] internal property of F as described in
	        //   15.3.4.5.3.
	        var binder = function () {

	            if (this instanceof bound) {
	                // 15.3.4.5.2 [[Construct]]
	                // When the [[Construct]] internal method of a function object,
	                // F that was created using the bind function is called with a
	                // list of arguments ExtraArgs, the following steps are taken:
	                // 1. Let target be the value of F's [[TargetFunction]]
	                //   internal property.
	                // 2. If target has no [[Construct]] internal method, a
	                //   TypeError exception is thrown.
	                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
	                //   property.
	                // 4. Let args be a new list containing the same values as the
	                //   list boundArgs in the same order followed by the same
	                //   values as the list ExtraArgs in the same order.
	                // 5. Return the result of calling the [[Construct]] internal
	                //   method of target providing args as the arguments.

	                var result = target.apply(
	                    this,
	                    args.concat(array_slice.call(arguments))
	                );
	                if (Object(result) === result) {
	                    return result;
	                }
	                return this;

	            } else {
	                // 15.3.4.5.1 [[Call]]
	                // When the [[Call]] internal method of a function object, F,
	                // which was created using the bind function is called with a
	                // this value and a list of arguments ExtraArgs, the following
	                // steps are taken:
	                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
	                //   property.
	                // 2. Let boundThis be the value of F's [[BoundThis]] internal
	                //   property.
	                // 3. Let target be the value of F's [[TargetFunction]] internal
	                //   property.
	                // 4. Let args be a new list containing the same values as the
	                //   list boundArgs in the same order followed by the same
	                //   values as the list ExtraArgs in the same order.
	                // 5. Return the result of calling the [[Call]] internal method
	                //   of target providing boundThis as the this value and
	                //   providing args as the arguments.

	                // equiv: target.call(this, ...boundArgs, ...args)
	                return target.apply(
	                    that,
	                    args.concat(array_slice.call(arguments))
	                );

	            }

	        };

	        // 15. If the [[Class]] internal property of Target is "Function", then
	        //     a. Let L be the length property of Target minus the length of A.
	        //     b. Set the length own property of F to either 0 or L, whichever is
	        //       larger.
	        // 16. Else set the length own property of F to 0.

	        var boundLength = Math.max(0, target.length - args.length);

	        // 17. Set the attributes of the length own property of F to the values
	        //   specified in 15.3.5.1.
	        var boundArgs = [];
	        for (var i = 0; i < boundLength; i++) {
	            boundArgs.push('$' + i);
	        }

	        // XXX Build a dynamic function with desired amount of arguments is the only
	        // way to set the length property of a function.
	        // In environments where Content Security Policies enabled (Chrome extensions,
	        // for ex.) all use of eval or Function costructor throws an exception.
	        // However in all of these environments Function.prototype.bind exists
	        // and so this code will never be executed.
	        var bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this, arguments); }')(binder);

	        if (target.prototype) {
	            Empty.prototype = target.prototype;
	            bound.prototype = new Empty();
	            // Clean up dangling references.
	            Empty.prototype = null;
	        }

	        // TODO
	        // 18. Set the [[Extensible]] internal property of F to true.

	        // TODO
	        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
	        // 20. Call the [[DefineOwnProperty]] internal method of F with
	        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
	        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
	        //   false.
	        // 21. Call the [[DefineOwnProperty]] internal method of F with
	        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
	        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
	        //   and false.

	        // TODO
	        // NOTE Function objects created using Function.prototype.bind do not
	        // have a prototype property or the [[Code]], [[FormalParameters]], and
	        // [[Scope]] internal properties.
	        // XXX can't delete prototype in pure-js.

	        // 22. Return F.
	        return bound;
	    }
	});

	//
	// Array
	// =====
	//

	// ES5 15.4.3.2
	// http://es5.github.com/#x15.4.3.2
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
	defineProperties(Array, { isArray: isArray });


	var boxedString = Object('a');
	var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

	var properlyBoxesContext = function properlyBoxed(method) {
	    // Check node 0.6.21 bug where third parameter is not boxed
	    var properlyBoxesNonStrict = true;
	    var properlyBoxesStrict = true;
	    if (method) {
	        method.call('foo', function (_, __, context) {
	            if (typeof context !== 'object') { properlyBoxesNonStrict = false; }
	        });

	        method.call([1], function () {
	            'use strict';
	            properlyBoxesStrict = typeof this === 'string';
	        }, 'x');
	    }
	    return !!method && properlyBoxesNonStrict && properlyBoxesStrict;
	};

	defineProperties(ArrayPrototype, {
	    forEach: function forEach(fun /*, thisp*/) {
	        var object = toObject(this),
	            self = splitString && isString(this) ? this.split('') : object,
	            thisp = arguments[1],
	            i = -1,
	            length = self.length >>> 0;

	        // If no callback function or if callback is not a callable function
	        if (!isFunction(fun)) {
	            throw new TypeError(); // TODO message
	        }

	        while (++i < length) {
	            if (i in self) {
	                // Invoke the callback function with call, passing arguments:
	                // context, property value, property key, thisArg object
	                // context
	                fun.call(thisp, self[i], i, object);
	            }
	        }
	    }
	}, !properlyBoxesContext(ArrayPrototype.forEach));

	// ES5 15.4.4.14
	// http://es5.github.com/#x15.4.4.14
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
	var hasFirefox2IndexOfBug = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
	defineProperties(ArrayPrototype, {
	    indexOf: function indexOf(sought /*, fromIndex */ ) {
	        var self = splitString && isString(this) ? this.split('') : toObject(this),
	            length = self.length >>> 0;

	        if (!length) {
	            return -1;
	        }

	        var i = 0;
	        if (arguments.length > 1) {
	            i = toInteger(arguments[1]);
	        }

	        // handle negative indices
	        i = i >= 0 ? i : Math.max(0, length + i);
	        for (; i < length; i++) {
	            if (i in self && self[i] === sought) {
	                return i;
	            }
	        }
	        return -1;
	    }
	}, hasFirefox2IndexOfBug);

	//
	// String
	// ======
	//

	// ES5 15.5.4.14
	// http://es5.github.com/#x15.5.4.14

	// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
	// Many browsers do not split properly with regular expressions or they
	// do not perform the split correctly under obscure conditions.
	// See http://blog.stevenlevithan.com/archives/cross-browser-split
	// I've tested in many browsers and this seems to cover the deviant ones:
	//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
	//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
	//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
	//       [undefined, "t", undefined, "e", ...]
	//    ''.split(/.?/) should be [], not [""]
	//    '.'.split(/()()/) should be ["."], not ["", "", "."]

	var string_split = StringPrototype.split;
	if (
	    'ab'.split(/(?:ab)*/).length !== 2 ||
	    '.'.split(/(.?)(.?)/).length !== 4 ||
	    'tesst'.split(/(s)*/)[1] === 't' ||
	    'test'.split(/(?:)/, -1).length !== 4 ||
	    ''.split(/.?/).length ||
	    '.'.split(/()()/).length > 1
	) {
	    (function () {
	        var compliantExecNpcg = /()??/.exec('')[1] === void 0; // NPCG: nonparticipating capturing group

	        StringPrototype.split = function (separator, limit) {
	            var string = this;
	            if (separator === void 0 && limit === 0) {
	                return [];
	            }

	            // If `separator` is not a regex, use native split
	            if (_toString.call(separator) !== '[object RegExp]') {
	                return string_split.call(this, separator, limit);
	            }

	            var output = [],
	                flags = (separator.ignoreCase ? 'i' : '') +
	                        (separator.multiline  ? 'm' : '') +
	                        (separator.extended   ? 'x' : '') + // Proposed for ES6
	                        (separator.sticky     ? 'y' : ''), // Firefox 3+
	                lastLastIndex = 0,
	                // Make `global` and avoid `lastIndex` issues by working with a copy
	                separator2, match, lastIndex, lastLength;
	            separator = new RegExp(separator.source, flags + 'g');
	            string += ''; // Type-convert
	            if (!compliantExecNpcg) {
	                // Doesn't need flags gy, but they don't hurt
	                separator2 = new RegExp('^' + separator.source + '$(?!\\s)', flags);
	            }
	            /* Values for `limit`, per the spec:
	             * If undefined: 4294967295 // Math.pow(2, 32) - 1
	             * If 0, Infinity, or NaN: 0
	             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
	             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
	             * If other: Type-convert, then use the above rules
	             */
	            limit = limit === void 0 ?
	                -1 >>> 0 : // Math.pow(2, 32) - 1
	                ToUint32(limit);
	            while (match = separator.exec(string)) {
	                // `separator.lastIndex` is not reliable cross-browser
	                lastIndex = match.index + match[0].length;
	                if (lastIndex > lastLastIndex) {
	                    output.push(string.slice(lastLastIndex, match.index));
	                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
	                    // nonparticipating capturing groups
	                    if (!compliantExecNpcg && match.length > 1) {
	                        match[0].replace(separator2, function () {
	                            for (var i = 1; i < arguments.length - 2; i++) {
	                                if (arguments[i] === void 0) {
	                                    match[i] = void 0;
	                                }
	                            }
	                        });
	                    }
	                    if (match.length > 1 && match.index < string.length) {
	                        ArrayPrototype.push.apply(output, match.slice(1));
	                    }
	                    lastLength = match[0].length;
	                    lastLastIndex = lastIndex;
	                    if (output.length >= limit) {
	                        break;
	                    }
	                }
	                if (separator.lastIndex === match.index) {
	                    separator.lastIndex++; // Avoid an infinite loop
	                }
	            }
	            if (lastLastIndex === string.length) {
	                if (lastLength || !separator.test('')) {
	                    output.push('');
	                }
	            } else {
	                output.push(string.slice(lastLastIndex));
	            }
	            return output.length > limit ? output.slice(0, limit) : output;
	        };
	    }());

	// [bugfix, chrome]
	// If separator is undefined, then the result array contains just one String,
	// which is the this value (converted to a String). If limit is not undefined,
	// then the output array is truncated so that it contains no more than limit
	// elements.
	// "0".split(undefined, 0) -> []
	} else if ('0'.split(void 0, 0).length) {
	    StringPrototype.split = function split(separator, limit) {
	        if (separator === void 0 && limit === 0) { return []; }
	        return string_split.call(this, separator, limit);
	    };
	}

	// ES5 15.5.4.20
	// whitespace from: http://es5.github.io/#x15.5.4.20
	var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
	    '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
	    '\u2029\uFEFF';
	var zeroWidth = '\u200b';
	var wsRegexChars = '[' + ws + ']';
	var trimBeginRegexp = new RegExp('^' + wsRegexChars + wsRegexChars + '*');
	var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + '*$');
	var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());
	defineProperties(StringPrototype, {
	    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
	    // http://perfectionkills.com/whitespace-deviations/
	    trim: function trim() {
	        if (this === void 0 || this === null) {
	            throw new TypeError("can't convert " + this + ' to object');
	        }
	        return String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
	    }
	}, hasTrimWhitespaceBug);

	// ECMA-262, 3rd B.2.3
	// Not an ECMAScript standard, although ECMAScript 3rd Edition has a
	// non-normative section suggesting uniform semantics and it should be
	// normalized across all browsers
	// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
	var string_substr = StringPrototype.substr;
	var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
	defineProperties(StringPrototype, {
	    substr: function substr(start, length) {
	        return string_substr.call(
	            this,
	            start < 0 ? ((start = this.length + start) < 0 ? 0 : start) : start,
	            length
	        );
	    }
	}, hasNegativeSubstrBug);


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var JSON3 = __webpack_require__(44);

	// Some extra characters that Chrome gets wrong, and substitutes with
	// something else on the wire.
	var extraEscapable = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g
	  , extraLookup;

	// This may be quite slow, so let's delay until user actually uses bad
	// characters.
	var unrollLookup = function(escapable) {
	  var i;
	  var unrolled = {};
	  var c = [];
	  for (i = 0; i < 65536; i++) {
	    c.push( String.fromCharCode(i) );
	  }
	  escapable.lastIndex = 0;
	  c.join('').replace(escapable, function(a) {
	    unrolled[ a ] = '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	    return '';
	  });
	  escapable.lastIndex = 0;
	  return unrolled;
	};

	// Quote string, also taking care of unicode characters that browsers
	// often break. Especially, take care of unicode surrogates:
	// http://en.wikipedia.org/wiki/Mapping_of_Unicode_characters#Surrogates
	module.exports = {
	  quote: function(string) {
	    var quoted = JSON3.stringify(string);

	    // In most cases this should be very fast and good enough.
	    extraEscapable.lastIndex = 0;
	    if (!extraEscapable.test(quoted)) {
	      return quoted;
	    }

	    if (!extraLookup) {
	      extraLookup = unrollLookup(extraEscapable);
	    }

	    return quoted.replace(extraEscapable, function(a) {
	      return extraLookup[a];
	    });
	  }
	};


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:utils:transport');
	}

	module.exports = function(availableTransports) {
	  return {
	    filterToEnabled: function(transportsWhitelist, info) {
	      var transports = {
	        main: []
	      , facade: []
	      };
	      if (!transportsWhitelist) {
	        transportsWhitelist = [];
	      } else if (typeof transportsWhitelist === 'string') {
	        transportsWhitelist = [transportsWhitelist];
	      }

	      availableTransports.forEach(function(trans) {
	        if (!trans) {
	          return;
	        }

	        if (trans.transportName === 'websocket' && info.websocket === false) {
	          debug('disabled from server', 'websocket');
	          return;
	        }

	        if (transportsWhitelist.length &&
	            transportsWhitelist.indexOf(trans.transportName) === -1) {
	          debug('not in whitelist', trans.transportName);
	          return;
	        }

	        if (trans.enabled(info)) {
	          debug('enabled', trans.transportName);
	          transports.main.push(trans);
	          if (trans.facadeTransport) {
	            transports.facade.push(trans.facadeTransport);
	          }
	        } else {
	          debug('disabled', trans.transportName);
	        }
	      });
	      return transports;
	    }
	  };
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 60 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var logObject = {};
	['log', 'debug', 'warn'].forEach(function (level) {
	  var levelExists = global.console && global.console[level] && global.console[level].apply;
	  logObject[level] = levelExists ? function () {
	    return global.console[level].apply(global.console, arguments);
	  } : (level === 'log' ? function () {} : logObject.log);
	});

	module.exports = logObject;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 61 */
/***/ function(module, exports) {

	'use strict';

	function Event(eventType) {
	  this.type = eventType;
	}

	Event.prototype.initEvent = function(eventType, canBubble, cancelable) {
	  this.type = eventType;
	  this.bubbles = canBubble;
	  this.cancelable = cancelable;
	  this.timeStamp = +new Date();
	  return this;
	};

	Event.prototype.stopPropagation = function() {};
	Event.prototype.preventDefault  = function() {};

	Event.CAPTURING_PHASE = 1;
	Event.AT_TARGET       = 2;
	Event.BUBBLING_PHASE  = 3;

	module.exports = Event;


/***/ },
/* 62 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	module.exports = global.location || {
	  origin: 'http://localhost:80'
	, protocol: 'http'
	, host: 'localhost'
	, port: 80
	, href: 'http://localhost/'
	, hash: ''
	};

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(23)
	  , Event = __webpack_require__(61)
	  ;

	function CloseEvent() {
	  Event.call(this);
	  this.initEvent('close', false, false);
	  this.wasClean = false;
	  this.code = 0;
	  this.reason = '';
	}

	inherits(CloseEvent, Event);

	module.exports = CloseEvent;


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(23)
	  , Event = __webpack_require__(61)
	  ;

	function TransportMessageEvent(data) {
	  Event.call(this);
	  this.initEvent('message', false, false);
	  this.data = data;
	}

	inherits(TransportMessageEvent, Event);

	module.exports = TransportMessageEvent;


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var EventEmitter = __webpack_require__(24).EventEmitter
	  , inherits = __webpack_require__(23)
	  , urlUtils = __webpack_require__(15)
	  , XDR = __webpack_require__(38)
	  , XHRCors = __webpack_require__(33)
	  , XHRLocal = __webpack_require__(35)
	  , XHRFake = __webpack_require__(66)
	  , InfoIframe = __webpack_require__(67)
	  , InfoAjax = __webpack_require__(69)
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:info-receiver');
	}

	function InfoReceiver(baseUrl, urlInfo) {
	  debug(baseUrl);
	  var self = this;
	  EventEmitter.call(this);

	  setTimeout(function() {
	    self.doXhr(baseUrl, urlInfo);
	  }, 0);
	}

	inherits(InfoReceiver, EventEmitter);

	// TODO this is currently ignoring the list of available transports and the whitelist

	InfoReceiver._getReceiver = function(baseUrl, url, urlInfo) {
	  // determine method of CORS support (if needed)
	  if (urlInfo.sameOrigin) {
	    return new InfoAjax(url, XHRLocal);
	  }
	  if (XHRCors.enabled) {
	    return new InfoAjax(url, XHRCors);
	  }
	  if (XDR.enabled && urlInfo.sameScheme) {
	    return new InfoAjax(url, XDR);
	  }
	  if (InfoIframe.enabled()) {
	    return new InfoIframe(baseUrl, url);
	  }
	  return new InfoAjax(url, XHRFake);
	};

	InfoReceiver.prototype.doXhr = function(baseUrl, urlInfo) {
	  var self = this
	    , url = urlUtils.addPath(baseUrl, '/info')
	    ;
	  debug('doXhr', url);

	  this.xo = InfoReceiver._getReceiver(baseUrl, url, urlInfo);

	  this.timeoutRef = setTimeout(function() {
	    debug('timeout');
	    self._cleanup(false);
	    self.emit('finish');
	  }, InfoReceiver.timeout);

	  this.xo.once('finish', function(info, rtt) {
	    debug('finish', info, rtt);
	    self._cleanup(true);
	    self.emit('finish', info, rtt);
	  });
	};

	InfoReceiver.prototype._cleanup = function(wasClean) {
	  debug('_cleanup');
	  clearTimeout(this.timeoutRef);
	  this.timeoutRef = null;
	  if (!wasClean && this.xo) {
	    this.xo.close();
	  }
	  this.xo = null;
	};

	InfoReceiver.prototype.close = function() {
	  debug('close');
	  this.removeAllListeners();
	  this._cleanup(false);
	};

	InfoReceiver.timeout = 8000;

	module.exports = InfoReceiver;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var EventEmitter = __webpack_require__(24).EventEmitter
	  , inherits = __webpack_require__(23)
	  ;

	function XHRFake(/* method, url, payload, opts */) {
	  var self = this;
	  EventEmitter.call(this);

	  this.to = setTimeout(function() {
	    self.emit('finish', 200, '{}');
	  }, XHRFake.timeout);
	}

	inherits(XHRFake, EventEmitter);

	XHRFake.prototype.close = function() {
	  clearTimeout(this.to);
	};

	XHRFake.timeout = 2000;

	module.exports = XHRFake;


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, global) {'use strict';

	var EventEmitter = __webpack_require__(24).EventEmitter
	  , inherits = __webpack_require__(23)
	  , JSON3 = __webpack_require__(44)
	  , utils = __webpack_require__(12)
	  , IframeTransport = __webpack_require__(43)
	  , InfoReceiverIframe = __webpack_require__(68)
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:info-iframe');
	}

	function InfoIframe(baseUrl, url) {
	  var self = this;
	  EventEmitter.call(this);

	  var go = function() {
	    var ifr = self.ifr = new IframeTransport(InfoReceiverIframe.transportName, url, baseUrl);

	    ifr.once('message', function(msg) {
	      if (msg) {
	        var d;
	        try {
	          d = JSON3.parse(msg);
	        } catch (e) {
	          debug('bad json', msg);
	          self.emit('finish');
	          self.close();
	          return;
	        }

	        var info = d[0], rtt = d[1];
	        self.emit('finish', info, rtt);
	      }
	      self.close();
	    });

	    ifr.once('close', function() {
	      self.emit('finish');
	      self.close();
	    });
	  };

	  // TODO this seems the same as the 'needBody' from transports
	  if (!global.document.body) {
	    utils.attachEvent('load', go);
	  } else {
	    go();
	  }
	}

	inherits(InfoIframe, EventEmitter);

	InfoIframe.enabled = function() {
	  return IframeTransport.enabled();
	};

	InfoIframe.prototype.close = function() {
	  if (this.ifr) {
	    this.ifr.close();
	  }
	  this.removeAllListeners();
	  this.ifr = null;
	};

	module.exports = InfoIframe;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11), (function() { return this; }())))

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(23)
	  , EventEmitter = __webpack_require__(24).EventEmitter
	  , JSON3 = __webpack_require__(44)
	  , XHRLocalObject = __webpack_require__(35)
	  , InfoAjax = __webpack_require__(69)
	  ;

	function InfoReceiverIframe(transUrl) {
	  var self = this;
	  EventEmitter.call(this);

	  this.ir = new InfoAjax(transUrl, XHRLocalObject);
	  this.ir.once('finish', function(info, rtt) {
	    self.ir = null;
	    self.emit('message', JSON3.stringify([info, rtt]));
	  });
	}

	inherits(InfoReceiverIframe, EventEmitter);

	InfoReceiverIframe.transportName = 'iframe-info-receiver';

	InfoReceiverIframe.prototype.close = function() {
	  if (this.ir) {
	    this.ir.close();
	    this.ir = null;
	  }
	  this.removeAllListeners();
	};

	module.exports = InfoReceiverIframe;


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var EventEmitter = __webpack_require__(24).EventEmitter
	  , inherits = __webpack_require__(23)
	  , JSON3 = __webpack_require__(44)
	  , objectUtils = __webpack_require__(48)
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:info-ajax');
	}

	function InfoAjax(url, AjaxObject) {
	  EventEmitter.call(this);

	  var self = this;
	  var t0 = +new Date();
	  this.xo = new AjaxObject('GET', url);

	  this.xo.once('finish', function(status, text) {
	    var info, rtt;
	    if (status === 200) {
	      rtt = (+new Date()) - t0;
	      if (text) {
	        try {
	          info = JSON3.parse(text);
	        } catch (e) {
	          debug('bad json', text);
	        }
	      }

	      if (!objectUtils.isObject(info)) {
	        info = {};
	      }
	    }
	    self.emit('finish', info, rtt);
	    self.removeAllListeners();
	  });
	}

	inherits(InfoAjax, EventEmitter);

	InfoAjax.prototype.close = function() {
	  this.removeAllListeners();
	  this.xo.close();
	};

	module.exports = InfoAjax;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var urlUtils = __webpack_require__(15)
	  , eventUtils = __webpack_require__(12)
	  , JSON3 = __webpack_require__(44)
	  , FacadeJS = __webpack_require__(71)
	  , InfoIframeReceiver = __webpack_require__(68)
	  , iframeUtils = __webpack_require__(47)
	  , loc = __webpack_require__(62)
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = __webpack_require__(20)('sockjs-client:iframe-bootstrap');
	}

	module.exports = function(SockJS, availableTransports) {
	  var transportMap = {};
	  availableTransports.forEach(function(at) {
	    if (at.facadeTransport) {
	      transportMap[at.facadeTransport.transportName] = at.facadeTransport;
	    }
	  });

	  // hard-coded for the info iframe
	  // TODO see if we can make this more dynamic
	  transportMap[InfoIframeReceiver.transportName] = InfoIframeReceiver;
	  var parentOrigin;

	  /* eslint-disable camelcase */
	  SockJS.bootstrap_iframe = function() {
	    /* eslint-enable camelcase */
	    var facade;
	    iframeUtils.currentWindowId = loc.hash.slice(1);
	    var onMessage = function(e) {
	      if (e.source !== parent) {
	        return;
	      }
	      if (typeof parentOrigin === 'undefined') {
	        parentOrigin = e.origin;
	      }
	      if (e.origin !== parentOrigin) {
	        return;
	      }

	      var iframeMessage;
	      try {
	        iframeMessage = JSON3.parse(e.data);
	      } catch (ignored) {
	        debug('bad json', e.data);
	        return;
	      }

	      if (iframeMessage.windowId !== iframeUtils.currentWindowId) {
	        return;
	      }
	      switch (iframeMessage.type) {
	      case 's':
	        var p;
	        try {
	          p = JSON3.parse(iframeMessage.data);
	        } catch (ignored) {
	          debug('bad json', iframeMessage.data);
	          break;
	        }
	        var version = p[0];
	        var transport = p[1];
	        var transUrl = p[2];
	        var baseUrl = p[3];
	        debug(version, transport, transUrl, baseUrl);
	        // change this to semver logic
	        if (version !== SockJS.version) {
	          throw new Error('Incompatibile SockJS! Main site uses:' +
	                    ' "' + version + '", the iframe:' +
	                    ' "' + SockJS.version + '".');
	        }

	        if (!urlUtils.isOriginEqual(transUrl, loc.href) ||
	            !urlUtils.isOriginEqual(baseUrl, loc.href)) {
	          throw new Error('Can\'t connect to different domain from within an ' +
	                    'iframe. (' + loc.href + ', ' + transUrl + ', ' + baseUrl + ')');
	        }
	        facade = new FacadeJS(new transportMap[transport](transUrl, baseUrl));
	        break;
	      case 'm':
	        facade._send(iframeMessage.data);
	        break;
	      case 'c':
	        if (facade) {
	          facade._close();
	        }
	        facade = null;
	        break;
	      }
	    };

	    eventUtils.attachEvent('message', onMessage);

	    // Start
	    iframeUtils.postMessage('s');
	  };
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var JSON3 = __webpack_require__(44)
	  , iframeUtils = __webpack_require__(47)
	  ;

	function FacadeJS(transport) {
	  this._transport = transport;
	  transport.on('message', this._transportMessage.bind(this));
	  transport.on('close', this._transportClose.bind(this));
	}

	FacadeJS.prototype._transportClose = function(code, reason) {
	  iframeUtils.postMessage('c', JSON3.stringify([code, reason]));
	};
	FacadeJS.prototype._transportMessage = function(frame) {
	  iframeUtils.postMessage('t', frame);
	};
	FacadeJS.prototype._send = function(data) {
	  this._transport.send(data);
	};
	FacadeJS.prototype._close = function() {
	  this._transport.close();
	  this._transport.removeAllListeners();
	};

	module.exports = FacadeJS;


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ansiRegex = __webpack_require__(73)();

	module.exports = function (str) {
		return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
	};


/***/ },
/* 73 */
/***/ function(module, exports) {

	'use strict';
	module.exports = function () {
		return /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
	};


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	/*globals window __webpack_hash__ */
	if(false) {
		var lastData;
		var upToDate = function upToDate() {
			return lastData.indexOf(__webpack_hash__) >= 0;
		};
		var check = function check() {
			module.hot.check(true, function(err, updatedModules) {
				if(err) {
					if(module.hot.status() in {
							abort: 1,
							fail: 1
						}) {
						console.warn("[HMR] Cannot apply update. Need to do a full reload!");
						console.warn("[HMR] " + err.stack || err.message);
						window.location.reload();
					} else {
						console.warn("[HMR] Update failed: " + err.stack || err.message);
					}
					return;
				}

				if(!updatedModules) {
					console.warn("[HMR] Cannot find update. Need to do a full reload!");
					console.warn("[HMR] (Probably because of restarting the webpack-dev-server)");
					window.location.reload();
					return;
				}

				if(!upToDate()) {
					check();
				}

				require("./log-apply-result")(updatedModules, updatedModules);

				if(upToDate()) {
					console.log("[HMR] App is up to date.");
				}

			});
		};
		var addEventListener = window.addEventListener ? function(eventName, listener) {
			window.addEventListener(eventName, listener, false);
		} : function(eventName, listener) {
			window.attachEvent("on" + eventName, listener);
		};
		addEventListener("message", function(event) {
			if(typeof event.data === "string" && event.data.indexOf("webpackHotUpdate") === 0) {
				lastData = event.data;
				if(!upToDate() && module.hot.status() === "idle") {
					console.log("[HMR] Checking for updates on the server...");
					check();
				}
			}
		});
		console.log("[HMR] Waiting for update signal from WDS...");
	} else {
		throw new Error("[HMR] Hot Module Replacement is disabled.");
	}


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(76);

	var _jquery = __webpack_require__(100);

	var _jquery2 = _interopRequireDefault(_jquery);

	var _header = __webpack_require__(101);

	var _header2 = _interopRequireDefault(_header);

	var _home = __webpack_require__(102);

	var _home2 = _interopRequireDefault(_home);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	window.App = {
	  header: new _header2.default()
	};

	(0, _jquery2.default)(document).on('ready', function () {
	  App.home = new _home2.default();
	});

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(77);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(99)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js?sourceMap!./../../node_modules/postcss-loader/index.js!./../../node_modules/sass-loader/index.js?sourceMap!!./base.scss", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js?sourceMap!./../../node_modules/postcss-loader/index.js!./../../node_modules/sass-loader/index.js?sourceMap!!./base.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(78)();
	// imports


	// module
	exports.push([module.id, "/* COLORS */\n/* BREAKPOINTS */\n/* Z-INDICES */\n/* FONTS */\n@font-face {\n  font-family: \"Verlag\";\n  src: url(" + __webpack_require__(79) + ") format(\"woff2\"); }\n\n@font-face {\n  font-family: \"Verlag\";\n  font-weight: bold;\n  src: url(" + __webpack_require__(80) + ") format(\"embedded-opentype\");\n  src: url(" + __webpack_require__(80) + "#iefix) format(\"embedded-opentype\"), url(" + __webpack_require__(81) + ") format(\"woff2\"), url(" + __webpack_require__(82) + ") format(\"woff\"), url(" + __webpack_require__(83) + ") format(\"truetype\"), url(" + __webpack_require__(84) + ") format(\"svg\"); }\n\n@font-face {\n  font-family: \"Chronicle\";\n  src: url(" + __webpack_require__(85) + ") format(\"embedded-opentype\");\n  src: url(" + __webpack_require__(85) + "#iefix) format(\"embedded-opentype\"), url(" + __webpack_require__(86) + ") format(\"woff2\"), url(" + __webpack_require__(87) + ") format(\"woff\"), url(" + __webpack_require__(88) + ") format(\"truetype\"), url(" + __webpack_require__(89) + ") format(\"svg\"); }\n\n@font-face {\n  font-family: \"Chronicle\";\n  font-style: italic;\n  src: url(" + __webpack_require__(90) + ") format(\"embedded-opentype\");\n  src: url(" + __webpack_require__(90) + "#iefix) format(\"embedded-opentype\"), url(" + __webpack_require__(91) + ") format(\"woff2\"), url(" + __webpack_require__(92) + ") format(\"woff\"), url(" + __webpack_require__(93) + ") format(\"truetype\"), url(" + __webpack_require__(94) + ") format(\"svg\"); }\n\n@font-face {\n  font-weight: normal;\n  font-style: normal;\n  font-family: 'icomoon';\n  src: url(" + __webpack_require__(95) + ") format(\"embedded-opentype\");\n  src: url(" + __webpack_require__(95) + "#iefix) format(\"embedded-opentype\"), url(" + __webpack_require__(96) + ") format(\"truetype\"), url(" + __webpack_require__(97) + ") format(\"woff\"), url(" + __webpack_require__(98) + "#icomoon) format(\"svg\"); }\n\n[class^=\"icon-\"], [class*=\" icon-\"] {\n  /* use !important to prevent issues with browser extensions that change fonts */\n  font-family: 'icomoon' !important;\n  speak: none;\n  font-style: normal;\n  font-weight: normal;\n  font-variant: normal;\n  text-transform: none;\n  line-height: 1;\n  /* Better Font Rendering =========== */\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale; }\n\n.icon-horse:before {\n  content: \"\\E908\"; }\n\n.icon-arrow_getintouch:before {\n  content: \"\\E903\"; }\n\n.icon-arrowdown:before {\n  content: \"\\E900\"; }\n\n.icon-full-logo:before {\n  content: \"\\E901\"; }\n\n.icon-small-logo:before {\n  content: \"\\E902\"; }\n\n.icon-HL_Logo_3_mobile:before {\n  content: \"\\E911\"; }\n\n.icon-map:before {\n  content: \"\\E904\"; }\n\n.icon-photo:before {\n  content: \"\\E905\"; }\n\n.icon-mail:before {\n  content: \"\\E906\"; }\n\n.icon-phone:before {\n  content: \"\\E907\"; }\n\n.icon-map-bubble:before {\n  content: \"\\E909\"; }\n\n.icon-map-cafe:before {\n  content: \"\\E90A\"; }\n\n.icon-map-attraction:before {\n  content: \"\\E90B\"; }\n\n.icon-map-bar:before {\n  content: \"\\E90C\"; }\n\n.icon-map-farm:before {\n  content: \"\\E90D\"; }\n\n.icon-map-park:before {\n  content: \"\\E90E\"; }\n\n.icon-map-shopping:before {\n  content: \"\\E90F\"; }\n\n.icon-map-trail:before {\n  content: \"\\E910\"; }\n\n/* http://meyerweb.com/eric/tools/css/reset/ \n   v2.0 | 20110126\n   License: none (public domain)\n*/\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed,\nfigure, figcaption, footer, header, hgroup,\nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font-size: 100%;\n  font: inherit;\n  vertical-align: baseline; }\n\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure,\nfooter, header, hgroup, menu, nav, section {\n  display: block; }\n\nbody {\n  line-height: 1; }\n\nol, ul {\n  list-style: none; }\n\nblockquote, q {\n  quotes: none; }\n\nblockquote:before, blockquote:after,\nq:before, q:after {\n  content: '';\n  content: none; }\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0; }\n\ninput[type=\"button\"],\ninput[type=\"submit\"],\ninput[type=\"reset\"],\ninput[type=\"file\"]::-webkit-file-upload-button,\nbutton {\n  outline: 0;\n  border: 0;\n  background: none;\n  padding: 0;\n  color: inherit;\n  cursor: pointer; }\n\n.header {\n  z-index: 100;\n  background: #fff; }\n  .header--main {\n    position: fixed;\n    top: 0;\n    width: 100%;\n    height: 70px;\n    border-bottom: 4px solid #00534d; }\n  .header__nav {\n    font-family: \"Verlag\";\n    font-weight: bold;\n    font-size: 12px;\n    line-height: 66px; }\n    .header__nav--left, .header__nav--right {\n      position: absolute;\n      top: 0; }\n    .header__nav--center {\n      margin: 0 auto;\n      text-align: center; }\n    .header__nav--left {\n      left: 0;\n      padding-left: 20px;\n      width: 170px;\n      text-align: left; }\n    .header__nav--right {\n      right: 0;\n      padding-right: 20px;\n      width: 120px;\n      text-align: right; }\n\n.nav__list--horizontal .nav__li {\n  display: inline-block; }\n\n.nav__li {\n  text-transform: uppercase;\n  padding: 0 15px;\n  position: relative; }\n  .nav__li:after {\n    background: #00534d;\n    content: \"\";\n    display: block;\n    height: 10px;\n    position: absolute;\n    right: 0;\n    top: 28px;\n    width: 2px; }\n  .nav__li:first-child {\n    padding-left: 0; }\n  .nav__li:last-child {\n    padding-right: 0; }\n    .nav__li:last-child:after {\n      content: none; }\n\n.nav__link {\n  line-height: inherit;\n  margin: auto; }\n\n.nav__icon {\n  font-size: 30px;\n  vertical-align: middle;\n  display: inline-block; }\n  .nav__icon--logo {\n    color: #00534d; }\n  .nav__icon--photo {\n    margin-left: 18px; }\n\n@media (max-width: 1100px) {\n  .header {\n    z-index: 100; }\n  .hamburger {\n    background: #fff;\n    position: absolute;\n    width: 65px;\n    height: 60px;\n    cursor: pointer;\n    padding: 20px;\n    z-index: 515; }\n    .hamburger__inner {\n      display: block;\n      top: 50%; }\n      .hamburger__inner, .hamburger__inner::before, .hamburger__inner::after {\n        width: 25px;\n        height: 2px;\n        background-color: #666;\n        border-radius: 0px;\n        position: absolute;\n        transition-property: -webkit-transform;\n        transition-property: transform;\n        transition-property: transform, -webkit-transform;\n        transition-duration: 0.15s;\n        transition-timing-function: ease; }\n      .hamburger__inner::before, .hamburger__inner::after {\n        content: \"\";\n        display: block; }\n      .hamburger__inner::before {\n        top: -9px;\n        transition: top 0.1s 0.14s ease, opacity 0.1s ease; }\n      .hamburger__inner::after {\n        bottom: -9px;\n        transition: bottom 0.1s 0.14s ease, -webkit-transform 0.1s cubic-bezier(0.55, 0.055, 0.675, 0.19);\n        transition: bottom 0.1s 0.14s ease, transform 0.1s cubic-bezier(0.55, 0.055, 0.675, 0.19);\n        transition: bottom 0.1s 0.14s ease, transform 0.1s cubic-bezier(0.55, 0.055, 0.675, 0.19), -webkit-transform 0.1s cubic-bezier(0.55, 0.055, 0.675, 0.19); }\n  .mobile-nav {\n    background: #fff;\n    transition: left .3s ease-in-out;\n    position: fixed;\n    left: -220px;\n    width: 220px;\n    z-index: 510;\n    height: 100%;\n    padding: 65px 40px 0;\n    text-align: left;\n    overflow: auto; }\n    .mobile-nav .nav__li {\n      padding: 0;\n      width: 100%; }\n    .mobile-nav .nav__list--secondary {\n      margin-top: 20px;\n      border-top: 1px solid #dedede;\n      padding-top: 20px; }\n  .header {\n    height: 64px; }\n    .header__nav {\n      line-height: 60px; }\n    .header__underlay {\n      background: #f4f1ee;\n      position: fixed;\n      opacity: 0;\n      height: 100%;\n      width: 100%;\n      top: 0;\n      left: 0;\n      visibility: hidden;\n      transition: opacity .3s, visibility .3s 0s;\n      pointer-events: none;\n      z-index: 500; }\n    .header__nav--logo {\n      position: absolute;\n      left: 50%;\n      margin-left: -85px;\n      padding: 0;\n      text-align: center; }\n    .header.-mobile-nav-visible .header__underlay {\n      opacity: .5;\n      visibility: visible;\n      pointer-events: all; }\n    .header.-mobile-nav-visible .mobile-nav {\n      left: 0; }\n    .header.-mobile-nav-visible .hamburger__inner {\n      -webkit-transform: rotate(45deg);\n              transform: rotate(45deg);\n      transition-delay: 0.14s;\n      transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); }\n      .header.-mobile-nav-visible .hamburger__inner:before {\n        top: 0;\n        opacity: 0;\n        transition: top 0.1s ease, opacity 0.1s 0.14s ease; }\n      .header.-mobile-nav-visible .hamburger__inner:after {\n        bottom: 0;\n        -webkit-transform: rotate(-90deg);\n                transform: rotate(-90deg);\n        transition: bottom 0.1s ease, -webkit-transform 0.1s 0.14s cubic-bezier(0.215, 0.61, 0.355, 1);\n        transition: bottom 0.1s ease, transform 0.1s 0.14s cubic-bezier(0.215, 0.61, 0.355, 1);\n        transition: bottom 0.1s ease, transform 0.1s 0.14s cubic-bezier(0.215, 0.61, 0.355, 1), -webkit-transform 0.1s 0.14s cubic-bezier(0.215, 0.61, 0.355, 1); }\n  .nav__li:after {\n    content: none; } }\n\n/* GET IN TOUCH */\n.contact {\n  background: #fff;\n  transition: right .3s ease-in-out;\n  border: 4px solid #9faeb6;\n  color: #00534d;\n  padding: 25px;\n  position: fixed;\n  right: -300px;\n  text-align: center;\n  top: 150px;\n  width: 300px;\n  z-index: 90; }\n  .contact.-is-visible {\n    right: 0; }\n  .contact__button {\n    background: #9faeb6;\n    color: #fff;\n    font: bold 12px \"Verlag\";\n    height: 40px;\n    left: -164px;\n    line-height: 12px;\n    padding: 14px;\n    position: absolute;\n    text-transform: uppercase;\n    top: -4px;\n    -webkit-transform-origin: top right;\n            transform-origin: top right;\n    -webkit-transform: rotate(-90deg);\n            transform: rotate(-90deg);\n    width: 120px; }\n  .contact__h3 {\n    font: bold 13px \"Verlag\";\n    letter-spacing: .2em;\n    text-transform: uppercase;\n    margin: 15px auto; }\n  .contact__p {\n    font-size: 13px;\n    line-height: 20px;\n    margin: 15px auto; }\n  .contact__cta {\n    color: #666;\n    font: italic 15px \"Chronicle\";\n    margin: 20px auto 10px; }\n  .contact__link, .contact__icon {\n    display: block; }\n  .contact__icon {\n    color: #00534d;\n    font-size: 12px; }\n  .contact__link {\n    margin-top: 16px; }\n  @media (max-width: 600px) {\n    .contact {\n      transition: top .3s ease-in-out;\n      position: fixed;\n      width: 100%;\n      right: auto;\n      left: 0;\n      top: -200px; }\n      .contact.-is-visible {\n        top: 100px; }\n      .contact__button {\n        position: fixed;\n        width: 100%;\n        left: 0;\n        -webkit-transform: none;\n                transform: none;\n        top: 64px; }\n        .contact__button__arrow {\n          display: inline-block;\n          line-height: 12px;\n          font-size: 8px;\n          margin-left: 8px; }\n          .contact.-is-visible .contact__button__arrow {\n            -webkit-transform: rotate(180deg) translateY(1px);\n                    transform: rotate(180deg) translateY(1px); } }\n\n.home__block {\n  display: block;\n  width: 100%; }\n\n.video-wrapper {\n  position: relative; }\n\n.video {\n  width: 100%;\n  display: block; }\n  .video__title {\n    transition: opacity 2s ease-in-out;\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    margin-left: -280px;\n    margin-top: -67px;\n    width: 560px;\n    height: 134px;\n    color: #fff;\n    text-align: center;\n    opacity: 0; }\n    .video__title.-is-visible {\n      opacity: 1; }\n  .video__h3 {\n    font: 30px \"Chronicle\";\n    font-style: italic;\n    margin-bottom: 40px; }\n\n.main-title {\n  font: 60px \"Verlag\";\n  font-weight: bold;\n  letter-spacing: 0.2em;\n  color: #fff;\n  text-transform: uppercase;\n  width: 560px;\n  text-align: center; }\n  .main-title__span {\n    font-family: \"Chronicle\";\n    font-weight: normal;\n    font-style: italic;\n    text-transform: none;\n    letter-spacing: 0.1em; }\n\n.home__block img {\n  display: block;\n  width: 100%; }\n\n* {\n  box-sizing: border-box;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale; }\n\nbody {\n  font-size: 18px;\n  font-family: \"Chronicle\"; }\n\na {\n  color: #666;\n  text-decoration: none; }\n  a:hover {\n    cursor: pointer;\n    color: #000; }\n\n.content-area {\n  margin-top: 70px;\n  position: relative;\n  z-index: 50; }\n  @media screen and (max-width: 1100px) {\n    .content-area {\n      margin-top: 64px; } }\n\n@media screen and (max-width: 1100px) {\n  .-min-size-tablet {\n    display: none; } }\n\n@media screen and (min-width: 1101px) {\n  .-max-size-tablet {\n    display: none; } }\n\n@media screen and (max-width: 600px) {\n  .-min-size-mobile {\n    display: none; } }\n\n@media screen and (min-width: 601px) {\n  .-max-size-mobile {\n    display: none; } }\n", "", {"version":3,"sources":["/./src/src/scss/_variables.scss","/./src/src/scss/_fonts.scss","/./src/scss/base.scss","/./src/src/scss/reset.scss","/./src/src/scss/header.scss","/./src/src/scss/home.scss","/./src/src/scss/base.scss"],"names":[],"mappings":"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","file":"base.scss","sourcesContent":["/* COLORS */\n$green: #00534d;\n$gray: #666;\n$white: #fff;\n$black: #000;\n$borderGray: #dedede;\n$overlayBg: #f4f1ee;\n$blue: #9faeb6;\n\n/* BREAKPOINTS */\n$mobilePortrait: 480px;\n$mobileLandscape: 600px;\n$tabletPortrait: 768px;\n$tabletLandscape: 1100px;\n$desktop: 1200px;\n\n/* Z-INDICES */\n$overlayZ: 500;\n$headerZ: 100;\n\n/* FONTS */\n$verlag: \"Verlag\";\n$verlagBlack: \"VerlagBlack\";\n$chronicle: \"Chronicle\";\n","@font-face {\n  font-family: $verlag;\n  src: url(\"../fonts/Verlag.woff2\") format(\"woff2\");\n}\n\n@font-face {\n  font-family: $verlag;\n  font-weight: bold;\n  src: url('../fonts/Verlag-Black.eot') format(\"embedded-opentype\");\n  src: url(\"../fonts/Verlag-Black.eot#iefix\") format(\"embedded-opentype\"),\n       url(\"../fonts/Verlag-Black.woff2\") format(\"woff2\"),\n       url(\"../fonts/Verlag-Black.woff\") format(\"woff\"),\n       url(\"../fonts/Verlag-Black.ttf\") format(\"truetype\"),\n       url(\"../fonts/Verlag-Black.svg\") format(\"svg\");\n}\n\n@font-face {\n  font-family: $chronicle;\n  src: url('../fonts/Chronicle.eot') format(\"embedded-opentype\");\n  src: url(\"../fonts/Chronicle.eot#iefix\") format(\"embedded-opentype\"),\n       url(\"../fonts/Chronicle.woff2\") format(\"woff2\"),\n       url(\"../fonts/Chronicle.woff\") format(\"woff\"),\n       url(\"../fonts/Chronicle.ttf\") format(\"truetype\"),\n       url(\"../fonts/Chronicle.svg\") format(\"svg\");\n}\n\n@font-face {\n  font-family: $chronicle;\n  font-style: italic;\n  src: url('../fonts/Chronicle-Italic.eot') format(\"embedded-opentype\");\n  src: url(\"../fonts/Chronicle-Italic.eot#iefix\") format(\"embedded-opentype\"),\n       url(\"../fonts/Chronicle-Italic.woff2\") format(\"woff2\"),\n       url(\"../fonts/Chronicle-Italic.woff\") format(\"woff\"),\n       url(\"../fonts/Chronicle-Italic.ttf\") format(\"truetype\"),\n       url(\"../fonts/Chronicle-Italic.svg\") format(\"svg\");\n}\n\n@font-face {\n  font-weight: normal;\n  font-style: normal;\n  font-family: 'icomoon';\n  src: url('../fonts/icomoon.eot') format(\"embedded-opentype\");\n  src: url('../fonts/icomoon.eot#iefix') format('embedded-opentype'),\n       url('../fonts/icomoon.ttf') format('truetype'),\n       url('../fonts/icomoon.woff') format('woff'),\n       url('../fonts/icomoon.svg#icomoon') format('svg');\n}\n\n[class^=\"icon-\"], [class*=\" icon-\"] {\n    /* use !important to prevent issues with browser extensions that change fonts */\n    font-family: 'icomoon' !important;\n    speak: none;\n    font-style: normal;\n    font-weight: normal;\n    font-variant: normal;\n    text-transform: none;\n    line-height: 1;\n\n    /* Better Font Rendering =========== */\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n}\n\n.icon-horse:before {\n    content: \"\\e908\";\n}\n.icon-arrow_getintouch:before {\n    content: \"\\e903\";\n}\n.icon-arrowdown:before {\n    content: \"\\e900\";\n}\n.icon-full-logo:before {\n    content: \"\\e901\";\n}\n.icon-small-logo:before {\n    content: \"\\e902\";\n}\n.icon-HL_Logo_3_mobile:before {\n    content: \"\\e911\";\n}\n.icon-map:before {\n    content: \"\\e904\";\n}\n.icon-photo:before {\n    content: \"\\e905\";\n}\n.icon-mail:before {\n    content: \"\\e906\";\n}\n.icon-phone:before {\n    content: \"\\e907\";\n}\n.icon-map-bubble:before {\n    content: \"\\e909\";\n}\n.icon-map-cafe:before {\n    content: \"\\e90a\";\n}\n.icon-map-attraction:before {\n    content: \"\\e90b\";\n}\n.icon-map-bar:before {\n    content: \"\\e90c\";\n}\n.icon-map-farm:before {\n    content: \"\\e90d\";\n}\n.icon-map-park:before {\n    content: \"\\e90e\";\n}\n.icon-map-shopping:before {\n    content: \"\\e90f\";\n}\n.icon-map-trail:before {\n    content: \"\\e910\";\n}","/* COLORS */\n/* BREAKPOINTS */\n/* Z-INDICES */\n/* FONTS */\n@font-face {\n  font-family: \"Verlag\";\n  src: url(\"../fonts/Verlag.woff2\") format(\"woff2\"); }\n\n@font-face {\n  font-family: \"Verlag\";\n  font-weight: bold;\n  src: url(\"../fonts/Verlag-Black.eot\") format(\"embedded-opentype\");\n  src: url(\"../fonts/Verlag-Black.eot#iefix\") format(\"embedded-opentype\"), url(\"../fonts/Verlag-Black.woff2\") format(\"woff2\"), url(\"../fonts/Verlag-Black.woff\") format(\"woff\"), url(\"../fonts/Verlag-Black.ttf\") format(\"truetype\"), url(\"../fonts/Verlag-Black.svg\") format(\"svg\"); }\n\n@font-face {\n  font-family: \"Chronicle\";\n  src: url(\"../fonts/Chronicle.eot\") format(\"embedded-opentype\");\n  src: url(\"../fonts/Chronicle.eot#iefix\") format(\"embedded-opentype\"), url(\"../fonts/Chronicle.woff2\") format(\"woff2\"), url(\"../fonts/Chronicle.woff\") format(\"woff\"), url(\"../fonts/Chronicle.ttf\") format(\"truetype\"), url(\"../fonts/Chronicle.svg\") format(\"svg\"); }\n\n@font-face {\n  font-family: \"Chronicle\";\n  font-style: italic;\n  src: url(\"../fonts/Chronicle-Italic.eot\") format(\"embedded-opentype\");\n  src: url(\"../fonts/Chronicle-Italic.eot#iefix\") format(\"embedded-opentype\"), url(\"../fonts/Chronicle-Italic.woff2\") format(\"woff2\"), url(\"../fonts/Chronicle-Italic.woff\") format(\"woff\"), url(\"../fonts/Chronicle-Italic.ttf\") format(\"truetype\"), url(\"../fonts/Chronicle-Italic.svg\") format(\"svg\"); }\n\n@font-face {\n  font-weight: normal;\n  font-style: normal;\n  font-family: 'icomoon';\n  src: url(\"../fonts/icomoon.eot\") format(\"embedded-opentype\");\n  src: url(\"../fonts/icomoon.eot#iefix\") format(\"embedded-opentype\"), url(\"../fonts/icomoon.ttf\") format(\"truetype\"), url(\"../fonts/icomoon.woff\") format(\"woff\"), url(\"../fonts/icomoon.svg#icomoon\") format(\"svg\"); }\n\n[class^=\"icon-\"], [class*=\" icon-\"] {\n  /* use !important to prevent issues with browser extensions that change fonts */\n  font-family: 'icomoon' !important;\n  speak: none;\n  font-style: normal;\n  font-weight: normal;\n  font-variant: normal;\n  text-transform: none;\n  line-height: 1;\n  /* Better Font Rendering =========== */\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale; }\n\n.icon-horse:before {\n  content: \"\\e908\"; }\n\n.icon-arrow_getintouch:before {\n  content: \"\\e903\"; }\n\n.icon-arrowdown:before {\n  content: \"\\e900\"; }\n\n.icon-full-logo:before {\n  content: \"\\e901\"; }\n\n.icon-small-logo:before {\n  content: \"\\e902\"; }\n\n.icon-HL_Logo_3_mobile:before {\n  content: \"\\e911\"; }\n\n.icon-map:before {\n  content: \"\\e904\"; }\n\n.icon-photo:before {\n  content: \"\\e905\"; }\n\n.icon-mail:before {\n  content: \"\\e906\"; }\n\n.icon-phone:before {\n  content: \"\\e907\"; }\n\n.icon-map-bubble:before {\n  content: \"\\e909\"; }\n\n.icon-map-cafe:before {\n  content: \"\\e90a\"; }\n\n.icon-map-attraction:before {\n  content: \"\\e90b\"; }\n\n.icon-map-bar:before {\n  content: \"\\e90c\"; }\n\n.icon-map-farm:before {\n  content: \"\\e90d\"; }\n\n.icon-map-park:before {\n  content: \"\\e90e\"; }\n\n.icon-map-shopping:before {\n  content: \"\\e90f\"; }\n\n.icon-map-trail:before {\n  content: \"\\e910\"; }\n\n/* http://meyerweb.com/eric/tools/css/reset/ \n   v2.0 | 20110126\n   License: none (public domain)\n*/\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed,\nfigure, figcaption, footer, header, hgroup,\nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font-size: 100%;\n  font: inherit;\n  vertical-align: baseline; }\n\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure,\nfooter, header, hgroup, menu, nav, section {\n  display: block; }\n\nbody {\n  line-height: 1; }\n\nol, ul {\n  list-style: none; }\n\nblockquote, q {\n  quotes: none; }\n\nblockquote:before, blockquote:after,\nq:before, q:after {\n  content: '';\n  content: none; }\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0; }\n\ninput[type=\"button\"],\ninput[type=\"submit\"],\ninput[type=\"reset\"],\ninput[type=\"file\"]::-webkit-file-upload-button,\nbutton {\n  outline: 0;\n  border: 0;\n  background: none;\n  padding: 0;\n  color: inherit;\n  cursor: pointer; }\n\n.header {\n  z-index: 100;\n  background: #fff; }\n  .header--main {\n    position: fixed;\n    top: 0;\n    width: 100%;\n    height: 70px;\n    border-bottom: 4px solid #00534d; }\n  .header__nav {\n    font-family: \"Verlag\";\n    font-weight: bold;\n    font-size: 12px;\n    line-height: 66px; }\n    .header__nav--left, .header__nav--right {\n      position: absolute;\n      top: 0; }\n    .header__nav--center {\n      margin: 0 auto;\n      text-align: center; }\n    .header__nav--left {\n      left: 0;\n      padding-left: 20px;\n      width: 170px;\n      text-align: left; }\n    .header__nav--right {\n      right: 0;\n      padding-right: 20px;\n      width: 120px;\n      text-align: right; }\n\n.nav__list--horizontal .nav__li {\n  display: inline-block; }\n\n.nav__li {\n  text-transform: uppercase;\n  padding: 0 15px;\n  position: relative; }\n  .nav__li:after {\n    background: #00534d;\n    content: \"\";\n    display: block;\n    height: 10px;\n    position: absolute;\n    right: 0;\n    top: 28px;\n    width: 2px; }\n  .nav__li:first-child {\n    padding-left: 0; }\n  .nav__li:last-child {\n    padding-right: 0; }\n    .nav__li:last-child:after {\n      content: none; }\n\n.nav__link {\n  line-height: inherit;\n  margin: auto; }\n\n.nav__icon {\n  font-size: 30px;\n  vertical-align: middle;\n  display: inline-block; }\n  .nav__icon--logo {\n    color: #00534d; }\n  .nav__icon--photo {\n    margin-left: 18px; }\n\n@media (max-width: 1100px) {\n  .header {\n    z-index: 100; }\n  .hamburger {\n    background: #fff;\n    position: absolute;\n    width: 65px;\n    height: 60px;\n    cursor: pointer;\n    padding: 20px;\n    z-index: 515; }\n    .hamburger__inner {\n      display: block;\n      top: 50%; }\n      .hamburger__inner, .hamburger__inner::before, .hamburger__inner::after {\n        width: 25px;\n        height: 2px;\n        background-color: #666;\n        border-radius: 0px;\n        position: absolute;\n        transition-property: transform;\n        transition-duration: 0.15s;\n        transition-timing-function: ease; }\n      .hamburger__inner::before, .hamburger__inner::after {\n        content: \"\";\n        display: block; }\n      .hamburger__inner::before {\n        top: -9px;\n        transition: top 0.1s 0.14s ease, opacity 0.1s ease; }\n      .hamburger__inner::after {\n        bottom: -9px;\n        transition: bottom 0.1s 0.14s ease, transform 0.1s cubic-bezier(0.55, 0.055, 0.675, 0.19); }\n  .mobile-nav {\n    background: #fff;\n    transition: left .3s ease-in-out;\n    position: fixed;\n    left: -220px;\n    width: 220px;\n    z-index: 510;\n    height: 100%;\n    padding: 65px 40px 0;\n    text-align: left;\n    overflow: auto; }\n    .mobile-nav .nav__li {\n      padding: 0;\n      width: 100%; }\n    .mobile-nav .nav__list--secondary {\n      margin-top: 20px;\n      border-top: 1px solid #dedede;\n      padding-top: 20px; }\n  .header {\n    height: 64px; }\n    .header__nav {\n      line-height: 60px; }\n    .header__underlay {\n      background: #f4f1ee;\n      position: fixed;\n      opacity: 0;\n      height: 100%;\n      width: 100%;\n      top: 0;\n      left: 0;\n      visibility: hidden;\n      transition: opacity .3s, visibility .3s 0s;\n      pointer-events: none;\n      z-index: 500; }\n    .header__nav--logo {\n      position: absolute;\n      left: 50%;\n      margin-left: -85px;\n      padding: 0;\n      text-align: center; }\n    .header.-mobile-nav-visible .header__underlay {\n      opacity: .5;\n      visibility: visible;\n      pointer-events: all; }\n    .header.-mobile-nav-visible .mobile-nav {\n      left: 0; }\n    .header.-mobile-nav-visible .hamburger__inner {\n      transform: rotate(45deg);\n      transition-delay: 0.14s;\n      transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); }\n      .header.-mobile-nav-visible .hamburger__inner:before {\n        top: 0;\n        opacity: 0;\n        transition: top 0.1s ease, opacity 0.1s 0.14s ease; }\n      .header.-mobile-nav-visible .hamburger__inner:after {\n        bottom: 0;\n        transform: rotate(-90deg);\n        transition: bottom 0.1s ease, transform 0.1s 0.14s cubic-bezier(0.215, 0.61, 0.355, 1); }\n  .nav__li:after {\n    content: none; } }\n\n/* GET IN TOUCH */\n.contact {\n  background: #fff;\n  transition: right .3s ease-in-out;\n  border: 4px solid #9faeb6;\n  color: #00534d;\n  padding: 25px;\n  position: fixed;\n  right: -300px;\n  text-align: center;\n  top: 150px;\n  width: 300px;\n  z-index: 90; }\n  .contact.-is-visible {\n    right: 0; }\n  .contact__button {\n    background: #9faeb6;\n    color: #fff;\n    font: bold 12px \"Verlag\";\n    height: 40px;\n    left: -164px;\n    line-height: 12px;\n    padding: 14px;\n    position: absolute;\n    text-transform: uppercase;\n    top: -4px;\n    transform-origin: top right;\n    transform: rotate(-90deg);\n    width: 120px; }\n  .contact__h3 {\n    font: bold 13px \"Verlag\";\n    letter-spacing: .2em;\n    text-transform: uppercase;\n    margin: 15px auto; }\n  .contact__p {\n    font-size: 13px;\n    line-height: 20px;\n    margin: 15px auto; }\n  .contact__cta {\n    color: #666;\n    font: italic 15px \"Chronicle\";\n    margin: 20px auto 10px; }\n  .contact__link, .contact__icon {\n    display: block; }\n  .contact__icon {\n    color: #00534d;\n    font-size: 12px; }\n  .contact__link {\n    margin-top: 16px; }\n  @media (max-width: 600px) {\n    .contact {\n      transition: top .3s ease-in-out;\n      position: fixed;\n      width: 100%;\n      right: auto;\n      left: 0;\n      top: -200px; }\n      .contact.-is-visible {\n        top: 100px; }\n      .contact__button {\n        position: fixed;\n        width: 100%;\n        left: 0;\n        transform: none;\n        top: 64px; }\n        .contact__button__arrow {\n          display: inline-block;\n          line-height: 12px;\n          font-size: 8px;\n          margin-left: 8px; }\n          .contact.-is-visible .contact__button__arrow {\n            transform: rotate(180deg) translateY(1px); } }\n\n.home__block {\n  display: block;\n  width: 100%; }\n\n.video-wrapper {\n  position: relative; }\n\n.video {\n  width: 100%;\n  display: block; }\n  .video__title {\n    transition: opacity 2s ease-in-out;\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    margin-left: -280px;\n    margin-top: -67px;\n    width: 560px;\n    height: 134px;\n    color: #fff;\n    text-align: center;\n    opacity: 0; }\n    .video__title.-is-visible {\n      opacity: 1; }\n  .video__h3 {\n    font: 30px \"Chronicle\";\n    font-style: italic;\n    margin-bottom: 40px; }\n\n.main-title {\n  font: 60px \"Verlag\";\n  font-weight: bold;\n  letter-spacing: 0.2em;\n  color: #fff;\n  text-transform: uppercase;\n  width: 560px;\n  text-align: center; }\n  .main-title__span {\n    font-family: \"Chronicle\";\n    font-weight: normal;\n    font-style: italic;\n    text-transform: none;\n    letter-spacing: 0.1em; }\n\n.home__block img {\n  display: block;\n  width: 100%; }\n\n* {\n  box-sizing: border-box;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale; }\n\nbody {\n  font-size: 18px;\n  font-family: \"Chronicle\"; }\n\na {\n  color: #666;\n  text-decoration: none; }\n  a:hover {\n    cursor: pointer;\n    color: #000; }\n\n.content-area {\n  margin-top: 70px;\n  position: relative;\n  z-index: 50; }\n  @media screen and (max-width: 1100px) {\n    .content-area {\n      margin-top: 64px; } }\n\n@media screen and (max-width: 1100px) {\n  .-min-size-tablet {\n    display: none; } }\n\n@media screen and (min-width: 1101px) {\n  .-max-size-tablet {\n    display: none; } }\n\n@media screen and (max-width: 600px) {\n  .-min-size-mobile {\n    display: none; } }\n\n@media screen and (min-width: 601px) {\n  .-max-size-mobile {\n    display: none; } }\n","/* http://meyerweb.com/eric/tools/css/reset/ \n   v2.0 | 20110126\n   License: none (public domain)\n*/\n\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n\ninput[type=\"button\"],\ninput[type=\"submit\"],\ninput[type=\"reset\"],\ninput[type=\"file\"]::-webkit-file-upload-button,\nbutton {\n  outline: 0;\n  border: 0;\n  background: none;\n  padding: 0;\n  color: inherit;\n  cursor: pointer;\n}",".header {\n  z-index: $headerZ;\n  background: $white;\n  &--main {\n    position: fixed;\n    top: 0;\n    width: 100%;\n    height: 70px;\n    border-bottom: 4px solid $green;\n  }\n  \n  &__nav {\n    font-family: $verlag;\n    font-weight: bold;\n    font-size: 12px;\n    line-height: 66px;\n    \n    &--left,\n    &--right {\n      position: absolute;\n      top: 0;\n    }\n    \n    &--center {\n      margin: 0 auto;\n      text-align: center;\n    }\n    \n    &--left {\n      left: 0;\n      padding-left: 20px;\n      width: 170px;\n      text-align: left;\n    }\n    &--right {\n      right: 0;\n      padding-right: 20px;\n      width: 120px;\n      text-align: right;\n    }\n  }\n}\n\n\n.nav {\n  &__list {\n    &--horizontal {\n      .nav__li {\n        display: inline-block;\n      }\n    }\n  }\n  \n  &__li {\n    text-transform: uppercase;\n    padding: 0 15px;\n    position: relative;\n\n    &:after {\n      background: $green;\n      content: \"\";\n      display: block;\n      height: 10px;\n      position: absolute;\n      right: 0;\n      top: 28px;\n      width: 2px;\n    }\n    \n    &:first-child {\n      padding-left: 0;\n    }\n    \n    &:last-child {\n      padding-right: 0;\n      &:after {\n        content: none;\n      }\n    }\n  }\n  \n  &__link {\n    line-height: inherit;\n    margin: auto;\n  }\n  \n  &__icon {\n    font-size: 30px;\n    vertical-align: middle;\n    display: inline-block;\n    \n    &--logo {\n      color: $green;\n    }\n    \n    &--photo {\n      margin-left: 18px;\n    }\n  }\n}\n\n@media (max-width: $tabletLandscape) {\n  .header {\n    z-index: $headerZ;\n  }\n  \n  .hamburger { // Animation styles taken from https://github.com/jonsuh/hamburgers under MIT License\n    background: $white;\n    position: absolute;\n    width: 65px;\n    height: 60px;\n    cursor: pointer;\n    padding: 20px;\n    z-index: $overlayZ + 15;\n    \n    &__inner {\n      display: block;\n      top: 50%;\n\n      &,\n      &::before,\n      &::after {\n        width: 25px;\n        height: 2px;\n        background-color: $gray;\n        border-radius: 0px;\n        position: absolute;\n        transition-property: transform;\n        transition-duration: 0.15s;\n        transition-timing-function: ease;\n      }\n\n      &::before,\n      &::after {\n        content: \"\";\n        display: block;\n      }\n\n      &::before {\n        top: -9px;\n        transition: top 0.1s 0.14s ease,\n                    opacity 0.1s ease;\n      }\n\n      &::after {\n        bottom: -9px;\n        transition: bottom 0.1s 0.14s ease,\n                    transform 0.1s cubic-bezier(0.55, 0.055, 0.675, 0.19);\n      }\n    }\n  }\n  .mobile-nav {\n    background: $white;\n    transition: left .3s ease-in-out;\n    position: fixed;\n    left: -220px;\n    width: 220px;\n    z-index: $overlayZ + 10;\n    height: 100%;\n    padding: 65px 40px 0;\n    text-align: left;\n    overflow: auto;\n    \n    .nav {\n      &__li {\n        padding: 0;\n        width: 100%;\n      }\n      \n      &__list {\n        &--secondary {\n          margin-top: 20px;\n          border-top: 1px solid $borderGray;\n          padding-top: 20px;\n        }\n      }\n    }\n  }\n  \n  .header {\n    height: 64px;\n    \n    &__nav {\n      line-height: 60px;\n    }\n    \n    &__underlay {\n      background: $overlayBg;\n      position: fixed;\n      opacity: 0;\n      height: 100%;\n      width: 100%;\n      top: 0;\n      left: 0;\n      visibility: hidden;\n      transition: opacity .3s, visibility .3s 0s;\n      pointer-events: none;\n      z-index: $overlayZ;\n    }\n    \n    &__nav--logo {\n      position: absolute;\n      left: 50%;\n      margin-left: -85px;\n      padding: 0;\n      text-align: center;\n    }\n    \n    &.-mobile-nav-visible {\n      .header__underlay {\n        opacity: .5;\n        visibility: visible;\n        pointer-events: all;\n      }\n      \n      .mobile-nav {\n        left: 0;\n      }\n      \n      .hamburger {\n        &__inner {\n          transform: rotate(45deg);\n          transition-delay: 0.14s;\n          transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);\n\n          &:before {\n            top: 0;\n            opacity: 0;\n            transition: top 0.1s ease,\n                        opacity 0.1s 0.14s ease;\n          }\n\n          &:after {\n            bottom: 0;\n            transform: rotate(-90deg);\n            transition: bottom 0.1s ease,\n                        transform 0.1s 0.14s cubic-bezier(0.215, 0.61, 0.355, 1);\n          }\n        }\n      }\n    }\n  }\n  \n  .nav__li:after {\n    content: none;\n  }\n}\n\n/* GET IN TOUCH */\n.contact {\n  background: $white;\n  transition: right .3s ease-in-out;\n  border: 4px solid $blue;\n  color: $green;\n  padding: 25px;\n  position: fixed;\n  right: -300px;\n  text-align: center;\n  top: 150px;\n  width: 300px;\n  z-index: $headerZ - 10;\n  \n  &.-is-visible {\n    right: 0;\n  }\n  \n  &__button {\n    background: $blue;\n    color: $white;\n    font: bold 12px $verlag;\n    height: 40px;\n    left: -164px;\n    line-height: 12px;\n    padding: 14px;\n    position: absolute;\n    text-transform: uppercase;\n    top: -4px;\n    transform-origin: top right;\n    transform: rotate(-90deg);\n    width: 120px;\n  }\n  \n  &__h3 {\n    font: bold 13px $verlag;\n    letter-spacing: .2em;\n    text-transform: uppercase;\n    margin: 15px auto;\n  }\n  \n  &__p {\n    font-size: 13px;\n    line-height: 20px;\n    margin: 15px auto;\n  }\n  \n  &__cta {\n    color: $gray;\n    font: italic 15px $chronicle;\n    margin: 20px auto 10px;\n  }\n  \n  &__link,\n  &__icon {\n    display: block;\n  }\n  \n  &__icon {\n    color: $green;\n    font-size: 12px;\n  }\n  \n  &__link {\n    margin-top: 16px;\n  }\n  \n  @media (max-width: $mobileLandscape) {\n    transition: top .3s ease-in-out;\n    position: fixed;\n    width: 100%;\n    right: auto;\n    left: 0;\n    top: -200px;\n    \n    &.-is-visible {\n      top: 100px;\n    }\n    \n    &__button {\n      position: fixed;\n      width: 100%;\n      left: 0;\n      transform: none;\n      top: 64px;\n      \n      &__arrow {\n        display: inline-block;\n        line-height: 12px;\n        font-size: 8px;\n        margin-left: 8px;\n        \n        @at-root {\n          .contact.-is-visible & {\n            transform: rotate(180deg) translateY(1px);\n          }\n        }\n      }\n    }\n  }\n}",".home__block {\n  display: block;\n  width: 100%;\n}\n\n.video-wrapper {\n  position: relative;\n}\n\n.video {\n  width: 100%;\n  display: block;\n  \n  &__title {\n    transition: opacity 2s ease-in-out;\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    margin-left: -280px;\n    margin-top: -67px;\n    width: 560px;\n    height: 134px;\n    color: $white;\n    text-align: center;\n    opacity: 0;\n    \n    &.-is-visible {\n      opacity: 1;\n    }\n    \n  }\n  \n  &__h3 {\n    font: 30px $chronicle;\n    font-style: italic;\n    margin-bottom: 40px;\n  }\n}\n\n.main-title {\n  font: 60px $verlag;\n  font-weight: bold;\n  letter-spacing: 0.2em;\n  color: $white;\n  text-transform: uppercase;\n  width: 560px;\n  text-align: center;\n  \n  &__span {\n    font-family: $chronicle;\n    font-weight: normal;\n    font-style: italic;\n    text-transform: none;\n    letter-spacing: 0.1em;\n  }\n}\n\n.home__block img {\n  display: block;\n  width: 100%;\n}","@import '_variables';\n@import '_fonts';\n@import 'reset';\n@import 'header';\n@import 'home';\n\n* {\n  box-sizing: border-box;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\nbody {\n  font-size: 18px;\n  font-family: $chronicle;\n}\n\na {\n  color: $gray;\n  text-decoration: none;\n  \n  &:hover {\n    cursor: pointer;\n    color: $black;\n  }\n}\n\n.content-area {\n  margin-top: 70px;\n  position: relative;\n  z-index: $headerZ - 50;\n  \n  @media screen and (max-width: $tabletLandscape) {\n    margin-top: 64px;\n  }\n}\n\n.-min-size-tablet {\n  @media screen and (max-width: $tabletLandscape) {\n    display: none;\n  }\n}\n\n.-max-size-tablet {\n  @media screen and (min-width: $tabletLandscape + 1) {\n    display: none;\n  }\n}\n\n.-min-size-mobile {\n  @media screen and (max-width: $mobileLandscape) {\n    display: none;\n  }\n}\n\n.-max-size-mobile {\n  @media screen and (min-width: $mobileLandscape + 1) {\n    display: none;\n  }\n}"],"sourceRoot":"webpack://"}]);

	// exports


/***/ },
/* 78 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 79 */
/***/ function(module, exports) {

	module.exports = "data:application/octet-stream;base64,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"

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "Verlag-Black-f822f8a3ae9fd86baa74a6b3b0987bc7.eot";

/***/ },
/* 81 */
/***/ function(module, exports) {

	module.exports = "data:application/octet-stream;base64,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"

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "Verlag-Black-a7b7ce63fb46ba49392d165ae0950459.woff";

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "Verlag-Black-da91026d05c22db0dc150d37b9dfa18a.ttf";

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "Verlag-Black-2fd0e872f91e357a18419e40e2646ea3.svg";

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "Chronicle-92b535eabff71829b33401e7d515711f.eot";

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "Chronicle-33690f86a2612d6cff533d1b6d97fdc1.woff2";

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "Chronicle-8687e71dace516f537dc1ea8e67f8b61.woff";

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "Chronicle-1c79a012f9d30283230b1dc24632289a.ttf";

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "Chronicle-a13e29e436df836516125ef252226218.svg";

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "Chronicle-Italic-58155f6c3a964ba856867c57f93be26d.eot";

/***/ },
/* 91 */
/***/ function(module, exports) {

	module.exports = "data:application/octet-stream;base64,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"

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "Chronicle-Italic-5d180056a95cc07b1932832b5cdb18de.woff";

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "Chronicle-Italic-c0aeca312a8bddf4bf024334ea1f37b6.ttf";

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "Chronicle-Italic-ddb4de67071a4cfaf4b0c8013689d301.svg";

/***/ },
/* 95 */
/***/ function(module, exports) {

	module.exports = "data:application/vnd.ms-fontobject;base64,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"

/***/ },
/* 96 */
/***/ function(module, exports) {

	module.exports = "data:application/x-font-ttf;base64,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"

/***/ },
/* 97 */
/***/ function(module, exports) {

	module.exports = "data:application/font-woff;base64,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"

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "icomoon-3d03b9653860c34dabadd2ab00a16979.svg";

/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * jQuery JavaScript Library v2.2.2
	 * http://jquery.com/
	 *
	 * Includes Sizzle.js
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2016-03-17T17:51Z
	 */

	(function( global, factory ) {

		if ( typeof module === "object" && typeof module.exports === "object" ) {
			// For CommonJS and CommonJS-like environments where a proper `window`
			// is present, execute the factory and get jQuery.
			// For environments that do not have a `window` with a `document`
			// (such as Node.js), expose a factory as module.exports.
			// This accentuates the need for the creation of a real `window`.
			// e.g. var jQuery = require("jquery")(window);
			// See ticket #14549 for more info.
			module.exports = global.document ?
				factory( global, true ) :
				function( w ) {
					if ( !w.document ) {
						throw new Error( "jQuery requires a window with a document" );
					}
					return factory( w );
				};
		} else {
			factory( global );
		}

	// Pass this if window is not defined yet
	}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

	// Support: Firefox 18+
	// Can't be in strict mode, several libs including ASP.NET trace
	// the stack via arguments.caller.callee and Firefox dies if
	// you try to trace through "use strict" call chains. (#13335)
	//"use strict";
	var arr = [];

	var document = window.document;

	var slice = arr.slice;

	var concat = arr.concat;

	var push = arr.push;

	var indexOf = arr.indexOf;

	var class2type = {};

	var toString = class2type.toString;

	var hasOwn = class2type.hasOwnProperty;

	var support = {};



	var
		version = "2.2.2",

		// Define a local copy of jQuery
		jQuery = function( selector, context ) {

			// The jQuery object is actually just the init constructor 'enhanced'
			// Need init if jQuery is called (just allow error to be thrown if not included)
			return new jQuery.fn.init( selector, context );
		},

		// Support: Android<4.1
		// Make sure we trim BOM and NBSP
		rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

		// Matches dashed string for camelizing
		rmsPrefix = /^-ms-/,
		rdashAlpha = /-([\da-z])/gi,

		// Used by jQuery.camelCase as callback to replace()
		fcamelCase = function( all, letter ) {
			return letter.toUpperCase();
		};

	jQuery.fn = jQuery.prototype = {

		// The current version of jQuery being used
		jquery: version,

		constructor: jQuery,

		// Start with an empty selector
		selector: "",

		// The default length of a jQuery object is 0
		length: 0,

		toArray: function() {
			return slice.call( this );
		},

		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function( num ) {
			return num != null ?

				// Return just the one element from the set
				( num < 0 ? this[ num + this.length ] : this[ num ] ) :

				// Return all the elements in a clean array
				slice.call( this );
		},

		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function( elems ) {

			// Build a new jQuery matched element set
			var ret = jQuery.merge( this.constructor(), elems );

			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;
			ret.context = this.context;

			// Return the newly-formed element set
			return ret;
		},

		// Execute a callback for every element in the matched set.
		each: function( callback ) {
			return jQuery.each( this, callback );
		},

		map: function( callback ) {
			return this.pushStack( jQuery.map( this, function( elem, i ) {
				return callback.call( elem, i, elem );
			} ) );
		},

		slice: function() {
			return this.pushStack( slice.apply( this, arguments ) );
		},

		first: function() {
			return this.eq( 0 );
		},

		last: function() {
			return this.eq( -1 );
		},

		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
		},

		end: function() {
			return this.prevObject || this.constructor();
		},

		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: arr.sort,
		splice: arr.splice
	};

	jQuery.extend = jQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[ 0 ] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;

			// Skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
			target = {};
		}

		// Extend jQuery itself if only one argument is passed
		if ( i === length ) {
			target = this;
			i--;
		}

		for ( ; i < length; i++ ) {

			// Only deal with non-null/undefined values
			if ( ( options = arguments[ i ] ) != null ) {

				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
						( copyIsArray = jQuery.isArray( copy ) ) ) ) {

						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && jQuery.isArray( src ) ? src : [];

						} else {
							clone = src && jQuery.isPlainObject( src ) ? src : {};
						}

						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );

					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	jQuery.extend( {

		// Unique for each copy of jQuery on the page
		expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

		// Assume jQuery is ready without the ready module
		isReady: true,

		error: function( msg ) {
			throw new Error( msg );
		},

		noop: function() {},

		isFunction: function( obj ) {
			return jQuery.type( obj ) === "function";
		},

		isArray: Array.isArray,

		isWindow: function( obj ) {
			return obj != null && obj === obj.window;
		},

		isNumeric: function( obj ) {

			// parseFloat NaNs numeric-cast false positives (null|true|false|"")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			// adding 1 corrects loss of precision from parseFloat (#15100)
			var realStringObj = obj && obj.toString();
			return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
		},

		isPlainObject: function( obj ) {
			var key;

			// Not plain objects:
			// - Any object or value whose internal [[Class]] property is not "[object Object]"
			// - DOM nodes
			// - window
			if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
				return false;
			}

			// Not own constructor property must be Object
			if ( obj.constructor &&
					!hasOwn.call( obj, "constructor" ) &&
					!hasOwn.call( obj.constructor.prototype || {}, "isPrototypeOf" ) ) {
				return false;
			}

			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own
			for ( key in obj ) {}

			return key === undefined || hasOwn.call( obj, key );
		},

		isEmptyObject: function( obj ) {
			var name;
			for ( name in obj ) {
				return false;
			}
			return true;
		},

		type: function( obj ) {
			if ( obj == null ) {
				return obj + "";
			}

			// Support: Android<4.0, iOS<6 (functionish RegExp)
			return typeof obj === "object" || typeof obj === "function" ?
				class2type[ toString.call( obj ) ] || "object" :
				typeof obj;
		},

		// Evaluates a script in a global context
		globalEval: function( code ) {
			var script,
				indirect = eval;

			code = jQuery.trim( code );

			if ( code ) {

				// If the code includes a valid, prologue position
				// strict mode pragma, execute code by injecting a
				// script tag into the document.
				if ( code.indexOf( "use strict" ) === 1 ) {
					script = document.createElement( "script" );
					script.text = code;
					document.head.appendChild( script ).parentNode.removeChild( script );
				} else {

					// Otherwise, avoid the DOM node creation, insertion
					// and removal by using an indirect global eval

					indirect( code );
				}
			}
		},

		// Convert dashed to camelCase; used by the css and data modules
		// Support: IE9-11+
		// Microsoft forgot to hump their vendor prefix (#9572)
		camelCase: function( string ) {
			return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
		},

		nodeName: function( elem, name ) {
			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
		},

		each: function( obj, callback ) {
			var length, i = 0;

			if ( isArrayLike( obj ) ) {
				length = obj.length;
				for ( ; i < length; i++ ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			}

			return obj;
		},

		// Support: Android<4.1
		trim: function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

		// results is for internal usage only
		makeArray: function( arr, results ) {
			var ret = results || [];

			if ( arr != null ) {
				if ( isArrayLike( Object( arr ) ) ) {
					jQuery.merge( ret,
						typeof arr === "string" ?
						[ arr ] : arr
					);
				} else {
					push.call( ret, arr );
				}
			}

			return ret;
		},

		inArray: function( elem, arr, i ) {
			return arr == null ? -1 : indexOf.call( arr, elem, i );
		},

		merge: function( first, second ) {
			var len = +second.length,
				j = 0,
				i = first.length;

			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}

			first.length = i;

			return first;
		},

		grep: function( elems, callback, invert ) {
			var callbackInverse,
				matches = [],
				i = 0,
				length = elems.length,
				callbackExpect = !invert;

			// Go through the array, only saving the items
			// that pass the validator function
			for ( ; i < length; i++ ) {
				callbackInverse = !callback( elems[ i ], i );
				if ( callbackInverse !== callbackExpect ) {
					matches.push( elems[ i ] );
				}
			}

			return matches;
		},

		// arg is for internal usage only
		map: function( elems, callback, arg ) {
			var length, value,
				i = 0,
				ret = [];

			// Go through the array, translating each of the items to their new values
			if ( isArrayLike( elems ) ) {
				length = elems.length;
				for ( ; i < length; i++ ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}

			// Go through every key on the object,
			} else {
				for ( i in elems ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}
			}

			// Flatten any nested arrays
			return concat.apply( [], ret );
		},

		// A global GUID counter for objects
		guid: 1,

		// Bind a function to a context, optionally partially applying any
		// arguments.
		proxy: function( fn, context ) {
			var tmp, args, proxy;

			if ( typeof context === "string" ) {
				tmp = fn[ context ];
				context = fn;
				fn = tmp;
			}

			// Quick check to determine if target is callable, in the spec
			// this throws a TypeError, but we will just return undefined.
			if ( !jQuery.isFunction( fn ) ) {
				return undefined;
			}

			// Simulated bind
			args = slice.call( arguments, 2 );
			proxy = function() {
				return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
			};

			// Set the guid of unique handler to the same of original handler, so it can be removed
			proxy.guid = fn.guid = fn.guid || jQuery.guid++;

			return proxy;
		},

		now: Date.now,

		// jQuery.support is not used in Core but other projects attach their
		// properties to it so it needs to exist.
		support: support
	} );

	// JSHint would error on this code due to the Symbol not being defined in ES5.
	// Defining this global in .jshintrc would create a danger of using the global
	// unguarded in another place, it seems safer to just disable JSHint for these
	// three lines.
	/* jshint ignore: start */
	if ( typeof Symbol === "function" ) {
		jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
	}
	/* jshint ignore: end */

	// Populate the class2type map
	jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );

	function isArrayLike( obj ) {

		// Support: iOS 8.2 (not reproducible in simulator)
		// `in` check used to prevent JIT error (gh-2145)
		// hasOwn isn't used here due to false negatives
		// regarding Nodelist length in IE
		var length = !!obj && "length" in obj && obj.length,
			type = jQuery.type( obj );

		if ( type === "function" || jQuery.isWindow( obj ) ) {
			return false;
		}

		return type === "array" || length === 0 ||
			typeof length === "number" && length > 0 && ( length - 1 ) in obj;
	}
	var Sizzle =
	/*!
	 * Sizzle CSS Selector Engine v2.2.1
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2015-10-17
	 */
	(function( window ) {

	var i,
		support,
		Expr,
		getText,
		isXML,
		tokenize,
		compile,
		select,
		outermostContext,
		sortInput,
		hasDuplicate,

		// Local document vars
		setDocument,
		document,
		docElem,
		documentIsHTML,
		rbuggyQSA,
		rbuggyMatches,
		matches,
		contains,

		// Instance-specific data
		expando = "sizzle" + 1 * new Date(),
		preferredDoc = window.document,
		dirruns = 0,
		done = 0,
		classCache = createCache(),
		tokenCache = createCache(),
		compilerCache = createCache(),
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
			}
			return 0;
		},

		// General-purpose constants
		MAX_NEGATIVE = 1 << 31,

		// Instance methods
		hasOwn = ({}).hasOwnProperty,
		arr = [],
		pop = arr.pop,
		push_native = arr.push,
		push = arr.push,
		slice = arr.slice,
		// Use a stripped-down indexOf as it's faster than native
		// http://jsperf.com/thor-indexof-vs-for/5
		indexOf = function( list, elem ) {
			var i = 0,
				len = list.length;
			for ( ; i < len; i++ ) {
				if ( list[i] === elem ) {
					return i;
				}
			}
			return -1;
		},

		booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

		// Regular expressions

		// http://www.w3.org/TR/css3-selectors/#whitespace
		whitespace = "[\\x20\\t\\r\\n\\f]",

		// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

		// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
			// Operator (capture 2)
			"*([*^$|!~]?=)" + whitespace +
			// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
			"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
			"*\\]",

		pseudos = ":(" + identifier + ")(?:\\((" +
			// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
			// 1. quoted (capture 3; capture 4 or capture 5)
			"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
			// 2. simple (capture 6)
			"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
			// 3. anything else (capture 2)
			".*" +
			")\\)|)",

		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rwhitespace = new RegExp( whitespace + "+", "g" ),
		rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

		rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
		rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

		rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

		rpseudo = new RegExp( pseudos ),
		ridentifier = new RegExp( "^" + identifier + "$" ),

		matchExpr = {
			"ID": new RegExp( "^#(" + identifier + ")" ),
			"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
			"TAG": new RegExp( "^(" + identifier + "|[*])" ),
			"ATTR": new RegExp( "^" + attributes ),
			"PSEUDO": new RegExp( "^" + pseudos ),
			"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
				"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
				"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
			"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
				whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
		},

		rinputs = /^(?:input|select|textarea|button)$/i,
		rheader = /^h\d$/i,

		rnative = /^[^{]+\{\s*\[native \w/,

		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

		rsibling = /[+~]/,
		rescape = /'|\\/g,

		// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
		funescape = function( _, escaped, escapedWhitespace ) {
			var high = "0x" + escaped - 0x10000;
			// NaN means non-codepoint
			// Support: Firefox<24
			// Workaround erroneous numeric interpretation of +"0x"
			return high !== high || escapedWhitespace ?
				escaped :
				high < 0 ?
					// BMP codepoint
					String.fromCharCode( high + 0x10000 ) :
					// Supplemental Plane codepoint (surrogate pair)
					String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
		},

		// Used for iframes
		// See setDocument()
		// Removing the function wrapper causes a "Permission Denied"
		// error in IE
		unloadHandler = function() {
			setDocument();
		};

	// Optimize for push.apply( _, NodeList )
	try {
		push.apply(
			(arr = slice.call( preferredDoc.childNodes )),
			preferredDoc.childNodes
		);
		// Support: Android<4.0
		// Detect silently failing push.apply
		arr[ preferredDoc.childNodes.length ].nodeType;
	} catch ( e ) {
		push = { apply: arr.length ?

			// Leverage slice if possible
			function( target, els ) {
				push_native.apply( target, slice.call(els) );
			} :

			// Support: IE<9
			// Otherwise append directly
			function( target, els ) {
				var j = target.length,
					i = 0;
				// Can't trust NodeList.length
				while ( (target[j++] = els[i++]) ) {}
				target.length = j - 1;
			}
		};
	}

	function Sizzle( selector, context, results, seed ) {
		var m, i, elem, nid, nidselect, match, groups, newSelector,
			newContext = context && context.ownerDocument,

			// nodeType defaults to 9, since context defaults to document
			nodeType = context ? context.nodeType : 9;

		results = results || [];

		// Return early from calls with invalid selector or context
		if ( typeof selector !== "string" || !selector ||
			nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

			return results;
		}

		// Try to shortcut find operations (as opposed to filters) in HTML documents
		if ( !seed ) {

			if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
				setDocument( context );
			}
			context = context || document;

			if ( documentIsHTML ) {

				// If the selector is sufficiently simple, try using a "get*By*" DOM method
				// (excepting DocumentFragment context, where the methods don't exist)
				if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

					// ID selector
					if ( (m = match[1]) ) {

						// Document context
						if ( nodeType === 9 ) {
							if ( (elem = context.getElementById( m )) ) {

								// Support: IE, Opera, Webkit
								// TODO: identify versions
								// getElementById can match elements by name instead of ID
								if ( elem.id === m ) {
									results.push( elem );
									return results;
								}
							} else {
								return results;
							}

						// Element context
						} else {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( newContext && (elem = newContext.getElementById( m )) &&
								contains( context, elem ) &&
								elem.id === m ) {

								results.push( elem );
								return results;
							}
						}

					// Type selector
					} else if ( match[2] ) {
						push.apply( results, context.getElementsByTagName( selector ) );
						return results;

					// Class selector
					} else if ( (m = match[3]) && support.getElementsByClassName &&
						context.getElementsByClassName ) {

						push.apply( results, context.getElementsByClassName( m ) );
						return results;
					}
				}

				// Take advantage of querySelectorAll
				if ( support.qsa &&
					!compilerCache[ selector + " " ] &&
					(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

					if ( nodeType !== 1 ) {
						newContext = context;
						newSelector = selector;

					// qSA looks outside Element context, which is not what we want
					// Thanks to Andrew Dupont for this workaround technique
					// Support: IE <=8
					// Exclude object elements
					} else if ( context.nodeName.toLowerCase() !== "object" ) {

						// Capture the context ID, setting it first if necessary
						if ( (nid = context.getAttribute( "id" )) ) {
							nid = nid.replace( rescape, "\\$&" );
						} else {
							context.setAttribute( "id", (nid = expando) );
						}

						// Prefix every selector in the list
						groups = tokenize( selector );
						i = groups.length;
						nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
						while ( i-- ) {
							groups[i] = nidselect + " " + toSelector( groups[i] );
						}
						newSelector = groups.join( "," );

						// Expand context for sibling selectors
						newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
							context;
					}

					if ( newSelector ) {
						try {
							push.apply( results,
								newContext.querySelectorAll( newSelector )
							);
							return results;
						} catch ( qsaError ) {
						} finally {
							if ( nid === expando ) {
								context.removeAttribute( "id" );
							}
						}
					}
				}
			}
		}

		// All others
		return select( selector.replace( rtrim, "$1" ), context, results, seed );
	}

	/**
	 * Create key-value caches of limited size
	 * @returns {function(string, object)} Returns the Object data after storing it on itself with
	 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	 *	deleting the oldest entry
	 */
	function createCache() {
		var keys = [];

		function cache( key, value ) {
			// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
			if ( keys.push( key + " " ) > Expr.cacheLength ) {
				// Only keep the most recent entries
				delete cache[ keys.shift() ];
			}
			return (cache[ key + " " ] = value);
		}
		return cache;
	}

	/**
	 * Mark a function for special use by Sizzle
	 * @param {Function} fn The function to mark
	 */
	function markFunction( fn ) {
		fn[ expando ] = true;
		return fn;
	}

	/**
	 * Support testing using an element
	 * @param {Function} fn Passed the created div and expects a boolean result
	 */
	function assert( fn ) {
		var div = document.createElement("div");

		try {
			return !!fn( div );
		} catch (e) {
			return false;
		} finally {
			// Remove from its parent by default
			if ( div.parentNode ) {
				div.parentNode.removeChild( div );
			}
			// release memory in IE
			div = null;
		}
	}

	/**
	 * Adds the same handler for all of the specified attrs
	 * @param {String} attrs Pipe-separated list of attributes
	 * @param {Function} handler The method that will be applied
	 */
	function addHandle( attrs, handler ) {
		var arr = attrs.split("|"),
			i = arr.length;

		while ( i-- ) {
			Expr.attrHandle[ arr[i] ] = handler;
		}
	}

	/**
	 * Checks document order of two siblings
	 * @param {Element} a
	 * @param {Element} b
	 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
	 */
	function siblingCheck( a, b ) {
		var cur = b && a,
			diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
				( ~b.sourceIndex || MAX_NEGATIVE ) -
				( ~a.sourceIndex || MAX_NEGATIVE );

		// Use IE sourceIndex if available on both nodes
		if ( diff ) {
			return diff;
		}

		// Check if b follows a
		if ( cur ) {
			while ( (cur = cur.nextSibling) ) {
				if ( cur === b ) {
					return -1;
				}
			}
		}

		return a ? 1 : -1;
	}

	/**
	 * Returns a function to use in pseudos for input types
	 * @param {String} type
	 */
	function createInputPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for buttons
	 * @param {String} type
	 */
	function createButtonPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for positionals
	 * @param {Function} fn
	 */
	function createPositionalPseudo( fn ) {
		return markFunction(function( argument ) {
			argument = +argument;
			return markFunction(function( seed, matches ) {
				var j,
					matchIndexes = fn( [], seed.length, argument ),
					i = matchIndexes.length;

				// Match elements found at the specified indexes
				while ( i-- ) {
					if ( seed[ (j = matchIndexes[i]) ] ) {
						seed[j] = !(matches[j] = seed[j]);
					}
				}
			});
		});
	}

	/**
	 * Checks a node for validity as a Sizzle context
	 * @param {Element|Object=} context
	 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
	 */
	function testContext( context ) {
		return context && typeof context.getElementsByTagName !== "undefined" && context;
	}

	// Expose support vars for convenience
	support = Sizzle.support = {};

	/**
	 * Detects XML nodes
	 * @param {Element|Object} elem An element or a document
	 * @returns {Boolean} True iff elem is a non-HTML XML node
	 */
	isXML = Sizzle.isXML = function( elem ) {
		// documentElement is verified for cases where it doesn't yet exist
		// (such as loading iframes in IE - #4833)
		var documentElement = elem && (elem.ownerDocument || elem).documentElement;
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};

	/**
	 * Sets document-related variables once based on the current document
	 * @param {Element|Object} [doc] An element or document object to use to set the document
	 * @returns {Object} Returns the current document
	 */
	setDocument = Sizzle.setDocument = function( node ) {
		var hasCompare, parent,
			doc = node ? node.ownerDocument || node : preferredDoc;

		// Return early if doc is invalid or already selected
		if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
			return document;
		}

		// Update global variables
		document = doc;
		docElem = document.documentElement;
		documentIsHTML = !isXML( document );

		// Support: IE 9-11, Edge
		// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
		if ( (parent = document.defaultView) && parent.top !== parent ) {
			// Support: IE 11
			if ( parent.addEventListener ) {
				parent.addEventListener( "unload", unloadHandler, false );

			// Support: IE 9 - 10 only
			} else if ( parent.attachEvent ) {
				parent.attachEvent( "onunload", unloadHandler );
			}
		}

		/* Attributes
		---------------------------------------------------------------------- */

		// Support: IE<8
		// Verify that getAttribute really returns attributes and not properties
		// (excepting IE8 booleans)
		support.attributes = assert(function( div ) {
			div.className = "i";
			return !div.getAttribute("className");
		});

		/* getElement(s)By*
		---------------------------------------------------------------------- */

		// Check if getElementsByTagName("*") returns only elements
		support.getElementsByTagName = assert(function( div ) {
			div.appendChild( document.createComment("") );
			return !div.getElementsByTagName("*").length;
		});

		// Support: IE<9
		support.getElementsByClassName = rnative.test( document.getElementsByClassName );

		// Support: IE<10
		// Check if getElementById returns elements by name
		// The broken getElementById methods don't pick up programatically-set names,
		// so use a roundabout getElementsByName test
		support.getById = assert(function( div ) {
			docElem.appendChild( div ).id = expando;
			return !document.getElementsByName || !document.getElementsByName( expando ).length;
		});

		// ID find and filter
		if ( support.getById ) {
			Expr.find["ID"] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var m = context.getElementById( id );
					return m ? [ m ] : [];
				}
			};
			Expr.filter["ID"] = function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					return elem.getAttribute("id") === attrId;
				};
			};
		} else {
			// Support: IE6/7
			// getElementById is not reliable as a find shortcut
			delete Expr.find["ID"];

			Expr.filter["ID"] =  function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== "undefined" &&
						elem.getAttributeNode("id");
					return node && node.value === attrId;
				};
			};
		}

		// Tag
		Expr.find["TAG"] = support.getElementsByTagName ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== "undefined" ) {
					return context.getElementsByTagName( tag );

				// DocumentFragment nodes don't have gEBTN
				} else if ( support.qsa ) {
					return context.querySelectorAll( tag );
				}
			} :

			function( tag, context ) {
				var elem,
					tmp = [],
					i = 0,
					// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
					results = context.getElementsByTagName( tag );

				// Filter out possible comments
				if ( tag === "*" ) {
					while ( (elem = results[i++]) ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}

					return tmp;
				}
				return results;
			};

		// Class
		Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
			if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
				return context.getElementsByClassName( className );
			}
		};

		/* QSA/matchesSelector
		---------------------------------------------------------------------- */

		// QSA and matchesSelector support

		// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
		rbuggyMatches = [];

		// qSa(:focus) reports false when true (Chrome 21)
		// We allow this because of a bug in IE8/9 that throws an error
		// whenever `document.activeElement` is accessed on an iframe
		// So, we allow :focus to pass through QSA all the time to avoid the IE error
		// See http://bugs.jquery.com/ticket/13378
		rbuggyQSA = [];

		if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
			// Build QSA regex
			// Regex strategy adopted from Diego Perini
			assert(function( div ) {
				// Select is set to empty string on purpose
				// This is to test IE's treatment of not explicitly
				// setting a boolean content attribute,
				// since its presence should be enough
				// http://bugs.jquery.com/ticket/12359
				docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
					"<select id='" + expando + "-\r\\' msallowcapture=''>" +
					"<option selected=''></option></select>";

				// Support: IE8, Opera 11-12.16
				// Nothing should be selected when empty strings follow ^= or $= or *=
				// The test attribute must be unknown in Opera but "safe" for WinRT
				// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
				if ( div.querySelectorAll("[msallowcapture^='']").length ) {
					rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
				}

				// Support: IE8
				// Boolean attributes and "value" are not treated correctly
				if ( !div.querySelectorAll("[selected]").length ) {
					rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
				}

				// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
				if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
					rbuggyQSA.push("~=");
				}

				// Webkit/Opera - :checked should return selected option elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				// IE8 throws error here and will not see later tests
				if ( !div.querySelectorAll(":checked").length ) {
					rbuggyQSA.push(":checked");
				}

				// Support: Safari 8+, iOS 8+
				// https://bugs.webkit.org/show_bug.cgi?id=136851
				// In-page `selector#id sibing-combinator selector` fails
				if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
					rbuggyQSA.push(".#.+[+~]");
				}
			});

			assert(function( div ) {
				// Support: Windows 8 Native Apps
				// The type and name attributes are restricted during .innerHTML assignment
				var input = document.createElement("input");
				input.setAttribute( "type", "hidden" );
				div.appendChild( input ).setAttribute( "name", "D" );

				// Support: IE8
				// Enforce case-sensitivity of name attribute
				if ( div.querySelectorAll("[name=d]").length ) {
					rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
				}

				// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
				// IE8 throws error here and will not see later tests
				if ( !div.querySelectorAll(":enabled").length ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}

				// Opera 10-11 does not throw on post-comma invalid pseudos
				div.querySelectorAll("*,:x");
				rbuggyQSA.push(",.*:");
			});
		}

		if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
			docElem.webkitMatchesSelector ||
			docElem.mozMatchesSelector ||
			docElem.oMatchesSelector ||
			docElem.msMatchesSelector) )) ) {

			assert(function( div ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				support.disconnectedMatch = matches.call( div, "div" );

				// This should fail with an exception
				// Gecko does not error, returns false instead
				matches.call( div, "[s!='']:x" );
				rbuggyMatches.push( "!=", pseudos );
			});
		}

		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
		rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

		/* Contains
		---------------------------------------------------------------------- */
		hasCompare = rnative.test( docElem.compareDocumentPosition );

		// Element contains another
		// Purposefully self-exclusive
		// As in, an element does not contain itself
		contains = hasCompare || rnative.test( docElem.contains ) ?
			function( a, b ) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
					bup = b && b.parentNode;
				return a === bup || !!( bup && bup.nodeType === 1 && (
					adown.contains ?
						adown.contains( bup ) :
						a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
				));
			} :
			function( a, b ) {
				if ( b ) {
					while ( (b = b.parentNode) ) {
						if ( b === a ) {
							return true;
						}
					}
				}
				return false;
			};

		/* Sorting
		---------------------------------------------------------------------- */

		// Document order sorting
		sortOrder = hasCompare ?
		function( a, b ) {

			// Flag for duplicate removal
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			// Sort on method existence if only one input has compareDocumentPosition
			var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
			if ( compare ) {
				return compare;
			}

			// Calculate position if both inputs belong to the same document
			compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
				a.compareDocumentPosition( b ) :

				// Otherwise we know they are disconnected
				1;

			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

				// Choose the first element that is related to our preferred document
				if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
					return 1;
				}

				// Maintain original order
				return sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
			}

			return compare & 4 ? -1 : 1;
		} :
		function( a, b ) {
			// Exit early if the nodes are identical
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			var cur,
				i = 0,
				aup = a.parentNode,
				bup = b.parentNode,
				ap = [ a ],
				bp = [ b ];

			// Parentless nodes are either documents or disconnected
			if ( !aup || !bup ) {
				return a === document ? -1 :
					b === document ? 1 :
					aup ? -1 :
					bup ? 1 :
					sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;

			// If the nodes are siblings, we can do a quick check
			} else if ( aup === bup ) {
				return siblingCheck( a, b );
			}

			// Otherwise we need full lists of their ancestors for comparison
			cur = a;
			while ( (cur = cur.parentNode) ) {
				ap.unshift( cur );
			}
			cur = b;
			while ( (cur = cur.parentNode) ) {
				bp.unshift( cur );
			}

			// Walk down the tree looking for a discrepancy
			while ( ap[i] === bp[i] ) {
				i++;
			}

			return i ?
				// Do a sibling check if the nodes have a common ancestor
				siblingCheck( ap[i], bp[i] ) :

				// Otherwise nodes in our document sort first
				ap[i] === preferredDoc ? -1 :
				bp[i] === preferredDoc ? 1 :
				0;
		};

		return document;
	};

	Sizzle.matches = function( expr, elements ) {
		return Sizzle( expr, null, null, elements );
	};

	Sizzle.matchesSelector = function( elem, expr ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}

		// Make sure that attribute selectors are quoted
		expr = expr.replace( rattributeQuotes, "='$1']" );

		if ( support.matchesSelector && documentIsHTML &&
			!compilerCache[ expr + " " ] &&
			( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
			( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

			try {
				var ret = matches.call( elem, expr );

				// IE 9's matchesSelector returns false on disconnected nodes
				if ( ret || support.disconnectedMatch ||
						// As well, disconnected nodes are said to be in a document
						// fragment in IE 9
						elem.document && elem.document.nodeType !== 11 ) {
					return ret;
				}
			} catch (e) {}
		}

		return Sizzle( expr, document, null, [ elem ] ).length > 0;
	};

	Sizzle.contains = function( context, elem ) {
		// Set document vars if needed
		if ( ( context.ownerDocument || context ) !== document ) {
			setDocument( context );
		}
		return contains( context, elem );
	};

	Sizzle.attr = function( elem, name ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}

		var fn = Expr.attrHandle[ name.toLowerCase() ],
			// Don't get fooled by Object.prototype properties (jQuery #13807)
			val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
				fn( elem, name, !documentIsHTML ) :
				undefined;

		return val !== undefined ?
			val :
			support.attributes || !documentIsHTML ?
				elem.getAttribute( name ) :
				(val = elem.getAttributeNode(name)) && val.specified ?
					val.value :
					null;
	};

	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};

	/**
	 * Document sorting and removing duplicates
	 * @param {ArrayLike} results
	 */
	Sizzle.uniqueSort = function( results ) {
		var elem,
			duplicates = [],
			j = 0,
			i = 0;

		// Unless we *know* we can detect duplicates, assume their presence
		hasDuplicate = !support.detectDuplicates;
		sortInput = !support.sortStable && results.slice( 0 );
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			while ( (elem = results[i++]) ) {
				if ( elem === results[ i ] ) {
					j = duplicates.push( i );
				}
			}
			while ( j-- ) {
				results.splice( duplicates[ j ], 1 );
			}
		}

		// Clear input after sorting to release objects
		// See https://github.com/jquery/sizzle/pull/225
		sortInput = null;

		return results;
	};

	/**
	 * Utility function for retrieving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 */
	getText = Sizzle.getText = function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;

		if ( !nodeType ) {
			// If no nodeType, this is expected to be an array
			while ( (node = elem[i++]) ) {
				// Do not traverse comment nodes
				ret += getText( node );
			}
		} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (jQuery #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes

		return ret;
	};

	Expr = Sizzle.selectors = {

		// Can be adjusted by the user
		cacheLength: 50,

		createPseudo: markFunction,

		match: matchExpr,

		attrHandle: {},

		find: {},

		relative: {
			">": { dir: "parentNode", first: true },
			" ": { dir: "parentNode" },
			"+": { dir: "previousSibling", first: true },
			"~": { dir: "previousSibling" }
		},

		preFilter: {
			"ATTR": function( match ) {
				match[1] = match[1].replace( runescape, funescape );

				// Move the given value to match[3] whether quoted or unquoted
				match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

				if ( match[2] === "~=" ) {
					match[3] = " " + match[3] + " ";
				}

				return match.slice( 0, 4 );
			},

			"CHILD": function( match ) {
				/* matches from matchExpr["CHILD"]
					1 type (only|nth|...)
					2 what (child|of-type)
					3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
					4 xn-component of xn+y argument ([+-]?\d*n|)
					5 sign of xn-component
					6 x of xn-component
					7 sign of y-component
					8 y of y-component
				*/
				match[1] = match[1].toLowerCase();

				if ( match[1].slice( 0, 3 ) === "nth" ) {
					// nth-* requires argument
					if ( !match[3] ) {
						Sizzle.error( match[0] );
					}

					// numeric x and y parameters for Expr.filter.CHILD
					// remember that false/true cast respectively to 0/1
					match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
					match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

				// other types prohibit arguments
				} else if ( match[3] ) {
					Sizzle.error( match[0] );
				}

				return match;
			},

			"PSEUDO": function( match ) {
				var excess,
					unquoted = !match[6] && match[2];

				if ( matchExpr["CHILD"].test( match[0] ) ) {
					return null;
				}

				// Accept quoted arguments as-is
				if ( match[3] ) {
					match[2] = match[4] || match[5] || "";

				// Strip excess characters from unquoted arguments
				} else if ( unquoted && rpseudo.test( unquoted ) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

					// excess is a negative index
					match[0] = match[0].slice( 0, excess );
					match[2] = unquoted.slice( 0, excess );
				}

				// Return only captures needed by the pseudo filter method (type and argument)
				return match.slice( 0, 3 );
			}
		},

		filter: {

			"TAG": function( nodeNameSelector ) {
				var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
				return nodeNameSelector === "*" ?
					function() { return true; } :
					function( elem ) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
					};
			},

			"CLASS": function( className ) {
				var pattern = classCache[ className + " " ];

				return pattern ||
					(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
					classCache( className, function( elem ) {
						return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
					});
			},

			"ATTR": function( name, operator, check ) {
				return function( elem ) {
					var result = Sizzle.attr( elem, name );

					if ( result == null ) {
						return operator === "!=";
					}
					if ( !operator ) {
						return true;
					}

					result += "";

					return operator === "=" ? result === check :
						operator === "!=" ? result !== check :
						operator === "^=" ? check && result.indexOf( check ) === 0 :
						operator === "*=" ? check && result.indexOf( check ) > -1 :
						operator === "$=" ? check && result.slice( -check.length ) === check :
						operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
						operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
						false;
				};
			},

			"CHILD": function( type, what, argument, first, last ) {
				var simple = type.slice( 0, 3 ) !== "nth",
					forward = type.slice( -4 ) !== "last",
					ofType = what === "of-type";

				return first === 1 && last === 0 ?

					// Shortcut for :nth-*(n)
					function( elem ) {
						return !!elem.parentNode;
					} :

					function( elem, context, xml ) {
						var cache, uniqueCache, outerCache, node, nodeIndex, start,
							dir = simple !== forward ? "nextSibling" : "previousSibling",
							parent = elem.parentNode,
							name = ofType && elem.nodeName.toLowerCase(),
							useCache = !xml && !ofType,
							diff = false;

						if ( parent ) {

							// :(first|last|only)-(child|of-type)
							if ( simple ) {
								while ( dir ) {
									node = elem;
									while ( (node = node[ dir ]) ) {
										if ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) {

											return false;
										}
									}
									// Reverse direction for :only-* (if we haven't yet done so)
									start = dir = type === "only" && !start && "nextSibling";
								}
								return true;
							}

							start = [ forward ? parent.firstChild : parent.lastChild ];

							// non-xml :nth-child(...) stores cache data on `parent`
							if ( forward && useCache ) {

								// Seek `elem` from a previously-cached index

								// ...in a gzip-friendly way
								node = parent;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex && cache[ 2 ];
								node = nodeIndex && parent.childNodes[ nodeIndex ];

								while ( (node = ++nodeIndex && node && node[ dir ] ||

									// Fallback to seeking `elem` from the start
									(diff = nodeIndex = 0) || start.pop()) ) {

									// When found, cache indexes on `parent` and break
									if ( node.nodeType === 1 && ++diff && node === elem ) {
										uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
										break;
									}
								}

							} else {
								// Use previously-cached element index if available
								if ( useCache ) {
									// ...in a gzip-friendly way
									node = elem;
									outerCache = node[ expando ] || (node[ expando ] = {});

									// Support: IE <9 only
									// Defend against cloned attroperties (jQuery gh-1709)
									uniqueCache = outerCache[ node.uniqueID ] ||
										(outerCache[ node.uniqueID ] = {});

									cache = uniqueCache[ type ] || [];
									nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
									diff = nodeIndex;
								}

								// xml :nth-child(...)
								// or :nth-last-child(...) or :nth(-last)?-of-type(...)
								if ( diff === false ) {
									// Use the same loop as above to seek `elem` from the start
									while ( (node = ++nodeIndex && node && node[ dir ] ||
										(diff = nodeIndex = 0) || start.pop()) ) {

										if ( ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) &&
											++diff ) {

											// Cache the index of each encountered element
											if ( useCache ) {
												outerCache = node[ expando ] || (node[ expando ] = {});

												// Support: IE <9 only
												// Defend against cloned attroperties (jQuery gh-1709)
												uniqueCache = outerCache[ node.uniqueID ] ||
													(outerCache[ node.uniqueID ] = {});

												uniqueCache[ type ] = [ dirruns, diff ];
											}

											if ( node === elem ) {
												break;
											}
										}
									}
								}
							}

							// Incorporate the offset, then check against cycle size
							diff -= last;
							return diff === first || ( diff % first === 0 && diff / first >= 0 );
						}
					};
			},

			"PSEUDO": function( pseudo, argument ) {
				// pseudo-class names are case-insensitive
				// http://www.w3.org/TR/selectors/#pseudo-classes
				// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
				// Remember that setFilters inherits from pseudos
				var args,
					fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
						Sizzle.error( "unsupported pseudo: " + pseudo );

				// The user may use createPseudo to indicate that
				// arguments are needed to create the filter function
				// just as Sizzle does
				if ( fn[ expando ] ) {
					return fn( argument );
				}

				// But maintain support for old signatures
				if ( fn.length > 1 ) {
					args = [ pseudo, pseudo, "", argument ];
					return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
						markFunction(function( seed, matches ) {
							var idx,
								matched = fn( seed, argument ),
								i = matched.length;
							while ( i-- ) {
								idx = indexOf( seed, matched[i] );
								seed[ idx ] = !( matches[ idx ] = matched[i] );
							}
						}) :
						function( elem ) {
							return fn( elem, 0, args );
						};
				}

				return fn;
			}
		},

		pseudos: {
			// Potentially complex pseudos
			"not": markFunction(function( selector ) {
				// Trim the selector passed to compile
				// to avoid treating leading and trailing
				// spaces as combinators
				var input = [],
					results = [],
					matcher = compile( selector.replace( rtrim, "$1" ) );

				return matcher[ expando ] ?
					markFunction(function( seed, matches, context, xml ) {
						var elem,
							unmatched = matcher( seed, null, xml, [] ),
							i = seed.length;

						// Match elements unmatched by `matcher`
						while ( i-- ) {
							if ( (elem = unmatched[i]) ) {
								seed[i] = !(matches[i] = elem);
							}
						}
					}) :
					function( elem, context, xml ) {
						input[0] = elem;
						matcher( input, null, xml, results );
						// Don't keep the element (issue #299)
						input[0] = null;
						return !results.pop();
					};
			}),

			"has": markFunction(function( selector ) {
				return function( elem ) {
					return Sizzle( selector, elem ).length > 0;
				};
			}),

			"contains": markFunction(function( text ) {
				text = text.replace( runescape, funescape );
				return function( elem ) {
					return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
				};
			}),

			// "Whether an element is represented by a :lang() selector
			// is based solely on the element's language value
			// being equal to the identifier C,
			// or beginning with the identifier C immediately followed by "-".
			// The matching of C against the element's language value is performed case-insensitively.
			// The identifier C does not have to be a valid language name."
			// http://www.w3.org/TR/selectors/#lang-pseudo
			"lang": markFunction( function( lang ) {
				// lang value must be a valid identifier
				if ( !ridentifier.test(lang || "") ) {
					Sizzle.error( "unsupported lang: " + lang );
				}
				lang = lang.replace( runescape, funescape ).toLowerCase();
				return function( elem ) {
					var elemLang;
					do {
						if ( (elemLang = documentIsHTML ?
							elem.lang :
							elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

							elemLang = elemLang.toLowerCase();
							return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
						}
					} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
					return false;
				};
			}),

			// Miscellaneous
			"target": function( elem ) {
				var hash = window.location && window.location.hash;
				return hash && hash.slice( 1 ) === elem.id;
			},

			"root": function( elem ) {
				return elem === docElem;
			},

			"focus": function( elem ) {
				return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
			},

			// Boolean properties
			"enabled": function( elem ) {
				return elem.disabled === false;
			},

			"disabled": function( elem ) {
				return elem.disabled === true;
			},

			"checked": function( elem ) {
				// In CSS3, :checked should return both checked and selected elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				var nodeName = elem.nodeName.toLowerCase();
				return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
			},

			"selected": function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}

				return elem.selected === true;
			},

			// Contents
			"empty": function( elem ) {
				// http://www.w3.org/TR/selectors/#empty-pseudo
				// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
				//   but not by others (comment: 8; processing instruction: 7; etc.)
				// nodeType < 6 works because attributes (2) do not appear as children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					if ( elem.nodeType < 6 ) {
						return false;
					}
				}
				return true;
			},

			"parent": function( elem ) {
				return !Expr.pseudos["empty"]( elem );
			},

			// Element/input types
			"header": function( elem ) {
				return rheader.test( elem.nodeName );
			},

			"input": function( elem ) {
				return rinputs.test( elem.nodeName );
			},

			"button": function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === "button" || name === "button";
			},

			"text": function( elem ) {
				var attr;
				return elem.nodeName.toLowerCase() === "input" &&
					elem.type === "text" &&

					// Support: IE<8
					// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
					( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
			},

			// Position-in-collection
			"first": createPositionalPseudo(function() {
				return [ 0 ];
			}),

			"last": createPositionalPseudo(function( matchIndexes, length ) {
				return [ length - 1 ];
			}),

			"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
				return [ argument < 0 ? argument + length : argument ];
			}),

			"even": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 0;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"odd": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 1;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; --i >= 0; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; ++i < length; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			})
		}
	};

	Expr.pseudos["nth"] = Expr.pseudos["eq"];

	// Add button/input type pseudos
	for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
		Expr.pseudos[ i ] = createInputPseudo( i );
	}
	for ( i in { submit: true, reset: true } ) {
		Expr.pseudos[ i ] = createButtonPseudo( i );
	}

	// Easy API for creating new setFilters
	function setFilters() {}
	setFilters.prototype = Expr.filters = Expr.pseudos;
	Expr.setFilters = new setFilters();

	tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
		var matched, match, tokens, type,
			soFar, groups, preFilters,
			cached = tokenCache[ selector + " " ];

		if ( cached ) {
			return parseOnly ? 0 : cached.slice( 0 );
		}

		soFar = selector;
		groups = [];
		preFilters = Expr.preFilter;

		while ( soFar ) {

			// Comma and first run
			if ( !matched || (match = rcomma.exec( soFar )) ) {
				if ( match ) {
					// Don't consume trailing commas as valid
					soFar = soFar.slice( match[0].length ) || soFar;
				}
				groups.push( (tokens = []) );
			}

			matched = false;

			// Combinators
			if ( (match = rcombinators.exec( soFar )) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					// Cast descendant combinators to space
					type: match[0].replace( rtrim, " " )
				});
				soFar = soFar.slice( matched.length );
			}

			// Filters
			for ( type in Expr.filter ) {
				if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
					(match = preFilters[ type ]( match ))) ) {
					matched = match.shift();
					tokens.push({
						value: matched,
						type: type,
						matches: match
					});
					soFar = soFar.slice( matched.length );
				}
			}

			if ( !matched ) {
				break;
			}
		}

		// Return the length of the invalid excess
		// if we're just parsing
		// Otherwise, throw an error or return tokens
		return parseOnly ?
			soFar.length :
			soFar ?
				Sizzle.error( selector ) :
				// Cache the tokens
				tokenCache( selector, groups ).slice( 0 );
	};

	function toSelector( tokens ) {
		var i = 0,
			len = tokens.length,
			selector = "";
		for ( ; i < len; i++ ) {
			selector += tokens[i].value;
		}
		return selector;
	}

	function addCombinator( matcher, combinator, base ) {
		var dir = combinator.dir,
			checkNonElements = base && dir === "parentNode",
			doneName = done++;

		return combinator.first ?
			// Check against closest ancestor/preceding element
			function( elem, context, xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						return matcher( elem, context, xml );
					}
				}
			} :

			// Check against all ancestor/preceding elements
			function( elem, context, xml ) {
				var oldCache, uniqueCache, outerCache,
					newCache = [ dirruns, doneName ];

				// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
				if ( xml ) {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							if ( matcher( elem, context, xml ) ) {
								return true;
							}
						}
					}
				} else {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							outerCache = elem[ expando ] || (elem[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

							if ( (oldCache = uniqueCache[ dir ]) &&
								oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

								// Assign to newCache so results back-propagate to previous elements
								return (newCache[ 2 ] = oldCache[ 2 ]);
							} else {
								// Reuse newcache so results back-propagate to previous elements
								uniqueCache[ dir ] = newCache;

								// A match means we're done; a fail means we have to keep checking
								if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
									return true;
								}
							}
						}
					}
				}
			};
	}

	function elementMatcher( matchers ) {
		return matchers.length > 1 ?
			function( elem, context, xml ) {
				var i = matchers.length;
				while ( i-- ) {
					if ( !matchers[i]( elem, context, xml ) ) {
						return false;
					}
				}
				return true;
			} :
			matchers[0];
	}

	function multipleContexts( selector, contexts, results ) {
		var i = 0,
			len = contexts.length;
		for ( ; i < len; i++ ) {
			Sizzle( selector, contexts[i], results );
		}
		return results;
	}

	function condense( unmatched, map, filter, context, xml ) {
		var elem,
			newUnmatched = [],
			i = 0,
			len = unmatched.length,
			mapped = map != null;

		for ( ; i < len; i++ ) {
			if ( (elem = unmatched[i]) ) {
				if ( !filter || filter( elem, context, xml ) ) {
					newUnmatched.push( elem );
					if ( mapped ) {
						map.push( i );
					}
				}
			}
		}

		return newUnmatched;
	}

	function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
		if ( postFilter && !postFilter[ expando ] ) {
			postFilter = setMatcher( postFilter );
		}
		if ( postFinder && !postFinder[ expando ] ) {
			postFinder = setMatcher( postFinder, postSelector );
		}
		return markFunction(function( seed, results, context, xml ) {
			var temp, i, elem,
				preMap = [],
				postMap = [],
				preexisting = results.length,

				// Get initial elements from seed or context
				elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && ( seed || !selector ) ?
					condense( elems, preMap, preFilter, context, xml ) :
					elems,

				matcherOut = matcher ?
					// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
					postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

						// ...intermediate processing is necessary
						[] :

						// ...otherwise use results directly
						results :
					matcherIn;

			// Find primary matches
			if ( matcher ) {
				matcher( matcherIn, matcherOut, context, xml );
			}

			// Apply postFilter
			if ( postFilter ) {
				temp = condense( matcherOut, postMap );
				postFilter( temp, [], context, xml );

				// Un-match failing elements by moving them back to matcherIn
				i = temp.length;
				while ( i-- ) {
					if ( (elem = temp[i]) ) {
						matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
					}
				}
			}

			if ( seed ) {
				if ( postFinder || preFilter ) {
					if ( postFinder ) {
						// Get the final matcherOut by condensing this intermediate into postFinder contexts
						temp = [];
						i = matcherOut.length;
						while ( i-- ) {
							if ( (elem = matcherOut[i]) ) {
								// Restore matcherIn since elem is not yet a final match
								temp.push( (matcherIn[i] = elem) );
							}
						}
						postFinder( null, (matcherOut = []), temp, xml );
					}

					// Move matched elements from seed to results to keep them synchronized
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) &&
							(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

							seed[temp] = !(results[temp] = elem);
						}
					}
				}

			// Add elements to results, through postFinder if defined
			} else {
				matcherOut = condense(
					matcherOut === results ?
						matcherOut.splice( preexisting, matcherOut.length ) :
						matcherOut
				);
				if ( postFinder ) {
					postFinder( null, results, matcherOut, xml );
				} else {
					push.apply( results, matcherOut );
				}
			}
		});
	}

	function matcherFromTokens( tokens ) {
		var checkContext, matcher, j,
			len = tokens.length,
			leadingRelative = Expr.relative[ tokens[0].type ],
			implicitRelative = leadingRelative || Expr.relative[" "],
			i = leadingRelative ? 1 : 0,

			// The foundational matcher ensures that elements are reachable from top-level context(s)
			matchContext = addCombinator( function( elem ) {
				return elem === checkContext;
			}, implicitRelative, true ),
			matchAnyContext = addCombinator( function( elem ) {
				return indexOf( checkContext, elem ) > -1;
			}, implicitRelative, true ),
			matchers = [ function( elem, context, xml ) {
				var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
					(checkContext = context).nodeType ?
						matchContext( elem, context, xml ) :
						matchAnyContext( elem, context, xml ) );
				// Avoid hanging onto element (issue #299)
				checkContext = null;
				return ret;
			} ];

		for ( ; i < len; i++ ) {
			if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
				matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
			} else {
				matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

				// Return special upon seeing a positional matcher
				if ( matcher[ expando ] ) {
					// Find the next relative operator (if any) for proper handling
					j = ++i;
					for ( ; j < len; j++ ) {
						if ( Expr.relative[ tokens[j].type ] ) {
							break;
						}
					}
					return setMatcher(
						i > 1 && elementMatcher( matchers ),
						i > 1 && toSelector(
							// If the preceding token was a descendant combinator, insert an implicit any-element `*`
							tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
						).replace( rtrim, "$1" ),
						matcher,
						i < j && matcherFromTokens( tokens.slice( i, j ) ),
						j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
						j < len && toSelector( tokens )
					);
				}
				matchers.push( matcher );
			}
		}

		return elementMatcher( matchers );
	}

	function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
		var bySet = setMatchers.length > 0,
			byElement = elementMatchers.length > 0,
			superMatcher = function( seed, context, xml, results, outermost ) {
				var elem, j, matcher,
					matchedCount = 0,
					i = "0",
					unmatched = seed && [],
					setMatched = [],
					contextBackup = outermostContext,
					// We must always have either seed elements or outermost context
					elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
					// Use integer dirruns iff this is the outermost matcher
					dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
					len = elems.length;

				if ( outermost ) {
					outermostContext = context === document || context || outermost;
				}

				// Add elements passing elementMatchers directly to results
				// Support: IE<9, Safari
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
				for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
					if ( byElement && elem ) {
						j = 0;
						if ( !context && elem.ownerDocument !== document ) {
							setDocument( elem );
							xml = !documentIsHTML;
						}
						while ( (matcher = elementMatchers[j++]) ) {
							if ( matcher( elem, context || document, xml) ) {
								results.push( elem );
								break;
							}
						}
						if ( outermost ) {
							dirruns = dirrunsUnique;
						}
					}

					// Track unmatched elements for set filters
					if ( bySet ) {
						// They will have gone through all possible matchers
						if ( (elem = !matcher && elem) ) {
							matchedCount--;
						}

						// Lengthen the array for every element, matched or not
						if ( seed ) {
							unmatched.push( elem );
						}
					}
				}

				// `i` is now the count of elements visited above, and adding it to `matchedCount`
				// makes the latter nonnegative.
				matchedCount += i;

				// Apply set filters to unmatched elements
				// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
				// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
				// no element matchers and no seed.
				// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
				// case, which will result in a "00" `matchedCount` that differs from `i` but is also
				// numerically zero.
				if ( bySet && i !== matchedCount ) {
					j = 0;
					while ( (matcher = setMatchers[j++]) ) {
						matcher( unmatched, setMatched, context, xml );
					}

					if ( seed ) {
						// Reintegrate element matches to eliminate the need for sorting
						if ( matchedCount > 0 ) {
							while ( i-- ) {
								if ( !(unmatched[i] || setMatched[i]) ) {
									setMatched[i] = pop.call( results );
								}
							}
						}

						// Discard index placeholder values to get only actual matches
						setMatched = condense( setMatched );
					}

					// Add matches to results
					push.apply( results, setMatched );

					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if ( outermost && !seed && setMatched.length > 0 &&
						( matchedCount + setMatchers.length ) > 1 ) {

						Sizzle.uniqueSort( results );
					}
				}

				// Override manipulation of globals by nested matchers
				if ( outermost ) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}

				return unmatched;
			};

		return bySet ?
			markFunction( superMatcher ) :
			superMatcher;
	}

	compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
		var i,
			setMatchers = [],
			elementMatchers = [],
			cached = compilerCache[ selector + " " ];

		if ( !cached ) {
			// Generate a function of recursive functions that can be used to check each element
			if ( !match ) {
				match = tokenize( selector );
			}
			i = match.length;
			while ( i-- ) {
				cached = matcherFromTokens( match[i] );
				if ( cached[ expando ] ) {
					setMatchers.push( cached );
				} else {
					elementMatchers.push( cached );
				}
			}

			// Cache the compiled function
			cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

			// Save selector and tokenization
			cached.selector = selector;
		}
		return cached;
	};

	/**
	 * A low-level selection function that works with Sizzle's compiled
	 *  selector functions
	 * @param {String|Function} selector A selector or a pre-compiled
	 *  selector function built with Sizzle.compile
	 * @param {Element} context
	 * @param {Array} [results]
	 * @param {Array} [seed] A set of elements to match against
	 */
	select = Sizzle.select = function( selector, context, results, seed ) {
		var i, tokens, token, type, find,
			compiled = typeof selector === "function" && selector,
			match = !seed && tokenize( (selector = compiled.selector || selector) );

		results = results || [];

		// Try to minimize operations if there is only one selector in the list and no seed
		// (the latter of which guarantees us context)
		if ( match.length === 1 ) {

			// Reduce context if the leading compound selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					support.getById && context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {

				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;

				// Precompiled matchers will still verify ancestry, so step up a level
				} else if ( compiled ) {
					context = context.parentNode;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}

		// Compile and execute a filtering function if one is not provided
		// Provide `match` to avoid retokenization if we modified the selector above
		( compiled || compile( selector, match ) )(
			seed,
			context,
			!documentIsHTML,
			results,
			!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
		);
		return results;
	};

	// One-time assignments

	// Sort stability
	support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

	// Support: Chrome 14-35+
	// Always assume duplicates if they aren't passed to the comparison function
	support.detectDuplicates = !!hasDuplicate;

	// Initialize against the default document
	setDocument();

	// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert(function( div1 ) {
		// Should return 1, but returns 4 (following)
		return div1.compareDocumentPosition( document.createElement("div") ) & 1;
	});

	// Support: IE<8
	// Prevent attribute/property "interpolation"
	// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
	if ( !assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild.getAttribute("href") === "#" ;
	}) ) {
		addHandle( "type|href|height|width", function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
			}
		});
	}

	// Support: IE<9
	// Use defaultValue in place of getAttribute("value")
	if ( !support.attributes || !assert(function( div ) {
		div.innerHTML = "<input/>";
		div.firstChild.setAttribute( "value", "" );
		return div.firstChild.getAttribute( "value" ) === "";
	}) ) {
		addHandle( "value", function( elem, name, isXML ) {
			if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
				return elem.defaultValue;
			}
		});
	}

	// Support: IE<9
	// Use getAttributeNode to fetch booleans when getAttribute lies
	if ( !assert(function( div ) {
		return div.getAttribute("disabled") == null;
	}) ) {
		addHandle( booleans, function( elem, name, isXML ) {
			var val;
			if ( !isXML ) {
				return elem[ name ] === true ? name.toLowerCase() :
						(val = elem.getAttributeNode( name )) && val.specified ?
						val.value :
					null;
			}
		});
	}

	return Sizzle;

	})( window );



	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;
	jQuery.expr[ ":" ] = jQuery.expr.pseudos;
	jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = Sizzle.getText;
	jQuery.isXMLDoc = Sizzle.isXML;
	jQuery.contains = Sizzle.contains;



	var dir = function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	};


	var siblings = function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	};


	var rneedsContext = jQuery.expr.match.needsContext;

	var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



	var risSimple = /^.[^:#\[\.,]*$/;

	// Implement the identical functionality for filter and not
	function winnow( elements, qualifier, not ) {
		if ( jQuery.isFunction( qualifier ) ) {
			return jQuery.grep( elements, function( elem, i ) {
				/* jshint -W018 */
				return !!qualifier.call( elem, i, elem ) !== not;
			} );

		}

		if ( qualifier.nodeType ) {
			return jQuery.grep( elements, function( elem ) {
				return ( elem === qualifier ) !== not;
			} );

		}

		if ( typeof qualifier === "string" ) {
			if ( risSimple.test( qualifier ) ) {
				return jQuery.filter( qualifier, elements, not );
			}

			qualifier = jQuery.filter( qualifier, elements );
		}

		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	jQuery.filter = function( expr, elems, not ) {
		var elem = elems[ 0 ];

		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 && elem.nodeType === 1 ?
			jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
			jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
				return elem.nodeType === 1;
			} ) );
	};

	jQuery.fn.extend( {
		find: function( selector ) {
			var i,
				len = this.length,
				ret = [],
				self = this;

			if ( typeof selector !== "string" ) {
				return this.pushStack( jQuery( selector ).filter( function() {
					for ( i = 0; i < len; i++ ) {
						if ( jQuery.contains( self[ i ], this ) ) {
							return true;
						}
					}
				} ) );
			}

			for ( i = 0; i < len; i++ ) {
				jQuery.find( selector, self[ i ], ret );
			}

			// Needed because $( selector, context ) becomes $( context ).find( selector )
			ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
			ret.selector = this.selector ? this.selector + " " + selector : selector;
			return ret;
		},
		filter: function( selector ) {
			return this.pushStack( winnow( this, selector || [], false ) );
		},
		not: function( selector ) {
			return this.pushStack( winnow( this, selector || [], true ) );
		},
		is: function( selector ) {
			return !!winnow(
				this,

				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				typeof selector === "string" && rneedsContext.test( selector ) ?
					jQuery( selector ) :
					selector || [],
				false
			).length;
		}
	} );


	// Initialize a jQuery object


	// A central reference to the root jQuery(document)
	var rootjQuery,

		// A simple way to check for HTML strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		// Strict HTML recognition (#11290: must start with <)
		rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

		init = jQuery.fn.init = function( selector, context, root ) {
			var match, elem;

			// HANDLE: $(""), $(null), $(undefined), $(false)
			if ( !selector ) {
				return this;
			}

			// Method init() accepts an alternate rootjQuery
			// so migrate can support jQuery.sub (gh-2101)
			root = root || rootjQuery;

			// Handle HTML strings
			if ( typeof selector === "string" ) {
				if ( selector[ 0 ] === "<" &&
					selector[ selector.length - 1 ] === ">" &&
					selector.length >= 3 ) {

					// Assume that strings that start and end with <> are HTML and skip the regex check
					match = [ null, selector, null ];

				} else {
					match = rquickExpr.exec( selector );
				}

				// Match html or make sure no context is specified for #id
				if ( match && ( match[ 1 ] || !context ) ) {

					// HANDLE: $(html) -> $(array)
					if ( match[ 1 ] ) {
						context = context instanceof jQuery ? context[ 0 ] : context;

						// Option to run scripts is true for back-compat
						// Intentionally let the error be thrown if parseHTML is not present
						jQuery.merge( this, jQuery.parseHTML(
							match[ 1 ],
							context && context.nodeType ? context.ownerDocument || context : document,
							true
						) );

						// HANDLE: $(html, props)
						if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
							for ( match in context ) {

								// Properties of context are called as methods if possible
								if ( jQuery.isFunction( this[ match ] ) ) {
									this[ match ]( context[ match ] );

								// ...and otherwise set as attributes
								} else {
									this.attr( match, context[ match ] );
								}
							}
						}

						return this;

					// HANDLE: $(#id)
					} else {
						elem = document.getElementById( match[ 2 ] );

						// Support: Blackberry 4.6
						// gEBID returns nodes no longer in the document (#6963)
						if ( elem && elem.parentNode ) {

							// Inject the element directly into the jQuery object
							this.length = 1;
							this[ 0 ] = elem;
						}

						this.context = document;
						this.selector = selector;
						return this;
					}

				// HANDLE: $(expr, $(...))
				} else if ( !context || context.jquery ) {
					return ( context || root ).find( selector );

				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
				} else {
					return this.constructor( context ).find( selector );
				}

			// HANDLE: $(DOMElement)
			} else if ( selector.nodeType ) {
				this.context = this[ 0 ] = selector;
				this.length = 1;
				return this;

			// HANDLE: $(function)
			// Shortcut for document ready
			} else if ( jQuery.isFunction( selector ) ) {
				return root.ready !== undefined ?
					root.ready( selector ) :

					// Execute immediately if ready is not present
					selector( jQuery );
			}

			if ( selector.selector !== undefined ) {
				this.selector = selector.selector;
				this.context = selector.context;
			}

			return jQuery.makeArray( selector, this );
		};

	// Give the init function the jQuery prototype for later instantiation
	init.prototype = jQuery.fn;

	// Initialize central reference
	rootjQuery = jQuery( document );


	var rparentsprev = /^(?:parents|prev(?:Until|All))/,

		// Methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};

	jQuery.fn.extend( {
		has: function( target ) {
			var targets = jQuery( target, this ),
				l = targets.length;

			return this.filter( function() {
				var i = 0;
				for ( ; i < l; i++ ) {
					if ( jQuery.contains( this, targets[ i ] ) ) {
						return true;
					}
				}
			} );
		},

		closest: function( selectors, context ) {
			var cur,
				i = 0,
				l = this.length,
				matched = [],
				pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
					jQuery( selectors, context || this.context ) :
					0;

			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( pos ?
						pos.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}

			return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
		},

		// Determine the position of an element within the set
		index: function( elem ) {

			// No argument, return index in parent
			if ( !elem ) {
				return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
			}

			// Index in selector
			if ( typeof elem === "string" ) {
				return indexOf.call( jQuery( elem ), this[ 0 ] );
			}

			// Locate the position of the desired element
			return indexOf.call( this,

				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[ 0 ] : elem
			);
		},

		add: function( selector, context ) {
			return this.pushStack(
				jQuery.uniqueSort(
					jQuery.merge( this.get(), jQuery( selector, context ) )
				)
			);
		},

		addBack: function( selector ) {
			return this.add( selector == null ?
				this.prevObject : this.prevObject.filter( selector )
			);
		}
	} );

	function sibling( cur, dir ) {
		while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
		return cur;
	}

	jQuery.each( {
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, i, until ) {
			return dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return sibling( elem, "nextSibling" );
		},
		prev: function( elem ) {
			return sibling( elem, "previousSibling" );
		},
		nextAll: function( elem ) {
			return dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, i, until ) {
			return dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, i, until ) {
			return dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return siblings( ( elem.parentNode || {} ).firstChild, elem );
		},
		children: function( elem ) {
			return siblings( elem.firstChild );
		},
		contents: function( elem ) {
			return elem.contentDocument || jQuery.merge( [], elem.childNodes );
		}
	}, function( name, fn ) {
		jQuery.fn[ name ] = function( until, selector ) {
			var matched = jQuery.map( this, fn, until );

			if ( name.slice( -5 ) !== "Until" ) {
				selector = until;
			}

			if ( selector && typeof selector === "string" ) {
				matched = jQuery.filter( selector, matched );
			}

			if ( this.length > 1 ) {

				// Remove duplicates
				if ( !guaranteedUnique[ name ] ) {
					jQuery.uniqueSort( matched );
				}

				// Reverse order for parents* and prev-derivatives
				if ( rparentsprev.test( name ) ) {
					matched.reverse();
				}
			}

			return this.pushStack( matched );
		};
	} );
	var rnotwhite = ( /\S+/g );



	// Convert String-formatted options into Object-formatted ones
	function createOptions( options ) {
		var object = {};
		jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
			object[ flag ] = true;
		} );
		return object;
	}

	/*
	 * Create a callback list using the following parameters:
	 *
	 *	options: an optional list of space-separated options that will change how
	 *			the callback list behaves or a more traditional option object
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible options:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
	jQuery.Callbacks = function( options ) {

		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ?
			createOptions( options ) :
			jQuery.extend( {}, options );

		var // Flag to know if list is currently firing
			firing,

			// Last fire value for non-forgettable lists
			memory,

			// Flag to know if list was already fired
			fired,

			// Flag to prevent firing
			locked,

			// Actual callback list
			list = [],

			// Queue of execution data for repeatable lists
			queue = [],

			// Index of currently firing callback (modified by add/remove as needed)
			firingIndex = -1,

			// Fire callbacks
			fire = function() {

				// Enforce single-firing
				locked = options.once;

				// Execute callbacks for all pending executions,
				// respecting firingIndex overrides and runtime changes
				fired = firing = true;
				for ( ; queue.length; firingIndex = -1 ) {
					memory = queue.shift();
					while ( ++firingIndex < list.length ) {

						// Run callback and check for early termination
						if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
							options.stopOnFalse ) {

							// Jump to end and forget the data so .add doesn't re-fire
							firingIndex = list.length;
							memory = false;
						}
					}
				}

				// Forget the data if we're done with it
				if ( !options.memory ) {
					memory = false;
				}

				firing = false;

				// Clean up if we're done firing for good
				if ( locked ) {

					// Keep an empty list if we have data for future add calls
					if ( memory ) {
						list = [];

					// Otherwise, this object is spent
					} else {
						list = "";
					}
				}
			},

			// Actual Callbacks object
			self = {

				// Add a callback or a collection of callbacks to the list
				add: function() {
					if ( list ) {

						// If we have memory from a past run, we should fire after adding
						if ( memory && !firing ) {
							firingIndex = list.length - 1;
							queue.push( memory );
						}

						( function add( args ) {
							jQuery.each( args, function( _, arg ) {
								if ( jQuery.isFunction( arg ) ) {
									if ( !options.unique || !self.has( arg ) ) {
										list.push( arg );
									}
								} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

									// Inspect recursively
									add( arg );
								}
							} );
						} )( arguments );

						if ( memory && !firing ) {
							fire();
						}
					}
					return this;
				},

				// Remove a callback from the list
				remove: function() {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );

							// Handle firing indexes
							if ( index <= firingIndex ) {
								firingIndex--;
							}
						}
					} );
					return this;
				},

				// Check if a given callback is in the list.
				// If no argument is given, return whether or not list has callbacks attached.
				has: function( fn ) {
					return fn ?
						jQuery.inArray( fn, list ) > -1 :
						list.length > 0;
				},

				// Remove all callbacks from the list
				empty: function() {
					if ( list ) {
						list = [];
					}
					return this;
				},

				// Disable .fire and .add
				// Abort any current/pending executions
				// Clear all callbacks and values
				disable: function() {
					locked = queue = [];
					list = memory = "";
					return this;
				},
				disabled: function() {
					return !list;
				},

				// Disable .fire
				// Also disable .add unless we have memory (since it would have no effect)
				// Abort any pending executions
				lock: function() {
					locked = queue = [];
					if ( !memory ) {
						list = memory = "";
					}
					return this;
				},
				locked: function() {
					return !!locked;
				},

				// Call all callbacks with the given context and arguments
				fireWith: function( context, args ) {
					if ( !locked ) {
						args = args || [];
						args = [ context, args.slice ? args.slice() : args ];
						queue.push( args );
						if ( !firing ) {
							fire();
						}
					}
					return this;
				},

				// Call all the callbacks with the given arguments
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},

				// To know if the callbacks have already been called at least once
				fired: function() {
					return !!fired;
				}
			};

		return self;
	};


	jQuery.extend( {

		Deferred: function( func ) {
			var tuples = [

					// action, add listener, listener list, final state
					[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
					[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
					[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
				],
				state = "pending",
				promise = {
					state: function() {
						return state;
					},
					always: function() {
						deferred.done( arguments ).fail( arguments );
						return this;
					},
					then: function( /* fnDone, fnFail, fnProgress */ ) {
						var fns = arguments;
						return jQuery.Deferred( function( newDefer ) {
							jQuery.each( tuples, function( i, tuple ) {
								var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

								// deferred[ done | fail | progress ] for forwarding actions to newDefer
								deferred[ tuple[ 1 ] ]( function() {
									var returned = fn && fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.progress( newDefer.notify )
											.done( newDefer.resolve )
											.fail( newDefer.reject );
									} else {
										newDefer[ tuple[ 0 ] + "With" ](
											this === promise ? newDefer.promise() : this,
											fn ? [ returned ] : arguments
										);
									}
								} );
							} );
							fns = null;
						} ).promise();
					},

					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					promise: function( obj ) {
						return obj != null ? jQuery.extend( obj, promise ) : promise;
					}
				},
				deferred = {};

			// Keep pipe for back-compat
			promise.pipe = promise.then;

			// Add list-specific methods
			jQuery.each( tuples, function( i, tuple ) {
				var list = tuple[ 2 ],
					stateString = tuple[ 3 ];

				// promise[ done | fail | progress ] = list.add
				promise[ tuple[ 1 ] ] = list.add;

				// Handle state
				if ( stateString ) {
					list.add( function() {

						// state = [ resolved | rejected ]
						state = stateString;

					// [ reject_list | resolve_list ].disable; progress_list.lock
					}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
				}

				// deferred[ resolve | reject | notify ]
				deferred[ tuple[ 0 ] ] = function() {
					deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
					return this;
				};
				deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
			} );

			// Make the deferred a promise
			promise.promise( deferred );

			// Call given func if any
			if ( func ) {
				func.call( deferred, deferred );
			}

			// All done!
			return deferred;
		},

		// Deferred helper
		when: function( subordinate /* , ..., subordinateN */ ) {
			var i = 0,
				resolveValues = slice.call( arguments ),
				length = resolveValues.length,

				// the count of uncompleted subordinates
				remaining = length !== 1 ||
					( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

				// the master Deferred.
				// If resolveValues consist of only a single Deferred, just use that.
				deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

				// Update function for both resolve and progress values
				updateFunc = function( i, contexts, values ) {
					return function( value ) {
						contexts[ i ] = this;
						values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
						if ( values === progressValues ) {
							deferred.notifyWith( contexts, values );
						} else if ( !( --remaining ) ) {
							deferred.resolveWith( contexts, values );
						}
					};
				},

				progressValues, progressContexts, resolveContexts;

			// Add listeners to Deferred subordinates; treat others as resolved
			if ( length > 1 ) {
				progressValues = new Array( length );
				progressContexts = new Array( length );
				resolveContexts = new Array( length );
				for ( ; i < length; i++ ) {
					if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
						resolveValues[ i ].promise()
							.progress( updateFunc( i, progressContexts, progressValues ) )
							.done( updateFunc( i, resolveContexts, resolveValues ) )
							.fail( deferred.reject );
					} else {
						--remaining;
					}
				}
			}

			// If we're not waiting on anything, resolve the master
			if ( !remaining ) {
				deferred.resolveWith( resolveContexts, resolveValues );
			}

			return deferred.promise();
		}
	} );


	// The deferred used on DOM ready
	var readyList;

	jQuery.fn.ready = function( fn ) {

		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	};

	jQuery.extend( {

		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,

		// A counter to track how many items to wait for before
		// the ready event fires. See #6781
		readyWait: 1,

		// Hold (or release) the ready event
		holdReady: function( hold ) {
			if ( hold ) {
				jQuery.readyWait++;
			} else {
				jQuery.ready( true );
			}
		},

		// Handle when the DOM is ready
		ready: function( wait ) {

			// Abort if there are pending holds or we're already ready
			if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
				return;
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.triggerHandler ) {
				jQuery( document ).triggerHandler( "ready" );
				jQuery( document ).off( "ready" );
			}
		}
	} );

	/**
	 * The ready event handler and self cleanup method
	 */
	function completed() {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );
		jQuery.ready();
	}

	jQuery.ready.promise = function( obj ) {
		if ( !readyList ) {

			readyList = jQuery.Deferred();

			// Catch cases where $(document).ready() is called
			// after the browser event has already occurred.
			// Support: IE9-10 only
			// Older IE sometimes signals "interactive" too soon
			if ( document.readyState === "complete" ||
				( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

				// Handle it asynchronously to allow scripts the opportunity to delay ready
				window.setTimeout( jQuery.ready );

			} else {

				// Use the handy event callback
				document.addEventListener( "DOMContentLoaded", completed );

				// A fallback to window.onload, that will always work
				window.addEventListener( "load", completed );
			}
		}
		return readyList.promise( obj );
	};

	// Kick off the DOM ready check even if the user does not
	jQuery.ready.promise();




	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			len = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				access( elems, fn, i, key[ i ], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {

				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < len; i++ ) {
					fn(
						elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
					);
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				len ? fn( elems[ 0 ], key ) : emptyGet;
	};
	var acceptData = function( owner ) {

		// Accepts only:
		//  - Node
		//    - Node.ELEMENT_NODE
		//    - Node.DOCUMENT_NODE
		//  - Object
		//    - Any
		/* jshint -W018 */
		return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
	};




	function Data() {
		this.expando = jQuery.expando + Data.uid++;
	}

	Data.uid = 1;

	Data.prototype = {

		register: function( owner, initial ) {
			var value = initial || {};

			// If it is a node unlikely to be stringify-ed or looped over
			// use plain assignment
			if ( owner.nodeType ) {
				owner[ this.expando ] = value;

			// Otherwise secure it in a non-enumerable, non-writable property
			// configurability must be true to allow the property to be
			// deleted with the delete operator
			} else {
				Object.defineProperty( owner, this.expando, {
					value: value,
					writable: true,
					configurable: true
				} );
			}
			return owner[ this.expando ];
		},
		cache: function( owner ) {

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( !acceptData( owner ) ) {
				return {};
			}

			// Check if the owner object already has a cache
			var value = owner[ this.expando ];

			// If not, create one
			if ( !value ) {
				value = {};

				// We can accept data for non-element nodes in modern browsers,
				// but we should not, see #8335.
				// Always return an empty object.
				if ( acceptData( owner ) ) {

					// If it is a node unlikely to be stringify-ed or looped over
					// use plain assignment
					if ( owner.nodeType ) {
						owner[ this.expando ] = value;

					// Otherwise secure it in a non-enumerable property
					// configurable must be true to allow the property to be
					// deleted when data is removed
					} else {
						Object.defineProperty( owner, this.expando, {
							value: value,
							configurable: true
						} );
					}
				}
			}

			return value;
		},
		set: function( owner, data, value ) {
			var prop,
				cache = this.cache( owner );

			// Handle: [ owner, key, value ] args
			if ( typeof data === "string" ) {
				cache[ data ] = value;

			// Handle: [ owner, { properties } ] args
			} else {

				// Copy the properties one-by-one to the cache object
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
			return cache;
		},
		get: function( owner, key ) {
			return key === undefined ?
				this.cache( owner ) :
				owner[ this.expando ] && owner[ this.expando ][ key ];
		},
		access: function( owner, key, value ) {
			var stored;

			// In cases where either:
			//
			//   1. No key was specified
			//   2. A string key was specified, but no value provided
			//
			// Take the "read" path and allow the get method to determine
			// which value to return, respectively either:
			//
			//   1. The entire cache object
			//   2. The data stored at the key
			//
			if ( key === undefined ||
					( ( key && typeof key === "string" ) && value === undefined ) ) {

				stored = this.get( owner, key );

				return stored !== undefined ?
					stored : this.get( owner, jQuery.camelCase( key ) );
			}

			// When the key is not a string, or both a key and value
			// are specified, set or extend (existing objects) with either:
			//
			//   1. An object of properties
			//   2. A key and value
			//
			this.set( owner, key, value );

			// Since the "set" path can have two possible entry points
			// return the expected data based on which path was taken[*]
			return value !== undefined ? value : key;
		},
		remove: function( owner, key ) {
			var i, name, camel,
				cache = owner[ this.expando ];

			if ( cache === undefined ) {
				return;
			}

			if ( key === undefined ) {
				this.register( owner );

			} else {

				// Support array or space separated string of keys
				if ( jQuery.isArray( key ) ) {

					// If "name" is an array of keys...
					// When data is initially created, via ("key", "val") signature,
					// keys will be converted to camelCase.
					// Since there is no way to tell _how_ a key was added, remove
					// both plain key and camelCase key. #12786
					// This will only penalize the array argument path.
					name = key.concat( key.map( jQuery.camelCase ) );
				} else {
					camel = jQuery.camelCase( key );

					// Try the string as a key before any manipulation
					if ( key in cache ) {
						name = [ key, camel ];
					} else {

						// If a key with the spaces exists, use it.
						// Otherwise, create an array by matching non-whitespace
						name = camel;
						name = name in cache ?
							[ name ] : ( name.match( rnotwhite ) || [] );
					}
				}

				i = name.length;

				while ( i-- ) {
					delete cache[ name[ i ] ];
				}
			}

			// Remove the expando if there's no more data
			if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

				// Support: Chrome <= 35-45+
				// Webkit & Blink performance suffers when deleting properties
				// from DOM nodes, so set to undefined instead
				// https://code.google.com/p/chromium/issues/detail?id=378607
				if ( owner.nodeType ) {
					owner[ this.expando ] = undefined;
				} else {
					delete owner[ this.expando ];
				}
			}
		},
		hasData: function( owner ) {
			var cache = owner[ this.expando ];
			return cache !== undefined && !jQuery.isEmptyObject( cache );
		}
	};
	var dataPriv = new Data();

	var dataUser = new Data();



	//	Implementation Summary
	//
	//	1. Enforce API surface and semantic compatibility with 1.9.x branch
	//	2. Improve the module's maintainability by reducing the storage
	//		paths to a single mechanism.
	//	3. Use the same single mechanism to support "private" and "user" data.
	//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	//	5. Avoid exposing implementation details on user objects (eg. expando properties)
	//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

	var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
		rmultiDash = /[A-Z]/g;

	function dataAttr( elem, key, data ) {
		var name;

		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
			name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
			data = elem.getAttribute( name );

			if ( typeof data === "string" ) {
				try {
					data = data === "true" ? true :
						data === "false" ? false :
						data === "null" ? null :

						// Only convert to a number if it doesn't change the string
						+data + "" === data ? +data :
						rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
				} catch ( e ) {}

				// Make sure we set the data so it isn't changed later
				dataUser.set( elem, key, data );
			} else {
				data = undefined;
			}
		}
		return data;
	}

	jQuery.extend( {
		hasData: function( elem ) {
			return dataUser.hasData( elem ) || dataPriv.hasData( elem );
		},

		data: function( elem, name, data ) {
			return dataUser.access( elem, name, data );
		},

		removeData: function( elem, name ) {
			dataUser.remove( elem, name );
		},

		// TODO: Now that all calls to _data and _removeData have been replaced
		// with direct calls to dataPriv methods, these can be deprecated.
		_data: function( elem, name, data ) {
			return dataPriv.access( elem, name, data );
		},

		_removeData: function( elem, name ) {
			dataPriv.remove( elem, name );
		}
	} );

	jQuery.fn.extend( {
		data: function( key, value ) {
			var i, name, data,
				elem = this[ 0 ],
				attrs = elem && elem.attributes;

			// Gets all values
			if ( key === undefined ) {
				if ( this.length ) {
					data = dataUser.get( elem );

					if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
						i = attrs.length;
						while ( i-- ) {

							// Support: IE11+
							// The attrs elements can be null (#14894)
							if ( attrs[ i ] ) {
								name = attrs[ i ].name;
								if ( name.indexOf( "data-" ) === 0 ) {
									name = jQuery.camelCase( name.slice( 5 ) );
									dataAttr( elem, name, data[ name ] );
								}
							}
						}
						dataPriv.set( elem, "hasDataAttrs", true );
					}
				}

				return data;
			}

			// Sets multiple values
			if ( typeof key === "object" ) {
				return this.each( function() {
					dataUser.set( this, key );
				} );
			}

			return access( this, function( value ) {
				var data, camelKey;

				// The calling jQuery object (element matches) is not empty
				// (and therefore has an element appears at this[ 0 ]) and the
				// `value` parameter was not undefined. An empty jQuery object
				// will result in `undefined` for elem = this[ 0 ] which will
				// throw an exception if an attempt to read a data cache is made.
				if ( elem && value === undefined ) {

					// Attempt to get data from the cache
					// with the key as-is
					data = dataUser.get( elem, key ) ||

						// Try to find dashed key if it exists (gh-2779)
						// This is for 2.2.x only
						dataUser.get( elem, key.replace( rmultiDash, "-$&" ).toLowerCase() );

					if ( data !== undefined ) {
						return data;
					}

					camelKey = jQuery.camelCase( key );

					// Attempt to get data from the cache
					// with the key camelized
					data = dataUser.get( elem, camelKey );
					if ( data !== undefined ) {
						return data;
					}

					// Attempt to "discover" the data in
					// HTML5 custom data-* attrs
					data = dataAttr( elem, camelKey, undefined );
					if ( data !== undefined ) {
						return data;
					}

					// We tried really hard, but the data doesn't exist.
					return;
				}

				// Set the data...
				camelKey = jQuery.camelCase( key );
				this.each( function() {

					// First, attempt to store a copy or reference of any
					// data that might've been store with a camelCased key.
					var data = dataUser.get( this, camelKey );

					// For HTML5 data-* attribute interop, we have to
					// store property names with dashes in a camelCase form.
					// This might not apply to all properties...*
					dataUser.set( this, camelKey, value );

					// *... In the case of properties that might _actually_
					// have dashes, we need to also store a copy of that
					// unchanged property.
					if ( key.indexOf( "-" ) > -1 && data !== undefined ) {
						dataUser.set( this, key, value );
					}
				} );
			}, null, value, arguments.length > 1, null, true );
		},

		removeData: function( key ) {
			return this.each( function() {
				dataUser.remove( this, key );
			} );
		}
	} );


	jQuery.extend( {
		queue: function( elem, type, data ) {
			var queue;

			if ( elem ) {
				type = ( type || "fx" ) + "queue";
				queue = dataPriv.get( elem, type );

				// Speed up dequeue by getting out quickly if this is just a lookup
				if ( data ) {
					if ( !queue || jQuery.isArray( data ) ) {
						queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
					} else {
						queue.push( data );
					}
				}
				return queue || [];
			}
		},

		dequeue: function( elem, type ) {
			type = type || "fx";

			var queue = jQuery.queue( elem, type ),
				startLength = queue.length,
				fn = queue.shift(),
				hooks = jQuery._queueHooks( elem, type ),
				next = function() {
					jQuery.dequeue( elem, type );
				};

			// If the fx queue is dequeued, always remove the progress sentinel
			if ( fn === "inprogress" ) {
				fn = queue.shift();
				startLength--;
			}

			if ( fn ) {

				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if ( type === "fx" ) {
					queue.unshift( "inprogress" );
				}

				// Clear up the last queue stop function
				delete hooks.stop;
				fn.call( elem, next, hooks );
			}

			if ( !startLength && hooks ) {
				hooks.empty.fire();
			}
		},

		// Not public - generate a queueHooks object, or return the current one
		_queueHooks: function( elem, type ) {
			var key = type + "queueHooks";
			return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
				empty: jQuery.Callbacks( "once memory" ).add( function() {
					dataPriv.remove( elem, [ type + "queue", key ] );
				} )
			} );
		}
	} );

	jQuery.fn.extend( {
		queue: function( type, data ) {
			var setter = 2;

			if ( typeof type !== "string" ) {
				data = type;
				type = "fx";
				setter--;
			}

			if ( arguments.length < setter ) {
				return jQuery.queue( this[ 0 ], type );
			}

			return data === undefined ?
				this :
				this.each( function() {
					var queue = jQuery.queue( this, type, data );

					// Ensure a hooks for this queue
					jQuery._queueHooks( this, type );

					if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
						jQuery.dequeue( this, type );
					}
				} );
		},
		dequeue: function( type ) {
			return this.each( function() {
				jQuery.dequeue( this, type );
			} );
		},
		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		},

		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function( type, obj ) {
			var tmp,
				count = 1,
				defer = jQuery.Deferred(),
				elements = this,
				i = this.length,
				resolve = function() {
					if ( !( --count ) ) {
						defer.resolveWith( elements, [ elements ] );
					}
				};

			if ( typeof type !== "string" ) {
				obj = type;
				type = undefined;
			}
			type = type || "fx";

			while ( i-- ) {
				tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
				if ( tmp && tmp.empty ) {
					count++;
					tmp.empty.add( resolve );
				}
			}
			resolve();
			return defer.promise( obj );
		}
	} );
	var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

	var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


	var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

	var isHidden = function( elem, el ) {

			// isHidden might be called from jQuery#filter function;
			// in that case, element will be second argument
			elem = el || elem;
			return jQuery.css( elem, "display" ) === "none" ||
				!jQuery.contains( elem.ownerDocument, elem );
		};



	function adjustCSS( elem, prop, valueParts, tween ) {
		var adjusted,
			scale = 1,
			maxIterations = 20,
			currentValue = tween ?
				function() { return tween.cur(); } :
				function() { return jQuery.css( elem, prop, "" ); },
			initial = currentValue(),
			unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

			// Starting value computation is required for potential unit mismatches
			initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
				rcssNum.exec( jQuery.css( elem, prop ) );

		if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

			// Trust units reported by jQuery.css
			unit = unit || initialInUnit[ 3 ];

			// Make sure we update the tween properties later on
			valueParts = valueParts || [];

			// Iteratively approximate from a nonzero starting point
			initialInUnit = +initial || 1;

			do {

				// If previous iteration zeroed out, double until we get *something*.
				// Use string for doubling so we don't accidentally see scale as unchanged below
				scale = scale || ".5";

				// Adjust and apply
				initialInUnit = initialInUnit / scale;
				jQuery.style( elem, prop, initialInUnit + unit );

			// Update scale, tolerating zero or NaN from tween.cur()
			// Break the loop if scale is unchanged or perfect, or if we've just had enough.
			} while (
				scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
			);
		}

		if ( valueParts ) {
			initialInUnit = +initialInUnit || +initial || 0;

			// Apply relative offset (+=/-=) if specified
			adjusted = valueParts[ 1 ] ?
				initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
				+valueParts[ 2 ];
			if ( tween ) {
				tween.unit = unit;
				tween.start = initialInUnit;
				tween.end = adjusted;
			}
		}
		return adjusted;
	}
	var rcheckableType = ( /^(?:checkbox|radio)$/i );

	var rtagName = ( /<([\w:-]+)/ );

	var rscriptType = ( /^$|\/(?:java|ecma)script/i );



	// We have to close these tags to support XHTML (#13200)
	var wrapMap = {

		// Support: IE9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		// XHTML parsers do not magically insert elements in the
		// same way that tag soup parsers do. So we cannot shorten
		// this by omitting <tbody> or other required elements.
		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

	// Support: IE9
	wrapMap.optgroup = wrapMap.option;

	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;


	function getAll( context, tag ) {

		// Support: IE9-11+
		// Use typeof to avoid zero-argument method invocation on host objects (#15151)
		var ret = typeof context.getElementsByTagName !== "undefined" ?
				context.getElementsByTagName( tag || "*" ) :
				typeof context.querySelectorAll !== "undefined" ?
					context.querySelectorAll( tag || "*" ) :
				[];

		return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
			jQuery.merge( [ context ], ret ) :
			ret;
	}


	// Mark scripts as having already been evaluated
	function setGlobalEval( elems, refElements ) {
		var i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			dataPriv.set(
				elems[ i ],
				"globalEval",
				!refElements || dataPriv.get( refElements[ i ], "globalEval" )
			);
		}
	}


	var rhtml = /<|&#?\w+;/;

	function buildFragment( elems, context, scripts, selection, ignored ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {

					// Support: Android<4.1, PhantomJS<2
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: Android<4.1, PhantomJS<2
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( ( elem = nodes[ i++ ] ) ) {

			// Skip elements already in the context collection (trac-4087)
			if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
				if ( ignored ) {
					ignored.push( elem );
				}
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( ( elem = tmp[ j++ ] ) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	}


	( function() {
		var fragment = document.createDocumentFragment(),
			div = fragment.appendChild( document.createElement( "div" ) ),
			input = document.createElement( "input" );

		// Support: Android 4.0-4.3, Safari<=5.1
		// Check state lost if the name is set (#11217)
		// Support: Windows Web Apps (WWA)
		// `name` and `type` must use .setAttribute for WWA (#14901)
		input.setAttribute( "type", "radio" );
		input.setAttribute( "checked", "checked" );
		input.setAttribute( "name", "t" );

		div.appendChild( input );

		// Support: Safari<=5.1, Android<4.2
		// Older WebKit doesn't clone checked state correctly in fragments
		support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

		// Support: IE<=11+
		// Make sure textarea (and checkbox) defaultValue is properly cloned
		div.innerHTML = "<textarea>x</textarea>";
		support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
	} )();


	var
		rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
		rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

	function returnTrue() {
		return true;
	}

	function returnFalse() {
		return false;
	}

	// Support: IE9
	// See #13393 for more info
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch ( err ) { }
	}

	function on( elem, types, selector, data, fn, one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {

			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {

				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				on( elem, type, selector, data, types[ type ], one );
			}
			return elem;
		}

		if ( data == null && fn == null ) {

			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {

				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {

				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return elem;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {

				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};

			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return elem.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		} );
	}

	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	jQuery.event = {

		global: {},

		add: function( elem, types, handler, data, selector ) {

			var handleObjIn, eventHandle, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.get( elem );

			// Don't attach events to noData or text/comment nodes (but allow plain objects)
			if ( !elemData ) {
				return;
			}

			// Caller can pass in an object of custom data in lieu of the handler
			if ( handler.handler ) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}

			// Make sure that the handler has a unique ID, used to find/remove it later
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}

			// Init the element's event structure and main handler, if this is the first
			if ( !( events = elemData.events ) ) {
				events = elemData.events = {};
			}
			if ( !( eventHandle = elemData.handle ) ) {
				eventHandle = elemData.handle = function( e ) {

					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
						jQuery.event.dispatch.apply( elem, arguments ) : undefined;
				};
			}

			// Handle multiple events separated by a space
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// There *must* be a type, no attaching namespace-only handlers
				if ( !type ) {
					continue;
				}

				// If event changes its type, use the special event handlers for the changed type
				special = jQuery.event.special[ type ] || {};

				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;

				// Update special based on newly reset type
				special = jQuery.event.special[ type ] || {};

				// handleObj is passed to all event handlers
				handleObj = jQuery.extend( {
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
					namespace: namespaces.join( "." )
				}, handleObjIn );

				// Init the event handler queue if we're the first
				if ( !( handlers = events[ type ] ) ) {
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;

					// Only use addEventListener if the special events handler returns false
					if ( !special.setup ||
						special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle );
						}
					}
				}

				if ( special.add ) {
					special.add.call( elem, handleObj );

					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}

				// Add to the element's handler list, delegates in front
				if ( selector ) {
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}

				// Keep track of which events have ever been used, for event optimization
				jQuery.event.global[ type ] = true;
			}

		},

		// Detach an event or set of events from an element
		remove: function( elem, types, handler, selector, mappedTypes ) {

			var j, origCount, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

			if ( !elemData || !( events = elemData.events ) ) {
				return;
			}

			// Once for each type.namespace in types; type may be omitted
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {
						jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}

				special = jQuery.event.special[ type ] || {};
				type = ( selector ? special.delegateType : special.bindType ) || type;
				handlers = events[ type ] || [];
				tmp = tmp[ 2 ] &&
					new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

				// Remove matching events
				origCount = j = handlers.length;
				while ( j-- ) {
					handleObj = handlers[ j ];

					if ( ( mappedTypes || origType === handleObj.origType ) &&
						( !handler || handler.guid === handleObj.guid ) &&
						( !tmp || tmp.test( handleObj.namespace ) ) &&
						( !selector || selector === handleObj.selector ||
							selector === "**" && handleObj.selector ) ) {
						handlers.splice( j, 1 );

						if ( handleObj.selector ) {
							handlers.delegateCount--;
						}
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}

				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if ( origCount && !handlers.length ) {
					if ( !special.teardown ||
						special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

						jQuery.removeEvent( elem, type, elemData.handle );
					}

					delete events[ type ];
				}
			}

			// Remove data and the expando if it's no longer used
			if ( jQuery.isEmptyObject( events ) ) {
				dataPriv.remove( elem, "handle events" );
			}
		},

		dispatch: function( event ) {

			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( event );

			var i, j, ret, matched, handleObj,
				handlerQueue = [],
				args = slice.call( arguments ),
				handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
				special = jQuery.event.special[ event.type ] || {};

			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[ 0 ] = event;
			event.delegateTarget = this;

			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}

			// Determine handlers
			handlerQueue = jQuery.event.handlers.call( this, event, handlers );

			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
				event.currentTarget = matched.elem;

				j = 0;
				while ( ( handleObj = matched.handlers[ j++ ] ) &&
					!event.isImmediatePropagationStopped() ) {

					// Triggered event must either 1) have no namespace, or 2) have namespace(s)
					// a subset or equal to those in the bound event (both can have no namespace).
					if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

						event.handleObj = handleObj;
						event.data = handleObj.data;

						ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
							handleObj.handler ).apply( matched.elem, args );

						if ( ret !== undefined ) {
							if ( ( event.result = ret ) === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}

			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}

			return event.result;
		},

		handlers: function( event, handlers ) {
			var i, matches, sel, handleObj,
				handlerQueue = [],
				delegateCount = handlers.delegateCount,
				cur = event.target;

			// Support (at least): Chrome, IE9
			// Find delegate handlers
			// Black-hole SVG <use> instance trees (#13180)
			//
			// Support: Firefox<=42+
			// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
			if ( delegateCount && cur.nodeType &&
				( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

				for ( ; cur !== this; cur = cur.parentNode || this ) {

					// Don't check non-elements (#13208)
					// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
					if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
						matches = [];
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];

							// Don't conflict with Object.prototype properties (#13203)
							sel = handleObj.selector + " ";

							if ( matches[ sel ] === undefined ) {
								matches[ sel ] = handleObj.needsContext ?
									jQuery( sel, this ).index( cur ) > -1 :
									jQuery.find( sel, this, null, [ cur ] ).length;
							}
							if ( matches[ sel ] ) {
								matches.push( handleObj );
							}
						}
						if ( matches.length ) {
							handlerQueue.push( { elem: cur, handlers: matches } );
						}
					}
				}
			}

			// Add the remaining (directly-bound) handlers
			if ( delegateCount < handlers.length ) {
				handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
			}

			return handlerQueue;
		},

		// Includes some event props shared by KeyEvent and MouseEvent
		props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
			"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

		fixHooks: {},

		keyHooks: {
			props: "char charCode key keyCode".split( " " ),
			filter: function( event, original ) {

				// Add which for key events
				if ( event.which == null ) {
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}

				return event;
			}
		},

		mouseHooks: {
			props: ( "button buttons clientX clientY offsetX offsetY pageX pageY " +
				"screenX screenY toElement" ).split( " " ),
			filter: function( event, original ) {
				var eventDoc, doc, body,
					button = original.button;

				// Calculate pageX/Y if missing and clientX/Y available
				if ( event.pageX == null && original.clientX != null ) {
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;

					event.pageX = original.clientX +
						( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
						( doc && doc.clientLeft || body && body.clientLeft || 0 );
					event.pageY = original.clientY +
						( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
						( doc && doc.clientTop  || body && body.clientTop  || 0 );
				}

				// Add which for click: 1 === left; 2 === middle; 3 === right
				// Note: button is not normalized, so don't use it
				if ( !event.which && button !== undefined ) {
					event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				}

				return event;
			}
		},

		fix: function( event ) {
			if ( event[ jQuery.expando ] ) {
				return event;
			}

			// Create a writable copy of the event object and normalize some properties
			var i, prop, copy,
				type = event.type,
				originalEvent = event,
				fixHook = this.fixHooks[ type ];

			if ( !fixHook ) {
				this.fixHooks[ type ] = fixHook =
					rmouseEvent.test( type ) ? this.mouseHooks :
					rkeyEvent.test( type ) ? this.keyHooks :
					{};
			}
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

			event = new jQuery.Event( originalEvent );

			i = copy.length;
			while ( i-- ) {
				prop = copy[ i ];
				event[ prop ] = originalEvent[ prop ];
			}

			// Support: Cordova 2.5 (WebKit) (#13255)
			// All events should have a target; Cordova deviceready doesn't
			if ( !event.target ) {
				event.target = document;
			}

			// Support: Safari 6.0+, Chrome<28
			// Target should not be a text node (#504, #13143)
			if ( event.target.nodeType === 3 ) {
				event.target = event.target.parentNode;
			}

			return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
		},

		special: {
			load: {

				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {

				// Fire native event if possible so blur/focus sequence is correct
				trigger: function() {
					if ( this !== safeActiveElement() && this.focus ) {
						this.focus();
						return false;
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function() {
					if ( this === safeActiveElement() && this.blur ) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {

				// For checkbox, fire native event so checked state will be right
				trigger: function() {
					if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
						this.click();
						return false;
					}
				},

				// For cross-browser consistency, don't fire native .click() on links
				_default: function( event ) {
					return jQuery.nodeName( event.target, "a" );
				}
			},

			beforeunload: {
				postDispatch: function( event ) {

					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if ( event.result !== undefined && event.originalEvent ) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		}
	};

	jQuery.removeEvent = function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	};

	jQuery.Event = function( src, props ) {

		// Allow instantiation without the 'new' keyword
		if ( !( this instanceof jQuery.Event ) ) {
			return new jQuery.Event( src, props );
		}

		// Event object
		if ( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented ||
					src.defaultPrevented === undefined &&

					// Support: Android<4.0
					src.returnValue === false ?
				returnTrue :
				returnFalse;

		// Event type
		} else {
			this.type = src;
		}

		// Put explicitly provided properties onto the event object
		if ( props ) {
			jQuery.extend( this, props );
		}

		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || jQuery.now();

		// Mark it as fixed
		this[ jQuery.expando ] = true;
	};

	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		constructor: jQuery.Event,
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,

		preventDefault: function() {
			var e = this.originalEvent;

			this.isDefaultPrevented = returnTrue;

			if ( e ) {
				e.preventDefault();
			}
		},
		stopPropagation: function() {
			var e = this.originalEvent;

			this.isPropagationStopped = returnTrue;

			if ( e ) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			var e = this.originalEvent;

			this.isImmediatePropagationStopped = returnTrue;

			if ( e ) {
				e.stopImmediatePropagation();
			}

			this.stopPropagation();
		}
	};

	// Create mouseenter/leave events using mouseover/out and event-time checks
	// so that event delegation works in jQuery.
	// Do the same for pointerenter/pointerleave and pointerover/pointerout
	//
	// Support: Safari 7 only
	// Safari sends mouseenter too often; see:
	// https://code.google.com/p/chromium/issues/detail?id=470258
	// for the description of the bug (it existed in older Chrome versions as well).
	jQuery.each( {
		mouseenter: "mouseover",
		mouseleave: "mouseout",
		pointerenter: "pointerover",
		pointerleave: "pointerout"
	}, function( orig, fix ) {
		jQuery.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,

			handle: function( event ) {
				var ret,
					target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj;

				// For mouseenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	} );

	jQuery.fn.extend( {
		on: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn );
		},
		one: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn, 1 );
		},
		off: function( types, selector, fn ) {
			var handleObj, type;
			if ( types && types.preventDefault && types.handleObj ) {

				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ?
						handleObj.origType + "." + handleObj.namespace :
						handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			if ( typeof types === "object" ) {

				// ( types-object [, selector] )
				for ( type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			if ( selector === false || typeof selector === "function" ) {

				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if ( fn === false ) {
				fn = returnFalse;
			}
			return this.each( function() {
				jQuery.event.remove( this, types, fn, selector );
			} );
		}
	} );


	var
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

		// Support: IE 10-11, Edge 10240+
		// In IE/Edge using regex groups here causes severe slowdowns.
		// See https://connect.microsoft.com/IE/feedback/details/1736512/
		rnoInnerhtml = /<script|<style|<link/i,

		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		rscriptTypeMasked = /^true\/(.*)/,
		rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

	// Manipulating tables requires a tbody
	function manipulationTarget( elem, content ) {
		return jQuery.nodeName( elem, "table" ) &&
			jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

			elem.getElementsByTagName( "tbody" )[ 0 ] ||
				elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
			elem;
	}

	// Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript( elem ) {
		elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
		return elem;
	}
	function restoreScript( elem ) {
		var match = rscriptTypeMasked.exec( elem.type );

		if ( match ) {
			elem.type = match[ 1 ];
		} else {
			elem.removeAttribute( "type" );
		}

		return elem;
	}

	function cloneCopyEvent( src, dest ) {
		var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

		if ( dest.nodeType !== 1 ) {
			return;
		}

		// 1. Copy private data: events, handlers, etc.
		if ( dataPriv.hasData( src ) ) {
			pdataOld = dataPriv.access( src );
			pdataCur = dataPriv.set( dest, pdataOld );
			events = pdataOld.events;

			if ( events ) {
				delete pdataCur.handle;
				pdataCur.events = {};

				for ( type in events ) {
					for ( i = 0, l = events[ type ].length; i < l; i++ ) {
						jQuery.event.add( dest, type, events[ type ][ i ] );
					}
				}
			}
		}

		// 2. Copy user data
		if ( dataUser.hasData( src ) ) {
			udataOld = dataUser.access( src );
			udataCur = jQuery.extend( {}, udataOld );

			dataUser.set( dest, udataCur );
		}
	}

	// Fix IE bugs, see support tests
	function fixInput( src, dest ) {
		var nodeName = dest.nodeName.toLowerCase();

		// Fails to persist the checked state of a cloned checkbox or radio button.
		if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
			dest.checked = src.checked;

		// Fails to return the selected option to the default selected state when cloning options
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;
		}
	}

	function domManip( collection, args, callback, ignored ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = collection.length,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return collection.each( function( index ) {
				var self = collection.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				domManip( self, args, callback, ignored );
			} );
		}

		if ( l ) {
			fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			// Require either new content or an interest in ignored elements to invoke the callback
			if ( first || ignored ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item
				// instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {

							// Support: Android<4.1, PhantomJS<2
							// push.apply(_, arraylike) throws on ancient WebKit
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( collection[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!dataPriv.access( node, "globalEval" ) &&
							jQuery.contains( doc, node ) ) {

							if ( node.src ) {

								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return collection;
	}

	function remove( elem, selector, keepData ) {
		var node,
			nodes = selector ? jQuery.filter( selector, elem ) : elem,
			i = 0;

		for ( ; ( node = nodes[ i ] ) != null; i++ ) {
			if ( !keepData && node.nodeType === 1 ) {
				jQuery.cleanData( getAll( node ) );
			}

			if ( node.parentNode ) {
				if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
					setGlobalEval( getAll( node, "script" ) );
				}
				node.parentNode.removeChild( node );
			}
		}

		return elem;
	}

	jQuery.extend( {
		htmlPrefilter: function( html ) {
			return html.replace( rxhtmlTag, "<$1></$2>" );
		},

		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var i, l, srcElements, destElements,
				clone = elem.cloneNode( true ),
				inPage = jQuery.contains( elem.ownerDocument, elem );

			// Fix IE cloning issues
			if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
					!jQuery.isXMLDoc( elem ) ) {

				// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
				destElements = getAll( clone );
				srcElements = getAll( elem );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					fixInput( srcElements[ i ], destElements[ i ] );
				}
			}

			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				if ( deepDataAndEvents ) {
					srcElements = srcElements || getAll( elem );
					destElements = destElements || getAll( clone );

					for ( i = 0, l = srcElements.length; i < l; i++ ) {
						cloneCopyEvent( srcElements[ i ], destElements[ i ] );
					}
				} else {
					cloneCopyEvent( elem, clone );
				}
			}

			// Preserve script evaluation history
			destElements = getAll( clone, "script" );
			if ( destElements.length > 0 ) {
				setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
			}

			// Return the cloned set
			return clone;
		},

		cleanData: function( elems ) {
			var data, elem, type,
				special = jQuery.event.special,
				i = 0;

			for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
				if ( acceptData( elem ) ) {
					if ( ( data = elem[ dataPriv.expando ] ) ) {
						if ( data.events ) {
							for ( type in data.events ) {
								if ( special[ type ] ) {
									jQuery.event.remove( elem, type );

								// This is a shortcut to avoid jQuery.event.remove's overhead
								} else {
									jQuery.removeEvent( elem, type, data.handle );
								}
							}
						}

						// Support: Chrome <= 35-45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataPriv.expando ] = undefined;
					}
					if ( elem[ dataUser.expando ] ) {

						// Support: Chrome <= 35-45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataUser.expando ] = undefined;
					}
				}
			}
		}
	} );

	jQuery.fn.extend( {

		// Keep domManip exposed until 3.0 (gh-2225)
		domManip: domManip,

		detach: function( selector ) {
			return remove( this, selector, true );
		},

		remove: function( selector ) {
			return remove( this, selector );
		},

		text: function( value ) {
			return access( this, function( value ) {
				return value === undefined ?
					jQuery.text( this ) :
					this.empty().each( function() {
						if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
							this.textContent = value;
						}
					} );
			}, null, value, arguments.length );
		},

		append: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.appendChild( elem );
				}
			} );
		},

		prepend: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.insertBefore( elem, target.firstChild );
				}
			} );
		},

		before: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this );
				}
			} );
		},

		after: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				}
			} );
		},

		empty: function() {
			var elem,
				i = 0;

			for ( ; ( elem = this[ i ] ) != null; i++ ) {
				if ( elem.nodeType === 1 ) {

					// Prevent memory leaks
					jQuery.cleanData( getAll( elem, false ) );

					// Remove any remaining nodes
					elem.textContent = "";
				}
			}

			return this;
		},

		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

			return this.map( function() {
				return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
			} );
		},

		html: function( value ) {
			return access( this, function( value ) {
				var elem = this[ 0 ] || {},
					i = 0,
					l = this.length;

				if ( value === undefined && elem.nodeType === 1 ) {
					return elem.innerHTML;
				}

				// See if we can take a shortcut and just use innerHTML
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

					value = jQuery.htmlPrefilter( value );

					try {
						for ( ; i < l; i++ ) {
							elem = this[ i ] || {};

							// Remove element nodes and prevent memory leaks
							if ( elem.nodeType === 1 ) {
								jQuery.cleanData( getAll( elem, false ) );
								elem.innerHTML = value;
							}
						}

						elem = 0;

					// If using innerHTML throws an exception, use the fallback method
					} catch ( e ) {}
				}

				if ( elem ) {
					this.empty().append( value );
				}
			}, null, value, arguments.length );
		},

		replaceWith: function() {
			var ignored = [];

			// Make the changes, replacing each non-ignored context element with the new content
			return domManip( this, arguments, function( elem ) {
				var parent = this.parentNode;

				if ( jQuery.inArray( this, ignored ) < 0 ) {
					jQuery.cleanData( getAll( this ) );
					if ( parent ) {
						parent.replaceChild( elem, this );
					}
				}

			// Force callback invocation
			}, ignored );
		}
	} );

	jQuery.each( {
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var elems,
				ret = [],
				insert = jQuery( selector ),
				last = insert.length - 1,
				i = 0;

			for ( ; i <= last; i++ ) {
				elems = i === last ? this : this.clone( true );
				jQuery( insert[ i ] )[ original ]( elems );

				// Support: QtWebKit
				// .get() because push.apply(_, arraylike) throws
				push.apply( ret, elems.get() );
			}

			return this.pushStack( ret );
		};
	} );


	var iframe,
		elemdisplay = {

			// Support: Firefox
			// We have to pre-define these values for FF (#10227)
			HTML: "block",
			BODY: "block"
		};

	/**
	 * Retrieve the actual display of a element
	 * @param {String} name nodeName of the element
	 * @param {Object} doc Document object
	 */

	// Called only from within defaultDisplay
	function actualDisplay( name, doc ) {
		var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

			display = jQuery.css( elem[ 0 ], "display" );

		// We don't have any data stored on the element,
		// so use "detach" method as fast way to get rid of the element
		elem.detach();

		return display;
	}

	/**
	 * Try to determine the default display value of an element
	 * @param {String} nodeName
	 */
	function defaultDisplay( nodeName ) {
		var doc = document,
			display = elemdisplay[ nodeName ];

		if ( !display ) {
			display = actualDisplay( nodeName, doc );

			// If the simple way fails, read from inside an iframe
			if ( display === "none" || !display ) {

				// Use the already-created iframe if possible
				iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
					.appendTo( doc.documentElement );

				// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
				doc = iframe[ 0 ].contentDocument;

				// Support: IE
				doc.write();
				doc.close();

				display = actualDisplay( nodeName, doc );
				iframe.detach();
			}

			// Store the correct default display
			elemdisplay[ nodeName ] = display;
		}

		return display;
	}
	var rmargin = ( /^margin/ );

	var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

	var getStyles = function( elem ) {

			// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
			// IE throws on elements created in popups
			// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
			var view = elem.ownerDocument.defaultView;

			if ( !view || !view.opener ) {
				view = window;
			}

			return view.getComputedStyle( elem );
		};

	var swap = function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	};


	var documentElement = document.documentElement;



	( function() {
		var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
			container = document.createElement( "div" ),
			div = document.createElement( "div" );

		// Finish early in limited (non-browser) environments
		if ( !div.style ) {
			return;
		}

		// Support: IE9-11+
		// Style of cloned element affects source element cloned (#8908)
		div.style.backgroundClip = "content-box";
		div.cloneNode( true ).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";

		container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
			"padding:0;margin-top:1px;position:absolute";
		container.appendChild( div );

		// Executing both pixelPosition & boxSizingReliable tests require only one layout
		// so they're executed at the same time to save the second computation.
		function computeStyleTests() {
			div.style.cssText =

				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;" +
				"position:relative;display:block;" +
				"margin:auto;border:1px;padding:1px;" +
				"top:1%;width:50%";
			div.innerHTML = "";
			documentElement.appendChild( container );

			var divStyle = window.getComputedStyle( div );
			pixelPositionVal = divStyle.top !== "1%";
			reliableMarginLeftVal = divStyle.marginLeft === "2px";
			boxSizingReliableVal = divStyle.width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = divStyle.marginRight === "4px";

			documentElement.removeChild( container );
		}

		jQuery.extend( support, {
			pixelPosition: function() {

				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computeStyleTests();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return boxSizingReliableVal;
			},
			pixelMarginRight: function() {

				// Support: Android 4.0-4.3
				// We're checking for boxSizingReliableVal here instead of pixelMarginRightVal
				// since that compresses better and they're computed together anyway.
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return pixelMarginRightVal;
			},
			reliableMarginLeft: function() {

				// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return reliableMarginLeftVal;
			},
			reliableMarginRight: function() {

				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );

				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =

					// Support: Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;box-sizing:content-box;" +
					"display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				documentElement.appendChild( container );

				ret = !parseFloat( window.getComputedStyle( marginDiv ).marginRight );

				documentElement.removeChild( container );
				div.removeChild( marginDiv );

				return ret;
			}
		} );
	} )();


	function curCSS( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: IE9
		// getPropertyValue is only needed for .css('filter') (#12537)
		if ( computed ) {

			// A tribute to the "awesome hack by Dean Edwards"
			// Android Browser returns percentage for some values,
			// but width seems to be reliably pixels.
			// This is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret !== undefined ?

			// Support: IE9-11+
			// IE returns zIndex value as an integer.
			ret + "" :
			ret;
	}


	function addGetHookIf( conditionFn, hookFn ) {

		// Define the hook, we'll check on the first run if it's really needed.
		return {
			get: function() {
				if ( conditionFn() ) {

					// Hook not needed (or it's not possible to use it due
					// to missing dependency), remove it.
					delete this.get;
					return;
				}

				// Hook needed; redefine it so that the support test is not executed again.
				return ( this.get = hookFn ).apply( this, arguments );
			}
		};
	}


	var

		// Swappable if display is none or starts with table
		// except "table", "table-cell", or "table-caption"
		// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,

		cssShow = { position: "absolute", visibility: "hidden", display: "block" },
		cssNormalTransform = {
			letterSpacing: "0",
			fontWeight: "400"
		},

		cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
		emptyStyle = document.createElement( "div" ).style;

	// Return a css property mapped to a potentially vendor prefixed property
	function vendorPropName( name ) {

		// Shortcut for names that are not vendor prefixed
		if ( name in emptyStyle ) {
			return name;
		}

		// Check for vendor prefixed names
		var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
			i = cssPrefixes.length;

		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in emptyStyle ) {
				return name;
			}
		}
	}

	function setPositiveNumber( elem, value, subtract ) {

		// Any relative (+/-) values have already been
		// normalized at this point
		var matches = rcssNum.exec( value );
		return matches ?

			// Guard against undefined "subtract", e.g., when used as in cssHooks
			Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
			value;
	}

	function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
		var i = extra === ( isBorderBox ? "border" : "content" ) ?

			// If we already have the right measurement, avoid augmentation
			4 :

			// Otherwise initialize for horizontal or vertical properties
			name === "width" ? 1 : 0,

			val = 0;

		for ( ; i < 4; i += 2 ) {

			// Both box models exclude margin, so add it if we want it
			if ( extra === "margin" ) {
				val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
			}

			if ( isBorderBox ) {

				// border-box includes padding, so remove it if we want content
				if ( extra === "content" ) {
					val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
				}

				// At this point, extra isn't border nor margin, so remove border
				if ( extra !== "margin" ) {
					val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			} else {

				// At this point, extra isn't content, so add padding
				val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

				// At this point, extra isn't content nor padding, so add border
				if ( extra !== "padding" ) {
					val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			}
		}

		return val;
	}

	function getWidthOrHeight( elem, name, extra ) {

		// Start with offset property, which is equivalent to the border-box value
		var valueIsBorderBox = true,
			val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
			styles = getStyles( elem ),
			isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Support: IE11 only
		// In IE 11 fullscreen elements inside of an iframe have
		// 100x too small dimensions (gh-1764).
		if ( document.msFullscreenElement && window.top !== window ) {

			// Support: IE11 only
			// Running getBoundingClientRect on a disconnected node
			// in IE throws an error.
			if ( elem.getClientRects().length ) {
				val = Math.round( elem.getBoundingClientRect()[ name ] * 100 );
			}
		}

		// Some non-html elements return undefined for offsetWidth, so check for null/undefined
		// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
		// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
		if ( val <= 0 || val == null ) {

			// Fall back to computed then uncomputed css if necessary
			val = curCSS( elem, name, styles );
			if ( val < 0 || val == null ) {
				val = elem.style[ name ];
			}

			// Computed unit is not pixels. Stop here and return.
			if ( rnumnonpx.test( val ) ) {
				return val;
			}

			// Check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable elem.style
			valueIsBorderBox = isBorderBox &&
				( support.boxSizingReliable() || val === elem.style[ name ] );

			// Normalize "", auto, and prepare for extra
			val = parseFloat( val ) || 0;
		}

		// Use the active box-sizing model to add/subtract irrelevant styles
		return ( val +
			augmentWidthOrHeight(
				elem,
				name,
				extra || ( isBorderBox ? "border" : "content" ),
				valueIsBorderBox,
				styles
			)
		) + "px";
	}

	function showHide( elements, show ) {
		var display, elem, hidden,
			values = [],
			index = 0,
			length = elements.length;

		for ( ; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}

			values[ index ] = dataPriv.get( elem, "olddisplay" );
			display = elem.style.display;
			if ( show ) {

				// Reset the inline display of this element to learn if it is
				// being hidden by cascaded rules or not
				if ( !values[ index ] && display === "none" ) {
					elem.style.display = "";
				}

				// Set elements which have been overridden with display: none
				// in a stylesheet to whatever the default browser style is
				// for such an element
				if ( elem.style.display === "" && isHidden( elem ) ) {
					values[ index ] = dataPriv.access(
						elem,
						"olddisplay",
						defaultDisplay( elem.nodeName )
					);
				}
			} else {
				hidden = isHidden( elem );

				if ( display !== "none" || !hidden ) {
					dataPriv.set(
						elem,
						"olddisplay",
						hidden ? display : jQuery.css( elem, "display" )
					);
				}
			}
		}

		// Set the display of most of the elements in a second loop
		// to avoid the constant reflow
		for ( index = 0; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}
			if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
				elem.style.display = show ? values[ index ] || "" : "none";
			}
		}

		return elements;
	}

	jQuery.extend( {

		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function( elem, computed ) {
					if ( computed ) {

						// We should always get a number back from opacity
						var ret = curCSS( elem, "opacity" );
						return ret === "" ? "1" : ret;
					}
				}
			}
		},

		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			"animationIterationCount": true,
			"columnCount": true,
			"fillOpacity": true,
			"flexGrow": true,
			"flexShrink": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"order": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},

		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {
			"float": "cssFloat"
		},

		// Get and set the style property on a DOM Node
		style: function( elem, name, value, extra ) {

			// Don't set styles on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
				return;
			}

			// Make sure that we're working with the right name
			var ret, type, hooks,
				origName = jQuery.camelCase( name ),
				style = elem.style;

			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

			// Gets hook for the prefixed version, then unprefixed version
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// Check if we're setting a value
			if ( value !== undefined ) {
				type = typeof value;

				// Convert "+=" or "-=" to relative numbers (#7345)
				if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
					value = adjustCSS( elem, name, ret );

					// Fixes bug #9237
					type = "number";
				}

				// Make sure that null and NaN values aren't set (#7116)
				if ( value == null || value !== value ) {
					return;
				}

				// If a number was passed in, add the unit (except for certain CSS properties)
				if ( type === "number" ) {
					value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
				}

				// Support: IE9-11+
				// background-* props affect original clone's values
				if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
					style[ name ] = "inherit";
				}

				// If a hook was provided, use that value, otherwise just set the specified value
				if ( !hooks || !( "set" in hooks ) ||
					( value = hooks.set( elem, value, extra ) ) !== undefined ) {

					style[ name ] = value;
				}

			} else {

				// If a hook was provided get the non-computed value from there
				if ( hooks && "get" in hooks &&
					( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

					return ret;
				}

				// Otherwise just get the value from the style object
				return style[ name ];
			}
		},

		css: function( elem, name, extra, styles ) {
			var val, num, hooks,
				origName = jQuery.camelCase( name );

			// Make sure that we're working with the right name
			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

			// Try prefixed name followed by the unprefixed name
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// If a hook was provided get the computed value from there
			if ( hooks && "get" in hooks ) {
				val = hooks.get( elem, true, extra );
			}

			// Otherwise, if a way to get the computed value exists, use that
			if ( val === undefined ) {
				val = curCSS( elem, name, styles );
			}

			// Convert "normal" to computed value
			if ( val === "normal" && name in cssNormalTransform ) {
				val = cssNormalTransform[ name ];
			}

			// Make numeric if forced or a qualifier was provided and val looks numeric
			if ( extra === "" || extra ) {
				num = parseFloat( val );
				return extra === true || isFinite( num ) ? num || 0 : val;
			}
			return val;
		}
	} );

	jQuery.each( [ "height", "width" ], function( i, name ) {
		jQuery.cssHooks[ name ] = {
			get: function( elem, computed, extra ) {
				if ( computed ) {

					// Certain elements can have dimension info if we invisibly show them
					// but it must have a current display style that would benefit
					return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
						elem.offsetWidth === 0 ?
							swap( elem, cssShow, function() {
								return getWidthOrHeight( elem, name, extra );
							} ) :
							getWidthOrHeight( elem, name, extra );
				}
			},

			set: function( elem, value, extra ) {
				var matches,
					styles = extra && getStyles( elem ),
					subtract = extra && augmentWidthOrHeight(
						elem,
						name,
						extra,
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
						styles
					);

				// Convert to pixels if value adjustment is needed
				if ( subtract && ( matches = rcssNum.exec( value ) ) &&
					( matches[ 3 ] || "px" ) !== "px" ) {

					elem.style[ name ] = value;
					value = jQuery.css( elem, name );
				}

				return setPositiveNumber( elem, value, subtract );
			}
		};
	} );

	jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
		function( elem, computed ) {
			if ( computed ) {
				return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} )
					) + "px";
			}
		}
	);

	// Support: Android 2.3
	jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
		function( elem, computed ) {
			if ( computed ) {
				return swap( elem, { "display": "inline-block" },
					curCSS, [ elem, "marginRight" ] );
			}
		}
	);

	// These hooks are used by animate to expand properties
	jQuery.each( {
		margin: "",
		padding: "",
		border: "Width"
	}, function( prefix, suffix ) {
		jQuery.cssHooks[ prefix + suffix ] = {
			expand: function( value ) {
				var i = 0,
					expanded = {},

					// Assumes a single number if not a string
					parts = typeof value === "string" ? value.split( " " ) : [ value ];

				for ( ; i < 4; i++ ) {
					expanded[ prefix + cssExpand[ i ] + suffix ] =
						parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
				}

				return expanded;
			}
		};

		if ( !rmargin.test( prefix ) ) {
			jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
		}
	} );

	jQuery.fn.extend( {
		css: function( name, value ) {
			return access( this, function( elem, name, value ) {
				var styles, len,
					map = {},
					i = 0;

				if ( jQuery.isArray( name ) ) {
					styles = getStyles( elem );
					len = name.length;

					for ( ; i < len; i++ ) {
						map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
					}

					return map;
				}

				return value !== undefined ?
					jQuery.style( elem, name, value ) :
					jQuery.css( elem, name );
			}, name, value, arguments.length > 1 );
		},
		show: function() {
			return showHide( this, true );
		},
		hide: function() {
			return showHide( this );
		},
		toggle: function( state ) {
			if ( typeof state === "boolean" ) {
				return state ? this.show() : this.hide();
			}

			return this.each( function() {
				if ( isHidden( this ) ) {
					jQuery( this ).show();
				} else {
					jQuery( this ).hide();
				}
			} );
		}
	} );


	function Tween( elem, options, prop, end, easing ) {
		return new Tween.prototype.init( elem, options, prop, end, easing );
	}
	jQuery.Tween = Tween;

	Tween.prototype = {
		constructor: Tween,
		init: function( elem, options, prop, end, easing, unit ) {
			this.elem = elem;
			this.prop = prop;
			this.easing = easing || jQuery.easing._default;
			this.options = options;
			this.start = this.now = this.cur();
			this.end = end;
			this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
		},
		cur: function() {
			var hooks = Tween.propHooks[ this.prop ];

			return hooks && hooks.get ?
				hooks.get( this ) :
				Tween.propHooks._default.get( this );
		},
		run: function( percent ) {
			var eased,
				hooks = Tween.propHooks[ this.prop ];

			if ( this.options.duration ) {
				this.pos = eased = jQuery.easing[ this.easing ](
					percent, this.options.duration * percent, 0, 1, this.options.duration
				);
			} else {
				this.pos = eased = percent;
			}
			this.now = ( this.end - this.start ) * eased + this.start;

			if ( this.options.step ) {
				this.options.step.call( this.elem, this.now, this );
			}

			if ( hooks && hooks.set ) {
				hooks.set( this );
			} else {
				Tween.propHooks._default.set( this );
			}
			return this;
		}
	};

	Tween.prototype.init.prototype = Tween.prototype;

	Tween.propHooks = {
		_default: {
			get: function( tween ) {
				var result;

				// Use a property on the element directly when it is not a DOM element,
				// or when there is no matching style property that exists.
				if ( tween.elem.nodeType !== 1 ||
					tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
					return tween.elem[ tween.prop ];
				}

				// Passing an empty string as a 3rd parameter to .css will automatically
				// attempt a parseFloat and fallback to a string if the parse fails.
				// Simple values such as "10px" are parsed to Float;
				// complex values such as "rotate(1rad)" are returned as-is.
				result = jQuery.css( tween.elem, tween.prop, "" );

				// Empty strings, null, undefined and "auto" are converted to 0.
				return !result || result === "auto" ? 0 : result;
			},
			set: function( tween ) {

				// Use step hook for back compat.
				// Use cssHook if its there.
				// Use .style if available and use plain properties where available.
				if ( jQuery.fx.step[ tween.prop ] ) {
					jQuery.fx.step[ tween.prop ]( tween );
				} else if ( tween.elem.nodeType === 1 &&
					( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
						jQuery.cssHooks[ tween.prop ] ) ) {
					jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
				} else {
					tween.elem[ tween.prop ] = tween.now;
				}
			}
		}
	};

	// Support: IE9
	// Panic based approach to setting things on disconnected nodes
	Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
		set: function( tween ) {
			if ( tween.elem.nodeType && tween.elem.parentNode ) {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	};

	jQuery.easing = {
		linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p * Math.PI ) / 2;
		},
		_default: "swing"
	};

	jQuery.fx = Tween.prototype.init;

	// Back Compat <1.8 extension point
	jQuery.fx.step = {};




	var
		fxNow, timerId,
		rfxtypes = /^(?:toggle|show|hide)$/,
		rrun = /queueHooks$/;

	// Animations created synchronously will run synchronously
	function createFxNow() {
		window.setTimeout( function() {
			fxNow = undefined;
		} );
		return ( fxNow = jQuery.now() );
	}

	// Generate parameters to create a standard animation
	function genFx( type, includeWidth ) {
		var which,
			i = 0,
			attrs = { height: type };

		// If we include width, step value is 1 to do all cssExpand values,
		// otherwise step value is 2 to skip over Left and Right
		includeWidth = includeWidth ? 1 : 0;
		for ( ; i < 4 ; i += 2 - includeWidth ) {
			which = cssExpand[ i ];
			attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
		}

		if ( includeWidth ) {
			attrs.opacity = attrs.width = type;
		}

		return attrs;
	}

	function createTween( value, prop, animation ) {
		var tween,
			collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

				// We're done with this property
				return tween;
			}
		}
	}

	function defaultPrefilter( elem, props, opts ) {
		/* jshint validthis: true */
		var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
			anim = this,
			orig = {},
			style = elem.style,
			hidden = elem.nodeType && isHidden( elem ),
			dataShow = dataPriv.get( elem, "fxshow" );

		// Handle queue: false promises
		if ( !opts.queue ) {
			hooks = jQuery._queueHooks( elem, "fx" );
			if ( hooks.unqueued == null ) {
				hooks.unqueued = 0;
				oldfire = hooks.empty.fire;
				hooks.empty.fire = function() {
					if ( !hooks.unqueued ) {
						oldfire();
					}
				};
			}
			hooks.unqueued++;

			anim.always( function() {

				// Ensure the complete handler is called before this completes
				anim.always( function() {
					hooks.unqueued--;
					if ( !jQuery.queue( elem, "fx" ).length ) {
						hooks.empty.fire();
					}
				} );
			} );
		}

		// Height/width overflow pass
		if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

			// Make sure that nothing sneaks out
			// Record all 3 overflow attributes because IE9-10 do not
			// change the overflow attribute when overflowX and
			// overflowY are set to the same value
			opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

			// Set display property to inline-block for height/width
			// animations on inline elements that are having width/height animated
			display = jQuery.css( elem, "display" );

			// Test default display if display is currently "none"
			checkDisplay = display === "none" ?
				dataPriv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

			if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
				style.display = "inline-block";
			}
		}

		if ( opts.overflow ) {
			style.overflow = "hidden";
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}

		// show/hide pass
		for ( prop in props ) {
			value = props[ prop ];
			if ( rfxtypes.exec( value ) ) {
				delete props[ prop ];
				toggle = toggle || value === "toggle";
				if ( value === ( hidden ? "hide" : "show" ) ) {

					// If there is dataShow left over from a stopped hide or show
					// and we are going to proceed with show, we should pretend to be hidden
					if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
						hidden = true;
					} else {
						continue;
					}
				}
				orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

			// Any non-fx value stops us from restoring the original display value
			} else {
				display = undefined;
			}
		}

		if ( !jQuery.isEmptyObject( orig ) ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", {} );
			}

			// Store state if its toggle - enables .stop().toggle() to "reverse"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}
			if ( hidden ) {
				jQuery( elem ).show();
			} else {
				anim.done( function() {
					jQuery( elem ).hide();
				} );
			}
			anim.done( function() {
				var prop;

				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
			for ( prop in orig ) {
				tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

				if ( !( prop in dataShow ) ) {
					dataShow[ prop ] = tween.start;
					if ( hidden ) {
						tween.end = tween.start;
						tween.start = prop === "width" || prop === "height" ? 1 : 0;
					}
				}
			}

		// If this is a noop like .hide().hide(), restore an overwritten display value
		} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
			style.display = display;
		}
	}

	function propFilter( props, specialEasing ) {
		var index, name, easing, value, hooks;

		// camelCase, specialEasing and expand cssHook pass
		for ( index in props ) {
			name = jQuery.camelCase( index );
			easing = specialEasing[ name ];
			value = props[ index ];
			if ( jQuery.isArray( value ) ) {
				easing = value[ 1 ];
				value = props[ index ] = value[ 0 ];
			}

			if ( index !== name ) {
				props[ name ] = value;
				delete props[ index ];
			}

			hooks = jQuery.cssHooks[ name ];
			if ( hooks && "expand" in hooks ) {
				value = hooks.expand( value );
				delete props[ name ];

				// Not quite $.extend, this won't overwrite existing keys.
				// Reusing 'index' because we have the correct "name"
				for ( index in value ) {
					if ( !( index in props ) ) {
						props[ index ] = value[ index ];
						specialEasing[ index ] = easing;
					}
				}
			} else {
				specialEasing[ name ] = easing;
			}
		}
	}

	function Animation( elem, properties, options ) {
		var result,
			stopped,
			index = 0,
			length = Animation.prefilters.length,
			deferred = jQuery.Deferred().always( function() {

				// Don't match elem in the :animated selector
				delete tick.elem;
			} ),
			tick = function() {
				if ( stopped ) {
					return false;
				}
				var currentTime = fxNow || createFxNow(),
					remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

					// Support: Android 2.3
					// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
					temp = remaining / animation.duration || 0,
					percent = 1 - temp,
					index = 0,
					length = animation.tweens.length;

				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( percent );
				}

				deferred.notifyWith( elem, [ animation, percent, remaining ] );

				if ( percent < 1 && length ) {
					return remaining;
				} else {
					deferred.resolveWith( elem, [ animation ] );
					return false;
				}
			},
			animation = deferred.promise( {
				elem: elem,
				props: jQuery.extend( {}, properties ),
				opts: jQuery.extend( true, {
					specialEasing: {},
					easing: jQuery.easing._default
				}, options ),
				originalProperties: properties,
				originalOptions: options,
				startTime: fxNow || createFxNow(),
				duration: options.duration,
				tweens: [],
				createTween: function( prop, end ) {
					var tween = jQuery.Tween( elem, animation.opts, prop, end,
							animation.opts.specialEasing[ prop ] || animation.opts.easing );
					animation.tweens.push( tween );
					return tween;
				},
				stop: function( gotoEnd ) {
					var index = 0,

						// If we are going to the end, we want to run all the tweens
						// otherwise we skip this part
						length = gotoEnd ? animation.tweens.length : 0;
					if ( stopped ) {
						return this;
					}
					stopped = true;
					for ( ; index < length ; index++ ) {
						animation.tweens[ index ].run( 1 );
					}

					// Resolve when we played the last frame; otherwise, reject
					if ( gotoEnd ) {
						deferred.notifyWith( elem, [ animation, 1, 0 ] );
						deferred.resolveWith( elem, [ animation, gotoEnd ] );
					} else {
						deferred.rejectWith( elem, [ animation, gotoEnd ] );
					}
					return this;
				}
			} ),
			props = animation.props;

		propFilter( props, animation.opts.specialEasing );

		for ( ; index < length ; index++ ) {
			result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
			if ( result ) {
				if ( jQuery.isFunction( result.stop ) ) {
					jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
						jQuery.proxy( result.stop, result );
				}
				return result;
			}
		}

		jQuery.map( props, createTween, animation );

		if ( jQuery.isFunction( animation.opts.start ) ) {
			animation.opts.start.call( elem, animation );
		}

		jQuery.fx.timer(
			jQuery.extend( tick, {
				elem: elem,
				anim: animation,
				queue: animation.opts.queue
			} )
		);

		// attach callbacks from options
		return animation.progress( animation.opts.progress )
			.done( animation.opts.done, animation.opts.complete )
			.fail( animation.opts.fail )
			.always( animation.opts.always );
	}

	jQuery.Animation = jQuery.extend( Animation, {
		tweeners: {
			"*": [ function( prop, value ) {
				var tween = this.createTween( prop, value );
				adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
				return tween;
			} ]
		},

		tweener: function( props, callback ) {
			if ( jQuery.isFunction( props ) ) {
				callback = props;
				props = [ "*" ];
			} else {
				props = props.match( rnotwhite );
			}

			var prop,
				index = 0,
				length = props.length;

			for ( ; index < length ; index++ ) {
				prop = props[ index ];
				Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
				Animation.tweeners[ prop ].unshift( callback );
			}
		},

		prefilters: [ defaultPrefilter ],

		prefilter: function( callback, prepend ) {
			if ( prepend ) {
				Animation.prefilters.unshift( callback );
			} else {
				Animation.prefilters.push( callback );
			}
		}
	} );

	jQuery.speed = function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ?
			opt.duration : opt.duration in jQuery.fx.speeds ?
				jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

		// Normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function() {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			}
		};

		return opt;
	};

	jQuery.fn.extend( {
		fadeTo: function( speed, to, easing, callback ) {

			// Show any hidden elements after setting opacity to 0
			return this.filter( isHidden ).css( "opacity", 0 ).show()

				// Animate to the value specified
				.end().animate( { opacity: to }, speed, easing, callback );
		},
		animate: function( prop, speed, easing, callback ) {
			var empty = jQuery.isEmptyObject( prop ),
				optall = jQuery.speed( speed, easing, callback ),
				doAnimation = function() {

					// Operate on a copy of prop so per-property easing won't be lost
					var anim = Animation( this, jQuery.extend( {}, prop ), optall );

					// Empty animations, or finishing resolves immediately
					if ( empty || dataPriv.get( this, "finish" ) ) {
						anim.stop( true );
					}
				};
				doAnimation.finish = doAnimation;

			return empty || optall.queue === false ?
				this.each( doAnimation ) :
				this.queue( optall.queue, doAnimation );
		},
		stop: function( type, clearQueue, gotoEnd ) {
			var stopQueue = function( hooks ) {
				var stop = hooks.stop;
				delete hooks.stop;
				stop( gotoEnd );
			};

			if ( typeof type !== "string" ) {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if ( clearQueue && type !== false ) {
				this.queue( type || "fx", [] );
			}

			return this.each( function() {
				var dequeue = true,
					index = type != null && type + "queueHooks",
					timers = jQuery.timers,
					data = dataPriv.get( this );

				if ( index ) {
					if ( data[ index ] && data[ index ].stop ) {
						stopQueue( data[ index ] );
					}
				} else {
					for ( index in data ) {
						if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
							stopQueue( data[ index ] );
						}
					}
				}

				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this &&
						( type == null || timers[ index ].queue === type ) ) {

						timers[ index ].anim.stop( gotoEnd );
						dequeue = false;
						timers.splice( index, 1 );
					}
				}

				// Start the next in the queue if the last step wasn't forced.
				// Timers currently will call their complete callbacks, which
				// will dequeue but only if they were gotoEnd.
				if ( dequeue || !gotoEnd ) {
					jQuery.dequeue( this, type );
				}
			} );
		},
		finish: function( type ) {
			if ( type !== false ) {
				type = type || "fx";
			}
			return this.each( function() {
				var index,
					data = dataPriv.get( this ),
					queue = data[ type + "queue" ],
					hooks = data[ type + "queueHooks" ],
					timers = jQuery.timers,
					length = queue ? queue.length : 0;

				// Enable finishing flag on private data
				data.finish = true;

				// Empty the queue first
				jQuery.queue( this, type, [] );

				if ( hooks && hooks.stop ) {
					hooks.stop.call( this, true );
				}

				// Look for any active animations, and finish them
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
						timers[ index ].anim.stop( true );
						timers.splice( index, 1 );
					}
				}

				// Look for any animations in the old queue and finish them
				for ( index = 0; index < length; index++ ) {
					if ( queue[ index ] && queue[ index ].finish ) {
						queue[ index ].finish.call( this );
					}
				}

				// Turn off finishing flag
				delete data.finish;
			} );
		}
	} );

	jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
		var cssFn = jQuery.fn[ name ];
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return speed == null || typeof speed === "boolean" ?
				cssFn.apply( this, arguments ) :
				this.animate( genFx( name, true ), speed, easing, callback );
		};
	} );

	// Generate shortcuts for custom animations
	jQuery.each( {
		slideDown: genFx( "show" ),
		slideUp: genFx( "hide" ),
		slideToggle: genFx( "toggle" ),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function( name, props ) {
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return this.animate( props, speed, easing, callback );
		};
	} );

	jQuery.timers = [];
	jQuery.fx.tick = function() {
		var timer,
			i = 0,
			timers = jQuery.timers;

		fxNow = jQuery.now();

		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];

			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
		fxNow = undefined;
	};

	jQuery.fx.timer = function( timer ) {
		jQuery.timers.push( timer );
		if ( timer() ) {
			jQuery.fx.start();
		} else {
			jQuery.timers.pop();
		}
	};

	jQuery.fx.interval = 13;
	jQuery.fx.start = function() {
		if ( !timerId ) {
			timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
		}
	};

	jQuery.fx.stop = function() {
		window.clearInterval( timerId );

		timerId = null;
	};

	jQuery.fx.speeds = {
		slow: 600,
		fast: 200,

		// Default speed
		_default: 400
	};


	// Based off of the plugin by Clint Helfers, with permission.
	// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
	jQuery.fn.delay = function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = window.setTimeout( next, time );
			hooks.stop = function() {
				window.clearTimeout( timeout );
			};
		} );
	};


	( function() {
		var input = document.createElement( "input" ),
			select = document.createElement( "select" ),
			opt = select.appendChild( document.createElement( "option" ) );

		input.type = "checkbox";

		// Support: iOS<=5.1, Android<=4.2+
		// Default value for a checkbox should be "on"
		support.checkOn = input.value !== "";

		// Support: IE<=11+
		// Must access selectedIndex to make default options select
		support.optSelected = opt.selected;

		// Support: Android<=2.3
		// Options inside disabled selects are incorrectly marked as disabled
		select.disabled = true;
		support.optDisabled = !opt.disabled;

		// Support: IE<=11+
		// An input loses its value after becoming a radio
		input = document.createElement( "input" );
		input.value = "t";
		input.type = "radio";
		support.radioValue = input.value === "t";
	} )();


	var boolHook,
		attrHandle = jQuery.expr.attrHandle;

	jQuery.fn.extend( {
		attr: function( name, value ) {
			return access( this, jQuery.attr, name, value, arguments.length > 1 );
		},

		removeAttr: function( name ) {
			return this.each( function() {
				jQuery.removeAttr( this, name );
			} );
		}
	} );

	jQuery.extend( {
		attr: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set attributes on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			// Fallback to prop when attributes are not supported
			if ( typeof elem.getAttribute === "undefined" ) {
				return jQuery.prop( elem, name, value );
			}

			// All attributes are lowercase
			// Grab necessary hook if one is defined
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
				name = name.toLowerCase();
				hooks = jQuery.attrHooks[ name ] ||
					( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
			}

			if ( value !== undefined ) {
				if ( value === null ) {
					jQuery.removeAttr( elem, name );
					return;
				}

				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				elem.setAttribute( name, value + "" );
				return value;
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ? undefined : ret;
		},

		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( !support.radioValue && value === "radio" &&
						jQuery.nodeName( elem, "input" ) ) {
						var val = elem.value;
						elem.setAttribute( "type", value );
						if ( val ) {
							elem.value = val;
						}
						return value;
					}
				}
			}
		},

		removeAttr: function( elem, value ) {
			var name, propName,
				i = 0,
				attrNames = value && value.match( rnotwhite );

			if ( attrNames && elem.nodeType === 1 ) {
				while ( ( name = attrNames[ i++ ] ) ) {
					propName = jQuery.propFix[ name ] || name;

					// Boolean attributes get special treatment (#10870)
					if ( jQuery.expr.match.bool.test( name ) ) {

						// Set corresponding property to false
						elem[ propName ] = false;
					}

					elem.removeAttribute( name );
				}
			}
		}
	} );

	// Hooks for boolean attributes
	boolHook = {
		set: function( elem, value, name ) {
			if ( value === false ) {

				// Remove boolean attributes when set to false
				jQuery.removeAttr( elem, name );
			} else {
				elem.setAttribute( name, name );
			}
			return name;
		}
	};
	jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
		var getter = attrHandle[ name ] || jQuery.find.attr;

		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} );




	var rfocusable = /^(?:input|select|textarea|button)$/i,
		rclickable = /^(?:a|area)$/i;

	jQuery.fn.extend( {
		prop: function( name, value ) {
			return access( this, jQuery.prop, name, value, arguments.length > 1 );
		},

		removeProp: function( name ) {
			return this.each( function() {
				delete this[ jQuery.propFix[ name ] || name ];
			} );
		}
	} );

	jQuery.extend( {
		prop: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set properties on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

				// Fix name and attach hooks
				name = jQuery.propFix[ name ] || name;
				hooks = jQuery.propHooks[ name ];
			}

			if ( value !== undefined ) {
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				return ( elem[ name ] = value );
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			return elem[ name ];
		},

		propHooks: {
			tabIndex: {
				get: function( elem ) {

					// elem.tabIndex doesn't always return the
					// correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					// Use proper attribute retrieval(#12072)
					var tabindex = jQuery.find.attr( elem, "tabindex" );

					return tabindex ?
						parseInt( tabindex, 10 ) :
						rfocusable.test( elem.nodeName ) ||
							rclickable.test( elem.nodeName ) && elem.href ?
								0 :
								-1;
				}
			}
		},

		propFix: {
			"for": "htmlFor",
			"class": "className"
		}
	} );

	// Support: IE <=11 only
	// Accessing the selectedIndex property
	// forces the browser to respect setting selected
	// on the option
	// The getter ensures a default option is selected
	// when in an optgroup
	if ( !support.optSelected ) {
		jQuery.propHooks.selected = {
			get: function( elem ) {
				var parent = elem.parentNode;
				if ( parent && parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
				return null;
			},
			set: function( elem ) {
				var parent = elem.parentNode;
				if ( parent ) {
					parent.selectedIndex;

					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
			}
		};
	}

	jQuery.each( [
		"tabIndex",
		"readOnly",
		"maxLength",
		"cellSpacing",
		"cellPadding",
		"rowSpan",
		"colSpan",
		"useMap",
		"frameBorder",
		"contentEditable"
	], function() {
		jQuery.propFix[ this.toLowerCase() ] = this;
	} );




	var rclass = /[\t\r\n\f]/g;

	function getClass( elem ) {
		return elem.getAttribute && elem.getAttribute( "class" ) || "";
	}

	jQuery.fn.extend( {
		addClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			if ( typeof value === "string" && value ) {
				classes = value.match( rnotwhite ) || [];

				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
					cur = elem.nodeType === 1 &&
						( " " + curValue + " " ).replace( rclass, " " );

					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
							if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
								cur += clazz + " ";
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}

			return this;
		},

		removeClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			if ( !arguments.length ) {
				return this.attr( "class", "" );
			}

			if ( typeof value === "string" && value ) {
				classes = value.match( rnotwhite ) || [];

				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );

					// This expression is here for better compressibility (see addClass)
					cur = elem.nodeType === 1 &&
						( " " + curValue + " " ).replace( rclass, " " );

					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {

							// Remove *all* instances
							while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
								cur = cur.replace( " " + clazz + " ", " " );
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}

			return this;
		},

		toggleClass: function( value, stateVal ) {
			var type = typeof value;

			if ( typeof stateVal === "boolean" && type === "string" ) {
				return stateVal ? this.addClass( value ) : this.removeClass( value );
			}

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( i ) {
					jQuery( this ).toggleClass(
						value.call( this, i, getClass( this ), stateVal ),
						stateVal
					);
				} );
			}

			return this.each( function() {
				var className, i, self, classNames;

				if ( type === "string" ) {

					// Toggle individual class names
					i = 0;
					self = jQuery( this );
					classNames = value.match( rnotwhite ) || [];

					while ( ( className = classNames[ i++ ] ) ) {

						// Check each className given, space separated list
						if ( self.hasClass( className ) ) {
							self.removeClass( className );
						} else {
							self.addClass( className );
						}
					}

				// Toggle whole class name
				} else if ( value === undefined || type === "boolean" ) {
					className = getClass( this );
					if ( className ) {

						// Store className if set
						dataPriv.set( this, "__className__", className );
					}

					// If the element has a class name or if we're passed `false`,
					// then remove the whole classname (if there was one, the above saved it).
					// Otherwise bring back whatever was previously saved (if anything),
					// falling back to the empty string if nothing was stored.
					if ( this.setAttribute ) {
						this.setAttribute( "class",
							className || value === false ?
							"" :
							dataPriv.get( this, "__className__" ) || ""
						);
					}
				}
			} );
		},

		hasClass: function( selector ) {
			var className, elem,
				i = 0;

			className = " " + selector + " ";
			while ( ( elem = this[ i++ ] ) ) {
				if ( elem.nodeType === 1 &&
					( " " + getClass( elem ) + " " ).replace( rclass, " " )
						.indexOf( className ) > -1
				) {
					return true;
				}
			}

			return false;
		}
	} );




	var rreturn = /\r/g,
		rspaces = /[\x20\t\r\n\f]+/g;

	jQuery.fn.extend( {
		val: function( value ) {
			var hooks, ret, isFunction,
				elem = this[ 0 ];

			if ( !arguments.length ) {
				if ( elem ) {
					hooks = jQuery.valHooks[ elem.type ] ||
						jQuery.valHooks[ elem.nodeName.toLowerCase() ];

					if ( hooks &&
						"get" in hooks &&
						( ret = hooks.get( elem, "value" ) ) !== undefined
					) {
						return ret;
					}

					ret = elem.value;

					return typeof ret === "string" ?

						// Handle most common string cases
						ret.replace( rreturn, "" ) :

						// Handle cases where value is null/undef or number
						ret == null ? "" : ret;
				}

				return;
			}

			isFunction = jQuery.isFunction( value );

			return this.each( function( i ) {
				var val;

				if ( this.nodeType !== 1 ) {
					return;
				}

				if ( isFunction ) {
					val = value.call( this, i, jQuery( this ).val() );
				} else {
					val = value;
				}

				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";

				} else if ( typeof val === "number" ) {
					val += "";

				} else if ( jQuery.isArray( val ) ) {
					val = jQuery.map( val, function( value ) {
						return value == null ? "" : value + "";
					} );
				}

				hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

				// If set returns undefined, fall back to normal setting
				if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
					this.value = val;
				}
			} );
		}
	} );

	jQuery.extend( {
		valHooks: {
			option: {
				get: function( elem ) {

					var val = jQuery.find.attr( elem, "value" );
					return val != null ?
						val :

						// Support: IE10-11+
						// option.text throws exceptions (#14686, #14858)
						// Strip and collapse whitespace
						// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
						jQuery.trim( jQuery.text( elem ) ).replace( rspaces, " " );
				}
			},
			select: {
				get: function( elem ) {
					var value, option,
						options = elem.options,
						index = elem.selectedIndex,
						one = elem.type === "select-one" || index < 0,
						values = one ? null : [],
						max = one ? index + 1 : options.length,
						i = index < 0 ?
							max :
							one ? index : 0;

					// Loop through all the selected options
					for ( ; i < max; i++ ) {
						option = options[ i ];

						// IE8-9 doesn't update selected after form reset (#2551)
						if ( ( option.selected || i === index ) &&

								// Don't return options that are disabled or in a disabled optgroup
								( support.optDisabled ?
									!option.disabled : option.getAttribute( "disabled" ) === null ) &&
								( !option.parentNode.disabled ||
									!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

							// Get the specific value for the option
							value = jQuery( option ).val();

							// We don't need an array for one selects
							if ( one ) {
								return value;
							}

							// Multi-Selects return an array
							values.push( value );
						}
					}

					return values;
				},

				set: function( elem, value ) {
					var optionSet, option,
						options = elem.options,
						values = jQuery.makeArray( value ),
						i = options.length;

					while ( i-- ) {
						option = options[ i ];
						if ( option.selected =
							jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
						) {
							optionSet = true;
						}
					}

					// Force browsers to behave consistently when non-matching value is set
					if ( !optionSet ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		}
	} );

	// Radios and checkboxes getter/setter
	jQuery.each( [ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			set: function( elem, value ) {
				if ( jQuery.isArray( value ) ) {
					return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
				}
			}
		};
		if ( !support.checkOn ) {
			jQuery.valHooks[ this ].get = function( elem ) {
				return elem.getAttribute( "value" ) === null ? "on" : elem.value;
			};
		}
	} );




	// Return jQuery for attributes-only inclusion


	var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

	jQuery.extend( jQuery.event, {

		trigger: function( event, data, elem, onlyHandlers ) {

			var i, cur, tmp, bubbleType, ontype, handle, special,
				eventPath = [ elem || document ],
				type = hasOwn.call( event, "type" ) ? event.type : event,
				namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

			cur = tmp = elem = elem || document;

			// Don't do events on text and comment nodes
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}

			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
				return;
			}

			if ( type.indexOf( "." ) > -1 ) {

				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split( "." );
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf( ":" ) < 0 && "on" + type;

			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[ jQuery.expando ] ?
				event :
				new jQuery.Event( type, typeof event === "object" && event );

			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join( "." );
			event.rnamespace = event.namespace ?
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
				null;

			// Clean up the event in case it is being reused
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ?
				[ event ] :
				jQuery.makeArray( data, [ event ] );

			// Allow special events to draw outside the lines
			special = jQuery.event.special[ type ] || {};
			if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}

			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

				bubbleType = special.delegateType || type;
				if ( !rfocusMorph.test( bubbleType + type ) ) {
					cur = cur.parentNode;
				}
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push( cur );
					tmp = cur;
				}

				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( tmp === ( elem.ownerDocument || document ) ) {
					eventPath.push( tmp.defaultView || tmp.parentWindow || window );
				}
			}

			// Fire handlers on the event path
			i = 0;
			while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

				event.type = i > 1 ?
					bubbleType :
					special.bindType || type;

				// jQuery handler
				handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
					dataPriv.get( cur, "handle" );
				if ( handle ) {
					handle.apply( cur, data );
				}

				// Native handler
				handle = ontype && cur[ ontype ];
				if ( handle && handle.apply && acceptData( cur ) ) {
					event.result = handle.apply( cur, data );
					if ( event.result === false ) {
						event.preventDefault();
					}
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {

				if ( ( !special._default ||
					special._default.apply( eventPath.pop(), data ) === false ) &&
					acceptData( elem ) ) {

					// Call a native DOM method on the target with the same name name as the event.
					// Don't do default actions on window, that's where global variables be (#6170)
					if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ ontype ];

						if ( tmp ) {
							elem[ ontype ] = null;
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;
						elem[ type ]();
						jQuery.event.triggered = undefined;

						if ( tmp ) {
							elem[ ontype ] = tmp;
						}
					}
				}
			}

			return event.result;
		},

		// Piggyback on a donor event to simulate a different one
		simulate: function( type, elem, event ) {
			var e = jQuery.extend(
				new jQuery.Event(),
				event,
				{
					type: type,
					isSimulated: true

					// Previously, `originalEvent: {}` was set here, so stopPropagation call
					// would not be triggered on donor event, since in our own
					// jQuery.event.stopPropagation function we had a check for existence of
					// originalEvent.stopPropagation method, so, consequently it would be a noop.
					//
					// But now, this "simulate" function is used only for events
					// for which stopPropagation() is noop, so there is no need for that anymore.
					//
					// For the 1.x branch though, guard for "click" and "submit"
					// events is still used, but was moved to jQuery.event.stopPropagation function
					// because `originalEvent` should point to the original event for the constancy
					// with other events and for more focused logic
				}
			);

			jQuery.event.trigger( e, null, elem );

			if ( e.isDefaultPrevented() ) {
				event.preventDefault();
			}
		}

	} );

	jQuery.fn.extend( {

		trigger: function( type, data ) {
			return this.each( function() {
				jQuery.event.trigger( type, data, this );
			} );
		},
		triggerHandler: function( type, data ) {
			var elem = this[ 0 ];
			if ( elem ) {
				return jQuery.event.trigger( type, data, elem, true );
			}
		}
	} );


	jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
		function( i, name ) {

		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	} );

	jQuery.fn.extend( {
		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	} );




	support.focusin = "onfocusin" in window;


	// Support: Firefox
	// Firefox doesn't have focus(in | out) events
	// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
	//
	// Support: Chrome, Safari
	// focus(in | out) events fire after focus & blur events,
	// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
	// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
	if ( !support.focusin ) {
		jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

			// Attach a single capturing handler on the document while someone wants focusin/focusout
			var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
			};

			jQuery.event.special[ fix ] = {
				setup: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix );

					if ( !attaches ) {
						doc.addEventListener( orig, handler, true );
					}
					dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
				},
				teardown: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix ) - 1;

					if ( !attaches ) {
						doc.removeEventListener( orig, handler, true );
						dataPriv.remove( doc, fix );

					} else {
						dataPriv.access( doc, fix, attaches );
					}
				}
			};
		} );
	}
	var location = window.location;

	var nonce = jQuery.now();

	var rquery = ( /\?/ );



	// Support: Android 2.3
	// Workaround failure to string-cast null input
	jQuery.parseJSON = function( data ) {
		return JSON.parse( data + "" );
	};


	// Cross-browser xml parsing
	jQuery.parseXML = function( data ) {
		var xml;
		if ( !data || typeof data !== "string" ) {
			return null;
		}

		// Support: IE9
		try {
			xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
		} catch ( e ) {
			xml = undefined;
		}

		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	};


	var
		rhash = /#.*$/,
		rts = /([?&])_=[^&]*/,
		rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

		// #7653, #8125, #8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
		rnoContent = /^(?:GET|HEAD)$/,
		rprotocol = /^\/\//,

		/* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */
		prefilters = {},

		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		transports = {},

		// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
		allTypes = "*/".concat( "*" ),

		// Anchor tag for parsing the document origin
		originAnchor = document.createElement( "a" );
		originAnchor.href = location.href;

	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports( structure ) {

		// dataTypeExpression is optional and defaults to "*"
		return function( dataTypeExpression, func ) {

			if ( typeof dataTypeExpression !== "string" ) {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}

			var dataType,
				i = 0,
				dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

			if ( jQuery.isFunction( func ) ) {

				// For each dataType in the dataTypeExpression
				while ( ( dataType = dataTypes[ i++ ] ) ) {

					// Prepend if requested
					if ( dataType[ 0 ] === "+" ) {
						dataType = dataType.slice( 1 ) || "*";
						( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

					// Otherwise append
					} else {
						( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
					}
				}
			}
		};
	}

	// Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

		var inspected = {},
			seekingTransport = ( structure === transports );

		function inspect( dataType ) {
			var selected;
			inspected[ dataType ] = true;
			jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
				var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
				if ( typeof dataTypeOrTransport === "string" &&
					!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

					options.dataTypes.unshift( dataTypeOrTransport );
					inspect( dataTypeOrTransport );
					return false;
				} else if ( seekingTransport ) {
					return !( selected = dataTypeOrTransport );
				}
			} );
			return selected;
		}

		return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
	}

	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	function ajaxExtend( target, src ) {
		var key, deep,
			flatOptions = jQuery.ajaxSettings.flatOptions || {};

		for ( key in src ) {
			if ( src[ key ] !== undefined ) {
				( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
			}
		}
		if ( deep ) {
			jQuery.extend( true, target, deep );
		}

		return target;
	}

	/* Handles responses to an ajax request:
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */
	function ajaxHandleResponses( s, jqXHR, responses ) {

		var ct, type, finalDataType, firstDataType,
			contents = s.contents,
			dataTypes = s.dataTypes;

		// Remove auto dataType and get content-type in the process
		while ( dataTypes[ 0 ] === "*" ) {
			dataTypes.shift();
			if ( ct === undefined ) {
				ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
			}
		}

		// Check if we're dealing with a known content-type
		if ( ct ) {
			for ( type in contents ) {
				if ( contents[ type ] && contents[ type ].test( ct ) ) {
					dataTypes.unshift( type );
					break;
				}
			}
		}

		// Check to see if we have a response for the expected dataType
		if ( dataTypes[ 0 ] in responses ) {
			finalDataType = dataTypes[ 0 ];
		} else {

			// Try convertible dataTypes
			for ( type in responses ) {
				if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
					finalDataType = type;
					break;
				}
				if ( !firstDataType ) {
					firstDataType = type;
				}
			}

			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}

		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if ( finalDataType ) {
			if ( finalDataType !== dataTypes[ 0 ] ) {
				dataTypes.unshift( finalDataType );
			}
			return responses[ finalDataType ];
		}
	}

	/* Chain conversions given the request and the original response
	 * Also sets the responseXXX fields on the jqXHR instance
	 */
	function ajaxConvert( s, response, jqXHR, isSuccess ) {
		var conv2, current, conv, tmp, prev,
			converters = {},

			// Work with a copy of dataTypes in case we need to modify it for conversion
			dataTypes = s.dataTypes.slice();

		// Create converters map with lowercased keys
		if ( dataTypes[ 1 ] ) {
			for ( conv in s.converters ) {
				converters[ conv.toLowerCase() ] = s.converters[ conv ];
			}
		}

		current = dataTypes.shift();

		// Convert to each sequential dataType
		while ( current ) {

			if ( s.responseFields[ current ] ) {
				jqXHR[ s.responseFields[ current ] ] = response;
			}

			// Apply the dataFilter if provided
			if ( !prev && isSuccess && s.dataFilter ) {
				response = s.dataFilter( response, s.dataType );
			}

			prev = current;
			current = dataTypes.shift();

			if ( current ) {

			// There's only work to do if current dataType is non-auto
				if ( current === "*" ) {

					current = prev;

				// Convert response if prev dataType is non-auto and differs from current
				} else if ( prev !== "*" && prev !== current ) {

					// Seek a direct converter
					conv = converters[ prev + " " + current ] || converters[ "* " + current ];

					// If none found, seek a pair
					if ( !conv ) {
						for ( conv2 in converters ) {

							// If conv2 outputs current
							tmp = conv2.split( " " );
							if ( tmp[ 1 ] === current ) {

								// If prev can be converted to accepted input
								conv = converters[ prev + " " + tmp[ 0 ] ] ||
									converters[ "* " + tmp[ 0 ] ];
								if ( conv ) {

									// Condense equivalence converters
									if ( conv === true ) {
										conv = converters[ conv2 ];

									// Otherwise, insert the intermediate dataType
									} else if ( converters[ conv2 ] !== true ) {
										current = tmp[ 0 ];
										dataTypes.unshift( tmp[ 1 ] );
									}
									break;
								}
							}
						}
					}

					// Apply converter (if not an equivalence)
					if ( conv !== true ) {

						// Unless errors are allowed to bubble, catch and return them
						if ( conv && s.throws ) {
							response = conv( response );
						} else {
							try {
								response = conv( response );
							} catch ( e ) {
								return {
									state: "parsererror",
									error: conv ? e : "No conversion from " + prev + " to " + current
								};
							}
						}
					}
				}
			}
		}

		return { state: "success", data: response };
	}

	jQuery.extend( {

		// Counter for holding the number of active queries
		active: 0,

		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},

		ajaxSettings: {
			url: location.href,
			type: "GET",
			isLocal: rlocalProtocol.test( location.protocol ),
			global: true,
			processData: true,
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			/*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			throws: false,
			traditional: false,
			headers: {},
			*/

			accepts: {
				"*": allTypes,
				text: "text/plain",
				html: "text/html",
				xml: "application/xml, text/xml",
				json: "application/json, text/javascript"
			},

			contents: {
				xml: /\bxml\b/,
				html: /\bhtml/,
				json: /\bjson\b/
			},

			responseFields: {
				xml: "responseXML",
				text: "responseText",
				json: "responseJSON"
			},

			// Data converters
			// Keys separate source (or catchall "*") and destination types with a single space
			converters: {

				// Convert anything to text
				"* text": String,

				// Text to html (true = no transformation)
				"text html": true,

				// Evaluate text as a json expression
				"text json": jQuery.parseJSON,

				// Parse text as xml
				"text xml": jQuery.parseXML
			},

			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				url: true,
				context: true
			}
		},

		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup: function( target, settings ) {
			return settings ?

				// Building a settings object
				ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

				// Extending ajaxSettings
				ajaxExtend( jQuery.ajaxSettings, target );
		},

		ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
		ajaxTransport: addToPrefiltersOrTransports( transports ),

		// Main method
		ajax: function( url, options ) {

			// If url is an object, simulate pre-1.5 signature
			if ( typeof url === "object" ) {
				options = url;
				url = undefined;
			}

			// Force options to be an object
			options = options || {};

			var transport,

				// URL without anti-cache param
				cacheURL,

				// Response headers
				responseHeadersString,
				responseHeaders,

				// timeout handle
				timeoutTimer,

				// Url cleanup var
				urlAnchor,

				// To know if global events are to be dispatched
				fireGlobals,

				// Loop variable
				i,

				// Create the final options object
				s = jQuery.ajaxSetup( {}, options ),

				// Callbacks context
				callbackContext = s.context || s,

				// Context for global events is callbackContext if it is a DOM node or jQuery collection
				globalEventContext = s.context &&
					( callbackContext.nodeType || callbackContext.jquery ) ?
						jQuery( callbackContext ) :
						jQuery.event,

				// Deferreds
				deferred = jQuery.Deferred(),
				completeDeferred = jQuery.Callbacks( "once memory" ),

				// Status-dependent callbacks
				statusCode = s.statusCode || {},

				// Headers (they are sent all at once)
				requestHeaders = {},
				requestHeadersNames = {},

				// The jqXHR state
				state = 0,

				// Default abort message
				strAbort = "canceled",

				// Fake xhr
				jqXHR = {
					readyState: 0,

					// Builds headers hashtable if needed
					getResponseHeader: function( key ) {
						var match;
						if ( state === 2 ) {
							if ( !responseHeaders ) {
								responseHeaders = {};
								while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
									responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
								}
							}
							match = responseHeaders[ key.toLowerCase() ];
						}
						return match == null ? null : match;
					},

					// Raw string
					getAllResponseHeaders: function() {
						return state === 2 ? responseHeadersString : null;
					},

					// Caches the header
					setRequestHeader: function( name, value ) {
						var lname = name.toLowerCase();
						if ( !state ) {
							name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
							requestHeaders[ name ] = value;
						}
						return this;
					},

					// Overrides response content-type header
					overrideMimeType: function( type ) {
						if ( !state ) {
							s.mimeType = type;
						}
						return this;
					},

					// Status-dependent callbacks
					statusCode: function( map ) {
						var code;
						if ( map ) {
							if ( state < 2 ) {
								for ( code in map ) {

									// Lazy-add the new callback in a way that preserves old ones
									statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
								}
							} else {

								// Execute the appropriate callbacks
								jqXHR.always( map[ jqXHR.status ] );
							}
						}
						return this;
					},

					// Cancel the request
					abort: function( statusText ) {
						var finalText = statusText || strAbort;
						if ( transport ) {
							transport.abort( finalText );
						}
						done( 0, finalText );
						return this;
					}
				};

			// Attach deferreds
			deferred.promise( jqXHR ).complete = completeDeferred.add;
			jqXHR.success = jqXHR.done;
			jqXHR.error = jqXHR.fail;

			// Remove hash character (#7531: and string promotion)
			// Add protocol if not provided (prefilters might expect it)
			// Handle falsy url in the settings object (#10093: consistency with old signature)
			// We also use the url parameter if available
			s.url = ( ( url || s.url || location.href ) + "" ).replace( rhash, "" )
				.replace( rprotocol, location.protocol + "//" );

			// Alias method option to type as per ticket #12004
			s.type = options.method || options.type || s.method || s.type;

			// Extract dataTypes list
			s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

			// A cross-domain request is in order when the origin doesn't match the current origin.
			if ( s.crossDomain == null ) {
				urlAnchor = document.createElement( "a" );

				// Support: IE8-11+
				// IE throws exception if url is malformed, e.g. http://example.com:80x/
				try {
					urlAnchor.href = s.url;

					// Support: IE8-11+
					// Anchor's host property isn't correctly set when s.url is relative
					urlAnchor.href = urlAnchor.href;
					s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
						urlAnchor.protocol + "//" + urlAnchor.host;
				} catch ( e ) {

					// If there is an error parsing the URL, assume it is crossDomain,
					// it can be rejected by the transport if it is invalid
					s.crossDomain = true;
				}
			}

			// Convert data if not already a string
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				s.data = jQuery.param( s.data, s.traditional );
			}

			// Apply prefilters
			inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

			// If request was aborted inside a prefilter, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// We can fire global events as of now if asked to
			// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
			fireGlobals = jQuery.event && s.global;

			// Watch for a new set of requests
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger( "ajaxStart" );
			}

			// Uppercase the type
			s.type = s.type.toUpperCase();

			// Determine if request has content
			s.hasContent = !rnoContent.test( s.type );

			// Save the URL in case we're toying with the If-Modified-Since
			// and/or If-None-Match header later on
			cacheURL = s.url;

			// More options handling for requests with no content
			if ( !s.hasContent ) {

				// If data is available, append data to url
				if ( s.data ) {
					cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}

				// Add anti-cache in url if needed
				if ( s.cache === false ) {
					s.url = rts.test( cacheURL ) ?

						// If there is already a '_' parameter, set its value
						cacheURL.replace( rts, "$1_=" + nonce++ ) :

						// Otherwise add one to the end
						cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
				}
			}

			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if ( s.ifModified ) {
				if ( jQuery.lastModified[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
				}
				if ( jQuery.etag[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
				}
			}

			// Set the correct header, if data is being sent
			if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
				jqXHR.setRequestHeader( "Content-Type", s.contentType );
			}

			// Set the Accepts header for the server, depending on the dataType
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
					s.accepts[ s.dataTypes[ 0 ] ] +
						( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
					s.accepts[ "*" ]
			);

			// Check for headers option
			for ( i in s.headers ) {
				jqXHR.setRequestHeader( i, s.headers[ i ] );
			}

			// Allow custom headers/mimetypes and early abort
			if ( s.beforeSend &&
				( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

				// Abort if not done already and return
				return jqXHR.abort();
			}

			// Aborting is no longer a cancellation
			strAbort = "abort";

			// Install callbacks on deferreds
			for ( i in { success: 1, error: 1, complete: 1 } ) {
				jqXHR[ i ]( s[ i ] );
			}

			// Get transport
			transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

			// If no transport, we auto-abort
			if ( !transport ) {
				done( -1, "No Transport" );
			} else {
				jqXHR.readyState = 1;

				// Send global event
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
				}

				// If request was aborted inside ajaxSend, stop there
				if ( state === 2 ) {
					return jqXHR;
				}

				// Timeout
				if ( s.async && s.timeout > 0 ) {
					timeoutTimer = window.setTimeout( function() {
						jqXHR.abort( "timeout" );
					}, s.timeout );
				}

				try {
					state = 1;
					transport.send( requestHeaders, done );
				} catch ( e ) {

					// Propagate exception as error if not done
					if ( state < 2 ) {
						done( -1, e );

					// Simply rethrow otherwise
					} else {
						throw e;
					}
				}
			}

			// Callback for when everything is done
			function done( status, nativeStatusText, responses, headers ) {
				var isSuccess, success, error, response, modified,
					statusText = nativeStatusText;

				// Called once
				if ( state === 2 ) {
					return;
				}

				// State is "done" now
				state = 2;

				// Clear timeout if it exists
				if ( timeoutTimer ) {
					window.clearTimeout( timeoutTimer );
				}

				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;

				// Cache response headers
				responseHeadersString = headers || "";

				// Set readyState
				jqXHR.readyState = status > 0 ? 4 : 0;

				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;

				// Get response data
				if ( responses ) {
					response = ajaxHandleResponses( s, jqXHR, responses );
				}

				// Convert no matter what (that way responseXXX fields are always set)
				response = ajaxConvert( s, response, jqXHR, isSuccess );

				// If successful, handle type chaining
				if ( isSuccess ) {

					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if ( s.ifModified ) {
						modified = jqXHR.getResponseHeader( "Last-Modified" );
						if ( modified ) {
							jQuery.lastModified[ cacheURL ] = modified;
						}
						modified = jqXHR.getResponseHeader( "etag" );
						if ( modified ) {
							jQuery.etag[ cacheURL ] = modified;
						}
					}

					// if no content
					if ( status === 204 || s.type === "HEAD" ) {
						statusText = "nocontent";

					// if not modified
					} else if ( status === 304 ) {
						statusText = "notmodified";

					// If we have data, let's convert it
					} else {
						statusText = response.state;
						success = response.data;
						error = response.error;
						isSuccess = !error;
					}
				} else {

					// Extract error from statusText and normalize for non-aborts
					error = statusText;
					if ( status || !statusText ) {
						statusText = "error";
						if ( status < 0 ) {
							status = 0;
						}
					}
				}

				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = ( nativeStatusText || statusText ) + "";

				// Success/Error
				if ( isSuccess ) {
					deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
				} else {
					deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
				}

				// Status-dependent callbacks
				jqXHR.statusCode( statusCode );
				statusCode = undefined;

				if ( fireGlobals ) {
					globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
						[ jqXHR, s, isSuccess ? success : error ] );
				}

				// Complete
				completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

					// Handle the global AJAX counter
					if ( !( --jQuery.active ) ) {
						jQuery.event.trigger( "ajaxStop" );
					}
				}
			}

			return jqXHR;
		},

		getJSON: function( url, data, callback ) {
			return jQuery.get( url, data, callback, "json" );
		},

		getScript: function( url, callback ) {
			return jQuery.get( url, undefined, callback, "script" );
		}
	} );

	jQuery.each( [ "get", "post" ], function( i, method ) {
		jQuery[ method ] = function( url, data, callback, type ) {

			// Shift arguments if data argument was omitted
			if ( jQuery.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = undefined;
			}

			// The url can be an options object (which then must have .url)
			return jQuery.ajax( jQuery.extend( {
				url: url,
				type: method,
				dataType: type,
				data: data,
				success: callback
			}, jQuery.isPlainObject( url ) && url ) );
		};
	} );


	jQuery._evalUrl = function( url ) {
		return jQuery.ajax( {
			url: url,

			// Make this explicit, since user can override this through ajaxSetup (#11264)
			type: "GET",
			dataType: "script",
			async: false,
			global: false,
			"throws": true
		} );
	};


	jQuery.fn.extend( {
		wrapAll: function( html ) {
			var wrap;

			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapAll( html.call( this, i ) );
				} );
			}

			if ( this[ 0 ] ) {

				// The elements to wrap the target around
				wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

				if ( this[ 0 ].parentNode ) {
					wrap.insertBefore( this[ 0 ] );
				}

				wrap.map( function() {
					var elem = this;

					while ( elem.firstElementChild ) {
						elem = elem.firstElementChild;
					}

					return elem;
				} ).append( this );
			}

			return this;
		},

		wrapInner: function( html ) {
			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapInner( html.call( this, i ) );
				} );
			}

			return this.each( function() {
				var self = jQuery( this ),
					contents = self.contents();

				if ( contents.length ) {
					contents.wrapAll( html );

				} else {
					self.append( html );
				}
			} );
		},

		wrap: function( html ) {
			var isFunction = jQuery.isFunction( html );

			return this.each( function( i ) {
				jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
			} );
		},

		unwrap: function() {
			return this.parent().each( function() {
				if ( !jQuery.nodeName( this, "body" ) ) {
					jQuery( this ).replaceWith( this.childNodes );
				}
			} ).end();
		}
	} );


	jQuery.expr.filters.hidden = function( elem ) {
		return !jQuery.expr.filters.visible( elem );
	};
	jQuery.expr.filters.visible = function( elem ) {

		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		// Use OR instead of AND as the element is not visible if either is true
		// See tickets #10406 and #13132
		return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
	};




	var r20 = /%20/g,
		rbracket = /\[\]$/,
		rCRLF = /\r?\n/g,
		rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable = /^(?:input|select|textarea|keygen)/i;

	function buildParams( prefix, obj, traditional, add ) {
		var name;

		if ( jQuery.isArray( obj ) ) {

			// Serialize array item.
			jQuery.each( obj, function( i, v ) {
				if ( traditional || rbracket.test( prefix ) ) {

					// Treat each array item as a scalar.
					add( prefix, v );

				} else {

					// Item is non-scalar (array or object), encode its numeric index.
					buildParams(
						prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
						v,
						traditional,
						add
					);
				}
			} );

		} else if ( !traditional && jQuery.type( obj ) === "object" ) {

			// Serialize object item.
			for ( name in obj ) {
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
			}

		} else {

			// Serialize scalar item.
			add( prefix, obj );
		}
	}

	// Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param = function( a, traditional ) {
		var prefix,
			s = [],
			add = function( key, value ) {

				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			} );

		} else {

			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	};

	jQuery.fn.extend( {
		serialize: function() {
			return jQuery.param( this.serializeArray() );
		},
		serializeArray: function() {
			return this.map( function() {

				// Can add propHook for "elements" to filter or add form elements
				var elements = jQuery.prop( this, "elements" );
				return elements ? jQuery.makeArray( elements ) : this;
			} )
			.filter( function() {
				var type = this.type;

				// Use .is( ":disabled" ) so that fieldset[disabled] works
				return this.name && !jQuery( this ).is( ":disabled" ) &&
					rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
					( this.checked || !rcheckableType.test( type ) );
			} )
			.map( function( i, elem ) {
				var val = jQuery( this ).val();

				return val == null ?
					null :
					jQuery.isArray( val ) ?
						jQuery.map( val, function( val ) {
							return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
						} ) :
						{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
			} ).get();
		}
	} );


	jQuery.ajaxSettings.xhr = function() {
		try {
			return new window.XMLHttpRequest();
		} catch ( e ) {}
	};

	var xhrSuccessStatus = {

			// File protocol always yields status code 0, assume 200
			0: 200,

			// Support: IE9
			// #1450: sometimes IE returns 1223 when it should be 204
			1223: 204
		},
		xhrSupported = jQuery.ajaxSettings.xhr();

	support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
	support.ajax = xhrSupported = !!xhrSupported;

	jQuery.ajaxTransport( function( options ) {
		var callback, errorCallback;

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( support.cors || xhrSupported && !options.crossDomain ) {
			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr();

					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {
						xhr.setRequestHeader( i, headers[ i ] );
					}

					// Callback
					callback = function( type ) {
						return function() {
							if ( callback ) {
								callback = errorCallback = xhr.onload =
									xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

								if ( type === "abort" ) {
									xhr.abort();
								} else if ( type === "error" ) {

									// Support: IE9
									// On a manual native abort, IE9 throws
									// errors on any property access that is not readyState
									if ( typeof xhr.status !== "number" ) {
										complete( 0, "error" );
									} else {
										complete(

											// File: protocol always yields status 0; see #8605, #14207
											xhr.status,
											xhr.statusText
										);
									}
								} else {
									complete(
										xhrSuccessStatus[ xhr.status ] || xhr.status,
										xhr.statusText,

										// Support: IE9 only
										// IE9 has no XHR2 but throws on binary (trac-11426)
										// For XHR2 non-text, let the caller handle it (gh-2498)
										( xhr.responseType || "text" ) !== "text"  ||
										typeof xhr.responseText !== "string" ?
											{ binary: xhr.response } :
											{ text: xhr.responseText },
										xhr.getAllResponseHeaders()
									);
								}
							}
						};
					};

					// Listen to events
					xhr.onload = callback();
					errorCallback = xhr.onerror = callback( "error" );

					// Support: IE9
					// Use onreadystatechange to replace onabort
					// to handle uncaught aborts
					if ( xhr.onabort !== undefined ) {
						xhr.onabort = errorCallback;
					} else {
						xhr.onreadystatechange = function() {

							// Check readyState before timeout as it changes
							if ( xhr.readyState === 4 ) {

								// Allow onerror to be called first,
								// but that will not handle a native abort
								// Also, save errorCallback to a variable
								// as xhr.onerror cannot be accessed
								window.setTimeout( function() {
									if ( callback ) {
										errorCallback();
									}
								} );
							}
						};
					}

					// Create the abort callback
					callback = callback( "abort" );

					try {

						// Do send the request (this may raise an exception)
						xhr.send( options.hasContent && options.data || null );
					} catch ( e ) {

						// #14683: Only rethrow if this hasn't been notified as an error yet
						if ( callback ) {
							throw e;
						}
					}
				},

				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	// Install script dataType
	jQuery.ajaxSetup( {
		accepts: {
			script: "text/javascript, application/javascript, " +
				"application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /\b(?:java|ecma)script\b/
		},
		converters: {
			"text script": function( text ) {
				jQuery.globalEval( text );
				return text;
			}
		}
	} );

	// Handle cache's special case and crossDomain
	jQuery.ajaxPrefilter( "script", function( s ) {
		if ( s.cache === undefined ) {
			s.cache = false;
		}
		if ( s.crossDomain ) {
			s.type = "GET";
		}
	} );

	// Bind script tag hack transport
	jQuery.ajaxTransport( "script", function( s ) {

		// This transport only deals with cross domain requests
		if ( s.crossDomain ) {
			var script, callback;
			return {
				send: function( _, complete ) {
					script = jQuery( "<script>" ).prop( {
						charset: s.scriptCharset,
						src: s.url
					} ).on(
						"load error",
						callback = function( evt ) {
							script.remove();
							callback = null;
							if ( evt ) {
								complete( evt.type === "error" ? 404 : 200, evt.type );
							}
						}
					);

					// Use native DOM manipulation to avoid our domManip AJAX trickery
					document.head.appendChild( script[ 0 ] );
				},
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	var oldCallbacks = [],
		rjsonp = /(=)\?(?=&|$)|\?\?/;

	// Default jsonp settings
	jQuery.ajaxSetup( {
		jsonp: "callback",
		jsonpCallback: function() {
			var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
			this[ callback ] = true;
			return callback;
		}
	} );

	// Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

		var callbackName, overwritten, responseContainer,
			jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
				"url" :
				typeof s.data === "string" &&
					( s.contentType || "" )
						.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
					rjsonp.test( s.data ) && "data"
			);

		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
				s.jsonpCallback() :
				s.jsonpCallback;

			// Insert callback into url or form data
			if ( jsonProp ) {
				s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
			} else if ( s.jsonp !== false ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
			}

			// Use data converter to retrieve json after script execution
			s.converters[ "script json" ] = function() {
				if ( !responseContainer ) {
					jQuery.error( callbackName + " was not called" );
				}
				return responseContainer[ 0 ];
			};

			// Force json dataType
			s.dataTypes[ 0 ] = "json";

			// Install callback
			overwritten = window[ callbackName ];
			window[ callbackName ] = function() {
				responseContainer = arguments;
			};

			// Clean-up function (fires after converters)
			jqXHR.always( function() {

				// If previous value didn't exist - remove it
				if ( overwritten === undefined ) {
					jQuery( window ).removeProp( callbackName );

				// Otherwise restore preexisting value
				} else {
					window[ callbackName ] = overwritten;
				}

				// Save back as free
				if ( s[ callbackName ] ) {

					// Make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;

					// Save the callback name for future use
					oldCallbacks.push( callbackName );
				}

				// Call if it was a function and we have a response
				if ( responseContainer && jQuery.isFunction( overwritten ) ) {
					overwritten( responseContainer[ 0 ] );
				}

				responseContainer = overwritten = undefined;
			} );

			// Delegate to script
			return "script";
		}
	} );




	// Argument "data" should be string of html
	// context (optional): If specified, the fragment will be created in this context,
	// defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML = function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[ 1 ] ) ];
		}

		parsed = buildFragment( [ data ], context, scripts );

		if ( scripts && scripts.length ) {
			jQuery( scripts ).remove();
		}

		return jQuery.merge( [], parsed.childNodes );
	};


	// Keep a copy of the old load method
	var _load = jQuery.fn.load;

	/**
	 * Load a url into a page
	 */
	jQuery.fn.load = function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );
		}

		var selector, type, response,
			self = this,
			off = url.indexOf( " " );

		if ( off > -1 ) {
			selector = jQuery.trim( url.slice( off ) );
			url = url.slice( 0, off );
		}

		// If it's a function
		if ( jQuery.isFunction( params ) ) {

			// We assume that it's the callback
			callback = params;
			params = undefined;

		// Otherwise, build a param string
		} else if ( params && typeof params === "object" ) {
			type = "POST";
		}

		// If we have elements to modify, make the request
		if ( self.length > 0 ) {
			jQuery.ajax( {
				url: url,

				// If "type" variable is undefined, then "GET" method will be used.
				// Make value of this field explicit since
				// user can override it through ajaxSetup method
				type: type || "GET",
				dataType: "html",
				data: params
			} ).done( function( responseText ) {

				// Save response for use in complete callback
				response = arguments;

				self.html( selector ?

					// If a selector was specified, locate the right elements in a dummy div
					// Exclude scripts to avoid IE 'Permission Denied' errors
					jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

					// Otherwise use the full result
					responseText );

			// If the request succeeds, this function gets "data", "status", "jqXHR"
			// but they are ignored because response was set above.
			// If it fails, this function gets "jqXHR", "status", "error"
			} ).always( callback && function( jqXHR, status ) {
				self.each( function() {
					callback.apply( self, response || [ jqXHR.responseText, status, jqXHR ] );
				} );
			} );
		}

		return this;
	};




	// Attach a bunch of functions for handling common AJAX events
	jQuery.each( [
		"ajaxStart",
		"ajaxStop",
		"ajaxComplete",
		"ajaxError",
		"ajaxSuccess",
		"ajaxSend"
	], function( i, type ) {
		jQuery.fn[ type ] = function( fn ) {
			return this.on( type, fn );
		};
	} );




	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep( jQuery.timers, function( fn ) {
			return elem === fn.elem;
		} ).length;
	};




	/**
	 * Gets a window from an element
	 */
	function getWindow( elem ) {
		return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
	}

	jQuery.offset = {
		setOffset: function( elem, options, i ) {
			var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
				position = jQuery.css( elem, "position" ),
				curElem = jQuery( elem ),
				props = {};

			// Set position first, in-case top/left are set even on static elem
			if ( position === "static" ) {
				elem.style.position = "relative";
			}

			curOffset = curElem.offset();
			curCSSTop = jQuery.css( elem, "top" );
			curCSSLeft = jQuery.css( elem, "left" );
			calculatePosition = ( position === "absolute" || position === "fixed" ) &&
				( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

			// Need to be able to calculate position if either
			// top or left is auto and position is either absolute or fixed
			if ( calculatePosition ) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;

			} else {
				curTop = parseFloat( curCSSTop ) || 0;
				curLeft = parseFloat( curCSSLeft ) || 0;
			}

			if ( jQuery.isFunction( options ) ) {

				// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
				options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
			}

			if ( options.top != null ) {
				props.top = ( options.top - curOffset.top ) + curTop;
			}
			if ( options.left != null ) {
				props.left = ( options.left - curOffset.left ) + curLeft;
			}

			if ( "using" in options ) {
				options.using.call( elem, props );

			} else {
				curElem.css( props );
			}
		}
	};

	jQuery.fn.extend( {
		offset: function( options ) {
			if ( arguments.length ) {
				return options === undefined ?
					this :
					this.each( function( i ) {
						jQuery.offset.setOffset( this, options, i );
					} );
			}

			var docElem, win,
				elem = this[ 0 ],
				box = { top: 0, left: 0 },
				doc = elem && elem.ownerDocument;

			if ( !doc ) {
				return;
			}

			docElem = doc.documentElement;

			// Make sure it's not a disconnected DOM node
			if ( !jQuery.contains( docElem, elem ) ) {
				return box;
			}

			box = elem.getBoundingClientRect();
			win = getWindow( doc );
			return {
				top: box.top + win.pageYOffset - docElem.clientTop,
				left: box.left + win.pageXOffset - docElem.clientLeft
			};
		},

		position: function() {
			if ( !this[ 0 ] ) {
				return;
			}

			var offsetParent, offset,
				elem = this[ 0 ],
				parentOffset = { top: 0, left: 0 };

			// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
			// because it is its only offset parent
			if ( jQuery.css( elem, "position" ) === "fixed" ) {

				// Assume getBoundingClientRect is there when computed position is fixed
				offset = elem.getBoundingClientRect();

			} else {

				// Get *real* offsetParent
				offsetParent = this.offsetParent();

				// Get correct offsets
				offset = this.offset();
				if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
					parentOffset = offsetParent.offset();
				}

				// Add offsetParent borders
				parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
			}

			// Subtract parent offsets and element margins
			return {
				top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
				left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
			};
		},

		// This method will return documentElement in the following cases:
		// 1) For the element inside the iframe without offsetParent, this method will return
		//    documentElement of the parent window
		// 2) For the hidden or detached element
		// 3) For body or html element, i.e. in case of the html node - it will return itself
		//
		// but those exceptions were never presented as a real life use-cases
		// and might be considered as more preferable results.
		//
		// This logic, however, is not guaranteed and can change at any point in the future
		offsetParent: function() {
			return this.map( function() {
				var offsetParent = this.offsetParent;

				while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
					offsetParent = offsetParent.offsetParent;
				}

				return offsetParent || documentElement;
			} );
		}
	} );

	// Create scrollLeft and scrollTop methods
	jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
		var top = "pageYOffset" === prop;

		jQuery.fn[ method ] = function( val ) {
			return access( this, function( elem, method, val ) {
				var win = getWindow( elem );

				if ( val === undefined ) {
					return win ? win[ prop ] : elem[ method ];
				}

				if ( win ) {
					win.scrollTo(
						!top ? val : win.pageXOffset,
						top ? val : win.pageYOffset
					);

				} else {
					elem[ method ] = val;
				}
			}, method, val, arguments.length );
		};
	} );

	// Support: Safari<7-8+, Chrome<37-44+
	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
	// getComputedStyle returns percent when specified for top/left/bottom/right;
	// rather than make the css module depend on the offset module, just check for it here
	jQuery.each( [ "top", "left" ], function( i, prop ) {
		jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
			function( elem, computed ) {
				if ( computed ) {
					computed = curCSS( elem, prop );

					// If curCSS returns percentage, fallback to offset
					return rnumnonpx.test( computed ) ?
						jQuery( elem ).position()[ prop ] + "px" :
						computed;
				}
			}
		);
	} );


	// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
		jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
			function( defaultExtra, funcName ) {

			// Margin is only for outerHeight, outerWidth
			jQuery.fn[ funcName ] = function( margin, value ) {
				var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
					extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

				return access( this, function( elem, type, value ) {
					var doc;

					if ( jQuery.isWindow( elem ) ) {

						// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
						// isn't a whole lot we can do. See pull request at this URL for discussion:
						// https://github.com/jquery/jquery/pull/764
						return elem.document.documentElement[ "client" + name ];
					}

					// Get document width or height
					if ( elem.nodeType === 9 ) {
						doc = elem.documentElement;

						// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
						// whichever is greatest
						return Math.max(
							elem.body[ "scroll" + name ], doc[ "scroll" + name ],
							elem.body[ "offset" + name ], doc[ "offset" + name ],
							doc[ "client" + name ]
						);
					}

					return value === undefined ?

						// Get width or height on the element, requesting but not forcing parseFloat
						jQuery.css( elem, type, extra ) :

						// Set width or height on the element
						jQuery.style( elem, type, value, extra );
				}, type, chainable ? margin : undefined, chainable, null );
			};
		} );
	} );


	jQuery.fn.extend( {

		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},

		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {

			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ?
				this.off( selector, "**" ) :
				this.off( types, selector || "**", fn );
		},
		size: function() {
			return this.length;
		}
	} );

	jQuery.fn.andSelf = jQuery.fn.addBack;




	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.

	// Note that for maximum portability, libraries that are not jQuery should
	// declare themselves as anonymous modules, and avoid setting a global if an
	// AMD loader is present. jQuery is a special case. For more information, see
	// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

	if ( true ) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return jQuery;
		}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}



	var

		// Map over jQuery in case of overwrite
		_jQuery = window.jQuery,

		// Map over the $ in case of overwrite
		_$ = window.$;

	jQuery.noConflict = function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	};

	// Expose jQuery and $ identifiers, even in AMD
	// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	if ( !noGlobal ) {
		window.jQuery = window.$ = jQuery;
	}

	return jQuery;
	}));


/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _jquery = __webpack_require__(100);

	var _jquery2 = _interopRequireDefault(_jquery);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Header = function () {
	  function Header() {
	    _classCallCheck(this, Header);

	    this.el = document.getElementById('main-header');

	    this.setListeners();
	  }

	  _createClass(Header, [{
	    key: 'setListeners',
	    value: function setListeners() {
	      (0, _jquery2.default)(document).on("click", '.js-header-toggle', this.toggleMobileHeader.bind(this));
	      (0, _jquery2.default)(document).on("click", '.js-contact-toggle', this.toggleContact.bind(this));
	      (0, _jquery2.default)(document).on("click", this.hideContact);
	    }
	  }, {
	    key: 'toggleMobileHeader',
	    value: function toggleMobileHeader() {
	      if (window.innerWidth < 1100) {
	        this.el.classList.toggle('-mobile-nav-visible');
	      }
	    }
	  }, {
	    key: 'toggleContact',
	    value: function toggleContact(e) {
	      e.preventDefault();
	      document.getElementById('contact').classList.toggle('-is-visible');
	    }
	  }, {
	    key: 'hideContact',
	    value: function hideContact(e) {
	      var $target = (0, _jquery2.default)(e.target);
	      if ($target.closest('#contact').length === 0 && !$target.is("#contact")) {
	        document.getElementById('contact').classList.remove('-is-visible');
	      }
	    }
	  }]);

	  return Header;
	}();

	exports.default = Header;

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jquery = __webpack_require__(100);

	var _jquery2 = _interopRequireDefault(_jquery);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Home = function Home() {
	  _classCallCheck(this, Home);

	  document.getElementById('js-home-title').classList.add("-is-visible");
	};

	exports.default = Home;

/***/ }
/******/ ]);