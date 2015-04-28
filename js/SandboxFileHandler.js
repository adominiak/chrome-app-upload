(function(){
  window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

  function SandboxFileHandler() {

    this.files = [];

    this.currentFile = null;

    this.currentFileName = document.getElementById("currentFileSandbox");

    this.fileList = document.getElementById("files-remembered");

    this.image = document.getElementById("image1");

    this.buttonUpload = document.getElementById("uploadFileSandbox");

    this.buttonSaveToSandbox= document.getElementById("saveToSandbox");

    this.buttonShowImage = document.getElementById("showImageSandbox");

    this.fs = null;

    window.requestFileSystem(window.TEMPORARY, 1024*1024, this.onInitFs.bind(this), this.errorHandler);

    this.bindEvents();
  }

  SandboxFileHandler.prototype.onInitFs = function(filesystem) {
    this.fs = filesystem;
  };

  SandboxFileHandler.prototype.bindEvents = function() {
    this.buttonUpload.addEventListener('click', this.openFileFromChosenLocation.bind(this));
    this.buttonSaveToSandbox.addEventListener('click', this.saveFileToSandbox.bind(this));
    this.buttonShowImage.addEventListener('click', this.showImage.bind(this));
  };

  SandboxFileHandler.prototype.openFileFromChosenLocation = function(e) {
    var self = this;
    chrome.fileSystem.chooseEntry({type: 'openFile'}, function(readOnlyEntry) {

      readOnlyEntry.file(function(file) {
        var reader = new FileReader();

        reader.onerror = self.errorHandler;
        reader.onloadend = function(e) {
          self.files.push(readOnlyEntry);
          self.currentFile = readOnlyEntry;
          self.currentFileName.innerHTML = readOnlyEntry.name;
        };
        reader.readAsDataURL(file);
      });
    });
  };

  SandboxFileHandler.prototype.saveFileToSandbox = function(e) {
    var self = this;
    this.fs.root.getFile(this.currentFile.name, {create: true}, function(fileEntry) {
      fileEntry.createWriter(function(fileWriter) {

        fileWriter.onwriteend = function(e) {
          self.currentFile = fileEntry;
          self.addItemToList(fileEntry.name);
        };
        fileWriter.onerror = function(e) {
          console.log('Write failed: ' + e.toString());
        };
        self.currentFile.file ( function(file) {
          fileWriter.write(file);
        });
      }, self.errorHandler);

    }, self.errorHandler);
  };

  SandboxFileHandler.prototype.openFileSandbox = function(name) {
    var self = this;
    name = name || this.currentFile.name;
    this.fs.root.getFile(name, {}, function(fileEntry) {
      fileEntry.file(function(file) {
         var reader = new FileReader();

         reader.onloadend = function(e) {
           self.currentFile = fileEntry;
           self.currentFileName = fileEntry.name;
         };
         reader.readAsDataURL(file);
      }, self.errorHandler);

    }, self.errorHandler);
  };

  SandboxFileHandler.prototype.showImage = function() {
    this.image.src = this.currentFile.toURL();
  };

  SandboxFileHandler.prototype.errorHandler = function (e) {
    console.log("error");
  };

  SandboxFileHandler.prototype.addItemToList = function (name) {
    var self = this;
    var button = document.createElement("input");
    button.type = "button";
    button.value = name;
    button.appendChild(document.createTextNode(name));
    this.fileList.appendChild(button);
    button.addEventListener("click", function() { self.openFileSandbox(name); } );
  };

  window.app = window.app || {};
  window.app.SandboxFileHandler = window.app.SandboxFileHandler || new SandboxFileHandler();

})();
