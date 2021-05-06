import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadComponent } from './upload/upload.component';
import { ReadReportComponent } from './read-report/read-report.component';

const routes: Routes = [

  {
    path: 'getReport',
    // canActivate: [AuthGuard],
    component: ReadReportComponent
  },
  {
    path: '',
    // canActivate: [AuthGuard],
    component: UploadComponent
  }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
