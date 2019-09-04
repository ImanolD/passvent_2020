import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the InvitadosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-invitados',
  templateUrl: 'invitados.html',
})
export class InvitadosPage {

  public search: any = '';
  public f_selected: any = 1;
  public f_selected2: any = 1;

  public users: any = [];
  public tipo: any = '';

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.users = this.navParams.get('users');
    this.tipo = this.navParams.get('type');
    console.log(this.users);
  }


  returnUsers(){
    return this.users.filter(f=>(this.search == '' || f.data.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1));
  }


  getClass(indice){
    return this.f_selected == indice ? 'btn-filters selected' : 'btn-filters';
  }

  changeClass(indice){
    this.f_selected = indice;
  }

  getClass2(indice){
    return this.f_selected2 == indice ? 'btn-filters selected2' : 'btn-filters';
  }

  changeClass2(indice){
    this.f_selected2 = indice;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InvitadosPage');
  }

}
