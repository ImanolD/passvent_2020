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

public response$: any;
public responsep$: any;
public responsem$: any;

public preferences: any = [
    {
      'circle': 'circle l0',
      'img': '/assets/likes-icons/martini.svg',
      'p': 'grey l0',
      'name': 'Nightlife',
      'selected': false
    },
    {
      'circle': 'circle l3',
      'img': '/assets/likes-icons/outdoor.svg',
      'p': 'grey l3',
      'name': 'Aire Libre',
      'selected': false
    },
    {
      'circle': 'circle l4',
      'img': '/assets/likes-icons/spotlights.svg',
      'p': 'grey l4',
      'name': 'Conciertos',
      'selected': false
    },
    {
      'circle': 'circle l5',
      'img': '/assets/likes-icons/trophy.svg',
      'p': 'grey l5',
      'name': 'Deporte',
      'selected': false
    },
    {
      'circle': 'circle l6',
      'img': '/assets/likes-icons/confetti.svg',
      'p': 'grey l6',
      'name': 'Fiesta',
      'selected': false
    },
    {
      'circle': 'circle l7',
      'img': '/assets/likes-icons/fork.svg',
      'p': 'grey l7',
      'name': 'Comida',
      'selected': false
    },
    {
      'circle': 'circle l8',
      'img': '/assets/likes-icons/pawprint.svg',
      'p': 'grey l8',
      'name': 'Animales',
      'selected': false
    },
    {
      'circle': 'circle l9',
      'img': '/assets/likes-icons/gift.svg',
      'p': 'grey l9',
      'name': 'Cumpleaños',
      'selected': false
    },
    {
      'circle': 'circle l10',
      'img': '/assets/likes-icons/art.svg',
      'p': 'grey l10',
      'name': 'Arte y Cultura',
      'selected': false
    },
    {
      'circle': 'circle l11',
      'img': '/assets/likes-icons/shopping-bag.svg',
      'p': 'grey l11',
      'name': 'Compras',
      'selected': false
    },
    {
      'circle': 'circle l12',
      'img': '/assets/likes-icons/idea.svg',
      'p': 'grey l12',
      'name': 'Tecnología',
      'selected': false
    },
    {
      'circle': 'circle l13',
      'img': '/assets/likes-icons/education.svg',
      'p': 'grey l13',
      'name': 'Educación',
      'selected': false
    },
    {
      'circle': 'circle l14',
      'img': '/assets/likes-icons/movie.svg',
      'p': 'grey l14',
      'name': 'Cine',
      'selected': false
    },
    {
      'circle': 'circle l15',
      'img': '/assets/likes-icons/beer.svg',
      'p': 'grey l15',
      'name': 'Bebida',
      'selected': false
    },
    {
      'circle': 'circle l16',
      'img': '/assets/likes-icons/swimming-pool.svg',
      'p': 'grey l16',
      'name': 'Agua',
      'selected': false
    }
];
public users: any = [];
public search: any = '';
public likes: any = [];

public doing: any = 'facebook';

public mail: any = '';
public pw: any = '';
public pw_confirm: any = '';

