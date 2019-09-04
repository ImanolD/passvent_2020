import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvitadosPage } from './invitados';

@NgModule({
  declarations: [
    InvitadosPage,
  ],
  imports: [
    IonicPageModule.forChild(InvitadosPage),
  ],
})
export class InvitadosPageModule {}
