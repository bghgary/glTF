/// <reference path="../../dist/preview release/babylon.d.ts"/>

// Playground like creation of the scene
var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("camera", 4.712, 0.571, 5, BABYLON.Vector3.Zero(), scene);
    camera.wheelPrecision = 100.0;
    camera.attachControl(canvas, true);

    var light = new BABYLON.PointLight("light", new BABYLON.Vector3(1, 1, 0), scene);
    var lightSphere = BABYLON.Mesh.CreateSphere("lightSphere", 16, 0.1, scene);
    lightSphere.position = light.position.scale(1.1);

     var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(1, -1, 0), scene);
     var light2Sphere = BABYLON.Mesh.CreateSphere("light2Sphere", 16, 0.1, scene);
     light2Sphere.position = light2.position.scale(1.1);

    var plane = BABYLON.Mesh.CreatePlane("plane", 2, scene, false);
    plane.rotation.x = Math.PI / 2;
    plane.material = new BABYLON.PBRMaterial("material", scene);
    plane.material.backFaceCulling = false;
    plane.material.twoSidedLighting = true;
    plane.material.metallic = 0;
    plane.material.roughness = 1;
    plane.material.bumpTexture = new BABYLON.Texture("normal.png", scene, true);
    plane.material.invertNormalMapX = true;
    plane.material.invertNormalMapY = true;

    return scene;
};