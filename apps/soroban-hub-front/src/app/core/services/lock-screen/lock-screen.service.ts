import { Injectable } from '@angular/core';
import { LockScreenRepository } from '../../../state/lock-screen/lock-screen.repository';
import { setProp } from '@ngneat/elf';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LockScreenService {
  constructor(private readonly lockScreenRepository: LockScreenRepository) {}

  async unlock(password: string): Promise<void> {
    await window.ipcAPI.invoke({
      route: '/settings/set-password',
      msg: password,
    });

    this.lockScreenRepository.store.update(setProp('isUnLocked', true));
  }
}
