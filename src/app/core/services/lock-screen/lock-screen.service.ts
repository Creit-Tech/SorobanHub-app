import { Injectable } from '@angular/core';
import { LockScreenRepository } from '../../../state/lock-screen/lock-screen.repository';
import { setProps } from '@ngneat/elf';

@Injectable({
  providedIn: 'root',
})
export class LockScreenService {
  constructor(private readonly lockScreenRepository: LockScreenRepository) {}

  async unlock(password: string): Promise<void> {
    this.lockScreenRepository.store.update(setProps({ isUnLocked: true, password }));
  }
}
