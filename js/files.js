(function(){
  window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

  function Store() {
    var self = this;
    this.filesList = null;

    chrome.storage.local.get( 'fileNames', function(storage) {
      console.log(storage);
      self.filesList = storage.fileNames || [];
    });
    console.log(this.filesList);
    this.imagePreview = document.getElementById("image1");
    this.showImageLocalStorage = document.getElementById("showImageLocalStorage");
    this.showImageLocalStorage.addEventListener("click", this.showImage.bind(this));

    this.showImagePathStorage = document.getElementById("showImagePathStorage");
    this.showImagePathStorage.addEventListener("click", this.showImageLocalFileSystem.bind(this));

    this.buttonSaveToDrive = document.getElementById("saveToDrive");
    this.buttonSaveToDrive.addEventListener('click', this.saveFileToChosenLocation);

    this.buttonLocalStorage = document.getElementById("buttonLocalStorage");
    this.buttonLocalStorage.addEventListener('click', function(e) {
      chrome.fileSystem.chooseEntry({type: 'openFile'}, function(readOnlyEntry) {
        readOnlyEntry.file(function(file) {
          displayPath(readOnlyEntry);
          var reader = new FileReader();
          reader.onloadend = function(e) {
            chrome.storage.local.set( { 'file' : e.target.result }, function(){
            } );
          };
          reader.readAsDataURL(file);
        });
      });
    });

    this.buttonLocalStorage = document.getElementById("buttonPathStorage");
    // this.buttonLocalStorage.addEventListener('click', function(e) {
    //   chrome.fileSystem.chooseEntry({type: 'openFile'}, function(readOnlyEntry) {
    //     chrome.fileSystem.getDisplayPath(readOnlyEntry, function(path) {
    //       chrome.storage.local.set( { 'filePath' : path }, function(){
    //         } );
    //     });
    //   });
    // });
    this.buttonLocalStorage.addEventListener("change" , function(e) {
      var files = this.files;

      window.requestFileSystem(window.TEMPORARY, 1024*1024, function(fs) {
        // Duplicate each file the user selected to the app's fs.
        for (var i = 0, file; file = files[i]; ++i) {

          // Capture current iteration's file in local scope for the getFile() callback.
          (function(f) {
            console.log(self);
            self.filesList.push(f.name);
            chrome.storage.local.set( { 'fileNames' : self.filesList } );
            fs.root.getFile(f.name, {create: true, exclusive: true}, function(fileEntry) {
              fileEntry.createWriter(function(fileWriter) {
                fileWriter.write(f); // Note: write() can take a File or Blob object.
              }, errorHandler);
            }, errorHandler);
          })(file);

        }
      }, errorHandler);

    });
  }


  Store.prototype.saveFileToChosenLocation = function(e) {
    chrome.fileSystem.chooseEntry({ type: 'saveFile', suggestedName: 'myfile.html'}, function(writableFileEntry) {
      writableFileEntry.createWriter(function(writer) {
        writer.onwriteend = function(e) {
          $("#OuptutText").html("Save complete!");
        };
        writer.write(new Blob("", { type: 'text/plain'}));
      }, errorHandler);
    });
  };

  var errorHandler = function(e) {
    console.log("an error occurred");
  };

  function displayPath(fileEntry) {
    chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
      console.log(path);
    });
  }
  Store.prototype.showImage = function(e) {
    var self = this;
    chrome.storage.local.get( 'file' , function(storage){
      self.imagePreview.setAttribute('src', storage.file);
    } );
  };

  Store.prototype.showImageFromPath = function(e) {
    var self = this;
    chrome.storage.local.get( 'filePath' , function(storage){
      self.imagePreview.setAttribute('src', storage.file);
    } );
  };


  Store.prototype.showImageLocalFileSystem = function() {
    var self = this;
    function onInitFs(fs) {
      fs.root.getFile(this.filesList[this.filesList.length-1], {}, function(fileEntry) {
        fileEntry.file(function(file) {
          var reader = new FileReader();
          reader.onloadend = function(e) {
            self.imagePreview.setAttribute('src', e.target.result);
          };
           reader.readAsDataURL(file);
        }, errorHandler);

      }, errorHandler);

    }
    window.requestFileSystem(window.TEMPORARY, 1024*1024, onInitFs.bind(this), errorHandler);
  };

  window.app = window.app || {};
  window.app.Store = window.app.Store || new Store();
  console.log(window.app.Store);

})();
