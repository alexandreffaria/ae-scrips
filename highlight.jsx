app.beginUndoGroup("Eased Relative Split & Trimmed Outro (Difference)");

var comp = app.project.activeItem;

if (comp && comp instanceof CompItem && comp.selectedLayers.length > 0) {
  var layer1 = comp.selectedLayers[0];

  // Setup Timing
  var fps = comp.frameDuration;
  var t0 = comp.time; // Frame 0
  var t20 = t0 + 20 * fps; // Frame 20
  var t30 = t0 + 30 * fps; // Frame 30 (For Evolution)
  var t40 = t0 + 40 * fps; // Frame 40
  var t60 = t0 + 60 * fps; // Frame 60

  var anchorProp1 = layer1
    .property("ADBE Transform Group")
    .property("ADBE Anchor Point");
  var posProp1 = layer1
    .property("ADBE Transform Group")
    .property("ADBE Position");
  var scaleProp1 = layer1
    .property("ADBE Transform Group")
    .property("ADBE Scale");

  // Grab the current properties
  var oldAnchor1 = anchorProp1.value;
  var oldPos1 = posProp1.value;

  // 1. Store the exact scale values when the script is run
  var originalScale = scaleProp1.value;
  var targetScaleX = originalScale[0];
  var targetScaleY = originalScale[1];
  var targetScaleZ = layer1.threeDLayer ? originalScale[2] : 100;

  // Helper Function: Apply Circ In/Out Easing
  function applyCircEase(prop, keyIndex) {
    var easeIn = new KeyframeEase(0, 85); // 0 speed, 85% influence
    var easeOut = new KeyframeEase(0, 85);
    var easeArray = [easeIn, easeIn, easeIn]; // X, Y, Z dimensions
    var outArray = [easeOut, easeOut, easeOut];

    prop.setInterpolationTypeAtKey(
      keyIndex,
      KeyframeInterpolationType.BEZIER,
      KeyframeInterpolationType.BEZIER,
    );
    prop.setTemporalEaseAtKey(keyIndex, easeArray, outArray);
  }

  // ==========================================
  // PART 1: THE GROW (LEFT TO RIGHT)
  // ==========================================
  var rect1 = layer1.sourceRectAtTime(t0, false);
  var anchor1X = rect1.left;
  var anchor1Y = rect1.top + rect1.height / 2;

  var zAnchor1 = layer1.threeDLayer ? oldAnchor1[2] : 0;
  var zPos1 = layer1.threeDLayer ? oldPos1[2] : 0;

  // Compensate position using the dynamic original scale
  var deltaX1 = (anchor1X - oldAnchor1[0]) * (targetScaleX / 100);
  var deltaY1 = (anchor1Y - oldAnchor1[1]) * (targetScaleY / 100);

  anchorProp1.setValue([anchor1X, anchor1Y, zAnchor1]);
  posProp1.setValue([oldPos1[0] + deltaX1, oldPos1[1] + deltaY1, zPos1]);

  while (scaleProp1.numKeys > 0) scaleProp1.removeKey(1);

  // 2. Set keyframes and apply Circ ease
  scaleProp1.setValueAtTime(t0, [0, targetScaleY, targetScaleZ]);
  scaleProp1.setValueAtTime(t20, [targetScaleX, targetScaleY, targetScaleZ]);
  applyCircEase(scaleProp1, 1);
  applyCircEase(scaleProp1, 2);

  // ==========================================
  // PART 2: THE TEXTURE (ROUGHEN EDGES)
  // ==========================================
  var roughen = layer1.property("Effects").addProperty("ADBE Roughen Edges");

  roughen.property("Edge Type").setValue(2);
  roughen.property("Edge Color").setValue([0, 0, 0.8]);
  roughen.property("Border").setValue(50);
  roughen.property("Edge Sharpness").setValue(10);
  roughen.property("Fractal Influence").setValue(0.35);
  roughen.property("Scale").setValue(100);
  roughen.property("Complexity").setValue(10);

  var evoProp = roughen.property("Evolution");
  evoProp.setValueAtTime(t0, 0);
  evoProp.setValueAtTime(t30, 360);
  evoProp.expression = 'loopOut("continue");';

  // ==========================================
  // PART 3: THE SPLIT & SHRINK (RIGHT TO LEFT)
  // ==========================================
  var layer2 = layer1.duplicate();
  layer1.outPoint = t40;
  layer2.inPoint = t40;
  layer2.outPoint = t60; // <--- Trims the layer perfectly here!
  layer2.name = layer1.name + " (Outro)";

  var anchorProp2 = layer2
    .property("ADBE Transform Group")
    .property("ADBE Anchor Point");
  var posProp2 = layer2
    .property("ADBE Transform Group")
    .property("ADBE Position");
  var scaleProp2 = layer2
    .property("ADBE Transform Group")
    .property("ADBE Scale");

  while (scaleProp2.numKeys > 0) scaleProp2.removeKey(1);

  var rect2 = layer2.sourceRectAtTime(t40, false);
  var anchor2X = rect2.left + rect2.width;
  var anchor2Y = rect2.top + rect2.height / 2;

  var oldAnchor2 = anchorProp2.value;
  var oldPos2 = posProp2.value;

  // Shift position using the dynamic original scale
  var deltaX2 = (anchor2X - oldAnchor2[0]) * (targetScaleX / 100);
  var deltaY2 = (anchor2Y - oldAnchor2[1]) * (targetScaleY / 100);

  anchorProp2.setValue([anchor2X, anchor2Y, zAnchor1]);
  posProp2.setValue([oldPos2[0] + deltaX2, oldPos2[1] + deltaY2, zPos1]);

  // 3. Set final keyframes and apply Circ ease
  scaleProp2.setValueAtTime(t40, [targetScaleX, targetScaleY, targetScaleZ]);
  scaleProp2.setValueAtTime(t60, [0, targetScaleY, targetScaleZ]);
  applyCircEase(scaleProp2, 1);
  applyCircEase(scaleProp2, 2);

  // ==========================================
  // PART 4: BLEND MODES
  // ==========================================
  layer1.blendingMode = BlendingMode.DIFFERENCE;
  layer2.blendingMode = BlendingMode.DIFFERENCE;
} else {
  alert("Please select a layer first!");
}

app.endUndoGroup();
