'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');


function getArtist(req, res) {
  var artistId = req.params.id;

  Artist.findById(artistId, (err, artist) => {
    if (err) {
      res.status(500).send({
        message: 'Error al consultar la base de datos'
      });
    } else {
      if (artist) {
        res.status(200).send({
          artist
        });
      } else {
        res.status('404').send({
          message: 'No se ha encontrado al artista'
        });
      }
    }

  })
}

function getArtists(req, res) {
  if (req.params.page) {
    var page = req.params.page;
  } else {
    var page = 1;
  }
  var itemsPerPage = 3;

  Artist.find().sort('name').paginate(page, itemsPerPage, function(err, artists, total) {
    if (err) {
      res.status(500).send({
        message: 'Error al listar artistas'
      });
    } else {
      if (!artists) {
        res.status(404).send({
          message: 'No hay artistas'
        });
      } else {
        res.status(200).send({
          pages: total,
          artists: artists
        });
      }
    }
  });

}

function saveArtist(req, res) {
  var artist = new Artist();
  var params = req.body;

  artist.name = params.name;
  artist.description = params.description;
  artist.image = null;
  artist.save((err, artistStored) => {
    if (err) {
      res.status(500).send({
        message: 'Error al guardar el artista'
      });
    } else {
      if (!artistStored) {
        res.status(404).send({
          message: 'El artista no ha sido guardado'
        });
      } else {
        res.status(200).send({
          artist: artistStored
        });
      }
    }
  });
}

function updateArtist(req, res) {
  var artistId = req.params.id;
  var update = req.body;

  Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
    if (err) {
      res.status(500).send({
        message: 'Error al actualizar el artista'
      });
    } else {
      if (!artistUpdated) {
        res.status(404).send({
          message: 'No se ha encontrado el Artista'
        });
      } else {
        res.status(200).send({
          artist: artistUpdated,
        });
      }

    }
  });
}

function deleteArtist(req, res) {

  var artistId = req.params.id;
  Artist.findByIdAndRemove(artistId, (err, artistRemoved) => {
    if (err) {
      res.status(500).send({
        message: 'Error al eliminar el artista'
      });
    } else { if (!artistRemoved) {
        res.status(404).send({message: 'El artista no se ha encontrado o no ha sido eliminado'});
      } else {
        // si encuentra al artista borramos sus albumes
        Album.find({artist: artistRemoved._id}).remove((err, albumRemoved) => {
          if (err) {
            res.status(500).send({
              message: 'Error al eliminar los albums del artista borrado'
            });
          } else {
            if (!albumRemoved) {
              res.status(404).send({
                message: 'El album no se ha encontrado o no ha sido eliminado'
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
                      artist: artistRemoved
                    });
                  }
                }
              });
            }
          }
        });
      }
    }
  });
}

function uploadImage(req, res) {
  var artistId = req.params.id;
  var file_name = 'Imagen no subida';
console.log(req.files);
  if (req.files) {
    var file_path = req.files.image.path;
    var file_ext = path.extname(file_path)
    var file_name = path.basename(file_path, file_ext);
    console.log(file_name + file_ext);
    if (file_ext == '.png' || file_ext == '.gif' || file_ext == '.jpg') {
      Artist.findByIdAndUpdate(artistId, {
        image: file_name + file_ext
      }, (err, artistUpdated) => {
        if (!artistUpdated) {
          res.status(404).send({
            message: 'error al actualizar la imagen del artista'
          });
        } else {
          res.send({
            artist: artistUpdated
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
function getImageFile(req,res){
  var imageFile = req.params.imageFile;
  var filePath = './uploads/artists/'+imageFile;
  fs.exists(filePath, function(exists){
    if (exists){
      res.sendFile(path.resolve(filePath));
    }else{
      res.status(200).send({message:'No existe la imagen...'});
    }
  });
}

module.exports = {
  getArtist,
  getArtists,
  saveArtist,
  updateArtist,
  deleteArtist,
  uploadImage,
  getImageFile
}
