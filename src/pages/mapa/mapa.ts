import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController } from 'ionic-angular';
declare var google;
import { Geolocation } from '@ionic-native/geolocation';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { DetailsPage } from '../details/details';

/**
 * Generated class for the MapaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-mapa',
  templateUrl: 'mapa.html',
})
export class MapaPage {

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

  public done_g: any = false;
  public user_preferences: any = [];
  public filtered_a: any = [];

  public f_selected: any = 1;
  public eventos: any = [];

    @ViewChild('map') mapElement: ElementRef;
     map: any;

     constructor( public navCtrl: NavController,
       public navParams: NavParams,
       public af: AngularFireDatabase,
       public loadingCtrl: LoadingController,
       public alertCtrl: AlertController,
       public geolocation: Geolocation,
       public sanitizer: DomSanitizer,
       public modalCtrl: ModalController) {}

       ionViewDidLoad(){
         this.general_loader = this.loadingCtrl.create({
           spinner: 'bubbles',
           content: 'Cargando...'
         });
         this.general_loader.present();
         this.loadMap();
       }

       loadMap(){

         this.geolocation.getCurrentPosition().then((position) => {

           let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

           let mapOptions = {
             center: latLng,
             zoom: 12,
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
           position: this.map.getCenter()
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
           //infoWindow.open(this.map, marker);
         });
         if(this.general_loader) this.general_loader.dismiss();
         //this.getActivities();

       }

}
