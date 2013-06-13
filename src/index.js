define(['jquery', 'module'], function($, Module) {
  var HELP = "This gadget allows editing of jQuery.sheet spreadsheets (.jqs files). " +
    "There are no parameters specific to this gadget except for 'help' which displays " +
    "this message.";

  var print = function(domLocation, text) {
    $(domLocation).prepend('<textarea cols="1" rows="1"></textarea>');
    var ta = $($(domLocation).children()[0]);
    ta.css({width:"100%", height:"100%"});
    ta.val(HELP);
    return { getData: function(cb) { cb(''); } };
  };

  return function(getData, domLocation, action, params) {

    if (params === 'help') {
      return print(domLocation, HELP);
    }

    var id = 'iframe-' + String(Math.random()).replace(/^0\./, '');
    $(domLocation).prepend('<iframe id="' + id + '" src="javascript:\'\'"></iframe>');
    var ifr = $(domLocation).children()[0];
    $(ifr).attr("width", $(domLocation).width());
    $(ifr).attr("height", $(domLocation).height());
    $(ifr.contentWindow.document.body).append('<div></div>');
    var div = $(ifr.contentWindow.document.body.childNodes[0]);

    var attachData;
    getData('text', function(err, ret) {
      if (err) {
        $(ifr).css({display:'none'});
        console.log(err.stack);
        return print(domLocation, err.stack);
      }
      ret = JSON.parse(ret);
      if (typeof(attachData) === 'function') { attachData(ret); }
      attachData = ret;
    });

    // indirection allowing getContent0 to be changed later.
    var getContent0 = function(cb) { cb('The content is not loaded yet'); };
    var getContent = function(cb) { getContent0(cb); };

    var path = Module.uri.replace(/^\/|\/[^/]*$/g, '');
    require([path+'/iframify!'+path+'/main@'+id], function(sheet) {
      sheet.inject(div, {
        title: '',
        inlineMenu: undefined,
        buildSheet: true,
        editable: (action === 'edit'),
        autoFiller: true,
        urlMenu: false,

        height: $(domLocation).height() - 80,//- 120,
        width: $(domLocation).width() - 10,

        jqs_amd: {
          scrollTo: true,
          jQueryUI: true,
          raphaelJs: true,
          colorPicker: true,
          elastic: true,
          advancedMath: true,
          finance: true
        }
      }, function(thisSheet, jSheet) {
        var f = function(data) {
            thisSheet.openSheet(jSheet.makeTable.json(data));
            getContent0 = function(cb) {
              var content;
              try {
                content = JSON.stringify(thisSheet.exportSheet.json());
              } catch (e) { return cb(e.stack); }
              cb(undefined, content);
            };
        };
        if (typeof(attachData) === 'object') { f(attachData); }
        attachData = f;
      });
    });

    return { getData: getContent };
  };
});
