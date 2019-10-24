class Stopwatch {
    constructor() {
        this.startTime = null;
        this.runtimeMillis = null;

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.getRuntime = this.getRuntime.bind(this);
    }

    start() {
        this.startTime = process.hrtime().reduce((sec, nano) => (sec * 1000) + (nano / 1000000));
        this.runtimeMillis = null;
    }

    stop() {
        this.runtimeMillis = process.hrtime().reduce((sec, nano) => (sec * 1000) + (nano / 1000000)) - this.startTime;
    }

    getRuntime(unit) {
        let runtime = 0;
        if (unit === "ms") {
            runtime = this.runtimeMillis;
        } else if (unit === "s") {
            runtime = this.runtimeMillis / 1000;
        } else if (unit === "us") {
            runtime = this.runtimeMillis * 1000;
        } else if (unit === "ns") {
            runtime = this.runtimeMillis * (1000 * 1000);
        } else {
            runtime = this.runtimeMillis;
        }

        return runtime.toFixed(3);
    }
}
module.exports = Stopwatch;