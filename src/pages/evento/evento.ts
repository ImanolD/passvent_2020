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


  @ViewChild('map') mapElement: ElementRef;
   map: any;

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
    public barcodeScanner: BarcodeScanner) {
      moment.locale('es');
      this.evento_data = this.navParams.get('Evento');
      this.evento_data.dia = moment(this.evento_data.start_day).format('LL')
      console.log(this.evento_data);
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

    openInvitados(tipo){
      this.navCtrl.push(InvitadosPage, {'users': this.evento_data.attendants, 'type': tipo});
    }

    openEdit(){
      this.navCtrl.push(EditeventPage, {'Event': this.evento_data});
    }


      cuantosAmigos(conteo){
        return conteo.filter(c=>c.isFriend).length;
      }

    isOwner(){
      return this.evento_data.creator_index == firebase.auth().currentUser.uid;
    }


    sanitizeThis(image){
      return this.sanitizer.bypassSecurityTrustStyle('url('+image+')');
    }

  ionViewDidLoad() {
    this.general_loader = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando...'
    });
    //this.general_loader.present();
    this.af.object('Users').snapshotChanges().subscribe(action => {
      this.people$ = action.payload.val();
    });
  }

}
