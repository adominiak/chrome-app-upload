var test = function (file, e) {
  console.log("ok");
  // files.push(file);
  // currentFile = file;
  // currentFileName.innerHTML = file.name;

};

var error = function (e) {
  console.log("error");
};


var directory = null;

document.getElementById("directoryChoose").addEventListener('click', function(e) {
  chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function(dir) {
    directory = dir;

    var options = {
      onFileUpload: test,
      onError: error,
      toImage: true,
      image: "image1",
      uploadId: "uploadFile1",
      saveOnLoad: true,
      directoryToSave: directory
      // multiple: true
    };

    new window.app.FileHandler(options);
  });
});





