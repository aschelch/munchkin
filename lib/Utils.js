
function Utils(){}

Utils.rollDice = function (min, max) {
  return min + Math.floor(Math.random() * (max-min + 1))
}

/**
 * Normalize a port into a number, string, or false.
 */
Utils.normalizePort = function (val) {
    var port = parseInt(val, 10);
  
    if (isNaN(port)) {
      // named pipe
      return val;
    }
  
    if (port >= 0) {
      // port number
      return port;
    }
  
    return false;
}


module.exports = Utils;