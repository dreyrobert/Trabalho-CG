import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

let scene, camera, renderer, controls;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const speed = 50.0;

export function init() {
  // ===== CÂMERA =====
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );
  camera.position.set(0, 10, 0);

  // ===== CENA =====
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa8d0ff);

  // ===== RENDERER =====
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // ===== CONTROLES =====
  controls = new PointerLockControls(camera, document.body);

  // Instruções e pointer lock
  const instructions = document.createElement("div");
  instructions.style.position = "absolute";
  instructions.style.top = "50%";
  instructions.style.left = "50%";
  instructions.style.transform = "translate(-50%, -50%)";
  instructions.style.padding = "20px";
  instructions.style.backgroundColor = "rgba(0,0,0,0.7)";
  instructions.style.color = "white";
  instructions.style.fontFamily = "Arial";
  instructions.style.textAlign = "center";
  instructions.innerHTML =
    "<h2>Clique para jogar</h2><p>WASD para mover<br>Mouse para olhar<br>ESC para sair</p>";
  document.body.appendChild(instructions);

  instructions.addEventListener("click", () => {
    controls.lock();
  });

  controls.addEventListener("lock", () => {
    instructions.style.display = "none";
  });

  controls.addEventListener("unlock", () => {
    instructions.style.display = "block";
  });

  // Event listeners para teclado
  const onKeyDown = (event) => {
    switch (event.code) {
      case "KeyW":
        moveForward = true;
        break;
      case "KeyA":
        moveLeft = true;
        break;
      case "KeyS":
        moveBackward = true;
        break;
      case "KeyD":
        moveRight = true;
        break;
    }
  };

  const onKeyUp = (event) => {
    switch (event.code) {
      case "KeyW":
        moveForward = false;
        break;
      case "KeyA":
        moveLeft = false;
        break;
      case "KeyS":
        moveBackward = false;
        break;
      case "KeyD":
        moveRight = false;
        break;
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  // ===== LUZ =====
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(50, 80, 50);
  sun.castShadow = true;
  scene.add(sun);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  // ===== TEXTURA DE GRAMA =====
  const loader = new THREE.TextureLoader();

  const grassTex = loader.load(
    "../assets/textures/grass/Grass008_1K-JPG_Color.jpg",
    (texture) => {
      console.log("Textura de grama carregada com sucesso");
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(20, 20);
      texture.needsUpdate = true;
    },
    undefined,
    (error) => {
      console.error("Erro ao carregar textura de grama:", error);
    }
  );

  grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
  grassTex.repeat.set(20, 20);

  // ===== CHÃO =====
  const groundMat = new THREE.MeshStandardMaterial({
    map: grassTex,
    roughness: 0.8,
    metalness: 0.2,
  });

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ===== LOOP =====
  animate();

  window.addEventListener("resize", onResize);
}

let prevTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();
  const delta = (time - prevTime) / 1000;

  if (controls.isLocked === true) {
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
  }

  prevTime = time;

  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
