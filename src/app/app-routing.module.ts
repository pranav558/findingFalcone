import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { DashboardComponent } from './solution/dashboard/dashboard.component';
import { FindingFalconComponent } from './solution/finding-falcon/finding-falcon.component';
import { ResultComponent } from './solution/result/result.component';

const routes: Routes = [
  { path : '', redirectTo : 'landing', pathMatch: 'full' },
  { path : 'landing', component: LandingComponent, outlet: 'landing' },
  {
    path : '',
    component: DashboardComponent,
    children: [
      { path : 'finding-falcone', component: FindingFalconComponent },
      { path : 'result', component: ResultComponent },
    ]
  },
  { path : '**', component: LandingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
