import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, LoadingController, AlertController, ActionSheetController, ModalController } from 'ionic-angular';
import { ChatsPage } from '../chats/chats';
import { WalletPage } from '../wallet/wallet';
import { MyeventsPage } from '../myevents/myevents';
import { FriendsPage } from '../friends/friends';
import { NotificationsPage } from '../notifications/notifications';
import { HistoryPage } from '../history/history';
import { FiltersPage } from '../filters/filters';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { WelcomePage } from '../welcome/welcome';
import * as moment from 'moment';
import { AyudaPage } from '../ayuda/ayuda';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { EditprofilePage } from '../editprofile/editprofile';
import { EventoPage } from '../evento/evento';
import { AddFriendsPage } from '../add-friends/add-friends';
import { CodigoqrPage } from '../codigoqr/codigoqr';
import { PersonaPage } from '../persona/persona';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  providers: [AngularFireAuth]

})
export class ProfilePage {
public alumno$: any;
public general_loader: any;
public user_data: any=[];
public users$: any;
public noms_balance: any;

public response$: any;
public eventos: any = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public af: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public appCtrl: App,
    public afAuth: AngularFireAuth,
    public actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    public socialSharing: SocialSharing,
    public camera: Camera,
    public sanitizer: DomSanitizer) {
  }

  openAyuda(){
  let modal = this.modalCtrl.create(AyudaPage);
  modal.present();
  }

  openQr(){
    let modal = this.modalCtrl.create(CodigoqrPage);
    modal.present();
  }

  sanitizeThis(image){
    return this.sanitizer.bypassSecurityTrustStyle('url('+image+')');
  }

  shareGeneral(){
    this.socialSharing.share('Hey! Join me on nōmu and get amazing gifts with my invitation code. Download the app and use my code: '+this.user_data.my_code, 'Nomads!')
        .then((entries) =>{
          console.log('success ', +JSON.stringify(entries));
        })
  }

  editarPerfil(){
    this.navCtrl.push(EditprofilePage, {'user': this.user_data});
  }

  presentActionSheet(){
    const actionSheet = this.actionSheetCtrl.create({
  title: 'Choose an Option',
  buttons: [
    {
      text: 'Help Center',
      handler: () => {
        this.openAyuda();
      }
    },
    {
      text: 'Logout',
      handler: () => {
        this.logOut();
      }
    },{
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    }
  ]
});
actionSheet.present();
  }

  addFriends(){
    this.navCtrl.push(AddFriendsPage, {'amigos': this.user_data.friends, 'type': 'friend'});
  }

  openFilters(){
    this.navCtrl.push(FiltersPage);
  }

  getBirthday(){
    let a = moment(this.user_data.birthdate).fromNow();
    a = a.charAt(0) + a.charAt(1) + ' years old';
    return a;
  }

  getActivities(){
    this.af.object('Events').snapshotChanges().subscribe(action => {
      this.response$ = action.payload.val();
      this.eventos = [];
      this.convertEventos();
    });
  }

  convertEventos(){
    let a = this.response$;
    for(let key in a){
      this.eventos.push({
        'title': a[key].title,
        'location': a[key].location,
        'cuesta': a[key].cuesta,
        'start_day': a[key].start_day,
        'start_time': a[key].start_time,
        'end_day': a[key].end_day,
        'end_time': a[key].end_time,
        'externa': a[key].externa,
        'gallery': a[key].gallery,
        'gallery_all': a[key].gallery_all,
        'limit': a[key].limit,
        'private': a[key].private,
        'img': (a[key].img ? a[key].img : ''),
        'dia': moment(a[key].start_day).format('LL'),
        'creator': this.getCreator(a[key].creator, 'name'),
        'creator_img': this.getCreator(a[key].creator, 'img'),
        'creator_index': a[key].creator,
        'description': a[key].description,
        'status': this.getStatus(a[key].attendants, a[key].private),
        'attendants': a[key].attendants
      });
    }

    let e = this.eventos;
    for(let key in e){
      for(let lla in e[key].attendants){
        if(this.isAmigo(e[key].attendants[lla].index)) e[key].attendants[lla].isFriend = true;
        else e[key].attendants[lla].isFriend = false;
      }
    }
    //this.activities = this.activities.filter( a => a.creator == firebase.auth().currentUser.uid);
    if(this.general_loader) this.general_loader.dismiss();
    console.log(this.eventos);
  }

  cuantosAmigos(conteo){
    return conteo.filter(c=>c.isFriend).length;
  }

  isAmigo(indice){
    let u = this.users$;
    let f;
    for(let key in u){
      if(key == firebase.auth().currentUser.uid){
        f = u[key].friends;
        for(let lla in f){
          if(f[lla].index == indice) return true;
        }
      }
    }
    return false;
  }

  openEvento(evento){
    this.navCtrl.push(EventoPage, {'Evento': evento});
  }

  getStatus(lista, privado){
    for(let key in lista){
      return lista[key].index == firebase.auth().currentUser.uid ? lista[key].status : !privado ? 'Invited' : 'Not';
    }
  }

  getCreator(indice, que){
    let u = this.alumno$;
    for(let key in u){
      if(key == indice){
        if(que == 'name') return u[key].name;
        else if(que == 'img') return u[key].picture.data.url;
      }
    }
  }

  ionViewDidLoad() {
    this.general_loader =  this.loadingCtrl.create({
          spinner: 'bubbles',
           content: 'Cargando...'
          });
    this.general_loader.present();
    this.af.object('Users').snapshotChanges().subscribe(action => {
      this.alumno$ = action.payload.val();
      this.user_data = [];
      this.convertirUsuario();
    });
    this.getActivities();
  }

  convertirUsuario(){
    let a = this.alumno$;
    for(let key in a){
      if(key == firebase.auth().currentUser.uid){
        this.user_data.name = a[key].name,
        this.user_data.email = a[key].email,
        this.user_data.friends = a[key].friends,
        this.user_data.picture = a[key].picture.data.url,
        this.user_data.preferences = a[key].preferences,
        this.user_data.requests = a[key].requests,
        this.user_data.schedule = a[key].schedule,
        this.user_data.chats = a[key].Chats,
        this.user_data.events = a[key].Events,
        this.user_data.web = (a[key].web ? a[key].web : ''),
        this.user_data.description = (a[key].description ? a[key].description : '')
      }
    }
    this.fillFriends();
    this.user_data.events_created = this.user_data.events.filter(e=>e.isOwner).length;
    this.user_data.events_gone = this.user_data.events.length;
    console.log(this.user_data);
  }

  fillFriends(){
    let aux = [];
    let f2 = this.user_data.friends;
    for(let key in f2){
      aux.push({
        'index': f2[key].index,
        'status': f2[key].status
      });
    }
    this.user_data.friends = aux;

    let aux2 = [];
    let e = this.user_data.events;
    for(let key in e){
      aux2.push({
        'index': e[key].index,
        'isOwner': e[key].isOwner,
        'status': e[key].status
      });
    }
    this.user_data.events = aux2;

    let f = this.user_data.friends;
    let a;
    for(let key in f){
      if(f[key].status == 'friends'){
        a = this.getPerson(f[key].index);
        f[key].data = a;
      }
    }
    console.log(this.user_data.friends)
  }

  getPerson(indice){
    let p = this.alumno$;
    for(let key in p){
      if(key == indice) return p[key];
    }
  }

  countEventos(tipo){
    // if(tipo == 'Creados'){
    //   return this.user_data.events.filter(e=>e.isOwner).length;
    // }
    // else {
    //   return this.user_data.events.length;
    // }
  }

  filterEvents(tipo, evento){
    if(tipo == 'going'){
      let today = moment().subtract(1, 'days');
      return this.isIncluded(evento.attendants) && !moment(evento.start_day).isBefore(today)
    }
    else if(tipo == 'admin'){
      return evento.creator_index == firebase.auth().currentUser.uid;
    }
    else{
      let today = moment().subtract(1, 'days');
      return this.isIncluded(evento.attendants) && moment(evento.start_day).isBefore(today)
    }
  }

  isIncluded(list){
    for(let key in list){
      if(list[key].index == firebase.auth().currentUser.uid) return true;
    }
    return false;
  }

  openPage(pagina){
    if(pagina == 'c'){
      this.navCtrl.push(ChatsPage);
    }
    else if(pagina == 'w'){
      this.navCtrl.push(WalletPage);
    }
    else if(pagina == 'e'){
      this.navCtrl.push(MyeventsPage);
    }
    else if(pagina == 'cl'){
      this.navCtrl.parent.select(1);
    }
    else if(pagina == 'f'){
      this.navCtrl.push(FriendsPage);
    }
    else if(pagina == 'n'){
      this.navCtrl.push(NotificationsPage);
    }
    else if(pagina == 'h'){
      this.navCtrl.push(HistoryPage);
    }
  }

  logOut(){
    this.afAuth.auth.signOut();
    this.appCtrl.getRootNav().setRoot(WelcomePage);
  }

  presentOptions() {
 let actionSheet = this.actionSheetCtrl.create({
   title: 'Chose an option for your profile picture',
   buttons: [
     {
       text: 'Take a picture',
       handler: () => {
         this.tomarFoto();
       }
     },{
       text: 'Upload a picture',
       handler: () => {
         this.escogerFoto();
       }
     },{
       text: 'Cancel',
       role: 'cancel',
       handler: () => {
         console.log('Cancel clicked');
       }
     }
   ]
 });
 actionSheet.present();
}

