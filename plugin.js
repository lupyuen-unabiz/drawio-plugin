/**
 * A draw.io plugin for inserting a custom text (or ellipse) element,
 * either by keyboard Ctrl+Shift+T (or Ctrl+Shift+Q) or by menu
 https://lupyuen-unabiz.github.io/drawio-plugin/plugin.js
 */
// import * as mxEditor from './mxgraph/editor/mxEditor';
var dataURL = 'https://lupyuen-unabiz.github.io/drawio-plugin/data.json';
var frameURL = 'https://unabelldemo.au.meteorapp.com/done/2C30EB';
var frameID = 'UnaRadarFrame';
var frameHandleWidth = 20;
var mxApp = (function () {
    function mxApp() {
    }
    return mxApp;
}());
function fetchData() {
    var r = new XMLHttpRequest();
    r.open("GET", dataURL, true);
    r.onreadystatechange = function () {
        if (r.readyState != 4 || r.status != 200)
            return;
        console.log(dataURL + ": " + r.responseText);
    };
    // r.send("banana=yellow");
    r.send();
}
function addFrame(theGraph) {
    if (!theGraph || !theGraph.model || !theGraph.model.cells
        || !theGraph.model.cells.UnaRadarFrame
        || !theGraph.model.cells.UnaRadarFrame.geometry)
        return;
    var view = theGraph.view;
    var scale = view.scale;
    var translateX = view.translate.x;
    var translateY = view.translate.y;
    var geometry = theGraph.model.cells.UnaRadarFrame.geometry;
    var mxX = geometry.x + frameHandleWidth;
    var mxY = geometry.y;
    var mxWidth = geometry.width - (frameHandleWidth * 2);
    var mxHeight = geometry.height;
    var _a = mxToHTML(mxX, mxY, translateX, translateY, scale), htmlX = _a.htmlX, htmlY = _a.htmlY;
    var frame = document.getElementById(frameID);
    if (!frame) {
        frame = document.createElement('iframe');
        frame.id = frameID;
        frame.src = frameURL;
        frame.scrolling = 'no';
        frame.allow = 'geolocation; microphone; camera';
        frame.style.position = 'absolute';
        frame.style.left = htmlX + 'px';
        frame.style.top = htmlY + 'px';
        frame.style.width = (mxWidth * scale) + 'px';
        frame.style.height = (mxHeight * scale) + 'px';
        theGraph.container.appendChild(frame);
    }
    frame.style.left = htmlX + 'px';
    frame.style.top = htmlY + 'px';
    frame.style.width = (mxWidth * scale) + 'px';
    frame.style.height = (mxHeight * scale) + 'px';
}
function htmlToMX(htmlX, htmlY, translateX, translateY, scale) {
    var x = (htmlX / scale) - translateX;
    var y = (htmlY / scale) - translateY;
    return { x: x, y: y };
}
function mxToHTML(mxX, mxY, translateX, translateY, scale) {
    var htmlX = (mxX + translateX) * scale;
    var htmlY = (mxY + translateY) * scale;
    return { htmlX: htmlX, htmlY: htmlY };
}
Draw.loadPlugin(function (ui) {
    var layerX = 0;
    var layerY = 0;
    //  Add the UnaRadar frame.
    window.setTimeout(function () { return addFrame(ui.editor.graph); }, 10 * 1000);
    //  Add the click listener to get click position.
    ui.editor.graph.addListener(mxEvent.CLICK, function (sender, evt) {
        var e = evt.getProperty('event'); // mouse event
        var cell = evt.getProperty('cell'); // cell may be null
        layerX = e.layerX;
        layerY = e.layerY;
        // console.log(e.view.innerWidth, e.layerX, e.offsetX, e.screenX, e.x, e, cell);
        // console.log({ layerX, layerY, e, cell });
        if (cell) {
            // Do something useful with cell and consume the event
            // evt.consume();
        }
        //  Update the UnaRadar frame.
        window.setTimeout(function () { return addFrame(ui.editor.graph); }, 1000);
    });
    // Adds resources for actions
    mxResources.parse('recordRSSI=Record Signal Strength (RSSI)');
    // mxResources.parse('myInsertText=Insert text element');
    // Adds popup menu : myInsertText, recordRSSI
    var uiCreatePopupMenu = ui.menus.createPopupMenu;
    ui.menus.createPopupMenu = function (menu, cell, evt) {
        uiCreatePopupMenu.apply(this, arguments);
        var graph = ui.editor.graph;
        // if (graph.model.isVertex(graph.getSelectionCell()))
        {
            // this.addMenuItems(menu, ['-', 'myInsertText'], null, evt);
            this.addMenuItems(menu, ['-', 'recordRSSI'], null, evt);
        }
    };
    // Adds action : recordRSSI
    ui.actions.addAction('recordRSSI', function () {
        var theGraph = ui.editor.graph;
        if (theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())) {
            var name_1 = 'rssi' + Date.now();
            var scale = theGraph.view.scale;
            var translateX = theGraph.view.translate.x;
            var translateY = theGraph.view.translate.y;
            var _a = htmlToMX(layerX, layerY, translateX, translateY, scale), x = _a.x, y = _a.y;
            // console.log({ x, y, layerX, layerY, scale, translateX, translateY, theGraph, obj: this});
            var newElement = new mxCell(name_1, new mxGeometry(x, y, 80, 80), "ellipse;whiteSpace=wrap;html=1;");
            newElement.vertex = !0;
            theGraph.setSelectionCell(theGraph.addCell(newElement));
            fetchData();
        }
    }, null, null, "Ctrl+ShiftR");
    ui.keyHandler.bindAction(81, !0, "recordRSSI", !0);
    // Adds menu
    ui.menubar.addMenu('UnaRadar', function (menu, parent) {
        ui.menus.addMenuItem(menu, 'recordRSSI');
        // ui.menus.addMenuItem(menu, 'myInsertText');
    });
    // Reorders menubar
    ui.menubar.container
        .insertBefore(ui.menubar.container.lastChild, ui.menubar.container.lastChild.previousSibling.previousSibling);
});
/* Finding assigned keys:
  * Open javascript console
  * Draw.valueOf()
  * Traverse to: Object > loadPlugin > <function scope>
                > ui > keyHandler > controlShiftKeys
  * The number here is ASCII character code */
/* ui.actions.addAction('myInsertText', function () {
  var theGraph = ui.editor.graph;
  if (theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())) {
    var pos = theGraph.getInsertPoint();
    var newElement = new mxCell("",
      new mxGeometry(pos.x, pos.y, 80, 80),
      "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;whiteSpace=wrap;overflow=auto");
    newElement.vertex = !0;
    theGraph.setSelectionCell(theGraph.addCell(newElement))
  }
}, null, null, "Ctrl+Shift+T");
ui.keyHandler.bindAction(84, !0, "myInsertText", !0); */
