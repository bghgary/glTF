/// <reference path="babylon.max.js" />

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("camera", 4.712, 0.571, 2, BABYLON.Vector3.Zero(), scene);
    camera.wheelPrecision = 100.0;
    camera.attachControl(canvas, true);

    var light1 = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(1, 0, 0), scene);
    light1.intensity = 0.7;

    var light2 = new BABYLON.DirectionalLight("light2", new BABYLON.Vector3(-1, 0, 0), scene);
    light2.intensity = 0.7;

    var sphere = BABYLON.Mesh.CreateSphere("sphere", 16, 1, scene);
    sphere.material = new BABYLON.PBRMaterial("material", scene);
    sphere.material.metallic = 0;
    sphere.material.roughness = 1;
    sphere.material.bumpTexture = new BABYLON.Texture("../normal.png", scene, true);
    sphere.material.invertNormalMapX = true;
    sphere.material.invertNormalMapY = true;

    return scene;
};