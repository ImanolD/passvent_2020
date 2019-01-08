import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { NewactPage } from '../newact/newact';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { ActivityPage } from '../activity/activity';

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
  public alertCtrl: AlertController) {
  }


  convertActivities(){
    let a = this.response$;
    for(let key in a){
      this.activities.push({
        'title': a[key].title,
        'location': a[key].location,
        'description':  a[key].description,
        'cancelation_policy':  a[key].cancelation_policy,
        'class_price':  a[key].class_price,
        'fee':  a[key].fee,
        'categories':  a[key].categories,
        'schedule':  a[key].schedule,
        'media':  a[key].media,
        'img':  a[key].img,
        'creator':  a[key].creator,
        'index':  a[key].index
      });
    }
    this.activities = this.activities.filter( a => a.creator == firebase.auth().currentUser.uid);
    this.general_loader.dismiss();
  }

  openActivity(actividad){
    this.navCtrl.push(ActivityPage, {'Activity': actividad});
  }


  getActivities(){
    this.af.object('Activities').snapshotChanges().subscribe(action => {
      this.response$ = action.payload.val();
      this.activities = [];
      this.convertActivities();
    });
  }

  ionViewDidLoad() {
    this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Loading...'
    });
    this.general_loader.present();
    this.getActivities();
  }

  openNew(){
    this.navCtrl.push(NewactPage);
  }

}