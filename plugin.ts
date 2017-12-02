/**
 * A draw.io plugin for inserting a custom text (or ellipse) element,
 * either by keyboard Ctrl+Shift+T (or Ctrl+Shift+Q) or by menu
https://lupyuen-unabiz.github.io/drawio-plugin/plugin.js
 */
Draw.loadPlugin(function(ui) {
    /* Finding assigned keys:

      * Open javascript console
      * Draw.valueOf()
      * Traverse to: Object > loadPlugin > <function scope>
                    > ui > keyHandler > controlShiftKeys
      * The number here is ASCII character code
    */

    // Adds resources for actions
    mxResources.parse('myInsertText=Insert text element');
    mxResources.parse('myInsertEllipse=Insert ellipse');

    // Adds popup menu : myInsertText, myInsertEllipse
    var uiCreatePopupMenu = ui.menus.createPopupMenu;
    ui.menus.createPopupMenu = function(menu, cell, evt) {
        uiCreatePopupMenu.apply(this, arguments);
        var graph = ui.editor.graph;
        // if (graph.model.isVertex(graph.getSelectionCell()))
        {
            this.addMenuItems(menu, ['-', 'myInsertText'], null, evt);
            this.addMenuItems(menu, ['-', 'myInsertEllipse'], null, evt);
        }
    };

    // Adds action : myInsertEllipse
    ui.actions.addAction('myInsertEllipse', function() {
        var theGraph = ui.editor.graph;
        if(theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())){
            var pos=theGraph.getInsertPoint();
            var newElement=new mxCell("",
                new mxGeometry(pos.x, pos.y, 80, 80),
                "ellipse;whiteSpace=wrap;html=1;");
            newElement.vertex=!0;
            theGraph.setSelectionCell(theGraph.addCell(newElement));
            console.log({ pos, theGraph, obj: this });
        }
    }, null, null, "Ctrl+ShiftR");

    ui.keyHandler.bindAction(81, !0, "myInsertEllipse", !0);

    ui.actions.addAction('myInsertText', function() {
        var theGraph = ui.editor.graph;
        if(theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())){
            var pos=theGraph.getInsertPoint();
            var newElement=new mxCell("",
                new mxGeometry(pos.x, pos.y, 80, 80),
                "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;whiteSpace=wrap;overflow=auto");
            newElement.vertex=!0;
            theGraph.setSelectionCell(theGraph.addCell(newElement))
        }
    }, null, null, "Ctrl+Shift+T");

    ui.keyHandler.bindAction(84, !0, "myInsertText", !0);

    // Adds menu
    ui.menubar.addMenu('My Menu', function(menu, parent) {
        ui.menus.addMenuItem(menu, 'myInsertText');
        ui.menus.addMenuItem(menu, 'myInsertEllipse');
    });

    // Reorders menubar
    ui.menubar.container
        .insertBefore(ui.menubar.container.lastChild,
            ui.menubar.container.lastChild.previousSibling.previousSibling);
});