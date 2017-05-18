'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');


function saveAlbum(req, res) {
  var params = req.body;
  var album = new Album();

  album.title = params.title;
  album.description = params.description;
  album.year = params.year;
  album.image = null;
  album.artist = params.artist;

  album.save(album, (err, albumStored) => {
    if (err) {
      message: 'Error en el servidor al guardar el album'

    }
    else {
      if (!albumStored) {
        res.status(404).send({
          message: 'No se ha guardado el album'
        });
      } else {
        res.status(200).send({
          album: albumStored
        });
      }
    }
  });
}

function getAlbum(req, res) {

  var albumId = req.params.id;

  Album.findById(albumId).populate({
    path: 'artist'
  }).exec((err, album) => {
    if (err) {
      res.status(500).send({
        message: 'error en la peticion'
      });
    } else {
      if (!album) {
        res.status(404).send({
          message: 'No existe el album'
        });
      } else {
        res.status(200).send({
          album
        });
      }
    }
  });
}

function getAlbums(req, res) {
  var artistId = req.params.id;

  if (!artistId) {
    var find = Album.find({}).sort('title');
  } else {
    var find = Album.find({
      artist: artistId
    }).sort('year');
  }
  find.populate({
    path: 'artist'
  }).exec((err, albums) => {
    if (err) {
      res.status(500).send({
        message: 'Error del servidor al listar albums'
      });
    } else {
      if (!albums) {
        res.status(404).send({
          message: 'No se han encontrado albums'
        });

      } else {
        res.status(200).send({
          albums
        });
      }
    }
  });
}

function updateAlbum(req, res) {
  var update = req.body;
  var albumId = req.params.id;

  Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) => {
    if (err) {
      res.status(500).send({
        message: 'Error en el servidor al actualizar album'
      });
    } else {
      if (!albumUpdated) {
        res.status(404).send({
          message: 'No se ha encontrado el album a actualizar'
        });
      } else {
        res.status(200).send({
          album: albumUpdated
        });
      }
    }
  });
}

function deleteAlbum(req, res) {
  var albumId = req.params.id;
  Album.findByIdAndRemove(albumId, (err, albumRemoved) => {
    if (err) {
      res.status(500).send({
        message: 'Error en el servidor al borrar album'
      });
    } else {
      if (!albumRemoved) {
        res.status(404).send({
          message: 'No se ha eliminado el album'
        });
      } else {
        Song.find({
          album: albumRemoved._id
        }).remove((err, songRemoved) => {
          if (err) {
            res.status(500).send({
              message: 'Error al eliminar las canciones del album borrado'
            });
          } else {
            if (!songRemoved) {
              res.status(404).send({
                message: 'Las canciones no se ha encontrado o no ha sido eliminadas'
              });
            } else {
              res.status(200).send({
                album: albumRemoved
              });
            }
          }
        });
      }
    }
  });
}

function uploadImage(req, res) {
  var albumId = req.params.id;
  var file_name = 'Imagen no subida';
  console.log(req.files);
  if (req.files) {
    var file_path = req.files.image.path;
    var file_ext = path.extname(file_path)
    var file_name = path.basename(file_path, file_ext);
    console.log(file_name + file_ext);
    if (file_ext == '.png' || file_ext == '.gif' || file_ext == '.jpg') {
      Album.findByIdAndUpdate(albumId, {
        image: file_name + file_ext
      }, (err, albumUpdated) => {
        if (!albumUpdated) {
          res.status(404).send({
            message: 'error al actualizar la imagen del album'
          });
        } else {
          res.send({
            album: albumUpdated
          });
        }
      });
    } else {
      res.status(200).send({
        message: 'Extension del archivo no valida'
      });
    }
  } else {
    res.status(200).send({
      message: 'No has subido ninguna imagen...'
    });
  }
}

function getImageFile(req, res) {
  var imageFile = req.params.imageFile;
  var filePath = './uploads/album/' + imageFile;
  fs.exists(filePath, function(exists) {
    if (exists) {
      res.sendFile(path.resolve(filePath));
    } else {
      res.status(200).send({
        message: 'No existe la imagen...'
      });
    }
  });
}
module.exports = {
  getAlbum,
  saveAlbum,
  getAlbums,
  updateAlbum,
  deleteAlbum,
  uploadImage,
  getImageFile
}
