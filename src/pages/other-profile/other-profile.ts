import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, LoadingController, AlertController, ActionSheetController, ModalController } from 'ionic-angular';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { EventoPage } from '../evento/evento';

/**
 * Generated class for the OtherProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-other-profile',
  templateUrl: 'other-profile.html',
})
export class OtherProfilePage {

  public general_loader: any;
  public usuario: any = [];

  public alumno$: any;
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
      this.usuario = this.navParams.get('user');

      let aux2 = [];
      let e = this.usuario.events;
      for(let key in e){
        aux2.push({
          'index': e[key].index,
          'isOwner': e[key].isOwner,
          'status': e[key].status
        });
      }
      this.usuario.events = aux2;

      this.usuario.events_created = this.usuario.events.filter(e=>e.isOwner).length;
      this.usuario.events_gone = this.usuario.events.length;

      this.fillFriends();


      console.log(this.usuario);
    }

    isIncluded(list){
      for(let key in list){
        if(list[key].index == this.usuario.index) return true;
      }
      return false;
    }

    //Agregar amigos
    confirmAdd(user, indice){
      this.alertCtrl.create({
        title: '¿Deseas agrgar a '+user.name+' a tus amigos?',
        message: 'Recibirá una solicitud para agregarte a sus amigos',
        buttons: [
          {
            text: 'Cancelar',
            handler: () =>{

            }
          },
          {
            text: 'Enviar Solicitud',
            handler: () =>{
              this.af.list('Users/'+firebase.auth().currentUser.uid+'/friends').update(user.index, {'index': user.index, 'status': 'requested'});
              this.sendRequest(user);
            }
          },
        ]
      }).present();
    }
    sendRequest(user){
      let index = this.generateUUID();

      //Enviar el request al amigo
      this.af.list('Users/'+user.index).update('requests', {
        'type': 'friend_request',
        'index': index,
        'friend': firebase.auth().currentUser.uid,
        'event': false
      });

      //Notificacion para el usuario y push notification
      this.af.list('Users/'+user.index+'/notifications').update(index, {
        'title': '¡Nueva solicitud de amistad!',
        'subtitle': 'Tienes una nueva solicitud de amistad en passvent',
        'index': index
      });
      this.af.list('Notifications').update(index, {
        'title': '¡Nueva solicitud de amistad!',
        'subtitle': 'Tienes una nueva solicitud de amistad en passvent',
        'index': user.index
      })
          .then(()=>{
            this.alertCtrl.create({
              title: '¡Solicitud enviada!',
              message: 'Tu solicitud ha sido enviada',
              buttons: ['Ok']
            }).present();
          })
    }


    fillFriends(){
      let aux = [];
      let f2 = this.usuario.friends;
      for(let key in f2){
        aux.push({
          'index': f2[key].index,
          'status': f2[key].status
        });
      }
      this.usuario.friends = aux;

      let f = this.usuario.friends;
      let a;
      for(let key in f){
        if(f[key].status == 'friends'){
          a = this.getPerson(f[key].index);
          f[key].data = a;
        }
      }
      console.log(this.usuario.friends)
    }

    getPerson(indice){
      let p = this.alumno$;
      for(let key in p){
        if(key == indice) return p[key];
      }
    }

    sanitizeThis(image){
      return this.sanitizer.bypassSecurityTrustStyle('url('+image+')');
    }

    filterEvents(tipo, evento){
      if(tipo == 'going'){
        let today = moment().subtract(1, 'days');
        return this.isIncluded(evento.attendants) && !moment(evento.start_day).isBefore(today)
      }
      else if(tipo == 'admin'){
        return evento.creator_index == this.usuario.index;
      }
      else{
        let today = moment().subtract(1, 'days');
        return this.isIncluded(evento.attendants) && moment(evento.start_day).isBefore(today)
      }
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
      let u = this.alumno$;
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
        return lista[key].index == this.usuario.index ? lista[key].status : !privado ? 'Invited' : 'Not';
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
      });
      this.getActivities();
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

  shareGeneral(){
    this.socialSharing.share('Hey! Checa el perfil de esta persona en passvent!')
        .then((entries) =>{
          console.log('success ', +JSON.stringify(entries));
        })
  }

   selectInputFoto() {
    const actionSheet = this.actionSheetCtrl.create({
      title: '¿Que deseas hacer?',
      buttons: [{
        text: 'Bloquear',
        handler: () => {
          console.log('Share clicked');
        }
      },
      {
        text: 'Mandar Mensaje',
        handler: () => {
          console.log('Favorite clicked');
        }
      },
      {
        text: 'Reportar Usuario',
        handler: () => {
          console.log('Favorite clicked');
        }
      },
      {
        text: 'Compartir Perfil',
        handler: () => {
          this.shareGeneral();
        }
      },
      {
        text: 'Url de Perfil',
        handler: () => {
          console.log('Favorite clicked');
        }
      },
      {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
     actionSheet.present();
  }

}
