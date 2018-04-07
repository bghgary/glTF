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
    var currentSkybox;
    var enableDebugLayer = false;
    var currentPluginName;
    var toExecuteAfterSceneCreation;

    canvas.addEventListener("contextmenu", function(evt) {
        evt.preventDefault();
    }, false);

    // maps to attribution for image files here per cc license guidelines
    // first element must match background name in gui menu
    var environments = {
        "blender": "http://adaptivesamples.com/2017/01/17/blender-institute-hdri/",
        "country": "https://www.openfootage.net/hdri-360-saalfelden-austria/",
        "ennis": "http://gl.ict.usc.edu/Data/HighResProbes/",
        "garage": "https://hdrihaven.com/hdri.php?hdri=garage",
        "gray": "http://www.microsoft.com/",
        "indoor": "https://hdrihaven.com/hdri.php?hdri=blinds",
        "night": "https://www.openfootage.net/hdri-3-0-360-river-power-station/",
        "none": ""
    };
    var settings = {
        environment: {
            name: Object.keys(environments)[0],
            attribution: "",
        },
        extensions: {
            KHR_draco_mesh_compression: {
                enabled: true
            },
            KHR_lights: {
                enabled: true
            },
            KHR_materials_pbrSpecularGlossiness: {
                enabled: true
            },
            KHR_materials_unlit: {
                enabled: true
            },
            MSFT_lod: {
                enabled: true,
                maxLODsToLoad: Number.MAX_VALUE
            }
        },
        animations: {
            name: ""
        }
    };

    var gui = new dat.GUI({ width: 300, hideable: true });
    gui.domElement.style.display = "none";

    var environmentFolder = gui.addFolder("environment");
    environmentFolder.add(settings.environment, "name", Object.keys(environments)).onChange(updateEnvironment);
    environmentFolder.open();
    updateEnvironment();

    var extensionsFolder = gui.addFolder("extensions");
    extensionsFolder.open();

    var extensions = settings.extensions;
    for (var name in extensions) {
        var extension = extensions[name];
        var extensionFolder = extensionsFolder.addFolder(name);
        extensionFolder.open();
        for (var property in extension) {
            extensionFolder.add(extension, property).onChange(function () {
                filesInput.reload();
            });
        }
    }

    var animationsFolder = null;

    currentHelpCounter = localStorage.getItem("helpcounter");

    BABYLON.Engine.ShadersRepository = "/src/Shaders/";

    if (!currentHelpCounter) currentHelpCounter = 0;

    // Setting up some GLTF values
    BABYLON.SceneLoader.OnPluginActivatedObservable.add(function (plugin) {
        currentPluginName = plugin.name;

        if (plugin.name === "gltf") {
            plugin.onExtensionLoaded = function (extension) {
                var settingsExtension = settings.extensions[extension.name];
                for (var property in settingsExtension) {
                    extension[property] = settingsExtension[property];
                }
            };
        }
    });

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

        // Clear the error
        document.getElementById("errorZone").style.display = 'none';

        currentScene = babylonScene;
        document.title = "BabylonJS - " + sceneFile.name;
        // Fix for IE, otherwise it will change the default filter for files selection after first use
        htmlInput.value = "";

        // Attach camera to canvas inputs
        if (!currentScene.activeCamera || currentScene.lights.length === 0) {
            currentScene.createDefaultCameraOrLight(true);
            // Enable camera's behaviors
            currentScene.activeCamera.useFramingBehavior = true;

            var framingBehavior = currentScene.activeCamera.getBehaviorByName("Framing");
            framingBehavior.framingTime = 0;
            framingBehavior.elevationReturnTime = -1;

            if (currentScene.meshes.length) {
                var worldExtends = currentScene.getWorldExtends();
                currentScene.activeCamera.lowerRadiusLimit = null;
                framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);
            }

            currentScene.activeCamera.pinchPrecision = 200 / currentScene.activeCamera.radius;
            currentScene.activeCamera.upperRadiusLimit = 5 * currentScene.activeCamera.radius;

            currentScene.activeCamera.wheelDeltaPercentage = 0.01;
            currentScene.activeCamera.pinchDeltaPercentage = 0.01;
        }

        currentScene.activeCamera.attachControl(canvas); 

        if (currentPluginName === "gltf") {
            updateEnvironment();

            // glTF assets use a +Z forward convention while the default camera faces +Z. Rotate the camera to look at the front of the asset.
            currentScene.activeCamera.alpha += Math.PI;

            if (animationsFolder) {
                gui.removeFolder(animationsFolder);
            }

            var animationGroups = currentScene.animationGroups;
            if (animationGroups && animationGroups.length !== 0) {
                animationsFolder = gui.addFolder("animations");
                animationsFolder.open();

                settings.animations.name = animationGroups[0].name;
                animationsFolder.add(settings.animations, "name", animationGroups.map(_ => _.name)).onChange(function () {
                    currentScene.stopAllAnimations();
                    var animationGroup = currentScene.getAnimationGroupByName(settings.animations.name);
                    if (animationGroup) {
                        animationGroup.start(true);
                    }
                });
            }
        }

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

        if (toExecuteAfterSceneCreation) {
            toExecuteAfterSceneCreation();
        }

    };

    var sceneError = function (sceneFile, babylonScene, message) {
        document.title = "BabylonJS - " + sceneFile.name;
        document.getElementById("logo").className = "";
        canvas.style.opacity = 0;

        var errorContent = '<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button>' + message.replace("file:[object File]", "'" + sceneFile.name + "'") + '</div>';

        document.getElementById("errorZone").style.display = 'block';
        document.getElementById("errorZone").innerHTML = errorContent;

        // Close button error
        document.getElementById("errorZone").querySelector('.close').addEventListener('click', function () {
            document.getElementById("errorZone").style.display = 'none';
        });
    };

    filesInput = new BABYLON.FilesInput(engine, null, sceneLoaded, null, null, null, function () { BABYLON.Tools.ClearLogCache() }, null, sceneError);
    filesInput.onProcessFileCallback = (function (file, name, extension) {
        if (extension === "dds") {
            BABYLON.FilesInput.FilesToLoad[name] = file;
            var loadTexture = () => {
                if (currentPluginName === "gltf") { // currentPluginName is updated only once scene is loaded
                    var newHdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("file:" + file.correctName, currentScene);
                    if (currentSkybox) {
                        currentSkybox.dispose();
                    }
                    currentSkybox = currentScene.createDefaultSkybox(newHdrTexture, true, (currentScene.activeCamera.maxZ - currentScene.activeCamera.minZ) / 2, 0.3);
                }
            }
            if (currentScene) {
                loadTexture();
            }
            else {
                // Postpone texture loading until scene is loaded
                toExecuteAfterSceneCreation = loadTexture;
            }
            return false;
        }
        return true;
    }).bind(this);
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
        gui.domElement.style.display = gui.domElement.style.display === "" ? "none" : "";
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

    sizeScene();

    window.onresize = function () {
        sizeScene();
    }
}

function sizeScene () {
    let divInspWrapper = document.getElementsByClassName('insp-wrapper')[0];
    if (divInspWrapper) {
        let divFooter = document.getElementsByClassName('footer')[0];
        divInspWrapper.style.height = (document.body.clientHeight - divFooter.clientHeight) + "px";
        divInspWrapper.style['max-width'] = document.body.clientWidth + "px";
    }
}

function updateEnvironment() {
    if (currentScene) {
        var attributionElement = document.getElementById("attribution");
        if (attributionElement) {
            var attribution = environments[settings.environment.name];
            attributionElement.innerText = attribution;
            document.getElementById("attributionLink").href = attribution;
        }

        if (currentSkybox) {
            currentSkybox.dispose();
        }

        if (settings.environment.name === "none") {
            currentScene.environmentTexture = null;
        }
        else {
            var newHdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("Environments/" + settings.environment.name + "SpecularHDR.dds", currentScene);
            currentSkybox = currentScene.createDefaultSkybox(newHdrTexture, true, (currentScene.activeCamera.maxZ - currentScene.activeCamera.minZ) / 2, 0.3);
        }
    }
}
