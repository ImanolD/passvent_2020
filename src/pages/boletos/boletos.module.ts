import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BoletosPage } from './boletos';

@NgModule({
  declarations: [
    BoletosPage,
  ],
  imports: [
    IonicPageModule.forChild(BoletosPage),
  ],
})
export class BoletosPageModule {}
