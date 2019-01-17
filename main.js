(function() {
  "use strict";

  // トークンは t-ezaki@sensyn-robotics.com アカウント作成後、https://cesium.com/ にて取得
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMmI1ZjAzNi02MzhhLTRlMDAtODczNi01ZjhlMmM2YjZlNmMiLCJpZCI6NjgwNiwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0NzUyOTE4MX0.T4ABgbi_EFC-fCFaoNoCSq79oLRXQrHEfnjdeBvWA2E';

  // 公式だと 'container' と書かれてるけど、それだと動作しなかった。
  // 参照 [https://cesium.com/content/cesium-world-terrain/]
  var viewer = new Cesium.Viewer('cesium', {
    terrainProvider : Cesium.createWorldTerrain({
      requestWaterMask : true,
      requestVertexNormals : true
    })
  });

/** この書き方だとurl参照して行けそうだけど、リンク先が503で死亡
    var viewer = new Cesium.Viewer('cesium');
    var terrainProvider = new Cesium.CesiumTerrainProvider({
        url : '//assets.agi.com/stk-terrain/world'
    });
    viewer.terrainProvider = terrainProvider;
 */

 /*** maptiler cloud を利用した場合 */
// var viewer = new Cesium.Viewer('cesium');
// viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
//   url: 'https://maps.tilehosting.com/data/terrain-quantized-mesh/?key=QrLkKggvgrAi6u8gjhzQ#' // get your own key at https://cloud.maptiler.com/
// });


// [PNG標高タイルTerrainProvider](https://gsj-seamless.jp/labs/elev2/tools/terrainProvider.html) を参照
// 結果：エラー表示された
  // viewer.scene.terrainProvider = new Cesium.PngElevationTileTerrainProvider();
  // new Cesium.PngElevationTileTerrainProvider(  )


// var viewer = new Cesium.Viewer("cesium");

  // 最初から日本を表示させる
  // viewer.camera.setView({
  //   destination: Cesium.Cartesian3.fromDegrees(138, 30, 3000000),
  //   orientation: {
  //     heading: 0, // 水平方向の回転度（ラジアン）
  //     pitch: -1.3, // 垂直方向の回転度（ラジアン） 上を見上げたり下を見下ろしたり
  //     roll: 0
  //   }
  // });

  // KMLを表示させてみる例。your.kml を表示させたいKMLへのパスに変えるだけ。
  // viewer.dataSources.add(Cesium.KmlDataSource.load("your.kml"));

/***
  var point = viewer.entities.add({
    name:"福井市", //レイヤ名
    description:"ここは福井市です。",　//レイヤの説明
      position : Cesium.Cartesian3.fromDegrees(136.223554,36.061957,0), //経度,緯度,高さ
      point : {
          pixelSize : 10, //ポイントのサイズ
          color : Cesium.Color.BLUE //ポイントの色
      }
  });
  viewer.zoomTo(viewer.entities);　//レイヤにズーム
***/
/** ラインを追加する
  var redLine = viewer.entities.add({
    name:"九頭竜川",
    description:"ここは九頭竜川です。",　
    polyline : {
        positions : Cesium.Cartesian3.fromDegreesArrayHeights([136.137600,36.218795,0,
          136.146183,36.210070,0,
          136.147385,36.197465,0,
          136.155109,36.191923,0,
          136.157513,36.188183,0,
          136.154938,36.182364,0,
          136.146870,36.175574,0]),
        width : 5,
        material : Cesium.Color.RED,
    }
});

viewer.zoomTo(viewer.entities);
**/

/**ポリゴンを追加する ←できないな、これ
var polygon = viewer.entities.add({
  name:"福井県庁",
  description:"ここは福井県庁です。",　
  polygon : {
      hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([
        136.220266, 36.066095,0,
        136.220287, 36.063848,0,
        136.221542, 36.063857,0,
        136.222444, 36.063978,0,
        136.222529, 36.064239,0,
        136.223495, 36.064516,0,
        136.223238, 36.065704,0,
        136.223034, 36.065722,0,
        136.222948, 36.066190,0,
        136.222315, 36.066138,0,
        136.221435,36.066216,0]),
      extrudedHeight: 333.0,
      width : 5,
      material : Cesium.Color.RED.withAlpha(0.5),
      outline : true,
      outlineColor : Cesium.Color.BLACK
  }
});
*/

/**視点を変更する 
viewer.camera.flyTo({   
  destination : Cesium.Cartesian3.fromDegrees(136.194763, 36.047711, 45000.0)});
*/
/**サンプルKMZデータで描画 */
// var tileset = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//       url: Cesium.IonResource.fromAssetId(13995)
//   })
// );

// var tileset = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//       url: Cesium.IonResource.fromAssetId(14002)
//   })
// );

// var tileset =viewer.dataSources.add(Cesium.KmlDataSource.load("./KML/buffetthawaiitour.kmz"));

// viewer.zoomTo(tileset)
}());

