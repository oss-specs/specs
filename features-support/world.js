'use strict';
var path = require('path');
var fs = require('fs');

// This config is purely to get correct directories for deletion, it
// does not affect how the app is configured.
var appConfig = require('../lib/configuration/app-config').set({
    rootPath: path.join(__dirname, '../')
});

module.exports = function () {
    this.World = function World() {

        this.appPort = process.env.PORT || 3000;

        /**
         * Remove any specs and data already in place.
         *
         * @return promise for operation completion.
         */
        this.deleteProjectData = function () {

            var deleteFolderRecursive = function (path) {
                if (fs.existsSync(path)) {
                    fs.readdirSync(path).forEach(function (file, index) {
                        var curPath = path + "/" + file;
                        if (fs.lstatSync(curPath).isDirectory()) { // recurse
                            deleteFolderRecursive(curPath);
                        } else { // delete file
                            fs.unlinkSync(curPath);
                        }
                    });
                    fs.rmdirSync(path);
                }
                return new Promise(function (resolve, reject) {
                    resolve();
                });
            };

            return deleteFolderRecursive(appConfig.projectsPath)
                .catch(function (err) {

                    // Ignore failure to unlink missing directory.
                    if (err.code !== 'ENOENT') {
                        throw err;
                    }
                });
        };
    };
};
