import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, LoadingController, AlertController, ActionSheetController, ModalController } from 'ionic-angular';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';


/**
 * Generated class for the GaleriaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-galeria',
  templateUrl: 'galeria.html',
})
export class GaleriaPage {

  public evento: any = [];
  public general_loader: any = '';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public af: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public appCtrl: App,
    public afAuth: AngularFireAuth,
    public actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    public socialSharing: SocialSharing,
    public camera: Camera,
    public sanitizer: DomSanitizer) {
    this.evento = this.navParams.get('evento');
  }

  presentOptions() {
 let actionSheet = this.actionSheetCtrl.create({
   title: '¿Que deseas hacer?',
   buttons: [
     {
       text: 'Tomar una foto',
       handler: () => {
         this.tomarFoto();
       }
     },{
       text: 'Subir una foto',
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


tomarFoto(){
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
   let vm = this;

   this.camera.getPicture(options).then(result => {
     this.general_loader.present();
     const image = `data:image/jpeg;base64,${result}`;

     const pictures = firebase.storage().ref('/Users/');
     pictures.child('pictures').child(this.generateUUID()).putString(image, 'data_url').then(kk=>{
       kk.ref.getDownloadURL().then(url => {
         vm.evento.pictures.push({'url': url});
       })
     });
   });
}
escogerFoto(){
this.general_loader = this.loadingCtrl.create({
  spinner: 'bubbles',
  content: 'Subiendo F∫oto...'
 });

  const options: CameraOptions={
   quality: 50,
   sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
   destinationType: this.camera.DestinationType.DATA_URL,
   encodingType: this.camera.EncodingType.JPEG,
   correctOrientation: true
  }
  let vm = this;

  this.camera.getPicture(options).then(result => {
    this.general_loader.present();
    const image = `data:image/jpeg;base64,${result}`;

    const pictures = firebase.storage().ref('/Users/');
    pictures.child('pictures').child(this.generateUUID()).putString(image, 'data_url').then(kk=>{
      kk.ref.getDownloadURL().then(url => {
        vm.evento.pictures.push({'url': url});
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

  getPictures(){
    let p = this.evento.pictures;
    let aux = [];
    for(let key in p){
      aux.push({
        'url': p[key].url
      });
    }
    return aux;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GaleriaPage');
  }

}
