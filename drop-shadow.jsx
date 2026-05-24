(function addDropShadowToSelectedLayers() {
  app.beginUndoGroup("Add Drop Shadow to Selected Layers");

  var comp = app.project.activeItem;
  if (!comp || !(comp instanceof CompItem)) {
    alert("Please select a composition.");
    return;
  }

  var selectedLayers = comp.selectedLayers;
  if (selectedLayers.length === 0) {
    alert("Please select at least one layer.");
    return;
  }

  for (var i = 0; i < selectedLayers.length; i++) {
    var layer = selectedLayers[i];
    var effects = layer.property("ADBE Effect Parade");

    // Only add Drop Shadow if it doesn't already exist
    var hasDropShadow = false;
    for (var j = 1; j <= effects.numProperties; j++) {
      if (effects.property(j).matchName === "ADBE Drop Shadow") {
        hasDropShadow = true;
        break;
      }
    }

    if (!hasDropShadow) {
      var dropShadow = effects.addProperty("ADBE Drop Shadow");
      if (dropShadow) {
        dropShadow.property("ADBE Drop Shadow-0002").setValue(166); // opacity
        dropShadow.property("ADBE Drop Shadow-0004").setValue(100); // Distance
        dropShadow.property("ADBE Drop Shadow-0005").setValue(200); // Softness
      }
    }
  }

  app.endUndoGroup();
})();
