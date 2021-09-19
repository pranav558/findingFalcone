import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { FindingFalconService } from './finding-falcon.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

describe('FindingFalconService', () => {
  const server = environment.APIEndpoint;
  let service: FindingFalconService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(FindingFalconService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getPlanets', () => {
    const mockData = [
      { name : 'Donlon', distance : 100},
      { name : 'Enchai', distance : 200}
    ];

    service.getPlanets().subscribe((data: any) => {
      expect(data[1].name).toEqual('Enchai');
      expect(data[1].distance).toEqual(200);
    });

    const req = httpTestingController.expectOne(`${server}/planets`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockData);
  });

  it('should call getVehicles', () => {
    const mockData = [
      { name : 'Space pod', total_no: 2, max_distance : 200, speed : 2 },
      { name : 'Space rocket', total_no: 1, max_distance : 300, speed : 4 }
    ];

    service.getVehicles().subscribe((data: any) => {
      expect(data[0].name).toEqual('Space pod');
      expect(data[0].max_distance).toEqual(200);
    });

    const req = httpTestingController.expectOne(`${server}/vehicles`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockData);
  });

  it('should call getToken', () => {
    const mockData = { token: 'token' };
    service.getToken().subscribe((data: any) => {
      expect(data.token).toEqual('token');
    });

    const req = httpTestingController.expectOne(`${server}/token`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockData);
  });

  it('should call findFalcone', () => {
    const mockData = { planet_name : 'Donlon', status : 'success' };

    service.findFalcone({}).subscribe((data: any) => {
      expect(data.planet_name).toEqual('Donlon');
      expect(data.status).toEqual('success');
    });

    const req = httpTestingController.expectOne(`${server}/find`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockData);
  });

  it('should call getPlanets - error', () => {
    const msg = 'Some Error'
    const mockError = new ErrorEvent('Network error', {
      message: msg,
    });

    service.getPlanets().subscribe(
      (data: any) => fail('should have failed with some error'),
      (error: HttpErrorResponse) => {
        expect(error.error.message).toEqual(msg, 'message');
      }
    );

    const req = httpTestingController.expectOne(`${server}/planets`);
    expect(req.request.method).toEqual('GET');
    req.error(mockError);
  });
});
