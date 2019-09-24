import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewchatPage } from './newchat';

@NgModule({
  declarations: [
    NewchatPage,
  ],
  imports: [
    IonicPageModule.forChild(NewchatPage),
  ],
})
export class NewchatPageModule {}
