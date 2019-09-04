import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonaPage } from './persona';

@NgModule({
  declarations: [
    PersonaPage,
  ],
  imports: [
    IonicPageModule.forChild(PersonaPage),
  ],
})
export class PersonaPageModule {}
