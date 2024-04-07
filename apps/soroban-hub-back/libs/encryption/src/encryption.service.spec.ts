import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService, EncryptResponse } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptionService],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash a password', () => {
    const password: string = 'wH^s5PvEZbt&RtiCZdD&';
    const salt: string = 'yMzPa#asC44LzH3VeR9p';
    const hash: string = service.hashText(password, salt);
    expect(hash).toEqual('4OxWsnSlEQmfe2uaQNYYGG3CaobwiY0rHPbcGSkxD9s=');
  });

  it('should encrypt and decrypt a message', () => {
    const message: string = 'This is going to be encrypted';
    const encryptionKey: string = '4OxWsnSlEQmfe2uaQNYYGG3CaobwiY0rHPbcGSkxD9s=';
    service.setEncryptionKey(encryptionKey);
    const response: EncryptResponse = service.encryptMessage({ message });
    const decrypted: string = service.decryptMessage(response);
    expect(decrypted).toEqual(message);
  });
});
