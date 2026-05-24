app.beginUndoGroup("Split & Reverse Scale Flow with Texture");

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

  // ==========================================
  // PART 1: THE GROW (LEFT TO RIGHT)
  // ==========================================
  var rect1 = layer1.sourceRectAtTime(t0, false);
  var anchor1X = rect1.left;
  var anchor1Y = rect1.top + rect1.height / 2;

  var anchorProp1 = layer1
    .property("ADBE Transform Group")
    .property("ADBE Anchor Point");
  var posProp1 = layer1
    .property("ADBE Transform Group")
    .property("ADBE Position");
  var scaleProp1 = layer1
    .property("ADBE Transform Group")
    .property("ADBE Scale");

  var oldAnchor1 = anchorProp1.value;
  var oldPos1 = posProp1.value;
  var scale1 = scaleProp1.value;

  var zAnchor1 = layer1.threeDLayer ? oldAnchor1[2] : 0;
  var zPos1 = layer1.threeDLayer ? oldPos1[2] : 0;
  var zScale1 = layer1.threeDLayer ? scale1[2] : 100;

  var deltaX1 = (anchor1X - oldAnchor1[0]) * (scale1[0] / 100);
  var deltaY1 = (anchor1Y - oldAnchor1[1]) * (scale1[1] / 100);

  anchorProp1.setValue([anchor1X, anchor1Y, zAnchor1]);
  posProp1.setValue([oldPos1[0] + deltaX1, oldPos1[1] + deltaY1, zPos1]);

  // Clear old scale keyframes and set the first animation
  while (scaleProp1.numKeys > 0) scaleProp1.removeKey(1);
  scaleProp1.setValueAtTime(t0, [0, 100, zScale1]);
  scaleProp1.setValueAtTime(t20, [100, 100, zScale1]);

  // ==========================================
  // PART 2: THE TEXTURE (ROUGHEN EDGES)
  // ==========================================
  var roughen = layer1.property("Effects").addProperty("ADBE Roughen Edges");

  roughen.property("Edge Type").setValue(2); // 2 = Roughen Color
  roughen.property("Edge Color").setValue([0, 0, 0.8]); // Dark Blue (RGB normalized to 0-1)
  roughen.property("Border").setValue(75);
  roughen.property("Edge Sharpness").setValue(10);
  roughen.property("Fractal Influence").setValue(0.35);
  roughen.property("Scale").setValue(100);
  roughen.property("Complexity").setValue(10);

  // Animate Evolution (360 degrees = 1 full revolution)
  var evoProp = roughen.property("Evolution");
  evoProp.setValueAtTime(t0, 0);
  evoProp.setValueAtTime(t30, 360);
  evoProp.expression = 'loopOut("continue");';

  // ==========================================
  // PART 3: THE SPLIT & SHRINK (RIGHT TO LEFT)
  // ==========================================
  // Split the layer at Frame 40
  var layer2 = layer1.duplicate(); // Duplicates layer WITH the Roughen Edges effect & expression!
  layer1.outPoint = t40;
  layer2.inPoint = t40;
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

  // Clear the inherited scale keyframes from the duplicated layer
  while (scaleProp2.numKeys > 0) scaleProp2.removeKey(1);

  // Temporarily set scale to 100% to calculate the shift perfectly
  scaleProp2.setValue([100, 100, zScale1]);

  var rect2 = layer2.sourceRectAtTime(t40, false);
  var anchor2X = rect2.left + rect2.width; // Middle-Right
  var anchor2Y = rect2.top + rect2.height / 2; // Middle-Right

  var oldAnchor2 = anchorProp2.value;
  var oldPos2 = posProp2.value;

  var deltaX2 = anchor2X - oldAnchor2[0];
  var deltaY2 = anchor2Y - oldAnchor2[1];

  anchorProp2.setValue([anchor2X, anchor2Y, zAnchor1]);
  posProp2.setValue([oldPos2[0] + deltaX2, oldPos2[1] + deltaY2, zPos1]);

  // Set the final shrink animation keyframes
  scaleProp2.setValueAtTime(t40, [100, 100, zScale1]);
  scaleProp2.setValueAtTime(t60, [0, 100, zScale1]);
} else {
  alert("Please select a layer first!");
}

app.endUndoGroup();
