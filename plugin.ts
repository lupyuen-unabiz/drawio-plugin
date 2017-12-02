/**
 * A draw.io plugin for inserting a custom text (or ellipse) element,
 * either by keyboard Ctrl+Shift+T (or Ctrl+Shift+Q) or by menu
 https://lupyuen-unabiz.github.io/drawio-plugin/plugin.js
 */

// import * as mxEditor from './mxgraph/editor/mxEditor';

class mxApp {
  editor: mxEditor
}

Draw.loadPlugin(function (ui: mxApp) {
  let layerX = 0;
  let layerY = 0;

  ui.editor.graph.addListener(mxEvent.CLICK, function(sender, evt)
  {
    const e = evt.getProperty('event'); // mouse event
    const cell = evt.getProperty('cell'); // cell may be null
    layerX = e.layerX;
    layerY = e.layerY;
    console.log(
      e.view.innerWidth,
      e.layerX,
      e.offsetX,
      e.screenX,
      e.x,
      e,
      cell
    );
    // console.log({ layerX, layerY, e, cell });
    if (cell)
    {
      // Do something useful with cell and consume the event
      // evt.consume();
    }
  });

  /* Finding assigned keys:

    * Open javascript console
    * Draw.valueOf()
    * Traverse to: Object > loadPlugin > <function scope>
                  > ui > keyHandler > controlShiftKeys
    * The number here is ASCII character code
  */

  // Adds resources for actions
  mxResources.parse('myInsertText=Insert text element');
  mxResources.parse('recordRSSI=Record Signal Strength (RSSI)');

  // Adds popup menu : myInsertText, recordRSSI
  var uiCreatePopupMenu = ui.menus.createPopupMenu;
  ui.menus.createPopupMenu = function (menu, cell, evt) {
    uiCreatePopupMenu.apply(this, arguments);
    var graph = ui.editor.graph;
    // if (graph.model.isVertex(graph.getSelectionCell()))
    {
      this.addMenuItems(menu, ['-', 'myInsertText'], null, evt);
      this.addMenuItems(menu, ['-', 'recordRSSI'], null, evt);
    }
  };

  // Adds action : recordRSSI
  ui.actions.addAction('recordRSSI', function () {
    const theGraph = ui.editor.graph;
    if (theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())) {
      const pos = theGraph.getInsertPoint();
      const posx = pos.x;
      const posy = pos.y;
      const stx = theGraph.panningHandler.startX;
      const sty = theGraph.panningHandler.startY;
      // const x = stx + posx;
      // const y = sty + posy;
      const lastMouseX = theGraph.lastMouseX;
      const lastMouseY = theGraph.lastMouseY;
      const screenX = theGraph.popupMenuHandler.screenX;
      const screenY = theGraph.popupMenuHandler.screenY;

      const scale = theGraph.view.scale;
      const translateX = theGraph.view.translate.x;
      const translateY = theGraph.view.translate.y;
      const x = (layerX / scale); // - translateX;
      const y = (layerY / scale); // - translateY;

      console.log({
        x, y,
        layerX, layerY,
        scale, translateX, translateY,
        theGraph,
        obj: this});
      const newElement = new mxCell("",
        new mxGeometry(x, y, 80, 80),
        "ellipse;whiteSpace=wrap;html=1;");
      newElement.vertex = !0;
      theGraph.setSelectionCell(theGraph.addCell(newElement));
    }
  }, null, null, "Ctrl+ShiftR");

  ui.keyHandler.bindAction(81, !0, "recordRSSI", !0);

  ui.actions.addAction('myInsertText', function () {
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

  ui.keyHandler.bindAction(84, !0, "myInsertText", !0);

  // Adds menu
  ui.menubar.addMenu('UnaRadar', function (menu, parent) {
    ui.menus.addMenuItem(menu, 'myInsertText');
    ui.menus.addMenuItem(menu, 'recordRSSI');
  });

  // Reorders menubar
  ui.menubar.container
    .insertBefore(ui.menubar.container.lastChild,
      ui.menubar.container.lastChild.previousSibling.previousSibling);
});