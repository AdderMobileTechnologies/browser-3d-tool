class Memory {
  constructor(args = null) {
    let _args = args;
    this.getArgs = () => {
      return _args;
    };
  }
  check() {
    console.log("mem check", this.getArgs());
  }
}
export default Memory;
