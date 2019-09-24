import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, LoadingController, AlertController, ActionSheetController, ModalController } from 'ionic-angular';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { WelcomePage } from '../welcome/welcome';
import { LikesPage } from '../likes/likes';
import { PrivacyPage } from '../privacy/privacy';
import { CarteraPage } from '../cartera/cartera';
import { WalletPage } from '../wallet/wallet';

/**
 * Generated class for the EditprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editprofile',
  templateUrl: 'editprofile.html',
})
export class EditprofilePage {

public general_loader: any;
public user: any = [];

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
      this.user = this.navParams.get('user');
      console.log(this.user);
  }

  openLikes(){
    this.navCtrl.push(LikesPage);
  }

  openPrivacy(){
    this.navCtrl.push(PrivacyPage);
  }

  openCartera(){
    this.navCtrl.push(WalletPage);
  }

  logOut(){
    this.afAuth.auth.signOut();
    this.appCtrl.getRootNav().setRoot(WelcomePage);
  }

  modifyUser(){
    this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Actualizando...'
    });
    this.general_loader.present();

    this.af.list('Users').update(firebase.auth().currentUser.uid, this.user)
        .then(() => {
          this.general_loader.dismiss();
          this.alertCtrl.create({title: '¡Información actualizada!', buttons: ['Ok']}).present();
          this.navCtrl.pop();

        })
  }

  presentOptions() {
 let actionSheet = this.actionSheetCtrl.create({
   title: 'Escoge una opción para tu foto de perfil',
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
         vm.user.picture.data.url = url;
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
        vm.user.picture.data.url = url;
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditprofilePage');
  }

}
