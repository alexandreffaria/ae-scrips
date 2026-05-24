app.beginUndoGroup("Smeary Spline Fractal Dissolve");

var comp = app.project.activeItem;

if (comp && comp instanceof CompItem && comp.selectedLayers.length > 0) {
  var targetLayer = comp.selectedLayers[0];

  // Grab exact dimensions
  var targetW = targetLayer.width ? Math.round(targetLayer.width) : comp.width;
  var targetH = targetLayer.height
    ? Math.round(targetLayer.height)
    : comp.height;
  var targetAspect = targetLayer.source
    ? targetLayer.source.pixelAspect
    : comp.pixelAspect;

  // 1. Create Matte
  var matteLayer = comp.layers.addSolid(
    [1, 1, 1],
    targetLayer.name + " - Fractal Matte",
    targetW,
    targetH,
    targetAspect,
    comp.duration,
  );
  matteLayer.moveBefore(targetLayer);
  matteLayer.inPoint = targetLayer.inPoint;
  matteLayer.outPoint = targetLayer.outPoint;

  // 2. Align and Parent
  matteLayer.threeDLayer = targetLayer.threeDLayer;
  matteLayer.parent = targetLayer;

  var targetAnchor = targetLayer
    .property("ADBE Transform Group")
    .property("ADBE Anchor Point").value;
  var is3D = targetLayer.threeDLayer;

  matteLayer
    .property("ADBE Transform Group")
    .property("ADBE Position")
    .setValue(targetAnchor);
  matteLayer
    .property("ADBE Transform Group")
    .property("ADBE Anchor Point")
    .setValue(
      is3D ? [targetW / 2, targetH / 2, 0] : [targetW / 2, targetH / 2],
    );
  matteLayer
    .property("ADBE Transform Group")
    .property("ADBE Scale")
    .setValue(is3D ? [100, 100, 100] : [100, 100]);

  if (is3D) {
    matteLayer
      .property("ADBE Transform Group")
      .property("ADBE X Rotation")
      .setValue(0);
    matteLayer
      .property("ADBE Transform Group")
      .property("ADBE Y Rotation")
      .setValue(0);
    matteLayer
      .property("ADBE Transform Group")
      .property("ADBE Z Rotation")
      .setValue(0);
    matteLayer
      .property("ADBE Transform Group")
      .property("ADBE Orientation")
      .setValue([0, 0, 0]);
  } else {
    matteLayer
      .property("ADBE Transform Group")
      .property("ADBE Rotate Z")
      .setValue(0);
  }

  // 3. Add and configure Fractal Noise using Match Names
  var fn = matteLayer.property("Effects").addProperty("ADBE Fractal Noise");

  // Your exact design requirements injected securely
  fn.property("ADBE Fractal Noise-0001").setValue(8); // Fractal Type = Smeary
  fn.property("ADBE Fractal Noise-0002").setValue(4); // Noise Type = Spline
  fn.property("ADBE Fractal Noise-0004").setValue(200); // Contrast = 200
  fn.property("ADBE Fractal Noise-0015").setValue(4); // Complexity = 4
  fn.property("ADBE Fractal Noise-0010").setValue(200); // Scale = 200 (No nested groups!)

  // Helper Function: Apply 1D Circ In/Out Easing
  function applyCircEase1D(prop, keyIndex) {
    var easeIn = new KeyframeEase(0, 85);
    var easeOut = new KeyframeEase(0, 85);
    prop.setInterpolationTypeAtKey(
      keyIndex,
      KeyframeInterpolationType.BEZIER,
      KeyframeInterpolationType.BEZIER,
    );
    prop.setTemporalEaseAtKey(keyIndex, [easeIn], [easeOut]);
  }

  // Setup Timing
  var fps = comp.frameDuration;
  var t0 = comp.time;
  var t30 = t0 + 30 * fps;

  // Animate Brightness
  var brightness = fn.property("ADBE Fractal Noise-0005");
  brightness.setValueAtTime(t0, 150);
  brightness.setValueAtTime(t30, -150);
  applyCircEase1D(brightness, 1);
  applyCircEase1D(brightness, 2);

  // Animate Evolution
  var evolution = fn.property("ADBE Fractal Noise-0023");
  evolution.setValueAtTime(t0, 0);
  evolution.setValueAtTime(t30, 90);
  applyCircEase1D(evolution, 1);
  applyCircEase1D(evolution, 2);

  // 4. Set Track Matte
  if (typeof targetLayer.setTrackMatte !== "undefined") {
    targetLayer.setTrackMatte(matteLayer, TrackMatteType.LUMA);
  } else {
    targetLayer.trackMatteType = TrackMatteType.LUMA;
  }

  matteLayer.enabled = false;
} else {
  alert("Please select your b-roll layer first!");
}

app.endUndoGroup();
