import {Component,OnInit} from '@angular/core';
import {User} from '../models/user';
import {UserService} from '../services/user.service';

@Component({

  selector: 'user-edit',
  templateUrl:'../views/user-edit.html',
  providers: [UserService]

})

export class UserEditComponent implements OnInit{
public titulo : String;
public user: User;
public identity;
public token;

 constructor(
   private _userService: UserService
 ){
   this.titulo= 'Actualizar mis datos';
 }

ngOnInit(){
  console.log('Componente user.component cargado correctamente');
}


}
