import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController } from 'ionic-angular';
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
import { DetailsPage } from '../details/details';
import { MapaPage } from '../mapa/mapa';
import { OtherProfilePage } from '../other-profile/other-profile';
import { AllPage } from '../all/all';
import { EventoPage } from '../evento/evento';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
public general_loader: any;

//For the user
public users$: any;
public users: any = [];
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
public search: any = '';

public ciudades: any = [
  {
    'name': 'San Luis Potosí',
    'events': true,
    'img': 'https://www.visitmexico.com/viajemospormexico/assets/uploads/destinos/san-luis-potosi_destinos-principales_san-luis-potosi_01.jpg'
  },
  {
    'name': 'Querétaro',
    'events': false,
    'img': 'https://www.visitmexico.com/viajemospormexico/assets/uploads/destinos/queretaro_destinos-principales_queretaro_int.jpg'
  },
  {
    'name': 'León',
    'events': false,
    'img': 'https://www.leon.gob.mx/leon/images/image5.jpg'
  },
  {
    'name': 'Cancún',
    'events': false,
    'img': 'https://www.avianca.com/content/dam/avianca_new/destinos/cun/cun_banner_cancun_destino.jpg'
  },
  {
    'name': 'Monterrey',
    'events': false,
    'img': 'https://www.visitmexico.com/viajemospormexico/assets/uploads/destinos/nuevo-leon_destinos-principales_monterrey_01.jpg'
  },
  {
    'name': 'Guadalajara',
    'events': false,
    'img': 'https://img.chilango.com/2019/05/que-hacer-en-guadalajara-2.jpg'
  },
  {
    'name': 'Puerto Vallarta',
    'events': false,
    'img': 'https://www.garzablancaresort.com.mx/blog/wp-content/uploads/2015/12/the-best-beaches-in-puerto-vallarta-e1506119214708.jpg'
  },
  {
    'name': 'Ciudad de México',
    'events': false,
    'img': 'https://cdn-3.expansion.mx/dims4/default/01d4259/2147483647/strip/true/crop/659x462+0+0/resize/800x561!/quality/90/?url=https%3A%2F%2Fcdn-3.expansion.mx%2Fdb%2Fdbf1446c85fabec0927577fc1a27d598%2Fcdmx-reforma20180516134246.jpg'
  },
]

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

  openProfile(usuario){
    this.navCtrl.push(OtherProfilePage, {'user': usuario});
  }

  openAll(ciudad){
    this.navCtrl.push(AllPage, {'city': ciudad, 'eventos': this.eventos});
  }

  filterAmigos(){
    return this.users.filter(a => this.search == '' || a.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1 );
  }

  openMapa(){
    this.navCtrl.push(MapaPage);
  }


  getClass(indice){
    return this.f_selected == indice ? 'btn-filters selected' : 'btn-filters';
  }

  changeClass(indice){
    this.f_selected = indice;
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

  openEvent(event){
    this.navCtrl.push(EventoPage, {'Evento': event});
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

 getFiltersP(){
   this.af.object('Users/'+firebase.auth().currentUser.uid+'/preferences').snapshotChanges().subscribe(action => {
     this.user_preferences = action.payload.val();
     console.log(this.user_preferences);
     this.applyFilters();
   });
 }

 existsF(arre, cual){
   for(let key in arre){
     if(arre[key].name == cual) return true;
   }
   return false;
 }

 existsO(arre, cual){
   console.log(arre);
   for(let key in arre){
     if(arre[key].title == cual) return true;
   }
   return false;
 }

 applyFilters(){
   let cats = this.user_preferences.categories.filter(c => c.selected);
   let days = this.user_preferences.days.filter(d => d.selected);
   let forms = this.user_preferences.forms.filter(f=> f.selected);
   let types = this.user_preferences.types.filter(t=> t.selected);
   let aux = [];
   let a = this.activities_all;

   if(cats.length > 0){
     for(let i=0; i<a.length; i++){
       if(!a[i].isEvent && this.existsF(cats, a[i].categories.main_category)){
         aux.push(a[i]);
       }
     }
   }

   if(types.length > 0){
     for(let i=0; i<a.length; i++){
       if(!a[i].isEvent && this.existsO(types, a[i].categories.activity_type) && !a[i].isEvent){
         aux.push(a[i]);
       }
     }
   }

    aux = aux.sort(function(a, b){
    var keyA = a.distance_number,
        keyB = b.distance_number;
    // Compare the 2 dates
    if(keyA < keyB) return -1;
    if(keyA > keyB) return 1;
    return 0;
   });

   this.filtered_a = aux;
   console.log(this.filtered_a);
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

 getSorted(){
   return this.activities_all.sort(function(a, b){
    var keyA = a.distance_number,
        keyB = b.distance_number;
    // Compare the 2 dates
    if(keyA < keyB) return -1;
    if(keyA > keyB) return 1;
    return 0;
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


    if(this.general_loader) this.general_loader.dismiss();
    setTimeout(() => {this.class_slides = true}, 100);
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
            'nomads': (b[key].nomads ? b[key].nomads : []),
            'next_time': '',
            'next_remaining': 0,
            'next_spaces': 0
          });
      }

      for(let i=0; i<this.activities_all.length; i++){
        if(!this.activities_all[i].isEvent){
          let h = this.activities_all[i].schedule;
          let today =  moment().format('dddd');
          let next = 'not today';
          let hours_left = 1000;
          let aux = new Date();
          let remaining;
          let remaining_n;
          let spaces;

          for(let key in h){
           if(today == h[key].day){

             aux.setHours(parseInt(h[key].start_time.charAt(0) + h[key].start_time.charAt(1)));
             aux.setMinutes(parseInt(h[key].start_time.charAt(3) + h[key].start_time.charAt(4)));

             remaining = moment(aux).fromNow();

             if(remaining.indexOf('in ')>-1){
               remaining = remaining.slice(3);
               remaining_n = parseInt(remaining.charAt(0)+remaining.charAt(1));
               if(remaining.indexOf('minutes')==-1) remaining_n += 100;

               if(remaining_n < hours_left){
                 next = h[key].start_time;
                 hours_left = remaining_n;
                 spaces = h[key].spaces_available;
               }
             }

           }
          }
          if(next != 'not today'){
            let aux2 = new Date();
            aux2.setHours(parseInt(next.charAt(0) + next.charAt(1))-1);
            aux2.setMinutes(parseInt(next.charAt(3) + next.charAt(4)));
            next = moment(aux2).format('LT');
          }


          this.activities_all[i].next_time = next;
          this.activities_all[i].next_remaining = hours_left;
          this.activities_all[i].next_spaces = spaces;
        }
      }

   this.getFiltersP();
   console.log(this.activities_all);
   if(!this.done_g) this.populateMap();
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

  getEventos(){
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

    //if(!this.done_g) this.populateMap();
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

  cuantosAmigos(conteo){
    let aux = [];
    for(let key in conteo){
      aux.push({
        'isFriend': conteo[key].isFriend
      })
    }
    return aux.filter(c=>c.isFriend).length;
  }

  filterEventos(){
    return this.eventos.filter(e=> this.search == '' || e.title.toLowerCase().indexOf(this.search.toLowerCase())>-1 );
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


  getCreator(indice, que){
    let u = this.users$;
    for(let key in u){
      if(key == indice){
        if(que == 'name') return u[key].name;
        else if(que == 'img') return u[key].picture.data.url;
      }
    }
  }

  getStatus(lista, privado){
    for(let key in lista){
      return lista[key].index == firebase.auth().currentUser.uid ? lista[key].status : !privado ? 'Invited' : 'Not';
    }
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


  ionViewDidLoad(){
    this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando...'
    });
    this.general_loader.present();
    this.af.object('Users/').snapshotChanges().subscribe(action => {
      this.users$ = action.payload.val();
      this.users = []
      this.convertirUsuarios();
    });
    this.getEventos();
    //this.loadMap();
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
