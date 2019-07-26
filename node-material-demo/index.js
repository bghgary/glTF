/// <reference path="./scripts/babylon.d.ts" />

function createScene(canvas, afterRender) {
    var engine = new BABYLON.Engine(canvas);
    var scene = new BABYLON.Scene();

    BABYLON.SceneLoader.ImportMeshAsync(null, "./matcap/BabylonShaderBall.gltf").then(function (result) {
        scene.createDefaultCamera(true, true, true);
        scene.activeCamera.useAutoRotationBehavior = true;
        scene.activeCamera.autoRotationBehavior.idleRotationSpeed = 0.5;
        scene.activeCamera.autoRotationBehavior.idleRotationWaitTime = 0.5;

        var ball = result.meshes[1];

        var material = new BABYLON.NodeMaterial("matcap");
        material.sideOrientation = BABYLON.PBRMaterial.ClockWiseSideOrientation;
        material.setToDefault();
        material.build();

        ball.material.dispose();
        ball.material = material;

        engine.runRenderLoop(function() {
            scene.render();
            afterRender(engine, scene);
        });

        scene.debugLayer.show();
    });

    window.addEventListener("resize", function() {
        engine.resize();
    });
}