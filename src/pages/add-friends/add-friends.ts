import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, LoadingController, AlertController, ActionSheetController, ModalController } from 'ionic-angular';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { OtherProfilePage } from '../other-profile/other-profile';

/**
 * Generated class for the AddFriendsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-friends',
  templateUrl: 'add-friends.html',
})
export class AddFriendsPage {

public general_loader: any;

public users$: any;
public response$: any;

public users: any = [];
public amigos: any = [];
public user_data: any = [];

public search: any = '';

//Tipos puede ser: Amigo, Staff, Anfitrion, Fotografo, Invitado
public type: any = '';
public added: any = [];
public lista: any = [];

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
      this.amigos = this.navParams.get('amigos');
      this.type = this.navParams.get('type');
      if(this.navParams.get('lista')) this.lista = this.navParams.get('lista');
      console.log(this.amigos);
      console.log(this.type);
      console.log(this.lista);
    }

    //que ya no salgan los amigos agregados

    filterAmigos(){
      return this.users.filter(a => this.search == '' || a.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1 );
    }

    isIn(indice){
      let i = this.lista;
      console.log(indice);
      if(i.length == 0) return false;
      for(let key in i){
        if(i[key].index == indice) return true;
      }
      return false;
    }

    convertirUsuarios(){
      let u = this.users$;
      for(let key in u){
        if(key != firebase.auth().currentUser.uid){
          this.users.push({
            'name': u[key].name,
            'email': u[key].email,
            'friends': u[key].friends,
            'picture': u[key].picture,
            'preferences': u[key].preferences,
            'requests': u[key].requests,
            'schedule': u[key].schedule,
            'chats': u[key].Chats,
            'events': u[key].Events,
            'web': (u[key].web ? u[key].web : ''),
            'description': (u[key].description ? u[key].description : ''),
            'isamigo': this.isAmigo(key),
            'index': key,
            'selected': false
          });
        }
      }
      console.log(this.users);
      if(this.general_loader) this.general_loader.dismiss();
    }

    openProfile(usuario){
      this.navCtrl.push(OtherProfilePage, {'user': usuario});
    }

    //Otro tipo de agregar
    confirmAgregar(user, cual, indice){
      this.alertCtrl.create({
        title: '¿Deseas agrgar a '+user.name+' a este evento como '+cual+'?',
        message: 'Este usuario será notificado y podrá hacer todas las acciones de un '+cual,
        buttons: [
          {
            text: 'Cancelar',
            handler: () =>{

            }
          },
          {
            text: 'Agregar',
            handler: () =>{
            this.users[indice].selected = true;
             this.added.push({
               'index': user.index,
               'status': (cual != 'invitado' ? 'Accepted' : 'Pending'),
               'isOwner': (cual == 'anfitrión' ? true : false),
               'role': cual,
               'inevent': false
             });
             let indice2 = this.generateUUID();
             this.af.list('Users/'+user.index+'/requests').update(indice2, {
               'index': indice2,
               'friend': firebase.auth().currentUser.uid,
               'event': (this.navParams.get('evento-index') ? this.navParams.get('evento-index') : ''),
               'type': 'invitation'
             });
             console.log(this.added);
            }
          },
        ]
      }).present();
    }

    ionViewWillLeave(){
      localStorage.setItem('added', JSON.stringify(this.added));
    }

    //Agregar amigos
    confirmAdd(user){
      this.alertCtrl.create({
        title: '¿Deseas agregar a '+user.name+' a tus amigos?',
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
      this.af.list('Users/'+user.index+'/requests').update(index, {
        'title': '¡Nueva solicitud de amistad!',
        'subtitle': 'Tienes una nueva solicitud de amistad en passvent',
        'index': index,
        'type': 'friend_request'
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

    isAmigo(indice){
      let a = this.amigos;
      for(let key in a){
        if(a[key].index == indice) return true;
      }
      return false;
    }

    ionViewDidLoad() {
      localStorage.removeItem('added');

      this.general_loader =  this.loadingCtrl.create({
            spinner: 'bubbles',
             content: 'Cargando...'
            });
      this.general_loader.present();
      this.af.object('Users').snapshotChanges().subscribe(action => {
        this.users$ = action.payload.val();
        this.users = []
        this.user_data = [];
        this.convertirUsuario();
        this.convertirUsuarios();
      });
    }

    convertirUsuario(){
      let a = this.users$;
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

      let f = this.user_data.friends;
      let a;

      for(let key in f){
        if(f[key].status == 'friends'){
          a = this.getPerson(f[key].index);
          f[key].data = a;
        }
      }
      console.log(this.user_data.friends);
      this.amigos = this.user_data.friends;
    }

    getPerson(indice){
      let p = this.users$;
      for(let key in p){
        if(key == indice) return p[key];
      }
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
