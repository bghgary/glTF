/// <reference path="../../babylon.js" />

if (BABYLON.Engine.isSupported()) {
    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);
    var divFps = document.getElementById("fps");
    var htmlInput = document.getElementById("files");
    var btnSettings = document.getElementById("btnSettings");
    var btnFullScreen = document.getElementById("btnFullscreen");
    var btnDownArrow = document.getElementById("btnDownArrow");
    var perffooter = document.getElementById("perf");
    var btnPerf = document.getElementById("btnPerf");
    var miscCounters = document.getElementById("miscCounters");
    var help01 = document.getElementById("help01");
    var help02 = document.getElementById("help02");
    var loadingText = document.getElementById("loadingText");
    var filesInput;
    var currentHelpCounter;
    var currentScene;
    var enableDebugLayer = false;

    // maps to attribution for image files here per cc license guidelines
    // first element must match background name in gui menu
    var environments = {
        "country": "http://www.openfootage.net/",
        "wobblyBridge": "https://hdrihaven.com/bundle.php?b=free_bundle",
        "gray": "http://www.microsoft.com/",
        "hill": "https://hdrihaven.com/bundle.php?b=free_bundle",
        "woods": "https://hdrihaven.com/bundle.php?b=free_bundle",
        "theater": "http://www.hdrlabs.com/",
        "darkPark": "http://noemotionhdrs.net/"
    };

    var settings = new (function () {
        this.environment = new (function () {
            this.name = Object.keys(environments)[0];
            this.attribution = "";
        });
        this.extensions = new (function () {
            this.pbrSpecularGlossiness = true;
        });
    });

    var gui = null;
    var hdrTexture = null;

    currentHelpCounter = localStorage.getItem("helpcounter");

    BABYLON.Engine.ShadersRepository = "/src/Shaders/";

    if (!currentHelpCounter) currentHelpCounter = 0;

    // Resize
    window.addEventListener("resize", function () {
        engine.resize();
    });

    var sceneLoaded = function (sceneFile, babylonScene) {
        function displayDebugLayerAndLogs() {
            currentScene.debugLayer._displayLogs = true;
            enableDebugLayer = true;
            currentScene.debugLayer.show();
        };
        function hideDebugLayerAndLogs() {
            currentScene.debugLayer._displayLogs = false;
            enableDebugLayer = false;
            currentScene.debugLayer.hide();
        };
        if (enableDebugLayer) {
            hideDebugLayerAndLogs();
        }
        currentScene = babylonScene;
        document.title = "BabylonJS - " + sceneFile.name;
        // Fix for IE, otherwise it will change the default filter for files selection after first use
        htmlInput.value = "";

        var camera = new BABYLON.ArcRotateCamera("camera", 4.712, 1.571, 2, BABYLON.Vector3.Zero(), currentScene);
        camera.attachControl(canvas);
        camera.minZ = 0.1;
        camera.maxZ = 100;
        camera.lowerRadiusLimit = 0.1;
        camera.upperRadiusLimit = 5;
        camera.wheelPrecision = 100;

        // In case of error during loading, meshes will be empty and clearColor is set to red
        if (currentScene.meshes.length === 0 && currentScene.clearColor.r === 1 && currentScene.clearColor.g === 0 && currentScene.clearColor.b === 0) {
            document.getElementById("logo").className = "";
            canvas.style.opacity = 0;
            displayDebugLayerAndLogs();
        }
        else {
            if (BABYLON.Tools.errorsCount > 0) {
                displayDebugLayerAndLogs();
            }
            document.getElementById("logo").className = "hidden";
            canvas.style.opacity = 1;
            if (currentScene.activeCamera.keysUp) {
                currentScene.activeCamera.keysUp.push(90); // Z
                currentScene.activeCamera.keysUp.push(87); // W
                currentScene.activeCamera.keysDown.push(83); // S
                currentScene.activeCamera.keysLeft.push(65); // A
                currentScene.activeCamera.keysLeft.push(81); // Q
                currentScene.activeCamera.keysRight.push(69); // E
                currentScene.activeCamera.keysRight.push(68); // D
            }
        }

        normalizeModel();
        updateEnvironment();
    };

    filesInput = new BABYLON.FilesInput(engine, null, canvas, sceneLoaded);
    filesInput.monitorElementForDragNDrop(canvas);

    window.addEventListener("keydown", function (evt) {
        // Press R to reload
        if (evt.keyCode === 82) {
            filesInput.reload();
        }
    });
    htmlInput.addEventListener('change', function (event) {
        var filestoLoad;
        // Handling data transfer via drag'n'drop
        if (event && event.dataTransfer && event.dataTransfer.files) {
            filesToLoad = event.dataTransfer.files;
        }
        // Handling files from input files
        if (event && event.target && event.target.files) {
            filesToLoad = event.target.files;
        }
        filesInput.loadFiles(event);
    }, false);
    btnSettings.addEventListener('click', function () {
        if (gui) {
            gui.destroy();
            gui = null;
        }
        else {
            gui = new dat.GUI({ width: 300 });
            var environmentFolder = gui.addFolder("environment");
            environmentFolder.add(settings.environment, "name", Object.keys(environments)).onChange(updateEnvironment);
            environmentFolder.add(settings.environment, "attribution").listen();
            environmentFolder.open();
            var extensionsFolder = gui.addFolder("extensions");
            extensionsFolder.add(settings.extensions, "pbrSpecularGlossiness").onChange(() => {
                BABYLON.GLTF2.GLTFLoader.Extensions.KHR_materials_pbrSpecularGlossiness.enabled = settings.extensions.pbrSpecularGlossiness;
                filesInput.reload();
            });
            extensionsFolder.open();
            updateEnvironment();
        }
    }, false);
    btnFullScreen.addEventListener('click', function () {
        engine.switchFullscreen(true);
    }, false);
    btnPerf.addEventListener('click', function () {
        if (currentScene) {
            if (!enableDebugLayer) {
                currentScene.debugLayer.show();
                enableDebugLayer = true;

            } else {
                currentScene.debugLayer.hide();
                enableDebugLayer = false;
            }
        }
    }, false);
    // The help tips will be displayed only 5 times
    if (currentHelpCounter < 5) {
        help01.className = "help shown";

        setTimeout(function () {
            help01.className = "help";
            help02.className = "help2 shown";
            setTimeout(function () {
                help02.className = "help2";
                localStorage.setItem("helpcounter", currentHelpCounter + 1);
            }, 5000);
        }, 5000);
    }

    function normalizeModel() {
        var model = new BABYLON.Mesh("model", currentScene);
        currentScene.meshes.forEach(function (mesh) {
            if (mesh !== model) {
                mesh.setParent(model);
            }
        });
        var extents = currentScene.getWorldExtends();
        var size = extents.max.subtract(extents.min);
        var center = extents.min.add(size.scale(0.5));
        var maxSizeComponent = Math.max(size.x, size.y, size.z);
        var oneOverLength = 1 / maxSizeComponent;
        model.scaling.scaleInPlace(oneOverLength);
        model.position.subtractInPlace(center.scale(oneOverLength));
    }

    function updateEnvironment() {
        if (!settings.environment.name) {
            return;
        }

        settings.environment.attribution = environments[settings.environment.name] || "";

        if (currentScene) {
            if (hdrTexture) {
                hdrTexture.dispose();
                hdrTexture = null;
            }

            hdrTexture = new BABYLON.HDRCubeTexture("Environments/" + settings.environment.name + ".babylon.hdr", currentScene);

            skybox = BABYLON.Mesh.CreateBox("hdrSkyBox", 100, currentScene);
            skybox.material = new BABYLON.PBRMaterial("skyBox", currentScene);
            skybox.material.reflectionTexture = hdrTexture.clone();
            skybox.material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skybox.material.backFaceCulling = false;
            skybox.material.microSurface = 1.0;
            skybox.material.cameraExposure = 0.6;
            skybox.material.cameraContrast = 1.6;
            skybox.material.disableLighting = true;
            skybox.infiniteDistance = true;

            updateModelReflectionTextures();
        }
    }

    function updateModelReflectionTextures() {
        currentScene.meshes.forEach(function (mesh) {
            var material = mesh.material;
            if (material instanceof BABYLON.MultiMaterial) {
                material.subMaterials.forEach(function (subMaterial) {
                    if (subMaterial instanceof BABYLON.PBRMaterial) {
                        subMaterial.reflectionTexture = hdrTexture;
                    }
                });
            }
        });
    }
}
