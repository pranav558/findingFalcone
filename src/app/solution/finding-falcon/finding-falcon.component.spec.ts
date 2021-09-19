import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FindingFalconService } from 'src/app/services/finding-falcon.service';

import { FindingFalconComponent } from './finding-falcon.component';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Router } from '@angular/router';

describe('FindingFalconComponent', () => {
  let component: FindingFalconComponent;
  let fixture: ComponentFixture<FindingFalconComponent>;
  let service: FindingFalconService ;
  let mockRouter = {
    navigate: jasmine.createSpy('navigate')
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FindingFalconComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [
        FindingFalconService,
        { provide: Router, useValue: mockRouter}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FindingFalconComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(FindingFalconService);
    component.originalPlanets = [
      { name : 'Donlon', distance : 100},
      { name : 'Enchai', distance : 200},
      { name : 'Jebing', distance : 300},
      { name : 'Sapir', distance : 400},
      { name : 'Lerbin', distance : 500},
      { name : 'Pingasor', distance : 600}
    ];

    component.originalVehicles = [
      { name : 'Space pod', total_no: 2, max_distance : 200, speed : 2 },
      { name : 'Space rocket', total_no: 1, max_distance : 300, speed : 4 },
      { name : 'Space shuttle', total_no: 1, max_distance : 400, speed : 5 },
      { name : 'Space ship', total_no: 2, max_distance : 600, speed : 10 },
    ];
    component.planets = [ ...component.originalPlanets ];
    component.vehicles = [ ...component.originalVehicles ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnInit and call the Service methods with response', fakeAsync(() => {
    spyOn(service, 'getPlanets').and.callFake(() => {
      return of([]).pipe(delay(300));
    });
    spyOn(service, 'getVehicles').and.callFake(() => {
      return of([]).pipe(delay(300));
    });

    component.ngOnInit();
    tick(300);
    expect(component.originalPlanets).toEqual([]);
    expect(component.originalVehicles).toEqual([]);
  }));

  it('should call ngOnInit and call the Service methods with error', fakeAsync(() => {
    const error = { message : 'Error message' };
    const planetSpy = spyOn(service, 'getPlanets').and.returnValue(throwError(error));
    const vehicleSpy = spyOn(service, 'getVehicles').and.returnValue(throwError(error));


    component.ngOnInit();
    tick();
    expect(planetSpy).toHaveBeenCalled();
    expect(vehicleSpy).toHaveBeenCalled();
    expect(component.errorMessage).toEqual(error.message);
  }));

  it('should add and sub and set calculatedTime', () => {
    component.calculatedTime = 0;
    component.selectedVehicles.set(1, { name : 'Space pod', total_no: 2, max_distance : 200, speed : 2, planetName : 'Donlon' });

    component['calculateTime'](1, 'add');
    expect(component.calculatedTime).toEqual(50);
    component['calculateTime'](1, 'sub');
    expect(component.calculatedTime).toEqual(0);
  });

  it('should resetOldVehicleCount and call calculateTime and delete from selectedVehicles', () => {
    const spyCalculateTime = spyOn<any>(component, 'calculateTime');
    component.selectedVehicles.set(1, { name : 'Space pod', total_no: 2, max_distance : 200, speed : 2 });
    component.vehicles[0] = { name : 'Space pod', total_no: 1, max_distance : 200, speed : 2 };

    component['resetOldVehicleCount'](1);
    expect(component.vehicles[0].total_no).toEqual(2);
    expect(spyCalculateTime).toHaveBeenCalled();
    expect(component.selectedVehicles.size).toEqual(0);
  });

  it('should call resetVehicles', () => {
    const spyResetOldVehicleCount = spyOn<any>(component, 'resetOldVehicleCount');
    component.vehicles[0] = { name : 'Space pod', total_no: 0, max_distance : 200, speed : 2 };
    fixture.detectChanges();

    component['resetVehicles'](1, '');
    expect(spyResetOldVehicleCount).toHaveBeenCalled();
    component['resetVehicles'](1, 'Donlon');
    expect(spyResetOldVehicleCount).toHaveBeenCalled();
  });

  it('should call destinationChange', () => {
    const spyResetVehicles = spyOn<any>(component, 'resetVehicles');
    let event = { target: { value : 'Donlon' } };

    component['destinationChange'](event, 1);
    expect(spyResetVehicles).toHaveBeenCalled();

    event = { target: { value : '' } };

    component['destinationChange'](event, 1);
    expect(spyResetVehicles).toHaveBeenCalled();
  });

  it('should adds vehicle to the selected Vehicles List with updated count', () => {
    const spyVehicleCount = spyOn<any>(component, 'resetOldVehicleCount');
    const spyCalculateTime = spyOn<any>(component, 'calculateTime');
    const id = 1;
    component.selectedPlanets.set(id, 'Donlon');
    component.vehicles[0] = { name : 'Space pod', total_no: 2, max_distance : 200, speed : 2 };

    component['vehicleChange'](component.vehicles[0], id);
    expect(spyVehicleCount).toHaveBeenCalled();
    expect(component.selectedVehicles.get(id).planetName).toEqual('Donlon');
    expect(component.vehicles[0].total_no).toEqual(1);
    expect(spyCalculateTime).toHaveBeenCalled();
  });

  it('should call sendDataToResultPage, when token is returned it should navigate', fakeAsync(() => {
    const spyGetToken = spyOn(service, 'getToken').and.callFake(() => {
      return of({token : 'token'}).pipe(delay(300));
    });

    component.sendDataToResultPage();
    tick(300);
    expect(spyGetToken).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/result']);
  }));

  it('should call sendDataToResultPage, when token is not returned it should show error ', fakeAsync(() => {
    const error = { message : 'Error message' };
    const spyGetToken = spyOn(service, 'getToken').and.returnValue(throwError(error));

    component.sendDataToResultPage();
    tick();
    expect(spyGetToken).toHaveBeenCalled();
    expect(component.errorMessage).toEqual(error.message);
  }));
});
