/**
 * A draw.io plugin for inserting a custom text (or ellipse) element,
 * either by keyboard Ctrl+Shift+T (or Ctrl+Shift+Q) or by menu
 https://lupyuen-unabiz.github.io/drawio-plugin/plugin.js
 */
// import { mxEditor } from './mxgraph/editor/mxEditor';
var dataURL = 'https://lupyuen-unabiz.github.io/drawio-plugin/data.json';
var frameURL = 'https://unabelldemo.au.meteorapp.com/done/2C30EB';
var frameID = 'UnaRadarFrame';
var frameHandleWidth = 20;
var mxApp = (function () {
    function mxApp() {
    }
    return mxApp;
}());
var rssiRecord = (function () {
    function rssiRecord() {
    }
    return rssiRecord;
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
    //  Adds resources for actions
    mxResources.parse('recordRSSI=Record Signal Strength (RSSI)');
    //  Allow XML value for nodes.
    /*
    ui.editor.graph.convertValueToString = function(cell) {
      if (mxUtils.isNode(cell.value)) {
        return cell.getAttribute('label', '')
      }
    };
  
    const cellLabelChanged = ui.editor.graph.cellLabelChanged;
    ui.editor.graph.cellLabelChanged = function(cell, newValue, autoSize) {
      if (mxUtils.isNode(cell.value)) {
        // Clones the value for correct undo/redo
        var elt = cell.value.cloneNode(true);
        elt.setAttribute('label', newValue);
        newValue = elt;
      }
      cellLabelChanged.apply(this, arguments);
    };
  
    var doc = mxUtils.createXmlDocument();
    var node = doc.createElement('MyNode')
    node.setAttribute('label', 'MyLabel');
    node.setAttribute('attribute1', 'value1');
    ui.editor.graph.insertVertex(ui.editor.graph.getDefaultParent(), null, node, 40, 40, 80, 30);
    */
    ui.editor.graph.addListener(mxEvent.SIZE, function (sender, evt) {
        //  Update the UnaRadar frame upon resize.
        window.setTimeout(function () { return addFrame(ui.editor.graph); }, 0);
    });
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
        window.setTimeout(function () { return addFrame(ui.editor.graph); }, 0);
    });
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
        var startSize = 50;
        var parentWidth = 154;
        var parentHeight = 200;
        var childHeight = 30;
        // const style = "ellipse;whiteSpace=wrap;html=1;";
        var graph = ui.editor.graph;
        if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
            var localtime = Date.now() + 8 * 60 * 60 * 1000;
            var localtimestr = new Date(localtime).toISOString().replace('T', ' ')
                .substr(0, 16);
            //  Get data from server.
            fetchData();
            var rssiData = [
                { bs: 'overall', rssi: -88, color: '#204080' },
                { bs: '1234', rssi: -88, color: '#204080' },
                { bs: '123A', rssi: -98, color: '#404080' },
                { bs: '123C', rssi: -108, color: '#604080' },
                { bs: '12EF', rssi: -118, color: '#a04080' },
            ];
            //  Get the graph view parameters.
            var scale = graph.view.scale;
            var translateX = graph.view.translate.x;
            var translateY = graph.view.translate.y;
            var _a = htmlToMX(layerX, layerY, translateX, translateY, scale), x = _a.x, y = _a.y;
            // console.log({ x, y, layerX, layerY, scale, translateX, translateY, theGraph, obj: this});
            //  Create parent.
            var parentColor = rssiData[0].color;
            var parentStyle = [
                'swimlane;fontStyle=1;childLayout=stackLayout',
                "horizontal=1;startSize=" + startSize + ";horizontalStack=0",
                'resizeParent=1;resizeLast=0;collapsible=1',
                "marginBottom=0;swimlaneFillColor=" + parentColor + ";shadow=1",
                'gradientColor=none;opacity=50'
            ].join(';');
            var parentId = 'rssi' + Date.now();
            var parentRSSI = rssiData[0].rssi;
            var parentValue = "RSSI " + parentRSSI + " dBm\n" + localtimestr;
            var parentGeometry = new mxGeometry(x, y, parentWidth, parentHeight);
            var parent_1 = new mxCell(parentValue, parentGeometry, parentStyle);
            parent_1.vertex = !0;
            parent_1.setId(parentId);
            var childY_1 = startSize;
            //  Create child for each record.
            rssiData.filter(function (rec) { return (rec.bs !== 'overall'); })
                .forEach(function (rec) {
                //  bs = '1234', rssi = -88, color = '#203040';
                var childId = "child_" + rec.bs + "_" + Date.now();
                var childValue = "BS " + rec.bs + ": " + ((rec.rssi <= -100) ? rec.rssi : (' ' + rec.rssi)) + " dBm";
                var childGeometry = new mxGeometry(0, childY_1, parentWidth, childHeight);
                var childStyle = [
                    'text;strokeColor=none',
                    "fillColor=" + rec.color + ";opacity=50",
                    'shadow=1;align=center;verticalAlign=middle'
                ].join(';');
                var child = new mxCell(childValue, childGeometry, childStyle);
                child.vertex = !0;
                child.setId(childId);
                parent_1.insert(child);
                childY_1 += childHeight;
            });
            //  Add the parent.
            graph.setSelectionCell(graph.addCell(parent_1));
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
