import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
declare var google;
import { Geolocation } from '@ionic-native/geolocation';
import { FiltersPage } from '../filters/filters';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { WalletPage } from '../wallet/wallet';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivityPage } from '../activity/activity';
import { EventPage } from '../event/event';
import * as moment from 'moment';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
public general_loader: any;

//For the user
public users$: any;
public noms_balance: any = [];
public nomad_schedule: any = [];

public response$: any;
public e_response$: any;
public activities_all: any = [];

public auxiliar: any;
public class_slides: any= false;

  @ViewChild('map') mapElement: ElementRef;
   map: any;

  constructor( public navCtrl: NavController,
    public navParams: NavParams,
    public af: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public geolocation: Geolocation,
    public sanitizer: DomSanitizer) {

  }

  sanitizeThis(image){
    return this.sanitizer.bypassSecurityTrustStyle('url('+image+')');
  }

  openFilters(){
    this.navCtrl.push(FiltersPage);
  }

  testWallet(){
   this.navCtrl.parent.select(4);
   setTimeout(() => {this.navCtrl.parent.getSelected().push(WalletPage)}, 500);
  }


  getCoordinates(direccion){



 }

 seeDetails(a){
   if(a.isEvent){
     this.navCtrl.push(EventPage, {'Event': a});
   }
   else{
     this.navCtrl.push(ActivityPage, {'Activity': a});
   }
 }

 changePosition(){


   if(this.class_slides){
     this.class_slides = false;
   }
   else{
     this.class_slides = true;
   }
 }

 coordenadas(address, tit, fn){
   let geocoder = new google.maps.Geocoder();
   let vm = this;
   geocoder.geocode( { 'address' : address}, function( results, status ) {
      if( status == google.maps.GeocoderStatus.OK ) {
        console.log(results);
        fn(results[0].formatted_address);
        let marker = new google.maps.Marker({
          map: vm.map,
          animation: google.maps.Animation.DROP,
          position: results[0].geometry.location,
          icon: 'https://firebasestorage.googleapis.com/v0/b/dev-nomads.appspot.com/o/pink-icon.png?alt=media&token=3448077b-ef8e-4925-a3fa-27274caee626'
        });
        let content = "<h4>"+tit+"</h4>";

        let infoWindow = new google.maps.InfoWindow({
          content: content
        });

        google.maps.event.addListener(marker, 'click', () => {
          infoWindow.open(vm.map, marker);
        });
      } else {
         alert( 'Geocode was not successful for the following reason: ' + status );
      }
  });
 }

  populateMap(){

    let vm = this;
    for(let i=0; i<this.activities_all.length; i++){

    this.coordenadas(this.activities_all[i].location, this.activities_all[i].title_complete,  function(location){
        vm.activities_all[i].location = location;
    });

    }

    console.log(this.activities_all);
    this.general_loader.dismiss();
    setTimeout(() => {this.class_slides = true}, 100);
    this.getDistance();
  }




  getDistance(){
    let geocoder = new google.maps.Geocoder();
    let vm = this;
    let distance = new google.maps.DistanceMatrixService();
    let address = 'Sebastian el Cano 200 Del Valle San Luis Potosi';

    for(let i=0; i<this.activities_all.length; i++){
      console.log(vm.activities_all[i].location);
      distance.getDistanceMatrix({
         origins: [vm.map.getCenter()],
         destinations: [address],
         travelMode: google.maps.TravelMode.DRIVING
         },
     function (response, status) {
         // check status from google service call
         if (status !== google.maps.DistanceMatrixStatus.OK) {
             console.log('Error:', status);
         } else {
           console.log(response);
              // vm.activities_all[i].distance = response.rows[0].elements[0].distance.value;
             }
     });

    }
   console.log(this.activities_all);
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
        'day': a[key].day
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
            'cancelation_policy':  b[key].cancelation_policy,
            'categories':  b[key].categories,
            'schedule':  b[key].schedule,
            'img':  b[key].img,
            'cost':  b[key].cost,
            'type':  b[key].type,
            'allDay': false,
            'creator':  b[key].creator,
            'index':  b[key].index,
            'media': b[key].media,
            'isEvent': false,
            'distance': 0
          });
      }

   console.log(this.activities_all);
   this.populateMap();
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


  ionViewDidLoad(){
    this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Loading...'
    });
    this.general_loader.present();
    this.af.object('Users/'+firebase.auth().currentUser.uid).snapshotChanges().subscribe(action => {
      this.users$ = action.payload.val();
      this.noms_balance = this.users$.noms;
    });
    this.loadMap();
  }


    loadMap(){

      this.geolocation.getCurrentPosition().then((position) => {

        let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        let mapOptions = {
          center: latLng,
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        this.addMarker();
      }, (err) => {
        console.log(err);
      });

    }

    addMarker(){
      let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: this.map.getCenter(),
        icon: 'https://firebasestorage.googleapis.com/v0/b/dev-nomads.appspot.com/o/user.png?alt=media&token=fcd730d1-fdd7-4eae-b98f-070237331cee'
      });

      let content = "<h4>Here you are!</h4>";
      //let content = context.toDataUrl()
      this.addInfoWindow(marker, content);
   }

   addInfoWindow(marker, content){

      let infoWindow = new google.maps.InfoWindow({
        content: content
      });

      google.maps.event.addListener(marker, 'click', () => {
        infoWindow.open(this.map, marker);
      });
      this.getActivities();
    }

}
