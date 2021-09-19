import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FindingFalconService } from 'src/app/services/finding-falcon.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {

  message: string = '';
  dataSubscription: Subscription | undefined;
  findSubscription: Subscription | undefined;

  constructor(private service: FindingFalconService) { }

  ngOnInit(): void {
    this.dataSubscription = this.service.getSelectedValues.subscribe(
      (res: any) => {
        if (Object.keys(res).length !== 0) {
          this.findSubscription = this.service.findFalcone(res).subscribe(
            (res: any) => {
              if (res.status && res.status == 'success') {
                this.message = `We found Falcone on Planet - ${res.planet_name}`;
              } else if (res.error) {
                this.message = res.error;
              } else {
                this.message = 'Falcone was not found, please try again';
              }
            },
            (err: any) => {
              this.message = 'There was some error. Please try again';
              if (err.message) {
                this.message = err.message;
              }
            }
          );
        }
      }
    );
  }

  ngOnDestroy() {
    this.dataSubscription?.unsubscribe();
    this.findSubscription?.unsubscribe();
  }

}
