(function(){
  window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

  function FileHandler(options) {
    options = options || {};
    options.uploadId = options.uploadId || "uploadFile";


    this.buttonUpload = document.getElementById(options.uploadId);

    this._onFileUpload = options.onFileUpload;

    this._onError = options.onError || this.errorHandler;

    this._uploadToImage = options.toImage || false;

    if( this._uploadToImage ) {
      this.image = document.getElementById(options.image);
    }
    this._saveToDirectory = options.saveOnLoad || false;
    if ( this._saveToDirectory ) {
      this._directory = options.directoryToSave;
    }
    this.bindEvents();

    this.fs = null;

    window.requestFileSystem(window.TEMPORARY, 1024*1024, this.onInitFs.bind(this), this.errorHandler);

    // this._multiple = options.multiple || false;
  }

  FileHandler.prototype.onInitFs = function(filesystem) {
    this.fs = filesystem;
  };

  FileHandler.prototype.bindEvents = function() {
    // if(this._multiple) {
    //   this.buttonUpload.addEventListener('change', this.handleMultipleFiles.bind(this));
    // } else {
    this.buttonUpload.addEventListener('click', this.openFileFromChosenLocation.bind(this));
    this.buttonUpload.addEventListener('drop', this.onDrop.bind(this));
    // }
    this.buttonSaveToDrive.addEventListener('click', this.saveFileToChosenLocation.bind(this));
  };

  // FileHandler.prototype.handleMultipleFiles = function(e) {
  //   var files = e.target.files;
  //   var self = this;

  //   for (var i = 0, file; file = files[i]; ++i) {
  //     // Capture current iteration's file in local scope for the getFile() callback.
  //     (function(f) {
  //       this.fs.root.getFile(f.name, {}, function(fileEntry) {
  //         fileEntry.file(function(file) {
  //           var reader = new FileReader();

  //           reader.onloadend = function(e) {
  //             self._onFileUpload(fileEntry, e);
  //           };
  //           reader.readAsDataURL(file);
  //         }, self._onError);
  //       }, self._onError);
  //     })(file);
  //   }
  // };


  FileHandler.prototype.onDrop = function(e) {
    var self = this;
    var entry = e.dataTransfer.items[0].webkitGetAsEntry();
    this.handleFile(entry);
  };

  FileHandler.prototype.openFileFromChosenLocation = function(e) {
    chrome.fileSystem.chooseEntry({type: 'openFile'}, this.handleFile.bind(this));
  };


  FileHandler.prototype.handleFile = function(fileEntry) {
    var self = this;
    fileEntry.file(function(file) {
      var reader = new FileReader();

      reader.onerror = self.errorHandler;
      reader.onloadend = function(e) {
        self._onFileUpload();
        if(self._uploadToImage) {
          self.loadToImage(e.target.result);
        }
        if(self._saveToDirectory) {
          self.saveToDirectory(fileEntry);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  FileHandler.prototype.saveToDirectory = function(fileToSave) {
    var self = this;
    this._directory.getFile(fileToSave.name, {create: true}, function(fileEntry) {
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = function(e) {
        };
        fileWriter.onerror = function(e) {
          console.log('Write failed: ' + e.toString());
        };
        fileToSave.file ( function(file) {
          fileWriter.write(file);
        });
      }, self._onError);

    }, self._onError);
  };

  FileHandler.prototype.saveFileToChosenLocation = function(fileToSave) {
    var self = this;
    chrome.fileSystem.chooseEntry({ type: 'saveFile', suggestedName: fileToSave.name}, function(writableFileEntry) {
      writableFileEntry.createWriter(function(writer) {
        writer.onwriteend = function(e) {
        };
        fileToSave.file(function(file) {
          writer.write(file);
        });
      }, self._onError);
    });
  };

  FileHandler.prototype.loadToImage = function(imageSource) {
    this.image.setAttribute("src", imageSource);
  };

  FileHandler.prototype.errorHandler = function (e) {
    console.log("error");
  };

  window.app = window.app || {};
  window.app.FileHandler = window.app.FileHandler || FileHandler;

})();
