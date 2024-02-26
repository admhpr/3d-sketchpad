import GUI from "lil-gui";
import {
  AxesHelper,
  Clock,
  LoadingManager,
  Mesh,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PointLightHelper,
  WebGLRenderer,
} from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

import { toggleFullScreen } from "./helpers/fullscreen";
import { resizeRendererToDisplaySize } from "./helpers/responsiveness";
import { createScene as createScene1 } from "./scenes/1";
import { createScene as createScene2 } from "./scenes/2";
import "./style.css";

// const scenes = [scene1]
const animation = { enabled: false, play: true };
const CANVAS_ID = "scene";

let canvas: HTMLElement;
let renderer: WebGLRenderer;
let loadingManager: LoadingManager;
let subject: Mesh;
let camera: PerspectiveCamera;
let cameraControls: OrbitControls;
let dragControls: DragControls;

let clock: Clock;
let stats: Stats;


const selectedSceneIndex = 0;
const scenes = [createScene1, createScene2];

let { scene, subjects, lights } = scenes[selectedSceneIndex]();
subject = subjects[0]

init();
animate();

function createRenderer(canvas: HTMLElement) {
  renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  return renderer
}

function createLoadingManager() {
  loadingManager = new LoadingManager();
  loadingManager.onStart = () => {
    console.log("loading started");
  };
  loadingManager.onProgress = (url, loaded, total) => {
    console.log("loading in progress:");
    console.log(`${url} -> ${loaded} / ${total}`);
  };
  loadingManager.onLoad = () => {
    console.log("loaded!");
  };
  loadingManager.onError = () => {
    console.log("❌ error while loading");
  };
  return loadingManager
}

function createCamera(canvas: HTMLElement){
  camera = new PerspectiveCamera(
    50,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.set(2, 2, 5);
  return camera
}

function createOrbitControls(camera: PerspectiveCamera, canvas: HTMLElement){
  cameraControls = new OrbitControls(camera, canvas);
  cameraControls.target = scene.children[0].position;
  cameraControls.enableDamping = true;
  cameraControls.autoRotate = false;
  cameraControls.update();
  return cameraControls
}

function createDragControls(camera: PerspectiveCamera, renderer: WebGLRenderer){
  const dragControls = new DragControls([subject], camera, renderer.domElement);
  dragControls.addEventListener("hoveron", (event) => {
    event.object.material.emissive.set("orange");
  });
  dragControls.addEventListener("hoveroff", (event) => {
    event.object.material.emissive.set("black");
  });
  dragControls.addEventListener("dragstart", (event) => {
    cameraControls.enabled = false;
    animation.play = false;
    event.object.material.emissive.set("black");
    event.object.material.opacity = 0.7;
    event.object.material.needsUpdate = true;
  });
  dragControls.addEventListener("dragend", (event) => {
    cameraControls.enabled = true;
    animation.play = true;
    event.object.material.emissive.set("black");
    event.object.material.opacity = 1;
    event.object.material.needsUpdate = true;
  });
  dragControls.enabled = false;
  return dragControls
}

function enableFullscreen(){
  window.addEventListener("dblclick", (event) => {
    if (event.target === canvas) {
      toggleFullScreen(canvas);
    }
  });
}

function enableStats(){
  clock = new Clock();
  stats = new Stats();
  document.body.appendChild(stats.dom);
  return {clock, stats }
}

function createDevGui(){
  const axesHelper = new AxesHelper(4);
  axesHelper.visible = false;
  scene.add(axesHelper);

  const pointLightHelper = new PointLightHelper(lights.pointLight, undefined, "orange");
  pointLightHelper.visible = false;
  scene.add(pointLightHelper);


  const gui = new GUI({ title: "🐞 Debug GUI", width: 300 });

  const subjectOneFolder = gui.addFolder("Subject one");

  subjectOneFolder.add(subject.position, "x").min(-5).max(5).step(0.5).name("pos x");
  subjectOneFolder.add(subject.position, "y").min(-5).max(5).step(0.5).name("pos y");
  subjectOneFolder.add(subject.position, "z").min(-5).max(5).step(0.5).name("pos z");

  subjectOneFolder.add(subject.material, "wireframe");
  subjectOneFolder.addColor(subject.material, "color");
  subjectOneFolder.add(subject.material, "metalness", 0, 1, 0.1);
  subjectOneFolder.add(subject.material, "roughness", 0, 1, 0.1);

  subjectOneFolder
    .add(subject.rotation, "x", -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    .name("rotate x");
  subjectOneFolder
    .add(subject.rotation, "y", -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    .name("rotate y");
  subjectOneFolder
    .add(subject.rotation, "z", -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    .name("rotate z");

  subjectOneFolder.add(animation, "enabled").name("animated");

  const controlsFolder = gui.addFolder("Controls");
  controlsFolder.add(dragControls, "enabled").name("drag controls");
  const cameraFolder = gui.addFolder("Camera");
  cameraFolder.add(cameraControls, "autoRotate");

  const lightsFolder = gui.addFolder('Lights')
  lightsFolder.add(lights.pointLight, 'visible').name('point light')
  lightsFolder.addColor(lights.pointLight, "color");
  lightsFolder.add(lights.pointLight, "intensity").min(0).max(1000).step(10).name("point light intensity");
  lightsFolder.add(lights.ambientLight, 'visible').name('ambient light')

  const helpersFolder = gui.addFolder('Helpers')
  helpersFolder.add(axesHelper, 'visible').name('axes')
  helpersFolder.add(pointLightHelper, 'visible').name('pointLight')


  gui.onFinishChange(() => {
    const guiState = gui.save();
    localStorage.setItem("guiState", JSON.stringify(guiState));
  });

  const guiState = localStorage.getItem("guiState");
  if (guiState) gui.load(JSON.parse(guiState));


  const resetGui = () => {
    localStorage.removeItem("guiState");
    gui.reset();
  };
  gui.add({ resetGui }, "resetGui").name("RESET");

  gui.close();
}


function init() {
  canvas = document.querySelector(`canvas#${CANVAS_ID}`)!;
  renderer = createRenderer(canvas)
  loadingManager = createLoadingManager()
  camera = createCamera(canvas)
  cameraControls = createOrbitControls(camera, canvas)
  dragControls = createDragControls(camera, renderer)

  enableFullscreen()
  enableStats()

  createDevGui()
}

function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  cameraControls.update();
}

function render() {
  renderer.render(scene, camera);
}

function onSceneSelect(event: MouseEvent){
  const sceneIndex = parseInt((event.target as HTMLButtonElement).dataset.sceneIndex!)
  const { scene: newScene, subjects: newSubjects, lights: newLights } = scenes[sceneIndex]()
  debugger;
  scene = newScene
  subjects = newSubjects
  lights = newLights
}

function setupButtonListeners(){
  document.querySelectorAll("button").forEach(button => button.onclick = onSceneSelect);
}

setupButtonListeners()