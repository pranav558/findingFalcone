import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Planet } from 'src/app/interfaces/planet';
import { Vehicle } from 'src/app/interfaces/vehicle';
import { FindingFalconService } from 'src/app/services/finding-falcon.service';

@Component({
  selector: 'app-finding-falcon',
  templateUrl: './finding-falcon.component.html',
  styleUrls: ['./finding-falcon.component.scss']
})
export class FindingFalconComponent implements OnInit, OnDestroy {

  totalVehicles: number[] = Array(4).fill(0); // Number of assignable vehicles
  units: string = 'megamiles';
  calculatedTime: number = 0;
  errorMessage: string = '';

  originalPlanets: Planet[] = [];
  originalVehicles: Vehicle[] = [];

  planets: Planet[] = [];
  vehicles: Vehicle[] = [];

  selectedPlanets = new Map();
  selectedVehicles = new Map();

  planetSubscription: Subscription | undefined;
  vehicleSubscription: Subscription | undefined;
  tokenSubscription: Subscription | undefined;

  constructor(
    private service: FindingFalconService,
    private route: Router
  ) { }

  ngOnInit(): void {
    this.planetSubscription = this.service.getPlanets().subscribe(
      (res: Planet[]) => {
        this.originalPlanets = [...res];
        this.planets = [...res];
      },
      (err: any) => {
        this.errorMessage = 'Planets could not be retrieved';
        if (err.message) {
          this.errorMessage = err.message;
        }
      }
    );
    this.vehicleSubscription = this.service.getVehicles().subscribe(
      (res: Vehicle[]) => {
        this.originalVehicles = [...res];
        this.vehicles = [...res];
      },
      (err: any) => {
        this.errorMessage = 'Vehicles could not be retrieved';
        if (err.message) {
          this.errorMessage = err.message;
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.planetSubscription?.unsubscribe();
    this.vehicleSubscription?.unsubscribe();
    this.tokenSubscription?.unsubscribe();
  }

  /**
    * Gets called by vehicleChange and resetOldVehicleCount functions.
    *
    * Calculates new time to travel and updates calculatedTime.
    *
    * @param id unique number of the container
    * @param operation string value containing values add/sub
    * @return void
  */
  private calculateTime(id: number, operation: string): void {
    const planet: Planet | undefined = this.originalPlanets.find((item: Planet) => item.name == this.selectedVehicles.get(id).planetName);
    if (planet) {
      const timeValue = planet.distance / this.selectedVehicles.get(id).speed;
      this.calculatedTime = operation === 'add' ? this.calculatedTime + timeValue : this.calculatedTime - timeValue;
    }
  }

  /**
    * Gets called by vehicleChange and resetVehicles functions.
    *
    * Resets the previously selected vehicle count to the old value.
    * Removes the vehicle from selected Vehicles List.
    *
    * @param id unique number of the container
    * @return void
  */
  private resetOldVehicleCount(id: number): void {
    if (this.selectedVehicles.get(id)) {
      const index: number = this.vehicles.findIndex((vehicle: Vehicle) => vehicle.name == this.selectedVehicles.get(id).name);
      this.vehicles[index].total_no += 1;
      this.calculateTime(id,'sub');
      this.selectedVehicles.delete(id);
    }
  }

  /**
    * Gets called by destinationChange function.
    *
    * Resets the radio buttons, adds disable attribute based on distance and unit count conditions.
    *
    * @param id unique number of the container
    * @param planetName string containing the planets name
    * @return void
  */
  private resetVehicles(id: number, planetName: string): void {
    const planet: Planet | undefined  = this.originalPlanets.find((item:Planet) => item.name == planetName);
    Array.from(document.querySelectorAll(`input[name="radio${id}"]`)).forEach((element: any) => {
      element.checked = false;
      element.disabled = false;
      if (planet &&
        ( element.getAttribute('data-distance') < planet.distance ||
          element.getAttribute('data-totalUnits') == 0
        )
      ) {
        element.disabled = true;
      }
    });
    this.resetOldVehicleCount(id);
  }

  /**
    * Gets called on destination(container) dropdown change event.
    *
    * Adds planet to the selected Planets List.
    * Hide/Show the radioButton list based on condition.
    *
    *
    * @param event event object containing selected planet from planet list
    * @param id unique number of the container
    * @return void
  */
  destinationChange(event: any, id: number): void {
    this.selectedPlanets.set(id, event.target.value);
    const flag = this.planets.some((item: Planet) => item.name == event.target.value);
    this.planets = this.originalPlanets.filter((item: Planet) => ![...this.selectedPlanets.values()].includes(item.name));
    let planetSelector: any = document.querySelector(`#planets${id}`);
    let controlGroup = planetSelector.nextElementSibling;
    if (flag) {
      controlGroup.style.display = 'block';
    } else {
      controlGroup.style.display = 'none';
    }
    this.resetVehicles(id, event.target.value);
  }

  /**
    * Gets called on vehicle radio button change event.
    *
    * Adds vehicle to the selected Vehicles List with updated count.
    *
    * @param vehicle vehicle object that is selected
    * @param id unique number of the container
    * @return void
  */
  vehicleChange(vehicle: Vehicle, id: number): void {
    let vehicleObj = {...vehicle};
    vehicleObj.planetName = this.selectedPlanets.get(id);
    this.resetOldVehicleCount(id);
    this.selectedVehicles.set(id, vehicleObj);
    const index = this.vehicles.findIndex((vehicle: Vehicle) => vehicle.name == this.selectedVehicles.get(id).name);
    this.vehicles[index].total_no -= 1;
    this.calculateTime(id, 'add');
  }

  /**
    * Gets called on clicking let's roll button.
    *
    * Sends data to the results page via BehaviourSubject after calling getToken API and
    * adding retrieved token to the data.
    * Data is an object with keys - token, planet_names, vehicle_names.
    *
    * @param none
    * @return void
  */
  sendDataToResultPage(): void {
    this.tokenSubscription = this.service.getToken().subscribe(
      (res: any) => {
        this.service.setSelectedValues({
          token: res.token,
          planet_names: [...this.selectedPlanets.values()],
          vehicle_names: [...this.selectedVehicles.values()].map(item => item.name)
        });
        this.route.navigate(['/result']);
      },
      (err: any) => {
        this.errorMessage = 'Token could not be retrieved';
        if (err.message) {
          this.errorMessage = err.message;
        }
      }
    );
  }
}
