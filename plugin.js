/* A draw.io plugin for inserting a UnaRadar coverage data element,
either by right click or keyboard Ctrl+Shift+R or by menu.
Add this plugin to your draw.io file:
https://unabelldemo.au.meteorapp.com/plugin/${deviceID}
Originally at https://lupyuen-unabiz.github.io/drawio-plugin/plugin.js */
var deviceID = '2C30EB';
var dataURL = "https://unabelldemo.au.meteorapp.com/rssidata/" + deviceID;
var frameURL = "https://unabelldemo.au.meteorapp.com/done/" + deviceID;
var frameCellID = 'UnaRadarFrame';
var frameHandleWidth = 20;
var chartCellID = 'UnaRadarChartFrame';
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
    //  Fetch RSSI data for the device ID:
    //  http://.../rssidata/2C30EB?seqNumber=3158&baseStationHour=420073&baseStationSecond=1512265643
    //  Returns a promise.
    return new Promise(function (accept, reject) {
        var r = new XMLHttpRequest();
        r.open("GET", dataURL, true);
        r.onreadystatechange = function () {
            if (r.readyState != 4 || r.status != 200)
                return; // reject(new Error(r.responseText));
            console.log(dataURL + ": " + r.responseText);
            return accept(JSON.parse(r.responseText));
        };
        // r.send("banana=yellow");
        r.send();
    });
}
var chartObj = null;
var chartError = false;
function initChart(canvas) {
    //  Init the chart data.
    if (chartObj || chartError)
        return;
    var ctx = canvas.getContext('2d');
    if (!Chart) {
        console.error('chartjs not installed');
        chartError = true;
        return;
    }
    console.log('initChart - create chart');
    chartObj = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
            datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                        'rgba(255, 159, 64, 0.5)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
        },
        options: {
            scales: {
                yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
            }
        }
    });
}
function addUpdateChart(graph) {
    //  Add a sample Chart.js chart.  If it exists, update the position and size.
    if (!graph || !graph.model || !graph.model.cells)
        return;
    var canvasCell = graph.model.cells.UnaRadarChartFrame;
    if (!canvasCell || !canvasCell.geometry)
        return;
    //  Get the view info.
    var view = graph.view;
    var scale = view.scale;
    var translateX = view.translate.x;
    var translateY = view.translate.y;
    //  Transform the cell dimensions into HTML.
    var geometry = canvasCell.geometry;
    var mxX = geometry.x + frameHandleWidth;
    var mxY = geometry.y;
    var mxWidth = geometry.width - (frameHandleWidth * 2);
    var mxHeight = geometry.height;
    var _a = mxToHTML(mxX, mxY, translateX, translateY, scale), htmlX = _a.htmlX, htmlY = _a.htmlY;
    //  Create the HTML Canvas Element if not created.
    // <canvas id="myChart" width="400" height="400"></canvas>
    var canvasEl = document.getElementById(chartCellID);
    if (!canvasEl) {
        console.log('addUpdateChart = create canvas');
        canvasEl = document.createElement('canvas');
        canvasEl.id = chartCellID;
        canvasEl.style.position = 'absolute';
        canvasEl.style.left = htmlX + 'px';
        canvasEl.style.top = htmlY + 'px';
        canvasEl.style.width = (mxWidth * scale) + 'px';
        canvasEl.style.height = (mxHeight * scale) + 'px';
        graph.container.appendChild(canvasEl);
        initChart(canvasEl);
        return;
    }
    //  Else update the HTML dimensions.
    canvasEl.style.left = htmlX + 'px';
    canvasEl.style.top = htmlY + 'px';
    canvasEl.style.width = (mxWidth * scale) + 'px';
    canvasEl.style.height = (mxHeight * scale) + 'px';
}
function addUpdateFrame(graph) {
    //  Add the frame for UnaRadar.  If it exists, update the position and size.
    //  Add or update chart.
    addUpdateChart(graph);
    if (!graph || !graph.model || !graph.model.cells)
        return;
    var frameCell = graph.model.cells.UnaRadarFrame;
    if (!frameCell || !frameCell.geometry)
        return;
    //  Get the view info.
    var view = graph.view;
    var scale = view.scale;
    var translateX = view.translate.x;
    var translateY = view.translate.y;
    //  Transform the cell dimensions into HTML.
    var geometry = frameCell.geometry;
    var mxX = geometry.x + frameHandleWidth;
    var mxY = geometry.y;
    var mxWidth = geometry.width - (frameHandleWidth * 2);
    var mxHeight = geometry.height;
    var _a = mxToHTML(mxX, mxY, translateX, translateY, scale), htmlX = _a.htmlX, htmlY = _a.htmlY;
    //  Create the HTML Frame Element if not created.
    var frameEl = document.getElementById(frameCellID);
    if (!frameEl) {
        frameEl = document.createElement('iframe');
        frameEl.id = frameCellID;
        frameEl.src = frameURL;
        frameEl.scrolling = 'no';
        frameEl.allow = 'geolocation; microphone; camera';
        frameEl.style.position = 'absolute';
        frameEl.style.left = htmlX + 'px';
        frameEl.style.top = htmlY + 'px';
        frameEl.style.width = (mxWidth * scale) + 'px';
        frameEl.style.height = (mxHeight * scale) + 'px';
        graph.container.appendChild(frameEl);
        return;
    }
    //  Else update the HTML dimensions.
    frameEl.style.left = htmlX + 'px';
    frameEl.style.top = htmlY + 'px';
    frameEl.style.width = (mxWidth * scale) + 'px';
    frameEl.style.height = (mxHeight * scale) + 'px';
}
function htmlToMX(htmlX, htmlY, translateX, translateY, scale) {
    //  Convert HTML coordinates to mxGraph/SVG.
    var x = (htmlX / scale) - translateX;
    var y = (htmlY / scale) - translateY;
    return { x: x, y: y };
}
function mxToHTML(mxX, mxY, translateX, translateY, scale) {
    //  Convert mxGraph/SVG coordinates to HTML.
    var htmlX = (mxX + translateX) * scale;
    var htmlY = (mxY + translateY) * scale;
    return { htmlX: htmlX, htmlY: htmlY };
}
function recordRSSI(graph, rssiData, layerX, layerY) {
    //  Plot a box of RSSI data on the clicked point.
    //  Compute dimensions of parent.
    var startSize = 50;
    var childHeight = 30;
    var infoHeight = 30; //  Info box at bottom.
    var parentWidth = 154;
    var parentHeight = startSize + infoHeight + childHeight * (rssiData.length - 1);
    //  Get the graph view parameters.
    var scale = graph.view.scale;
    var translateX = graph.view.translate.x;
    var translateY = graph.view.translate.y;
    var _a = htmlToMX(layerX, layerY, translateX, translateY, scale), x = _a.x, y = _a.y;
    // console.log({ x, y, layerX, layerY, scale, translateX, translateY, theGraph, obj: this});
    //  Create parent.
    var parentGeometry = new mxGeometry(x, y, parentWidth, parentHeight);
    //  Set the collapsed parent dimensions.
    parentGeometry.alternateBounds = { x: x, y: y, width: parentWidth, height: startSize };
    var parentColor = rssiData[0].color;
    var parentStyle = [
        'swimlane;fontStyle=1;childLayout=stackLayout',
        "horizontal=1;startSize=" + startSize + ";horizontalStack=0",
        'resizeParent=1;resizeLast=0;collapsible=1',
        "marginBottom=0;swimlaneFillColor=" + parentColor + ";shadow=1",
        'gradientColor=none;opacity=50'
    ].join(';');
    var parentId = "rssi" + Date.now();
    var parentRec = rssiData.filter(function (rec) { return (rec.bs === 'overall'); })[0];
    var parentRSSI = parentRec.rssi;
    var datetime = parentRec.localdatetime;
    var parentValue = "RSSI " + parentRSSI + " dBm\n" + datetime;
    var parent = new mxCell(parentValue, parentGeometry, parentStyle);
    parent.vertex = !0;
    parent.setId(parentId);
    var childY = startSize;
    //  Create child for each record.
    rssiData.filter(function (rec) { return (rec.bs !== 'overall'); })
        .forEach(function (rec) {
        //  bs = '1234', rssi = -88, color = '#203040';
        var childId = "child_" + rec.bs + "_" + Date.now();
        var childValue = "BS " + rec.bs + ": " + ((rec.rssi <= -100) ? rec.rssi : (' ' + rec.rssi)) + " dBm";
        var childGeometry = new mxGeometry(0, childY, parentWidth, childHeight);
        var childStyle = [
            'text;strokeColor=none',
            "fillColor=" + rec.color + ";opacity=50",
            'shadow=1;align=center;verticalAlign=middle',
            'fontStyle=1;fontColor=#FFFFFF'
        ].join(';');
        var child = new mxCell(childValue, childGeometry, childStyle);
        child.vertex = !0;
        child.setId(childId);
        parent.insert(child);
        childY += childHeight;
    });
    //  Add the info box.
    var infoRec = parentRec;
    var infoId = "info" + Date.now();
    var infoValue = infoRec.device + " - " + infoRec.seqNumber + " - \n" + infoRec.baseStationSecond;
    var infoGeometry = new mxGeometry(0, childY, parentWidth, infoHeight);
    var infoStyle = [
        'text;strokeColor=none',
        "fillColor=#202020;opacity=40",
        'shadow=1;align=center;verticalAlign=middle',
        'fontColor=#ffffff;fontStyle=2;fontSize=10'
    ].join(';');
    var info = new mxCell(infoValue, infoGeometry, infoStyle);
    info.vertex = !0;
    info.setId(infoId);
    parent.insert(info);
    childY += infoHeight;
    //  Add the parent.
    graph.setSelectionCell(graph.addCell(parent));
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
        window.setTimeout(function () { return addUpdateFrame(ui.editor.graph); }, 0);
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
        window.setTimeout(function () { return addUpdateFrame(ui.editor.graph); }, 0);
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
        var graph = ui.editor.graph;
        if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
            //  Get data from server.
            return fetchData()
                .then(function (rssiData) { return recordRSSI(graph, rssiData, layerX, layerY); })
                .catch(function (error) { console.error('recordRSSI', error.message, error.stack); throw error; });
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
/* Test Data
      const rssiData: rssiRecord[] = [
        { bs: 'overall', rssi: -88, color: '#204080', localdatetime: '2017-12-03 04:15' },
        { bs: '1234', rssi: -88, color: '#204080', localdatetime: '2017-12-03 04:15' },
        { bs: '123A', rssi: -98, color: '#404080', localdatetime: '2017-12-03 04:15' },
        { bs: '123C', rssi: -108, color: '#604080', localdatetime: '2017-12-03 04:15' },
        { bs: '12EF', rssi: -118, color: '#a04080', localdatetime: '2017-12-03 04:15' },
      ];
 */ 
