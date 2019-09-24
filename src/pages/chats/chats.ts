import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { FiltersPage } from '../filters/filters';
import { ChatPage } from '../chat/chat';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import firebase from 'firebase';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { NewchatPage } from '../newchat/newchat';

/**
 * Generated class for the ChatsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chats',
  templateUrl: 'chats.html',
})
export class ChatsPage {

  public general_loader: any;
  public user_chats: any = [];
  public response$: any;
  public room_chats: any = [];
  public noms_balance: any;
  public users$: any;
  public friends: any = [];
  public search: any = '';


public segment: any = 'instructors';
public user_type: any = '';
public example_chats: any = [
  {
    'name': 'Chat UI',
    'class': 'App Testing',
    'message': 'Hey! Try me out!'
  },
]
  constructor(public navCtrl: NavController,
  public navParams: NavParams,
  public af: AngularFireDatabase,
  public loadingCtrl: LoadingController,
  public alertCtrl: AlertController,
  public sanitizer: DomSanitizer) {
    this.user_type = localStorage.getItem('Tipo');
    if(this.navParams.get('Segmento')) this.segment = this.navParams.get('Segmento');
  }


  isName(info){
    return info.toLowerCase().indexOf(this.search.toLowerCase())>-1;
  }


  darChats(){
    return this.room_chats.filter(c=> this.search == '' || this.isName(c.partner_name));
  }


  startChat(){
    this.navCtrl.push(NewchatPage, {'friends': this.friends});
  }

  openChat(room){
    this.navCtrl.push(ChatPage, {'chat-room': room.index, 'info': room.partner_info});
  }

  openFilters(){
    this.navCtrl.push(FiltersPage);
  }

  changeSegment(tipo){
    this.segment = tipo;
  }

  getSegment(tipo){
    return this.segment == tipo ? 'segment-element selected' : 'segment-element';
  }

  getLastIndex(indice){
    return indice == firebase.auth().currentUser.uid;
  }


  getName(miembros){
    let partner_id = '';
    let a = this.users$;

    for(let key in miembros){
      if(miembros[key].index != firebase.auth().currentUser.uid){
        partner_id = miembros[key].index;
      }
    }

    console.log(partner_id);
    console.log(a);

    for(let key in a){
      if(key == partner_id){
        return a[key];
      }
    }

    return '';
  }

  getFID(miembros){
    let partner_id = '';
    let a = this.users$;

    for(let key in miembros){
      if(miembros[key].index != firebase.auth().currentUser.uid){
        partner_id = miembros[key].index;
      }
    }

    console.log(partner_id);
    console.log(a);

    for(let key in a){
      if(key == partner_id){
        return key;
      }
    }

    return '';
  }

  checkExists(indice){
    let a = this.user_chats;
    for(let key in a){
      if(a[key].index == indice){
        return true;
      }
    }
    return false;
  }

  obtenerNombre(miembros){
    let partner_id = '';
    let a = this.users$;

    for(let key in miembros){
      if(miembros[key].index != firebase.auth().currentUser.uid){
        partner_id = miembros[key].index;
      }
    }

    console.log(partner_id);
    console.log(a);

    for(let key in a){
      if(key == partner_id){
        return a[key].name;
      }
    }

    return '';
  }

  convertChats(){
    let a = this.response$;
    for(let key in a){
      if(this.checkExists(a[key].index)){
        this.room_chats.push({
          'index': a[key].index,
          'createdAt': a[key].createdAt,
          'type': a[key].type,
          'members': a[key].members,
          'expireDay': a[key].expireDay,
          'partner_info': this.getName(a[key].members),
          'activity_name': a[key].activity_name,
          'lastMsg': a[key].lastMsg.substring(0, 20) + '..',
          'lastMsg_index': a[key].lastMsg_index,
          'partner_name': this.obtenerNombre(a[key].members)
        });
        this.friends[this.friends.length] = this.getFID(a[key].members);
      }
    }

    console.log(this.friends);
    let today  = moment();
    this.room_chats = this.room_chats.filter( chat => moment(chat.expireDay) != moment() && !moment(chat.expireDay).isBefore(today));
    console.log(this.room_chats);
    if(this.general_loader) this.general_loader.dismiss();
  }

  getRooms(){
    this.af.object('Chats/').snapshotChanges().subscribe(action => {
      this.response$ = action.payload.val();

      this.room_chats = [];
      this.convertChats();
    });
  }

  ionViewDidLoad() {
    this.general_loader =  this.loadingCtrl.create({
          spinner: 'bubbles',
           content: 'Loading...'
          });
    this.general_loader.present();

    this.af.object('Users/'+firebase.auth().currentUser.uid).snapshotChanges().subscribe(action => {
       this.noms_balance = action.payload.val().noms;
       this.user_chats = action.payload.val().Chats;
    });
    this.af.object('Users/').snapshotChanges().subscribe(action => {
       this.users$ = action.payload.val();
    });
    this.getRooms();
  }

}
