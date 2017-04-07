/// <reference path="three.min.js" />

var createScene = function () {
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    var light1 = new THREE.DirectionalLight();
    light1.position.set(1, 0, 0);
    scene.add(light1);

    var light2 = new THREE.DirectionalLight();
    light2.position.set(-1, 0, 0);
    scene.add(light2);

    var geometry = new THREE.SphereGeometry(1, 16, 16);

    var textureLoader = new THREE.TextureLoader();
    var material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    material.roughness = 1;
    material.metalness = 0;
    material.normalMap = textureLoader.load("../normal.png");

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", function () {
        renderer.render(scene, camera);
    });

    window.addEventListener("resize", function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    document.body.appendChild(renderer.domElement);
};