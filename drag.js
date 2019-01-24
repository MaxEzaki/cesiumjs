var dragging = false;
var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
handler.setInputAction(
    function(click) {
        var pickedObject = scene.pick(click.position);
        if (Cesium.defined(pickedObject) && (pickedObject.id === entity)) {
            entity.billboard.scale = 1.2;
            dragging = true;
            scene.screenSpaceCameraController.enableRotate = false;
        }
    },
    Cesium.ScreenSpaceEventType.LEFT_DOWN
);

handler.setInputAction(
    function(movement) {
        if (dragging) {
            entity.position = camera.pickEllipsoid(movement.endPosition);
        }
    },
    Cesium.ScreenSpaceEventType.MOUSE_MOVE
);

handler.setInputAction(
    function() {
        entity.billboard.scale = 1;
        dragging = false;
        scene.screenSpaceCameraController.enableRotate = true;
    },
    Cesium.ScreenSpaceEventType.LEFT_UP
);