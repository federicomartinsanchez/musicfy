import { Component, OnInit} from '@angular/core';
import {User} from './models/user';
import {UserService} from './services/user.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [UserService]
})
export class AppComponent implements OnInit {
  public title = 'Musicfy!';
  public user: User;
  public identity;
  public token;
  public errorMessage;

  constructor(private _userService: UserService) {
    this.user = new User('', '', '', '', 'ROLE_USER', '');
    }
    ngOnInit() {
      this.identity = this._userService.getIdentity();
      this.token = this._userService.getToken();
      console.log("User: "+this.identity);
      console.log("token: " +this.token);
    }
    public onSubmit() {
      console.log(this.user);
      this._userService.signUp(this.user).subscribe(
        response => {
          let identity = response.user;
          this.identity = identity;
          if (!this.identity._id) {
            alert("El usuario no esta correctamente identificado");
          } else {
            // Crear elemento en localstorage para tener al usuario en sesion
            localStorage.setItem('identity',JSON.stringify(identity));
            //conseguir el token para enviarselo a las peticiones Http
            this._userService.signUp(this.user, 'true').subscribe(
              response => {
                let token = response.token;
                this.token = token;
                  if (this.token.length <= 0) {
                  alert("el token no se ha cargado correctamente");
                } else {
                  //crear elemento en el localstorage para tener el token disponible
                  localStorage.setItem('token',token);
                  console.log(token);
                  console.log(identity);
                }
              }
            )
          }
          console.log(response);
        },
        error => {
          var errorMessage = <any>error;
          if (errorMessage != null) {
            var body = JSON.parse(error._body);
            this.errorMessage = body.message;
            console.log(error);
          }
        }
      );
    }
    logOut(){
      localStorage.removeItem('identity');
      localStorage.removeItem('token');
      localStorage.clear();

      this.identity=null;
      this.token = null;
    }
}
