/*
Purpose: 
A simple utility file to help keep code cleaned up.

*/

class AdderUtil {
  localStorageSpace = () => {
    var data = "";
    console.log("Current local storage: ");
    for (var key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        data += window.localStorage[key];
        console.log(
          key +
            " = " +
            ((window.localStorage[key].length * 16) / (8 * 1024)).toFixed(2) +
            " KB"
        );
      }
    }
    console.log(
      data
        ? "\n" +
            "Total space used: " +
            ((data.length * 16) / (8 * 1024)).toFixed(2) +
            " KB"
        : "Empty (0 KB)"
    );
    console.log(
      data
        ? "Approx. space remaining: " +
            (5120 - ((data.length * 16) / (8 * 1024)).toFixed(2)) +
            " KB"
        : "5 MB"
    );
  };

  getUUID = () => {
    let random = Math.floor(Math.random() * Math.floor(7));
    let random2 = Math.floor(Math.random() * Math.floor(7));
    let array = ["a", "b", "c", "d", "e", "f", "g", "h"];
    let salt = array[random];
    let UUID = salt + random2 + "_" + Date();
    return UUID;
  };

  store = (type, item, json) => {
    /* IN
    type: set , get, append, pop , remove
    item: name of localStorage item
    json: json
    */
    if (type === "set") {
      localStorage.setItem(item, JSON.stringify(json));
      return true;
    } else if (type === "get") {
      let result = JSON.parse(localStorage.getItem(item)) || [];
      return result;
    } else if (type === "append") {
      var previous_data = JSON.parse(localStorage.getItem(item)) || [];
      previous_data.push(json);
      localStorage.setItem(item, JSON.stringify(previous_data));
    } else if (type === "pop") {
      let stored = JSON.parse(localStorage.getItem(item)) || [];
      let result = null;
      if (stored.length > 0) {
        result = stored.pop();
      } else {
        result = 0;
      }
      localStorage.setItem(item, JSON.stringify(stored));
      return result;
    } else if (type === "remove") {
      localStorage.removeItem(item);
    } else if (type === "get_last") {
      let stored = JSON.parse(localStorage.getItem(item)) || [];
      let result = null;
      if (stored.length > 0) {
        //get the last item and put it back
        result = stored.pop();
        stored.push(result);
        localStorage.setItem(item, JSON.stringify(stored));
      } else {
        result = 0;
      }
      // return the popped item.
      return result;
    } else {
      console.log("Util: store() unrecognized arg passed in.");
    }
  };
}

export default AdderUtil;
