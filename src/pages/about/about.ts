import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { ClanfPage } from '../clanf/clanf';
import { FiltersPage } from '../filters/filters';
import { ClanPage } from '../clan/clan';
import { NewclanPage } from '../newclan/newclan';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { DomSanitizer } from '@angular/platform-browser';
import { WalletPage } from '../wallet/wallet';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  public general_loader: any;
  public response$: any;
  public usuarios$: any;
  public my_clans: any = [];
  public users$: any;
  public clans_example: any = [
    {
      'title': 'Tec de Mty',
      'members': '200'
    },
    {
      'title': 'Nomads',
      'members': '150'
    }
];
public noms_balance: any = '';

public f_selected: any = 1;
public requests: any = [];
public boletos: any = [];

  constructor(public navCtrl: NavController,
  public af: AngularFireDatabase,
  public loadingCtrl: LoadingController,
  public alertCtrl: AlertController,
  public sanitizer: DomSanitizer) {

  }


  getClass(indice){
    return this.f_selected == indice ? 'btn-filters selected' : 'btn-filters';
  }

  changeClass(indice){
    this.f_selected = indice;
  }

  testWallet(){
   this.navCtrl.parent.select(4);
   setTimeout(() => {this.navCtrl.parent.getSelected().push(WalletPage)}, 500);
  }

  sanitizeThis(image){
    return this.sanitizer.bypassSecurityTrustStyle('url('+image+')');
  }

  isMember(miembros){
    for(let key in miembros){
      if(miembros[key].index == firebase.auth().currentUser.uid){
        return true;
      }
    }
    return false;
  }

  //Eliminar amigos
  confirmErase(indice, request){
    this.alertCtrl.create({
      title: '¿Deseas rechazar esta solicitud de amistad?',
      message: 'Esta persona no será notificada',
      buttons: [
        {
          text: 'Cancelar',
          handler: () =>{

          }
        },
        {
          text: 'Rechazar Solicitud',
          handler: () =>{
            this.eraseRequest(indice, request);
          }
        },
      ]
    }).present();
  }

  eraseRequest(indice, request){
    this.af.list('Users/'+firebase.auth().currentUser.uid+'/requests/'+request).remove();
  }



  //Agregar amigos
  confirmAdd(indice, request){
    this.alertCtrl.create({
      title: '¿Deseas aceptar esta solicitud de amistad?',
      message: 'Esta persona será agregada a tus amigos',
      buttons: [
        {
          text: 'Cancelar',
          handler: () =>{

          }
        },
        {
          text: 'Aceptar Solicitud',
          handler: () =>{
            this.acceptFriend(indice, request);
          }
        },
      ]
    }).present();
  }

  acceptFriend(indice, request){
    let index = this.generateUUID();

    this.af.list('Users/'+firebase.auth().currentUser.uid+'/requests/'+request).remove();
    this.af.list('Users/'+firebase.auth().currentUser.uid+'/friends').update(indice, {'status': 'friends'});
    this.af.list('Users/'+indice+'/friends').update(firebase.auth().currentUser.uid, {'index': firebase.auth().currentUser.uid, 'status':'friends'});

    //Notificacion para el usuario y push notification
    this.af.list('Users/'+indice+'/requests').update(index, {
      'title': '¡Nuevo amigo en Passvent!',
      'subtitle': 'Tienes un nuevo amigo en passvent!',
      'index': index,
      'type': 'notice'
    });
    this.af.list('Notifications').update(index, {
      'title': '¡Nuevo amigo en Passvent!',
      'subtitle': 'Tienes un nuevo amigo en passvent!',
      'index': indice
    });

    this.af.list('Users/'+firebase.auth().currentUser.uid+'/requests').update(index, {
      'title': '¡Nuevo amigo en Passvent!',
      'subtitle': 'Tienes un nuevo amigo en passvent!',
      'index': index,
      'type': 'notice'
    });
    this.af.list('Notifications').update(index, {
      'title': '¡Nuevo amigo en Passvent!',
      'subtitle': 'Tienes un nuevo amigo en passvent!',
      'index': firebase.auth().currentUser.uid
    });

  }

  convertClans(){
    let a = this.response$;
    for(let key in a){
      if(this.isMember(a[key].members)){
        this.my_clans.push({
          'name': (a[key].name.length > 14 ? a[key].name.substring(0, 13) + '..' : a[key].name),
          'name_complete': a[key].name,
          'location': a[key].location,
          'description':  a[key].description,
          'owner':  a[key].owner,
          'rules':  a[key].rules,
          'type':  a[key].type,
          'secret_code':  a[key].secret_code,
          'members':  a[key].members,
          'members_n': Object.keys(a[key].members).length,
          'img':  a[key].img,
          'index':  a[key].index,
          'schedule': (a[key].schedule ? a[key].schedule : [])
        });
      }
    }
    this.general_loader.dismiss();
  }


  getClans(){
    this.af.object('Clans').snapshotChanges().subscribe(action => {
      this.response$ = action.payload.val();
      this.my_clans = [];
      this.convertClans();
    });
  }

  convertRequests(){
    let r = this.users$.requests;
    if(r){
      for(let key in r){
        this.requests.push({
          'index': r[key].index,
          'friend': r[key].friend,
          'friend_name': this.getName(r[key].friend),
          'friend_img': this.getImg(r[key].friend),
          'event': r[key].event,
          'type': r[key].type,
          'request': this.isRequest(r[key].type)
        });
      }
    }
    console.log(this.requests);
    if(this.general_loader) this.general_loader.dismiss();
  }

  getName(indice){
    let u = this.usuarios$;
    for(let key in u){
      if(key == indice) return u[key].name;
    }
  }

  getImg(indice){
    let u = this.usuarios$;
    for(let key in u){
      if(key == indice) return u[key].picture.data.url;
    }
  }

  isRequest(tipo){
    return tipo == 'friend_request' || tipo == 'invite_request' || tipo == 'invitation' ? true : false;
  }

  getText(nombre, tipo){
    if(tipo == 'friend_request'){
      return '¡'+nombre+' solicitó seguirte!'
    }
    else if(tipo == 'invite_request'){
      return nombre+' solicitó invitar a alguien al evento';
    }
    else if(tipo == 'invitation'){
      return '¡Nueva invitacion!';
    }
  }

  getSub(nombre, tipo){
    if(tipo == 'friend_request'){
      return 'Puedes aceptar o rechazar la solicitud para seguirte.'
    }
    else if(tipo == 'invite_request'){
      return '¿Deseas permitir que agregue a esta persona al evento?';
    }
    else if(tipo == 'invitation'){
      return 'Tu amigo '+nombre+' te ha invitado a un evento.';
    }
  }



  ionViewDidLoad() {
    this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando...'
    });
    this.general_loader.present();
    this.af.object('Users').snapshotChanges().subscribe(action => {
      this.usuarios$ = action.payload.val();
    });
    this.af.object('Users/'+firebase.auth().currentUser.uid).snapshotChanges().subscribe(action => {
      this.users$ = action.payload.val();
      this.requests = [];
      this.convertRequests();
    });
  }

  getTextM(miembros){
    let aux = 0;
    for(let key in miembros){
      aux++;
      //console.log('where you from nigga');
    }
    return (aux > 1 ? aux+' nomads' : aux+' nomad');
  }


  openCreate(){
    this.navCtrl.push(NewclanPage);
  }

  openClan(clan){
    this.navCtrl.push(ClanPage, {'Clan': clan});
  }

  openFind(){
    this.navCtrl.push(ClanfPage);
  }

  openFilters(){
    this.navCtrl.push(FiltersPage);
  }

  private generateUUID(): any {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
     });
    return uuid;
  }

}
