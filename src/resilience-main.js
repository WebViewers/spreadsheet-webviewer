define(['jquery', 'jio', './iframify!./main@spreadsheet-gadget'], function($, JIO, sheet) {
  return function(properties) {
    var attach = properties.jioAttach;

    var thisSheet;
    var saveSheet = function() {
      if (!thisSheet) { return; }
      attach._data = JSON.stringify(thisSheet.exportSheet.json());
      attach._mimetype = 'application/json';
      JIO.putAttachment(attach, function (err, response) {
        if (err) { throw Error(err); }
        console.log(response);
      });
    };

    var fr = new FileReader();
    fr.onload = function(e) {
      var json = JSON.parse(e.target.result)[0];
      if (typeof(attachData) === 'function') { attachData(json); }
      attachData = json;
    };
    JIO.getAttachment(attach, function (err, response) {
      if (err) { throw Error(err); }
      fr.readAsText(response);
    });

    var body = $($('#spreadsheet-gadget')[0].contentWindow.document.body);

    var addButtons = function() {
      body.append('<input type="submit" id="save" value="Save"></input>');
      body.children('#save').click(function(e) {
        e.stopPropagation();
        saveSheet();
      })
    };

    sheet.inject(body, {
      title: '',
      inlineMenu: undefined,
      buildSheet: true,
      editable: true,
      autoFiller: true,
      urlMenu: false,

      height: properties.height - 80,//- 120,
      width: properties.width - 10,

      jqs_amd: {
        scrollTo: true,
        jQueryUI: true,
        raphaelJs: true,
        colorPicker: true,
        elastic: true,
        advancedMath: true,
        finance: true
      }
    }, function(tSheet, jSheet) {
      addButtons();
      thisSheet = tSheet;
      var f = function(data) {
          tSheet.openSheet(jSheet.makeTable.json(data));
      };
      if (typeof(attachData) === 'object') { f(attachData); }
      attachData = f;
    });
  };
});
