const timer = {
  init: function (color, timeMax) {
    this.timeMax = timeMax;
    this.timerInterval = null;

    document.getElementById("lrf_timer").innerHTML = `
      <div class="lrf_base-timer">
        <svg class="lrf_base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g class="lrf_base-timer__circle">
            <circle class="lrf_base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
            <path
              id="lrf-base-timer-path-remaining"
              stroke-dasharray="283"
              class="lrf_base-timer__path-remaining" color="#${color}"
              d="
                M 50, 50
                m -45, 0
                a 45,45 0 1,0 90,0
                a 45,45 0 1,0 -90,0
              "
            ></path>
          </g>
        </svg>
        <span id="lrf-base-timer-label" class="lrf_base-timer__label">${this.timeMax}</span>
      </div>
    `;
  },

  start: function (onTimesUp) {
    this.onTimesUp = onTimesUp;
    this.timeLeft = this.timeMax;
    this.timerInterval = null;
    this.startTimer();
  },

  startTimer: function () {
    document.getElementById("lrf-base-timer-label").innerHTML = this.timeLeft;

    this.timerInterval = setInterval(() => {
      --this.timeLeft;
      document.getElementById("lrf-base-timer-label").innerHTML = this.timeLeft;
      this.setCircleDasharray();

      if (this.timeLeft === 0) {
        this.abort();
        this.onTimesUp();
      }
    }, 1000);
  },

  abort: function () {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.timeLeft = this.timeMax;
    }
  },

  calculateTimeFraction: function () {
    const rawTimeFraction = this.timeLeft / this.timeMax;
    return rawTimeFraction - (1 / this.timeMax) * (1 - rawTimeFraction);
  },

  setCircleDasharray: function () {
    const FULL_DASH_ARRAY = 283;
    const circleDasharray = `${(this.calculateTimeFraction() * FULL_DASH_ARRAY).toFixed(0)} ${FULL_DASH_ARRAY}`;
    document.getElementById("lrf-base-timer-path-remaining").setAttribute("stroke-dasharray", circleDasharray);
  }
}