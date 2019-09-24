import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ModalController } from 'ionic-angular';
declare var google;
import { Geolocation } from '@ionic-native/geolocation';
import { FiltersPage } from '../filters/filters';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { ChatsPage } from '../chats/chats';
import { SocialSharing } from '@ionic-native/social-sharing';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
import { EditeventPage } from '../editevent/editevent';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { InvitadosPage } from '../invitados/invitados';
import { PersonaPage } from '../persona/persona';
import { GaleriaPage } from '../galeria/galeria';
import { AddFriendsPage } from '../add-friends/add-friends';
import { BoletosPage } from '../boletos/boletos';
import { AyudaPage } from '../ayuda/ayuda';
import { Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import { InAppBrowser } from '@ionic-native/in-app-browser';

/**
 * Generated class for the EventoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-evento',
  templateUrl: 'evento.html',
})
export class EventoPage {

  public general_loader: any;
  public evento_data: any = [];

  public people$: any;
  public f_selected: any = 1;
  public msg = '';
  public amigos: any = [];
  public cash: any = 0;
  public noms_balance: any = 0;

  public response$: any;
  public transaction_status: any;
  public transaction_paid: any;
  public transaction_id: any;

  public a_response$: any;
  public my_activities: any = [];
  public activities: any = [];

  public t_response$: any;
  public transactions: any = [];

  public link_payment: any;

  public paypal$: any;

  @ViewChild('map') mapElement: ElementRef;
   map: any;

   public anuncios: any = [
     {
       'name': 'Imanol Daran Argueta',
       'message': 'I go where i want'
     },
     {
       'name': 'Imanol Daran Argueta',
       'message': 'Play if you want'
     },
     {
       'name': 'Imanol Daran Argueta',
       'message': 'Im a young CEO bitch'
     }
   ]

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public af: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public geolocation: Geolocation,
    public sanitizer: DomSanitizer,
    public modalCtrl: ModalController,
    public socialSharing: SocialSharing,
    public launchNavigator: LaunchNavigator,
    public barcodeScanner: BarcodeScanner,
    private http: Http,
    public iab: InAppBrowser) {
      moment.locale('es');
      this.evento_data = this.navParams.get('Evento');
      this.evento_data.dia = moment(this.evento_data.start_day).format('LL')
      console.log(this.evento_data);
    }

    invitarAmigo(){
      this.navCtrl.push(AddFriendsPage, {'evento': this.evento_data, 'type': 'invite', 'evento-index': this.evento_data.index});
    }


    openGaleria(){
      this.navCtrl.push(GaleriaPage, {'evento': this.evento_data});
    }

    markAsistencia(){
      let loader = this.loadingCtrl.create({
        spinner: 'bubbles',
        content: 'Agregandote al evento...'
      });
      loader.present();

      this.af.list('Events/'+this.evento_data.index+'/attendants').update(firebase.auth().currentUser.uid, {
        'index': firebase.auth().currentUser.uid,
        'inevent': false,
        'isOwner': false,
        'role': 'attendant',
        'status': 'Accepted'
      });
      this.af.list('Users/'+firebase.auth().currentUser.uid+'/Events').update(this.evento_data.index, {
        'index': this.evento_data.index,
        'isOwner': false
      }).then(()=>{
        loader.dismiss();
        this.alertCtrl.create({
          title: '¡Ya eres parte del evento!',
          message: 'Recuerda checar constantemente el announcement board del evento.',
          buttons:  ['Ok']
        }).present();
        this.navCtrl.pop();
      });
    }

    blockEvento(){
      let loader = this.loadingCtrl.create({
        spinner: 'bubbles',
        content: 'Rechazando evento...'
      });
      loader.present();

      this.af.list('Events/'+this.evento_data.index+'/attendants').update(firebase.auth().currentUser.uid, {
        'index': firebase.auth().currentUser.uid,
        'inevent': false,
        'isOwner': false,
        'role': 'attendant',
        'status': 'Rejected'
      }).then(()=>{
        loader.dismiss();
        this.alertCtrl.create({
          title: 'Evento rechazado',
          message: 'No verás más noticias de este evento.',
          buttons:  ['Ok']
        }).present();
        this.navCtrl.pop();
      });
    }

    markInteres(){
      let loader = this.loadingCtrl.create({
        spinner: 'bubbles',
        content: 'Marcando interés en el evento...'
      });
      loader.present();

      this.af.list('Events/'+this.evento_data.index+'/attendants').update(firebase.auth().currentUser.uid, {
        'index': firebase.auth().currentUser.uid,
        'inevent': false,
        'isOwner': false,
        'role': 'attendant',
        'status': 'Interested'
      }).then(()=>{
        loader.dismiss();
        this.alertCtrl.create({
          title: '¡Has marcado tu interés en el evento!',
          message: 'Obtendrás actualizaciones del evento y de gente interesada',
          buttons:  ['Ok']
        }).present();
        this.navCtrl.pop();
      });
    }


    addMsg(){
      if(this.msg != ''){
        this.evento_data.messages.unshift({
          'name': this.getMyName(),
          'message': this.msg,
          'rol': this.evento_data.rol,
          'index': firebase.auth().currentUser.uid
        });
        this.msg = '';
      }
    }

    goNavigate(){
      this.launchNavigator.navigate(this.evento_data.location);
    }

    ionViewWillLeave(){
      this.af.list('Events/').update(this.evento_data.index, {
        'messages': this.evento_data.messages,
        'attendants': this.evento_data.attendants
      });
    }

    getClass(indice){
      return this.f_selected == indice ? 'btn-filters selected' : 'btn-filters';
    }

    getMyName(){
      let p = this.people$;
      for(let key in p){
        if(key == firebase.auth().currentUser.uid) return p[key].name;
      }
      return '';
    }

    changeClass(indice){
      this.f_selected = indice;
    }

    textAreaAdjust(o) {
  o.style.height = "1px";
  o.style.height = (25+o.scrollHeight)+"px";
}

    openScanned(){

   this.barcodeScanner.scan().then((barcodeData) => {
      let a = this.getPerson(barcodeData.text);
      this.af.list('test').push(a);
      let modal = this.modalCtrl.create(PersonaPage, {'persona': a});
      modal.present();
    }, err => {
      console.log(err)
    });
   }


getPerson(indice){
  let p = this.people$;
  for(let key in p){
    if(key == indice) return p[key];
  }
}


comprarBoletos(){
  let modal = this.modalCtrl.create(BoletosPage, {'evento': this.evento_data});
  modal.present();
}




    getData(dato){
      let p = this.people$;
      for(let key in p){
        if(key == this.evento_data.creator_index){
          if(dato == 'name'){
            return p[key].name;
          }
          else if(dato == 'img'){
            return p[key].picture.data.url;
          }
        }
      }

    }

    ionViewWillEnter(){
      let l = localStorage.getItem('added');
      if(l){
        l = JSON.parse(l);
        this.evento_data.attendants = this.evento_data.attendants.concat(l);
      }
      localStorage.removeItem('added');
    }



    openInvitados(tipo){
      this.navCtrl.push(InvitadosPage, {'users': this.evento_data.attendants, 'type': tipo});
    }

    openEdit(){
      this.navCtrl.push(EditeventPage, {'Event': this.evento_data});
    }


      cuantosAmigos(conteo){
        let aux = [];
        for(let key in conteo){
          aux.push({
            'isFriend': conteo[key].isFriend,
            'data': conteo[key].data,
            'index': conteo[key].index,
            'inevent': conteo[key].inevent,
            'isOwner': conteo[key].isOwner,
            'role': conteo[key].role,
            'status': conteo[key].status
          });
        }
        let a = aux.filter(c=>c.isFriend).length;
        this.amigos = aux.filter(c=>c.isFriend);
        //console.log(this.amigos);
        return a;
      }

    isOwner(){
      return this.evento_data.creator_index == firebase.auth().currentUser.uid;
    }


    sanitizeThis(image){
      return this.sanitizer.bypassSecurityTrustStyle('url('+image+')');
    }

    addMarker(){

  let marker = new google.maps.Marker({
    map: this.map,
    animation: google.maps.Animation.DROP,
    position: this.map.getCenter()
  });

  let content = "<h4>This is the location!</h4>";
  //let content = context.toDataUrl()
  this.addInfoWindow(marker, content);

  }

  confirmAction(cual){
    let t = cual == 'si' ? '¿Estás seguro que deseas marcar tu asistencia?' : cual == 'no' ? '¿Estás seguro que deseas rechazar tu invitación?' : '¿Estás seguro que deseas marcarte como interesado?'
    this.alertCtrl.create({
      title: t,
      buttons: [
        {
        text: 'Cancelar',
        handler: ()=>{

        }
      },
      {
      text: 'Confirmar',
      handler: ()=>{
        if(cual == 'si') this.markAsistencia();
        if(cual == 'no') this.blockEvento();
        if(cual == 'interes') this.markInteres();
      }
    },
    ]
  }).present();
  }

  addInfoWindow(marker, content){

  let infoWindow = new google.maps.InfoWindow({
    content: content
  });

  google.maps.event.addListener(marker, 'click', () => {
    infoWindow.open(this.map, marker);
  });
  this.general_loader.dismiss();
  }

    loadMap(){


          let geocoder = new google.maps.Geocoder();
          let address = 'Sebastian el Cano 100 Del Valle San Luis Potosi';
          let vm = this;

          geocoder.geocode( { 'address' : this.evento_data.location }, function( results, status ) {
             if( status == google.maps.GeocoderStatus.OK ) {

               let mapOptions = {
                 center: results[0].geometry.location,
                 zoom: 15,
                 mapTypeId: google.maps.MapTypeId.ROADMAP,
                 disableDefaultUI: true
               }

               vm.map = new google.maps.Map(vm.mapElement.nativeElement, mapOptions);
               vm.addMarker();

             } else {
               vm.general_loader.dismiss();
                //alert( 'Geocode was not successful for the following reason: ' + status );
             }
         } );


    }

  ionViewDidLoad() {
    this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando...'
    });
    this.general_loader.present();
    this.af.object('Users').snapshotChanges().subscribe(action => {
      this.people$ = action.payload.val();
    });
    this.af.object('Users/'+firebase.auth().currentUser.uid).snapshotChanges().subscribe(action => {
      this.noms_balance = action.payload.val().balance;
    });
    this.loadMap();
  }



  //COSAS DE PAGAR

  verifyConfirmationPaypal(){
      if(this.transaction_status == 'completed'){
        this.general_loader.dismiss();

        this.alertCtrl.create({
          title: 'Transacción exitosa!',
          message: 'Has pagado $'+this.cash,
          buttons: ['Ok']
        }).present();

        //this.getFriendBalance();

        this.af.list('Payments/'+firebase.auth().currentUser.uid).update(this.transaction_id, {'amount': this.cash});

        let transaction = {'date': new Date(), 'index': this.transaction_id, 'amount': this.cash, 'type': 'boleto', 'sender_id': firebase.auth().currentUser.uid, 'receiver_id': this.evento_data.creator_index};
        this.af.list('transactions').update(this.transaction_id, transaction);

        this.af.list('Users/'+firebase.auth().currentUser.uid+'/transactions').update(this.transaction_id, {
          'index': this.transaction_id
        });

        this.af.list('Users/').update(this.evento_data.creator_index, {
          'balance': this.noms_balance+this.cash
        }).then( () => {
          this.markAsistencia();
        });
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
    content: 'Verificando el pago...'
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

  confirmPaypal(cantidad){
      this.cash = cantidad;

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
