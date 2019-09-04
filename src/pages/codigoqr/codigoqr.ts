import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import firebase from 'firebase';

/**
 * Generated class for the CodigoqrPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-codigoqr',
  templateUrl: 'codigoqr.html',
})
export class CodigoqrPage {

  public index: any = '';

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.index = firebase.auth().currentUser.uid;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CodigoqrPage');
  }

}
