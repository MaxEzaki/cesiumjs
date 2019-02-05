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
    // infoBox: false, //Disable InfoBox widget
    // selectionIndicator: false, //Disable selection indicator
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

// イベントハンドラー 定義
var handler,
    longitude,
    latitude,
    pinBuilder = new Cesium.PinBuilder(),
    height,
    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas),
    pin_position,
    scene = viewer.scene,
    dragging = false,
    arr_poi=Array()
    /**
    // JSON 形式で描画
    yellowPin = [{
        "id" : "document",
        "name" : "CZML Point",
        "version" : "1.0"
    }, {
        "id" : "point 1",
        "name": "point",
        "billboard": {
            "scale": 1
        },
        "position" : {
            // 富士山山頂（経度、緯度、標高）
            "cartographicDegrees" : [138.72711666666666, 35.36564166666666, 3800]
        },
        "point": {
            "color": {
                "rgba": [255, 255, 255, 255]
            },
            "outlineColor": {
                "rgba": [255, 0, 0, 255]
            },
            "outlineWidth" : 4,
            "pixelSize": 20
        }
    }]
     */
    ;
/**
 *  JSON形式にやってみるテスト
var dataSourcePromise = Cesium.CzmlDataSource.load(yellowPin);
viewer.dataSources.add(dataSourcePromise);
 */

/**
 * 左ダブルクリック時アクション
 * アラートで経度緯度と標高表示
 */
