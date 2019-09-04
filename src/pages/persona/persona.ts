import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the PersonaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-persona',
  templateUrl: 'persona.html',
})
export class PersonaPage {

  public persona: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.persona = this.navParams.get('persona');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PersonaPage');
  }

}