public first_name: any = '';
public last_name: any = '';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public af: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public fb: Facebook,
    public platform: Platform) {


     this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Loading..'
    });
    this.general_loader.present();

    //this.afAuth.auth.signOut();

    this.afAuth.authState.subscribe(user => {
      if(user){
        this.general_loader.dismiss();
        this.navCtrl.setRoot(TabsPage);
            //this.general_loader.dismiss();
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

  openLogin(){
    this.navCtrl.push(LoginPage);
  }

  getClass(sele){
    return sele ? 'option-like selected' : 'option-like';
  }

  goTabs(){
    this.navCtrl.push(TabsPage);
  }

  //Agregar amigos
  confirmAdd(user, indice){
    this.alertCtrl.create({
      title: '¿Deseas agrgar a '+user.name+' a tus amigos?',
      message: 'Recibirá una solicitud para agregarte a sus amigos',
      buttons: [
        {
          text: 'Cancelar',
          handler: () =>{

          }
        },
        {
          text: 'Enviar Solicitud',
          handler: () =>{
            this.af.list('Users/'+firebase.auth().currentUser.uid+'/friends').update(user.index, {'index': user.index, 'status': 'requested'});
            this.sendRequest(user);
          }
        },
      ]
    }).present();
  }
  sendRequest(user){
    let index = this.generateUUID();

    //Enviar el request al amigo
    this.af.list('Users/'+user.index).update('requests', {
      'type': 'friend_request',
      'index': index,
      'friend': firebase.auth().currentUser.uid,
      'event': false
    });

    //Notificacion para el usuario y push notification
    this.af.list('Users/'+user.index+'/notifications').update(index, {
      'title': '¡Nueva solicitud de amistad!',
      'subtitle': 'Tienes una nueva solicitud de amistad en passvent',
      'index': index
    });
    this.af.list('Notifications').update(index, {
      'title': '¡Nueva solicitud de amistad!',
      'subtitle': 'Tienes una nueva solicitud de amistad en passvent',
      'index': user.index
    })
        .then(()=>{
          this.alertCtrl.create({
            title: '¡Solicitud enviada!',
            message: 'Tu solicitud ha sido enviada',
            buttons: ['Ok']
          }).present();
        })
  }


  //Getting users info and searchbar

  getUsers(){
    this.af.object('Users/'+firebase.auth().currentUser.uid).snapshotChanges().subscribe(action => {
      this.responsem$ = action.payload.val();
    });
    this.af.object('Users').snapshotChanges().subscribe(action => {
      this.response$ = action.payload.val();
      this.users = [];
      this.convertUsers();
    });
  }
  convertUsers(){
    let u = this.response$;
    for(let key in u){
        this.users.push({
          'email': u[key].email,
          'first_name': u[key].first_name,
          'id': u[key].id,
          'name': u[key].name,
          'index': key,
          'picture': (u[key].picture ? u[key].picture.data : u[key].picture_large),
          'isFriend': ( key == firebase.auth().currentUser.uid ),
          'added': this.isMine(key)
        });
    }
    console.log(this.users);
  }

  isMine(indice){
    let a = this.responsem$.friends;
    if(a){
      for(let key in a){
        if(a[key].index == indice) return true;
      }
    }
    return false;
  }

  searchUsers(){
    return this.users.filter( u =>  (this.search == '' || u.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1))
  }



  //Login con email usando FIREBASE
  loginMail(){
  let vm = this;
    if(this.mail != '' && this.pw != ''){
      if(this.mail.indexOf('@')!=-1){
        this.general_loader = this.loadingCtrl.create({
          spinner: 'bubbles',
          content: 'Iniciando Sesión...'
        });
        this.general_loader.present();

        let credentials = {
          email: this.mail,
          password: this.pw
        };


        this.signInWithEmail(credentials).then(() => this.doNext(), error => this.handleError(error.message));}

        else{
          let alert = this.alertCtrl.create({
            title: 'Email no válido',
            message: 'Por favor ingresa un email válido',
            buttons: ['Ok']
          });
          alert.present();
           }
          }
         else{
         let alert = this.alertCtrl.create({
             title: 'Campos Incompletos',
             message: 'Porfavor llena todos los campos para continuar',
             buttons: ['Ok']
           });
           alert.present();
         }
  }

  doNext(){
   if(this.general_loader) this.general_loader.dismiss();
   this.goTabs();
  }

  signInWithEmail(credentials) {
    return this.afAuth.auth.signInWithEmailAndPassword(credentials.email, credentials.password);
  }





  //Método para registrar un usuario con correo
  registerMail(){
    if(this.mail != '' && this.pw != '' && this.pw_confirm != ''){
        if(this.mail.indexOf('@')!=-1){
            this.general_loader = this.loadingCtrl.create({
              spinner: 'bubbles',
              content: 'Registrando...'
            });
            this.general_loader.present();
            // this.mail = this.mail.toLowerCase();
            // this.mail = this.mail.replace(/\s+/g,'');
            let credentials = {
              email: this.mail,
              password: this.pw
             };
             this.signUp(credentials)
                  .then(() => this.saveData(), error => this.handleError(error.message));
        }
        else{
          let alert = this.alertCtrl.create({
            title: 'Email no válido',
            message: 'Por favor ingresa un email válido',
            buttons: ['Ok']
          });
          alert.present();
           }
          }
         else{
         let alert = this.alertCtrl.create({
             title: 'Campos Incompletos',
             message: 'Porfavor llena todos los campos para continuar',
             buttons: ['Ok']
           });
           alert.present();
         }
       }

    signUp(credentials) {
      return this.afAuth.auth.createUserWithEmailAndPassword(credentials.email, credentials.password);
    }

   saveData(){
     this.af.list('Users').update(firebase.auth().currentUser.uid, {
       'email': this.mail,
       'index': firebase.auth().currentUser.uid,
       'id': firebase.auth().currentUser.uid,
       'first_name': this.first_name,
       'last_name': this.last_name,
       'name': this.first_name+' '+this.last_name,
       'balance': 0
     });
     this.af.list('Users/'+firebase.auth().currentUser.uid+'/picture').update('data', {
       'url': 'http://monumentfamilydentistry.com/wp-content/uploads/2015/11/user-placeholder.png'
     });

     this.freindsAnimation(event);
     console.log('bounce');
   }

   canSaveData(){
     return this.mail != '' && this.pw != '' && this.pw_confirm != '';
   }

   canSaveDatos(){
     return this.first_name != '' && this.last_name != '';
   }

  //Login related code

  doFacebook(event: any){
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

                this.fb.api('me/friends', []).then(profile => {
                    //this.userData = {email: profile['email'], first_name: profile['first_name'], picture: profile['picture_large']['data']['url'], username: profile['name']};
                    this.general_loader.dismiss();
                    this.af.list('Users').update(firebase.auth().currentUser.uid, profile);
                    this.af.list('Users').update(firebase.auth().currentUser.uid, {
                      'balance': 0
                    });
                    this.freindsAnimation(event);
                }).catch((error) => {
                  //this.general_loader.dismiss();
                  this.af.list('errors').push(error)
                });

                    // this.fb.api('me?fields=id,name,email,first_name,picture.width(720).height(720).as(picture_large)', []).then(profile => {
                    //     //this.userData = {email: profile['email'], first_name: profile['first_name'], picture: profile['picture_large']['data']['url'], username: profile['name']};
                    //     this.general_loader.dismiss();
                    //     this.af.list('Nuevo').push(profile);
                    //     this.freindsAnimation(event);
                    // }).catch((error) => {
                    //   this.general_loader.dismiss();
                    //   this.af.list('errors').push(error)
                    // });

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
         }).catch((error) => {
           this.general_loader.dismiss();
           this.af.list('errors').push(error)
         });
    }
    else{
      return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider()).then((res)=>{
       console.log(res);
       this.general_loader.dismiss();
       let user = res.additionalUserInfo.profile;
       this.af.list('Users').update(firebase.auth().currentUser.uid, user);

        this.freindsAnimation(event);
       // this.submitUser(res.additionalUserInfo.profile);
       //let fecha = new Date();
       //this.getUserDetail(res.additionalUserInfo.profile.id);
     }).catch(error => {
      console.log(error);
});
    }
  }

  getUserDetail(userid) {
  this.fb.api("/"+userid+"/?fields=id,email,name,picture,gender,user_friends",["public_profile"])
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
      return this.fb.login(['email', 'public_profile']);
   }


   handleError(msj){
     this.general_loader.dismiss();
     let alert = this.alertCtrl.create({
       title: msj,
       buttons:  ['Ok']
     });
     alert.present();
   }


  openRegister(){
    this.navCtrl.push(RegisterPage, {'User': 'nomads'});
  }

  openCircles(){
    this.navCtrl.push(CirclesPage, {'Color': 'purple'});
  }

  //Animations
  ionViewDidEnter() {
    var ts = new TimelineMax();
    ts.from(".logo", 2, { opacity: 0});
    ts.from(".main-t", 1, { opacity: 0, x: -20 });
    ts.from(".subtitle", 1, { opacity: 0, x: -20 });
    ts.from(".facebook", .8, { opacity: 0, x: -50 }, '-=0.3');
    ts.from(".b1", .8, { opacity: 0, x: -50 }, '-=0.3');
  }

  freindsAnimation(event: any) {
    this.getUsers();
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
    tl.to(".add-freinds", 2, { display: "none", y: -400, opacity: 0 });
    //tl.to(".invite-freinds", 2, { display: "none", y: -400, opacity: 0 });
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
    let aux = this.preferences.filter(p => p.selected);
    this.af.list('Users').update(firebase.auth().currentUser.uid, {
      'preferences': aux
    });
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


  //General Code
  ionViewDidLoad() {
    // this.af.object('Preferences').snapshotChanges().subscribe(action => {
    //   this.responsep$ = action.payload.val();
    //   this.preferences = [];
    //   this.convertPreferences();
    // });
  }

  convertPreferences(){
    let p = this.responsep$;
    for(let key in p){
      this.preferences.push({'name': p[key].name});
    };
    console.log(this.preferences);
  }

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
