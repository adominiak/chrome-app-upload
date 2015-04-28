(function(){
  window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

  function FileHandler() {

    this.files = [];

    this.currentFile = null;

    this.currentFileName = document.getElementById("currentFile");

    this.image = document.getElementById("image1");

    this.buttonUpload = document.getElementById("uploadFile");

    this.buttonSaveToDrive = document.getElementById("saveToDrive");

    this.buttonShowImage = document.getElementById("showImage");

    this.bindEvents();
  }


  FileHandler.prototype.bindEvents = function() {

    this.buttonUpload.addEventListener('click', this.openFileFromChosenLocation.bind(this));
    this.buttonSaveToDrive.addEventListener('click', this.saveFileToChosenLocation.bind(this));
    this.buttonShowImage.addEventListener('click', this.showImage.bind(this));
  };

  FileHandler.prototype.openFileFromChosenLocation = function(e) {
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

  FileHandler.prototype.saveFileToChosenLocation = function(e) {
    var self = this;
    chrome.fileSystem.chooseEntry({ type: 'saveFile', suggestedName: this.currentFile.name}, function(writableFileEntry) {
      writableFileEntry.createWriter(function(writer) {
        writer.onwriteend = function(e) {
        };
        self.currentFile.file(function(file) {
          writer.write(file);
        });
      }, self.errorHandler);
    });
  };

  FileHandler.prototype.showImage = function() {
    var self = this;
    this.currentFile.file(function(file) {
      var reader = new FileReader();
      reader.onerror = this.errorHandler;
      reader.onloadend = function(e) {
        self.image.setAttribute('src', e.target.result);
      };
      reader.readAsDataURL(file);
    });
  };

  FileHandler.prototype.errorHandler = function (e) {
    console.log("error");
  };

  window.app = window.app || {};
  window.app.FileHandler = window.app.FileHandler || new FileHandler();

})();
