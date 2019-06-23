import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Platform } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { RegisterPage } from '../register/register';
import { CirclesPage } from '../circles/circles';
import { TabsPage } from '../tabs/tabs';
import { WalkPage } from '../walk/walk';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { Facebook } from '@ionic-native/facebook';

/**
 * Generated class for the WelcomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
  providers: [AngularFireAuth, Facebook]
})
export class WelcomePage {
public general_loader: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public af: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public fb: Facebook,
    public platform: Platform) {
     this.af.list('/motivation').update("Heart", {"Text": 'All men are created equal, some work harder in the preseason'});

     this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Loading..'
    });
    this.general_loader.present();

    //this.afAuth.auth.signOut();

    this.afAuth.authState.subscribe(user => {
      if(user){
        this.general_loader.dismiss();
        this.afAuth.auth.signOut();
            // this.general_loader.dismiss();
            // let indice = firebase.auth().currentUser.uid;
            // let reference =  firebase.database().ref('Users').orderByChild('index').equalTo(indice);
            // reference.once('value', snapshot => {
            // let aux = snapshot.val()[indice];
            //
            //   console.log(aux.user_type);
            //   localStorage.setItem('Tipo', aux.user_type);
            //   if(!aux.info_complete){
            //     this.navCtrl.push(CirclesPage, {'Color': 'green', 'User': aux.user_type});
            //   }
            //   else{
            //     this.navCtrl.setRoot(TabsPage);
            //   }
            //   });

      }
      else{
        this.general_loader.dismiss();
      }
     });
  }

  doFacebook(){
    this.general_loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Iniciando...'
    });
    this.general_loader.present();

    if(this.platform.is('cordova')){
      this.loginWithFacebook()
         .then( response => {
           const facebookCredential = firebase.auth.FacebookAuthProvider
            .credential(response.authResponse.accessToken);

            this.afAuth.auth.signInWithCredential(facebookCredential)
              .then( res => {
                // this.indice = firebase.auth().currentUser.uid;
                // this.af.object('/Usuarios/'+this.indice).snapshotChanges().subscribe(action => {
                //   if(!action.payload.val()){
                //     this.fb.api('me?fields=id,name,email,first_name,picture.width(720).height(720).as(picture_large)', []).then(profile => {
                //         this.userData = {email: profile['email'], first_name: profile['first_name'], picture: profile['picture_large']['data']['url'], username: profile['name']};
                //         this.showPrompt();
                //     });
                //   }
                //   else{
                //     this.general_loader.dismiss();
                //     this.navCtrl.setRoot(TabsPage);
                //   }
                //  });
                // console.log('Exito');
              });
         }).catch((error) => {  console.log(error); });
    }
    else{
      return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider()).then((res)=>{
       console.log(res);
      this.general_loader.dismiss();
       let user = res.additionalUserInfo.profile;

       // this.submitUser(res.additionalUserInfo.profile);
       //let fecha = new Date();
       //this.getUserDetail(res.additionalUserInfo.profile.id);
     }).catch(error => {
      console.log(error);
});
    }
  }

  getUserDetail(userid) {
  this.fb.api("/"+userid+"/?fields=id,email,name,picture,gender",["public_profile"])
    .then(profile => {
      console.log(profile);
      // this.userData = {email: profile['email'], first_name: profile['first_name'], picture: profile['picture_large']['data']['url'], username: profile['name']}
      // let alert = this.alertCtrl.create({
      //   title: this.userData.email
      // });
      // alert.present();
      // console.log(res);
      //this.users = res;
    })
    .catch(e => {
      console.log(e);
    });
}



  loginWithFacebook():Promise<any> {
      return this.fb.login(['email', 'public_profile', 'user_friends']);
   }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WelcomePage');
  }

  openLogin(){
    this.navCtrl.push(LoginPage, {'User': 'nomads'});
  }

  openRegister(){
    this.navCtrl.push(RegisterPage, {'User': 'nomads'});
  }

  openCircles(){
    this.navCtrl.push(CirclesPage, {'Color': 'purple'});
  }

}
