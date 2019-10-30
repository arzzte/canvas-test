const Ticker = new class {

  constructor() {

    //////////////
    // если RAF true, то тикер сам тикает
    // если false, то только по вызову update
    //////////////
    this.TICK_RAF = true;
    //////////////
    //////////////


    //////////////
    // чтоб узнать реальный FPS (свойство real_fps, оно обновляется)
    const showFPS = false;
    //////////////



    Object.assign(this, {
      _counter: 0, // счётчик кадров
      current_id: 0, // id текущего листенера (для мапы)
      listeners: new Map(), // мапа листенеров
      timeout_id: 0, // id таймаутов
      interval_id: 0, // id интервалов

      globalPause: false, // глобальная пауза

      // для высчитывания реального FPS
      real_fps: 60, // реальный fps (высчитывается, см. showFPS)
      _fps_meter_delay: 1000/4, // пауза между расчётами реального fps
      _fps_ticks: 0,
      _fps_time: new Date().getTime(),

    });


    // RAF
    const _RAF = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    
    // тикаем
    if(this.TICK_RAF === true){
      _RAF(()=>{
        this.update(_RAF);
      });
    }

    // 
    if(showFPS === true){
      this.interval(()=>{
        this._getRealFps();
      }, this._fps_meter_delay, false);
    }
  }
  
  
  //
  // основная функция тикера
  //
  update(_RAF) {
    if(this.globalPause !== true){ // global pause
      this.listeners.forEach((listener) => {
        if(listener.pause !== true){
          listener.tick++;
          listener.clbck();
        }
      });
  
      this._counter++;
      
    }
    // 
    if(_RAF) {
      _RAF(()=>{
        this.update(_RAF);
      });
    }
  }
  


  
  
  // добавление листенера
  addListener(clbck) {
    const listener = {};
    listener.clbck = clbck;
    listener.pause = false;
    listener.tick = 0;
    
    const id = ++this.current_id;
    listener.id = id;
    listener.type = "listener";
    this.listeners.set(id, listener);
    
    return listener;
  };
  
  // убираем листенер
  removeListener(listener) {
    this.listeners.delete(listener.id);
  };
  
  
  
  
  // таймаут
  timeout(clbck, delay, frames) { // delay — задержка (в мс или кадрах), frames - опционально(true по умолчанию), указывает что считаем задержку в кадрах (по умолчанию)
    const timeout = {};
    if(frames === undefined || frames === true){
      timeout.frames = true;
    }else if(frames === false || frames === null) {
      timeout.frames = false;
    }

    timeout.id = ++this.timeout_id;
    timeout.delay = delay || 0;
    timeout.clbck = clbck;
    timeout.type = "timeout";
    timeout.pause = false;

    let _counter = 0;
    if(timeout.frames === false){
      timeout.delay = timeout.delay * 60 / 1000;
    }
    timeout.listener = this.addListener(()=>{
      if(timeout.pause === true) return;
      if(_counter >= timeout.delay){
        timeout.clbck();
        this.removeListener(timeout.listener);
      }
      _counter++;
    });
    
    return timeout;
  };
  // удаляем таймаут
  removeTimeout(timeout){
    this.removeListener(timeout.listener);
    return false;
  };
  clearTimeout(timeout){ // алиас для совместимости со старыми проектами (можно удалить, если конфликт)
    this.removeTimeout(timeout);
  };
  
  
  
  // интервал
  interval(clbck, delay, frames) { // delay — задержка (в мс или кадрах), frames - опционально(true по умолчанию), указывает что считаем задержку в кадрах (по умолчанию)
    const interval = {};
    if(frames === undefined || frames === true){
      interval.frames = true;
    }else if(frames === false || frames === null) {
      interval.frames = false;
    }
    
    interval.id = ++this.interval_id;
    interval.delay = delay || 0;
    interval.clbck = clbck;
    interval.type = "interval";
    interval.pause = false;
    
    
    let _counter = interval.delay;
    if(interval.frames === false){
      interval.delay = interval.delay * 60 / 1000;
    }
    interval.listener = this.addListener(()=>{
      if(interval.pause === true) return;
      if(_counter >= interval.delay){
        interval.clbck();
        _counter = 0;
      }
      _counter++;
    });
    
    return interval;
  };
  // удаляем интервал
  removeInterval(interval) {
    this.removeListener(interval.listener);
  };
  clearInterval(interval){ // алиас для совместимости со старыми проектами (можно удалить, если конфликт)
    this.removeInterval(interval);
  };


  
  
  // получаем
  _getRealFps() {
    const ticks = this._counter - this._fps_ticks;
    const d_t = (new Date().getTime()) - this._fps_time;
    this.real_fps = Math.round(10*ticks/(d_t/1000))/10;
    this._fps_ticks = this._counter;
    this._fps_time = new Date().getTime();
  }
};


export default Ticker;