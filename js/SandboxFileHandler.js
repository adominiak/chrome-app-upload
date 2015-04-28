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

    this.buttonDeleteFromSandbox = document.getElementById("deleteFileSandbox");

    this.buttonShowImage = document.getElementById("showImageSandbox");

    this.fs = null;

    window.requestFileSystem(window.TEMPORARY, 1024*1024, this.onInitFs.bind(this), this.errorHandler);

    this.bindEvents();
  }

  SandboxFileHandler.prototype.onInitFs = function(filesystem) {
    this.fs = filesystem;
    this.reloadExistingFiles();
  };


  SandboxFileHandler.prototype.reloadExistingFiles = function() {
    var self = this;
    this.fileList.innerHTML = "";
    var dirReader = this.fs.root.createReader();
    var entries = [];

    // Call the reader.readEntries() until no more results are returned.
    var readEntries = function() {
      dirReader.readEntries (function(results) {
        if (!results.length) {
          for (var i = entries.length - 1; i >= 0; i--) {
            self.addItemToList(entries[i].name);
          }
        } else {
          entries = entries.concat(Array.prototype.slice.call(results, 0));
          readEntries();
        }
      }, self.errorHandler);
    };

    readEntries(); // Start reading dirs.
  };

  SandboxFileHandler.prototype.bindEvents = function() {
    this.buttonUpload.addEventListener('click', this.openFileFromChosenLocation.bind(this));
    this.buttonSaveToSandbox.addEventListener('click', this.saveFileToSandbox.bind(this));
    this.buttonDeleteFromSandbox.addEventListener('click', this.deleteFileFromSandbox.bind(this));
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
          self.currentFileName.innerHTML = fileEntry.name;
        };
        reader.readAsDataURL(file);
      }, self.errorHandler);

    }, self.errorHandler);
  };

  SandboxFileHandler.prototype.deleteFileFromSandbox = function() {
    var self = this;
    this.fs.root.getFile( this.currentFile.name, {create: false}, function(fileEntry) {

      fileEntry.remove(function() {
        console.log('File removed.');
        self.reloadExistingFiles();
        self.currentFile = null;
        self.currentFileName.innerHTML = "None";
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
