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
         this.af.object('Users/').snapshotChanges().subscribe(action => {
           this.users$ = action.payload.val();
         });
         this.loadMap();
       }

       getEventos(){
         this.af.object('Events').snapshotChanges().subscribe(action => {
           this.response$ = action.payload.val();
           this.eventos = [];
           this.convertEventos();
         });
       }

       getStatus(lista, privado){
         for(let key in lista){
           return lista[key].index == firebase.auth().currentUser.uid ? lista[key].status : !privado ? 'Invited' : 'Not';
         }
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
             'distance': 0,
             'distance_number': '',
             'creator': this.getCreator(a[key].creator, 'name'),
             'creator_img': this.getCreator(a[key].creator, 'img'),
             'creator_index': a[key].creator,
             'description': a[key].description,
             'status': this.getStatus(a[key].attendants, a[key].private),
             'attendants': a[key].attendants,
             'rol': this.getRol(a[key].attendants),
             'messages': (a[key].messages ? a[key].messages : []),
             'index': key,
             'tickets': (a[key].tickets ? a[key].tickets : [])
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
         console.log(this.eventos);

         //CON ESTO SE LLENA EL MAPA

         if(!this.done_g) this.populateMap();
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

       coordenadas(a, address, tit, fn){
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
                icon: 'https://firebasestorage.googleapis.com/v0/b/dev-nomads.appspot.com/o/mapa_icon.png?alt=media&token=5b6660bb-5110-4a2f-9b4c-f6ad84acacdf'
              });

              let modal = vm.modalCtrl.create(DetailsPage, {'Details': a});
              let content = "<h4>"+tit+"</h4>";

              let infoWindow = new google.maps.InfoWindow({
                content: content
              });

              google.maps.event.addListener(marker, 'click', () => {
                //infoWindow.open(vm.map, marker);
                modal.present();
              });
            } else {
               vm.af.list('AppErrors/').push({'type': 'Geocode', 'error': status});
               // alert( 'Geocode was not successful for the following reason: ' + status );
            }
        });
       }

       populateMap(){
         this.done_g = true;
         let vm = this;
         for(let i=0; i<this.eventos.length; i++){

         this.coordenadas(this.eventos[i], this.eventos[i].location, this.eventos[i].title,  function(location){
             vm.eventos[i].location = location;
             let om = vm;
             vm.getDistance(location, function(distance, text){
               console.log(distance+' km');
               vm.eventos[i].distance = text;
               vm.eventos[i].distance_number = distance;
             });
         });

         }


         console.log(this.activities_all);
         this.general_loader.dismiss();
         setTimeout(() => {this.class_slides = true}, 100);
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

       getCreator(indice, que){
         let u = this.users$;
         for(let key in u){
           if(key == indice){
             if(que == 'name') return u[key].name;
             else if(que == 'img') return u[key].picture.data.url;
           }
         }
       }

       getDistance(address, fn){
         let geocoder = new google.maps.Geocoder();
         let vm = this;
         let distance = new google.maps.DistanceMatrixService();
         let result = 0;
         let result2 = '';

         return distance.getDistanceMatrix({
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
                result = response.rows[0].elements[0].distance.value;
                result2 = response.rows[0].elements[0].distance.text;
                fn(result, result2);
                //vm.activities_all[p].distance = response.rows[0].elements[0].distance.value;
                }
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
         //if(this.general_loader) this.general_loader.dismiss();
         this.getEventos();
       }

}