handler.setInputAction(
    function(movement) {

        // POIの設置する
        if( longitude!=null && latitude!=null && height!=null){
            console.log('通るよ001');

            console.log( `経度：${longitude} \n緯度：${latitude} \n標高：${height}` );
            putPOI(longitude,latitude,height);
            // POI を配列に格納する
            // console.log(arr_poi);
            arr_poi.push(Cesium.Cartesian3.fromDegrees(longitude,latitude,height));
            console.log(arr_poi);
            addLineBetweenPoi(arr_poi);

            // sampleHeights();
            // console.log(promise);
        }
        else{
            alert('ないよ');
        }

    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
);

/**
 * 左クリックダウン時
 * POIの位置を変える
 */
handler.setInputAction(
    function(click) {
        console.log(`左クリックしたよ=====`);
        var pickedObject = scene.pick(click.position);
        // console.log(pickedObject);
        // console.log(Cesium.defined(pickedObject));
        // console.log(pickedObject.id._id);
        // console.log(yellowPin[1].id);
        // yellowPin = 富士山登頂に置いてるPIN。このインスタンスは動的に生成させたほうがよろしいね。
        if (Cesium.defined(pickedObject) && (pickedObject.id === yellowPin)) {
        // JSON形式のでやってみた結果。ただし、ドラッグドロップが機能しないのでこれはなし。これ自体を飛行させるっていうのには向いてるかもな。
        // if (Cesium.defined(pickedObject) && (pickedObject.id._id === yellowPin[1].id)) {
            
console.log(`動かすよ！`);
            yellowPin.billboard.scale = 1.2;
            // yellowPin[1].billboard.scale = 1.2;
            dragging = true;
            scene.screenSpaceCameraController.enableRotate = false;
        }
console.log(`LEFT_DOWN>>>ドラッグ状況：${dragging}`);
    },
    Cesium.ScreenSpaceEventType.LEFT_DOWN
);

/**
 * 左クリックアップ時
 */
handler.setInputAction(
    function() {
        yellowPin.billboard.scale = 1;
        // yellowPin[1].billboard.scale = 1;
        
        dragging = false;
        scene.screenSpaceCameraController.enableRotate = true;
console.log(`LEFT_UP>>>ドラッグ状況：${dragging}`);
    },
    Cesium.ScreenSpaceEventType.LEFT_UP
);

/**
 * マウスオーバー時＞＞経度緯度取得
 * クリックだと取得できない
 * 高さの取得についての参照先[https://groups.google.com/forum/#!topic/cesium-dev/kDIs_j9zKNI]
 * ドラッグ＆ドロップについて参照先[https://analyticalgraphicsinc.github.io/cesium-google-earth-examples/examples/pinDrag.html]
 */
handler.setInputAction(
    function(movement) {
        var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
        //マウスが地球上にあることを
        if (cartesian) {
            //位置情報を管理するオブジェクトcartographicを取得
            // var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            //緯度経度を小数点10桁で取得
            // longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(10);
            // latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(10);

            var ray = viewer.camera.getPickRay(movement.endPosition);
            var position = viewer.scene.globe.pick(ray, viewer.scene);
            if (Cesium.defined(position)) {
                //位置情報を管理するオブジェクトcartographicを取得
                var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
                height = cartographic.height
                //緯度経度を小数点10桁で取得
                longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(10);
                latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(10);
            }
            // console.log('リアルタイム表示＝＝＝＝＝＝＝＝＝＝');
            // console.log( `経度：${longitude} \n緯度：${latitude} \n標高：${height}` );

            // マウス横の標識を設定＞２Dでしか表示されないのか、これ
            markEntity.position = cartesian;
            markEntity.label.show = true;
            markEntity.label.text =
                'Lon: ' + ('   ' + longitude).slice(-7) + '\u00B0' +
                '\nLat: ' + ('   ' + latitude).slice(-7) + '\u00B0';

            // ドラッグ処理
            if (dragging) {
console.log(`ドラッグしてるよ!!`);
console.log(Cesium.Cartesian3.fromDegrees(longitude,latitude,height));

                // movement.endPosition がウィンドウの位置を示してる？
                // 2Dだとviewer.camera.pickEllipsoid()使ったほうがよさげ。3Dだとなぜか消える。
                // yellowPin.position = viewer.camera.pickEllipsoid(movement.endPosition);
                yellowPin.position = Cesium.Cartesian3.fromDegrees(longitude,latitude,height);

                console.log(`ここに置くで〜！！`);
                console.log(yellowPin.position);
            }

        } else {
            console.log('地球外！！');
            markEntity.label.show = false;
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE
);


/**
 * 青点を設置＞テスト
 */
var redPin = viewer.entities.add({
    name : 'Blank red pin',
    // 指定の場所にポイントを設置
    // position : Cesium.Cartesian3.fromDegrees(-112.1213174224, 36.0902161932, 1111.3939500467302),
    position : Cesium.Cartesian3.fromDegrees(138.433762,35.215631,1111.3939500467302),
    billboard : {
        show : false,
        image : pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL(),
        horizontalOrigin:Cesium.HorizontalOrigin.BOTTOM,
        verticalOrigin : Cesium.VerticalOrigin.BOTTOM
    },
    point : {
        pixelSize : 20,
        color : Cesium.Color.RED,
        outlineWidth: 2,
        outlineColor: Cesium.Color.WHITE
    }
});

var greenPin = viewer.entities.add({
    name : 'Blank green pin',
    // 指定の場所にポイントを設置
    // position : Cesium.Cartesian3.fromDegrees(-112.1213174224, 36.0902161932, 1111.3939500467302),
    position : Cesium.Cartesian3.fromDegrees(138.433762, 35.215631, 1111.3939500467302),
    billboard : {
        show : false,
        image : pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL(),
        horizontalOrigin:Cesium.HorizontalOrigin.CENTER,
        verticalOrigin : Cesium.VerticalOrigin.CENTER
    },
    point : {
        pixelSize : 10,
        color : Cesium.Color.GREEN,
        outlineWidth: 2,
        outlineColor: Cesium.Color.WHITE
    }
});

/**
 * 富士山の登頂
 */
 var yellowPin = viewer.entities.add({
    name : 'Blank yellow pin',
    position : Cesium.Cartesian3.fromDegrees(138.72711666666666, 35.36564166666666, 3800.000),

    billboard : {
        scale: 1
    },

    point : {
        pixelSize :20,
        // color : Cesium.Color.TRANSPARENT,
        color : Cesium.Color.YELLOW,
        outlineColor : Cesium.Color.YELLOW,
        outlineWidth : 3
    }
});


/**
 * 標識表示
 */
var markEntity = viewer.entities.add({
    label : {
        show : false,
        showBackground : true,
        font : '14px monospace',
        horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
        verticalOrigin : Cesium.VerticalOrigin.TOP,
        pixelOffset : new Cesium.Cartesian2(15, 0)
    }
});

/**
 * ピンのposition変更
 */
function putPOI(arg_longitude, arg_latitude, arg_height){

    if( arg_longitude==null&&arg_latitude==null&&arg_height==null ){
        console.log('ピン止められないよ！');
        return;
    }
console.log(`ここにピンおくよ！！！`);
console.log( `経度：${arg_longitude} \n緯度：${arg_latitude} \n標高：${arg_height}` );
    viewer.entities.add({
        name : 'POI pin',

        position : Cesium.Cartesian3.fromDegrees(arg_longitude, arg_latitude, arg_height),
        point : {
            pixelSize : 8,
            color : Cesium.Color.TRANSPARENT,
            outlineColor : Cesium.Color.YELLOW,
            outlineWidth : 3
        }
/***
        // 指定の場所にポイントを設置
        // position : Cesium.Cartesian3.fromDegrees(-112.13315, 36.14703, 2200),
        position: Cesium.Cartesian3.fromDegrees(arg_longitude, arg_latitude, arg_height),
        billboard : {
            show : false,
            image : pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL(),
            verticalOrigin : Cesium.VerticalOrigin.BOTTOM
        },
        point : {
            pixelSize : 20,
            color : Cesium.Color.ROYALBLUE,
            outlineWidth: 2,
            outlineColor: Cesium.Color.WHITE
        }
 */

    });

}

/**
 * 3Dでのポイント設置
 * 参照：[https://cesiumjs.org/Cesium/Apps/Sandcastle/?src=Sample%20Height%20from%203D%20Tiles.html&label=3D%20Tiles]
 */
function sampleHeights(){
console.log('sampleHeights========');
    if (!scene.clampToHeightSupported) {
        console.log('This browser does not support clampToHeightMostDetailed.');
    }
    console.log('sampleHeights 010');
    // viewer.entities.removeAll();

    var cartesian1 = new Cesium.Cartesian3(1216390.063324395, -4736314.814479433, 4081341.9787972216);
    var cartesian2 = new Cesium.Cartesian3(1216329.5413318684, -4736272.029009798, 4081407.9342479417);

    var count = 30;
    var cartesians = new Array(count);
    for (var i = 0; i < count; ++i) {
        var offset = i / (count - 1);
        cartesians[i] = Cesium.Cartesian3.lerp(cartesian1, cartesian2, offset, new Cesium.Cartesian3());
    }
console.log(cartesians);
    scene.clampToHeightMostDetailed(cartesians).then(function(clampedCartesians) {
// console.log(clampedCartesians);
console.log('sampleHeights 020');
        for (var i = 0; i < count; ++i) {
console.log(clampedCartesians[i]);
            viewer.entities.add({
                // position: clampedCartesians[i],
                position: Cesium.Cartesian3.fromDegrees(-112.0203879773 , 36.0810284104 , 788.782136395306),
                ellipsoid : {
                    radii : new Cesium.Cartesian3(2, 2, 2),
                    material : Cesium.Color.RED
                }
            });
        }
    });
}

/**
 * POI同士を線で繋ぐ
 */
function addLineBetweenPoi(arg_arr_position){

    viewer.entities.add({
        polyline : {
            positions : arg_arr_position,
            followSurface : false,
            width : 2,
            material : new Cesium.PolylineOutlineMaterialProperty({
                color : Cesium.Color.RED
            }),
            depthFailMaterial : new Cesium.PolylineOutlineMaterialProperty({
                color : Cesium.Color.RED
            })
        }
    });
}

// 初期表示位置
viewer.zoomTo(yellowPin);
// viewer.zoomTo(dataSourcePromise);

}());

