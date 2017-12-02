/**
 * A draw.io plugin for inserting a custom text (or ellipse) element,
 * either by keyboard Ctrl+Shift+T (or Ctrl+Shift+Q) or by menu
 https://lupyuen-unabiz.github.io/drawio-plugin/plugin.js
 */

// import * as mxEditor from './mxgraph/editor/mxEditor';

const dataURL = 'https://lupyuen-unabiz.github.io/drawio-plugin/data.json';
const frameURL = 'https://unabelldemo.au.meteorapp.com/done/2C30EB';
const frameID = 'UnaRadarFrame';
const frameHandleWidth = 20;

class mxApp {
  editor: mxEditor,
  menus: object,
  menubar: object,
  keyHandler: object,
  actions: object
}

function fetchData() {
  var r = new XMLHttpRequest();
  r.open("GET", dataURL, true);
  r.onreadystatechange = function () {
    if (r.readyState != 4 || r.status != 200) return;
    console.log(dataURL + ": " + r.responseText);
  };
  // r.send("banana=yellow");
  r.send();
}

function addFrame(theGraph: mxGraph): void {
  if (!theGraph || !theGraph.model || !theGraph.model.cells
    || !theGraph.model.cells.UnaRadarFrame
    || !theGraph.model.cells.UnaRadarFrame.geometry) return;

  const view = theGraph.view;
  const scale = view.scale;
  const translateX = view.translate.x;
  const translateY = view.translate.y;

  const geometry = theGraph.model.cells.UnaRadarFrame.geometry;
  const mxX = geometry.x + frameHandleWidth;
  const mxY = geometry.y;
  const mxWidth = geometry.width - (frameHandleWidth * 2);
  const mxHeight = geometry.height;
  const {htmlX, htmlY} = mxToHTML(mxX, mxY, translateX, translateY, scale);

  let frame: HTMLIFrameElement = document.getElementById(frameID) as HTMLIFrameElement;
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

function htmlToMX(htmlX: number, htmlY: number, translateX: number,
                  translateY: number, scale: number) {
  const x = (htmlX / scale) - translateX;
  const y = (htmlY / scale) - translateY;
  return {x, y};
}

function mxToHTML(mxX: number, mxY: number, translateX: number,
                  translateY: number, scale: number) {
  const htmlX = (mxX + translateX) * scale;
  const htmlY = (mxY + translateY) * scale;
  return {htmlX, htmlY};
}

Draw.loadPlugin(function (ui: mxApp) {
  let layerX = 0;
  let layerY = 0;

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

  ui.editor.graph.addListener(mxEvent.SIZE, function(sender, evt) {
    //  Update the UnaRadar frame upon resize.
    window.setTimeout(() => addFrame(ui.editor.graph), 0);
  });

  //  Add the click listener to get click position.
  ui.editor.graph.addListener(mxEvent.CLICK, function(sender, evt) {
    const e = evt.getProperty('event'); // mouse event
    const cell = evt.getProperty('cell'); // cell may be null
    layerX = e.layerX;
    layerY = e.layerY;
    // console.log(e.view.innerWidth, e.layerX, e.offsetX, e.screenX, e.x, e, cell);
    // console.log({ layerX, layerY, e, cell });
    if (cell) {
      // Do something useful with cell and consume the event
      // evt.consume();
    }
    //  Update the UnaRadar frame.
    window.setTimeout(() => addFrame(ui.editor.graph), 0);
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
    const startSize = 50;
    const parentWidth = 200;
    const parentHeight = 200;
    const childHeight = 30;
    const parentStyle = [
      'swimlane;fontStyle=1;childLayout=stackLayout',
      `horizontal=1;startSize=${startSize};horizontalStack=0`,
      'resizeParent=1;resizeLast=0;collapsible=1',
      'marginBottom=0;swimlaneFillColor=#ffffff;shadow=1',
      'gradientColor=none;html=1;opacity=50'
    ].join(';');
    // const style = "ellipse;whiteSpace=wrap;html=1;";
    const graph = ui.editor.graph;
    if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
      //  Get data from server.
      fetchData();

      //  Get the graph view parameters.
      const scale = graph.view.scale;
      const translateX = graph.view.translate.x;
      const translateY = graph.view.translate.y;
      const {x, y} = htmlToMX(layerX, layerY, translateX, translateY, scale);
      // console.log({ x, y, layerX, layerY, scale, translateX, translateY, theGraph, obj: this});

      //  Create parent.
      const localtime = Date.now() + 8 * 60 * 60 * 1000;
      const parentId = 'rssi' + Date.now();
      const parentValue = 'RSSI @ ' +
        new Date(localtime).toISOString().replace('T', ' ')
          .substr(0, 16);
      const parentGeometry = new mxGeometry(x, y, parentWidth, parentHeight);
      const parent = new mxCell(parentValue, parentGeometry, parentStyle);
      parent.vertex = !0;
      parent.setId(parentId);

      //  Create child.
      const childY = startSize;
      const bs = '1234';
      const rssi = -88;
      const childId = 'child' + Date.now();
      const childValue = `  BS ${bs}: ${(rssi <= -100) ? rssi : (' ' + rssi)} dBm`;
      const childGeometry = new mxGeometry(0, childY, parentWidth, childHeight);
      const childStyle = [
        'text;html=1;strokeColor=none',
        'fillColor=#204080;opacity=50',
        'shadow=1'
      ].join(';');
      const child = new mxCell(childValue, childGeometry, childStyle);
      child.vertex = !0;
      child.setId(childId);
      parent.insert(child);

      //  Add the parent.
      graph.setSelectionCell(graph.addCell(parent));
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
    .insertBefore(ui.menubar.container.lastChild,
      ui.menubar.container.lastChild.previousSibling.previousSibling);
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
