import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { BrowsePage } from '../browse/browse';
import { FiltersPage } from '../filters/filters';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { ActivityPage } from '../activity/activity';
import { EventPage } from '../event/event';
import { DomSanitizer } from '@angular/platform-browser';
import { Stripe } from '@ionic-native/stripe';
import * as moment from 'moment';
import { WalletPage } from '../wallet/wallet';
import { NeweventPage } from '../newevent/newevent';
import { FilteredPage } from '../filtered/filtered';
declare var google;
import { Geolocation } from '@ionic-native/geolocation';
import { MyeventsPage } from '../myevents/myevents';
import { AllPage } from '../all/all';
import { EventoPage } from '../evento/evento';
import { ChatsPage } from '../chats/chats';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public response$: any;
  public activities: any = [];
  public favorites: any;
  public general_loader: any;
  public users$: any;
  public noms_balance: any = '';
  public e_response$: any;
  public events: any = [];
  public favoritos: any = [];

  public user_preferences: any = [];

  public filtered_a: any = [];
  public posicion: any = '';

  public done_e: any = false;
  public done_a: any = false;

  public location_loader: any;
  public eventos: any = [];

  constructor(public navCtrl: NavController,
  public navParams: NavParams,
  public af: AngularFireDatabase,
  public loadingCtrl: LoadingController,
  public alertCtrl: AlertController,
  public sanitizer: DomSanitizer,
  public stripe: Stripe,
  public geolocation: Geolocation ) {

    let l = 4;
    let u = 19;
    let m = 2;
    let r = (500000*l)+(750000*u)+(1000000*m);
    console.log(r);
  }


  openFiltered(tipo){
    this.navCtrl.push(FilteredPage, {'Tipo': tipo});
  }

  openAll(tipo){
    if(tipo == 'Best Rated Activities') this.navCtrl.push(AllPage, {'Tipo': tipo, 'Acts': this.getRated()});
    else if(tipo == 'Nearby and Upcoming') this.navCtrl.push(AllPage, {'Tipo': tipo, 'Acts': this.getUpcoming()});
    else if(tipo == 'Suggestions for you') this.navCtrl.push(AllPage, {'Tipo': tipo, 'Acts': this.filtered_a});
    else if(tipo == 'Your Favorites') this.navCtrl.push(AllPage, {'Tipo': tipo, 'Acts': this.favoritos});
    else if(tipo == 'Events') this.navCtrl.push(AllPage, {'Tipo': tipo, 'Acts': this.events});
    else if(tipo == 'Experiences') this.navCtrl.push(AllPage, {'Tipo': tipo, 'Acts': this.getExperiences()});
    else if(tipo == 'Special Offers') this.navCtrl.push(AllPage, {'Tipo': tipo, 'Acts': this.getSpecial()});
  }

  openChats(){
    this.navCtrl.push(ChatsPage);
  }

  getFavorites(){
    let a = this.favorites;
    this.favoritos = [];
    for(let key in a){
      // this.favoritos.push({
      //   'title': 'hi',
      //   'title_complete': 'hi',
      //   'location': 'hi',
      //   'description':  'hi',
      //   'cancelation_policy': 'hi',
      //   'class_price':  'hi',
      //   'fee': 'hi',
      //   'categories':  'hi',
      //   'schedule':  'hi',
      //   'media':  'hi',
      //   'img': 'hi',
      // });
      //console.log(this.activities.filter( act => act.index == a[key].index));
      console.log(a[key]);
      if(a[key].type == 'activity') this.favoritos[this.favoritos.length] = this.activities.filter( act => act.index == a[key].index)[0];
      else this.favoritos[this.favoritos.length] =  this.events.filter( act => act.index == a[key].index)[0];
    }

    console.log(this.favoritos);
    this.getFiltersP();
    // return this.favoritos;
  }

  getExperiences(){
    return this.activities.filter(act => act.categories.main_category == 'Experiences');
  }

  getFiltersP(){
    this.af.object('Users/'+firebase.auth().currentUser.uid+'/preferences').snapshotChanges().subscribe(action => {
      this.user_preferences = action.payload.val();
      console.log(this.user_preferences);
      this.applyFilters();
    });
  }

  seeDetails(a){
    if(a.isEvent){
      this.navCtrl.push(EventPage, {'Event': a});
    }
    else{
      this.navCtrl.push(ActivityPage, {'Activity': a});
    }
  }

  verifyRaro(cosa){
    console.log(cosa);
  }

  openEvento(evento){
    this.navCtrl.push(EventoPage, {'Evento': evento});
  }


  openNew(){
    this.navCtrl.push(NeweventPage);
  }


  sanitizeThis(image){
    return this.sanitizer.bypassSecurityTrustStyle('url('+image+')');
  }

  coordenadas(a, address, tit, fn){
    let geocoder = new google.maps.Geocoder();
    let vm = this;
    geocoder.geocode( { 'address' : address}, function( results, status ) {
       if( status == google.maps.GeocoderStatus.OK ) {
         console.log(results);
         fn(results[0].formatted_address);
       } else {
          this.af.list('AppErrors/').push({'type': 'Geocode', 'error': status});
          // alert( 'Geocode was not successful for the following reason: ' + status );
       }
   });
  }

  getDistance(address, fn){
    let geocoder = new google.maps.Geocoder();
    let vm = this;
    let distance = new google.maps.DistanceMatrixService();
    let result = 0;
    let result2 = '';

    return distance.getDistanceMatrix({
         origins: [this.posicion],
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

  convertEvents(){
    let a = this.e_response$;
    for(let key in a){
      this.events.push({
        'title': (a[key].title.length > 100 ? a[key].title.substring(0, 15) + '..' : a[key].title),
        'title_complete': a[key].title,
        'location': a[key].location,
        'difficulty':  a[key].difficulty,
        'img':  a[key].img,
        'about_event':  a[key].about_event,
        'provided':  a[key].provided,
        'about_organizer':  a[key].about_organizer,
        'spaces_available':  a[key].spaces_available,
        'cost':  a[key].cost,
        'type':  a[key].type,
        'day': a[key].day,
        'distance': '',
        'distance_number': 0,
        'time': a[key].time,
        'creator':  a[key].creator,
        'index':  a[key].index,
        'media': a[key].media,
        'nomads': (a[key].nomads ? a[key].nomads : []),
        'isEvent': true,
        'review':( a[key].review ? a[key].review : 5),
        'reviews': (a[key].reviews ? a[key].reviews : []),
        'special': (a[key].special ? a[key].special : false)
      });
    }

    let today  = moment();
    this.events = this.events.filter( event => !moment(event.day).isBefore(today));
    console.log(this.events.length);

    if(!this.done_e){
    this.done_e = true;
    let vm = this;
    for(let i=0; i < this.events.length; i++){

    this.coordenadas(this.events[i], this.events[i].location, this.events[i].title_complete,  function(location){
        vm.events[i].location = location;
        let om = vm;
        vm.getDistance(location, function(distance, text){
          console.log(distance+' km');
          vm.events[i].distance = text;
          vm.events[i].distance_number = distance;
        });
    });
  }
   // this.location_loader.dismiss();
   // this.location_loader = null;
    }

    if(this.general_loader) this.general_loader.dismiss();
    this.getFavorites();
  }

  checkIncluded(status, list){
    if(status){
      return this.isIncluded(list);
    }
    return true;
  }

  isIncluded(list){
    for(let key in list){
      if(list[key].index == firebase.auth().currentUser.uid) return true;
    }
    return false;
  }

  convertActivities(){
    let a = this.response$;
    this.location_loader = this.loadingCtrl.create({
     spinner: 'bubbles',
     content: 'Calculating distances...'
   });
   //this.location_loader.present();
    for(let key in a){
      this.activities.push({
        'title': (a[key].title.length > 50 ? a[key].title.substring(0, 20) + '..' : a[key].title),
        'title_complete': a[key].title,
        'location': a[key].location,
        'description':  a[key].description,
        'useful_notes': (a[key].useful_notes ? a[key].useful_notes : ''),
        'cancelation_policy':  a[key].cancelation_policy,
        'class_price':  a[key].class_price,
        'fee':  a[key].fee,
        'categories':  a[key].categories,
        'schedule':  a[key].schedule,
        'media':  a[key].media,
        'nomads': (a[key].nomads ? a[key].nomads : []),
        'img':  a[key].img,
        'creator':  a[key].creator,
        'index':  a[key].index,
        'isEvent': false,
        'review':( a[key].review ? a[key].review : 5),
        'reviews': (a[key].reviews ? a[key].reviews : []),
        'special': (a[key].special ? a[key].special : false),
        'distance': '',
        'distance_number': 0,
        'next_time': '',
        'next_remaining': 0
      });
    }

    for(let i=0; i<this.activities.length; i++){
      let h = this.activities[i].schedule;
      let today =  moment().format('dddd');
      let next = 'not today';
      let hours_left = 1000;
      let aux = new Date();
      let remaining;
      let remaining_n;

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
           }
         }

       }
      }

      // if(next != 'not today'){
      //   console.log('Para la actividad '+this.activities[i].title+' hoy, el horario más cercano es '+next);
      // }
      if(next != 'not today'){
        let aux2 = new Date();
        aux2.setHours(parseInt(next.charAt(0) + next.charAt(1)));
        aux2.setMinutes(parseInt(next.charAt(3) + next.charAt(4)));
        next = moment(aux2).format('LT');
      }


      this.activities[i].next_time = next;
      this.activities[i].next_remaining = hours_left;
    }


   if(!this.done_a){
     this.done_a = true;
     let vm = this;
     for(let i=0; i < this.activities.length; i++){

     this.coordenadas(this.activities[i], this.activities[i].location, this.activities[i].title_complete,  function(location){
         vm.activities[i].location = location;
         let om = vm;
         vm.getDistance(location, function(distance, text){
           console.log(distance+' km');
           vm.activities[i].distance = text;
           vm.activities[i].distance_number = distance;
         });
     });
     }
   }

   console.log(this.activities);

   // this.activities = this.activities.sort(function(a, b){
   //  var keyA = a.distance_number,
   //      keyB = b.distance_number;
   //  // Compare the 2 dates
   //  if(keyA < keyB) return -1;
   //  if(keyA > keyB) return 1;
   //  return 0;
   // });
  }


  getClosest(){
    return this.activities.sort(function(a, b){
     var keyA = a.distance_number,
         keyB = b.distance_number;
     // Compare the 2 dates
     if(keyA < keyB) return -1;
     if(keyA > keyB) return 1;
     return 0;
    });
  }

  getUpcoming(){
    let aux = this.activities.filter(act => act.next_time != 'not today');
    return aux.sort(function(a, b){
     var keyA = a.next_remaining,
         keyB = b.next_remaining;
     // Compare the 2 dates
     if(keyA < keyB) return -1;
     if(keyA > keyB) return 1;
     return 0;
    });
  }

  getRated(){
   let aux = [];
   aux = this.activities.sort(function(a, b){
    var keyA = a.review,
        keyB = b.review;
    // Compare the 2 dates
    if(keyA > keyB) return -1;
    if(keyA < keyB) return 1;
    return 0;
   });
   aux = this.getClosest();
   //console.log(aux);
   return aux;
  }

  getSpecial(){
    return this.activities.filter(act => act.special);
  }

  openActivity(actividad){
    this.navCtrl.push(ActivityPage, {'Activity': actividad});
  }

  testWallet(){
   this.navCtrl.parent.select(4);
   setTimeout(() => {this.navCtrl.parent.getSelected().push(WalletPage)}, 500);
  }

  openEvent(event){
    this.navCtrl.push(EventPage, {'Event': event});
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

    let e = this.eventos;
    for(let key in e){
      for(let lla in e[key].attendants){
        if(this.isAmigo(e[key].attendants[lla].index)) e[key].attendants[lla].isFriend = true;
        else e[key].attendants[lla].isFriend = false;
      }
    }

    let today  = moment();
    this.eventos = this.eventos.filter( event => !moment(event.start_day).isBefore(today));
    //this.activities = this.activities.filter( a => a.creator == firebase.auth().currentUser.uid);
    this.general_loader.dismiss();
    console.log(this.eventos);
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

  cuantosAmigos(conteo){
    return conteo.filter(c=>c.isFriend).length;
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

  existsF(arre, cual){
    for(let key in arre){
      if(arre[key].name == cual) return true;
    }
    return false;
  }

  createEvent(){
    this.navCtrl.parent.select(4)
        .then(()=> this.navCtrl.parent.getSelected().push(MyeventsPage));
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
    let a = this.activities;

    if(cats.length > 0){
      for(let i=0; i<a.length; i++){
        if(this.existsF(cats, a[i].categories.main_category)){
          aux.push(a[i]);
        }
      }
    }

    if(types.length > 0){
      for(let i=0; i<a.length; i++){
        if(this.existsO(types, a[i].categories.activity_type)){
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
  }

  ionViewWillEnter(){
    // if(this.activities != []){
    //   this.getFavorites();
    // }
    //
    //
    // this.geolocation.getCurrentPosition().then((position) => {
    //
    //   this.posicion = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    //
    // }, (err) => {
    //   console.log(err);
    // });
  }

  getMensaje(creador, admins){
    let total = admins-1;
    let m = creador.split(' ');
    return m[0]+' y '+total+' más';
  }

  ionViewDidLoad() {
    this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando...'
    });
    //this.general_loader.present();
    this.af.object('Users').snapshotChanges().subscribe(action => {
      this.users$ = action.payload.val();
    });
    this.getActivities();
  }

  openBrowse(segmento){
    this.navCtrl.push(BrowsePage, {'segment': segmento});
  }

  openFilters(){
    this.navCtrl.push(FiltersPage);
  }

}
