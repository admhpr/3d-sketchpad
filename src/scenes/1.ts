import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  GridHelper,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  PointLightHelper,
  Scene,
} from "three";

import "../style.css";

let axesHelper: AxesHelper;
let pointLightHelper: PointLightHelper;

export function createScene() {
  const scene = new Scene();
  const ambientLight = new AmbientLight("white", 0.4);
  const pointLight = new PointLight("#ffdca8", 1.2, 100);
  pointLight.position.set(-2, 3, 3);
  pointLight.castShadow = true;
  pointLight.shadow.radius = 4;
  pointLight.shadow.camera.near = 0.5;
  pointLight.shadow.camera.far = 4000;
  pointLight.shadow.mapSize.width = 2048;
  pointLight.shadow.mapSize.height = 2048;
  scene.add(ambientLight);
  scene.add(pointLight);

  const sideLength = 1;
  const cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength);
  const cubeMaterial = new MeshStandardMaterial({
    color: "#f69f1f",
    metalness: 0.5,
    roughness: 0.7,
  });
  const cube = new Mesh(cubeGeometry, cubeMaterial);
  cube.castShadow = true;
  cube.position.y = 0.5;

  const planeGeometry = new PlaneGeometry(3, 3);
  const planeMaterial = new MeshLambertMaterial({
    color: "gray",
    emissive: "teal",
    emissiveIntensity: 0.2,
    side: 2,
    transparent: true,
    opacity: 0.4,
  });
  const plane = new Mesh(planeGeometry, planeMaterial);
  plane.rotateX(Math.PI / 2);
  plane.receiveShadow = true;

  scene.add(cube);
  scene.add(plane);

  axesHelper = new AxesHelper(4);
  axesHelper.visible = false;
  scene.add(axesHelper);

  pointLightHelper = new PointLightHelper(pointLight, undefined, "orange");
  pointLightHelper.visible = false;
  scene.add(pointLightHelper);

  const gridHelper = new GridHelper(20, 20, "teal", "darkgray");
  gridHelper.position.y = -0.01;
  scene.add(gridHelper);
  return { scene, subjects: [cube]};
}
