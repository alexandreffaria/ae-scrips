app.beginUndoGroup("Eased 3D Slide and Swing");

var comp = app.project.activeItem;

if (comp && comp instanceof CompItem && comp.selectedLayers.length > 0) {
  var layer = comp.selectedLayers[0];

  // 1. Make sure the layer is 3D FIRST so all properties update to 3 axes
  layer.threeDLayer = true;

  // Setup Timing
  var fps = comp.frameDuration;
  var t0 = comp.time; // Frame 0 (Start)
  var t20 = t0 + 20 * fps; // Frame 20 (Arrive)
  var t40 = t0 + 40 * fps; // Frame 40 (Leave)
  var t60 = t0 + 60 * fps; // Frame 60 (End)

  var posProp = layer
    .property("ADBE Transform Group")
    .property("ADBE Position");
  var anchorProp = layer
    .property("ADBE Transform Group")
    .property("ADBE Anchor Point");
  var scaleProp = layer.property("ADBE Transform Group").property("ADBE Scale");
  var orientProp = layer
    .property("ADBE Transform Group")
    .property("ADBE Orientation");

  var currentPos = posProp.value;
  var anchor = anchorProp.value;
  var scale = scaleProp.value;
  var currentOrient = orientProp.value;

  // Helper Function: Apply Spatial Circ In/Out Easing (Requires EXACTLY 1 element array)
  function applySpatialCircEase(prop, keyIndex) {
    var easeIn = new KeyframeEase(0, 85); // 0 speed, 85% influence
    var easeOut = new KeyframeEase(0, 85);

    prop.setInterpolationTypeAtKey(
      keyIndex,
      KeyframeInterpolationType.BEZIER,
      KeyframeInterpolationType.BEZIER,
    );
    // Spatial properties strictly require a 1-element array
    prop.setTemporalEaseAtKey(keyIndex, [easeIn], [easeOut]);
  }

  // 2. Measure the layer boundaries
  var rect = layer.sourceRectAtTime(t0, false);
  var scaleX = Math.abs(scale[0] / 100);

  // 3. Calculate off-screen distances
  var rightEdgeOffset = (rect.left + rect.width - anchor[0]) * scaleX;
  var leftEdgeOffset = (rect.left - anchor[0]) * scaleX;
  var offScreenLeftX = 0 - rightEdgeOffset - 500;
  var offScreenRightX = comp.width - leftEdgeOffset + 500;

  // 4. Clear any existing Position/Orientation keyframes
  while (posProp.numKeys > 0) posProp.removeKey(1);
  while (orientProp.numKeys > 0) orientProp.removeKey(1);

  // 5. Set Position Keyframes & Apply Spatial Easing
  posProp.setValueAtTime(t0, [offScreenLeftX, currentPos[1], currentPos[2]]);
  posProp.setValueAtTime(t20, currentPos);
  posProp.setValueAtTime(t40, currentPos);
  posProp.setValueAtTime(t60, [offScreenRightX, currentPos[1], currentPos[2]]);

  applySpatialCircEase(posProp, 1);
  applySpatialCircEase(posProp, 2);
  applySpatialCircEase(posProp, 3);
  applySpatialCircEase(posProp, 4);

  // 6. Set Orientation Keyframes (Y-Axis Swing) & Apply Spatial Easing
  orientProp.setValueAtTime(t0, [currentOrient[0], 340, currentOrient[2]]);
  orientProp.setValueAtTime(t20, [currentOrient[0], 360, currentOrient[2]]);
  orientProp.setValueAtTime(t40, [currentOrient[0], 360, currentOrient[2]]);
  orientProp.setValueAtTime(t60, [currentOrient[0], 20, currentOrient[2]]);

  applySpatialCircEase(orientProp, 1);
  applySpatialCircEase(orientProp, 2);
  applySpatialCircEase(orientProp, 3);
  applySpatialCircEase(orientProp, 4);
} else {
  alert("Please select a layer first!");
}

app.endUndoGroup();
