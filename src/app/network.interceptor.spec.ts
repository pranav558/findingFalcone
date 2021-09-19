import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment.prod';

import { NetworkInterceptor } from './network.interceptor';
import { FindingFalconService } from './services/finding-falcon.service';
import { LoaderService } from './services/loader.service';

describe('NetworkInterceptor', () => {
  const server = environment.APIEndpoint;
  let service: FindingFalconService;
  let loader: LoaderService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        NetworkInterceptor,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: NetworkInterceptor,
          multi: true,
        },
        LoaderService,
        FindingFalconService
      ]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(FindingFalconService);
    loader = TestBed.inject(LoaderService);
  });

  it('should be created', () => {
    const interceptor: NetworkInterceptor = TestBed.inject(NetworkInterceptor);
    expect(interceptor).toBeTruthy();
  });

  it('should call interceptor', () => {
    const interceptor: NetworkInterceptor = TestBed.inject(NetworkInterceptor);
    expect(interceptor instanceof NetworkInterceptor).toBeTruthy();

    service.getPlanets().subscribe((data: any) => {
      loader.isLoading.next(false);
      expect(loader.isLoading.value).toBeFalsy();
    });

    loader.isLoading.next(true);
    const req = httpTestingController.expectOne(`${server}/planets`);
    expect(loader.isLoading.value).toBeTruthy();
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.get('content-type')).toEqual('application/json');
    req.flush([]);
    httpTestingController.verify();
  });
});
