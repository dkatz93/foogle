module.exports = time => new Promise((resolve, reject ) => {
  setTimeout(resolve, time);
});