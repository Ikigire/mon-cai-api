import { Test, TestingModule } from '@nestjs/testing';
import { DisUsuarioService } from './dis-usuario.service';

describe('DisUsuarioService', () => {
  let service: DisUsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisUsuarioService],
    }).compile();

    service = module.get<DisUsuarioService>(DisUsuarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
