import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FiltersPage } from '../filters/filters';

/**
 * Generated class for the FriendsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-friends',
  templateUrl: 'friends.html',
})
export class FriendsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  openFilters(){
    this.navCtrl.push(FiltersPage);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FriendsPage');
  }

}
