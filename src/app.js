import 'assets/jump.css';
import 'assets/style/app.less';
import 'src/../index.html';

import Game from 'utils/game';
import Tools from 'utils/tools';

var App = {
	init() {
    this.maskStart = document.querySelector('.mask.start');
    this.maskRestart = document.querySelector('.mask.restart');
    this.gameBlock = document.querySelector('.game');
    this.gameScore = document.querySelector('.game-score');
    this.bindEvents();
    this.initGame();
	},
  initGame() {
    const self = this;
    this.game = new Game();
    this.game.init();
    this.game.addSuccessFn(success);
    this.game.addFailedFn(failed);

    // 游戏成功，更新分数
    function success(score) {
      self.gameScore.innerText = score;
    }

    // 游戏失败执行函数
    function failed() {
      self.gameScore.style.display = 'none';
      self.maskRestart.style.display = 'block';
      document.querySelector('.mask-score').innerText = self.gameScore.innerText;
    }
  },
  bindEvents() {
    const self = this;
    const events = [{
      element: '.btn-game-start',
      event: 'click',
      handler(e) {
        self.maskStart.style.display = 'none';
        self.gameScore.style.display = 'block';
      }
    }, {
      element: '.btn-game-restart',
      event: 'click',
      handler(e) {
        self.maskRestart.style.display = 'none';
        self.game.restart();
      }
    }]
    Tools.bindEvents(events);
  }
};

App.init();
