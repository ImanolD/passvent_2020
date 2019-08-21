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
        'dia': moment(a[key].start_day).format('LL')
      });
    }
    //this.activities = this.activities.filter( a => a.creator == firebase.auth().currentUser.uid);
    this.general_loader.dismiss();
    console.log(this.activities);
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
    this.getActivities();
  }

  openNew(){
    this.navCtrl.push(NewactPage);
  }

}