uploadFoto(link){
  this.af.list('Users').update(firebase.auth().currentUser.uid, {
    'img': link
  }).then(() => this.general_loader.dismiss());
}

tomarFoto(){
   this.general_loader = this.loadingCtrl.create({
     spinner: 'bubbles',
     content: 'Uploading Picture...'
    });
   const options: CameraOptions={
    quality: 50,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    correctOrientation: true
   }

   this.camera.getPicture(options).then(result => {
     this.general_loader.present();
     const image = `data:image/jpeg;base64,${result}`;

     const pictures = firebase.storage().ref('/Users/');
     pictures.child('pictures').child(this.generateUUID()).putString(image, 'data_url').then(kk=>{
       kk.ref.getDownloadURL().then(url => {
         this.uploadFoto(url);
       })
     });
   });
}
escogerFoto(){
this.general_loader = this.loadingCtrl.create({
  spinner: 'bubbles',
  content: 'Uploading Picture...'
 });

  const options: CameraOptions={
   quality: 50,
   sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
   destinationType: this.camera.DestinationType.DATA_URL,
   encodingType: this.camera.EncodingType.JPEG,
   correctOrientation: true
  }

  this.camera.getPicture(options).then(result => {
    this.general_loader.present();
    const image = `data:image/jpeg;base64,${result}`;

    const pictures = firebase.storage().ref('/Users/');
    pictures.child('pictures').child(this.generateUUID()).putString(image, 'data_url').then(kk=>{
      kk.ref.getDownloadURL().then(url => {
        this.uploadFoto(url);
      })
    });
  });}

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
