/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/*! webviewer-stub v0.1  */
/*global window, document */
;(function (window, document) {
  "use strict";
  if (window.self === window.top) {
    return;
  }
  var rJSStub = function (window) {
    return { ready: function (func) { readyList.push(func); } };
  };
  var rJS = function (window) {
    return rJSStub(window);
  };
  var readyList = [];
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
    scr.onload = function () {
      var root = window.renderJS(window);
      if (root.ready === readyList.push) {
        throw new Error("RenderJS not loaded");
      }
      rJSStub = window.rJS;
      for (var x in window.rJS) {
        rJS[x] = window.rJS[x];
      }
      for (var i = 0; i < readyList.length; i++) {
        root.ready(readyList[i]);
      }
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
