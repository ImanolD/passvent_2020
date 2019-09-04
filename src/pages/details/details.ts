import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ActivityPage } from '../activity/activity';
import { EventPage } from '../event/event';
import { EventoPage } from '../evento/evento';

/**
 * Generated class for the DetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-details',
  templateUrl: 'details.html',
})
export class DetailsPage {
public act: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.act = this.navParams.get('Details');
    console.log(this.act);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DetailsPage');
  }

  seeDetails(){
    this.navCtrl.push(EventoPage, {'Evento': this.act});
  }


}
