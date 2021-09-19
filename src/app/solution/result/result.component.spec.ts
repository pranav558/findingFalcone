import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FindingFalconService } from 'src/app/services/finding-falcon.service';

import { ResultComponent } from './result.component';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

describe('ResultComponent', () => {
  let component: ResultComponent;
  let fixture: ComponentFixture<ResultComponent>;
  let service: FindingFalconService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [ FindingFalconService ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ResultComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(FindingFalconService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnInit and call the Service methods with response - success', fakeAsync(() => {
    const nextSpy = spyOn(service.getSelectedValues, 'subscribe');
    const finddingFalconeSpy = spyOn(service, 'findFalcone').and.callFake(() => {
      return of({
        planet_name: 'Donlon',
        status: 'success'
      }).pipe(delay(300));
    });

    expect(component.findSubscription).toBeUndefined();
    component.ngOnInit();
    service.setSelectedValues({test: 'test'});
    tick(300);
    expect(component.findSubscription).toBeDefined();
    expect(nextSpy).toHaveBeenCalled();
    expect(finddingFalconeSpy).toHaveBeenCalled();
    expect(component.message).toEqual('We found Falcone on Planet - Donlon');
  }));

  it('should call ngOnInit and call the Service methods with response - false', fakeAsync(() => {
    const nextSpy = spyOn(service.getSelectedValues, 'subscribe');
    const finddingFalconeSpy = spyOn(service, 'findFalcone').and.callFake(() => {
      return of({
        status: 'false'
      }).pipe(delay(300));
    });

    expect(component.findSubscription).toBeUndefined();
    component.ngOnInit();
    service.setSelectedValues({test: 'test'});
    tick(300);
    expect(component.findSubscription).toBeDefined();
    expect(nextSpy).toHaveBeenCalled();
    expect(finddingFalconeSpy).toHaveBeenCalled();
    expect(component.message).toEqual('Falcone was not found, please try again');
  }));

  it('should call ngOnInit and call the Service methods with response - error', fakeAsync(() => {
    const nextSpy = spyOn(service.getSelectedValues, 'subscribe');
    const finddingFalconeSpy = spyOn(service, 'findFalcone').and.callFake(() => {
      return of({
        error: 'Some Error'
      }).pipe(delay(300));
    });

    expect(component.findSubscription).toBeUndefined();
    component.ngOnInit();
    service.setSelectedValues({test: 'test'});
    tick(300);
    expect(component.findSubscription).toBeDefined();
    expect(nextSpy).toHaveBeenCalled();
    expect(finddingFalconeSpy).toHaveBeenCalled();
    expect(component.message).toEqual('Some Error');
  }));

  it('should call ngOnInit and call the Service methods with API error', fakeAsync(() => {
    const error = { message : 'Error message' };
    const nextSpy = spyOn(service.getSelectedValues, 'subscribe');
    const finddingFalconeSpy = spyOn(service, 'findFalcone').and.returnValue(throwError(error));

    expect(component.findSubscription).toBeUndefined();
    component.ngOnInit();
    service.setSelectedValues({test: 'test'});
    tick(300);
    expect(component.findSubscription).toBeDefined();
    expect(nextSpy).toHaveBeenCalled();
    expect(finddingFalconeSpy).toHaveBeenCalled();
    expect(component.message).toEqual('Error message');
  }));

});
