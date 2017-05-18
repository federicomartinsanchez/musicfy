'use strict'
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/User');
var jwt = require('../services/jwt');
var path = require('path');
var fs = require ('fs');

function pruebas(req, res) {
  res.status(200).send({
    message: 'Probando una accion del controlador de usuarios del API REST con NODE'
  });
}

function saveUser(req, res) {
  var user = new User();
  var params = req.body;

  console.log(params);

  user.name = params.name;
  user.surname = params.surname;
  user.email = params.email;
  user.role = 'ROLE-ADMIN' // DE MOMENTO
  user.image = null;

  if (params.password) {
    //Encriptar contraseña y guardar datos
    bcrypt.hash(params.password, null, null, function(err, hash) {
      user.password = hash;
      if (user.name != null && user.surname != null && user.email != null) {
        //guardar usuario
        user.save((err, userStored) => {
          if (err) {
            res.status(500).send({
              message: 'Error al guardar el usuario'
            });
          } else {
            if (!userStored) {
              res.status(404).send({
                message: 'No se ha registrado el usuario'
              });
            } else {
              res.status(200).send({
                user: userStored
              });
            }
          }
        });
      } else {
        res.status(200).send({
          message: 'Rellena todos los campos'
        });
      }
    });
  } else {
    res.status(200).send({
      message: 'introduce la contraseña'
    });
  }
}

function loginUser(req, res) {
  var params = req.body;

  var email = params.email;
  var password = params.password;

  User.findOne({
    email: email.toLowerCase()
  }, (err, user) => {
    if (err) {
      res.status(500).send({
        message: "Error en la peticion"
      });
    } else {
      if (!user) {
        res.status(404).send({
          message: "User not found"
        });
      } else {
        //Comprobar la contraseña
        bcrypt.compare(password, user.password, function(err, check) {
          if (check) {
            //devolver los datos del ususario logeado
            if (params.gethash) {
              //devolver un token de jwt
              res.status(200).send({
                token: jwt.createToken(user)
              });
            } else {
              res.status(200).send({
                user
              })
            }
          } else {
            res(404).send({
              message: "El usuario no ha podido loguearse"
            })
          }
        });
      }
    }
  });
}

function updateUser(req, res) {
  var userId = req.params.id;
  var update = req.body;

  User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
    if (err) {
      res.status(500).send({
        message: 'error al actualizar el usuario'
      });
    } else {
      if (!userUpdated) {
        res.status(404).send({
          message: 'No se ha podido actualizar el usuario'
        });
      } else {
        res.status(200).send({
          user: userUpdated,
          message: userId + '  usuario actualizado correctamente'
        });
      }
    }
  });
}

function uploadImage(req, res) {
  var userId = req.params.id;
  var file_name = 'Imagen no subida';

  if (req.files) {
    var file_path = req.files.image.path;
    var file_ext = path.extname(file_path)
    var file_name = path.basename(file_path, file_ext);
    console.log(file_name + file_ext);
    if (file_ext == '.png' || file_ext == '.gif' || file_ext == '.jpg') {
      User.findByIdAndUpdate(userId, {
        image: file_name + file_ext
      }, (err, userUpdated) => {
        if (!userUpdated) {
          res.status(404).send({
            message: 'error al actualizar la imagen del usuario'
          });
        } else {
          res.send({
            user: userUpdated
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
  var filePath = './uploads/users/'+imageFile;
  fs.exists(filePath, function(exists){
    if (exists){
      res.sendFile(path.resolve(filePath));
    }else{
      res.status(200).send({message:'No existe la imagen...'});
    }
  });
}

module.exports = {
  pruebas,
  saveUser,
  loginUser,
  updateUser,
  uploadImage,
  getImageFile
}
