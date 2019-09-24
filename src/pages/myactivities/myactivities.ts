import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { NewactPage } from '../newact/newact';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { ActivityPage } from '../activity/activity';
import { EditactPage } from '../editact/editact';
import { NeweventPage } from '../newevent/newevent';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { EventoPage } from '../evento/evento';

/**
 * Generated class for the MyactivitiesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-myactivities',
  templateUrl: 'myactivities.html',
})
export class MyactivitiesPage {

public response$: any;
public users$: any;
public activities: any = [];
public general_loader: any;

  constructor(public navCtrl: NavController,
  public navParams: NavParams,
  public af: AngularFireDatabase,
  public loadingCtrl: LoadingController,
  public alertCtrl: AlertController,
  public sanitizer: DomSanitizer) {
    moment.locale('es');
  }

  openEvento(evento){
    this.navCtrl.push(EventoPage, {'Evento': evento});
  }

  confirmEdit(act){
    this.alertCtrl.create({
      title: 'What would you like to do?',
      message:  'You can edit this activity or see how its displayed to nomads',
      buttons: [
        {
          text: 'Edit',
          handler: () => {
           this.navCtrl.push(EditactPage, {'Act': act});
          }
        },
        {
          text: 'View',
          handler: () => {
            this.openActivity(act);
          }
        }
      ]
    }).present();
  }

  sanitizeThis(image){
    return this.sanitizer.bypassSecurityTrustStyle('url('+image+')');
  }



  convertActivities(){
    let a = this.response$;
    for(let key in a){
      if(a[key].creator == firebase.auth().currentUser.uid){
        this.activities.push({
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
          'description': (a[key].description ? a[key].description : ''),
          'status': this.getStatus(a[key].attendants, a[key].private),
          'attendants': this.fillFriends(a[key].attendants),
          'admins': this.getAdmins(a[key].attendants),
          'rol': this.getRol(a[key].attendants),
          'messages': (a[key].messages ? a[key].messages : []),
          'index': key,
          'tickets': (a[key].tickets ? a[key].tickets : [])
        });
      }
    }
    //this.activities = this.activities.filter( a => a.creator == firebase.auth().currentUser.uid);
    this.general_loader.dismiss();
    console.log(this.activities);
  }

  getRol(lista){
    let aux2 = [];
    for(let key in lista){
      aux2.push({
        'isOwner': lista[key].isOwner,
        'index': lista[key].index,
        'role': lista[key].role
      })
    }
    console.log(aux2);
    let aux = aux2.filter(l=>l.index == firebase.auth().currentUser.uid);
    if(aux.length != 0) return aux[0].role;
    return 'nada';
  }

  getAdmins(lista){
    let aux = [];
    for(let key in lista){
      aux.push({
        'isOwner': lista[key].isOwner
      })
    }
    console.log(aux);
    return aux.filter(l=>l.isOwner).length;
  }

  fillFriends(f){
    let aux = [];
    let a;
    for(let key in f){
        a = this.getPerson(f[key].index);
        aux.push({
          'index': f[key].index,
          'inevent': f[key].inevent,
          'isOwner': f[key].isOwner,
          'role': f[key].role,
          'status': f[key].status,
          'data': a
        });
    }
    return aux;
  }

  getPerson(indice){
    let p = this.users$;
    for(let key in p){
      if(key == indice) return p[key];
    }
  }

  getStatus(lista, privado){
    let aux2 = [];
    for(let key in lista){
      aux2.push({
        'isOwner': lista[key].isOwner,
        'index': lista[key].index,
        'role': lista[key].role,
        'status': lista[key].status
      })
    }
    for(let i=0; i<aux2.length; i++){
      console.log(aux2[i]);
      if(aux2[i].index == firebase.auth().currentUser.uid) return aux2[i].status;
    }
    return !privado ? 'Invited' : 'Not'
  }

  getCreator(indice, que){
    let u = this.users$;
    for(let key in u){
      if(key == indice){
        console.log(u[key])
        if(que == 'name') return u[key].name;
        else if(que == 'img') return u[key].picture.data.url;
      }
    }
    return '';
  }

  openActivity(actividad){
    this.navCtrl.push(ActivityPage, {'Activity': actividad});
  }

  newEvent(){
    this.navCtrl.push(NeweventPage);
  }


  getActivities(){
    this.af.object('Events').snapshotChanges().subscribe(action => {
      this.response$ = action.payload.val();
      this.activities = [];
      this.convertActivities();
    });
  }

  ionViewDidLoad() {
    this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando...'
    });
    this.general_loader.present();
    this.af.object('Users').snapshotChanges().subscribe(action => {
      this.users$ = action.payload.val();
    });
    this.getActivities();
  }

  openNew(){
    this.navCtrl.push(NewactPage);
  }

}
