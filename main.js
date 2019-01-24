(function() {
  "use strict";
// alert(dragging);
  // トークンは t-ezaki@sensyn-robotics.com アカウント作成後、https://cesium.com/ にて取得
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMmI1ZjAzNi02MzhhLTRlMDAtODczNi01ZjhlMmM2YjZlNmMiLCJpZCI6NjgwNiwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0NzUyOTE4MX0.T4ABgbi_EFC-fCFaoNoCSq79oLRXQrHEfnjdeBvWA2E';

  // 公式だと 'container' と書かれてるけど、それだと動作しなかった。
  // 参照 [https://cesium.com/content/cesium-world-terrain/]
  // これがデフォルト cesium側のtrrain プロバイダー利用 地形データも対応してるみたい。建物はなくていいのか。

  /*** */
  var viewer = new Cesium.Viewer('cesium', {
    infoBox: false, //Disable InfoBox widget
    selectionIndicator: false, //Disable selection indicator
    shouldAnimate: true, // Enable animations
    terrainProvider: Cesium.createWorldTerrain()
});

//Enable lighting based on sun/moon positions
viewer.scene.globe.enableLighting = true;

//Enable depth testing so things behind the terrain disappear.
viewer.scene.globe.depthTestAgainstTerrain = true;

//Set the random number seed for consistent results.
Cesium.Math.setRandomNumberSeed(3);

//Set bounds of our simulation time
var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
var stop = Cesium.JulianDate.addSeconds(start, 360, new Cesium.JulianDate());

//Make sure viewer is at the desired time.
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
viewer.clock.multiplier = 10;

//Set timeline to simulation bounds
viewer.timeline.zoomTo(start, stop);

//Generate a random circular pattern with varying heights.
// 座標場所を指定
function computeCirclularFlight(lon, lat, radius) {
    var property = new Cesium.SampledPositionProperty();
    // 45度刻みで一周のルートを決めてる
    for (var i = 0; i <= 360; i += 45) { 
        var radians = Cesium.Math.toRadians(i);
        var time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
        // var position = Cesium.Cartesian3.fromDegrees(lon + (radius * 1.5 * Math.cos(radians)), lat + (radius * Math.sin(radians)), Cesium.Math.nextRandomNumber() * 500 + 1750);
        var position = Cesium.Cartesian3.fromDegrees(lon + (radius * 1.5 * Math.cos(radians)), lat + (radius * Math.sin(radians)), Cesium.Math.nextRandomNumber() * 500 + 1750);
        property.addSample(time, position);

        //Also create a point for each sample we generate.
        viewer.entities.add({
            position : position,
            point : {
                pixelSize : 8,
                color : Cesium.Color.TRANSPARENT,
                outlineColor : Cesium.Color.YELLOW,
                outlineWidth : 3
            }
        });
    }
    return property;
}

//Compute the entity position property.
var position = computeCirclularFlight(-112.110693, 36.0994841, 0.03);

//Actually create the entity
var entity = viewer.entities.add({

    //Set the entity availability to the same interval as the simulation time.
    availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
        start : start,
        stop : stop
    })]),

    //Use our computed positions
    position : position,

    //Automatically compute orientation based on position movement.
    orientation : new Cesium.VelocityOrientationProperty(position),

    //Load the Cesium plane model to represent the entity
    model : {
        uri : '/object/Cesium_Air.glb',
        minimumPixelSize : 64
    },

    //Show the path as a pink line sampled in 1 second increments.
    // 点と点を結ぶ線
    path : {
        resolution : 1,
        material : new Cesium.PolylineGlowMaterialProperty({
            glowPower : 0.1,
            color : Cesium.Color.YELLOW
        }),
        width : 10
    }
});

//Add button to view the path from the top down
Sandcastle.addDefaultToolbarButton('View Top Down', function() {
    viewer.trackedEntity = undefined;
    viewer.zoomTo(viewer.entities, new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90)));
});

//Add button to view the path from the side
Sandcastle.addToolbarButton('View Side', function() {
    viewer.trackedEntity = undefined;
    viewer.zoomTo(viewer.entities, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(-90), Cesium.Math.toRadians(-15), 7500));
});

//Add button to track the entity as it moves
Sandcastle.addToolbarButton('View Aircraft', function() {
    viewer.trackedEntity = entity;
});

//Add a combo box for selecting each interpolation mode.
Sandcastle.addToolbarMenu([{
    text : 'Interpolation: Linear Approximation',
    onselect : function() {
        entity.position.setInterpolationOptions({
            interpolationDegree : 1,
            interpolationAlgorithm : Cesium.LinearApproximation
        });
    }
}, {
    text : 'Interpolation: Lagrange Polynomial Approximation',
    onselect : function() {
        entity.position.setInterpolationOptions({
            interpolationDegree : 5,
            interpolationAlgorithm : Cesium.LagrangePolynomialApproximation
        });
    }
}, {
    text : 'Interpolation: Hermite Polynomial Approximation',
    onselect : function() {
        entity.position.setInterpolationOptions({
            interpolationDegree : 2,
            interpolationAlgorithm : Cesium.HermitePolynomialApproximation
        });
    }
}], 'interpolationMenu');


handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(function(movement) {
        var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
        if (cartesian) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
            var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);

            entity.position = cartesian;
            entity.label.show = true;
            entity.label.text =
                'Lon: ' + ('   ' + longitudeString).slice(-7) + '\u00B0' +
                '\nLat: ' + ('   ' + latitudeString).slice(-7) + '\u00B0';
        } else {
            entity.label.show = false;
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

viewer.zoomTo(viewer);
}());

