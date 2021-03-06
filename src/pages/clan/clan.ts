import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { FiltersPage } from '../filters/filters';
import { DomSanitizer } from '@angular/platform-browser';
import { MembersPage } from '../members/members';
import { NeweventPage } from '../newevent/newevent';
import { ChatsPage } from '../chats/chats';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import * as moment from 'moment';
import { ActivityPage } from '../activity/activity';
import { EventPage } from '../event/event';

/**
 * Generated class for the ClanPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-clan',
  templateUrl: 'clan.html',
})
export class ClanPage {
public type: any='';
public clan: any = [];
public schedule: any = [];

public e_response$: any;
public response$: any;
public activities_all: any = [];

public general_loader: any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public sanitizer: DomSanitizer,
              public socialSharing: SocialSharing,
              public loadingCtrl: LoadingController,
              public af: AngularFireDatabase) {
    this.type = localStorage.getItem('Tipo');
    this.clan = this.navParams.get('Clan');
    if(this.clan.schedule.length != 0) this.getSchedule();
  }

  getSchedule(){
    let a = this.clan.schedule;
    for(let key in a){
      this.schedule.push({
        'date': a[key].date,
        'day': a[key].day,
        'index': a[key].index,
        'name': a[key].name,
        'nomad_index': a[key].nomad_index,
        'time': a[key].time,
        'title': a[key].title
      });
    }
    console.log(this.schedule);
  }

  goJoin(){
    this.navCtrl.parent.select(0);
    // setTimeout(() => {this.navCtrl.parent.getSelected().push(WalletPage)}, 500);
  }

  shareGeneral(){
    this.socialSharing.share('Hey! I am member of the clan '+this.clan.name_complete+' with '+Object.keys(this.clan.members).length+' members. Join my clan on nōmu!', 'Nomads!')
        .then((entries) =>{
          console.log('success ', +JSON.stringify(entries));
        })
  }

  openChat(){
    this.navCtrl.parent.select(4)
        .then(()=> this.navCtrl.parent.getSelected().push(ChatsPage, {'Segmento': 'clans'}));
  }

  openNew(){
    this.navCtrl.push(NeweventPage, {'Clan': true});
  }

  sanitizeThis(image){
    return this.sanitizer.bypassSecurityTrustStyle('url('+image+')');
  }

  openMembers(){
    this.navCtrl.push(MembersPage, {'Members': this.clan.members});
  }

  openFilters(){
    this.navCtrl.push(FiltersPage);
  }

  getEvents(){
    this.af.object('Events').snapshotChanges().subscribe(action => {
      this.e_response$ = action.payload.val();
      this.activities_all = [];
      this.convertActivities();
    });
  }

  getActivities(){
    this.af.object('Activities').snapshotChanges().subscribe(action => {
      this.response$ = action.payload.val();
      this.getEvents();
    });
  }

  whichIs(indice){
    for(let key in this.activities_all){
      if(this.activities_all[key].index == indice) this.seeDetails(this.activities_all[key]);
    }
  }

  seeDetails(a){
    if(a.isEvent){
      this.navCtrl.push(EventPage, {'Event': a});
    }
    else{
      this.navCtrl.push(ActivityPage, {'Activity': a});
    }
  }

  convertActivities(){
    let a = this.e_response$;

    for(let key in a){
      this.activities_all.push({
        'title': a[key].title.substring(0, 10) + '..',
        'title_complete': a[key].title,
        'location': a[key].location,
        'difficulty':  a[key].difficulty,
        'img':  a[key].img,
        'cost':  a[key].cost,
        'about_event':  a[key].about_event,
        'provided':  a[key].provided,
        'about_organizer':  a[key].about_organizer,
        'type':  a[key].type,
        'allDay': false,
        'time': a[key].time,
        'creator':  a[key].creator,
        'index':  a[key].index,
        'media': a[key].media,
        'isEvent': true,
        'distance': 0,
        'distance_number': '',
        'day': a[key].day,
        'review':( a[key].review ? a[key].review : 5),
        'reviews': (a[key].reviews ? a[key].reviews : []),
        'nomads': (a[key].nomads ? a[key].nomads : [])
      });
  }

  let today  = moment();
  this.activities_all = this.activities_all.filter( event => !moment(event.day).isBefore(today));

    let b = this.response$;
      for(let key in b){
          this.activities_all.push({
            'title': b[key].title.substring(0, 10) + '..',
            'title_complete': b[key].title,
            'location': b[key].location,
            'description':  b[key].description,
            'useful_notes': (b[key].useful_notes ? b[key].useful_notes : ''),
            'cancelation_policy':  b[key].cancelation_policy,
            'categories':  b[key].categories,
            'schedule':  b[key].schedule,
            'img':  b[key].img,
            'class_price':  b[key].class_price,
            'type':  b[key].type,
            'allDay': false,
            'creator':  b[key].creator,
            'index':  b[key].index,
            'media': b[key].media,
            'isEvent': false,
            'distance': 0,
            'distance_number': '',
            'review':( b[key].review ? b[key].review : 5),
            'reviews': (b[key].reviews ? b[key].reviews : []),
            'nomads': (b[key].nomads ? b[key].nomads : [])
          });
      }

   if(this.general_loader) this.general_loader.dismiss();
   console.log(this.activities_all);
  }

  ionViewDidLoad() {
    this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Loading...'
    });
    this.general_loader.present();

    this.getActivities();
  }

}
