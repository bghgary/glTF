/// <reference path="./scripts/babylon.d.ts" />

function createScene(canvas, afterRender) {
    var engine = new BABYLON.Engine(canvas);
    var scene = new BABYLON.Scene();

    BABYLON.SceneLoader.AppendAsync("./matcap/BabylonShaderBall_Simple.gltf").then(function () {
        scene.createDefaultCamera(true, true, true);

        var material = new BABYLON.NodeMaterial("matcap");
        material.sideOrientation = BABYLON.PBRMaterial.ClockWiseSideOrientation;
        material.setToDefault();
        material.build();

        for (var mesh of scene.meshes) {
            mesh.material = material;
        }

        engine.runRenderLoop(function() {
            scene.render();
            afterRender(engine, scene);
        });

        scene.debugLayer.show({
            
        });
    });
}