import { TestBed } from '@angular/core/testing';

import { ProjectsServiceService } from './projects-service.service';

describe('ProjectsServiceService', () => {
  let service: ProjectsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
