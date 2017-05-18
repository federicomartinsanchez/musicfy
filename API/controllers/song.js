'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');


function getSong(req, res) {
  var songId = req.params.id;
  Song.findById(songId).populate({
    path: 'album'
  }).exec((err, song) => {
    if (err) {
      res.status(500).send({
        message: "Error en el servidor al obtener cancion"
      });

    } else {
      if (!song) {
        res.status(404).send({
          message: "No se ha encontrado la cancion"
        });
      } else {
        res.status(200).send({
          song
        });
      }
    }

  });
}

function getSongs(req, res) {
  var albumId = req.params.album;
  if (!albumId) {
    var find = Song.find({}).sort('number');
  } else {
    var find = Song.find({
      album: albumId
    }).sort('number');
  }
  find.populate({
    path: 'album',
    populate:{
      path: 'artist',
      model: 'Artist'
    }
  }).exec((err, songs) => {
    if (err) {
      res.status(500).send({
        message: "Error en el servidor al obtener canciones"
      });
    } else {
      if (!songs) {
        res.status(404).send({
          message: "No se han encontrado canciones"
        });
      } else {
        res.status(200).send({
          songs
        });
      }
    }
  });

}
function updateSong(req,res){
  var update = req.body;
  var songId= req.params.id;

  Song.findByIdAndUpdate(songId,update,(err,songUpdated)=>{
    if (err){
      res.status(500).send({message:'Error en el servidor al actualizar cancion'});
    }else{
      if (!songUpdated){
        res.status(404).send({message:'No se ha encontrado la cancion a actualizar'});
      }else{
        res.status(200).send({song:songUpdated});
      }
    }
  });
}
function saveSong(req, res) {
  var song = new Song();
  var params = req.body;
  song.number = params.number;
  song.name = params.name;
  song.duration = params.duration;
  song.file = null;
  song.album = params.album;

  song.save((err, songStored) => {
    if (err) {
      res.status(500).send({
        message: "Error en el servidor al subir cancion"
      });

    } else {
      if (!songStored) {
        res.status(404).send({
          message: "No se ha guardado la cancion"
        });

      } else {
        res.status(200).send({
          song: songStored
        });
      }
    }
  });
}
function deleteSong(req,res){
  var songId = req.params.id;
  Song.findByIdAndRemove(songId,(err,songRemoved)=>{
if (err){
  res.status(500).send({message:'Error en el servidor al borrar cancion'});
}else{
  if (!songRemoved){
    res.status(404).send({message: 'No se ha eliminado la cancion'});
  }else {
    res.status(200).send({song: songRemoved});
  }
}
});
}
function uploadFile(req, res) {
  var songId = req.params.id;
  var file_name = 'No subido';
  console.log(req.files);
  if (req.files) {
    var file_path = req.files.file.path;
    var file_ext = path.extname(file_path)
    var file_name = path.basename(file_path, file_ext);
    console.log(file_name + file_ext);
    if (file_ext == '.mp3') {
      Song.findByIdAndUpdate(songId, {
        file: file_name + file_ext
      }, (err, songUpdated) => {
        if (!songUpdated) {
          res.status(404).send({
            message: 'error al actualizar la cancion'
          });
        } else {
          res.send({
            song: songUpdated
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
      message: 'No has subido ninguna cancion...'
    });
  }
}
function getSongFile(req, res) {
  var songFile = req.params.songFile;
  var filePath = './uploads/songs/' + songFile;
  fs.exists(filePath, function(exists) {
    if (exists) {
      res.sendFile(path.resolve(filePath));
    } else {
      res.status(200).send({
        message: 'No existe la cancion'
      });
    }
  });
}

module.exports = {
  getSong,
  saveSong,
  getSongs,
  updateSong,
  deleteSong,
  uploadFile,
  getSongFile
}
