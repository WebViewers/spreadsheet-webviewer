/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/*
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * http://www.gnu.org/licenses/lgpl-2.1.html
 */
/*global window, document */
;(function (window, document) {
  "use strict";
  if (window.self === window.top) {
    return;
  }
  var readyList = [];
  var stubReady = function (func) { readyList.push(func); };
  var rJSStub = function (window) {
    return { ready: stubReady };
  };
  var rJS = function (window) {
    return rJSStub(window);
  };
  var cookie = ''+Math.random();
  var onMessage = function (event) {
    var data;
    try { data = JSON.parse(event.data); } catch (e) { }
    if (!data || data.cookie !== cookie || data.id !== 'renderjs-stub-response') {
      return;
    }
    if (!cookie) {
      console.log("got duplicate messages from parent");
      return;
    }
    var scripts = data.scripts;
    var head = document.getElementsByTagName('head')[0];
    var scr;
    for (var i = 0; i < scripts.length; i++) {
      scr = document.createElement('script');
      scr.setAttribute('src', data.scripts[i]);
      scr.setAttribute('type', 'text/javascript');
      head.appendChild(scr);
    }
    if (!scr) {
      throw new Error("RenderJS not provided");
    }
    var check = function () {
      var root = window.renderJS(window);
      if (root.ready === stubReady) {
        throw new Error("RenderJS not loaded");
      }
      if (rJSStub === window.rJS) {
        // already called.
        return;
      }
      rJSStub = window.rJS;
      for (var x in window.rJS) {
        rJS[x] = window.rJS[x];
      }
      for (var i = 0; i < readyList.length; i++) {
        root.ready(readyList[i]);
      }
    };
    if (document.addEventListener) {
      document.addEventListener('renderjs:ready', check);
    } else {
      document.attachEvent('renderjs:ready', check);
    }
  }
  if (window.addEventListener) {
    window.addEventListener('message', onMessage);
  } else {
    window.attachEvent('onmessage', onMessage);
  }
  window.top.postMessage(JSON.stringify({cookie:cookie, id:"renderjs-stub-request"}), '*');

  window.renderJS = window.rJS = rJS;

}(window, document));
