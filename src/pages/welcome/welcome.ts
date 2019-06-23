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

declare var TimelineMax: any;
declare var TweenMax: any;
declare var Sine: any;
declare var Back: any;


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

  ionViewDidEnter() {
    var ts = new TimelineMax();
    ts.from(".logo", 2, { opacity: 0});
    ts.from(".main-t", 1, { opacity: 0, x: -20 });
    ts.from(".subtitle", 1, { opacity: 0, x: -20 });
    ts.from(".facebook", .8, { opacity: 0, x: -50 }, '-=0.3');
    ts.from(".b1", .8, { opacity: 0, x: -50 }, '-=0.3');
  }

  freindsAnimation(event: any) {
    var tf = new TimelineMax();
    tf.to(".main-t", .8, { opacity: 0, x: 20 });
    tf.to(".subtitle", .8, { opacity: 0, x: 20 }, '-=0.3');
    tf.to(".bti", .8, { opacity: 0, x: 50 }, '-=0.3');
    tf.to(".logo", .8, { opacity: 0});
    tf.to(".splash", .2, { display: "none", x: -800, opacity: 0 });
    tf.from(".b2", 4.5, { opacity: 0 });
    tf.from(".one", 2, { opacity: 0, x: -20, scaleX: 0, scaleY: 0, }, '-=4');
    tf.from(".two", 2, { opacity: 0, x: 80, scaleX: 0, scaleY: 0, }, '-=3.3');
    tf.from(".three", 2, { opacity: 0, y: 50, scaleX: 0, scaleY: 0, }, '-=3');
    tf.from(".four", 2, { opacity: 0, y: -40, scaleX: 0, scaleY: 0, }, '-=2.5');
    tf.from(".five", 2, { opacity: 0, y: 30, x: 30, scaleX: 0, scaleY: 0, }, '-=1.5');
    tf.from(".six", 2, { opacity: 0, y: 20, x: 30, scaleX: 0, scaleY: 0, }, '-=2.5');

    var tfl = new TimelineMax({ repeat: 2000000 });

    tfl.to(".float1", 3, { y: '-=5', ease: Sine.easeInOut });
    tfl.to(".float1", 3, { y: '+=5', ease: Sine.easeInOut });

    var tfl1 = new TimelineMax({ repeat: 2000000 });

    tfl1.to(".float2", 2, { x: '-=5', ease: Sine.easeInOut });
    tfl1.to(".float2", 2, { x: '+=5', ease: Sine.easeInOut });

    var tfl2 = new TimelineMax({ repeat: 2000000 });

    tfl2.to(".float3", 2.5, { y: '-=8', ease: Sine.easeInOut });
    tfl2.to(".float3", 2.5, { y: '+=8', ease: Sine.easeInOut });

  }

  addAnimation(event: any) {
    var ta = new TimelineMax();
    ta.to(".b2", 1.5, { opacity: 0 });
    ta.to(".one", 1.5, { opacity: 0, x: -20, scaleX: 0, scaleY: 0, }, '-=.1');
    ta.to(".two", 1.5, { opacity: 0, x: 80, scaleX: 0, scaleY: 0, }, '-=1.5');
    ta.to(".three", 1.5, { opacity: 0, y: 50, scaleX: 0, scaleY: 0, }, '-=1.5');
    ta.to(".four", 1.5, { opacity: 0, y: -40, scaleX: 0, scaleY: 0, }, '-=1.5');
    ta.to(".five", 1.5, { opacity: 0, y: 30, x: 30, scaleX: 0, scaleY: 0, }, '-=1.5');
    ta.to(".six", 1.5, { opacity: 0, y: 20, x: 30, scaleX: 0, scaleY: 0, }, '-=1.5');
    ta.to(".freinds", .2, { display: "none", x: -800, opacity: 0 });
    ta.from(".a1", 1, { opacity: 0, x: -20, delay:.8, });
    ta.from(".a2", .35, { opacity: 0, x: -20 });
    ta.from(".a3", .35, { opacity: 0, x: -20 }, '-=.10');
    ta.from(".a4", .35, { opacity: 0, x: -20 }, '-=.13');
    ta.from(".a5", .35, { opacity: 0, x: -20 }, '-=.13');
    ta.from(".a6", .35, { opacity: 0, x: -20 }, '-=.13');
    ta.from(".a7", .35, { opacity: 0, x: -20 }, '-=.13');
    ta.from(".a8", .35, { opacity: 0, x: -20 }, '-=.13');
    ta.from(".a9", .35, { opacity: 0, x: -20 }, '-=.13');
    ta.from(".a10", .35, { opacity: 0, x: -20 }, '-=.13');
    ta.from(".a11", .35, { opacity: 0, x: -20 }, '-=.13');
    ta.from(".a12", .35, { opacity: 0, x: -20 }, '-=.13');
    ta.from(".bt3", .8, { opacity: 0, y: 50 }, '-=3');
  }

  inviteAnimation(event: any) {
    var ti = new TimelineMax();
    ti.to(".add-freinds", 2, { display: "none", y: -400, opacity: 0 });
    ti.from(".i1", 1, { opacity: 0, x: -20,delay:.8, }, '-=2');
    ti.from(".i2", .35, { opacity: 0, x: -20 });
    ti.from(".i3", .35, { opacity: 0, x: -20 }, '-=.10');
    ti.from(".i4", .35, { opacity: 0, x: -20 }, '-=.13');
    ti.from(".i5", .35, { opacity: 0, x: -20 }, '-=.13');
    ti.from(".i6", .35, { opacity: 0, x: -20 }, '-=.13');
    ti.from(".i7", .35, { opacity: 0, x: -20 }, '-=.13');
    ti.from(".i8", .35, { opacity: 0, x: -20 }, '-=.13');
    ti.from(".i9", .35, { opacity: 0, x: -20 }, '-=.13');
    ti.from(".i10", .35, { opacity: 0, x: -20 }, '-=.13');
    ti.from(".i11", .35, { opacity: 0, x: -20 }, '-=.13');
    ti.from(".i12", .35, { opacity: 0, x: -20 }, '-=.13');
    ti.from(".bt4", .8, { opacity: 0, y: 50 }, '-=3');
  }

  likesAnimation(event: any) {
    var tl = new TimelineMax();
    tl.to(".invite-freinds", 2, { display: "none", y: -400, opacity: 0 });
    tl.from(".l1", 1, { opacity: 0, x: -20 });
    tl.from(".l0", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) });
    tl.from(".l3", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) }, '-=.15');
    tl.from(".l4", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) }, '-=.15');
    tl.from(".l5", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) }, '-=.15');
    tl.from(".l6", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) }, '-=.15');
    tl.from(".l7", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) }, '-=.15');
    tl.from(".l8", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) }, '-=.15');
    tl.from(".l9", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) }, '-=.15');
    tl.from(".l10", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) }, '-=.15');
    tl.from(".l11", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) }, '-=.15');
    tl.from(".l12", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) }, '-=.15');
    tl.from(".l13", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) }, '-=.15');
    tl.from(".l14", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) }, '-=.15');
    tl.from(".l15", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) }, '-=.15');
    tl.from(".l16", .35, { opacity: 0, y: 20, scale: 0, ease: Back.easeOut.config(1.7) }, '-=.15');
    tl.from(".bt1", .8, { opacity: 0, y: 50 }, '-=4');
  }



  doneAnimation(event: any) {
    var td = new TimelineMax();
    td.to(".l1", 1, { opacity: 0, x: 20 });
    td.to(".l0", 1.5, { opacity: 0, y: 20, scale: 0 });
    td.to(".l3", 1.5, { opacity: 0, y: 20, scale: 0 }, '-=1.5');
    td.to(".l4", 1.5, { opacity: 0, y: 20, scale: 0 }, '-=1.5');
    td.to(".l5", 1.5, { opacity: 0, y: 20, scale: 0 }, '-=1.5');
    td.to(".l6", 1.5, { opacity: 0, y: 20, scale: 0 }, '-=1.5');
    td.to(".l7", 1.5, { opacity: 0, y: 20, scale: 0 }, '-=1.5');
    td.to(".l8", 1.5, { opacity: 0, y: 20, scale: 0 }, '-=1.5');
    td.to(".l9", 1.5, { opacity: 0, y: 20, scale: 0 }, '-=1.5');
    td.to(".l10", 1.5, { opacity: 0, y: 20, scale: 0 }, '-=1.5');
    td.to(".l11", 1.5, { opacity: 0, y: 20, scale: 0 }, '-=1.5');
    td.to(".l12", 1.5, { opacity: 0, y: 20, scale: 0 }, '-=1.5');
    td.to(".l13", 1.5, { opacity: 0, y: 20, scale: 0 }, '-=1.5');
    td.to(".l14", 1.5, { opacity: 0, y: 20, scale: 0 }, '-=1.5');
    td.to(".l15", 1.5, { opacity: 0, y: 20, scale: 0 }, '-=1.5');
    td.to(".l16", 1.5, { opacity: 0, y: 20, scale: 0 }, '-=1.5');
    td.to(".bt1", .8, { opacity: 0, y: 50 }, '-=.15');
    td.to(".likes", .2, { display: "none", x: -800, opacity: 0 });
    td.from(".done", 1.5, { opacity: 0,});
    td.from(".ya", .8, { opacity: 0,});
    td.from(".exp", .8, { opacity: 0,},'-=.5');
    td.from(".bt5", .8, { opacity: 0, y: 50 }, '-=.16');
  }

}
