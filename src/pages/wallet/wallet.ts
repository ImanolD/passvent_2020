import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ModalController } from 'ionic-angular';
import { FiltersPage } from '../filters/filters';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { Stripe } from '@ionic-native/stripe';
import { Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AyudaPage } from '../ayuda/ayuda';

/**
 * Generated class for the WalletPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-wallet',
  templateUrl: 'wallet.html',
})
export class WalletPage {
public general_loader: any;
//For the user
public users$: any;
public noms_balance: any = [];

public user_type: any='';
public example_packages: any = [
  {
    'noms': 50,
    'bookings_avg': 10,
    'price': 1000,
    'selected': false
  },
  {
    'noms': 75,
    'bookings_avg': 12,
    'price': 1500,
    'selected': false
  },
  {
    'noms': 100,
    'bookings_avg': 14,
    'price': 2000,
    'selected': false
  },
  {
    'noms': 120,
    'bookings_avg': 16,
    'price': 2400,
    'selected': false
  },
];
public selected: any = 0;
public cash: any = 100;
public noms: any = 0;
public user_code: any = '';
public friend_balance: any = '';

public payment_data: any = {
  'card_address': '',
  'card_ccv': '',
  'card_expiry': '',
  'cardholder': '',
  'cardnumber': ''
};

public transaction_id: any;

public response$: any;
public transaction_status: any;
public transaction_paid: any;

public a_response$: any;
public my_activities: any = [];
public activities: any = [];

public t_response$: any;
public transactions: any = [];

public link_payment: any;

public paypal$: any;

public total: any = 0;
public users_total: any = 0;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public af: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public stripe: Stripe,
    private http: Http,
    public iab: InAppBrowser,
    public modalCtrl: ModalController) {}

  canPay(){
    return this.cash != 0;
  }

  verifyConfirmationPaypal(){
      if(this.transaction_status == 'completed'){
        this.general_loader.dismiss();

        this.alertCtrl.create({
          title: 'Transacción exitosa!',
          message: 'Has pagado $'+this.cash,
          buttons: ['Ok']
        }).present();

        //this.getFriendBalance();

        this.af.list('/').update('Accountance', {
          'total': this.total + parseInt(this.cash)
        });

         this.af.list('/').update('Accountance', {
           'users': this.users_total + parseInt(this.cash)
         });

        this.af.list('Payments/'+firebase.auth().currentUser.uid).update(this.transaction_id, {'amount': this.cash});

        let transaction = {'date': new Date(), 'index': this.transaction_id, 'amount': this.cash, 'type': 'noms', 'sender_id': firebase.auth().currentUser.uid};
        this.af.list('transactions').update(this.transaction_id, transaction);

        this.af.list('Users/'+firebase.auth().currentUser.uid+'/transactions').update(this.transaction_id, {
          'index': this.transaction_id
        });

        this.af.list('Users/').update(firebase.auth().currentUser.uid, {
          'balance': this.noms_balance+this.cash
        }).then( () => {
          this.navCtrl.pop();
        })
      }
      else{
        this.general_loader.dismiss();
        this.alertCtrl.create({title: 'Payment Error', message: 'There was an error processing your payment, try again later', buttons: ['Ok']}).present();
      }
  }



  verifyPayment(){
  this.general_loader.dismiss();
  this.general_loader = null;

  this.general_loader = this.loadingCtrl.create({
    spinner: 'bubbles',
    content: 'Verifying Payment...'
  })
  this.general_loader.present();
  this.verifyConfirmationPaypal();
}

  watchLink(){

  this.af.object('Fundings/currentProcess').snapshotChanges().subscribe(action => {
    if(action.payload.val()){
    console.log(action.payload.val());
    let a = action.payload.val();
    for(let key in a){
      this.paypal$ = a[key];

        if(this.paypal$.paid == true) this.transaction_status = 'completed';
        this.verifyPayment();

    }
  }
  else{
    // this.verifyPayment();
  }
  });
}

  paypalDone(){
    this.alertCtrl.create({
      title: '¿Todo salió bien con el pago?',
      message: 'Te preguntamos esto para validar la transacción y abonar el saldo a tu cuenta.',
      // message: 'Se te hará un cargo de  $'+this.quantity+' a la tarjeta que ingresaste',
      buttons: [
        {
          text: 'Hubo un problema',
          handler: () => {
            this.general_loader.dismiss();
            this.navCtrl.pop()
                .then(()=> this.modalCtrl.create(AyudaPage).present());

          }
        },
        {
          text: 'Todo bien',
          handler: () =>{
            this.watchLink();
          }
        }
      ]
    }).present();
  }

  chargePaypal(){
  this.general_loader = this.loadingCtrl.create({
    spinner: 'bubbles',
    content: 'Cargando...'
  })
  this.general_loader.present();
  this.af.list('Fundings/currentProcess').remove();
  this.af.list('paypal/current').remove();

  this.transaction_id = this.generateUUID();
  let qty = parseInt(this.cash);
  console.log(qty);

  let data = {
    amount: qty,
    uid: firebase.auth().currentUser.uid,
    t_id: this.transaction_id
  };

    this.http.post('https://us-central1-passvent-dev.cloudfunctions.net/pay/createPayment', data)
    .map(res => res.json())
    .subscribe(data => {
      //data = JSON.stringify(data);
      console.log('Response From Server: ' + data.links[1].href);
      this.link_payment = data.links[1].href;
      const browser = this.iab.create(data.links[1].href, '_blank');
      this.paypalDone();
    });
}

  confirmPaypal(){
    if(this.cash > 0){
      this.alertCtrl.create({
        title: '¿Deseas comprar crédito en passvent?',
        subTitle: 'Tu cargo será de $'+this.cash,
        message: 'Una ventana de paypal se abrirá para tu pago',
        buttons: [
          {
            text: 'Cancelar',
            handler: () => {

            }
          },
          {
            text: 'Continuar',
            handler: () =>{
              this.chargePaypal();
            }
          }
        ]
      }).present();
    }
    else{
      this.alertCtrl.create({
        title: 'Enter an amount of cash',
        message: 'In order to buy noms you need to enter the amount of cash you want to pay',
        buttons: ['Ok']
      }).present();
    }
  }

  selectP(indice){
    this.selected = indice;
    this.cash = this.example_packages[indice].price;
    this.noms = this.cash/20;
  }

  isSelected(indice){
    return ( this.selected == indice ? 'slide-card selected' : 'slide-card');
  }


  getMenor(){
    return Math.ceil(this.noms/9);
  }

  getMayor(){
    return Math.ceil(this.noms/3.5);
  }

  checkExistA(indice){
    let a = this.activities;
    for(let key in a){
      if(a[key].index == indice){
        return true;
      }
    }
    return false;
  }



  convertActivities(){
    let a = this.a_response$;
    for(let key in a){
      if(this.checkExistA(a[key].index)){
        this.my_activities.push({
          'index': a[key].index,
          'title': a[key].title,
          'schedule': a[key].schedule,
          'fee': a[key].fee,
          'price': a[key].class_price
        });
      }
    }
    console.log(this.my_activities);
  }

  getActivities(){
    this.af.object('Activities').snapshotChanges().subscribe(action => {
      this.a_response$ = action.payload.val();
      this.my_activities = [];
      this.convertActivities();
    });
  }

  convertTransactions(){
    let a = this.t_response$;
    for(let key in a){
      this.transactions.push({
        'activity_id': (a[key].activity_id ? a[key].activity_id  : ''),
        'amount': a[key].amount,
        'index': a[key].index,
        'receiver_id': a[key].receiver_id
      });
    }
    this.transactions = this.transactions.filter(cat => cat.receiver_id == firebase.auth().currentUser.uid);
    console.log(this.transactions);
  }

  getTransactions(){
    this.af.object('transactions').snapshotChanges().subscribe(action => {
      this.t_response$ = action.payload.val();
      this.transactions = [];
      this.convertTransactions();
    });
  }

  ionViewDidLoad(){
    this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando...'
    });
    this.general_loader.present();

    this.af.object('Accountance/').snapshotChanges().subscribe(action => {
     this.total = action.payload.val().total;
     this.total = parseInt(this.total);
     this.users_total = action.payload.val().users;
     this.users_total = parseInt(this.users_total);
    });

    this.af.object('Users/'+firebase.auth().currentUser.uid).snapshotChanges().subscribe(action => {
      this.users$ = action.payload.val();
      this.noms_balance = this.users$.balance;

      if(this.general_loader) this.general_loader.dismiss();
    });

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
