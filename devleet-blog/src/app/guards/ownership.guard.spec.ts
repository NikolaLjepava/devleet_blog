import { TestBed } from '@angular/core/testing';

import { OwnershipGuard } from './ownership.guard';

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(OwnershipGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
