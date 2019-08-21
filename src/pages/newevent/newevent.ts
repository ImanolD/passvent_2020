import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ActionSheetController, ModalController } from 'ionic-angular';
import { FiltersPage } from '../filters/filters';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { LocatePage } from '../locate/locate';
import * as moment from 'moment';
declare var google;

/**
 * Generated class for the NeweventPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-newevent',
  templateUrl: 'newevent.html',
})
export class NeweventPage {
 public general_loader: any;
 public type: any;
 public current_index: any = 1;
 public event_data: any = {
   'title': '',
   'start_day': '',
   'start_time': '',
   'end_day': '',
   'end_time': '',
   'location': '',
   'private': false,
   'limit': '',
   'gallery': false,
   'gallery_all': false,
   'cuesta': false,
   'externa': false,
   'media': [],
   'creator': '',
   'attendants': [],
   'tickets': [],
   'img': 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
 }
 public isClan: any = false;
 public GoogleAutocomplete: any = new google.maps.places.AutocompleteService();
 public autocompleteItems: any = [];

 public foto: any = '';

 public limite: any = false;
 public externa: any = false;
 public cuesta: any = false;

 public boletos: any = [
   {
     'name': '',
     'cost': '',
     'description': ''
   },
 ];


  constructor( public navCtrl: NavController,
    public navParams: NavParams,
    public af: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
    public camera: Camera,
    public sanitizer: DomSanitizer,
    public modalCtrl: ModalController) {
     this.type = localStorage.getItem('Tipo');
     if(this.navParams.get('Clan')) this.isClan = true;
  }

  sanitizeThis(image){
    return this.sanitizer.bypassSecurityTrustStyle('url('+image+')');
  }

  addBoleto(){
    this.boletos.push({
      'name': '',
      'cost': '',
      'description': ''
    });
  }

  selectSearchResult(item){
    this.event_data.location = item.description;
    this.autocompleteItems = [];
    this.seeCorrect();
  }

  updateSearchResults(){
  if (this.event_data.location == '') {
    this.autocompleteItems = [];
    return;
  }
  this.GoogleAutocomplete.getPlacePredictions({ input: this.event_data.location },
	(predictions, status) => {
    this.autocompleteItems = [];
      predictions.forEach((prediction) => {
        this.autocompleteItems.push(prediction);
      });
  });
  console.log(this.autocompleteItems);
}

  changeType(tipo){
    this.event_data.type = tipo;
  }

  seeCorrect(){
    if(this.event_data.location != ''){
      let modal = this.modalCtrl.create(LocatePage, {'Address': this.event_data.location});
          modal.onDidDismiss( data => {
            if(data && !data.correct) this.event_data.location = '';
          });
       modal.present();
    }
  }

  getType(tipo){
    return (this.event_data.type == tipo ? 'type-element selected' : 'type-element');
  }

  openFilters(){
    this.navCtrl.push(FiltersPage);
  }

  verifyMini(){
    if(parseInt(this.event_data.spaces_available)<2){
      this.alertCtrl.create({
        title: 'We need more spaces available',
        message: 'In order to create this event, you need at least 2 spaces avaible in this event',
        buttons: ['Ok']
      }).present();
    }
  }

  canAdvance(){
    return this.event_data.title != '' && this.event_data.day != '' && this.event_data.time != '' && this.event_data.location != '' && this.event_data.img != '' && this.event_data.about_event != '' && this.event_data.provided != '' && this.event_data.about_organizer != '' && this.event_data.spaces_available != '' && this.event_data.cost != '';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NeweventPage');
  }

  createEvent(){
    this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Creating...'
    });
    this.general_loader.present();

    let indice = this.generateUUID();
    this.event_data.creator = firebase.auth().currentUser.uid;
    this.event_data.index = indice;

    this.event_data.attendants.push({
      'index': this.event_data.creator,
      'isOwner': true,
      'status': 'Accepted'
    });

    this.af.list('Users/'+firebase.auth().currentUser.uid+'/schedule').push({
      'activity_id': indice,
      'date': this.event_data.day,
      'day': moment(this.event_data.day).format('dddd'),
      'time': this.event_data.time
    });
    this.af.list('Users/'+firebase.auth().currentUser.uid+'/Events').update(indice, {
      'index': indice,
      'isOwner': true
    });
    this.af.list('Events').update(indice, this.event_data)
        .then(() => {
          this.general_loader.dismiss();
          this.alertCtrl.create({
            title: 'Event Created',
            message: 'Your event was created succesfully',
            buttons: ['Ok']
          }).present();
          this.navCtrl.pop();
        })
  }

  cEvent(){
    this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Creando evento...'
    });
    this.general_loader.present();

    let indice = this.generateUUID();
    this.event_data.creator = firebase.auth().currentUser.uid;
    this.event_data.index = indice;
    this.event_data.attendants.push({
      'index': this.event_data.creator,
      'isOwner': true
    });

    this.af.list('Users/'+firebase.auth().currentUser.uid+'/schedule').push({
      'activity_id': indice,
      'date': this.event_data.start_day,
      'day': moment(this.event_data.day).format('dddd'),
      'time': this.event_data.start_time

    });

    this.af.list('Users/'+firebase.auth().currentUser.uid+'/Events').update(indice, {
      'index': indice,
      'isOwner': true
    });

    this.boletos = this.boletos.filter(b => b.name != '' && b.cost != '' && b.description != '');
    if(this.boletos.length > 0) this.event_data.tickets = this.boletos;

    this.af.list('Events').update(indice, this.event_data)
        .then(() => {
          this.general_loader.dismiss();
          this.alertCtrl.create({
            title: 'Evento Creado',
            message: 'Tu evento fue creado exitosamente',
            buttons: ['Ok']
          }).present();
          this.navCtrl.pop();
        });
  }

  presentOptions() {
     let actionSheet = this.actionSheetCtrl.create({
       title: '¿Que te gustaría hacer?',
       buttons: [
         {
           text: 'Tomar una foto',
           handler: () => {
             this.tomarFoto();
           }
         },{
           text: 'Escoger una foto',
           handler: () => {
             this.escogerFoto();
           }
         },{
           text: 'Cancelar',
           role: 'cancel',
           handler: () => {
             console.log('Cancel clicked');
           }
         }
       ]
     });
     actionSheet.present();

   }

   avisarNoms(){
     console.log('hi');
     if(this.event_data.cost){
       this.alertCtrl.create({
         title: 'Cost in NOMS',
         subTitle: 'Making the conversion',
         message: 'The cost in noms is: '+(this.event_data.cost/20)+' noms since 1 NOM = $20 MXN',
         buttons: [
          {
          text: 'Ok',
          handler: () =>{
            this.event_data.cost = this.event_data.cost / 20;
          }
          }
           ]
       }).present();
     }
   }


  tomarFoto(){
    let vm = this;
       this.general_loader = this.loadingCtrl.create({
         spinner: 'bubbles',
         content: 'Subiendo Foto...'
        });
       const options: CameraOptions={
        quality: 50,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        correctOrientation: true
       }

       this.camera.getPicture(options).then(result => {
         this.general_loader.present();
         const image = `data:image/jpeg;base64,${result}`;

         const pictures = firebase.storage().ref('/Events/');
         pictures.child('pictures').child(this.generateUUID()).putString(image, 'data_url').then(kk=>{
           kk.ref.getDownloadURL().then(url => {
             vm.general_loader.dismiss();
             if(vm.current_index == 1)  vm.event_data.img = url;
             else vm.event_data.media.push({'url': url});
             vm.foto = url;
           })
         });
       });
   }
  escogerFoto(){
    let vm = this;
    this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Subiendo Foto...'
     });

      const options: CameraOptions={
       quality: 50,
       sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
       destinationType: this.camera.DestinationType.DATA_URL,
       encodingType: this.camera.EncodingType.JPEG,
       correctOrientation: true
      }

      this.camera.getPicture(options).then(result => {
        this.general_loader.present();
        const image = `data:image/jpeg;base64,${result}`;

        const pictures = firebase.storage().ref('/Events/');
        pictures.child('pictures').child(this.generateUUID()).putString(image, 'data_url').then(kk=>{
          kk.ref.getDownloadURL().then(url => {
            vm.general_loader.dismiss();
            if(vm.current_index == 1)  vm.event_data.img = url;
            else vm.event_data.media.push({'url': url});
            //this.fotos[this.fotos.length] = url;
            vm.foto = url;
          })
        });
      });}

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
