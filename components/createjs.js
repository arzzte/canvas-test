import React, { Component } from 'react';
import 'createjs';

import Ticker from '../lib/ticker';

const mouse = {
  init: function() {
    window.addEventListener('wheel', this, { pasive: true });
    window.addEventListener('mousemove', this, true);
  },
  handleEvent: function({ type }) {
    switch (type) {
      case 'wheel': {
        this.wheelFunction(event);
        break;
      }
      case 'mousemove': {
        this.moveFunction(event);
        break;
      }
    }
  },
  wheelFunction: function({ deltaY }) {
    this.dest = this.dest + deltaY;
  },
  moveFunction: function({ clientX, clientY }) {
    this.mouse = {
      x: clientX,
      y: clientY,
    };
  },
  dest: 0,
  fin: 0,
  mouse: { x: 0, y: 0 },
};

const random = (p) => Math.ceil(Math.random() * p);

const createItem = (path) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = path;
    img.onload = () => resolve(img);
  });
};

const handleEvent = ({ type, target }) => {
  // console.log('kek');
  switch (type) {
    case 'mouseover': {
      createjs.Tween.get(target).to({ scaleX: 1, scaleY: 1 }, 200);
      break;
    }
    case 'mouseout': {
      createjs.Tween.get(target).to({ scaleX: 0.5, scaleY: 0.5 }, 200);
      break;
    }
    default:
      break;
  }
};

class Createjs extends Component {
  shapes = [];
  async componentDidMount() {
    this.image = await createItem('/static/images/11@2x.jpg');

    this.initCanvas();
    mouse.init();

    this.mainContainer = this.floodShapes();
    this.stage.addChild(this.mainContainer);

    Ticker.addListener((event) => this.onTick(event));
  }

  onTick() {
    const accRate = 10;
    mouse.fin += (mouse.dest - mouse.fin) / accRate;
    if (Math.abs(mouse.fin - mouse.dest) < 0.005) mouse.fin = mouse.dest;

    this.mainContainer.x = mouse.fin;

    const { x, y } = mouse.mouse;
    const d = 50;
    this.shapes.forEach((el, ind) => {
      if (x - mouse.fin > el.x - d && x - mouse.fin < el.x + d && y > el.y - d && y < el.y + d) {
        el.hovered = true;
      } else {
        el.hovered = false;
      }
    });
    this.shapes.forEach((el) => {
      if (el.scaleDown && !el.hovered) {
        el.scaleDown = false;
        el.scaleUp = true;
        createjs.Tween.get(el).to({ scaleX: 0.5, scaleY: 0.5 }, 200);
      }
    });
    const scaleUp = this.shapes.filter(({ hovered }) => hovered);
    scaleUp.forEach((el) => {
      el.scaleUp = false;
      createjs.Tween.get(el)
        .to({ scaleX: 1, scaleY: 1 }, 200)
        .call(() => (el.scaleDown = true));
    });
    this.stage.update();
  }

  floodShapes() {
    const container = new createjs.Container();
    const shapes = new Array(2000).fill(null).map((el, ind) => {
      const decide = Math.random() > 0.5 ? 'createImage' : 'createShape';
      const shape = this[decide]();
      shape.x = random(window.innerWidth) + ind * 10;
      shape.y = random(window.innerHeight);
      container.addChild(shape);
      this.shapes.push(shape);
      return shape;
    });
    return container;
  }

  createShape() {
    // const container = new createjs.Container();
    const shape = new createjs.Shape();
    shape.graphics.f('red').dr(0, 0, 200, 200);
    shape.regX = 100;
    shape.regY = 100;
    shape.scaleX = 0.5;
    shape.scaleY = 0.5;
    shape.scaleUp = false;
    // container.addChild(shape);
    return shape;
  }

  createImage() {
    // const container = new createjs.Container();
    const bitmap = new createjs.Bitmap(this.image);
    bitmap.regX = 100;
    bitmap.regY = 100;
    bitmap.scaleX = 0.5;
    bitmap.scaleY = 0.5;
    bitmap.scaleUp = false;
    // container.addChild(bitmap);
    return bitmap;
  }

  initCanvas() {
    this.stage = new createjs.Stage(this.canvas);
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
    createjs.Ticker.setFPS(60);
    // this.stage.enableMouseOver();
  }

  render() {
    return (
      <canvas
        ref={(ref) => (this.canvas = ref)}
        style={{ position: 'fixed', zIndex: 0, top: 0, left: 0 }}
      />
    );
  }
}

export default Createjs;
