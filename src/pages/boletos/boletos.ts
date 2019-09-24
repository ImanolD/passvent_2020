import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ViewController } from 'ionic-angular';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { SocialSharing } from '@ionic-native/social-sharing';

/**
 * Generated class for the BoletosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-boletos',
  templateUrl: 'boletos.html',
})
export class BoletosPage {

  public general_loader: any;
  public section: any = '1';
  public evento: any = [];
  public selected_boleto: any = '';

  constructor(public navCtrl: NavController,
  public navParams: NavParams,
  public af: AngularFireDatabase,
  public loadingCtrl: LoadingController,
  public alertCtrl: AlertController,
  public sanitizer: DomSanitizer,
  public viewCtrl: ViewController,
  public socialSharing: SocialSharing) {
    this.evento = this.navParams.get('evento');
  }

}
