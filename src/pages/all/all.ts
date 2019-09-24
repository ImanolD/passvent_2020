import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController } from 'ionic-angular';
declare var google;
import { Geolocation } from '@ionic-native/geolocation';
import { FiltersPage } from '../filters/filters';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { WalletPage } from '../wallet/wallet';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivityPage } from '../activity/activity';
import { EventoPage } from '../evento/evento';
import * as moment from 'moment';
import { DetailsPage } from '../details/details';
import { MapaPage } from '../mapa/mapa';
import { OtherProfilePage } from '../other-profile/other-profile';

@Component({
  selector: 'page-all',
  templateUrl: 'all.html'
})
export class AllPage {
public general_loader: any;

//For the user
public users$: any;
public users: any = [];
public noms_balance: any = [];
public nomad_schedule: any = [];

public response$: any;
public e_response$: any;
public activities_all: any = [];

public auxiliar: any;
public class_slides: any= false;

public done_g: any = false;
public user_preferences: any = [];
public filtered_a: any = [];

public f_selected: any = 1;
public eventos: any = [];
public search: any = '';

public ciudades: any = [
  {
    'name': 'San Luis Potosí',
    'events': true,
    'img': 'https://www.visitmexico.com/viajemospormexico/assets/uploads/destinos/san-luis-potosi_destinos-principales_san-luis-potosi_01.jpg'
  },
  {
    'name': 'Querétaro',
    'events': false,
    'img': 'https://www.visitmexico.com/viajemospormexico/assets/uploads/destinos/queretaro_destinos-principales_queretaro_int.jpg'
  },
  {
    'name': 'León',
    'events': false,
    'img': 'https://www.leon.gob.mx/leon/images/image5.jpg'
  },
  {
    'name': 'Cancún',
    'events': false,
    'img': 'https://www.avianca.com/content/dam/avianca_new/destinos/cun/cun_banner_cancun_destino.jpg'
  },
  {
    'name': 'Monterrey',
    'events': false,
    'img': 'https://www.visitmexico.com/viajemospormexico/assets/uploads/destinos/nuevo-leon_destinos-principales_monterrey_01.jpg'
  },
  {
    'name': 'Guadalajara',
    'events': false,
    'img': 'https://img.chilango.com/2019/05/que-hacer-en-guadalajara-2.jpg'
  },
  {
    'name': 'Puerto Vallarta',
    'events': false,
    'img': 'https://www.garzablancaresort.com.mx/blog/wp-content/uploads/2015/12/the-best-beaches-in-puerto-vallarta-e1506119214708.jpg'
  },
  {
    'name': 'Ciudad de México',
    'events': false,
    'img': 'https://cdn-3.expansion.mx/dims4/default/01d4259/2147483647/strip/true/crop/659x462+0+0/resize/800x561!/quality/90/?url=https%3A%2F%2Fcdn-3.expansion.mx%2Fdb%2Fdbf1446c85fabec0927577fc1a27d598%2Fcdmx-reforma20180516134246.jpg'
  },
];

public city: any = '';

  @ViewChild('map') mapElement: ElementRef;
   map: any;

  constructor( public navCtrl: NavController,
    public navParams: NavParams,
    public af: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public geolocation: Geolocation,
    public sanitizer: DomSanitizer,
    public modalCtrl: ModalController) {
      this.city = 'Buscar en '+this.navParams.get('city');
      this.eventos = this.navParams.get('eventos');
    }

    openEvent(event){
      this.navCtrl.push(EventoPage, {'Event': event});
    }



    filterEventos(){
      return this.eventos.filter(e=> this.navParams.get('city') == 'San Luis Potosí' && (this.search == '' || e.title.toLowerCase().indexOf(this.search.toLowerCase())>-1) );
    }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AllPage');
  }

}
