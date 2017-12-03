/**
 * A draw.io plugin for inserting a custom text (or ellipse) element,
 * either by keyboard Ctrl+Shift+T (or Ctrl+Shift+Q) or by menu
 https://unabelldemo.au.meteorapp.com/plugin/${deviceID}
 Originally at https://lupyuen-unabiz.github.io/drawio-plugin/plugin.js
 */

// import { mxEditor } from './mxgraph/editor/mxEditor';

const deviceID = '2C30EB';
// const dataURL = 'https://lupyuen-unabiz.github.io/drawio-plugin/data.json';
const dataURL = `https://unabelldemo.au.meteorapp.com/rssidata/${deviceID}`;
const frameURL = `https://unabelldemo.au.meteorapp.com/done/${deviceID}`;
const frameID = 'UnaRadarFrame';
const frameHandleWidth = 20;

class mxApp {
  editor: mxEditor;
  menus: object;
  menubar: object;
  keyHandler: object;
  actions: object;
}

class rssiRecord {
  device: string | undefined;
  seqNumber: number | undefined;
  baseStationSecond: number | undefined;
  baseStationHour: number | undefined;
  bs: string;
  rssi: number;
  color: string;
  localdatetime: string;
}

function fetchData(): Promise<rssiRecord[]> {
  //  Fetch RSSI data for the device ID:
  //  http://.../rssidata/2C30EB?seqNumber=3158&baseStationHour=420073&baseStationSecond=1512265643
  //  Returns a promise.
  return new Promise((accept, reject) => {
    const r = new XMLHttpRequest();
    r.open("GET", dataURL, true);
    r.onreadystatechange = function () {
      if (r.readyState != 4 || r.status != 200) return; // reject(new Error(r.responseText));
      console.log(dataURL + ": " + r.responseText);
      return accept(JSON.parse(r.responseText));
    };
    // r.send("banana=yellow");
    r.send();
  });
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

function recordRSSI(graph: any, rssiData: rssiRecord[], layerX: number, layerY: number) {
  //  Plot a box of RSSI data on the clicked point.
  //  Compute dimensions of parent.
  const startSize = 50;
  const childHeight = 30;
  const infoHeight = 30;  //  Info box at bottom.
  const parentWidth = 154;
  const parentHeight = startSize + infoHeight + childHeight * (rssiData.length - 1);

  //  Get the graph view parameters.
  const scale = graph.view.scale;
  const translateX = graph.view.translate.x;
  const translateY = graph.view.translate.y;
  const {x, y} = htmlToMX(layerX, layerY, translateX, translateY, scale);
  // console.log({ x, y, layerX, layerY, scale, translateX, translateY, theGraph, obj: this});

  //  Create parent.
  const parentGeometry = new mxGeometry(x, y, parentWidth, parentHeight);
  //  Set the collapsed parent dimensions.
  parentGeometry.alternateBounds = {x, y, width: parentWidth, height: startSize};
  const parentColor = rssiData[0].color;
  const parentStyle = [
    'swimlane;fontStyle=1;childLayout=stackLayout',
    `horizontal=1;startSize=${startSize};horizontalStack=0`,
    'resizeParent=1;resizeLast=0;collapsible=1',
    `marginBottom=0;swimlaneFillColor=${parentColor};shadow=1`,
    'gradientColor=none;opacity=50'
  ].join(';');
  const parentId = `rssi${Date.now()}`;
  const parentRec = rssiData.filter(rec => (rec.bs === 'overall'))[0];
  const parentRSSI = parentRec.rssi;
  const datetime = parentRec.localdatetime;
  const parentValue = `RSSI ${parentRSSI} dBm\n${datetime}`;

  const parent = new mxCell(parentValue, parentGeometry, parentStyle);
  parent.vertex = !0;
  parent.setId(parentId);
  let childY = startSize;

  //  Create child for each record.
  rssiData.filter(rec => (rec.bs !== 'overall'))
    .forEach(rec => {
      //  bs = '1234', rssi = -88, color = '#203040';
      const childId = `child_${rec.bs}_${Date.now()}`;
      const childValue = `BS ${rec.bs}: ${
        (rec.rssi <= -100) ? rec.rssi : (' ' + rec.rssi)} dBm`;
      const childGeometry = new mxGeometry(0, childY, parentWidth, childHeight);
      const childStyle = [
        'text;strokeColor=none',
        `fillColor=${rec.color};opacity=50`,
        'shadow=1;align=center;verticalAlign=middle',
        'fontStyle=1;fontColor=#FFFFFF'
      ].join(';');
      const child = new mxCell(childValue, childGeometry, childStyle);
      child.vertex = !0;
      child.setId(childId);
      parent.insert(child);
      childY += childHeight;
    });

  //  Add the info box.
  const infoRec = parentRec;
  const infoId = `info${Date.now()}`;
  const infoValue = `${infoRec.device} - ${infoRec.seqNumber} - \n${infoRec.baseStationSecond}`;
  const infoGeometry = new mxGeometry(0, childY, parentWidth, infoHeight);
  const infoStyle = [
    'text;strokeColor=none',
    `fillColor=#202020;opacity=40`,
    'shadow=1;align=center;verticalAlign=middle',
    'fontColor=#ffffff;fontStyle=2;fontSize=10'
  ].join(';');
  const info = new mxCell(infoValue, infoGeometry, infoStyle);
  info.vertex = !0;
  info.setId(infoId);
  parent.insert(info);
  childY += infoHeight;

  //  Add the parent.
  graph.setSelectionCell(graph.addCell(parent));
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
    this.addMenuItems(menu, ['-', 'recordRSSI'], null, evt);
  };

  // Adds action : recordRSSI
  ui.actions.addAction('recordRSSI', function () {
    // const style = "ellipse;whiteSpace=wrap;html=1;";
    const graph = ui.editor.graph;
    if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
      //  Get data from server.
      return fetchData()
        //  Add the RSSI box.
        .then(rssiData => recordRSSI(graph, rssiData, layerX, layerY))
        .catch((error) => { console.error('recordRSSI', error.message, error.stack); throw error; });
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

/* Test Data
      const rssiData: rssiRecord[] = [
        { bs: 'overall', rssi: -88, color: '#204080', localdatetime: '2017-12-03 04:15' },
        { bs: '1234', rssi: -88, color: '#204080', localdatetime: '2017-12-03 04:15' },
        { bs: '123A', rssi: -98, color: '#404080', localdatetime: '2017-12-03 04:15' },
        { bs: '123C', rssi: -108, color: '#604080', localdatetime: '2017-12-03 04:15' },
        { bs: '12EF', rssi: -118, color: '#a04080', localdatetime: '2017-12-03 04:15' },
      ];
 */