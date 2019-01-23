(function() {
  "use strict";

  // トークンは t-ezaki@sensyn-robotics.com アカウント作成後、https://cesium.com/ にて取得
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMmI1ZjAzNi02MzhhLTRlMDAtODczNi01ZjhlMmM2YjZlNmMiLCJpZCI6NjgwNiwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0NzUyOTE4MX0.T4ABgbi_EFC-fCFaoNoCSq79oLRXQrHEfnjdeBvWA2E';

  // 公式だと 'container' と書かれてるけど、それだと動作しなかった。'cesium' でおk
  // 参照 [https://cesium.com/content/cesium-world-terrain/]
  // これがデフォルト cesium側のtrrain プロバイダー利用 地形データも対応してるみたい。建物はなくていいのか。


/**
 * 緯度経度をマウスオーバー時に表示する
 */

//デフォルトカメラ位置の登録
var extent = Cesium.Rectangle.fromDegrees(122, 20, 154, 46);
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

//Cesium地図ビューワの作成
var viewer = new Cesium.Viewer('cesium');

//マウスに追従するラベルの設置
var entity = viewer.entities.add({
    label: {
        show: false,
        showBackground: true,
        font: '14px monospace',
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        pixelOffset: new Cesium.Cartesian2(15, 0)
    }
});

/*
 * マウス移動のイベントリスナーを設置
 */
var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(
    function(movement) {
        var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
        //マウスが地球上にあることを
        if (cartesian) {
            //位置情報を管理するオブジェクトcartographicを取得
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            //緯度経度を小数点10桁で取得
            var lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5);
            var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5);

            entity.position = cartesian;
            entity.label.show = true;
            var mesh = lonlat2jmesh(lon, lat);
            if (!mesh) {
                mesh = "範囲外！"
            }
            entity.label.text = 'Lon: ' + lon + '\nLat: ' + lat +
                '\nJAPAN MESH: ' + mesh;

        } else {
            console.log('地球外！！');
            entity.label.show = false;
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

/*
 * Click event 
 */
viewer.canvas.addEventListener('click',
    function(e) {
        var mousePosition = new Cesium.Cartesian2(e.clientX, e.clientY);
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var cartesian = viewer.camera.pickEllipsoid(mousePosition, ellipsoid);
        if (cartesian) {
            //位置情報を管理するオブジェクトcartographicを取得
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            //緯度経度を小数点10桁で取得
            var lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5);
            var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5);
            entity.position = cartesian;
            entity.label.show = true;
            var mesh = lonlat2jmesh(lon, lat);
            if (!mesh) {
                mesh = "範囲外！"
            }
            //コンソールにひっそり
            console.log(lon + ' / ' + lat + ' ' + mesh);　
        }
    }, false);


/**
 *  3次メッシュを算出する関数
 * @param  <Number>  lon (required) 経度 122度以上154度未満
 * @param  <Number>  lat (required) 緯度 20度以上46度未満
 * @return <Number>
 **/
function lonlat2jmesh(lon, lat) {

    if (lat >= 20 && lat < 46 && lon >= 122 && lon < 154) {

        var p = Math.floor(lat * 60 / 40);
        var a = (lat * 60) % 40;
        var q = Math.floor(a / 5);
        var b = a % 5;
        var r = Math.floor(b * 60 / 30);

        var u = Math.floor(lon - 100);
        var f = lon - 100 - u;
        var v = Math.floor((f * 3600) / (7 * 60 + 30));
        var g = (f * 3600) % (7 * 60 + 30);
        var w = Math.floor(g / 45);

        var jmesh = p + "" + u + "" + q + "" + v + "" + r + "" + w;
        return jmesh;
    } else {
        return null;
    }
}

viewer.zoomTo(viewer.entities);

}());

